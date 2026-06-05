/**
 * Tailwind preset Felix Empire Trading.
 * Design tokens completos: cores, tipografia, sombras, animações e glassmorphism.
 * 
 * Validates: Requirements 1.1-1.6, 2.1-2.12, 3.1-3.10, 21.1-21.10
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      // ========================================================================
      // Color System - Requirements 2.1-2.12
      // ========================================================================
      colors: {
        bg: {
          base: '#0B0F14',
          surface: '#101720',
          elevated: '#162130',
          overlay: '#1C2A3A',
        },
        text: {
          primary: '#F4F6FA',
          secondary: '#A6B0BF',
          muted: '#6E7787',
          inverse: '#0B0F14',
        },
        flow: {
          bid: '#00C853',
          ask: '#FF5252',
          'bid-subtle': 'rgba(0, 200, 83, 0.16)',
          'ask-subtle': 'rgba(255, 82, 82, 0.16)',
          neutral: '#7C8794',
        },
        brand: {
          gold: '#C9A227',
          'gold-soft': '#E5C66B',
          'gold-deep': '#8E6F12',
          'gold-muted': 'rgba(201, 162, 39, 0.12)',
          'gold-glow': 'rgba(201, 162, 39, 0.25)',
        },
        state: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#38BDF8',
        },
        border: {
          subtle: 'rgba(244, 246, 250, 0.08)',
          strong: 'rgba(244, 246, 250, 0.16)',
          focus: '#C9A227',
        },
      },

      // ========================================================================
      // Typography System - Requirements 3.1-3.10
      // ========================================================================
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.25' }],    // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],    // 14px
        base: ['1rem', { lineHeight: '1.5' }],      // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],    // 18px
        xl: ['1.25rem', { lineHeight: '1.5' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.25' }],  // 24px
        '3xl': ['1.875rem', { lineHeight: '1.25' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25' }], // 36px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        widest: '0.1em',
      },

      // ========================================================================
      // Opacity custom (escala fina usada em glassmorphism Empire)
      // Tailwind padrão só inclui 0,5,10,20,25,...; adicionamos passos intermediários
      // ========================================================================
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        22: '0.22',
        25: '0.25',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        75: '0.75',
        85: '0.85',
      },

      // ========================================================================
      // Spacing System - Requirement 1.3 (4px base grid)
      // ========================================================================
      spacing: {
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
      },

      // ========================================================================
      // Effects - Box Shadows - Requirement 1.4
      // ========================================================================
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.32), 0 8px 24px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.32)',
        'glow-gold': '0 0 0 1px rgba(201, 162, 39, 0.4), 0 0 24px rgba(201, 162, 39, 0.18)',
        'glow-gold-strong': '0 0 0 1px rgba(201, 162, 39, 0.6), 0 0 40px rgba(201, 162, 39, 0.28)',
        'glow-bid': '0 0 0 1px rgba(0, 200, 83, 0.3), 0 0 20px rgba(0, 200, 83, 0.15)',
        inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },

      // ========================================================================
      // Effects - Backdrop Blur - Requirement 1.4, 1.10
      // ========================================================================
      backdropBlur: {
        xs: '2px',
        glass: '12px',
        heavy: '24px',
      },

      // ========================================================================
      // Effects - Border Radius - Requirement 1.4
      // ========================================================================
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

      // ========================================================================
      // Effects - Transitions - Requirement 1.4
      // ========================================================================
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ========================================================================
      // Background Gradients
      // ========================================================================
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A227 0%, #E5C66B 50%, #C9A227 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(229,198,107,0.08) 100%)',
        'gradient-surface': 'linear-gradient(180deg, #162130 0%, #101720 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0B0F14 0%, #060A0F 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },

      // ========================================================================
      // Animation Keyframes - Requirements 21.1-21.10
      // ========================================================================
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(201, 162, 39, 0.15)' },
        },
        'counter-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
        },
        'sidebar-active': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },

      // ========================================================================
      // Animations - Requirements 21.1-21.10
      // ========================================================================
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-up-1': 'fade-up 0.4s ease-out 0.1s both',
        'fade-up-2': 'fade-up 0.4s ease-out 0.2s both',
        'fade-up-3': 'fade-up 0.4s ease-out 0.3s both',
        'fade-up-4': 'fade-up 0.4s ease-out 0.4s both',
        'fade-in': 'fade-in 0.25s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-left-tape': 'slide-left 18s linear infinite',
        'slide-left-fast': 'slide-left 12s linear infinite',
        'slide-left-slow': 'slide-left 24s linear infinite',
        'slide-down': 'slide-down 0.2s ease-out both',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'counter-up': 'counter-up 0.5s ease-out both',
        'progress-fill': 'progress-fill 0.7s ease-out both',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
