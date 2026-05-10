import { supabase } from '../db/client';

interface StripeEventRecord {
  payload: {
    data: {
      object: {
        id: string;
        metadata?: { order_id?: string };
      };
    };
  };
}

function workerLog(level: 'info' | 'error', event: Record<string, unknown>) {
  const line = JSON.stringify({ level, service: 'irepair-worker', timestamp: new Date().toISOString(), ...event });
  level === 'error' ? console.error(line) : console.log(line);
}

export async function finalizeOrder(event: StripeEventRecord) {
  const startTime = Date.now();
  const logCtx: Record<string, unknown> = { job: 'finalizeOrder' };

  const session = event.payload?.data?.object;
  const orderId = session?.metadata?.order_id;
  logCtx.order_id = orderId;
  logCtx.stripe_session_id = session?.id;

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
    logCtx.outcome = 'already_paid';
    logCtx.duration_ms = Date.now() - startTime;
    workerLog('info', logCtx);
    return;
  }

  const { error: finalizeError } = await supabase.rpc('finalize_order', {
    p_session_id: session.id
  });

  if (finalizeError) {
    throw finalizeError;
  }

  logCtx.outcome = 'finalized';
  logCtx.duration_ms = Date.now() - startTime;
  workerLog('info', logCtx);
}
