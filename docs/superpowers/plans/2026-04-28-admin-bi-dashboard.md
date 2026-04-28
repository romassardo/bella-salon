# Admin BI Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar dos pestañas nuevas (Financiera y Operativa) al panel admin, con métricas de negocio, gráficos Recharts y la estética brutalista existente.

**Architecture:** Server component carga citas + clientes en una sola pasada; todo el cálculo queda en `useMemo` dentro de cada tab client component. Sin nuevos endpoints ni queries adicionales.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Recharts, Supabase (client ya configurado).

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `app/admin/page.tsx` | Modificar | Agrega query de clientes; usa `AdminDashboard` en lugar de `AdminCitas` directamente |
| `components/admin/AdminDashboard.tsx` | Crear | Estado de pestaña activa; renderiza los 3 tabs |
| `components/admin/AdminCitas.tsx` | Modificar | Agrega stat "Ingresos hoy"; acepta `string\|number` en `Stat` |
| `components/admin/tabs/FinancieraTab.tsx` | Crear | Selector mes/año, stats, BarChart, tabla por servicio |
| `components/admin/tabs/OperativaTab.tsx` | Crear | Stats globales, LineChart últimos 6 meses, ranking, canal |

---

## Task 1: Instalar Recharts

**Files:**
- Modify: `package.json` (automático via npm)

- [ ] **Step 1: Instalar la dependencia**

```bash
npm install recharts
```

Expected: `recharts` aparece en `dependencies` de `package.json`.

- [ ] **Step 2: Verificar que el proyecto sigue compilando**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts dependency"
```

---

## Task 2: Crear `AdminDashboard` — orquestador de pestañas

**Files:**
- Create: `components/admin/AdminDashboard.tsx`

- [ ] **Step 1: Crear el archivo con la estructura de pestañas**

Crear `components/admin/AdminDashboard.tsx` con el siguiente contenido:

```tsx
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
```

- [ ] **Step 2: Crear el directorio de tabs (necesario antes del siguiente task)**

```bash
mkdir -p "components/admin/tabs"
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/AdminDashboard.tsx
git commit -m "feat: add AdminDashboard tab orchestrator"
```

---

## Task 3: Modificar `app/admin/page.tsx` — agregar query clientes y usar `AdminDashboard`

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Reemplazar el contenido de `app/admin/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
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

