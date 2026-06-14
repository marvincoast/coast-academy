import { useEffect } from 'react';

import { logAuthEvent, supabase } from '@/lib/supabase.js';
import { useAuthStore } from '@/stores/auth.store.js';

/**
 * Inicializa o listener de autenticacao do Supabase.
 * Deve ser montado uma vez no topo da arvore (dentro de AuthProvider).
 */
export function useAuthListener(): void {
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Sessao inicial
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Mudancas subsequentes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN') {
        void logAuthEvent('auth.login', { provider: session?.user.app_metadata['provider'] });
      }
      if (event === 'SIGNED_OUT') {
        void logAuthEvent('auth.logout', {});
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession]);
}

/**
 * Retorna o estado de autenticacao atual.
 */
export function useAuth() {
  return useAuthStore((s) => ({
    status: s.status,
    session: s.session,
    user: s.user,
  }));
}
