import { withSpan } from '@coast-academy/observability';
import { Injectable, Logger } from '@nestjs/common';

import { recordPdfUploadFailure } from './certificate.metrics.js';

import { Client, ID, Storage } from 'node-appwrite';

import { SupabaseService } from '../common/supabase.service.js';

/* eslint-disable @typescript-eslint/no-require-imports -- subpath ESM; CJS require no build Nest */

const { InputFile } = require('node-appwrite/file') as {
  InputFile: {
    fromBuffer: (buffer: Buffer, filename: string, mimeType?: string) => unknown;
  };
};

const DEFAULT_SUPABASE_CERT_BUCKET = 'certificates';

const APPWRITE_PATH_PREFIX = 'appwrite:';

const PDF_SIZE_LIMIT = 5_242_880;

export type CertificateStorageProvider = 'supabase' | 'appwrite';

@Injectable()
export class CertificatePdfStorageService {
  private readonly logger = new Logger(CertificatePdfStorageService.name);

  private readonly provider: CertificateStorageProvider;

  private readonly supabaseBucketId: string;

  private appwriteStorage: Storage | null = null;

  private appwriteBucketId: string | null = null;

  constructor(private readonly supabase: SupabaseService) {
    let provider = this.resolveProvider();

    if (provider === 'appwrite') {
      try {
        this.initAppwrite();
      } catch (err) {
        this.logger.error(
          `Appwrite indisponível (${err instanceof Error ? err.message : err}) — usando Supabase`,
        );

        provider = 'supabase';
      }
    }

    this.provider = provider;

    this.supabaseBucketId = this.resolveSupabaseBucketId();

    this.logger.log(
      `Certificate PDF storage: ${this.provider}` +
        (this.provider === 'supabase' ? ` (bucket=${this.supabaseBucketId})` : ''),
    );
  }

  async uploadPdf(verificationHash: string, buffer: Buffer): Promise<string | null> {
    return withSpan('certificate-pdf-storage', 'storage.upload', async (span) => {
      span.setAttribute('storage.provider', this.provider);
      span.setAttribute('pdf.bytes', buffer.length);
      span.setAttribute('certificate.hash_prefix', verificationHash.slice(0, 8));

      if (this.provider === 'appwrite') {
        return this.uploadToAppwrite(verificationHash, buffer);
      }

      await this.ensureSupabaseBucket();
      return this.uploadToSupabase(verificationHash, buffer);
    });
  }

  /** Bucket ativo para labels de métricas (OBS-T13). */
  getActiveBucketLabel(): string {
    if (this.provider === 'appwrite') {
      return this.appwriteBucketId ?? 'appwrite';
    }
    return this.supabaseBucketId;
  }

  resolvePublicUrl(pdfStoragePath: string | null): string | null {
    if (!pdfStoragePath) return null;

    if (pdfStoragePath.startsWith(APPWRITE_PATH_PREFIX)) {
      return this.appwritePublicUrl(pdfStoragePath);
    }

    const base = this.getSupabasePublicBase();

    return `${base}/storage/v1/object/public/${pdfStoragePath}`;
  }

  private resolveSupabaseBucketId(): string {
    const fromEnv = process.env['SUPABASE_CERT_BUCKET_ID']?.trim();

    return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_SUPABASE_CERT_BUCKET;
  }

  private hasAppwriteCredentials(): boolean {
    return Boolean(
      process.env['APPWRITE_ENDPOINT']?.trim() &&
      process.env['APPWRITE_PROJECT_ID']?.trim() &&
      process.env['APPWRITE_API_KEY']?.trim(),
    );
  }

  private resolveProvider(): CertificateStorageProvider {
    const explicit = process.env['CERTIFICATE_STORAGE_PROVIDER']?.toLowerCase();

    if (explicit === 'appwrite') {
      if (this.hasAppwriteCredentials()) return 'appwrite';

      this.logger.warn('CERTIFICATE_STORAGE_PROVIDER=appwrite mas credenciais vazias — Supabase');

      return 'supabase';
    }

    if (explicit === 'supabase') return 'supabase';

    if (this.hasAppwriteCredentials()) return 'appwrite';

    return 'supabase';
  }

  private initAppwrite(): void {
    const endpoint = process.env['APPWRITE_ENDPOINT'];

    const projectId = process.env['APPWRITE_PROJECT_ID'];

    const apiKey = process.env['APPWRITE_API_KEY'];

    if (!endpoint || !projectId || !apiKey) {
      throw new Error(
        'Appwrite storage selected but APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID or APPWRITE_API_KEY is missing',
      );
    }

    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

    this.appwriteStorage = new Storage(client);

    this.appwriteBucketId = process.env['APPWRITE_CERT_BUCKET_ID'] ?? 'S3cert';
  }

