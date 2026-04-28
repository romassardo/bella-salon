'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Cita = {
  id: string;
  fecha_hora: string;
  estado: string;
  medio_reserva: string;
  notas: string | null;
  created_at: string;
  clientes: { nombre_completo: string; telefono: string; email: string | null } | null;
  servicios: { nombre: string; duracion_minutos: number; precio: number } | null;
};

type Filter = 'proximas' | 'hoy' | 'pasadas' | 'canceladas' | 'todas';

const TZ = 'America/Argentina/Cordoba';

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtPrice(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toLocaleDateString('es-AR', { timeZone: TZ }) === now.toLocaleDateString('es-AR', { timeZone: TZ });
}

export function AdminCitas({ citas }: { citas: Cita[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('proximas');
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    return citas.filter((c) => {
      const d = new Date(c.fecha_hora);
      if (filter === 'canceladas') return c.estado === 'cancelada';
      if (c.estado === 'cancelada') return false;
      if (filter === 'hoy') return isToday(c.fecha_hora);
      if (filter === 'proximas') return d >= now;
      if (filter === 'pasadas') return d < now;
      return true;
    });
  }, [citas, filter, now]);

  const counts = useMemo(() => {
    const today = citas.filter((c) => c.estado !== 'cancelada' && isToday(c.fecha_hora)).length;
    const upcoming = citas.filter(
      (c) => c.estado !== 'cancelada' && new Date(c.fecha_hora) >= now
    ).length;
    const cancelled = citas.filter((c) => c.estado === 'cancelada').length;
    const ingresosHoy = citas
      .filter((c) => c.estado !== 'cancelada' && isToday(c.fecha_hora))
      .reduce((acc, c) => acc + (c.servicios?.precio ?? 0), 0);
    return { today, upcoming, cancelled, total: citas.length, ingresosHoy };
  }, [citas, now]);

  async function cancelCita(id: string) {
    if (!confirm('¿Cancelar esta cita? El cliente no será notificado automáticamente.')) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/citas/${id}/cancel`, { method: 'PATCH' });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Error: ${j.error ?? res.statusText}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Hoy" value={counts.today} />
        <Stat label="Próximas" value={counts.upcoming} />
        <Stat label="Canceladas" value={counts.cancelled} />
        <Stat label="Total" value={counts.total} />
        <Stat label="Ingresos hoy" value={fmtPrice(counts.ingresosHoy)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['proximas', 'hoy', 'pasadas', 'canceladas', 'todas'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border-2 border-[var(--color-ink)] transition ${
              filter === f
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'bg-white text-[var(--color-ink)] hover:bg-[var(--color-acid)]/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--color-ink)]/40 p-12 text-center text-[var(--color-ink)]/60">
          No hay citas en esta vista.
        </div>
      ) : (
        <div className="border-2 border-[var(--color-ink)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-ink)] text-[var(--color-paper)]">
              <tr>
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Contacto</Th>
                <Th>Servicio</Th>
                <Th>Duración</Th>
                <Th>Precio</Th>
                <Th>Origen</Th>
                <Th>Estado</Th>
                <Th>Acción</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-[var(--color-ink)]/15 hover:bg-[var(--color-acid)]/10">
                  <Td>{fmtDateTime(c.fecha_hora)}</Td>
                  <Td>{c.clientes?.nombre_completo ?? '—'}</Td>
                  <Td>
                    <div className="text-xs">
                      <div>{c.clientes?.telefono}</div>
                      <div className="text-[var(--color-ink)]/60">{c.clientes?.email ?? '—'}</div>
                    </div>
                  </Td>
                  <Td>{c.servicios?.nombre ?? '—'}</Td>
                  <Td>{c.servicios ? `${c.servicios.duracion_minutos} min` : '—'}</Td>
                  <Td>{c.servicios ? fmtPrice(c.servicios.precio) : '—'}</Td>
                  <Td>
                    <span className="text-xs uppercase tracking-wider px-2 py-0.5 border border-[var(--color-ink)]/30">
                      {c.medio_reserva === 'asistente_ia' ? 'IA' : 'Form'}
                    </span>
                  </Td>
                  <Td>
                    <EstadoBadge estado={c.estado} />
                  </Td>
                  <Td>
                    {c.estado !== 'cancelada' && new Date(c.fecha_hora) >= now ? (
                      <button
                        onClick={() => cancelCita(c.id)}
                        disabled={busyId === c.id || pending}
                        className="text-xs uppercase tracking-wider border border-[var(--color-hot)] text-[var(--color-hot)] px-2 py-1 hover:bg-[var(--color-hot)] hover:text-white transition disabled:opacity-50"
                      >
                        {busyId === c.id ? '…' : 'Cancelar'}
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--color-ink)]/40">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-2 border-[var(--color-ink)] bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">{label}</div>
      <div className="text-3xl font-serif text-[var(--color-ink)] mt-1">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2 text-xs uppercase tracking-wider font-normal">{children}</th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    confirmada: 'bg-[var(--color-acid)] text-[var(--color-ink)]',
    cancelada: 'bg-[var(--color-hot)] text-white',
    completada: 'bg-[var(--color-ink)] text-[var(--color-paper)]',
  };
  const cls = map[estado] ?? 'bg-white text-[var(--color-ink)] border border-[var(--color-ink)]';
  return <span className={`text-xs uppercase tracking-wider px-2 py-0.5 ${cls}`}>{estado}</span>;
}
