'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type SessionInfo = {
  email: string;
  nombre: string | null;
  role: 'owner' | 'staff';
};

export function MiCuentaTab({ role }: { role: 'owner' | 'staff' }) {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('user_id', data.user.id)
        .single();
      if (cancelled) return;
      setInfo({
        email: data.user.email ?? '',
        nombre: (profile?.nombre as string | null) ?? null,
        role,
      });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError('No se pudo actualizar la contraseña. Probá de nuevo.');
      return;
    }
    setSuccess(true);
    setPassword('');
    setConfirm('');
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Datos de la cuenta */}
      <div className="border-2 border-[var(--color-ink)] bg-white p-6 space-y-3">
        <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">
          Mi cuenta
        </div>
        {info ? (
          <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <dt className="text-[var(--color-ink)]/60">Nombre</dt>
            <dd className="text-[var(--color-ink)]">{info.nombre ?? '—'}</dd>
            <dt className="text-[var(--color-ink)]/60">Email</dt>
            <dd className="text-[var(--color-ink)]">{info.email}</dd>
            <dt className="text-[var(--color-ink)]/60">Rol</dt>
            <dd>
              <span
                className={`text-xs uppercase tracking-wider px-2 py-0.5 border ${
                  info.role === 'owner'
                    ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                    : 'border-[var(--color-ink)]/40 text-[var(--color-ink)]/60'
                }`}
              >
                {info.role === 'owner' ? 'Dueño' : 'Empleado'}
              </span>
            </dd>
          </dl>
        ) : (
          <div className="text-sm text-[var(--color-ink)]/50">Cargando…</div>
        )}
      </div>

      {/* Cambio de contraseña */}
      <form
        onSubmit={onSubmit}
        className="border-2 border-[var(--color-ink)] bg-white p-6 space-y-5"
      >
        <div className="text-xs uppercase tracking-wider text-[var(--color-ink)]/60">
          Cambiar contraseña
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink)]/70">
            Nueva contraseña
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-[var(--color-ink)] focus:outline-none focus:bg-[var(--color-acid)]/20"
            autoComplete="new-password"
            minLength={8}
          />
          <span className="mt-1 block text-xs text-[var(--color-ink)]/50">
            Mínimo 8 caracteres.
          </span>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink)]/70">
            Confirmar contraseña
          </span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-[var(--color-ink)] focus:outline-none focus:bg-[var(--color-acid)]/20"
            autoComplete="new-password"
            minLength={8}
          />
        </label>

        {error && (
          <div className="text-sm text-[var(--color-hot)] border border-[var(--color-hot)] px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-[var(--color-ink)] border-2 border-[var(--color-ink)] bg-[var(--color-acid)]/20 px-3 py-2">
            Contraseña actualizada.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2 text-xs uppercase tracking-wider hover:bg-[var(--color-hot)] transition disabled:opacity-50"
        >
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}
