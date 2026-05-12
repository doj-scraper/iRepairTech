import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/ssr BEFORE any module that imports it is loaded.
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  })),
}));

// Mock @/lib/config so the module doesn't require real env vars.
vi.mock('@/lib/config', () => ({
  publicConfig: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'https://irepair.test',
  },
}));

import { createBrowserClient } from '@supabase/ssr';
import { createClient, getSupabaseClient } from '@/lib/supabase/client';

describe('supabase browser client helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClient', () => {
    it('calls createBrowserClient with the Supabase URL and anon key', () => {
      createClient();

      expect(vi.mocked(createBrowserClient)).toHaveBeenCalledOnce();
      expect(vi.mocked(createBrowserClient)).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
      );
    });

    it('returns the client produced by createBrowserClient', () => {
      const client = createClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });
  });

  describe('getSupabaseClient', () => {
    it('returns a client instance', () => {
      const client = getSupabaseClient();

      expect(client).toBeDefined();
    });

    it('delegates to createBrowserClient', () => {
      getSupabaseClient();

      expect(vi.mocked(createBrowserClient)).toHaveBeenCalledOnce();
    });
  });
});
