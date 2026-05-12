import Stripe from 'stripe';
import { getServerConfig } from '@/lib/config';

const serverConfig = getServerConfig();

export const stripe = new Stripe(serverConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});
