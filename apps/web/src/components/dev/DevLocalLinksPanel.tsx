import { ExternalLink, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { cn } from '@/lib/cn.js';
import { captureSentryTestError, isSentryEnabled } from '@/lib/sentry.js';

const STORAGE_KEY = 'coast-academy-dev-links-hidden';

const DEV_LINKS = [
  { label: 'Login (localhost)', href: 'http://localhost' },
  { label: 'Traefik', href: 'http://localhost:8081' },
  { label: 'Supabase Studio', href: 'http://localhost:54323' },
  { label: 'Mailpit', href: 'http://localhost:54324' },
  { label: 'Grafana', href: 'http://localhost:3001' },
  { label: 'Prometheus', href: 'http://localhost:9090' },
  { label: 'Uptime Kuma', href: 'http://localhost:3002' },
] as const;

const showDevLocalLinks = import.meta.env.DEV || import.meta.env.VITE_DEV_LOCAL_LINKS === 'true';

/**
 * Painel discreto de URLs locais — Vite dev ou build Docker com VITE_DEV_LOCAL_LINKS=true.
 * Ocultar grava em sessionStorage; recarregar a página restaura a aba.
 */
export function DevLocalLinksPanel(): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1',
  );

  if (!showDevLocalLinks || hidden) {
    return null;
  }

  const hidePanel = (): void => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  };

  return (
    <div
      className="fixed bottom-3 right-0 z-[200] flex items-end justify-end pointer-events-none"
      aria-hidden={!open}
    >
      <div className="pointer-events-auto flex items-end">
        {open ? (
          <div
            className={cn(
              'mr-0 w-[220px] rounded-l-lg border border-r-0 border-white/10',
              'bg-bg-elevated/95 backdrop-blur-md shadow-2xl',
              'animate-scale-in origin-bottom-right',
            )}
            role="dialog"
            aria-label="Links de desenvolvimento local"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/8 px-2.5 py-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
                local
              </span>
              <button
                type="button"
                onClick={hidePanel}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-white/35 transition-colors hover:bg-white/5 hover:text-white/55"
                title="Ocultar até recarregar a página"
              >
                <EyeOff size={10} aria-hidden="true" />
                hide
              </button>
            </div>
            <ul className="max-h-[240px] overflow-y-auto py-1">
              {DEV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-white/45 transition-colors hover:bg-white/5 hover:text-brand-gold/90"
                  >
                    <ExternalLink
                      size={9}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium text-white/55 group-hover:text-white/75">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {isSentryEnabled() ? (
              <button
                type="button"
                onClick={() => {
                  captureSentryTestError();
                  toast.success('Sentry test enviado (web)');
                }}
                className="w-full border-t border-white/8 py-1.5 text-[9px] text-amber-400/80 transition-colors hover:bg-white/5 hover:text-amber-300"
              >
                Sentry test
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full border-t border-white/8 py-1 text-[9px] text-white/25 transition-colors hover:text-white/45"
            >
              fechar
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex h-7 w-3.5 items-center justify-center rounded-l-sm',
            'border border-r-0 border-white/6 bg-bg-elevated/70',
            'text-[8px] leading-none text-white/35 backdrop-blur-sm',
            'transition-all hover:w-4 hover:border-white/15 hover:bg-bg-elevated hover:text-white/55',
            open && 'rounded-l-none border-l-0',
          )}
          aria-expanded={open}
          aria-label={open ? 'Fechar links locais' : 'Abrir links locais de desenvolvimento'}
          title="Dev links (somente desenvolvimento)"
        >
          <span className="sr-only">Dev links</span>
          <span aria-hidden="true" className="select-none">
            ·
          </span>
        </button>
      </div>
    </div>
  );
}
