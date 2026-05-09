'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  Mail,
  PackageCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SectionHeading } from '@/components/brand/SectionHeading';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
  ContactSubmission,
  InventoryPart,
  Order,
  Profile,
  RepairService,
} from '@/lib/database.types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { createClient } from '@/lib/supabase/client';

type AdminBoardProps = {
  adminEmail: string;
  parts: InventoryPart[];
  services: RepairService[];
  orders: Order[];
  customers: Profile[];
  contactSubmissions: ContactSubmission[];
};

type InventoryRowProps = {
  part: InventoryPart;
  onSaved: (partId: string, stockCount: number) => void;
  onFailed: (message: string) => void;
};

function InventoryRow({ part, onSaved, onFailed }: InventoryRowProps) {
  const [stockCount, setStockCount] = useState(part.stock_count);
  const [saving, setSaving] = useState(false);
  const semanticPart = mapInventoryPart({ ...part, stock_count: stockCount });

  const saveStock = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('inventory_parts')
      .update({ stock_count: stockCount })
      .eq('id', part.id);

    if (error) {
      onFailed(error.message);
      setSaving(false);
      return;
    }

    onSaved(part.id, stockCount);
    setSaving(false);
  };

  return (
    <div className="shell-frame">
      <div className="shell-core grid gap-4 p-5 md:grid-cols-[1.4fr_0.9fr_0.7fr_auto] md:items-center">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{part.sku}</p>
          <h3 className="font-display text-lg text-primary">{part.name}</h3>
          <p className="text-sm text-muted-foreground">
            {part.description || 'Core stocked for wholesale replenishment and bench builds.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">MOQ {part.moq}</Badge>
          <Badge variant={semanticPart.ui_state === 'warning' ? 'warning' : semanticPart.ui_state === 'danger' ? 'destructive' : 'success'}>
            {semanticPart.ui_state === 'danger'
              ? 'Out of stock'
              : semanticPart.ui_state === 'warning'
                ? 'Low stock'
                : 'Available'}
          </Badge>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor={`stock-${part.id}`}>
            On-hand stock
          </label>
          <Input
            id={`stock-${part.id}`}
            min={0}
            type="number"
            value={stockCount}
            onChange={(event) => setStockCount(Math.max(0, Number(event.target.value) || 0))}
          />
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-sm font-semibold text-primary">{formatCurrency(part.price_cents)}</p>
          <Button onClick={saveStock} loading={saving} size="sm">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminBoard({
  adminEmail,
  parts,
  services,
  orders,
  customers,
  contactSubmissions,
}: AdminBoardProps) {
  const [inventory, setInventory] = useState(parts);
  const [error, setError] = useState('');

  const metrics = useMemo(() => {
    const lowStockCount = inventory.filter((part) => mapInventoryPart(part).ui_state !== 'neutral').length;
    const openOrders = orders.filter((order) => order.status === 'pending' || order.status === 'paid').length;
    const revenuePipeline = orders.reduce((sum, order) => sum + order.total_cents, 0);

    return {
      activeSkus: inventory.filter((part) => part.is_active).length,
      lowStockCount,
      openOrders,
      revenuePipeline,
    };
  }, [inventory, orders]);

  const updateInventory = (partId: string, stockCount: number) => {
    setInventory((current) =>
      current.map((part) => (part.id === partId ? { ...part, stock_count: stockCount } : part)),
    );
    setError('');
  };

  const watchlist = inventory
    .map((part) => mapInventoryPart(part))
    .sort((left, right) => left.stock_count - right.stock_count)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12">
              <div className="space-y-6">
                <Badge variant="accent">Admin command center</Badge>
                <SectionHeading
                  eyebrow="Operations visibility"
                  title="Run inventory, orders, and customer traffic from one polished board."
                  description="Low-stock watchlists, order flow, service visibility, and active customer signals live together in one branded operations board."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Boxes, label: 'Active SKUs', value: String(metrics.activeSkus) },
                    { icon: AlertTriangle, label: 'Low-stock watch', value: String(metrics.lowStockCount) },
                    { icon: ClipboardList, label: 'Open orders', value: String(metrics.openOrders) },
                    { icon: PackageCheck, label: 'Revenue pipeline', value: formatCurrency(metrics.revenuePipeline) },
                  ].map((item) => (
                    <div key={item.label} className="inline-flex items-center gap-3 rounded-2xl border border-hairline/70 bg-background/80 px-4 py-4">
                      <item.icon className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-semibold text-primary">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-hairline/80 bg-gradient-to-br from-primary/95 via-primary to-accent/70 p-6 text-primary-foreground shadow-glow">
                <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Operator</p>
                <p className="mt-3 font-display text-3xl">{adminEmail}</p>
                <div className="mt-8 space-y-4">
                  {[
                    'Stock editor stays inline so the operations team can react to inventory movement fast.',
                    'Order and contact queues surface real-time business motion for sales and support handoff.',
                    'Every block follows the same machined shell language as the storefront.',
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-3">
                      <ArrowUpRight className="mt-0.5 h-4 w-4 text-primary-foreground/80" />
                      <p className="text-sm text-primary-foreground/80">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              <SectionHeading
                eyebrow="Inventory board"
                title="Protect the most important SKUs."
                description="Adjust on-hand stock inline while the board keeps MOQ and availability signals visible."
              />
              {inventory.map((part) => (
                <InventoryRow
                  key={part.id}
                  part={part}
                  onSaved={updateInventory}
                  onFailed={setError}
                />
              ))}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    Replenishment watchlist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchlist.map((part) => (
                    <div key={part.id} className="rounded-2xl border border-hairline/70 bg-secondary/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{part.sku}</p>
                          <p className="mt-1 font-semibold text-primary">{part.name}</p>
                        </div>
                        <Badge
                          variant={part.ui_state === 'danger' ? 'destructive' : part.ui_state === 'warning' ? 'warning' : 'success'}
                        >
                          {part.stock_count} in stock
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        MOQ {part.moq} • {formatCurrency(part.price_cents)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-accent" />
                    Service programs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="rounded-2xl border border-hairline/70 bg-secondary/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{service.sku}</p>
                          <p className="mt-1 font-semibold text-primary">{service.name}</p>
                        </div>
                        <Badge variant={service.is_active ? 'success' : 'secondary'}>
                          {service.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {service.estimated_hours ? `${service.estimated_hours}h bench time` : 'Variable bench time'} • {formatCurrency(service.price_cents)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-accent" />
                  Recent order flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-4 rounded-2xl border border-hairline/70 bg-secondary/35 p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm text-primary">{order.id.slice(0, 12)}</p>
                        <OrderStatusBadge order={order} />
                        {order.accepted_terms ? <Badge variant="accent">Terms captured</Badge> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDateTime(order.created_at)} • Updated {formatDateTime(order.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(order.total_cents)}</p>
                      <Link href="/dashboard" className="text-sm font-medium text-accent transition hover:text-primary">
                        Customer view
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Customer accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="rounded-2xl border border-hairline/70 bg-secondary/35 p-4">
                      <p className="font-semibold text-primary">{customer.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Joined {formatDate(customer.created_at)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-accent" />
                    Contact queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contactSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-2xl border border-hairline/70 bg-secondary/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary">{submission.subject}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{submission.name} • {submission.email}</p>
                        </div>
                        <Badge variant="outline">{formatDate(submission.created_at)}</Badge>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{submission.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="shell-frame">
            <div className="shell-core flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Operations note</p>
                <h2 className="mt-2 font-display text-2xl text-primary">This board keeps fulfillment, inventory, and customer movement in one view.</h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/shop/catalog">
                  Review storefront
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
