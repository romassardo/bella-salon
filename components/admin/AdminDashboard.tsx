'use client';

import { useState } from 'react';
import { AdminCitas } from './AdminCitas';
import { FinancieraTab } from './tabs/FinancieraTab';
import { OperativaTab } from './tabs/OperativaTab';

type Tab = 'citas' | 'financiera' | 'operativa';

export type CitaDashboard = {
  id: string;
  fecha_hora: string;
  estado: string;
  medio_reserva: string;
  notas: string | null;
  created_at: string;
  clientes: { nombre_completo: string; telefono: string; email: string | null } | null;
  servicios: { nombre: string; duracion_minutos: number; precio: number } | null;
};

export type ClienteDashboard = { id: string; created_at: string };

const TAB_LABELS: Record<Tab, string> = {
  citas: 'Citas',
  financiera: 'Financiera',
  operativa: 'Operativa',
};

export function AdminDashboard({
  citas,
  clientes,
}: {
  citas: CitaDashboard[];
  clientes: ClienteDashboard[];
}) {
  const [tab, setTab] = useState<Tab>('citas');

  return (
    <div className="space-y-6">
      <div className="flex border-2 border-[var(--color-ink)] w-fit">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t, i, arr) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition ${
              i < arr.length - 1 ? 'border-r-2 border-[var(--color-ink)]' : ''
            } ${
              tab === t
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'bg-white text-[var(--color-ink)] hover:bg-[var(--color-acid)]/20'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'citas' && <AdminCitas citas={citas} />}
      {tab === 'financiera' && <FinancieraTab citas={citas} />}
      {tab === 'operativa' && <OperativaTab citas={citas} clientes={clientes} />}
    </div>
  );
}
