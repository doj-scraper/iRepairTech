import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Boxes, ClipboardList, ReceiptText, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SectionHeading } from '@/components/brand/SectionHeading';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { Order, Profile } from '@/lib/database.types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const [
    { data: profile, error: profileError },
    { data: orders, error: ordersError },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (ordersError) {
    throw ordersError;
  }

  const customerProfile = profile as Profile;
  const customerOrders = (orders ?? []) as Order[];
  const activeOrders = customerOrders.filter((order) => order.status === 'pending' || order.status === 'paid').length;
  const totalSpend = customerOrders.reduce((sum, order) => sum + order.total_cents, 0);
  const latestTermsAcceptance = customerOrders.find((order) => order.accepted_terms_at)?.accepted_terms_at;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-6 py-8 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-12">
              <div className="space-y-6">
                <Badge variant="accent">Customer history</Badge>
                <SectionHeading
                  eyebrow="Account dashboard"
                  title="Track purchasing history, active orders, and account standing from one branded surface."
                  description="The dashboard now feels like part of a credible trade operation instead of a placeholder account page."
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ClipboardList, label: 'Orders placed', value: String(customerOrders.length) },
                    { icon: ReceiptText, label: 'Lifetime spend', value: formatCurrency(totalSpend) },
                    { icon: Boxes, label: 'Open orders', value: String(activeOrders) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-hairline/80 bg-gradient-to-br from-primary/95 via-primary to-accent/70 p-6 text-primary-foreground shadow-glow">
                <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Buyer profile</p>
                <p className="mt-3 font-display text-3xl">{customerProfile.email}</p>
                <div className="mt-8 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Member since</p>
                    <p className="mt-1 text-sm">{formatDate(customerProfile.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Account type</p>
                    <p className="mt-1 text-sm capitalize">{customerProfile.role}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Latest terms acceptance</p>
                    <p className="mt-1 text-sm">
                      {latestTermsAcceptance ? formatDateTime(latestTermsAcceptance) : 'Captured on next checkout'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-primary-foreground/80" />
                    <p className="text-sm text-primary-foreground/80">
                      Dashboard access is now protected by middleware so account history stays behind authenticated routes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {customerOrders.length === 0 ? (
            <EmptyState
              title="No customer history yet."
              description="Place your first order to populate procurement history, terms acceptance, and order status tracking."
              action={
                <Button asChild>
                  <Link href="/shop/catalog">Browse catalog</Link>
                </Button>
              }
            />
          ) : (
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Order history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="rounded-[1.6rem] border border-hairline/70 bg-secondary/35 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-sm text-primary">{order.id.slice(0, 12)}</p>
                            <OrderStatusBadge order={order} />
                            {order.accepted_terms ? <Badge variant="accent">Terms accepted</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDateTime(order.created_at)} • Updated {formatDateTime(order.updated_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">{formatCurrency(order.total_cents)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.6rem] border border-hairline/70 bg-secondary/35 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catalog refresh</p>
                    <h2 className="mt-2 font-display text-2xl text-primary">Load another procurement batch.</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Return to the merchandised catalog and keep the customer journey inside the same premium-industrial system.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/shop/catalog">
                        Open catalog
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="rounded-[1.6rem] border border-hairline/70 bg-secondary/35 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile note</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Customer accounts are provisioned with a profile record during sign-in or sign-up, which keeps history, roles, and dashboard continuity connected to Supabase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
