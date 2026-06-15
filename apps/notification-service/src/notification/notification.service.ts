import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import type {
  SendCertificateEmailDto,
  SendWelcomeEmailDto,
  EmailResultDto,
} from './notification.dto.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resend: Resend | null;
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;
  private readonly baseUrl: string;

  constructor() {
    const apiKey = process.env['RESEND_API_KEY'];
    this.fromAddress = process.env['EMAIL_FROM'] ?? 'Coast Academy <noreply@coast-academy.com>';
    this.baseUrl = process.env['PUBLIC_BASE_URL'] ?? 'http://localhost';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend client initialized');
    } else {
      this.resend = null;
      this.logger.warn('RESEND_API_KEY not set — falling back to local SMTP');
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env['SMTP_HOST'] ?? 'host.docker.internal',
          port: parseInt(process.env['SMTP_PORT'] ?? '54325', 10),
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        });
        this.logger.log('Local SMTP transporter initialized (Mailpit/Inbucket)');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error('Failed to initialize local SMTP fallback', msg);
      }
    }
  }

  // ── Certificate issued email ───────────────────────────────────────────────

  async sendCertificateEmail(dto: SendCertificateEmailDto): Promise<EmailResultDto> {
    const verifyUrl = `${this.baseUrl}/verify/${dto.verificationHash}`;
    const issuedDate = new Date(dto.issuedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const html = this.buildCertificateHtml({
      fullName: dto.fullName,
      courseTitle: dto.courseTitle,
      issuedDate,
      verifyUrl,
    });

    return this.send({
      to: dto.to,
      subject: `🏆 Certificado Coast Academy — ${dto.fullName}`,
      html,
    });
  }

  // ── Welcome email ──────────────────────────────────────────────────────────

  async sendWelcomeEmail(dto: SendWelcomeEmailDto): Promise<EmailResultDto> {
    const html = this.buildWelcomeHtml(dto.fullName);

    return this.send({
      to: dto.to,
      subject: 'Bem-vindo(a) ao Coast Academy',
      html,
    });
  }

  // ── Internal send ──────────────────────────────────────────────────────────

  private async send(opts: { to: string; subject: string; html: string }): Promise<EmailResultDto> {
    if (!this.resend) {
      if (this.transporter) {
        this.logger.log(`Sending email to ${opts.to} via local SMTP: ${opts.subject}`);
        try {
          const info = await this.transporter.sendMail({
            from: this.fromAddress,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
          });
          return { success: true, messageId: info.messageId };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown SMTP error';
          this.logger.error(`Failed to send email to ${opts.to} via local SMTP`, message);
          return { success: false, error: message };
        }
      }
      this.logger.log(`[DRY-RUN] Would send email to ${opts.to}: ${opts.subject}`);
      return { success: true, messageId: 'dry-run' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${opts.to}`, error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Exception sending email`, message);
      return { success: false, error: message };
    }
  }

  // ── HTML templates ─────────────────────────────────────────────────────────

  private buildCertificateHtml(opts: {
    fullName: string;
    courseTitle: string;
    issuedDate: string;
    verifyUrl: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Certificado Coast Academy</title></head>
<body style="margin:0;padding:0;background:#0B0F14;font-family:Inter,sans-serif;color:#E5E7EB;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;border:1px solid #1F2937;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#92400E,#D97706);padding:32px;text-align:center;">
              <span style="font-size:28px;font-weight:700;color:#FFF;">CA</span>
              <p style="margin:8px 0 0;color:#FEF3C7;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Coast Academy</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#9CA3AF;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Certificado de Conclusão</p>
              <h1 style="margin:0 0 24px;color:#F9FAFB;font-size:24px;">${opts.fullName}</h1>
              <p style="margin:0 0 8px;color:#D1D5DB;">concluiu com aprovação o curso</p>
              <p style="margin:0 0 24px;color:#D97706;font-size:18px;font-weight:600;">${opts.courseTitle}</p>
              <p style="margin:0 0 32px;color:#6B7280;font-size:13px;">Emitido em ${opts.issuedDate}</p>
              <a href="${opts.verifyUrl}"
                 style="display:inline-block;background:#D97706;color:#0B0F14;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
                Verificar Autenticidade
              </a>
              <p style="margin:24px 0 0;color:#4B5563;font-size:12px;">
                Ou acesse: <a href="${opts.verifyUrl}" style="color:#9CA3AF;">${opts.verifyUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #1F2937;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#4B5563;font-size:12px;">© Coast Academy — Tape Reading &amp; Análise de Fluxo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildWelcomeHtml(fullName: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Bem-vindo ao Coast Academy</title></head>
<body style="margin:0;padding:0;background:#0B0F14;font-family:Inter,sans-serif;color:#E5E7EB;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;border:1px solid #1F2937;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#92400E,#D97706);padding:32px;text-align:center;">
              <span style="font-size:28px;font-weight:700;color:#FFF;">CA</span>
              <p style="margin:8px 0 0;color:#FEF3C7;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Coast Academy</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <h1 style="margin:0 0 16px;color:#F9FAFB;font-size:22px;">Bem-vindo(a), ${fullName}!</h1>
              <p style="margin:0 0 24px;color:#D1D5DB;line-height:1.6;">
                Sua jornada no tape reading e na análise de fluxo do dólar BRL começa agora.<br>
                Acesse a plataforma e inicie o primeiro módulo.
              </p>
              <a href="${this.baseUrl}/curso"
                 style="display:inline-block;background:#D97706;color:#0B0F14;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
                Iniciar o Curso
              </a>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #1F2937;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#4B5563;font-size:12px;">© Coast Academy</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
