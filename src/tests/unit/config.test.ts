import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Valid full environment for testing correct parse behaviour
const validEnv: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://valid.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'valid-anon-key',
  NEXT_PUBLIC_SITE_URL: 'https://valid.irepair.test',
  SUPABASE_SERVICE_ROLE_KEY: 'valid-service-key',
  STRIPE_SECRET_KEY: 'sk_test_valid',
  STRIPE_WEBHOOK_SECRET: 'whsec_valid',
};

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('publicConfig', () => {
    it('parses a fully valid environment', async () => {
      Object.entries(validEnv).forEach(([k, v]) => vi.stubEnv(k, v));

      const { publicConfig } = await import('@/lib/config');

      expect(publicConfig.NEXT_PUBLIC_SUPABASE_URL).toBe(validEnv['NEXT_PUBLIC_SUPABASE_URL']);
      expect(publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(validEnv['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
      expect(publicConfig.NEXT_PUBLIC_SITE_URL).toBe(validEnv['NEXT_PUBLIC_SITE_URL']);
    });

    it('throws when NEXT_PUBLIC_SUPABASE_URL is not a valid URL', async () => {
      Object.entries({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' }).forEach(([k, v]) =>
        vi.stubEnv(k, v),
      );

      await expect(import('@/lib/config')).rejects.toThrow();
    });

    it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is empty', async () => {
      Object.entries({ ...validEnv, NEXT_PUBLIC_SUPABASE_ANON_KEY: '' }).forEach(([k, v]) =>
        vi.stubEnv(k, v),
      );

      await expect(import('@/lib/config')).rejects.toThrow();
    });

    it('throws when NEXT_PUBLIC_SITE_URL is not a valid URL', async () => {
      Object.entries({ ...validEnv, NEXT_PUBLIC_SITE_URL: 'invalid-url' }).forEach(([k, v]) =>
        vi.stubEnv(k, v),
      );

      await expect(import('@/lib/config')).rejects.toThrow();
    });
  });

  describe('serverConfig', () => {
    it('parses a fully valid server environment', async () => {
      Object.entries(validEnv).forEach(([k, v]) => vi.stubEnv(k, v));

      const { serverConfig } = await import('@/lib/config');

      expect(serverConfig.SUPABASE_SERVICE_ROLE_KEY).toBe(validEnv['SUPABASE_SERVICE_ROLE_KEY']);
      expect(serverConfig.STRIPE_SECRET_KEY).toBe(validEnv['STRIPE_SECRET_KEY']);
      expect(serverConfig.STRIPE_WEBHOOK_SECRET).toBe(validEnv['STRIPE_WEBHOOK_SECRET']);
    });

    it('throws when STRIPE_SECRET_KEY is missing', async () => {
      Object.entries({ ...validEnv, STRIPE_SECRET_KEY: '' }).forEach(([k, v]) =>
        vi.stubEnv(k, v),
      );

      await expect(import('@/lib/config')).rejects.toThrow();
    });

    it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
      Object.entries({ ...validEnv, SUPABASE_SERVICE_ROLE_KEY: '' }).forEach(([k, v]) =>
        vi.stubEnv(k, v),
      );

      await expect(import('@/lib/config')).rejects.toThrow();
    });
  });
});