  private async uploadToAppwrite(verificationHash: string, buffer: Buffer): Promise<string | null> {
    if (!this.appwriteStorage || !this.appwriteBucketId) return null;

    const fileName = `${verificationHash.slice(0, 16)}.pdf`;

    const inputFile = InputFile.fromBuffer(buffer, fileName, 'application/pdf');

    try {
      const file = await this.appwriteStorage.createFile(
        this.appwriteBucketId,

        ID.unique(),

        inputFile as Parameters<Storage['createFile']>[2],
      );

      const storagePath = `${APPWRITE_PATH_PREFIX}${this.appwriteBucketId}:${file.$id}`;

      this.logger.log(`PDF uploaded to Appwrite bucket ${this.appwriteBucketId}: ${file.$id}`);

      return storagePath;
    } catch (err) {
      this.logger.warn(`Appwrite upload failed: ${err instanceof Error ? err.message : err}`);

      recordPdfUploadFailure(this.appwriteBucketId ?? 'appwrite');

      return null;
    }
  }

  private bucketOptions() {
    return {
      public: true,

      fileSizeLimit: PDF_SIZE_LIMIT,

      allowedMimeTypes: ['application/pdf'],
    };
  }

  private async ensureSupabaseBucket(): Promise<void> {
    const bucketId = this.supabaseBucketId;

    const { data: buckets, error: listErr } = await this.supabase.admin.storage.listBuckets();

    if (listErr) {
      this.logger.error(
        `Supabase listBuckets failed (${listErr.message}) — confira SUPABASE_URL e rede supabase (connect-supabase-network.sh)`,
      );

      return;
    }

    const existing = buckets?.find((b) => b.id === bucketId || b.name === bucketId);

    if (existing) {
      const { error: updateErr } = await this.supabase.admin.storage.updateBucket(
        bucketId,

        this.bucketOptions(),
      );

      if (updateErr) {
        this.logger.warn(`Supabase updateBucket(${bucketId}): ${updateErr.message}`);
      } else {
        this.logger.debug(`Supabase bucket "${bucketId}" configurado (público, 5MB, PDF)`);
      }

      return;
    }

    const { error: createErr } = await this.supabase.admin.storage.createBucket(
      bucketId,

      this.bucketOptions(),
    );

    if (createErr && !/already exists|duplicate/i.test(createErr.message)) {
      this.logger.error(`Supabase createBucket(${bucketId}) failed: ${createErr.message}`);

      return;
    }

    this.logger.log(`Supabase bucket "${bucketId}" criado`);
  }

  private async uploadToSupabase(verificationHash: string, buffer: Buffer): Promise<string | null> {
    const bucketId = this.supabaseBucketId;

    const objectPath = `${verificationHash}.pdf`;

    const storagePath = `${bucketId}/${objectPath}`;

    const { error } = await this.supabase.admin.storage.from(bucketId).upload(objectPath, buffer, {
      contentType: 'application/pdf',

      upsert: true,

      cacheControl: '3600',
    });

    if (error) {
      this.logger.error(
        `Supabase upload failed [bucket=${bucketId}]: ${error.message} — path=${objectPath} size=${buffer.length}`,
      );

      recordPdfUploadFailure(bucketId);

      return null;
    }

    const publicUrl = this.resolvePublicUrl(storagePath);

    this.logger.log(
      `PDF uploaded to Supabase: ${storagePath} → ${publicUrl ?? '(sem URL pública)'}`,
    );

    return storagePath;
  }

  private appwritePublicUrl(storagePath: string): string | null {
    const payload = storagePath.slice(APPWRITE_PATH_PREFIX.length);

    const colon = payload.indexOf(':');

    if (colon <= 0) return null;

    const bucketId = payload.slice(0, colon);

    const fileId = payload.slice(colon + 1);

    const endpoint = process.env['APPWRITE_ENDPOINT']?.replace(/\/$/, '');

    const projectId = process.env['APPWRITE_PROJECT_ID'];

    if (!endpoint || !projectId) return null;

    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  }

  private getSupabasePublicBase(): string {
    const url =
      process.env['SUPABASE_PUBLIC_URL'] ??
      process.env['VITE_SUPABASE_URL'] ??
      process.env['SUPABASE_URL'] ??
      'http://127.0.0.1:54321';

    return url.replace(/\/$/, '');
  }
}
