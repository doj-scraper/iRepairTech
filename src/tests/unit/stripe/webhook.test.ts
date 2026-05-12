import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted lets us reference the mock fn inside the vi.mock factory
// (which is hoisted to the top of the file before other imports).
const mockConstructEvent = vi.hoisted(() => vi.fn());

// Mock the Stripe SDK so no real HTTP calls or key validation happen.
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

// Mock config to avoid needing real environment variables.
vi.mock('@/lib/config', () => ({
  publicConfig: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'https://irepair.test',
  },
  serverConfig: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'https://irepair.test',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    STRIPE_SECRET_KEY: 'sk_test_xxxxxxxxxxxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_xxxxxxxxxxxx',
  },
}));

import { constructStripeEvent } from '@/lib/stripe/webhook';

describe('constructStripeEvent', () => {
  const WEBHOOK_SECRET = 'whsec_test_xxxxxxxxxxxx';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['STRIPE_WEBHOOK_SECRET'] = WEBHOOK_SECRET;
  });

  it('calls stripe.webhooks.constructEvent with the provided body and signature', () => {
    const mockEvent = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      object: 'event',
    };
    mockConstructEvent.mockReturnValue(mockEvent);

    const result = constructStripeEvent('raw-body', 'stripe-sig-header');

    expect(mockConstructEvent).toHaveBeenCalledOnce();
    expect(mockConstructEvent).toHaveBeenCalledWith(
      'raw-body',
      'stripe-sig-header',
      WEBHOOK_SECRET,
    );
    expect(result).toEqual(mockEvent);
  });

  it('propagates errors thrown by stripe.webhooks.constructEvent', () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Webhook signature verification failed');
    });

    expect(() => constructStripeEvent('tampered-body', 'bad-sig')).toThrow(
      'Webhook signature verification failed',
    );
  });
});
