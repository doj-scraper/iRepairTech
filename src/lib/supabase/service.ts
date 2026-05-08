import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client.
 * Bypasses RLS — use only in server-side API routes and workers.
 * Never import this in client components or expose to the browser.
 */
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
