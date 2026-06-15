import * as Sentry from '@sentry/nestjs';

export function hasSentryDsn(): boolean {
  return Boolean(process.env['SENTRY_DSN']?.trim());
}

/** Inicializa Sentry antes do Nest bootstrap (OBS-T10). No-op sem SENTRY_DSN. */
export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN']?.trim();
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    release: process.env['SERVICE_NAME'] ?? 'certificate-service',
  });
}

/** Ativa por padrao; desligue com SENTRY_TEST=false em prod. */
export function isSentryTestRouteEnabled(): boolean {
  const raw = process.env['SENTRY_TEST']
    ?.trim()
    .replace(/\r/g, '')
    .replace(/^["']|["']$/g, '')
    .toLowerCase();
  return raw !== 'false' && raw !== '0' && raw !== 'no';
}
