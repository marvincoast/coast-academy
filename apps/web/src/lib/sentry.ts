import * as Sentry from '@sentry/react';

const dsn = (import.meta.env['VITE_SENTRY_DSN'] as string | undefined)?.trim();

/** Inicializa Sentry no browser quando VITE_SENTRY_DSN está definido (OBS-T10). */
export function initSentry(): void {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export function isSentryEnabled(): boolean {
  return Boolean(dsn);
}

/** Erro controlado para validar pipeline Sentry (dev / painel local). */
export function captureSentryTestError(): void {
  if (!dsn) return;
  Sentry.captureException(new Error('OBS-T10 Sentry test — web'));
}

export { Sentry };
