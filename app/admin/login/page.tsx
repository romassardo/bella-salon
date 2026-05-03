'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Mode = 'login' | 'reset';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Email o contraseña incorrectos.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) {
      setError('No se pudo enviar el email. Verificá que la dirección sea correcta.');
      return;
    }
    setSuccess('Te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de entrada.');
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-6">
      <form
        onSubmit={mode === 'login' ? onLogin : onReset}
        className="w-full max-w-sm border-2 border-[var(--color-ink)] bg-white p-8 space-y-5"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]/60">Salón Bella</div>
          <h1 className="text-3xl font-serif text-[var(--color-ink)] mt-1">
            {mode === 'login' ? 'Admin' : 'Recuperar acceso'}
          </h1>
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

        {mode === 'login' && (
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
        )}

        {error && (
          <div className="text-sm text-[var(--color-hot)] border border-[var(--color-hot)] px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-[var(--color-ink)] border border-[var(--color-ink)] px-3 py-2 bg-[var(--color-acid)]/20">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] py-3 uppercase tracking-wider text-sm hover:bg-[var(--color-hot)] transition disabled:opacity-50"
        >
          {loading
            ? mode === 'login' ? 'Ingresando…' : 'Enviando…'
            : mode === 'login' ? 'Ingresar' : 'Enviar link de recuperación'}
        </button>

        <div className="text-center">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => switchMode('reset')}
              className="text-xs text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] underline underline-offset-2 transition"
            >
              Olvidé mi contraseña
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] underline underline-offset-2 transition"
            >
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
