import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

async function getOwnerOrUnauthorized() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'owner') return null;
  return user;
}

function generateTempPassword(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Bella-${num}`;
}

export async function GET() {
  const user = await getOwnerOrUnauthorized();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('user_id, role, nombre, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'No se pudieron obtener los usuarios.' }, { status: 500 });

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? '']));

  const users = (profiles ?? []).map((p) => ({
    user_id: p.user_id,
    email: emailMap.get(p.user_id) ?? '',
    nombre: p.nombre,
    role: p.role,
    created_at: p.created_at,
  }));

  return NextResponse.json({ users });
}

const createSchema = z.object({
  email: z.string().email(),
  nombre: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  const user = await getOwnerOrUnauthorized();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body: unknown = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });

  const { email, nombre } = parsed.data;
  const admin = createSupabaseAdminClient();
  const tempPassword = generateTempPassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 400 });
  }

  const { error: profileErr } = await admin.from('profiles').insert({
    user_id: created.user.id,
    role: 'staff',
    nombre: nombre ?? null,
  });

  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: 'No se pudo crear el perfil.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tempPassword });
}
