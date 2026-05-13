import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminBoard } from '@/components/admin/AdminBoard';
import type {
  ContactSubmission,
  InventoryPart,
  Order,
  Profile,
  RepairService,
} from '@/lib/database.types';
import { supabaseService } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Admin | iRepair Technologies',
  description:
    'Internal operations board for iRepair Technologies inventory, orders, and customer contact queues.',
  keywords: 'admin board, inventory management, wholesale operations, repair parts system',
  openGraph: {
    title: 'Admin | iRepair Technologies',
    description:
      'Operations board for inventory, orders, and customer support inside iRepair Technologies.',
    type: 'website',
  },
};

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?redirectTo=/admin');
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const profile = profileData as Profile | null;

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const [partsRes, servicesRes, ordersRes, customersRes, contactRes] = await Promise.all([
    supabaseService.from('inventory_parts').select('id, sku, name, description, image_url, price_cents, stock_count, moq, is_active, created_at').order('stock_count', { ascending: true }),
    supabaseService.from('repair_services').select('id, sku, name, description, image_url, price_cents, estimated_hours, is_active, created_at').order('name', { ascending: true }),
    supabaseService.from('orders').select('id, user_id, status, total_cents, created_at, updated_at').order('created_at', { ascending: false }).limit(8),
    supabaseService.from('profiles').select('id, email, role, created_at').eq('role', 'customer').order('created_at', { ascending: false }).limit(6),
    supabaseService.from('contact_submissions').select('id, name, email, phone, subject, message, created_at').order('created_at', { ascending: false }).limit(6),
  ]);

  if (partsRes.error) {
    throw partsRes.error;
  }

  if (servicesRes.error) {
    throw servicesRes.error;
  }

  if (ordersRes.error) {
    throw ordersRes.error;
  }

  if (customersRes.error) {
    throw customersRes.error;
  }

  if (contactRes.error) {
    throw contactRes.error;
  }

  return (
    <AdminBoard
      adminEmail={profile.email || user.email || 'admin@irepairtechnologies.com'}
      contactSubmissions={(contactRes.data ?? []) as ContactSubmission[]}
      customers={(customersRes.data ?? []) as Profile[]}
      orders={(ordersRes.data ?? []) as Order[]}
      parts={(partsRes.data ?? []) as InventoryPart[]}
      services={(servicesRes.data ?? []) as RepairService[]}
    />
  );
}
