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
