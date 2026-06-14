import { colors, isValidColor } from '../tokens.js';

export interface MarketTheme {
  colors: Record<string, string>;
}

const DEFAULT_THEME: MarketTheme = {
  colors: {
    'bg-base': colors.bg.base,
    'bg-surface': colors.bg.surface,
    'bg-elevated': colors.bg.elevated,
    'bg-overlay': colors.bg.overlay,
    'flow-bid': colors.flow.bid,
    'flow-ask': colors.flow.ask,
    'brand-gold': colors.brand.gold,
    'state-success': colors.state.success,
    'state-warning': colors.state.warning,
    'state-danger': colors.state.danger,
    'state-info': colors.state.info,
  },
};

/**
 * Aplica tokens de tema como CSS custom properties no elemento raiz.
 */
export function applyMarketTheme(element: HTMLElement, theme: MarketTheme = DEFAULT_THEME): void {
  if (typeof document === 'undefined' || !element.isConnected) {
    console.warn('[applyMarketTheme] Element is not mounted');
    return;
  }

  for (const [key, value] of Object.entries(theme.colors)) {
    if (!isValidColor(value)) {
      console.warn('[applyMarketTheme] Invalid color skipped:', key, value);
      continue;
    }
    element.style.setProperty(`--${key}`, value);
  }
}

export function getDefaultMarketTheme(): MarketTheme {
  return { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors } };
}
