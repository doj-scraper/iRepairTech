import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpRight, Boxes, ClipboardList, Clock3, ReceiptText, ShieldCheck, Truck } from 'lucide-react';
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
export const metadata: Metadata = {
  title: 'Dashboard | iRepair Technologies',
  description:
    'Review account history, active orders, and trade status inside the iRepair Technologies buyer dashboard.',
  keywords: 'customer dashboard, wholesale orders, repair parts account, Houston trade account',
  openGraph: {
    title: 'Dashboard | iRepair Technologies',
    description:
      'A buyer dashboard for wholesale repair parts, order history, and trade account continuity.',
    type: 'website',
  },
};

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
    supabase.from('profiles').select('id, email, role, created_at').eq('id', user.id).single(),
    supabase.from('orders').select('id, status, total_cents, accepted_terms, accepted_terms_at, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: false }),
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
            <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:px-10 lg:py-10">
              <div className="space-y-6">
                <Badge variant="accent">Customer history</Badge>
                <SectionHeading
                  eyebrow="Account dashboard"
                  title="Track purchasing history, active orders, and account standing from one branded surface."
                  description="The dashboard reads like a real customer portal, giving trade buyers quick visibility into spend, open orders, and account continuity."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: ClipboardList, label: 'Orders placed', value: String(customerOrders.length) },
                    { icon: ReceiptText, label: 'Lifetime spend', value: formatCurrency(totalSpend) },
                    { icon: Boxes, label: 'Open orders', value: String(activeOrders) },
                    { icon: Clock3, label: 'Member since', value: formatDate(customerProfile.created_at) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-primary text-primary-foreground shadow-elegant">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.22),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.1),transparent_48%)]" />
                  <Image
                    src="/iphone-screen-incell.png"
                    alt="Wholesale customer dashboard visual"
                    width={960}
                    height={720}
                    className="h-full w-full object-cover object-center opacity-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-primary/72 p-5 backdrop-blur-sm">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Buyer profile</p>
                        <p className="mt-1 break-words text-sm font-semibold">{customerProfile.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Role</p>
                        <p className="mt-1 text-sm font-semibold capitalize">{customerProfile.role}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Terms</p>
                        <p className="mt-1 text-sm font-semibold">
                          {latestTermsAcceptance ? 'Accepted' : 'Captured on checkout'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                    <Truck className="h-5 w-5 text-accent" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Fulfillment state</p>
                    <p className="mt-2 text-sm text-primary">Order history stays aligned with the operational workflow that follows payment.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Account continuity</p>
                    <p className="mt-2 text-sm text-primary">Purchasing records, role data, and dashboard access stay linked to the buyer profile.</p>
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
                    <h2 className="mt-2 section-title text-primary">Load another procurement batch.</h2>
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
