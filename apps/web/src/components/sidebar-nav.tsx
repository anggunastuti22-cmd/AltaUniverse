'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';

export interface NavItem {
  href: string;
  label: string;
  accent?: string;
  badge?: number;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" style={{ display: 'grid', gap: 2 }}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.sm,
              padding: `${space.sm}px ${space.md}px`,
              borderRadius: radius.md,
              fontSize: fontSize.sm,
              fontWeight: active ? 600 : 500,
              textDecoration: 'none',
              color: active ? color.textStrong : color.textMuted,
              backgroundColor: active ? color.surface : 'transparent',
              border: `1px solid ${active ? color.border : 'transparent'}`,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                flex: 'none',
                backgroundColor: item.accent ?? color.borderStrong,
                opacity: active ? 1 : 0.5,
              }}
            />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span
                aria-label={`${item.badge} unread`}
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: 999,
                  backgroundColor: color.mind,
                  color: color.textInverse,
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
