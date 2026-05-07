import { supabase } from '../db/client';
import { finalizeOrder } from '../jobs/finalizeOrder';

export async function processQueue() {
  const { data: events, error } = await supabase
    .from('stripe_events')
    .select('*')
    .eq('processed', false)
    .limit(20);

  if (error) {
    console.error('Queue poll error:', error);
    return;
  }

  for (const event of events || []) {
    try {
      if (event.type === 'checkout.session.completed') {
        await finalizeOrder(event);
      } else if (event.type === 'checkout.session.expired') {
        const session = event.payload?.data?.object;

        if (session?.id) {
          const { data: order } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

          if (order) {
            await supabase.rpc('transition_order_state', { p_order_id: order.id, p_next_state: 'expired' });
          }
        }
      } else if (event.type === 'charge.refunded') {
        const charge = event.payload?.data?.object;
        const orderId = charge?.metadata?.order_id;

        if (orderId) {
          await supabase.rpc('transition_order_state', { p_order_id: orderId, p_next_state: 'refunded' });
        }
      }

      await supabase
        .from('stripe_events')
        .update({ processed: true })
        .eq('id', event.id);

      console.log(`Processed event ${event.id}`);
    } catch (e) {
      await supabase
        .from('stripe_events')
        .update({
          processed: false
        })
        .eq('id', event.id);

      console.error(`Failed event ${event.id}:`, e);
    }
  }
}

