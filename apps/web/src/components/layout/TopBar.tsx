import { LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import { MarketTicker } from '@/components/market/MarketTicker.js';
import { useAuth } from '@/hooks/use-auth.js';
import { cn } from '@/lib/cn.js';
import { MOCK_TICKER_ITEMS } from '@/lib/mock-market-data.js';
import { supabase } from '@/lib/supabase.js';

/** Mapeamento de path → breadcrumb label */
const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/curso': 'Curso',
  '/aula': 'Aula',
  '/ranking': 'Ranking',
  '/certificados': 'Certificados',
  '/tutor': 'Tutor IA',
  '/simulados': 'Simulados',
  '/simulado': 'Simulado',
  '/prova-final': 'Prova Final',
};

function useBreadcrumb(): string {
  const location = useLocation();
  const path = '/' + location.pathname.split('/')[1];
  return BREADCRUMBS[path] ?? '';
}

/**
 * Barra superior: breadcrumb dinâmico, skip link (a11y) e menu do usuário.
 */
export function TopBar(): JSX.Element {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const breadcrumb = useBreadcrumb();

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayEmail = user?.email ?? '';
  const displayName =
    (user?.user_metadata?.['display_name'] as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Trader';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="shrink-0 border-b border-white/8 bg-bg-surface/95 backdrop-blur-xs">
      {/* Skip link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg-base"
      >
        Pular para o conteúdo
      </a>

      <MarketTicker items={MOCK_TICKER_ITEMS} speed="normal" variant="compact" />

      <header className="flex h-16 items-center justify-between px-6">
        {/* Lado esquerdo: breadcrumb */}
        <nav aria-label="Localização atual" className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold select-none">
            Coast Academy
          </span>
          {breadcrumb && (
            <>
              <ChevronRight size={12} className="text-white/20" aria-hidden="true" />
              <span className="text-sm font-medium text-white/70">{breadcrumb}</span>
            </>
          )}
        </nav>

        {/* Lado direito: menu do usuario */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Menu do usuário: ${displayEmail}`}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-all duration-200',
              'text-white/70 hover:bg-white/6 hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold',
              menuOpen && 'bg-white/6 text-white',
            )}
          >
            {/* Avatar com iniciais */}
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold text-[11px] font-bold select-none"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="hidden max-w-[140px] truncate sm:inline text-sm font-medium">
              {displayName}
            </span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                aria-label="Opções do usuário"
                className={cn(
                  'absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl',
                  'border border-white/10 bg-bg-elevated shadow-card-hover',
                  'animate-slide-down',
                )}
              >
                {/* Header do menu */}
                <div className="border-b border-white/8 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">
                    Conta
                  </p>
                  <p className="mt-1 font-semibold text-sm text-white truncate">{displayName}</p>
                  <p className="truncate text-xs text-white/40 mt-0.5">{displayEmail}</p>
                </div>

                <button
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/60 transition-colors hover:bg-state-danger/10 hover:text-state-danger focus-visible:outline-none focus-visible:bg-white/8"
                >
                  <LogOut size={15} aria-hidden="true" />
                  {t('actions.signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
