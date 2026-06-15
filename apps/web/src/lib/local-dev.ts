/** Ambiente local (runtime) — não depende só de VITE_* no build Docker. */
export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === 'coastacademy';
}

/** Inbucket do Supabase local (documentado como Mailpit no runbook). */
export const LOCAL_MAIL_INBOX_URL = 'http://localhost:54324';

export function isLocalMailInboxEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEV_LOCAL_LINKS === 'true' || isLocalDevHost();
}

export function isCertDevToolsEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEV_LOCAL_LINKS === 'true' || isLocalDevHost();
}
