import { formatPrice } from '@coast-academy/ui';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn.js';

export type PriceDisplaySize = 'sm' | 'md' | 'lg' | 'xl';

export interface PriceDisplayProps {
  value: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  size?: PriceDisplaySize;
  showChange?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeClasses: Record<PriceDisplaySize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

function flowTextClass(change: number | undefined): string {
  if (change === undefined || change === 0) return 'text-white/70';
  return change > 0 ? 'text-flow-bid' : 'text-flow-ask';
}

export function PriceDisplay({
  value,
  change,
  changePercent,
  currency = 'BRL',
  size = 'md',
  showChange = false,
  animate = false,
  className,
}: PriceDisplayProps): JSX.Element {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      prevRef.current = value;
      return;
    }
    const start = prevRef.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number): void => {
      const t = Math.min(1, (now - startTime) / duration);
      setDisplayValue(start + (end - start) * t);
      if (t < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };

    requestAnimationFrame(tick);
  }, [value, animate]);

  const colorClass = flowTextClass(change);

  return (
    <div className={cn('inline-flex flex-col gap-0.5', className)}>
      <span className={cn('font-mono font-semibold tabular-nums', sizeClasses[size], colorClass)}>
        {formatPrice(displayValue, undefined, currency)}
      </span>
      {showChange && change !== undefined && (
        <span className={cn('font-mono text-xs tabular-nums', colorClass)}>
          {change >= 0 ? '+' : ''}
          {formatPrice(change, 4, currency)}
          {changePercent !== undefined && (
            <span className="ml-1.5 opacity-80">
              ({changePercent >= 0 ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </span>
          )}
        </span>
      )}
    </div>
  );
}
