import type { ReactNode } from 'react';

import { cn } from '@/lib/cn.js';

export type MarketBadgeVariant = 'gold' | 'bid' | 'ask' | 'neutral' | 'info';
export type MarketBadgeSize = 'sm' | 'md';

export interface MarketBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: MarketBadgeVariant;
  size?: MarketBadgeSize;
  pulse?: boolean;
  className?: string;
}

const variantClasses: Record<MarketBadgeVariant, string> = {
  gold: 'border-brand-gold/20 bg-brand-gold-muted text-brand-gold-soft',
  bid: 'border-flow-bid/30 bg-flow-bid/10 text-flow-bid',
  ask: 'border-flow-ask/30 bg-flow-ask/10 text-flow-ask',
  neutral: 'border-white/10 bg-white/5 text-white/50',
  info: 'border-state-info/30 bg-state-info/10 text-state-info',
};

const sizeClasses: Record<MarketBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
};

export function MarketBadge({
  children,
  icon,
  variant = 'gold',
  size = 'md',
  pulse = false,
  className,
}: MarketBadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
