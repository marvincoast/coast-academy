import { cn } from '@/lib/cn.js';

type BadgeVariant = 'bid' | 'ask' | 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  bid: 'bg-flow-bid-subtle text-flow-bid border-flow-bid/30',
  ask: 'bg-flow-ask-subtle text-flow-ask border-flow-ask/30',
  neutral: 'bg-white/8 text-white/60 border-white/10',
  gold: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
  success: 'bg-state-success/15 text-state-success border-state-success/30',
  warning: 'bg-state-warning/15 text-state-warning border-state-warning/30',
  danger: 'bg-state-danger/15 text-state-danger border-state-danger/30',
  info: 'bg-state-info/15 text-state-info border-state-info/30',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
