import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/client';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    // Verify signature
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Log event once; the worker owns processing.
    const { error: logError } = await supabaseServer
      .from('stripe_events')
      .upsert({
        event_id: event.id,
        type: event.type,
        payload: event,
        processed: false
      }, {
        onConflict: 'event_id',
        ignoreDuplicates: true
      });

    if (logError) {
      throw logError;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 400 }
    );
  }
}

