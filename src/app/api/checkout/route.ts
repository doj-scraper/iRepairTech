import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseService } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe/client';
import { publicConfig } from '@/lib/config/public';
import { logger } from '@/lib/logger';
import type { Database } from '@/lib/database.types';
import { checkoutRequestSchema } from '@/types/dtos/checkout.dto';
import type { CheckoutItem } from '@/types/dtos/checkout.dto';

async function releaseInventoryReservation(orderId: string) {
  const { error } = await supabaseService.rpc('release_inventory_for_order', {
    p_order_id: orderId,
  });

  if (error) {
    throw error;
  }
}

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

  try {
    await releaseInventoryReservation(orderId);
  } catch (error) {
    console.error('Failed to release reserved inventory during checkout cleanup:', error);
    throw error;
  }

  await supabaseService.from('order_items_parts').delete().eq('order_id', orderId);
  await supabaseService.from('order_items_services').delete().eq('order_id', orderId);
  await supabaseService.from('orders').delete().eq('id', orderId);
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const wideEvent: Record<string, unknown> = {
    method: 'POST',
    path: '/api/checkout',
  };

  let orderId: string | null = null;
  let createdSessionId: string | null = null;

  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      publicConfig.NEXT_PUBLIC_SUPABASE_URL,
      publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(...args: [string, string, CookieOptions]) {
            void args;
          },
          remove(...args: [string, CookieOptions]) {
            void args;
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    wideEvent.user_id = user?.id ?? 'guest';

    const body = await req.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      wideEvent.outcome = 'validation_error';
      wideEvent.status_code = 400;
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, email } = parsed.data;
    wideEvent.item_count = items.length;
    wideEvent.customer_email = email;

    // 1. Fetch authoritative prices
    const partIds = items.filter((i: CheckoutItem) => i.type === 'part').map((i: CheckoutItem) => i.id);
    const serviceIds = items.filter((i: CheckoutItem) => i.type === 'service').map((i: CheckoutItem) => i.id);

    const [partsRes, servicesRes] = await Promise.all([
      partIds.length > 0
        ? supabaseService
            .from('inventory_parts')
            .select('id, name, price_cents, stock_count, moq')
            .in('id', partIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; price_cents: number; stock_count: number; moq: number }> }),
      serviceIds.length > 0
        ? supabaseService
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
    wideEvent.total_cents = total_cents;

    // 4. Create a draft order
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        stripe_session_id: `draft_${crypto.randomUUID()}`,
        total_cents,
        status: 'pending',
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
        terms_version: 'wholesale-v1',
      })
      .select()
      .single();

    if (orderError || !order) throw orderError || new Error('Failed to create order');
    orderId = order.id;
    wideEvent.order_id = orderId;

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

    wideEvent.part_count = partItems.length;
    wideEvent.service_count = serviceItems.length;

    if (partItems.length > 0) {
      const { error: itemsError } = await supabaseService
        .from('order_items_parts')
        .insert(partItems);
      if (itemsError) throw itemsError;
    }

    if (serviceItems.length > 0) {
      const { error: itemsError } = await supabaseService
        .from('order_items_services')
        .insert(serviceItems);
      if (itemsError) throw itemsError;
    }

    // 6. Reserve inventory before Stripe checkout so stock cannot be oversold
    if (partItems.length > 0) {
      const { error: reserveError } = await supabaseService.rpc('reserve_inventory_for_order', {
        p_order_id: order.id,
      });

      if (reserveError) {
        throw reserveError;
      }
    }

    // 7. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata: { order_id: order.id },
      payment_intent_data: {
        metadata: { order_id: order.id }
      },
      success_url: `${publicConfig.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicConfig.NEXT_PUBLIC_SITE_URL}/error?reason=Payment+cancelled`,
      customer_email: email
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a URL');
    }

    createdSessionId = session.id;
    wideEvent.stripe_session_id = createdSessionId;

    // 8. Attach session to order
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    if (updateError) throw updateError;

    wideEvent.outcome = 'success';
    wideEvent.status_code = 200;
    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    wideEvent.outcome = 'error';
    wideEvent.status_code = 400;
    wideEvent.error_type = (error as Error).name;
    wideEvent.error_message = (error as Error).message;

    if (orderId) {
      await cleanupCheckoutDraft(orderId, createdSessionId);
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 400 }
    );
  } finally {
    wideEvent.duration_ms = Date.now() - startTime;
    logger.info(wideEvent);
  }
}
