'use client';

import { useState } from 'react';
import { AdminCitas } from './AdminCitas';
import { FinancieraTab } from './tabs/FinancieraTab';
import { OperativaTab } from './tabs/OperativaTab';
import { UsuariosTab } from './tabs/UsuariosTab';

type Tab = 'citas' | 'operativa' | 'financiera' | 'usuarios';

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

const OWNER_TABS: { key: Tab; label: string }[] = [
  { key: 'citas', label: 'Citas' },
  { key: 'operativa', label: 'Operativa' },
  { key: 'financiera', label: 'Financiera' },
  { key: 'usuarios', label: 'Usuarios' },
];

const STAFF_TABS: { key: Tab; label: string }[] = [
  { key: 'citas', label: 'Citas' },
];

export function AdminDashboard({
  citas,
  clientes,
  role,
}: {
  citas: CitaDashboard[];
  clientes: ClienteDashboard[];
  role: 'owner' | 'staff';
}) {
  const tabs = role === 'owner' ? OWNER_TABS : STAFF_TABS;
  const [tab, setTab] = useState<Tab>('citas');

  return (
    <div className="space-y-6">
      <div className="flex border-2 border-[var(--color-ink)] w-fit">
        {tabs.map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-medium transition ${
              i < tabs.length - 1 ? 'border-r-2 border-[var(--color-ink)]' : ''
            } ${
              tab === key
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'bg-white text-[var(--color-ink)] hover:bg-[var(--color-acid)]/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'citas' && <AdminCitas citas={citas} />}
      {tab === 'operativa' && role === 'owner' && <OperativaTab citas={citas} clientes={clientes} />}
      {tab === 'financiera' && role === 'owner' && <FinancieraTab citas={citas} />}
      {tab === 'usuarios' && role === 'owner' && <UsuariosTab />}
    </div>
  );
}
