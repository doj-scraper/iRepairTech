import Stripe from 'stripe';
import { serverConfig } from '@/lib/config';

export const stripe = new Stripe(serverConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});
