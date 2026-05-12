import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Default environment variables so config.ts (which runs schema.parse at
// module load time) does not throw during imports in tests that don't
// specifically test config validation.  Tests that DO test validation use
// vi.resetModules() + vi.stubEnv() to override these before importing.
// ---------------------------------------------------------------------------
process.env['NEXT_PUBLIC_SUPABASE_URL'] =
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? 'https://test.supabase.co';
process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] =
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? 'test-anon-key';
process.env['NEXT_PUBLIC_SITE_URL'] =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://irepair.test';
process.env['SUPABASE_SERVICE_ROLE_KEY'] =
  process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? 'test-service-key';
process.env['STRIPE_SECRET_KEY'] =
  process.env['STRIPE_SECRET_KEY'] ?? 'sk_test_xxxxxxxxxxxx';
process.env['STRIPE_WEBHOOK_SECRET'] =
  process.env['STRIPE_WEBHOOK_SECRET'] ?? 'whsec_test_xxxxxxxxxxxx';

// ---------------------------------------------------------------------------
// localStorage mock — Zustand's persist middleware defaults to localStorage
// which is unavailable in the Node test environment.
// ---------------------------------------------------------------------------
const _store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string): string | null => _store[key] ?? null),
  setItem: vi.fn((key: string, value: string): void => {
    _store[key] = value;
  }),
  removeItem: vi.fn((key: string): void => {
    delete _store[key];
  }),
  clear: vi.fn((): void => {
    for (const k in _store) delete _store[k];
  }),
  key: vi.fn((index: number): string | null => Object.keys(_store)[index] ?? null),
  get length(): number {
    return Object.keys(_store).length;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
