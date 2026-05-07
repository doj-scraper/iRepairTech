
'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const admin = profile?.role === 'admin';
      setIsAdmin(admin);

      if (admin) {
        const [partsRes, servicesRes] = await Promise.all([
          supabaseClient.from('inventory_parts').select('*'),
          supabaseClient.from('repair_services').select('*'),
        ]);

        setParts(partsRes.data || []);
        setServices(servicesRes.data || []);
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted">Please log in to access admin panel</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
          <p className="text-muted">
            You are signed in, but this account does not have admin access.
          </p>
          {error && <p className="text-danger mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  const updateStock = async (id: string, newStock: number) => {
    const { error } = await supabaseClient
      .from('inventory_parts')
      .update({ stock_count: newStock })
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    setParts(
      parts.map((p) => (p.id === id ? { ...p, stock_count: newStock } : p))
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        {error && <p className="mb-6 text-danger">{error}</p>}

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Parts Inventory</h2>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{part.sku}</td>
                    <td className="px-4 py-2">{part.name}</td>
                    <td className="px-4 py-2 text-right">
                      ${(part.price_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">{part.stock_count}</td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number"
                        value={part.stock_count}
                        onChange={(e) =>
                          updateStock(part.id, parseInt(e.target.value))
                        }
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-muted">{service.sku}</p>
                <p className="text-lg font-bold mt-2">
                  ${(service.price_cents / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

