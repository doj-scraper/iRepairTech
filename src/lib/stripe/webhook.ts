import { stripe } from './client';

export function constructStripeEvent(body: string, sig: string) {
  return stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

