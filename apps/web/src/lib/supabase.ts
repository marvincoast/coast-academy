import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas em .env.local',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
