# Design Token System Documentation

## Overview

This document describes the design token system for the Coast Academy platform. The design token system provides a centralized, type-safe way to manage visual properties across the application, ensuring consistency and maintainability.

**Validates:** Requirements 1.1-1.6, 2.1-2.12, 3.1-3.10, 21.1-21.10

## Architecture

The design token system consists of two main components:

1. **TypeScript Tokens** (`src/tokens.ts`): Type-safe token definitions with validation functions
2. **TailwindCSS Preset** (`tailwind-preset.cjs`): Tailwind configuration that extends the framework with custom tokens

## Token Categories

### 1. Color Tokens (ColorTokens)

**Validates:** Requirements 1.1, 2.1-2.12

Color tokens are organized into semantic categories that reflect the financial market theme:

#### Background Colors (`bg`)
- `base`: `#0B0F14` - Base background color
- `surface`: `#101720` - Surface background color
- `elevated`: `#162130` - Elevated background color
- `overlay`: `#1C2A3A` - Overlay background color

#### Text Colors (`text`)
- `primary`: `#F4F6FA` - Primary text color
- `secondary`: `#A6B0BF` - Secondary text color
- `muted`: `#6E7787` - Muted text color
- `inverse`: `#0B0F14` - Inverse text color

#### Flow Colors (`flow`)
- `bid`: `#00C853` - Bid/buy color (green)
- `ask`: `#FF5252` - Ask/sell color (red)
- `bidSubtle`: `rgba(0, 200, 83, 0.16)` - Subtle bid color
- `askSubtle`: `rgba(255, 82, 82, 0.16)` - Subtle ask color
- `neutral`: `#7C8794` - Neutral color

#### Brand Colors (`brand`)
- `gold`: `#C9A227` - Primary brand gold
- `goldSoft`: `#E5C66B` - Soft gold variant
- `goldDeep`: `#8E6F12` - Deep gold variant
- `goldMuted`: `rgba(201, 162, 39, 0.12)` - Muted gold
- `goldGlow`: `rgba(201, 162, 39, 0.25)` - Gold glow effect

#### State Colors (`state`)
- `success`: `#22C55E` - Success state
- `warning`: `#F59E0B` - Warning state
- `danger`: `#EF4444` - Danger state
- `info`: `#38BDF8` - Info state

#### Border Colors (`border`)
- `subtle`: `rgba(244, 246, 250, 0.08)` - Subtle border
- `strong`: `rgba(244, 246, 250, 0.16)` - Strong border
- `focus`: `#C9A227` - Focus border (gold)

### 2. Typography Tokens (TypographyTokens)

**Validates:** Requirements 1.2, 3.1-3.10

#### Font Families (`fontFamily`)
- `sans`: `['Inter', 'system-ui', 'sans-serif']` - Primary sans-serif font
- `mono`: `['JetBrains Mono', 'Fira Code', 'monospace']` - Monospace font for financial data
- `display`: `['Sora', 'Inter', 'sans-serif']` - Display font for headings

#### Font Sizes (`fontSize`)
- `xs`: `0.75rem` (12px)
- `sm`: `0.875rem` (14px)
- `base`: `1rem` (16px)
- `lg`: `1.125rem` (18px)
- `xl`: `1.25rem` (20px)
- `2xl`: `1.5rem` (24px)
- `3xl`: `1.875rem` (30px)
- `4xl`: `2.25rem` (36px)

#### Font Weights (`fontWeight`)
- `normal`: `400`
- `medium`: `500`
- `semibold`: `600`
- `bold`: `700`

#### Line Heights (`lineHeight`)
- `tight`: `1.25`
- `normal`: `1.5`
- `relaxed`: `1.75`

#### Letter Spacing (`letterSpacing`)
- `tight`: `-0.025em`
- `normal`: `0`
- `wide`: `0.025em`
- `widest`: `0.1em` - For uppercase labels

### 3. Spacing Tokens (SpacingTokens)

**Validates:** Requirement 1.3

All spacing values follow a 4px base grid system:

- `0`: `0`
- `1`: `4px`
- `2`: `8px`
- `3`: `12px`
- `4`: `16px`
- `5`: `20px`
- `6`: `24px`
- `8`: `32px`
- `10`: `40px`
- `12`: `48px`
- `16`: `64px`
- `20`: `80px`
- `24`: `96px`

### 4. Effect Tokens (EffectTokens)

**Validates:** Requirements 1.4, 1.5, 1.6

