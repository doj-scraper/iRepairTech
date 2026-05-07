
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/ui/price-display';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

type QuotedItem = {
  id: string;
  type: 'part' | 'service';
  quantity: number;
  name: string;
  price_cents: number;
};

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quotedItems, setQuotedItems] = useState<QuotedItem[]>([]);
  const [quotedTotalCents, setQuotedTotalCents] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchQuote = async () => {
      if (items.length === 0) {
        setQuotedItems([]);
        setQuotedTotalCents(0);
        setQuoteLoading(false);
        return;
      }

      setQuoteLoading(true);

      try {
        const partIds = items
          .filter((i) => i.type === 'part')
          .map((i) => i.id);
        const serviceIds = items
          .filter((i) => i.type === 'service')
          .map((i) => i.id);

        const [partsRes, servicesRes] = await Promise.all([
          partIds.length > 0
            ? supabaseClient
                .from('inventory_parts')
                .select('id, name, price_cents')
                .in('id', partIds)
            : Promise.resolve({ data: [] }),
          serviceIds.length > 0
            ? supabaseClient
                .from('repair_services')
                .select('id, name, price_cents')
                .in('id', serviceIds)
            : Promise.resolve({ data: [] }),
        ]);

        const nextQuotedItems = items.map((item) => {
          if (item.type === 'part') {
            const part = partsRes.data?.find((p) => p.id === item.id);
            return {
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              name: part?.name || item.id,
              price_cents: part?.price_cents || 0,
            };
          }

          const service = servicesRes.data?.find((s) => s.id === item.id);
          return {
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            name: service?.name || item.id,
            price_cents: service?.price_cents || 0,
          };
        });

        const nextTotalCents = nextQuotedItems.reduce(
          (sum, item) => sum + item.price_cents * item.quantity,
          0
        );

        if (!cancelled) {
          setQuotedItems(nextQuotedItems);
          setQuotedTotalCents(nextTotalCents);
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const handleCheckout = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      clear();
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <h1 className="mb-8 text-3xl font-display font-bold">Checkout</h1>
          <EmptyState
            title="Your cart is empty"
            description="Add some items to your cart to continue with checkout."
            action={
              <Link href="/shop/catalog">
                <Button>Browse Catalog</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-display font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteLoading ? (
                <p className="text-muted-foreground">Calculating prices...</p>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {quotedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <PriceDisplay cents={item.quantity * item.price_cents} size="sm" />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <PriceDisplay cents={quotedTotalCents} size="lg" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  error={!!error && !email}
                />
              </div>

              {error && (
                <Badge variant="destructive" className="text-sm">
                  {error}
                </Badge>
              )}

              <Button
                onClick={handleCheckout}
                loading={loading}
                className="w-full"
                size="lg"
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

