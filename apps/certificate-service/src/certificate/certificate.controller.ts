import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../common/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import { isSentryTestRouteEnabled } from '../sentry.js';
import { CertificateService } from './certificate.service.js';
import type { IssueCertificateDto } from './certificate.dto.js';

interface CurrentUserPayload {
  userId: string;
  userEmail: string;
}

@Controller()
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /** POST /api/certificates/issue — issue certificate for a passed attempt */
  @Post('issue')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async issue(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: IssueCertificateDto,
  ) {
    return this.certificateService.issueCertificate(user.userId, dto.attemptId);
  }

  /** GET /api/certificates/debug/sentry-test — OBS-T10 (dev / SENTRY_TEST=true) */
  @Get('debug/sentry-test')
  sentryTest(): never {
    if (!isSentryTestRouteEnabled()) {
      throw new NotFoundException();
    }
    throw new Error('OBS-T10 Sentry test — certificate-service');
  }

  /** GET /api/certificates/me — list my certificates */
  @Get('me')
  @UseGuards(AuthGuard)
  async listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.certificateService.getUserCertificates(user.userId);
  }

  /** GET /api/certificates/preview-pdf — prévia PDF (dev; grava no bucket, não no banco) */
  @Get('preview-pdf')
  @UseGuards(AuthGuard)
  async previewPdf(
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ): Promise<void> {
    if (!CertificateController.isDevPreviewEnabled()) {
      throw new ForbiddenException('Preview PDF is only available in development');
    }
    const { buffer, fileName, storageUrl } = await this.certificateService.getPreviewPdfDownload(
      user.userId,
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(buffer.length),
    };
    if (storageUrl) {
      headers['X-Storage-Url'] = storageUrl;
    }
    res.set(headers);
    res.send(buffer);
  }

  /** GET /api/certificates/:id/pdf — download PDF (gera sob demanda se necessário) */
  @Get(':id/pdf')
  @UseGuards(AuthGuard)
  async downloadPdf(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.certificateService.getPdfDownload(user.userId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, max-age=3600',
    });
    res.send(buffer);
  }

  /** GET /verify/:hash — public verification (no auth) */
  @Get('/verify/:hash')
  async verify(@Param('hash') hash: string) {
    return this.certificateService.verifyCertificate(hash);
  }

  private static isDevPreviewEnabled(): boolean {
    if (process.env['CERTIFICATE_DEV_PREVIEW'] === 'false') return false;
    // Docker local usa NODE_ENV=production — .env.local deve ter CERTIFICATE_DEV_PREVIEW=true
    return process.env['CERTIFICATE_DEV_PREVIEW'] !== 'false';
  }
}
