import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn.js';

interface LivePriceGridProps {
  className?: string;
  baseBid?: number;
  baseAsk?: number;
}

interface GridCell {
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}

function format4(n: number): string {
  return n.toFixed(4);
}

export function LivePriceGrid({
  className,
  baseBid = 5.2458,
  baseAsk = 5.2460,
}: LivePriceGridProps): JSX.Element {
  const [bid, setBid] = useState(baseBid);
  const [ask, setAsk] = useState(baseAsk);
  const [vol, setVol] = useState(142_300);
  const [max, setMax] = useState(5.2820);
  const [min, setMin] = useState(5.1890);
  const [flashBid, setFlashBid] = useState(false);
  const [flashAsk, setFlashAsk] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBid((prev) => {
        const next = Math.max(5.18, Math.min(5.29, prev + (Math.random() - 0.48) * 0.0006));
        setFlashBid(true);
        window.setTimeout(() => setFlashBid(false), 300);
        setMax((m) => Math.max(m, next));
        setMin((m) => Math.min(m, next));
        return Math.round(next * 10000) / 10000;
      });
      setAsk((prev) => {
        const next = Math.max(5.18, Math.min(5.29, prev + (Math.random() - 0.52) * 0.0006));
        setFlashAsk(true);
        window.setTimeout(() => setFlashAsk(false), 300);
        return Math.round(next * 10000) / 10000;
      });
      setVol((prev) => prev + Math.floor(Math.random() * 800) + 50);
    }, 900);

    return () => window.clearInterval(id);
  }, []);

  const mid = (bid + ask) / 2;
  const varPct = ((mid - baseBid) / baseBid) * 100;
  const varStr = `${varPct >= 0 ? '+' : ''}${varPct.toFixed(2)}%`;

  const cells: GridCell[] = [
    { label: 'BID', value: format4(bid), color: 'text-flow-bid', pulse: flashBid },
    { label: 'ASK', value: format4(ask), color: 'text-flow-ask', pulse: flashAsk },
    { label: 'MÁX', value: format4(max), color: 'text-white/70' },
    { label: 'MÍN', value: format4(min), color: 'text-white/70' },
    { label: 'VOL', value: vol >= 1000 ? `${(vol / 1000).toFixed(1)}K` : String(vol), color: 'text-brand-gold' },
    { label: 'VAR', value: varStr, color: varPct >= 0 ? 'text-flow-bid' : 'text-flow-ask' },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn(
            'rounded-xl border border-white/8 bg-white/4 p-2.5 backdrop-blur-sm transition-all duration-300',
            cell.pulse && cell.label === 'BID' && 'border-flow-bid/30 bg-flow-bid/8 scale-[1.02]',
            cell.pulse && cell.label === 'ASK' && 'border-flow-ask/30 bg-flow-ask/8 scale-[1.02]',
          )}
        >
          <p className="text-[9px] uppercase tracking-widest text-white/35 mb-0.5">{cell.label}</p>
          <p className={cn('font-mono text-sm font-bold tabular-nums', cell.color)}>{cell.value}</p>
        </div>
      ))}
    </div>
  );
}
