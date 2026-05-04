import { supabase } from '../db/client';

export async function finalizeOrder(event: any) {
  const session = event.payload?.data?.object;
  const orderId = session?.metadata?.order_id;

  if (!orderId) {
    throw new Error('ORDER_ID_MISSING');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (order?.status === 'paid') {
    console.log(`Order ${orderId} already paid`);
    return;
  }

  const { error: finalizeError } = await supabase.rpc('finalize_order', {
    p_session_id: session.id
  });

  if (finalizeError) {
    throw finalizeError;
  }

  console.log(`Order ${orderId} finalized`);
}

