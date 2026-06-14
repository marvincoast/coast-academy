import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { FullPageSpinner } from '@/components/ui/Spinner.js';
import { supabase } from '@/lib/supabase.js';

type CallbackState = 'processing' | 'error';

/**
 * Pagina de callback do magic link do Supabase Auth.
 * O Supabase detecta o token na URL via `detectSessionInUrl: true` no cliente.
 * Aqui apenas aguardamos a sessao ser estabelecida e redirecionamos.
 */
export default function AuthCallbackPage(): JSX.Element {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('processing');

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setState('error');
        return;
      }

      // Sessao valida — redirecionar ao dashboard (ou rota original)
      navigate('/dashboard', { replace: true });
    };

    void handleCallback();
  }, [navigate]);

  if (state === 'processing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base">
        <FullPageSpinner />
        <p className="text-sm text-white/50">{t('callback.processing')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-base px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-state-danger/15">
        <AlertCircle size={28} className="text-state-danger" />
      </div>
      <div>
        <p className="font-semibold text-white">{t('callback.error')}</p>
      </div>
      <Link
        to="/"
        className="text-sm text-brand-gold underline hover:text-brand-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"
      >
        {t('callback.backToLogin')}
      </Link>
    </div>
  );
}
