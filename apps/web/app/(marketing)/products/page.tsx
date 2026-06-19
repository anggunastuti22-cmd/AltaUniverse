import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage() {
  const supabase = await createClient();
  // Public read: RLS only returns published catalogue rows (no private data).
  const { data: products } = await supabase
    .from('lab_products')
    .select('id, name, brand, category, key_ingredients')
    .order('name');

  const list = products ?? [];

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: `${space['3xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: color.lab,
        }}
      >
        AltaLab · catalogue
      </span>
      <h1 style={{ fontSize: 40, margin: `${space.sm}px 0` }}>Skincare products</h1>
      <p style={{ color: color.textMuted, maxWidth: 560 }}>
        A reference catalogue for education and tracking. No efficacy claims, no results promised.
      </p>

      {list.length === 0 ? (
        <p style={{ color: color.textMuted, marginTop: space.xl }}>No published products yet.</p>
      ) : (
        <div
          style={{
            marginTop: space.xl,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: space.md,
          }}
        >
          {list.map((p) => (
            <div
              key={p.id}
              style={{
                border: `1px solid ${color.border}`,
                borderLeft: `3px solid ${color.lab}`,
                borderRadius: radius.lg,
                padding: space.lg,
                backgroundColor: color.surface,
              }}
            >
              <strong style={{ color: color.text }}>{p.name}</strong>
              <div style={{ color: color.textMuted, fontSize: fontSize.xs }}>
                {p.brand ? `${p.brand} · ` : ''}
                {p.category}
              </div>
              {p.key_ingredients.length > 0 ? (
                <p
                  style={{
                    color: color.textSubtle,
                    fontSize: fontSize.xs,
                    margin: `${space.sm}px 0 0`,
                  }}
                >
                  {p.key_ingredients.join(', ')}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
