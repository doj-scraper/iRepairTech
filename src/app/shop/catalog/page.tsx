import { createClient } from '@/lib/supabase/server';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { CatalogClient } from './CatalogClient';

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
