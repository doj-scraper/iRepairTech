import { supabaseServer } from '../supabase/client';

export async function acquireAdvisoryLock(lockId: number, timeout = 5000) {
  const { data, error } = await supabaseServer.rpc('pg_advisory_lock', {
    lockid: lockId
  });
  
  if (error) throw error;
  return data;
}

export async function releaseAdvisoryLock(lockId: number) {
  const { data, error } = await supabaseServer.rpc('pg_advisory_unlock', {
    lockid: lockId
  });
  
  if (error) throw error;
  return data;
}

