'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border-2 border-[var(--color-ink)] bg-white p-8 space-y-5"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/60">Salón Bella</div>
          <h1 className="text-3xl font-serif text-[var(--color-ink)] mt-1">Admin</h1>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink)]/70">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-[var(--color-ink)] focus:outline-none focus:bg-[var(--color-acid)]/20"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink)]/70">Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-[var(--color-ink)] focus:outline-none focus:bg-[var(--color-acid)]/20"
            autoComplete="current-password"
          />
        </label>

        {error && (
          <div className="text-sm text-[var(--color-hot)] border border-[var(--color-hot)] px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] py-3 uppercase tracking-wider text-sm hover:bg-[var(--color-hot)] transition disabled:opacity-50"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
