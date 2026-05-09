'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck2, ShieldCheck, Truck } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceDisplay } from '@/components/ui/price-display';
import { useCart } from '@/store/cart';
import type { QuotedItem } from '@/types/dtos/checkout.dto';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [quotedItems, setQuotedItems] = useState<QuotedItem[]>([]);
  const [quotedTotalCents, setQuotedTotalCents] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchProfileEmail = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled && user?.email) {
        setEmail(user.email);
      }
    };

    fetchProfileEmail();

    return () => {
      cancelled = true;
    };
  }, []);

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
      const supabase = getSupabaseClient();

      try {
        const partIds = items.filter((item) => item.type === 'part').map((item) => item.id);
        const serviceIds = items.filter((item) => item.type === 'service').map((item) => item.id);

        const [partsRes, servicesRes] = await Promise.all([
          partIds.length > 0
            ? supabase
                .from('inventory_parts')
                .select('id, name, price_cents, stock_count')
                .in('id', partIds)
            : Promise.resolve({ data: [] }),
          serviceIds.length > 0
            ? supabase
                .from('repair_services')
                .select('id, name, price_cents')
                .in('id', serviceIds)
            : Promise.resolve({ data: [] }),
        ]);

        const nextQuotedItems: QuotedItem[] = items.map((item) => {
          if (item.type === 'part') {
            const part = partsRes.data?.find((entry) => entry.id === item.id);
            return {
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              name: part?.name || item.name,
              price_cents: part?.price_cents || item.price_cents,
              stock_count: part?.stock_count,
            };
          }

          const service = servicesRes.data?.find((entry) => entry.id === item.id);
          return {
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            name: service?.name || item.name,
            price_cents: service?.price_cents || item.price_cents,
          };
        });

        const total = nextQuotedItems.reduce(
          (sum, item) => sum + item.price_cents * item.quantity,
          0,
        );

        if (!cancelled) {
          setQuotedItems(nextQuotedItems);
          setQuotedTotalCents(total);
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

  const summary = useMemo(() => {
    return {
      partLines: quotedItems.filter((item) => item.type === 'part').length,
      serviceLines: quotedItems.filter((item) => item.type === 'service').length,
      units: quotedItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [quotedItems]);

  const handleCheckout = async () => {
    if (!email) {
      setError('A contact email is required before checkout.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the purchasing terms before continuing to Stripe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email, acceptedTerms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout initialization failed.');
      }

      clear();
      window.location.href = data.url;
    } catch (checkoutError: unknown) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to begin checkout.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="px-4 py-10 md:px-6 md:py-14">
          <div className="container">
            <EmptyState
              title="Your dispatch cart is empty."
              description="Load parts or service items into the cart before sending this order to payment."
              action={
                <Button asChild>
                  <Link href="/shop/catalog">Browse catalog</Link>
                </Button>
              }
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-6 py-8 md:grid-cols-[1.08fr_0.92fr] md:px-10 md:py-10">
              <div className="space-y-5">
                <Badge variant="accent">Checkout corridor</Badge>
                <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] text-primary md:text-6xl">
                  Confirm your procurement batch before Stripe handoff.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  This template now treats checkout like a wholesale workflow: live-authoritative pricing, inventory-aware parts, and explicit purchasing-term capture before payment.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, title: 'Authoritative pricing', body: 'Live prices are re-quoted from Supabase before checkout starts.' },
                    { icon: FileCheck2, title: 'Terms captured', body: 'The order stores accepted purchasing terms and a version marker.' },
                    { icon: Truck, title: 'Customer-ready follow-through', body: 'Successful payment drops the buyer into a stronger post-order experience.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <h2 className="mt-4 font-semibold text-primary">{item.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-hairline/80 bg-gradient-to-br from-primary/95 via-primary to-accent/75 p-6 text-primary-foreground shadow-glow">
                <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Order snapshot</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Line items', value: String(quotedItems.length) },
                    { label: 'Units', value: String(summary.units) },
                    { label: 'Quote total', value: quoteLoading ? 'Calculating…' : `$${(quotedTotalCents / 100).toFixed(2)}` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-primary-foreground/75">
                  Parts: {summary.partLines} • Services: {summary.serviceLines}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="shell-frame">
              <div className="shell-core px-6 py-8 md:px-8 md:py-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Quoted batch</p>
                    <h2 className="mt-2 font-display text-3xl text-primary">Order summary</h2>
                  </div>
                  <Badge variant="outline">Live inventory pull</Badge>
                </div>

                <div className="space-y-3">
                  {quoteLoading ? (
                    <p className="text-sm text-muted-foreground">Revalidating pricing and availability…</p>
                  ) : (
                    quotedItems.map((item) => (
                      <div key={`${item.id}-${item.type}`} className="rounded-[1.6rem] border border-hairline/70 bg-secondary/35 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-primary">{item.name}</p>
                              <Badge variant={item.type === 'part' ? 'accent' : 'secondary'}>{item.type}</Badge>
                              {'stock_count' in item && typeof item.stock_count === 'number' ? (
                                <Badge variant={item.stock_count <= 3 ? 'warning' : 'success'}>
                                  {item.stock_count} in stock
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">Quantity {item.quantity}</p>
                          </div>
                          <PriceDisplay cents={item.quantity * item.price_cents} size="sm" />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[1.6rem] border border-hairline/80 bg-background/80 px-5 py-4">
                  <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Order total</span>
                  <PriceDisplay cents={quotedTotalCents} size="lg" />
                </div>
              </div>
            </div>

            <div className="shell-frame">
              <div className="shell-core px-6 py-8 md:px-8 md:py-8">
                <div className="mb-6 space-y-3">
                  <Badge variant="outline">Buyer details</Badge>
                  <h2 className="font-display text-3xl text-primary">Confirm contact and terms.</h2>
                  <p className="text-sm text-muted-foreground">
                    The checkout request will reserve inventory, create a draft order, and then forward the customer to Stripe.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-email">Billing email</Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="buyer@irepairtechnologies.com"
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-[1.4rem] border border-hairline/70 bg-secondary/35 px-4 py-4">
                    <input
                      checked={acceptedTerms}
                      className="mt-1 h-4 w-4 rounded border-hairline bg-background accent-[color:var(--accent)]"
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm text-muted-foreground">
                      I accept the current wholesale purchasing terms, MOQ requirements, and fulfillment conditions for this order batch.
                    </span>
                  </label>

                  {error ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <Button className="w-full" loading={loading} onClick={handleCheckout} size="lg">
                    Proceed to Stripe
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>

                  <Link className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-primary" href="/shop/catalog">
                    Return to catalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
