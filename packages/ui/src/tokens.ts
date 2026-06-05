/**
 * Design tokens Felix Empire Trading.
 * Inspirados em mesa de operacoes de dolar BRL: cores de book/tape,
 * dourado Empire e tipografia mono para precos.
 *
 * Estes tokens sao a fonte unica de verdade; o Tailwind preset
 * (tailwind-preset.cjs) os reexporta para uso em classes utilitarias.
 */

// ============================================================================
// TypeScript Interfaces for Design Tokens
// ============================================================================

/**
 * Color tokens interface with semantic categories
 * Validates: Requirements 1.1, 2.1-2.12
 */
export interface ColorTokens {
  bg: {
    base: string;
    surface: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  flow: {
    bid: string;
    ask: string;
    bidSubtle: string;
    askSubtle: string;
    neutral: string;
  };
  brand: {
    gold: string;
    goldSoft: string;
    goldDeep: string;
    goldMuted: string;
    goldGlow: string;
  };
  state: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  border: {
    subtle: string;
    strong: string;
    focus: string;
  };
}

/**
 * Typography tokens interface with font families, sizes, weights, and spacing
 * Validates: Requirements 1.2, 3.1-3.10
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string[];
    mono: string[];
    display: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    widest: string;
  };
}

/**
 * Spacing tokens interface following 4px base grid
 * Validates: Requirements 1.3
 */
export interface SpacingTokens {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
}

/**
 * Effect tokens interface with shadows, blur, radius, and transitions
 * Validates: Requirements 1.4, 1.5, 1.6
 */
export interface EffectTokens {
  boxShadow: {
    card: string;
    cardHover: string;
    glowGold: string;
    glowGoldStrong: string;
    glowBid: string;
    inner: string;
  };
  backdropBlur: {
    xs: string;
    glass: string;
    heavy: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  transition: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
}

/**
 * Complete design token system interface
 * Validates: Requirements 1.1-1.6
 */
export interface DesignToken {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  effects: EffectTokens;
}

// ============================================================================
// Token Validation Functions
// ============================================================================

/**
 * Validates that a color value is a valid hex or rgba string
 * Validates: Requirement 1.7
 */
export function isValidColor(color: string): boolean {
  const hexPattern = /^#[0-9A-F]{6}$/i;
  const rgbaPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i;
  return hexPattern.test(color) || rgbaPattern.test(color);
}

/**
 * Validates that typography scale maintains minimum 1.125 ratio
 * Validates: Requirement 1.8
 */
export function validateTypographyScale(sizes: Record<string, string>): boolean {
  const sizeValues = Object.values(sizes).map((s) => parseFloat(s));
  for (let i = 1; i < sizeValues.length; i++) {
    const current = sizeValues[i];
    const previous = sizeValues[i - 1];
    if (current === undefined || previous === undefined || previous === 0) {
      return false;
    }
    const ratio = current / previous;
    if (ratio < 1.125) return false;
  }
  return true;
}

/**
 * Validates that all font sizes are at least 12px
 * Validates: Requirement 1.9
 */
export function validateMinimumFontSize(sizes: Record<string, string>): boolean {
  return Object.values(sizes).every((size) => {
    const pxValue = parseFloat(size) * 16; // Convert rem to px
    return pxValue >= 12;
  });
}

/**
 * Validates that backdrop blur values do not exceed 24px
 * Validates: Requirement 1.10
 */
export function validateBackdropBlur(blurValues: Record<string, string>): boolean {
  return Object.values(blurValues).every((blur) => {
    const pxValue = parseFloat(blur);
    return pxValue <= 24;
  });
}

// ============================================================================
// Design Token Values
// ============================================================================

export const colors: ColorTokens = {
  // Superficies
  bg: {
    base: '#0B0F14',
    surface: '#101720',
    elevated: '#162130',
    overlay: '#1C2A3A',
  },
  // Texto
  text: {
    primary: '#F4F6FA',
    secondary: '#A6B0BF',
    muted: '#6E7787',
    inverse: '#0B0F14',
  },
  // Order book / fluxo
  flow: {
    bid: '#00C853', // compra
    ask: '#FF5252', // venda
    bidSubtle: 'rgba(0, 200, 83, 0.16)',
    askSubtle: 'rgba(255, 82, 82, 0.16)',
    neutral: '#7C8794',
  },
  // Marca Empire (dourado de premiacao)
  brand: {
    gold: '#C9A227',
    goldSoft: '#E5C66B',
    goldDeep: '#8E6F12',
    goldMuted: 'rgba(201, 162, 39, 0.12)',
    goldGlow: 'rgba(201, 162, 39, 0.25)',
  },
  // Estados
  state: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
  },
  // Linhas / contornos
  border: {
    subtle: 'rgba(244, 246, 250, 0.08)',
    strong: 'rgba(244, 246, 250, 0.16)',
    focus: '#C9A227',
  },
};

export const typography: TypographyTokens = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    display: ['Sora', 'Inter', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    widest: '0.1em',
  },
};

export const spacing: SpacingTokens = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

export const effects: EffectTokens = {
  boxShadow: {
    card: '0 1px 2px rgba(0, 0, 0, 0.32), 0 8px 24px rgba(0, 0, 0, 0.24)',
    cardHover: '0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.32)',
    glowGold: '0 0 0 1px rgba(201, 162, 39, 0.4), 0 0 24px rgba(201, 162, 39, 0.18)',
    glowGoldStrong: '0 0 0 1px rgba(201, 162, 39, 0.6), 0 0 40px rgba(201, 162, 39, 0.28)',
    glowBid: '0 0 0 1px rgba(0, 200, 83, 0.3), 0 0 20px rgba(0, 200, 83, 0.15)',
    inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  },
  backdropBlur: {
    xs: '2px',
    glass: '12px',
    heavy: '24px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
};

// Legacy exports for backward compatibility
export const fonts = {
  sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  display: '"Sora", "Inter", sans-serif',
} as const;

export const radii = effects.borderRadius;
export const space = spacing;

export const shadows = {
  card: effects.boxShadow.card,
  glowGold: effects.boxShadow.glowGold,
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    enter: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export const layout = {
  containerMaxWidth: '1280px',
  sidebarWidth: '256px',
  topbarHeight: '64px',
  /**
   * Layout dedicado do simulado fullscreen: sem chrome, conteudo central.
   */
  assessmentMaxContentWidth: '960px',
} as const;

export const designTokens: DesignToken = {
  colors,
  typography,
  spacing,
  effects,
};

export type DesignTokens = typeof designTokens;
