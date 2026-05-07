import { createClient } from '../supabase/server';

export async function acquireAdvisoryLock(lockId: number, timeout = 5000) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('pg_advisory_lock', {
    lockid: lockId
  });
  
  if (error) throw error;
  return data;
}

export async function releaseAdvisoryLock(lockId: number) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('pg_advisory_unlock', {
    lockid: lockId
  });
  
  if (error) throw error;
  return data;
}
