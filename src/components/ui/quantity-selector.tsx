'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  className,
  disabled = false,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      
      <span className="w-10 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      
      <button
        type="button"
        onClick={increase}
        disabled={disabled || (max !== undefined && value >= max)}
        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
