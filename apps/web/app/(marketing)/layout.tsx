import type { ReactNode } from 'react';
import Link from 'next/link';
import { color, fontSize, radius, space } from '@alta/design-tokens';

const nav = [
  { href: '/altamind', label: 'AltaMind' },
  { href: '/altawear', label: 'AltaWear' },
  { href: '/altalab', label: 'AltaLab' },
  { href: '/products', label: 'Products' },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: color.background,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space.lg,
          padding: `${space.md}px ${space.xl}px`,
          borderBottom: `1px solid ${color.border}`,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--alta-font-family-display)',
            fontSize: fontSize.lg,
            color: color.textStrong,
            textDecoration: 'none',
          }}
        >
          Alta Universe
        </Link>
        <nav style={{ display: 'flex', gap: space.lg, flex: 1, flexWrap: 'wrap' }}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{ color: color.textMuted, textDecoration: 'none' }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          style={{
            padding: `${space.xs}px ${space.lg}px`,
            borderRadius: radius.md,
            backgroundColor: color.primary,
            color: color.primaryContrast,
            textDecoration: 'none',
            fontSize: fontSize.sm,
            fontWeight: 600,
          }}
        >
          Sign in
        </Link>
      </header>

      <div style={{ flex: 1 }}>{children}</div>

      <footer
        style={{
          borderTop: `1px solid ${color.border}`,
          padding: `${space.lg}px ${space.xl}px`,
          color: color.textSubtle,
          fontSize: fontSize.xs,
        }}
      >
        Alta Universe — reflective, not judgmental · educational, not diagnostic · mindful, not
        consumption-driven. Your private data is yours.
      </footer>
    </div>
  );
}
