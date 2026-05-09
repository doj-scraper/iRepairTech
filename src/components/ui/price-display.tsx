import { cn } from '@/lib/utils';

export type PriceDisplayProps = {
  cents: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCents?: boolean;
};

export function PriceDisplay({
  cents,
  className,
  size = 'md',
  showCents = true,
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl font-semibold',
    lg: 'text-3xl font-semibold',
  };

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(cents / 100);

  return (
    <span className={cn('tabular-nums text-primary', sizeClasses[size], className)}>{formatted}</span>
  );
}
