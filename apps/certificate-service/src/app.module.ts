import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ObservabilityModule } from '@coast-academy/observability';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

import { CertificateModule } from './certificate/certificate.module.js';
import { HealthController } from './health.controller.js';
import { hasSentryDsn } from './sentry.js';

const sentryImports = hasSentryDsn() ? [SentryModule.forRoot()] : [];
const sentryProviders = hasSentryDsn()
  ? [{ provide: APP_FILTER, useClass: SentryGlobalFilter }]
  : [];

@Module({
  imports: [...sentryImports, ObservabilityModule, CertificateModule],
  controllers: [HealthController],
  providers: [...sentryProviders],
})
export class AppModule {}
