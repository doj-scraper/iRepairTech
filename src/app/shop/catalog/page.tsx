
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { useCart } from '@/store/cart';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { RepairService } from '@/lib/database.types';

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

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="mb-8 h-10 w-32" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 border border-border p-6">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasItems = parts.length > 0 || services.length > 0;

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <EmptyState
            title="No products available"
            description="Check back soon for new inventory and services."
            action={
              <Link href="/">
                <Button>Return Home</Button>
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
        {parts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-display font-bold">Parts</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {parts.map((part) => (
                <ProductCard
                  key={part.id}
                  id={part.id}
                  name={part.name}
                  description={part.description ?? undefined}
                  priceCents={part.price_cents}
                  imageUrl={part.image_url ?? undefined}
                  stockCount={part.stock_count}
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
                      quantity: 1,
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
          <section>
            <h2 className="mb-6 text-3xl font-display font-bold">Services</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ProductCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description ?? undefined}
                  priceCents={service.price_cents}
                  imageUrl={service.image_url ?? undefined}
                  type="service"
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
    </div>
  );
}
