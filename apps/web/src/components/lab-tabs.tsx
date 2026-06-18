'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';

const TABS = [
  { href: '/lab', label: 'Overview' },
  { href: '/lab/baseline', label: 'Skin baseline' },
  { href: '/lab/cabinet', label: 'Cabinet' },
  { href: '/lab/routines', label: 'Routines' },
  { href: '/lab/observations', label: 'Observations' },
  { href: '/lab/experiments', label: 'Experiments' },
];

export function LabTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="AltaLab sections"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: space.xs,
        borderBottom: `1px solid ${color.border}`,
        padding: `0 ${space.xl}px`,
      }}
    >
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: `${space.sm}px ${space.md}px`,
              fontSize: fontSize.sm,
              fontWeight: active ? 600 : 500,
              textDecoration: 'none',
              color: active ? color.textStrong : color.textMuted,
              borderTopLeftRadius: radius.sm,
              borderTopRightRadius: radius.sm,
              borderBottom: `2px solid ${active ? color.lab : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
