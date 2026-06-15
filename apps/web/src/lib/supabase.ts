import { createClient } from '@supabase/supabase-js';

import { isLocalDevHost } from '@/lib/local-dev.js';

const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

function resolveSupabaseUrl(): string {
  const configured = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;

  // Docker + Traefik: auth/REST via proxy no mesmo origin (/auth/v1, /rest/v1)
  if (typeof window !== 'undefined' && isLocalDevHost()) {
    return window.location.origin;
  }

  if (!configured) {
    throw new Error(
      '[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas em .env.local',
    );
  }

  return configured;
}

if (!supabaseAnonKey) {
  throw new Error(
    '[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas em .env.local',
  );
}

export const supabase = createClient(resolveSupabaseUrl(), supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Registra um evento de autenticacao no audit_log via RPC server-side.
 * Silencia erros para nao bloquear o fluxo de login.
 */
export async function logAuthEvent(
  action: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.rpc('log_auth_event', {
      p_action: action,
      p_metadata: metadata,
    });
  } catch {
    // Nao bloqueia o usuario; auditoria e best-effort no client.
  }
}
