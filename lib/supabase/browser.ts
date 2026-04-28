import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env';

export function createSupabaseBrowserClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars missing on client.');
  }
  return createBrowserClient(url, key);
}
