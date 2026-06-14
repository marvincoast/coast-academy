import { applyMarketTheme, getDefaultMarketTheme } from '@coast-academy/ui';

const THEME_STORAGE_KEY = 'coast-academy-market-theme-applied';

/**
 * Aplica tema de mercado no documento antes da primeira pintura (quando possível).
 */
export function initMarketTheme(): void {
  if (typeof document === 'undefined') return;
  applyMarketTheme(document.documentElement, getDefaultMarketTheme());
  try {
    localStorage.setItem(THEME_STORAGE_KEY, '1');
  } catch {
    // ignore quota errors
  }
}
