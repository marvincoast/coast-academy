/**
 * Unit tests for TailwindCSS preset configuration
 * Validates: Requirements 1.1-1.6, 2.1-2.12, 3.1-3.10, 21.1-21.10
 */

const { describe, it, expect } = require('vitest');
const tailwindPreset = require('./tailwind-preset.cjs');

describe('TailwindCSS Preset Configuration', () => {
  describe('Color System Extension - Requirements 2.1-2.12', () => {
    it('should extend TailwindCSS with custom colors', () => {
      expect(tailwindPreset.theme.extend.colors).toBeDefined();
      expect(tailwindPreset.theme.extend.colors.bg).toBeDefined();
      expect(tailwindPreset.theme.extend.colors.flow).toBeDefined();
      expect(tailwindPreset.theme.extend.colors.brand).toBeDefined();
      expect(tailwindPreset.theme.extend.colors.state).toBeDefined();
    });

    it('should define bg color category', () => {
      const bgColors = tailwindPreset.theme.extend.colors.bg;
      expect(bgColors.base).toBe('#0B0F14');
      expect(bgColors.surface).toBe('#101720');
      expect(bgColors.elevated).toBe('#162130');
      expect(bgColors.overlay).toBe('#1C2A3A');
    });

    it('should define flow color category with bid and ask', () => {
      const flowColors = tailwindPreset.theme.extend.colors.flow;
      expect(flowColors.bid).toBe('#00C853');
      expect(flowColors.ask).toBe('#FF5252');
      expect(flowColors['bid-subtle']).toBe('rgba(0, 200, 83, 0.16)');
      expect(flowColors['ask-subtle']).toBe('rgba(255, 82, 82, 0.16)');
    });

    it('should define brand color category with gold variants', () => {
      const brandColors = tailwindPreset.theme.extend.colors.brand;
      expect(brandColors.gold).toBe('#C9A227');
      expect(brandColors['gold-soft']).toBe('#E5C66B');
      expect(brandColors['gold-deep']).toBe('#8E6F12');
      expect(brandColors['gold-muted']).toBe('rgba(201, 162, 39, 0.12)');
      expect(brandColors['gold-glow']).toBe('rgba(201, 162, 39, 0.25)');
    });

    it('should define state color category', () => {
      const stateColors = tailwindPreset.theme.extend.colors.state;
      expect(stateColors.success).toBe('#22C55E');
      expect(stateColors.warning).toBe('#F59E0B');
      expect(stateColors.danger).toBe('#EF4444');
      expect(stateColors.info).toBe('#38BDF8');
    });
  });

  describe('Typography Configuration - Requirements 3.1-3.10', () => {
    it('should configure custom font families', () => {
      const fontFamily = tailwindPreset.theme.extend.fontFamily;
      expect(fontFamily.sans).toEqual(['Inter', 'system-ui', 'sans-serif']);
      expect(fontFamily.mono).toEqual(['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']);
      expect(fontFamily.display).toEqual(['Sora', 'Inter', 'sans-serif']);
    });

    it('should configure font sizes with line heights', () => {
      const fontSize = tailwindPreset.theme.extend.fontSize;
      expect(fontSize.xs).toEqual(['0.75rem', { lineHeight: '1.25' }]);
      expect(fontSize.sm).toEqual(['0.875rem', { lineHeight: '1.5' }]);
      expect(fontSize.base).toEqual(['1rem', { lineHeight: '1.5' }]);
      expect(fontSize.lg).toEqual(['1.125rem', { lineHeight: '1.5' }]);
      expect(fontSize.xl).toEqual(['1.25rem', { lineHeight: '1.5' }]);
      expect(fontSize['2xl']).toEqual(['1.5rem', { lineHeight: '1.25' }]);
      expect(fontSize['3xl']).toEqual(['1.875rem', { lineHeight: '1.25' }]);
      expect(fontSize['4xl']).toEqual(['2.25rem', { lineHeight: '1.25' }]);
    });

    it('should configure font weights', () => {
      const fontWeight = tailwindPreset.theme.extend.fontWeight;
      expect(fontWeight.normal).toBe('400');
      expect(fontWeight.medium).toBe('500');
      expect(fontWeight.semibold).toBe('600');
      expect(fontWeight.bold).toBe('700');
    });

    it('should configure letter spacing', () => {
      const letterSpacing = tailwindPreset.theme.extend.letterSpacing;
      expect(letterSpacing.tight).toBe('-0.025em');
      expect(letterSpacing.normal).toBe('0');
      expect(letterSpacing.wide).toBe('0.025em');
      expect(letterSpacing.widest).toBe('0.1em');
    });
  });

  describe('Spacing Configuration - Requirement 1.3', () => {
    it('should configure custom spacing scale following 4px base grid', () => {
      const spacing = tailwindPreset.theme.extend.spacing;
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
  });

  describe('Effects Configuration - Requirements 1.4, 1.5, 1.6', () => {
    it('should configure custom box shadows', () => {
      const boxShadow = tailwindPreset.theme.extend.boxShadow;
      expect(boxShadow.card).toBeDefined();
      expect(boxShadow['card-hover']).toBeDefined();
      expect(boxShadow['glow-gold']).toBeDefined();
      expect(boxShadow['glow-gold-strong']).toBeDefined();
      expect(boxShadow['glow-bid']).toBeDefined();
      expect(boxShadow.inner).toBeDefined();
    });

    it('should configure backdrop blur values', () => {
      const backdropBlur = tailwindPreset.theme.extend.backdropBlur;
      expect(backdropBlur.xs).toBe('2px');
      expect(backdropBlur.glass).toBe('12px');
      expect(backdropBlur.heavy).toBe('24px');
    });

    it('should configure border radius values', () => {
      const borderRadius = tailwindPreset.theme.extend.borderRadius;
      expect(borderRadius.lg).toBe('12px');
      expect(borderRadius.xl).toBe('16px');
      expect(borderRadius['2xl']).toBe('24px');
      expect(borderRadius['3xl']).toBe('32px');
      expect(borderRadius.full).toBe('9999px');
    });

    it('should configure transition durations', () => {
      const transitionDuration = tailwindPreset.theme.extend.transitionDuration;
      expect(transitionDuration.fast).toBe('150ms');
      expect(transitionDuration.base).toBe('200ms');
      expect(transitionDuration.slow).toBe('300ms');
      expect(transitionDuration.slower).toBe('500ms');
    });

    it('should configure transition timing functions', () => {
      const transitionTimingFunction = tailwindPreset.theme.extend.transitionTimingFunction;
      expect(transitionTimingFunction['out-expo']).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
      expect(transitionTimingFunction['in-out-soft']).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });

  describe('Animation Keyframes - Requirements 21.1-21.10', () => {
    it('should configure fade-up animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes['fade-up']).toBeDefined();
      expect(keyframes['fade-up']['0%']).toEqual({ opacity: '0', transform: 'translateY(12px)' });
      expect(keyframes['fade-up']['100%']).toEqual({ opacity: '1', transform: 'translateY(0)' });
    });

    it('should configure progress-fill animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes['progress-fill']).toBeDefined();
      expect(keyframes['progress-fill']['0%']).toEqual({ width: '0%' });
    });

    it('should configure pulse animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes.pulse).toBeDefined();
      expect(keyframes.pulse['0%, 100%']).toEqual({ opacity: '1' });
      expect(keyframes.pulse['50%']).toEqual({ opacity: '0.5' });
    });

    it('should configure slide-down animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes['slide-down']).toBeDefined();
      expect(keyframes['slide-down']['0%']).toEqual({ opacity: '0', transform: 'translateY(-8px)' });
      expect(keyframes['slide-down']['100%']).toEqual({ opacity: '1', transform: 'translateY(0)' });
    });

    it('should configure counter-up animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes['counter-up']).toBeDefined();
      expect(keyframes['counter-up']['0%']).toEqual({ opacity: '0', transform: 'translateY(8px)' });
      expect(keyframes['counter-up']['100%']).toEqual({ opacity: '1', transform: 'translateY(0)' });
    });

    it('should configure pulse-gold animation keyframe', () => {
      const keyframes = tailwindPreset.theme.extend.keyframes;
      expect(keyframes['pulse-gold']).toBeDefined();
      expect(keyframes['pulse-gold']['0%, 100%']).toEqual({ boxShadow: '0 0 0 0 rgba(201, 162, 39, 0)' });
      expect(keyframes['pulse-gold']['50%']).toEqual({ boxShadow: '0 0 0 4px rgba(201, 162, 39, 0.15)' });
    });
  });

  describe('Animation Classes - Requirements 21.1-21.10', () => {
    it('should configure staggered fade-up animations', () => {
      const animation = tailwindPreset.theme.extend.animation;
      expect(animation['fade-up']).toBe('fade-up 0.4s ease-out both');
      expect(animation['fade-up-1']).toBe('fade-up 0.4s ease-out 0.1s both');
      expect(animation['fade-up-2']).toBe('fade-up 0.4s ease-out 0.2s both');
      expect(animation['fade-up-3']).toBe('fade-up 0.4s ease-out 0.3s both');
      expect(animation['fade-up-4']).toBe('fade-up 0.4s ease-out 0.4s both');
    });

    it('should configure slide-left animations with different speeds', () => {
      const animation = tailwindPreset.theme.extend.animation;
      expect(animation['slide-left-tape']).toBe('slide-left 18s linear infinite');
      expect(animation['slide-left-fast']).toBe('slide-left 12s linear infinite');
      expect(animation['slide-left-slow']).toBe('slide-left 24s linear infinite');
    });

    it('should configure progress-fill animation', () => {
      const animation = tailwindPreset.theme.extend.animation;
      expect(animation['progress-fill']).toBe('progress-fill 0.7s ease-out both');
    });

    it('should configure pulse animations', () => {
      const animation = tailwindPreset.theme.extend.animation;
      expect(animation.pulse).toBe('pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite');
      expect(animation['pulse-gold']).toBe('pulse-gold 2s ease-in-out infinite');
    });
  });

  describe('Background Gradients', () => {
    it('should configure gold gradient backgrounds', () => {
      const backgroundImage = tailwindPreset.theme.extend.backgroundImage;
      expect(backgroundImage['gradient-gold']).toBe('linear-gradient(135deg, #C9A227 0%, #E5C66B 50%, #C9A227 100%)');
      expect(backgroundImage['gradient-gold-subtle']).toBe('linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(229,198,107,0.08) 100%)');
    });

    it('should configure surface gradients', () => {
      const backgroundImage = tailwindPreset.theme.extend.backgroundImage;
      expect(backgroundImage['gradient-surface']).toBe('linear-gradient(180deg, #162130 0%, #101720 100%)');
      expect(backgroundImage['gradient-dark']).toBe('linear-gradient(180deg, #0B0F14 0%, #060A0F 100%)');
    });

    it('should configure shimmer gradient', () => {
      const backgroundImage = tailwindPreset.theme.extend.backgroundImage;
      expect(backgroundImage.shimmer).toBe('linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)');
    });
  });

  describe('Dark Mode Configuration', () => {
    it('should configure dark mode with class strategy', () => {
      expect(tailwindPreset.darkMode).toBe('class');
    });
  });

  describe('Preset Structure', () => {
    it('should have theme.extend structure', () => {
      expect(tailwindPreset.theme).toBeDefined();
      expect(tailwindPreset.theme.extend).toBeDefined();
    });

    it('should have plugins array', () => {
      expect(tailwindPreset.plugins).toBeDefined();
      expect(Array.isArray(tailwindPreset.plugins)).toBe(true);
    });
  });
});
