import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  servicio: z.string().min(1).max(60),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha YYYY-MM-DD'),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    servicio: url.searchParams.get('servicio'),
    fecha: url.searchParams.get('fecha'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 422 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_horarios_disponibles', {
    svc_nombre: parsed.data.servicio,
    fecha: parsed.data.fecha,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const payload = data as
    | { available_slots?: string[]; message?: string; error?: string }
    | null;

  if (payload?.error) {
    return NextResponse.json({ error: payload.error }, { status: 404 });
  }

  const slots = (payload?.available_slots ?? []).map((iso) => iso.slice(11, 16));
  return NextResponse.json({ slots, closed: payload?.message ?? null });
}
