import { formatPrice } from '@coast-academy/ui';

import { cn } from '@/lib/cn.js';

export type MarketTickerSpeed = 'slow' | 'normal' | 'fast';
export type MarketTickerVariant = 'default' | 'compact';

export interface MarketTickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: Date;
}

export interface MarketTickerProps {
  items: MarketTickerItem[];
  speed?: MarketTickerSpeed;
  variant?: MarketTickerVariant;
  className?: string;
}

const speedClass: Record<MarketTickerSpeed, string> = {
  slow: 'animate-slide-left-slow',
  normal: 'animate-slide-left-tape',
  fast: 'animate-slide-left-fast',
};

export function MarketTicker({
  items,
  speed = 'normal',
  variant = 'default',
  className,
}: MarketTickerProps): JSX.Element {
  const doubled = [...items, ...items];

  return (
    <div
      className={cn('overflow-hidden border-b border-white/8 bg-bg-surface/80', className)}
      role="region"
      aria-label="Cotações de mercado em tempo real"
      aria-live="polite"
    >
      <div className={cn('flex whitespace-nowrap will-change-transform', speedClass[speed])}>
        {doubled.map((item, i) => {
          const positive = item.change >= 0;
          return (
            <div
              key={`${item.symbol}-${i}`}
              className={cn(
                'inline-flex shrink-0 items-center gap-3 px-6',
                variant === 'compact' ? 'py-1.5 text-[11px]' : 'py-2 text-xs',
              )}
            >
              <span className="font-semibold text-white/70">{item.symbol}</span>
              <span className="font-mono font-medium tabular-nums text-white">
                {formatPrice(item.price, 4)}
              </span>
              <span
                className={cn(
                  'font-mono tabular-nums',
                  positive ? 'text-flow-bid' : 'text-flow-ask',
                )}
              >
                {positive ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
              {item.volume !== undefined && variant !== 'compact' && (
                <span className="font-mono text-white/30 tabular-nums">
                  Vol {item.volume.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
