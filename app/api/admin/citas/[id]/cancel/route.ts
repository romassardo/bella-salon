import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'romassardo@gmail.com';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('citas')
    .update({ estado: 'cancelada' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[cancel cita]', error.message);
    return NextResponse.json({ error: 'No se pudo cancelar la cita' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, cita: data });
}
