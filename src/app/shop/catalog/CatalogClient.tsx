'use client';

import Link from 'next/link';
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
    `${parts.length} stocked part lines`,
    `${services.length} service workflows`,
    'Trade pricing built in',
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 px-4 pb-16 pt-6">
        <div className="container space-y-8">
          <section className="shell-frame">
            <div className="shell-core gradient-subtle px-6 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <SectionHeading
                  eyebrow="Houston wholesale supply"
                  title="Professional-grade parts and repair services."
                  description="Screens, batteries, assemblies, and service packages — priced for trade accounts and stocked for same-week fulfillment."
                />
                <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                  {catalogMetrics.map((metric) => (
                    <Badge key={metric} variant="secondary">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {!hasItems ? (
            <EmptyState
              title="No products available"
              description="Check back soon for new inventory and service listings."
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
                    description="Stock status, MOQ tiers, and SKU references are surfaced on every card so your team can source and submit without leaving the page."
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
                    description="Add repair services to any order. Flat-rate pricing with estimated turnaround times keeps your customer quotes accurate."
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
