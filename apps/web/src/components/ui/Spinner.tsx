import { cn } from '@/lib/cn.js';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps): JSX.Element {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block animate-spin rounded-full border-brand-gold border-t-transparent',
        sizeMap[size],
        className,
      )}
    />
  );
}

export function FullPageSpinner(): JSX.Element {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-base">
      <Spinner size="lg" />
    </div>
  );
}
