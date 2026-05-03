'use client';

import { useEffect, useState } from 'react';

type UsuarioRow = {
  user_id: string;
  email: string;
  nombre: string | null;
  role: 'owner' | 'staff';
  created_at: string;
};

export function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function fetchUsuarios() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json() as { users: UsuarioRow[] };
      setUsuarios(data.users);
    }
    setLoading(false);
  }

  useEffect(() => { fetchUsuarios(); }, []);

  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setTempPassword(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, nombre }),
    });
    const json = await res.json() as { error?: string; tempPassword?: string };
    setCreating(false);
    if (!res.ok) {
      setError(json.error ?? 'No se pudo crear el usuario.');
      return;
    }
    setTempPassword(json.tempPassword ?? null);
    setEmail('');
    setNombre('');
    fetchUsuarios();
  }

  async function onEliminar(userId: string) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.ok) fetchUsuarios();
  }

  return (
    <div className="space-y-6">
      {/* Formulario nuevo usuario */}
      <div className="border-2 border-[var(--color-ink)] bg-white p-6">
        <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60 mb-4">
          Invitar empleado
        </div>
        <form onSubmit={onCrear} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-sm flex-1 focus:outline-none focus:bg-[var(--color-acid)]/20"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-sm flex-1 focus:outline-none focus:bg-[var(--color-acid)]/20"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2 text-xs uppercase tracking-wider hover:bg-[var(--color-hot)] transition disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? 'Enviando…' : 'Enviar invitación'}
          </button>
        </form>
        {error && (
          <div className="mt-3 text-sm text-[var(--color-hot)] border border-[var(--color-hot)] px-3 py-2">
            {error}
          </div>
        )}
        {tempPassword && (
          <div className="mt-3 border-2 border-[var(--color-ink)] px-4 py-3 bg-[var(--color-acid)]/20 space-y-1">
            <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">Usuario creado — contraseña temporal</div>
            <div className="font-mono text-lg font-bold text-[var(--color-ink)] tracking-widest">{tempPassword}</div>
            <div className="text-xs text-[var(--color-ink)]/60">Compartí esta contraseña con el empleado. Puede cambiarla desde la pantalla de login usando &quot;Olvidé mi contraseña&quot;.</div>
          </div>
        )}
      </div>

      {/* Lista de usuarios */}
      <div className="border-2 border-[var(--color-ink)] bg-white overflow-x-auto">
        <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60 px-4 py-3 border-b border-[var(--color-ink)]/20">
          Usuarios con acceso
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-ink)]/50">Cargando…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-ink)] text-[var(--color-paper)]">
              <tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Creado</Th>
                <Th>{''}</Th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.user_id} className="border-t border-[var(--color-ink)]/15 hover:bg-[var(--color-acid)]/10">
                  <Td>{u.nombre ?? '—'}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 border ${
                      u.role === 'owner'
                        ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                        : 'border-[var(--color-ink)]/40 text-[var(--color-ink)]/60'
                    }`}>
                      {u.role === 'owner' ? 'Dueño' : 'Empleado'}
                    </span>
                  </Td>
                  <Td>{new Date(u.created_at).toLocaleDateString('es-AR')}</Td>
                  <Td>
                    {u.role !== 'owner' && (
                      <button
                        onClick={() => onEliminar(u.user_id)}
                        className="text-xs text-[var(--color-hot)] hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  return <td className="px-3 py-2 align-middle">{children}</td>;
}
