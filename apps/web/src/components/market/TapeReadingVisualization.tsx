import { formatPrice } from '@coast-academy/ui';
import { memo } from 'react';

import { cn } from '@/lib/cn.js';

export interface TapeEntry {
  id: string;
  timestamp: Date;
  price: number;
  volume: number;
  side: 'bid' | 'ask';
  isAggressive: boolean;
}

export type TapeVariant = 'compact' | 'detailed';

export interface TapeReadingVisualizationProps {
  data: TapeEntry[];
  maxEntries?: number;
  highlightThreshold?: number;
  variant?: TapeVariant;
  className?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function TapeRow({
  entry,
  highlightThreshold,
  variant,
  index,
}: {
  entry: TapeEntry;
  highlightThreshold: number;
  variant: TapeVariant;
  index: number;
}): JSX.Element {
  const highlighted = entry.volume >= highlightThreshold;
  const fadeOpacity = Math.max(0.35, 1 - index * 0.04);

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-white/5 px-2 py-1.5 font-mono text-xs animate-slide-down',
        highlighted && 'bg-brand-gold/8',
      )}
      style={{ opacity: fadeOpacity }}
    >
      {variant === 'detailed' && (
        <span className="w-20 shrink-0 text-white/35 tabular-nums">{formatTime(entry.timestamp)}</span>
      )}
      <span
        className={cn(
          'w-20 font-semibold tabular-nums',
          entry.side === 'bid' ? 'text-flow-bid' : 'text-flow-ask',
        )}
      >
        {formatPrice(entry.price, 4)}
      </span>
      <span className="flex-1 text-right tabular-nums text-white/70">{entry.volume.toLocaleString('pt-BR')}</span>
      <span
        className={cn(
          'w-8 text-center text-[10px] font-bold uppercase',
          entry.side === 'bid' ? 'text-flow-bid' : 'text-flow-ask',
        )}
      >
        {entry.side === 'bid' ? 'C' : 'V'}
      </span>
      {variant === 'detailed' && entry.isAggressive && (
        <span className="text-[10px] text-brand-gold-soft">AGG</span>
      )}
    </div>
  );
}

export const TapeReadingVisualization = memo(function TapeReadingVisualization({
  data,
  maxEntries = 20,
  highlightThreshold = 1000,
  variant = 'detailed',
  className,
}: TapeReadingVisualizationProps): JSX.Element {
  const entries = data.slice(0, maxEntries);

  return (
    <div
      className={cn('max-h-64 overflow-y-auto rounded-lg border border-white/8 bg-bg-base/50', className)}
      role="log"
      aria-label="Fluxo de ordens — tape reading"
    >
      {entries.length === 0 ? (
        <p className="p-4 text-center text-xs text-white/40">Sem negócios no momento</p>
      ) : (
        entries.map((entry, index) => (
          <TapeRow
            key={entry.id}
            entry={entry}
            highlightThreshold={highlightThreshold}
            variant={variant}
            index={index}
          />
        ))
      )}
    </div>
  );
});
