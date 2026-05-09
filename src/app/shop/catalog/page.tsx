'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { useCart } from '@/store/cart';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { RepairService } from '@/lib/database.types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionHeading } from '@/components/brand/SectionHeading';
import { Badge } from '@/components/ui/badge';

export default function CatalogPage() {
  const [parts, setParts] = useState<ReturnType<typeof mapInventoryPart>[]>([]);
  const [services, setServices] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();
      const [partsRes, servicesRes] = await Promise.all([
        supabase
          .from('inventory_parts')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('repair_services')
          .select('*')
          .eq('is_active', true),
      ]);

      if (partsRes.data) {
        setParts(partsRes.data.map(mapInventoryPart));
      }
      if (servicesRes.data) {
        setServices(servicesRes.data);
      }
      setLoading(false);
    };

    void fetchData();
  }, []);

  const catalogMetrics = useMemo(
    () => [
      `${parts.length} stocked part lines`,
      `${services.length} service workflows`,
      'Trade pricing presentation built in',
    ],
    [parts.length, services.length],
  );

  const hasItems = parts.length > 0 || services.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 px-4 pb-16 pt-6">
        <div className="container space-y-8">
          <section className="shell-frame">
            <div className="shell-core gradient-subtle px-6 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <SectionHeading
                  eyebrow="Catalog experience"
                  title="Merchandised inventory built for wholesale scanning."
                  description="The catalog is structured to feel operational: stronger imagery, stock language, MOQ cues, and product cards that support bulk decision-making."
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

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shell-frame">
                  <div className="shell-core flex flex-col gap-4 p-4">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-8 w-4/5" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasItems ? (
            <EmptyState
              title="No products available"
              description="Check back soon for new inventory and service listings."
              action={
                <Link href="/">
                  <Button>Return Home</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-12">
              {parts.length > 0 && (
                <section className="space-y-6">
                  <SectionHeading
                    eyebrow="Stocked inventory"
                    title="Parts built to read like real wholesale supply."
                    description="Image-forward cards, stock state, MOQ cues, and quick-view behavior are built to help buyers source inventory fast."
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
                    eyebrow="Service workflows"
                    title="Service cards that support repair-business upsells."
                    description="The catalog supports both physical inventory and higher-margin service revenue lanes."
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
