import Link from 'next/link';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('lab_products').select('id, is_published');
  const total = (products ?? []).length;
  const published = (products ?? []).filter((p) => p.is_published).length;

  const tiles = [
    { label: 'Catalogue products', value: String(total) },
    { label: 'Published', value: String(published) },
    { label: 'Drafts', value: String(total - published) },
  ];

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: space.xl }}>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: color.textMuted }}>
        Operational overview. By design, admin sees operational/public data only — never private
        user entries (enforced by RLS).
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: space.md,
          marginTop: space.lg,
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{
              border: `1px solid ${color.border}`,
              borderRadius: radius.lg,
              padding: space.lg,
              backgroundColor: color.surface,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: color.textSubtle,
              }}
            >
              {t.label}
            </span>
            <div style={{ fontSize: fontSize.xl, fontFamily: 'var(--alta-font-family-display)' }}>
              {t.value}
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: space.xl }}>
        <Link href="/catalogue" style={{ color: color.lab, fontWeight: 600 }}>
          Manage catalogue →
        </Link>
      </p>
    </main>
  );
}
