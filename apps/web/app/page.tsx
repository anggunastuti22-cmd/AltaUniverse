import Link from 'next/link';
import { color, space } from '@alta/design-tokens';

const domains = [
  { name: 'AltaMind', tagline: 'Understand yourself.', accent: color.mind },
  { name: 'AltaWear', tagline: 'Express yourself.', accent: color.wear },
  { name: 'AltaLab', tagline: 'Care for yourself.', accent: color.lab },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: space.xl }}>
      <h1>Alta Universe</h1>
      <p style={{ color: color.textMuted }}>
        One intelligent life system across three connected domains. This is the foundation scaffold
        — features are not implemented yet.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: space.md }}>
        {domains.map((domain) => (
          <li
            key={domain.name}
            style={{
              borderLeft: `4px solid ${domain.accent}`,
              padding: `${space.sm}px ${space.md}px`,
              backgroundColor: color.surface,
              borderRadius: 8,
            }}
          >
            <strong>{domain.name}</strong> — {domain.tagline}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: space.xl }}>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: `${space.sm}px ${space.lg}px`,
            borderRadius: 8,
            backgroundColor: color.primary,
            color: color.primaryContrast,
            textDecoration: 'none',
          }}
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
