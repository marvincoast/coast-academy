import { CheckCircle, ExternalLink, Mail, TrendingUp, Shield, BarChart2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';

import { LoginVideoBackground } from '@/components/auth/LoginVideoBackground.js';
import { DevLocalLinksPanel } from '@/components/dev/DevLocalLinksPanel.js';
import { LiveOrderFlowTape } from '@/components/market/LiveOrderFlowTape.js';
import { LivePriceGrid } from '@/components/market/LivePriceGrid.js';
import { MarketTicker } from '@/components/market/MarketTicker.js';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Logo } from '@/components/ui/Logo.js';
import { useAuth } from '@/hooks/use-auth.js';
import { appOriginPath } from '@/lib/base-path.js';
import { isLocalMailInboxEnabled, LOCAL_MAIL_INBOX_URL } from '@/lib/local-dev.js';
import { MOCK_TICKER_ITEMS } from '@/lib/mock-market-data.js';
import { supabase } from '@/lib/supabase.js';

const EmailSchema = z.string().email();
type LoginState = 'idle' | 'submitting' | 'success' | 'error';

export default function LoginPage(): JSX.Element {
  const { t } = useTranslation('auth');
  const { status } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setEmailError('');
    setErrorMessage('');

    const parsed = EmailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setEmailError(t('login.errorInvalidEmail'));
      return;
    }

    setLoginState('submitting');
    const redirectUrl = appOriginPath('/auth/callback');
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      setLoginState('error');
      const isRateLimit =
        error.status === 429 ||
        error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('security purposes');
      setErrorMessage(isRateLimit ? t('login.errorRateLimit') : t('login.errorGeneric'));
    } else {
      setLoginState('success');
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-bg-base">
      <DevLocalLinksPanel />
      {/* ── Painel esquerdo — decorativo (menor) ─────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[36%] lg:max-w-[440px] lg:shrink-0 flex-col overflow-hidden">
        {/* Gradiente de fundo vibrante */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14] via-[#0d1a26] to-[#0B0F14]" />

        {/* Glow central dourado — bem visível */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(201,162,39,0.22) 0%, rgba(201,162,39,0.06) 50%, transparent 70%)',
          }}
        />
        {/* Glow verde (bid) canto inferior */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.18) 0%, transparent 70%)' }}
        />
        {/* Glow vermelho (ask) canto superior direito */}
        <div
          aria-hidden="true"
          className="absolute -top-20 right-0 h-[300px] w-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,82,82,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Grid decorativo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,162,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Conteúdo do painel esquerdo */}
        <div className="relative z-10 flex flex-col h-full p-6 xl:p-8">
          {/* Logo no topo */}
          <div className="mb-auto">
            <Logo size="md" />
          </div>

          {/* Bloco central de dados */}
          <div className="flex flex-col gap-5 mb-auto">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold mb-3">
                <Zap size={10} aria-hidden="true" />
                DÓLAR FUTURO · B3
              </div>
              <h2 className="text-2xl xl:text-[1.65rem] font-display font-bold text-white leading-tight">
                Tape Reading
                <br />
                <span className="text-brand-gold">profissional</span> do
                <br />
                mercado brasileiro
              </h2>
              <p className="mt-2 text-xs xl:text-sm text-white/45 max-w-xs leading-relaxed">
                Domine a análise de fluxo de ordens no Dólar Futuro da B3 com metodologia
                institucional.
              </p>
            </div>

            <LivePriceGrid />

            <LiveOrderFlowTape />
          </div>

          {/* Stats rodapé */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-5 pt-5 border-t border-white/8">
            {[
              { icon: BarChart2, value: '8 módulos', label: 'de conteúdo' },
              { icon: TrendingUp, value: '48 aulas', label: 'tape reading' },
              { icon: Zap, value: 'B3 ao vivo', label: 'dólar futuro' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={value} className="flex items-center gap-2">
                <Icon size={14} className="text-brand-gold shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-white">{value}</p>
                  <p className="text-[10px] text-white/35">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário (maior) ─────────────────────── */}
      <div className="relative flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* Ticker no topo do painel direito */}
        <MarketTicker
          items={MOCK_TICKER_ITEMS}
          speed="slow"
          variant="compact"
          className="relative z-20 shrink-0"
        />

        {/* Vídeo / animação de mercado financeiro */}
        <LoginVideoBackground className="absolute inset-0" />

        {/* Formulário centralizado */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Logo mobile (só aparece < lg) */}
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <main className="w-full max-w-[400px] animate-scale-in">
            {/* Card de login */}
            <div
              className="rounded-3xl border border-white/12 bg-bg-surface/80 backdrop-blur-heavy p-8"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(201,162,39,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,162,39,0.06)',
              }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-display font-bold text-white">{t('login.title')}</h1>
                <p className="mt-2 text-sm text-white/45">{t('login.subtitle')}</p>
              </div>

              {loginState === 'success' ? (
                <SuccessState t={t} email={email} onBack={() => setLoginState('idle')} />
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                  <div className="flex flex-col gap-5">
                    <Input
                      type="email"
                      label={t('login.emailLabel')}
                      placeholder={t('login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={emailError}
                      autoComplete="email"
                      inputMode="email"
                      required
                      aria-required="true"
                    />

                    {errorMessage && (
                      <p role="alert" className="text-sm text-state-danger">
                        {errorMessage}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      loading={loginState === 'submitting'}
                      leftIcon={<Mail size={16} />}
                      className="w-full"
                    >
                      {loginState === 'submitting'
                        ? t('login.submitting')
                        : t('login.submitButton')}
                    </Button>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/30">
                    <Shield size={11} aria-hidden="true" />
                    <span>{t('login.newAccount')}</span>
                  </div>
                </form>
              )}
            </div>

            <p className="mt-5 text-center text-xs text-white/25">
              Mercado Brasileiro de Câmbio — Dólar BRL
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

interface SuccessStateProps {
  t: (key: string) => string;
  email: string;
  onBack: () => void;
}

function SuccessState({ t, email, onBack }: SuccessStateProps): JSX.Element {
  const showMailpit = isLocalMailInboxEnabled();

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center animate-scale-in">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-flow-bid/15 border border-flow-bid/20"
        style={{ boxShadow: '0 0 20px rgba(0,200,83,0.15)' }}
      >
        <CheckCircle className="h-7 w-7 text-flow-bid" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-display font-semibold text-white">{t('login.successTitle')}</h2>
        <p className="mt-1 text-sm text-white/50">{t('login.successDescription')}</p>
      </div>
      <p className="mt-1 text-xs text-white/35 bg-white/5 px-3 py-1 rounded-lg font-mono">
        {email}
      </p>
      {showMailpit ? (
        <>
          <p className="text-xs text-white/40 max-w-[280px]">{t('login.successHintLocal')}</p>
          <a
            href={LOCAL_MAIL_INBOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-gold/25 bg-brand-gold/10 px-4 py-2 text-xs font-semibold text-brand-gold transition-colors hover:bg-brand-gold/15"
          >
            <ExternalLink size={14} aria-hidden="true" />
            {t('login.openMailpit')}
          </a>
        </>
      ) : (
        <p className="text-xs text-white/35">{t('login.successHint')}</p>
      )}
      <button
        onClick={onBack}
        className="mt-1 text-xs text-brand-gold/60 hover:text-brand-gold transition-colors underline underline-offset-2"
      >
        Usar outro e-mail
      </button>
    </div>
  );
}
