import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';
import { SupabaseService } from '../common/supabase.service.js';
import { generateCertificatePdfBuffer } from './certificate-pdf.generator.js';
import { CertificatePdfStorageService } from './certificate-pdf-storage.service.js';
import { observePdfGeneration, recordCertificateIssued } from './certificate.metrics.js';
import type { CertificateDto, VerifyResponseDto } from './certificate.dto.js';

type CertificateRow = {
  id: string;
  user_id: string;
  course_id: string;
  full_name: string;
  issued_at: string;
  verification_hash: string;
  pdf_storage_path: string | null;
  revoked_at: string | null;
};

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly pdfStorage: CertificatePdfStorageService,
  ) {}

  // ── Issue certificate ──────────────────────────────────────────────────────

  async issueCertificate(userId: string, attemptId: string): Promise<CertificateDto> {
    const { data: attempt, error: attErr } = await this.supabase.admin
      .from('attempts')
      .select('id, user_id, passed, score, submitted_at, assessment_id')
      .eq('id', attemptId)
      .single();

    if (attErr || !attempt) throw new NotFoundException('Attempt not found');
    if (attempt.user_id !== userId) throw new BadRequestException('Not your attempt');
    if (!attempt.passed) throw new BadRequestException('Attempt was not passed');

    const { data: assessment } = await this.supabase.admin
      .from('assessments')
      .select('assessment_type, course_id')
      .eq('id', attempt.assessment_id)
      .single();

    if (!assessment || assessment.assessment_type !== 'prova_final') {
      throw new BadRequestException('Certificate only available for Prova Final');
    }

    const { data: existing } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('attempt_id', attemptId)
      .single();

    if (existing) {
      const row = existing as CertificateRow;
      await this.ensurePdfForCertificate(row);
      const refreshed = await this.getCertificateRow(row.id);
      return this.mapCertificate(refreshed ?? row);
    }

    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('full_name, display_name')
      .eq('id', userId)
      .single();

    const fullName = profile?.full_name || profile?.display_name || 'Trader';

    const salt = randomBytes(16).toString('hex');
    const verificationHash = createHash('sha256')
      .update(`${userId}:${attemptId}:${salt}`)
      .digest('hex');

    const { data: cert, error: certErr } = await this.supabase.admin
      .from('certificates')
      .insert({
        user_id: userId,
        attempt_id: attemptId,
        course_id: assessment.course_id,
        full_name: fullName,
        verification_hash: verificationHash,
      })
      .select()
      .single();

    if (certErr || !cert) {
      this.logger.error('Failed to create certificate', certErr);
      throw new BadRequestException('Failed to issue certificate');
    }

    this.logger.log(`Certificate issued: ${cert.id} for user ${userId}`);
    recordCertificateIssued();

    const row = cert as CertificateRow;
    await this.ensurePdfForCertificate(row);
    const refreshed = await this.getCertificateRow(row.id);
    return this.mapCertificate(refreshed ?? row);
  }

  // ── List user certificates ─────────────────────────────────────────────────

  async getUserCertificates(userId: string): Promise<CertificateDto[]> {
    const { data, error } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('issued_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to list certificates', error);
      return [];
    }

    const rows = (data ?? []) as CertificateRow[];
    for (const row of rows) {
      if (!row.pdf_storage_path) {
        await this.ensurePdfForCertificate(row);
      }
    }

    const refreshed: CertificateRow[] = [];
    for (const row of rows) {
      const latest = row.pdf_storage_path ? row : ((await this.getCertificateRow(row.id)) ?? row);
      refreshed.push(latest);
    }

    return refreshed.map((row) => this.mapCertificate(row));
  }

  // ── Download PDF (auth) ────────────────────────────────────────────────────

  async getPdfDownload(
    userId: string,
    certificateId: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    let row = await this.getCertificateForUser(userId, certificateId);
    if (!row.pdf_storage_path) {
      await this.ensurePdfForCertificate(row);
      row = (await this.getCertificateRow(row.id)) ?? row;
    }
    const buffer = await this.buildPdfBuffer(row);
    const fileName = `certificado-coast-academy-${row.verification_hash.slice(0, 12)}.pdf`;
    return { buffer, fileName };
  }

  /** Prévia PDF (dev): não grava certificado no banco, mas envia PDF ao bucket para testes. */
  async getPreviewPdfDownload(
    userId: string,
  ): Promise<{ buffer: Buffer; fileName: string; storageUrl: string | null }> {
    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('full_name, display_name')
      .eq('id', userId)
      .single();

    const fullName = profile?.full_name || profile?.display_name || 'Trader';
    const courseId =
      process.env['CERTIFICATE_PREVIEW_COURSE_ID'] ?? 'c0000000-0000-0000-0000-000000000001';

    const previewRow: CertificateRow = {
      id: 'preview',
      user_id: userId,
      course_id: courseId,
      full_name: fullName,
      issued_at: new Date().toISOString(),
      verification_hash: `preview-${createHash('sha256').update(userId).digest('hex').slice(0, 40)}`,
      pdf_storage_path: null,
      revoked_at: null,
    };

    const buffer = await this.buildPdfBuffer(previewRow);
    const storagePath = await this.pdfStorage.uploadPdf(previewRow.verification_hash, buffer);
    const storageUrl = storagePath ? this.pdfStorage.resolvePublicUrl(storagePath) : null;

    if (storageUrl) {
      this.logger.log(`Preview PDF saved to storage: ${storageUrl}`);
    } else {
      this.logger.warn(
        `Preview PDF download ok but storage upload failed (hash=${previewRow.verification_hash})`,
      );
    }

    return { buffer, fileName: 'certificado-coast-academy-preview.pdf', storageUrl };
  }

  // ── Public verify ──────────────────────────────────────────────────────────

  async verifyCertificate(hash: string): Promise<VerifyResponseDto> {
    const { data, error } = await this.supabase.admin.rpc('verify_certificate', {
      p_hash: hash,
    });

    if (error || !data || data.length === 0) {
      throw new NotFoundException('Certificate not found');
    }

    const row = data[0] as {
      full_name: string;
      course_title: string;
      issued_at: string;
      is_valid: boolean;
    };

    return {
      fullName: row.full_name,
      courseTitle: row.course_title,
      issuedAt: row.issued_at,
      isValid: row.is_valid,
    };
  }

  // ── PDF generation & storage ───────────────────────────────────────────────

  private async ensurePdfForCertificate(row: CertificateRow): Promise<void> {
    if (row.pdf_storage_path) return;

    try {
      const buffer = await this.buildPdfBuffer(row);
      const storagePath = await this.pdfStorage.uploadPdf(row.verification_hash, buffer);

      if (!storagePath) {
        this.logger.error(
          `PDF upload failed for certificate ${row.id} — verifique bucket "certificates" e SUPABASE_URL/SERVICE_ROLE_KEY`,
        );
        return;
      }

      const { error: updateErr } = await this.supabase.admin
        .from('certificates')
        .update({ pdf_storage_path: storagePath })
        .eq('id', row.id);

      if (updateErr) {
        this.logger.warn(`Failed to save pdf_storage_path for ${row.id}`, updateErr);
      } else {
        this.logger.log(`PDF stored: ${storagePath}`);
      }
    } catch (err) {
      this.logger.error(`PDF generation failed for ${row.id}`, err);
    }
  }

  private async buildPdfBuffer(row: CertificateRow): Promise<Buffer> {
    return observePdfGeneration(async () => {
      const courseTitle = await this.getCourseTitle(row.course_id);
      const verifyUrl = this.buildVerifyUrl(row.verification_hash);
      const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
        type: 'png',
        width: 256,
        margin: 1,
        errorCorrectionLevel: 'M',
      });

      return generateCertificatePdfBuffer({
        fullName: row.full_name,
        courseTitle,
        issuedAt: row.issued_at,
        verificationHash: row.verification_hash,
        verifyUrl,
        issuerName: process.env['CERTIFICATE_ISSUER_NAME'] ?? 'Coast Academy',
        qrPngBuffer,
      });
    });
  }

  private async getCourseTitle(courseId: string): Promise<string> {
    const { data } = await this.supabase.admin
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    return data?.title ?? 'Coast Academy';
  }

  private buildVerifyUrl(hash: string): string {
    const base =
      process.env['CERTIFICATE_PUBLIC_VERIFY_BASE_URL'] ??
      process.env['PUBLIC_BASE_URL'] ??
      'http://localhost/verify';
    const trimmed = base.replace(/\/$/, '');
    if (trimmed.endsWith('/verify')) {
      return `${trimmed}/${hash}`;
    }
    return `${trimmed}/verify/${hash}`;
  }

  private async getCertificateRow(id: string): Promise<CertificateRow | null> {
    const { data } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();
    return (data as CertificateRow | null) ?? null;
  }

  private async getCertificateForUser(
    userId: string,
    certificateId: string,
  ): Promise<CertificateRow> {
    const { data, error } = await this.supabase.admin
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (error || !data) throw new NotFoundException('Certificate not found');
    const row = data as CertificateRow;
    if (row.user_id !== userId) throw new BadRequestException('Not your certificate');
    if (row.revoked_at) throw new BadRequestException('Certificate revoked');
    return row;
  }

  private mapCertificate(row: CertificateRow): CertificateDto {
    const pdfUrl = this.pdfStorage.resolvePublicUrl(row.pdf_storage_path);

    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      fullName: row.full_name,
      issuedAt: row.issued_at,
      verificationHash: row.verification_hash,
      pdfUrl,
      isRevoked: row.revoked_at !== null,
    };
  }
}
