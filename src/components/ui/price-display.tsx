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
  const dollars = Math.floor(cents / 100);
  const remainingCents = cents % 100;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl font-bold',
    lg: 'text-3xl font-bold',
  };

  const centSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <span className={cn(sizeClasses[size], className)}>
      ${dollars}
      {showCents && (
        <span className={cn(centSizeClasses[size], 'text-muted-foreground')}>
          .{remainingCents.toString().padStart(2, '0')}
        </span>
      )}
    </span>
  );
}
