import { Activity } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn.js';

export interface OrderFlowRow {
  id: string;
  price: number;
  vol: number;
  side: 'bid' | 'ask';
}

interface LiveOrderFlowTapeProps {
  className?: string;
  maxRows?: number;
  basePrice?: number;
}

function formatPrice(price: number): string {
  return price.toFixed(4);
}

function formatVol(vol: number): string {
  if (vol >= 1000) {
    return vol.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return vol.toLocaleString('pt-BR');
}

function createTick(lastPrice: number): OrderFlowRow {
  const side: 'bid' | 'ask' = Math.random() > 0.48 ? 'bid' : 'ask';
  const step = side === 'bid' ? 0.0001 : -0.0001;
  const jitter = (Math.random() - 0.5) * 0.0008;
  const price = Math.max(
    5.18,
    Math.min(5.29, Math.round((lastPrice + step + jitter) * 10000) / 10000),
  );
  const vol = Math.floor(Math.random() * 2800) + 150;
  return { id: crypto.randomUUID(), price, vol, side };
}

function seedRows(basePrice: number, count: number): OrderFlowRow[] {
  let price = basePrice;
  return Array.from({ length: count }, () => {
    const row = createTick(price);
    price = row.price;
    return row;
  });
}

function FlowRow({ row, isNew }: { row: OrderFlowRow; isNew: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 font-mono text-xs border-b border-white/5 transition-colors duration-300',
        isNew && 'animate-slide-down bg-white/6',
        row.side === 'bid'
          ? 'shadow-[inset_3px_0_0_rgba(0,200,83,0.55)]'
          : 'shadow-[inset_3px_0_0_rgba(255,82,82,0.55)]',
      )}
    >
      <span
        className={cn(
          'font-bold tabular-nums w-[4.5rem]',
          row.side === 'bid' ? 'text-flow-bid' : 'text-flow-ask',
        )}
      >
        {formatPrice(row.price)}
      </span>
      <span className="flex-1 text-right text-white/45 tabular-nums">{formatVol(row.vol)}</span>
      <span
        className={cn(
          'text-[10px] font-bold uppercase w-4 text-center',
          row.side === 'bid' ? 'text-flow-bid' : 'text-flow-ask',
        )}
      >
        {row.side === 'bid' ? 'C' : 'V'}
      </span>
    </div>
  );
}

export function LiveOrderFlowTape({
  className,
  maxRows = 8,
  basePrice = 5.2458,
}: LiveOrderFlowTapeProps): JSX.Element {
  const [rows, setRows] = useState<OrderFlowRow[]>(() => seedRows(basePrice, maxRows));
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const lastPriceRef = useRef(basePrice);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pushTick = useCallback(() => {
    const tick = createTick(lastPriceRef.current);
    lastPriceRef.current = tick.price;

    setRows((prev) => [tick, ...prev.slice(0, maxRows - 1)]);
    setNewIds((prev) => new Set(prev).add(tick.id));

    window.setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(tick.id);
        return next;
      });
    }, 600);
  }, [maxRows]);

  useEffect(() => {
    let timerId = 0;

    const schedule = (): void => {
      const delay = 350 + Math.random() * 450;
      timerId = window.setTimeout(() => {
        pushTick();
        schedule();
      }, delay);
    };

    schedule();
    return () => window.clearTimeout(timerId);
  }, [pushTick]);

  const firstRowId = rows[0]?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [firstRowId]);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/8 bg-black/30 backdrop-blur-sm overflow-hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Activity size={11} className="text-brand-gold animate-pulse" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
            Fluxo de ordens
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-flow-bid font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-flow-bid animate-pulse" aria-hidden="true" />
          Ao vivo
        </span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-[220px] overflow-hidden"
        role="log"
        aria-live="polite"
        aria-label="Fluxo de ordens em tempo real"
      >
        {rows.map((row) => (
          <FlowRow key={row.id} row={row} isNew={newIds.has(row.id)} />
        ))}
      </div>
    </div>
  );
}
