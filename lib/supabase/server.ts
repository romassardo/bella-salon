import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { clientEnv, serverEnv } from '@/lib/env';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing on server.');

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // server component context: cookies are read-only here
        }
      },
    },
  });
}

/** Service-role client. NEVER import this from a client component. */
export function createSupabaseAdminClient() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin env vars missing.');

  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
