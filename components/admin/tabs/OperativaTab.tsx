'use client';

import { useMemo, useRef } from 'react';
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
  const nowRef = useRef(new Date());
  const now = nowRef.current;

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
