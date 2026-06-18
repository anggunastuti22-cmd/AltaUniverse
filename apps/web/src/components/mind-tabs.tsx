'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';

const TABS = [
  { href: '/mind', label: 'Overview' },
  { href: '/mind/check-in', label: 'Check-in' },
  { href: '/mind/journal', label: 'Journal' },
  { href: '/mind/domains', label: 'Life domains' },
  { href: '/mind/goals', label: 'Goals' },
  { href: '/mind/weekly', label: 'Weekly reset' },
  { href: '/mind/decisions', label: 'Decision room' },
];

export function MindTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="AltaMind sections"
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
              borderBottom: `2px solid ${active ? color.mind : 'transparent'}`,
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
