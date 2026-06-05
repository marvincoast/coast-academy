import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn.js';

export type StatTrend = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: StatTrend;
  trendValue?: string;
  highlight?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  highlight = false,
  loading = false,
  onClick,
  className,
}: StatCardProps): JSX.Element {
  const interactive = Boolean(onClick);

  if (loading) {
    return <div className={cn('skeleton h-32 rounded-2xl', className)} aria-busy="true" />;
  }

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : trend === 'neutral' ? Minus : null;

  const content = (
    <>
      <div
        className={cn(
          'mb-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200',
          highlight
            ? 'bg-brand-gold/20 text-brand-gold group-hover:bg-brand-gold/30'
            : 'bg-white/6 text-white/50 group-hover:bg-white/10 group-hover:text-white/70',
        )}
      >
        {icon}
      </div>
      <p className={cn('stat-number', highlight ? 'text-brand-gold' : 'text-white')}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-white/55">{label}</p>
      {subtitle && <p className="mt-0.5 text-xs text-white/25">{subtitle}</p>}
      {trend && trendValue && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1 text-xs font-medium',
            trend === 'up' && 'text-flow-bid',
            trend === 'down' && 'text-flow-ask',
            trend === 'neutral' && 'text-white/40',
          )}
        >
          {TrendIcon && <TrendIcon className="h-3 w-3" aria-hidden="true" />}
          {trendValue}
        </p>
      )}
    </>
  );

  const cardClass = cn(
    'group rounded-2xl border p-4 backdrop-blur-glass transition-all duration-200',
    'bg-bg-surface/80 border-white/8 shadow-card',
    highlight && 'border-brand-gold/25 bg-brand-gold-muted/50',
    interactive &&
      'cursor-pointer hover:border-brand-gold/25 hover:bg-bg-elevated/80 hover:shadow-card-hover hover:-translate-y-0.5',
    className,
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(cardClass, 'text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold')}
        aria-label={`${label}: ${value}`}
      >
        {content}
      </button>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
