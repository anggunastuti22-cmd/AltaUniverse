import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../login/actions';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (!role) {
    return (
      <main style={{ maxWidth: 420, margin: '0 auto', padding: space.xl }}>
        <h1>Not authorized</h1>
        <p style={{ color: color.textMuted }}>
          This account is not an operator. Admin access requires an explicit role and grants no
          access to private user content.
        </p>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              padding: `${space.sm}px ${space.lg}px`,
              borderRadius: 8,
              border: `1px solid ${color.border}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: color.background }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space.lg,
          padding: `${space.md}px ${space.xl}px`,
          borderBottom: `1px solid ${color.border}`,
          backgroundColor: color.surfaceMuted,
        }}
      >
        <strong style={{ fontFamily: 'var(--alta-font-family-display)', fontSize: fontSize.lg }}>
          Alta Admin
        </strong>
        <nav style={{ display: 'flex', gap: space.md, flex: 1 }}>
          <Link href="/" style={{ color: color.textMuted, textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link href="/catalogue" style={{ color: color.textMuted, textDecoration: 'none' }}>
            Catalogue
          </Link>
          <Link href="/ingredients" style={{ color: color.textMuted, textDecoration: 'none' }}>
            Ingredients
          </Link>
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              padding: `${space.xs}px ${space.md}px`,
              borderRadius: 8,
              border: `1px solid ${color.border}`,
              background: 'transparent',
              color: color.textMuted,
              cursor: 'pointer',
              fontSize: fontSize.sm,
            }}
          >
            Sign out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
