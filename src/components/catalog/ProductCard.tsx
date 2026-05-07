'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ProductCardProps = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  stockCount?: number;
  uiIntent?: 'success' | 'warning' | 'danger' | 'neutral';
  type: 'part' | 'service';
  onAddToCart: () => void;
  disabled?: boolean;
};

const intentToBadgeVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  neutral: 'secondary',
};

export function ProductCard({
  name,
  description,
  priceCents,
  imageUrl,
  stockCount,
  uiIntent = 'neutral',
  type,
  onAddToCart,
  disabled = false,
}: ProductCardProps) {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const stockLabel = type === 'part' 
    ? stockCount && stockCount > 0 
      ? `${stockCount} in stock` 
      : 'Out of stock'
    : null;

  return (
    <Card className="flex flex-col">
      {imageUrl && (
        <div className="aspect-[4/3] w-full overflow-hidden border-b border-border">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold leading-tight">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-end pb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(priceCents)}
          </span>
          {stockLabel && (
            <Badge variant={intentToBadgeVariant[uiIntent]}>
              {stockLabel}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={onAddToCart}
          disabled={disabled || (type === 'part' && (stockCount === 0 || stockCount === undefined))}
          className="w-full"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
