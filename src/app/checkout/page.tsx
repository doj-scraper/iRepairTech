'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { supabaseClient } from '@/lib/supabase/client';

type QuotedItem = {
  id: string;
  type: 'part' | 'service';
  quantity: number;
  name: string;
  price_cents: number;
};

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quotedItems, setQuotedItems] = useState<QuotedItem[]>([]);
  const [quotedTotalCents, setQuotedTotalCents] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchQuote = async () => {
      if (items.length === 0) {
        setQuotedItems([]);
        setQuotedTotalCents(0);
        setQuoteLoading(false);
        return;
      }

      setQuoteLoading(true);

      try {
        const partIds = items
          .filter((i) => i.type === 'part')
          .map((i) => i.id);
        const serviceIds = items
          .filter((i) => i.type === 'service')
          .map((i) => i.id);

        const [partsRes, servicesRes] = await Promise.all([
          partIds.length > 0
            ? supabaseClient
                .from('inventory_parts')
                .select('id, name, price_cents')
                .in('id', partIds)
            : Promise.resolve({ data: [] }),
          serviceIds.length > 0
            ? supabaseClient
                .from('repair_services')
                .select('id, name, price_cents')
                .in('id', serviceIds)
            : Promise.resolve({ data: [] }),
        ]);

        const nextQuotedItems = items.map((item) => {
          if (item.type === 'part') {
            const part = partsRes.data?.find((p: any) => p.id === item.id);
            return {
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              name: part?.name || item.id,
              price_cents: part?.price_cents || 0,
            };
          }

          const service = servicesRes.data?.find((s: any) => s.id === item.id);
          return {
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            name: service?.name || item.id,
            price_cents: service?.price_cents || 0,
          };
        });

        const nextTotalCents = nextQuotedItems.reduce(
          (sum, item) => sum + item.price_cents * item.quantity,
          0
        );

        if (!cancelled) {
          setQuotedItems(nextQuotedItems);
          setQuotedTotalCents(nextTotalCents);
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const handleCheckout = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      clear();
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <p className="text-muted">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="max-w-2xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="border rounded-lg p-4">
            {quoteLoading ? (
              <p className="text-muted">Calculating prices...</p>
            ) : (
              quotedItems.map((item) => (
                <div key={item.id} className="flex justify-between mb-2">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${((item.quantity * item.price_cents) / 100).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 mt-2 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${(quotedTotalCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-4 py-2"
            placeholder="your@email.com"
          />
        </div>

        {error && <div className="text-danger mb-4">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}

