import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'owner') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Prevent deleting other owners
  const { data: target } = await admin.from('profiles').select('role').eq('user_id', id).single();
  if (target?.role === 'owner') {
    return NextResponse.json({ error: 'No se puede eliminar al dueño.' }, { status: 403 });
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: 'No se pudo eliminar el usuario.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
