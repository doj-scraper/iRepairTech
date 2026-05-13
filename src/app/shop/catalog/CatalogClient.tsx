'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Boxes, Clock3, MapPinned, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionHeading } from '@/components/brand/SectionHeading';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useCart } from '@/store/cart';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import type { RepairService } from '@/lib/database.types';

type MappedPart = ReturnType<typeof mapInventoryPart>;

type CatalogClientProps = {
  parts: MappedPart[];
  services: RepairService[];
};

export function CatalogClient({ parts, services }: CatalogClientProps) {
  const addItem = useCart((s) => s.addItem);
  const hasItems = parts.length > 0 || services.length > 0;

  const catalogMetrics = [
    {
      icon: Boxes,
      label: 'Stocked lines',
      value: `${parts.length}`,
      note: 'Parts ready to order',
    },
    {
      icon: Truck,
      label: 'Service workflows',
      value: `${services.length}`,
      note: 'Repair services available',
    },
    {
      icon: ShieldCheck,
      label: 'Trade pricing',
      value: 'Built in',
      note: 'Wholesale-first presentation',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 px-4 pb-16 pt-6 md:pb-12">
        <div className="container space-y-8">
          <section className="shell-frame overflow-hidden">
            <div className="shell-core grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-10 lg:py-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="accent">Houston wholesale supply</Badge>
                  <SectionHeading
                    title="Professional-grade parts and repair services for real trade accounts."
                    description="Screens, batteries, assemblies, and service packages priced for repair shops. Stock status, MOQ tiers, and service timing are visible before checkout."
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {catalogMetrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div key={metric.label} className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                        <Icon className="h-5 w-5 text-accent" />
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-primary">{metric.value}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{metric.note}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Houston stocked', 'Wholesale pricing', 'Fast dispatch', 'Trade account ready'].map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-primary text-primary-foreground shadow-elegant">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,138,59,0.22),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_45%)]" />
                  <Image
                    src="/iphone-screen-incell.png"
                    alt="Wholesale repair part reference image"
                    width={960}
                    height={720}
                    priority
                    className="h-full w-full object-cover object-center opacity-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-primary/70 p-5 backdrop-blur-sm">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Stockroom</p>
                        <p className="mt-1 text-base font-semibold">Houston, Texas</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Fulfillment</p>
                        <p className="mt-1 text-base font-semibold">Same-week dispatch</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/65">Catalog rhythm</p>
                        <p className="mt-1 text-base font-semibold">Wholesale-first</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                    <MapPinned className="h-5 w-5 text-accent" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Service area</p>
                    <p className="mt-2 text-sm text-primary">Built to serve Houston-area repair operators and regional wholesale buyers.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-hairline/70 bg-secondary/35 p-4">
                    <Clock3 className="h-5 w-5 text-accent" />
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Ordering cadence</p>
                    <p className="mt-2 text-sm text-primary">Purchase visibility stays clear from catalog through payment confirmation.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!hasItems ? (
            <EmptyState
              title="No products available yet."
              description="Add active inventory and service records to populate the catalog for wholesale buyers."
              action={
                <Button asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-12">
              {parts.length > 0 && (
                <section className="space-y-6">
                  <SectionHeading
                    eyebrow="Stocked inventory"
                    title="Parts ready for immediate wholesale ordering."
                    description="Stock status, MOQ tiers, and SKU references stay visible on every card so buyers can source and submit without leaving the page."
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {parts.map((part) => (
                      <ProductCard
                        key={part.id}
                        id={part.id}
                        name={part.name}
                        description={part.description ?? undefined}
                        priceCents={part.price_cents}
                        imageUrl={part.image_url ?? undefined}
                        stockCount={part.stock_count}
                        moq={part.moq}
                        sku={part.sku}
                        uiIntent={
                          part.ui_intent === 'out_of_stock'
                            ? 'danger'
                            : part.ui_intent === 'low_stock'
                              ? 'warning'
                              : 'neutral'
                        }
                        type="part"
                        onAddToCart={() =>
                          addItem({
                            id: part.id,
                            type: 'part',
                            quantity: Math.max(part.moq, 1),
                            name: part.name,
                            price_cents: part.price_cents,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {services.length > 0 && (
                <section className="space-y-6">
                  <SectionHeading
                    eyebrow="Repair services"
                    title="Service packages for professional repair shops."
                    description="Flat-rate pricing and turnaround estimates keep customer quotes accurate and procurement simple."
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service) => (
                      <ProductCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        description={service.description ?? undefined}
                        priceCents={service.price_cents}
                        imageUrl={service.image_url ?? undefined}
                        type="service"
                        sku={service.sku}
                        estimatedHours={service.estimated_hours}
                        onAddToCart={() =>
                          addItem({
                            id: service.id,
                            type: 'service',
                            quantity: 1,
                            name: service.name,
                            price_cents: service.price_cents,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
