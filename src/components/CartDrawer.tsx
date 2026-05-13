'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/ui/price-display';
import { cn } from '@/lib/utils';
import { QuantitySelector } from '@/components/ui/quantity-selector';

export type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const clear = useCart((s) => s.clear);

  const total = items.reduce((sum, i) => sum + i.quantity * i.price_cents, 0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-primary/35 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/70 bg-background/95 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border/70 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary text-primary-foreground shadow-elegant">
                  <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Wholesale Cart
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-primary">Order Builder</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-smooth hover:border-accent/30 hover:text-primary"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Review your parts, confirm volume, and move straight into checkout.
              </p>
              {items.length > 0 ? <Badge variant="secondary">{items.length} items</Badge> : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="shell-frame flex h-full items-center justify-center">
                <div className="shell-core flex h-full w-full flex-col items-center justify-center px-8 py-12 text-center">
                  <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/40" strokeWidth={1.5} />
                  <p className="font-display text-2xl font-semibold text-primary">Your cart is empty</p>
                  <p className="mb-6 mt-2 text-sm text-muted-foreground/80">
                    Add a few parts or service items to start building a wholesale order.
                  </p>
                  <Button onClick={onClose} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={`${item.id}-${item.type}`} className="overflow-hidden border-border/70 bg-card/95">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={item.type === 'part' ? 'accent' : 'secondary'}>
                              {item.type}
                            </Badge>
                            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                              Line Item
                            </span>
                          </div>
                          <p className="mt-3 font-display text-xl font-semibold text-primary">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Unit price <PriceDisplay cents={item.price_cents} size="sm" className="ml-1 inline-flex" />
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.type)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-smooth hover:border-destructive/30 hover:text-destructive"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(quantity) => updateQuantity(item.id, item.type, quantity)}
                          className="gap-2"
                        />
                        <PriceDisplay cents={item.quantity * item.price_cents} size="md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border/70 p-6">
              <div className="shell-frame">
                <div className="shell-core p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Ready to Checkout
                      </p>
                      <p className="font-display text-2xl font-semibold text-primary">Order Total</p>
                    </div>
                    <PriceDisplay cents={total} size="lg" />
                  </div>

                  <Button asChild className="w-full" size="lg" onClick={onClose}>
                    <Link href="/checkout">Proceed to Payment</Link>
                  </Button>

                  <button
                    onClick={() => {
                      clear();
                      onClose();
                    }}
                    className="mt-4 w-full rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
