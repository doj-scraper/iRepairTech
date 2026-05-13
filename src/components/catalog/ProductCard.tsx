'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PriceDisplay } from '@/components/ui/price-display';

export type ProductCardProps = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  stockCount?: number;
  uiIntent?: 'success' | 'warning' | 'danger' | 'neutral';
  type: 'part' | 'service';
  moq?: number;
  sku?: string;
  estimatedHours?: number | null;
  onAddToCart: () => void;
  disabled?: boolean;
};

const intentToBadgeVariant: Record<NonNullable<ProductCardProps['uiIntent']>, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  neutral: 'secondary',
};

function getStockLabel(stockCount?: number) {
  if (stockCount === undefined) {
    return 'Made to order';
  }

  if (stockCount === 0) {
    return 'Out of stock';
  }

  if (stockCount <= 12) {
    return `${stockCount} left`;
  }

  return `${stockCount}+ in stock`;
}

export function ProductCard({
  name,
  description,
  priceCents,
  imageUrl,
  stockCount,
  uiIntent = 'neutral',
  type,
  moq = 1,
  sku,
  estimatedHours,
  onAddToCart,
  disabled = false,
}: ProductCardProps) {
  const inventoryLabel = type === 'part' ? getStockLabel(stockCount) : `${estimatedHours ?? 2} hr turnaround`;
  const isUnavailable = disabled || (type === 'part' && (stockCount === 0 || stockCount === undefined));
  const features = type === 'part'
    ? ['Bench tested', 'Bulk ready', `MOQ ${moq}`]
    : ['Booked service', `${estimatedHours ?? 2} hr estimate`, 'Status tracked'];

  return (
    <div className="group shell-frame h-full transition-smooth hover:-translate-y-1 hover:shadow-glow">
      <div className="shell-core flex h-full flex-col gap-4 p-4 md:p-5">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-border/70 bg-primary text-primary-foreground">
          <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap gap-2 px-4 py-4">
            <Badge variant={intentToBadgeVariant[uiIntent]}>{inventoryLabel}</Badge>
            <Badge variant="accent">{type === 'part' ? 'Parts inventory' : 'Service lane'}</Badge>
          </div>
          <div className="relative aspect-[4/3]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${name} product image`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-smooth group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-end bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.34),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] p-4">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                  {sku ?? 'Trade sku'}
                </span>
                <p className="mt-2 max-w-[11rem] font-display text-2xl font-semibold leading-tight tracking-[-0.05em]">
                  {name}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {type === 'part' ? 'Houston stocked' : 'Workflow ready'}
            </span>
            {sku ? <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{sku}</span> : null}
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.05em] text-primary">{name}</h3>
            {description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Built for wholesale repair workflows with a cleaner merchandising frame and stronger trade cues.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/70 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {type === 'part' ? 'Per unit' : 'Service rate'}
            </p>
            <PriceDisplay cents={priceCents} size="lg" />
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>MOQ {moq}</p>
            <p>{type === 'part' ? 'Trade inventory' : 'Repair workflow'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button onClick={onAddToCart} disabled={isUnavailable} className="w-full">
            {isUnavailable ? 'Unavailable' : 'Add to Cart'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Quick View
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-border/70 bg-card p-0 sm:max-w-2xl">
              <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-[260px] overflow-hidden rounded-t-[2rem] bg-primary md:rounded-l-[2rem] md:rounded-tr-none">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${name} detail view`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.34),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] p-6 text-primary-foreground">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">{sku ?? 'Trade sku'}</p>
                        <p className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.05em]">{name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <DialogHeader className="text-left">
                    <DialogTitle className="font-display text-3xl font-semibold tracking-[-0.05em] text-primary">
                      {name}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                      {description ?? 'A premium-industrial product presentation designed for high-trust wholesale catalogs.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={intentToBadgeVariant[uiIntent]}>{inventoryLabel}</Badge>
                      <Badge variant="accent">{type === 'part' ? 'Bulk eligible' : 'Service tracked'}</Badge>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-secondary/40 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trade pricing</p>
                      <PriceDisplay cents={priceCents} size="lg" className="mt-2 block" />
                      <p className="mt-2 text-sm text-muted-foreground">MOQ {moq} · {type === 'part' ? 'Houston stocked' : 'Customer device workflow'}</p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {features.map((feature) => (
                        <p key={feature}>• {feature}</p>
                      ))}
                    </div>

                    <Button onClick={onAddToCart} disabled={isUnavailable} className="w-full">
                      {isUnavailable ? 'Unavailable' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
