import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { CatalogClient } from './CatalogClient';

export const metadata: Metadata = {
  title: 'Catalog | iRepair Technologies',
  description:
    'Browse wholesale cellphone repair parts and service workflows stocked for Houston-area repair shops and trade accounts.',
  keywords: 'wholesale catalog, repair parts, cellphone parts, Houston wholesale, trade accounts',
  openGraph: {
    title: 'Catalog | iRepair Technologies',
    description:
      'Wholesale parts catalog for repair shops looking for Houston-stocked inventory and service workflows.',
    type: 'website',
  },
};

export default async function CatalogPage() {
  const supabase = createClient();

  const [partsRes, servicesRes] = await Promise.all([
    supabase
      .from('inventory_parts')
      .select('id, sku, name, description, image_url, price_cents, stock_count, moq, is_active, created_at')
      .eq('is_active', true),
    supabase
      .from('repair_services')
      .select('id, sku, name, description, image_url, price_cents, estimated_hours, is_active, created_at')
      .eq('is_active', true),
  ]);

  const parts = (partsRes.data ?? []).map(mapInventoryPart);
  const services = servicesRes.data ?? [];

  return <CatalogClient parts={parts} services={services} />;
}
