'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { mapInventoryPart } from '@/lib/semantic/mapToUI';
import { useCart } from '@/store/cart';

export default function CatalogPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    const fetchData = async () => {
      const [partsRes, servicesRes] = await Promise.all([
        supabaseClient
          .from('inventory_parts')
          .select('*')
          .eq('is_active', true),
        supabaseClient
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

  if (loading) return <div className="p-8">Loading...</div>;

  const ProductCard = ({ item, type }: any) => (
    <div key={item.id} className="border rounded-lg p-6 hover:shadow-lg transition">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-40 object-cover rounded mb-4"
        />
      )}

      <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
      <p className="text-sm text-muted mb-4">{item.description}</p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold">
          ${(item.price_cents / 100).toFixed(2)}
        </span>
        {type === 'part' && (
          <span className={`text-sm font-semibold ui-${item.ui_intent}`}>
            {item.stock_count > 0
              ? `${item.stock_count} in stock`
              : 'Out of stock'}
          </span>
        )}
      </div>

      <button
        onClick={() =>
          addItem({
            id: item.id,
            type,
            quantity: 1,
          })
        }
        disabled={type === 'part' && item.stock_count === 0}
        className="w-full bg-primary text-white py-2 rounded disabled:opacity-50 hover:opacity-90"
      >
        Add to Cart
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {parts.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">Parts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {parts.map((part) => (
                <ProductCard key={part.id} item={part} type="part" />
              ))}
            </div>
          </>
        )}

        {services.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ProductCard key={service.id} item={service} type="service" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

