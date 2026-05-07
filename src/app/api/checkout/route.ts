import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { checkoutRequestSchema } from '@/types/dtos/checkout.dto';
import type { CheckoutItem } from '@/types/dtos/checkout.dto';

async function cleanupCheckoutDraft(orderId?: string, sessionId?: string | null) {
  if (sessionId) {
    try {
      await stripe.checkout.sessions.expire(sessionId);
    } catch (error) {
      console.error('Failed to expire orphan Stripe session:', error);
    }
  }

  if (!orderId) {
    return;
  }

  const supabase = createClient();
  await supabase.from('order_items_parts').delete().eq('order_id', orderId);
  await supabase.from('order_items_services').delete().eq('order_id', orderId);
  await supabase.from('orders').delete().eq('id', orderId);
}

export async function POST(req: Request) {
  let orderId: string | null = null;
  let createdSessionId: string | null = null;

  try {
    const body = await req.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, email } = parsed.data;

    const supabase = createClient();

    // 1. Fetch authoritative prices
    const partIds = items.filter((i: CheckoutItem) => i.type === 'part').map((i: CheckoutItem) => i.id);
    const serviceIds = items.filter((i: CheckoutItem) => i.type === 'service').map((i: CheckoutItem) => i.id);

    const [partsRes, servicesRes] = await Promise.all([
      partIds.length > 0
        ? supabase
            .from('inventory_parts')
            .select('id, name, price_cents, stock_count, moq')
            .in('id', partIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; price_cents: number; stock_count: number; moq: number }> }),
      serviceIds.length > 0
        ? supabase
            .from('repair_services')
            .select('id, name, price_cents')
            .in('id', serviceIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; price_cents: number }> }),
    ]);

    const parts = partsRes.data ?? [];
    const services = servicesRes.data ?? [];

    // 2. Validate stock + MOQ for parts
    for (const item of items.filter((i: CheckoutItem) => i.type === 'part')) {
      const product = parts.find(p => p.id === item.id);
      if (!product) throw new Error(`Part ${item.id} not found`);
      if (product.stock_count < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      if (item.quantity < product.moq) {
        throw new Error(`Minimum order quantity for ${product.name} is ${product.moq}`);
      }
    }

    // 3. Build line items
    const line_items: Array<{
      price_data: {
        currency: 'usd';
        product_data: { name: string };
        unit_amount: number;
      };
      quantity: number;
    }> = items.map((i: CheckoutItem) => {
      const product = i.type === 'part'
        ? parts.find(p => p.id === i.id)
        : services.find(s => s.id === i.id);
      if (!product) throw new Error(`Product ${i.id} not found`);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: product.price_cents
        },
        quantity: i.quantity
      };
    });

    const total_cents = line_items.reduce<number>(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );

    // 4. Create a draft order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: `draft_${crypto.randomUUID()}`,
        total_cents,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;
    orderId = order.id;

    // 5. Create order items
    const partItems = items
      .filter((i: CheckoutItem) => i.type === 'part')
      .map((i: CheckoutItem) => {
        const product = parts.find(p => p.id === i.id);
        if (!product) throw new Error(`Part ${i.id} not found`);
        return {
          order_id: order.id,
          part_id: i.id,
          quantity: i.quantity,
          price_cents: product.price_cents
        };
      });

    const serviceItems = items
      .filter((i: CheckoutItem) => i.type === 'service')
      .map((i: CheckoutItem) => {
        const product = services.find(s => s.id === i.id);
        if (!product) throw new Error(`Service ${i.id} not found`);
        return {
          order_id: order.id,
          service_id: i.id,
          price_cents: product.price_cents
        };
      });

    if (partItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items_parts')
        .insert(partItems);
      if (itemsError) throw itemsError;
    }

    if (serviceItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items_services')
        .insert(serviceItems);
      if (itemsError) throw itemsError;
    }

    // 6. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata: { order_id: order.id },
      payment_intent_data: {
        metadata: { order_id: order.id }
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/error?reason=Payment+cancelled`,
      customer_email: email
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a URL');
    }

    createdSessionId = session.id;

    // 7. Attach session to order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    if (updateError) throw updateError;

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    if (orderId) {
      await cleanupCheckoutDraft(orderId, createdSessionId);
    }
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 400 }
    );
  }
}
