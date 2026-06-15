import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn.js';

export type GlassCardVariant = 'default' | 'elevated' | 'gold' | 'interactive';
export type GlassCardDepth = 'surface' | 'elevated' | 'overlay';

export interface GlassCardProps {
  children: ReactNode;
  variant?: GlassCardVariant;
  depth?: GlassCardDepth;
  hover?: boolean;
  className?: string;
  as?: ElementType;
}

const depthClasses: Record<GlassCardDepth, string> = {
  surface: 'bg-bg-surface/80 border-white/8',
  elevated: 'bg-bg-elevated/80 border-white/10',
  overlay: 'bg-bg-overlay/90 border-white/12',
};

export function GlassCard({
  children,
  variant = 'default',
  depth = 'surface',
  hover = false,
  className,
  as: Component = 'div',
}: GlassCardProps): JSX.Element {
  return (
    <Component
      className={cn(
        'rounded-2xl border backdrop-blur-glass transition-all duration-300',
        depthClasses[depth],
        variant === 'gold' && 'border-brand-gold/20 bg-gradient-gold-subtle shadow-card',
        variant === 'elevated' && 'shadow-card-hover',
        variant === 'interactive' && 'cursor-pointer',
        variant === 'default' && 'shadow-card',
        hover &&
          'hover:border-brand-gold/25 hover:bg-bg-elevated/80 hover:shadow-card-hover hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </Component>
  );
}