type ClienteRow = { id: string; created_at: string };

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const [{ data: citas, error }, { data: clientes }] = await Promise.all([
    supabase
      .from('citas')
      .select(
        `id, fecha_hora, estado, medio_reserva, notas, created_at,
         clientes:cliente_id ( nombre_completo, telefono, email ),
         servicios:servicio_id ( nombre, duracion_minutos, precio )`
      )
      .order('fecha_hora', { ascending: true })
      .returns<CitaRow[]>(),
    supabase.from('clientes').select('id, created_at').returns<ClienteRow[]>(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="border-b-2 border-[var(--color-ink)] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
            Salón Bella
          </div>
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
        <AdminDashboard citas={citas ?? []} clientes={clientes ?? []} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin page adds clientes query and uses AdminDashboard"
```

---

## Task 4: Modificar `AdminCitas` — agregar stat "Ingresos hoy"

**Files:**
- Modify: `components/admin/AdminCitas.tsx`

- [ ] **Step 1: Actualizar el componente `Stat` para aceptar `string | number`**

Localizar la función `Stat` al final del archivo (línea ~172) y reemplazarla:

```tsx
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-2 border-[var(--color-ink)] bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">{label}</div>
      <div className="text-3xl font-serif text-[var(--color-ink)] mt-1">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Agregar cálculo de `ingresosHoy` en el `useMemo` de `counts` (línea ~62)**

Reemplazar el `useMemo` de `counts` existente:

```tsx
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
```

- [ ] **Step 3: Agregar el stat en el grid (línea ~84) y cambiar a 5 columnas**

Reemplazar el div del grid de stats:

```tsx
<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  <Stat label="Hoy" value={counts.today} />
  <Stat label="Próximas" value={counts.upcoming} />
  <Stat label="Canceladas" value={counts.cancelled} />
  <Stat label="Total" value={counts.total} />
  <Stat label="Ingresos hoy" value={fmtPrice(counts.ingresosHoy)} />
</div>
```

- [ ] **Step 4: Verificar tipos**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add components/admin/AdminCitas.tsx
git commit -m "feat: add ingresos hoy stat to AdminCitas"
```

---

## Task 5: Crear `FinancieraTab`

**Files:**
- Create: `components/admin/tabs/FinancieraTab.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `components/admin/tabs/FinancieraTab.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CitaDashboard } from '../AdminDashboard';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

function fmtPrice(n: number) {
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

export function FinancieraTab({ citas }: { citas: CitaDashboard[] }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());

  const anios = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const filtradas = useMemo(
    () =>
      citas.filter((c) => {
        const d = new Date(c.fecha_hora);
        return (
          d.getMonth() === mes &&
          d.getFullYear() === anio &&
          c.estado !== 'cancelada'
        );
      }),
    [citas, mes, anio]
  );

  const canceladas = useMemo(
    () =>
      citas.filter((c) => {
        const d = new Date(c.fecha_hora);
        return (
          d.getMonth() === mes && d.getFullYear() === anio && c.estado === 'cancelada'
        );
      }),
    [citas, mes, anio]
  );

  const ingresos = useMemo(
    () => filtradas.reduce((a, c) => a + (c.servicios?.precio ?? 0), 0),
    [filtradas]
  );

  const montoPerido = useMemo(
    () => canceladas.reduce((a, c) => a + (c.servicios?.precio ?? 0), 0),
    [canceladas]
  );

  const ticketPromedio = filtradas.length > 0 ? ingresos / filtradas.length : 0;

  const porServicio = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; ingreso: number }>();
    filtradas.forEach((c) => {
      const nombre = c.servicios?.nombre ?? 'Sin servicio';
      const precio = c.servicios?.precio ?? 0;
      const ex = map.get(nombre);
      map.set(nombre, ex
        ? { ...ex, cantidad: ex.cantidad + 1, ingreso: ex.ingreso + precio }
        : { nombre, cantidad: 1, ingreso: precio }
      );
    });
    return Array.from(map.values()).sort((a, b) => b.ingreso - a.ingreso);
  }, [filtradas]);

  return (
    <div className="space-y-6">
      {/* Selector mes / año */}
      <div className="flex gap-3 items-center">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-sm"
        >
          {MESES.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-sm"
        >
          {anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Ingresos del mes" value={fmtPrice(ingresos)} />
        <StatCard label="Ticket promedio" value={fmtPrice(ticketPromedio)} />
        <StatCard label="Citas cobradas" value={String(filtradas.length)} />
        <StatCard label="Monto perdido" value={fmtPrice(montoPerido)} accent="hot" />
      </div>

      {porServicio.length > 0 ? (
        <>
          {/* Gráfico de barras */}
          <div className="border-2 border-[var(--color-ink)] bg-white p-4">
            <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60 mb-4">
              Ingresos por servicio
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porServicio} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => fmtPrice(Number(v))} />
                <Bar
                  dataKey="ingreso"
                  fill="var(--color-acid)"
                  stroke="var(--color-ink)"
                  strokeWidth={2}
                  radius={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla */}
          <div className="border-2 border-[var(--color-ink)] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-ink)] text-[var(--color-paper)]">
                <tr>
                  <Th>Servicio</Th>
                  <Th>Citas</Th>
                  <Th>Ingreso</Th>
                  <Th>% del total</Th>
                </tr>
              </thead>
              <tbody>
                {porServicio.map((s) => (
                  <tr key={s.nombre} className="border-t border-[var(--color-ink)]/15 hover:bg-[var(--color-acid)]/10">
                    <Td>{s.nombre}</Td>
                    <Td>{s.cantidad}</Td>
                    <Td>{fmtPrice(s.ingreso)}</Td>
                    <Td>
                      {ingresos > 0
                        ? `${((s.ingreso / ingresos) * 100).toFixed(1)}%`
                        : '—'}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="border-2 border-dashed border-[var(--color-ink)]/40 p-12 text-center text-[var(--color-ink)]/60">
          No hay citas en este período.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'hot';
}) {
  return (
    <div className="border-2 border-[var(--color-ink)] bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">{label}</div>
      <div
        className={`text-2xl font-serif mt-1 ${
          accent === 'hot' ? 'text-[var(--color-hot)]' : 'text-[var(--color-ink)]'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2 text-xs uppercase tracking-wider font-normal">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/admin/tabs/FinancieraTab.tsx
git commit -m "feat: add FinancieraTab with bar chart and service breakdown"
```

---

## Task 6: Crear `OperativaTab`

**Files:**
- Create: `components/admin/tabs/OperativaTab.tsx`

- [ ] **Step 1: Crear el archivo**

Crear `components/admin/tabs/OperativaTab.tsx`:

```tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CitaDashboard, ClienteDashboard } from '../AdminDashboard';

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtPrice(n: number) {
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

export function OperativaTab({
  citas,
  clientes,
}: {
  citas: CitaDashboard[];
  clientes: ClienteDashboard[];
}) {
  const now = new Date();

  const activas = useMemo(
    () => citas.filter((c) => c.estado !== 'cancelada'),
    [citas]
  );

  const tasaCancelacion = useMemo(() => {
    if (citas.length === 0) return '0';
    const canceladas = citas.filter((c) => c.estado === 'cancelada').length;
    return ((canceladas / citas.length) * 100).toFixed(1);
  }, [citas]);

  const canalStats = useMemo(() => {
    const ia = activas.filter((c) => c.medio_reserva === 'asistente_ia').length;
    const form = activas.filter((c) => c.medio_reserva === 'formulario').length;
    return { ia, form, dominante: ia >= form ? 'IA' : 'Formulario' };
  }, [activas]);

  const servicioTop = useMemo(() => {
    const map = new Map<string, number>();
    activas.forEach((c) => {
      const nombre = c.servicios?.nombre ?? 'Sin servicio';
      map.set(nombre, (map.get(nombre) ?? 0) + 1);
    });
    let top = '—';
    let max = 0;
    map.forEach((count, nombre) => {
      if (count > max) { max = count; top = nombre; }
    });
    return top;
  }, [activas]);

  const clientesNuevos = useMemo(
    () =>
      clientes.filter((c) => {
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    [clientes, now]
  );

  const evolucion = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const count = activas.filter((c) => {
          const cd = new Date(c.fecha_hora);
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        }).length;
        return { mes: MESES_CORTOS[d.getMonth()], citas: count };
      }),
    [activas, now]
  );

  const rankingServicios = useMemo(() => {
    const map = new Map<string, { nombre: string; cantidad: number; ingreso: number }>();
    activas.forEach((c) => {
      const nombre = c.servicios?.nombre ?? 'Sin servicio';
      const precio = c.servicios?.precio ?? 0;
      const ex = map.get(nombre);
      map.set(nombre, ex
        ? { ...ex, cantidad: ex.cantidad + 1, ingreso: ex.ingreso + precio }
        : { nombre, cantidad: 1, ingreso: precio }
      );
    });
    return Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad);
  }, [activas]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tasa cancelación" value={`${tasaCancelacion}%`} accent="hot" />
        <StatCard label="Canal dominante" value={canalStats.dominante} />
        <StatCard label="Servicio top" value={servicioTop} />
        <StatCard label="Clientes nuevos (mes)" value={String(clientesNuevos)} />
      </div>

      {/* Line chart — últimos 6 meses */}
      <div className="border-2 border-[var(--color-ink)] bg-white p-4">
        <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60 mb-4">
          Citas últimos 6 meses
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={evolucion}>
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="citas"
              stroke="var(--color-hot)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-hot)', r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Ranking servicios */}
        <div className="border-2 border-[var(--color-ink)] bg-white overflow-x-auto">
          <div className="px-3 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-wider">
            Ranking servicios
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/20">
                <Th>#</Th>
                <Th>Servicio</Th>
                <Th>Citas</Th>
                <Th>Ingreso</Th>
              </tr>
            </thead>
            <tbody>
              {rankingServicios.map((s, i) => (
                <tr key={s.nombre} className="border-t border-[var(--color-ink)]/15 hover:bg-[var(--color-acid)]/10">
                  <Td>{i + 1}</Td>
                  <Td>{s.nombre}</Td>
                  <Td>{s.cantidad}</Td>
                  <Td>{fmtPrice(s.ingreso)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Por canal */}
        <div className="border-2 border-[var(--color-ink)] bg-white overflow-x-auto">
          <div className="px-3 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-wider">
            Por canal
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-ink)]/20">
                <Th>Canal</Th>
                <Th>Citas</Th>
                <Th>%</Th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-ink)]/15">
                <Td>Asistente IA</Td>
                <Td>{canalStats.ia}</Td>
                <Td>
                  {activas.length > 0
                    ? `${((canalStats.ia / activas.length) * 100).toFixed(1)}%`
                    : '—'}
                </Td>
              </tr>
              <tr className="border-t border-[var(--color-ink)]/15">
                <Td>Formulario</Td>
                <Td>{canalStats.form}</Td>
                <Td>
                  {activas.length > 0
                    ? `${((canalStats.form / activas.length) * 100).toFixed(1)}%`
                    : '—'}
                </Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'hot';
}) {
  return (
    <div className="border-2 border-[var(--color-ink)] bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">{label}</div>
      <div
        className={`text-2xl font-serif mt-1 ${
          accent === 'hot' ? 'text-[var(--color-hot)]' : 'text-[var(--color-ink)]'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2 text-xs uppercase tracking-wider font-normal">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/admin/tabs/OperativaTab.tsx
git commit -m "feat: add OperativaTab with line chart, ranking and channel breakdown"
```

---

## Task 7: Verificación final

- [ ] **Step 1: Typecheck completo**

```bash
npm run typecheck
```

Expected: sin errores.

- [ ] **Step 2: Build de producción**

```bash
npm run build
```

Expected: build exitoso sin errores.

- [ ] **Step 3: Verificar manualmente en el navegador**

Ir a `http://localhost:3000/admin` y verificar:
- Las 3 pestañas aparecen y cambian de vista
- Tab Citas: tiene 5 stats incluyendo "Ingresos hoy"
- Tab Financiera: selector mes/año funciona, barras se renderizan con color amarillo
- Tab Operativa: línea se renderiza en rojo, las dos tablas aparecen lado a lado

- [ ] **Step 4: Push final**

```bash
git push
```
