import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn.js';

export type ProgressBarVariant = 'default' | 'gold' | 'bid' | 'ask';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  animate?: boolean;
  className?: string;
}

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const fillClasses: Record<ProgressBarVariant, string> = {
  default: 'bg-gradient-to-r from-white/30 to-white/50',
  gold: 'bg-gradient-to-r from-brand-gold to-brand-gold-soft',
  bid: 'bg-flow-bid',
  ask: 'bg-flow-ask',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'gold',
  size = 'md',
  animate = false,
  className,
}: ProgressBarProps): JSX.Element {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const [width, setWidth] = useState(animate ? 0 : percentage);

  useEffect(() => {
    if (!animate) {
      setWidth(percentage);
      return;
    }
    const id = requestAnimationFrame(() => setWidth(percentage));
    return () => cancelAnimationFrame(id);
  }, [animate, percentage]);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/40">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-mono font-semibold text-brand-gold tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progresso: ${Math.round(percentage)}%`}
        className={cn('w-full overflow-hidden rounded-full bg-white/6', sizeClasses[size])}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            fillClasses[variant],
            animate && 'animate-progress-fill',
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
