import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminCitas } from '@/components/admin/AdminCitas';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';

type CitaRow = {
  id: string;
  fecha_hora: string;
  estado: string;
  medio_reserva: string;
  notas: string | null;
  created_at: string;
  clientes: { nombre_completo: string; telefono: string; email: string | null } | null;
  servicios: { nombre: string; duracion_minutos: number; precio: number } | null;
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data, error } = await supabase
    .from('citas')
    .select(`
      id, fecha_hora, estado, medio_reserva, notas, created_at,
      clientes:cliente_id ( nombre_completo, telefono, email ),
      servicios:servicio_id ( nombre, duracion_minutos, precio )
    `)
    .order('fecha_hora', { ascending: true })
    .returns<CitaRow[]>();

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="border-b-2 border-[var(--color-ink)] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/60">Salón Bella</div>
          <h1 className="text-2xl font-serif text-[var(--color-ink)]">Panel Admin</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-ink)]/70">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="border-2 border-[var(--color-hot)] text-[var(--color-hot)] px-4 py-3 mb-6">
            Error cargando citas: {error.message}
          </div>
        )}
        <AdminCitas citas={data ?? []} />
      </main>
    </div>
  );
}
