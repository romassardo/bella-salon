'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-xs uppercase tracking-wider border border-[var(--color-ink)] px-3 py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] transition"
    >
      Salir
    </button>
  );
}
