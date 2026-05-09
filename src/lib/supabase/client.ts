import { createBrowserClient } from '@supabase/ssr';
import { publicConfig } from '@/lib/config';

export function createClient() {
  return createBrowserClient(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseClient() {
  return createClient();
}