#### Box Shadows (`boxShadow`)
- `card`: Standard card shadow
- `cardHover`: Enhanced shadow on hover
- `glowGold`: Gold glow effect
- `glowGoldStrong`: Strong gold glow
- `glowBid`: Bid color glow
- `inner`: Inner shadow

#### Backdrop Blur (`backdropBlur`)
- `xs`: `2px` - Extra small blur
- `glass`: `12px` - Standard glassmorphism blur
- `heavy`: `24px` - Heavy blur (performance limit)

#### Border Radius (`borderRadius`)
- `none`: `0`
- `sm`: `4px`
- `md`: `8px`
- `lg`: `12px`
- `xl`: `16px`
- `2xl`: `24px`
- `3xl`: `32px`
- `full`: `9999px`

#### Transitions (`transition`)
- `fast`: `150ms`
- `base`: `200ms`
- `slow`: `300ms`
- `slower`: `500ms`

## Validation Functions

### isValidColor(color: string): boolean

**Validates:** Requirement 1.7

Validates that a color value is a valid hex (#RRGGBB) or rgba string.

```typescript
isValidColor('#C9A227') // true
isValidColor('rgba(201, 162, 39, 0.25)') // true
isValidColor('invalid') // false
```

### validateTypographyScale(sizes: Record<string, string>): boolean

**Validates:** Requirement 1.8

Validates that typography scale maintains minimum 1.125 ratio between consecutive sizes.

```typescript
validateTypographyScale({
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  // ...
}) // true
```

### validateMinimumFontSize(sizes: Record<string, string>): boolean

**Validates:** Requirement 1.9

Validates that all font sizes are at least 12px for accessibility.

```typescript
validateMinimumFontSize({
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  // ...
}) // true
```

### validateBackdropBlur(blurValues: Record<string, string>): boolean

**Validates:** Requirement 1.10

Validates that backdrop blur values do not exceed 24px for performance.

```typescript
validateBackdropBlur({
  xs: '2px',
  glass: '12px',
  heavy: '24px',
}) // true
```

## Usage Examples

### Using Tokens in TypeScript

```typescript
import { colors, typography, spacing, effects } from '@coast-academy/ui/tokens';

// Use color tokens
const cardStyle = {
  backgroundColor: colors.bg.surface,
  color: colors.text.primary,
  borderColor: colors.brand.gold,
};

// Use typography tokens
const headingStyle = {
  fontFamily: typography.fontFamily.display.join(', '),
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
};

// Use spacing tokens
const containerStyle = {
  padding: spacing['6'],
  margin: spacing['4'],
};

// Use effect tokens
const glassCardStyle = {
  backdropFilter: `blur(${effects.backdropBlur.glass})`,
  borderRadius: effects.borderRadius['2xl'],
  boxShadow: effects.boxShadow.card,
};
```

### Using Tokens in TailwindCSS

```tsx
import { GlassCard } from '@/components/ui/GlassCard';

function DashboardWidget() {
  return (
    <div className="bg-bg-surface text-text-primary p-6 rounded-2xl">
      <h2 className="font-display text-2xl font-bold text-brand-gold">
        Market Overview
      </h2>
      <p className="font-mono text-sm text-text-secondary mt-2">
        Real-time dollar futures analysis
      </p>
    </div>
  );
}
```

### Using Glassmorphism Classes

```tsx
function Card() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold">Content</h3>
    </div>
  );
}

function InteractiveCard() {
  return (
    <div className="glass-card-hover p-6">
      <h3 className="text-lg font-semibold">Hover me</h3>
    </div>
  );
}

function GoldCard() {
  return (
    <div className="glass-card-gold p-6">
      <h3 className="text-lg font-semibold text-brand-gold">Premium</h3>
    </div>
  );
}
```

## Animation System

**Validates:** Requirements 21.1-21.10

### Keyframe Animations

- `fade-up`: Fade in with upward movement
- `fade-in`: Simple fade in
- `scale-in`: Scale and fade in
- `slide-left`: Horizontal slide (for tickers)
- `slide-down`: Slide down with fade
- `shimmer`: Shimmer effect for loading states
- `pulse-gold`: Gold pulse effect
- `counter-up`: Counter animation for numbers
- `progress-fill`: Progress bar fill animation
- `pulse`: Standard pulse animation

### Animation Classes

#### Staggered Fade-Up
```tsx
<div className="animate-fade-up">First element</div>
<div className="animate-fade-up-1">Second element (100ms delay)</div>
<div className="animate-fade-up-2">Third element (200ms delay)</div>
<div className="animate-fade-up-3">Fourth element (300ms delay)</div>
<div className="animate-fade-up-4">Fifth element (400ms delay)</div>
```

#### Ticker Animations
```tsx
<div className="animate-slide-left-tape">Normal speed (18s)</div>
<div className="animate-slide-left-fast">Fast speed (12s)</div>
<div className="animate-slide-left-slow">Slow speed (24s)</div>
```

#### Progress Animation
```tsx
<div className="animate-progress-fill">Progress bar</div>
```

#### Pulse Animations
```tsx
<div className="animate-pulse">Standard pulse</div>
<div className="animate-pulse-gold">Gold pulse effect</div>
```

## Font Loading Configuration

**Validates:** Requirements 21.1-21.10

Fonts are loaded from Google Fonts with the following configuration:

### Fonts Loaded
- **Inter**: Weights 400, 500, 600, 700
- **Sora**: Weights 600, 700
- **JetBrains Mono**: Weights 400, 500, 600

### Font Display Strategy
- Uses `font-display: swap` to prevent Flash of Invisible Text (FOIT)
- Critical fonts (Inter 400, Sora 700) are preloaded in HTML head
- Fonts are subset to Latin characters only for reduced file size

### Fallback Strategy
- **Inter** → `system-ui` → `sans-serif`
- **JetBrains Mono** → `Fira Code` → `ui-monospace` → `monospace`
- **Sora** → `Inter` → `sans-serif`

## Accessibility Considerations

### Color Contrast
All color combinations maintain at least 4.5:1 contrast ratio for WCAG AA compliance:
- Text colors on background colors meet contrast requirements
- State colors are distinguishable for colorblind users
- Focus states use high-contrast gold outline

### Typography
- Minimum font size is 12px (0.75rem) for accessibility
- Line heights provide adequate spacing for readability
- Letter spacing is optimized for uppercase labels

### Focus States
Global focus-visible styling uses gold outline:
```css
*:focus-visible {
  outline: 2px solid theme('colors.brand.gold');
  outline-offset: 2px;
}
```

## Performance Considerations

### Backdrop Blur Limits
- Maximum blur value is 24px to maintain 60fps performance
- Glassmorphism effects use GPU-accelerated properties
- Overlapping glass elements are limited to 3 layers

### Animation Performance
- Animations use only `transform` and `opacity` for GPU acceleration
- Animation durations are limited to 500ms maximum
- Staggered animations have maximum 1000ms delay

### Font Loading
- Critical fonts are preloaded to prevent layout shift
- Font subsetting reduces file size
- `font-display: swap` ensures text is visible immediately

## Testing

The design token system includes comprehensive unit tests:

### Token Tests (`src/tokens.test.ts`)
- Validates all token interfaces
- Tests color validation functions
- Verifies typography scale ratios
- Checks minimum font sizes
- Validates backdrop blur limits

### Preset Tests (`tailwind-preset.test.cjs`)
- Validates TailwindCSS configuration
- Tests color system extension
- Verifies typography configuration
- Checks spacing scale
- Validates animation keyframes

Run tests with:
```bash
pnpm test --filter=@coast-academy/ui
```

## Migration Guide

### From Hardcoded Values

**Before:**
```tsx
<div style={{ backgroundColor: '#101720', padding: '24px' }}>
  <h1 style={{ color: '#C9A227', fontSize: '24px' }}>Title</h1>
</div>
```

**After:**
```tsx
<div className="bg-bg-surface p-6">
  <h1 className="text-brand-gold text-2xl">Title</h1>
</div>
```

### From Old Token System

**Before:**
```typescript
import { colors } from './old-tokens';
const goldColor = colors.gold;
```

**After:**
```typescript
import { colors } from '@coast-academy/ui/tokens';
const goldColor = colors.brand.gold;
```

## Maintenance

### Adding New Tokens

1. Add to TypeScript interface in `src/tokens.ts`
2. Add to token values in `src/tokens.ts`
3. Add to TailwindCSS preset in `tailwind-preset.cjs`
4. Add tests for new tokens
5. Update documentation

### Modifying Existing Tokens

1. Update value in both `src/tokens.ts` and `tailwind-preset.cjs`
2. Run tests to ensure validation passes
3. Check for breaking changes in components
4. Update documentation if needed

## References

- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
