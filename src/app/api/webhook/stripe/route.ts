import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe/client';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  const startTime = Date.now();
  const wideEvent: Record<string, unknown> = {
    method: 'POST',
    path: '/api/webhook/stripe',
  };

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      wideEvent.outcome = 'missing_signature';
      wideEvent.status_code = 400;
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    wideEvent.stripe_event_id = event.id;
    wideEvent.stripe_event_type = event.type;

    const { error: logError } = await supabaseService
      .from('stripe_events')
      .upsert({
        event_id: event.id,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event)),
        processed: false
      }, {
        onConflict: 'event_id',
        ignoreDuplicates: true
      });

    if (logError) {
      throw logError;
    }

    wideEvent.outcome = 'success';
    wideEvent.status_code = 200;
    return NextResponse.json({ received: true });
  } catch (error) {
    wideEvent.outcome = 'error';
    wideEvent.status_code = 400;
    wideEvent.error_type = (error as Error).name;
    wideEvent.error_message = (error as Error).message;
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  } finally {
    wideEvent.duration_ms = Date.now() - startTime;
    logger.info(wideEvent);
  }
}
