import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getServerConfig } from '@/lib/config';

const serverConfig = getServerConfig();

/**
 * Service-role Supabase client.
 * Bypasses RLS — use only in server-side API routes and workers.
 * Never import this in client components or expose to the browser.
 */
export const supabaseService = createClient(
  serverConfig.NEXT_PUBLIC_SUPABASE_URL,
  serverConfig.SUPABASE_SERVICE_ROLE_KEY,
);
