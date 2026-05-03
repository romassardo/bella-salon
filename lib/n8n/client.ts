import { serverEnv } from '@/lib/env.server';

export type N8nResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Llama un webhook de n8n con autenticación por header `x-signature`.
 * El valor del header debe coincidir con la credencial Header Auth configurada
 * en n8n (Salon Bella Webhook Auth) y con `N8N_WEBHOOK_SECRET` en envs.
 */
export async function postToN8n<T = unknown>(
  path: string,
  payload: unknown,
  init?: RequestInit,
): Promise<N8nResult<T>> {
  const base = serverEnv.N8N_WEBHOOK_URL;
  const secret = serverEnv.N8N_WEBHOOK_SECRET;
  if (!base || !secret) {
    return { ok: false, error: 'n8n env vars missing' };
  }

  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-signature': secret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      ...init,
    });
    if (!res.ok) {
      return { ok: false, error: `n8n responded ${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}
