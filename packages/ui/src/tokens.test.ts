/**
 * Unit tests for design token system
 * Validates: Requirements 1.1-1.10, 2.1-2.13, 3.1-3.10, 21.1-21.10
 */

import { describe, it, expect } from 'vitest';
import {
  colors,
  typography,
  spacing,
  effects,
  designTokens,
  isValidColor,
  validateTypographyScale,
  validateMinimumFontSize,
  validateBackdropBlur,
  type ColorTokens,
  type TypographyTokens,
  type SpacingTokens,
  type EffectTokens,
} from './tokens.js';

describe('Design Token System', () => {
  describe('ColorTokens Interface - Requirements 1.1, 2.1-2.12', () => {
    it('should define all color values in centralized ColorTokens interface', () => {
      expect(colors).toBeDefined();
      expect(colors.bg).toBeDefined();
      expect(colors.flow).toBeDefined();
      expect(colors.brand).toBeDefined();
      expect(colors.state).toBeDefined();
    });

    it('should define base background color as #0B0F14', () => {
      expect(colors.bg.base).toBe('#0B0F14');
    });

    it('should define surface background color as #101720', () => {
      expect(colors.bg.surface).toBe('#101720');
    });

    it('should define elevated background color as #162130', () => {
      expect(colors.bg.elevated).toBe('#162130');
    });

    it('should define overlay background color as #1C2A3A', () => {
      expect(colors.bg.overlay).toBe('#1C2A3A');
    });

    it('should define bid flow color as #00C853', () => {
      expect(colors.flow.bid).toBe('#00C853');
    });

    it('should define ask flow color as #FF5252', () => {
      expect(colors.flow.ask).toBe('#FF5252');
    });

    it('should define brand gold color as #C9A227', () => {
      expect(colors.brand.gold).toBe('#C9A227');
    });

    it('should define success state color as #22C55E', () => {
      expect(colors.state.success).toBe('#22C55E');
    });

    it('should define warning state color as #F59E0B', () => {
      expect(colors.state.warning).toBe('#F59E0B');
    });

    it('should define danger state color as #EF4444', () => {
      expect(colors.state.danger).toBe('#EF4444');
    });

    it('should define info state color as #38BDF8', () => {
      expect(colors.state.info).toBe('#38BDF8');
    });
  });

  describe('TypographyTokens Interface - Requirements 1.2, 3.1-3.10', () => {
    it('should define all typography values in TypographyTokens interface', () => {
      expect(typography).toBeDefined();
      expect(typography.fontFamily).toBeDefined();
      expect(typography.fontSize).toBeDefined();
      expect(typography.fontWeight).toBeDefined();
      expect(typography.lineHeight).toBeDefined();
      expect(typography.letterSpacing).toBeDefined();
    });

    it('should use Inter font family as primary sans-serif with fallbacks', () => {
      expect(typography.fontFamily.sans).toEqual(['Inter', 'system-ui', 'sans-serif']);
    });

    it('should use JetBrains Mono font family for monospace with fallbacks', () => {
      expect(typography.fontFamily.mono).toEqual(['JetBrains Mono', 'Fira Code', 'monospace']);
    });

    it('should use Sora font family for display typography with fallbacks', () => {
      expect(typography.fontFamily.display).toEqual(['Sora', 'Inter', 'sans-serif']);
    });

    it('should define font sizes from xs (12px) to 4xl (36px)', () => {
      expect(typography.fontSize.xs).toBe('0.75rem'); // 12px
      expect(typography.fontSize.sm).toBe('0.875rem'); // 14px
      expect(typography.fontSize.base).toBe('1rem'); // 16px
      expect(typography.fontSize.lg).toBe('1.125rem'); // 18px
      expect(typography.fontSize.xl).toBe('1.266875rem'); // ~20.27px (ratio 1.125× lg)
      expect(typography.fontSize['2xl']).toBe('1.5rem'); // 24px
      expect(typography.fontSize['3xl']).toBe('1.875rem'); // 30px
      expect(typography.fontSize['4xl']).toBe('2.25rem'); // 36px
    });

    it('should define font weights: normal (400), medium (500), semibold (600), bold (700)', () => {
      expect(typography.fontWeight.normal).toBe(400);
      expect(typography.fontWeight.medium).toBe(500);
      expect(typography.fontWeight.semibold).toBe(600);
      expect(typography.fontWeight.bold).toBe(700);
    });

    it('should use letter-spacing widest (0.1em) for uppercase labels', () => {
      expect(typography.letterSpacing.widest).toBe('0.1em');
    });
  });

  describe('SpacingTokens Interface - Requirement 1.3', () => {
    it('should define all spacing values following 4px base grid', () => {
      expect(spacing).toBeDefined();
      expect(spacing['0']).toBe('0');
      expect(spacing['1']).toBe('4px');
      expect(spacing['2']).toBe('8px');
      expect(spacing['3']).toBe('12px');
      expect(spacing['4']).toBe('16px');
      expect(spacing['5']).toBe('20px');
      expect(spacing['6']).toBe('24px');
      expect(spacing['8']).toBe('32px');
      expect(spacing['10']).toBe('40px');
      expect(spacing['12']).toBe('48px');
      expect(spacing['16']).toBe('64px');
      expect(spacing['20']).toBe('80px');
      expect(spacing['24']).toBe('96px');
    });

    it('should follow 4px base grid system', () => {
      const spacingValues = Object.values(spacing).filter((v) => v !== '0');
      spacingValues.forEach((value) => {
        const pxValue = parseInt(value);
        expect(pxValue % 4).toBe(0);
      });
    });
  });

  describe('EffectTokens Interface - Requirements 1.4, 1.5, 1.6', () => {
    it('should define all effect values in EffectTokens interface', () => {
      expect(effects).toBeDefined();
      expect(effects.boxShadow).toBeDefined();
      expect(effects.backdropBlur).toBeDefined();
      expect(effects.borderRadius).toBeDefined();
      expect(effects.transition).toBeDefined();
    });

    it('should define box shadow values', () => {
      expect(effects.boxShadow.card).toBeDefined();
      expect(effects.boxShadow.cardHover).toBeDefined();
      expect(effects.boxShadow.glowGold).toBeDefined();
      expect(effects.boxShadow.glowGoldStrong).toBeDefined();
      expect(effects.boxShadow.glowBid).toBeDefined();
      expect(effects.boxShadow.inner).toBeDefined();
    });

    it('should define backdrop blur values', () => {
      expect(effects.backdropBlur.xs).toBe('2px');
      expect(effects.backdropBlur.glass).toBe('12px');
      expect(effects.backdropBlur.heavy).toBe('24px');
    });

    it('should define border radius values', () => {
      expect(effects.borderRadius.lg).toBe('12px');
      expect(effects.borderRadius.xl).toBe('16px');
      expect(effects.borderRadius['2xl']).toBe('24px');
      expect(effects.borderRadius['3xl']).toBe('32px');
      expect(effects.borderRadius.full).toBe('9999px');
    });

    it('should define transition duration values', () => {
      expect(effects.transition.fast).toBe('150ms');
      expect(effects.transition.base).toBe('200ms');
      expect(effects.transition.slow).toBe('300ms');
      expect(effects.transition.slower).toBe('500ms');
    });
  });

  describe('Color Validation - Requirement 1.7', () => {
    it('should validate that all color tokens are valid hex or rgba strings', () => {
      // Test bg colors
      expect(isValidColor(colors.bg.base)).toBe(true);
      expect(isValidColor(colors.bg.surface)).toBe(true);
      expect(isValidColor(colors.bg.elevated)).toBe(true);
      expect(isValidColor(colors.bg.overlay)).toBe(true);

      // Test flow colors
      expect(isValidColor(colors.flow.bid)).toBe(true);
      expect(isValidColor(colors.flow.ask)).toBe(true);
      expect(isValidColor(colors.flow.bidSubtle)).toBe(true);
      expect(isValidColor(colors.flow.askSubtle)).toBe(true);

      // Test brand colors
      expect(isValidColor(colors.brand.gold)).toBe(true);
      expect(isValidColor(colors.brand.goldSoft)).toBe(true);
      expect(isValidColor(colors.brand.goldDeep)).toBe(true);
      expect(isValidColor(colors.brand.goldMuted)).toBe(true);
      expect(isValidColor(colors.brand.goldGlow)).toBe(true);

      // Test state colors
      expect(isValidColor(colors.state.success)).toBe(true);
      expect(isValidColor(colors.state.warning)).toBe(true);
      expect(isValidColor(colors.state.danger)).toBe(true);
      expect(isValidColor(colors.state.info)).toBe(true);
    });

    it('should reject invalid color values', () => {
      expect(isValidColor('invalid')).toBe(false);
      expect(isValidColor('#GGG')).toBe(false);
      expect(isValidColor('rgb(255, 255, 255)')).toBe(false); // rgb not supported, only rgba
      expect(isValidColor('#12345')).toBe(false); // wrong length
    });
  });

  describe('Typography Scale Validation - Requirement 1.8', () => {
    it('should validate that typography scale maintains minimum 1.125 ratio', () => {
      const fontSizes = {
        xs: typography.fontSize.xs,
        sm: typography.fontSize.sm,
        base: typography.fontSize.base,
        lg: typography.fontSize.lg,
        xl: typography.fontSize.xl,
        '2xl': typography.fontSize['2xl'],
        '3xl': typography.fontSize['3xl'],
        '4xl': typography.fontSize['4xl'],
      };

      expect(validateTypographyScale(fontSizes)).toBe(true);
    });

    it('should calculate correct ratios between consecutive sizes', () => {
      const sizes = [
        parseFloat(typography.fontSize.xs),
        parseFloat(typography.fontSize.sm),
        parseFloat(typography.fontSize.base),
        parseFloat(typography.fontSize.lg),
        parseFloat(typography.fontSize.xl),
        parseFloat(typography.fontSize['2xl']),
        parseFloat(typography.fontSize['3xl']),
        parseFloat(typography.fontSize['4xl']),
      ];

      for (let i = 1; i < sizes.length; i++) {
        const current = sizes[i];
        const previous = sizes[i - 1];
        if (current === undefined || previous === undefined) return false;
        const ratio = current / previous;
        expect(ratio).toBeGreaterThanOrEqual(1.125);
      }
    });
  });

  describe('Minimum Font Size Validation - Requirement 1.9', () => {
    it('should validate that all font sizes are at least 12px', () => {
      const fontSizes = {
        xs: typography.fontSize.xs,
        sm: typography.fontSize.sm,
        base: typography.fontSize.base,
        lg: typography.fontSize.lg,
        xl: typography.fontSize.xl,
        '2xl': typography.fontSize['2xl'],
        '3xl': typography.fontSize['3xl'],
        '4xl': typography.fontSize['4xl'],
      };

      expect(validateMinimumFontSize(fontSizes)).toBe(true);
    });

    it('should ensure xs font size (12px) meets minimum requirement', () => {
      const xsSizeInPx = parseFloat(typography.fontSize.xs) * 16;
      expect(xsSizeInPx).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Backdrop Blur Validation - Requirement 1.10', () => {
    it('should validate that backdrop blur values do not exceed 24px', () => {
      const blurValues = {
        xs: effects.backdropBlur.xs,
        glass: effects.backdropBlur.glass,
        heavy: effects.backdropBlur.heavy,
      };

      expect(validateBackdropBlur(blurValues)).toBe(true);
    });

    it('should ensure all blur values are within performance limits', () => {
      expect(parseFloat(effects.backdropBlur.xs)).toBeLessThanOrEqual(24);
      expect(parseFloat(effects.backdropBlur.glass)).toBeLessThanOrEqual(24);
      expect(parseFloat(effects.backdropBlur.heavy)).toBeLessThanOrEqual(24);
    });
  });

  describe('Design Token System Integration - Requirement 1.1', () => {
    it('should export complete design token system', () => {
      expect(designTokens).toBeDefined();
      expect(designTokens.colors).toEqual(colors);
      expect(designTokens.typography).toEqual(typography);
      expect(designTokens.spacing).toEqual(spacing);
      expect(designTokens.effects).toEqual(effects);
    });

    it('should have all required token categories', () => {
      expect(designTokens).toHaveProperty('colors');
      expect(designTokens).toHaveProperty('typography');
      expect(designTokens).toHaveProperty('spacing');
      expect(designTokens).toHaveProperty('effects');
    });
  });

  describe('Component Token Usage - Requirements 1.5, 1.6', () => {
    it('should provide design tokens for component styling', () => {
      // Verify tokens can be used for component styling
      expect(colors.bg.surface).toBeDefined();
      expect(effects.backdropBlur.glass).toBeDefined();
      expect(effects.borderRadius['2xl']).toBeDefined();
      expect(effects.boxShadow.card).toBeDefined();
    });

    it('should provide typography tokens for component text styling', () => {
      expect(typography.fontFamily.sans).toBeDefined();
      expect(typography.fontSize.base).toBeDefined();
      expect(typography.fontWeight.medium).toBeDefined();
      expect(typography.lineHeight.normal).toBeDefined();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should enforce ColorTokens interface structure', () => {
      const testColors: ColorTokens = colors;
      expect(testColors.bg.base).toBeDefined();
      expect(testColors.flow.bid).toBeDefined();
      expect(testColors.brand.gold).toBeDefined();
      expect(testColors.state.success).toBeDefined();
    });

    it('should enforce TypographyTokens interface structure', () => {
      const testTypography: TypographyTokens = typography;
      expect(testTypography.fontFamily.sans).toBeDefined();
      expect(testTypography.fontSize.base).toBeDefined();
      expect(testTypography.fontWeight.normal).toBeDefined();
    });

    it('should enforce SpacingTokens interface structure', () => {
      const testSpacing: SpacingTokens = spacing;
      expect(testSpacing['0']).toBeDefined();
      expect(testSpacing['4']).toBeDefined();
    });

    it('should enforce EffectTokens interface structure', () => {
      const testEffects: EffectTokens = effects;
      expect(testEffects.boxShadow.card).toBeDefined();
      expect(testEffects.backdropBlur.glass).toBeDefined();
      expect(testEffects.borderRadius.lg).toBeDefined();
      expect(testEffects.transition.base).toBeDefined();
    });
  });
});
