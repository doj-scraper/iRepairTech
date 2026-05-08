import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Order } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const typedOrders: Order[] = orders ?? [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {typedOrders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {typedOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-6 hover:bg-muted transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{order.id.slice(0, 12)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ui-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">
                      ${(order.total_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
