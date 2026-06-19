import type { ReactNode } from 'react';
import { color, fontSize, fontWeight, radius, space } from '@alta/design-tokens';
import { signOut } from '../../app/login/actions';
import { SidebarNav, type NavItem } from './sidebar-nav';

function buildNav(unread: number): NavItem[] {
  return [
    { href: '/home', label: 'Alta Home', accent: color.core },
    { href: '/mind', label: 'AltaMind', accent: color.mind },
    { href: '/wear', label: 'AltaWear', accent: color.wear },
    { href: '/lab', label: 'AltaLab', accent: color.lab },
    { href: '/notifications', label: 'Notifications', accent: color.borderStrong, badge: unread },
    { href: '/account/privacy', label: 'Account & Privacy', accent: color.borderStrong },
  ];
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'A';
}

export function AppShell({
  displayName,
  unread = 0,
  children,
}: {
  displayName: string;
  unread?: number;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: color.background }}>
      <aside
        style={{
          width: 268,
          flex: 'none',
          backgroundColor: color.surfaceMuted,
          borderRight: `1px solid ${color.border}`,
          display: 'flex',
          flexDirection: 'column',
          padding: space.lg,
          gap: space.xl,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--alta-font-family-display)',
              fontSize: fontSize.lg,
              color: color.textStrong,
            }}
          >
            Alta Universe
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: color.textSubtle,
              marginTop: 2,
            }}
          >
            One intelligent life system
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <span
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              backgroundColor: color.coreSoft,
              color: color.core,
              border: `1px solid ${color.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: fontWeight.semibold,
            }}
          >
            {initialOf(displayName)}
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              {displayName}
            </div>
            <div style={{ fontSize: fontSize.xs, color: color.textSubtle }}>One Alta ID</div>
          </div>
        </div>

        <SidebarNav items={buildNav(unread)} />

        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              border: `1px solid ${color.border}`,
              borderRadius: radius.md,
              padding: space.md,
              backgroundColor: color.surface,
            }}
          >
            <div
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.semibold,
                color: color.textStrong,
              }}
            >
              Private to you
            </div>
            <p
              style={{ fontSize: fontSize.xs, color: color.textMuted, margin: `${space.xs}px 0 0` }}
            >
              Entries are yours. Admin can never read them.
            </p>
          </div>
          <form action={signOut} style={{ marginTop: space.sm }}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: `${space.sm}px`,
                borderRadius: radius.md,
                border: `1px solid ${color.border}`,
                background: 'transparent',
                color: color.textMuted,
                fontSize: fontSize.sm,
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
