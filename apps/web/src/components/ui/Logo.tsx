import { cn } from '@/lib/cn.js';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'h-7 w-7 text-sm', title: 'text-sm', sub: 'text-[10px]' },
  md: { icon: 'h-9 w-9 text-base', title: 'text-base', sub: 'text-xs' },
  lg: { icon: 'h-14 w-14 text-xl', title: 'text-2xl', sub: 'text-sm' },
};

/**
 * Logo Coast Academy: monograma "CA" em box dourado + wordmark opcional.
 */
export function Logo({ size = 'md', variant = 'full', className }: LogoProps): JSX.Element {
  const cfg = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Monograma */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-brand-gold/60 bg-brand-gold/10 font-mono font-bold text-brand-gold shrink-0',
          cfg.icon,
        )}
        aria-hidden="true"
      >
        CA
      </div>

      {/* Wordmark */}
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-display font-semibold text-white tracking-tight', cfg.title)}>
            Coast
          </span>
          <span className={cn('font-mono text-brand-gold/80 tracking-widest uppercase', cfg.sub)}>
            Academy
          </span>
        </div>
      )}
    </div>
  );
}
