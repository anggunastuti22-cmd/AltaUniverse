import { notFound } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';

export default async function IngredientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Public read: RLS only returns published ingredients (generic education only).
  const { data: ingredient } = await supabase
    .from('lab_ingredients')
    .select('id, slug, name, inci_name, class, summary')
    .eq('slug', slug)
    .maybeSingle();

  if (!ingredient) notFound();

  // Find products linked to this ingredient. The generated types carry no
  // relationship metadata, so we query the join table then the products
  // separately and join in JS (RLS returns published products only).
  const { data: links } = await supabase
    .from('lab_product_ingredients')
    .select('product_id')
    .eq('ingredient_id', ingredient.id);

  const productIds = (links ?? []).map((l) => l.product_id);

  const { data: products } = productIds.length
    ? await supabase
        .from('lab_products')
        .select('id, name, brand, category')
        .in('id', productIds)
        .order('name')
    : { data: [] };

  const productList = products ?? [];

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: `${space['3xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: color.labText,
        }}
      >
        AltaLab · ingredient
      </span>
      <h1 style={{ fontSize: 40, margin: `${space.sm}px 0` }}>{ingredient.name}</h1>

      {ingredient.inci_name ? (
        <p style={{ color: color.textMuted, margin: `0 0 ${space.sm}px` }}>
          {ingredient.inci_name}
        </p>
      ) : null}

      {ingredient.class ? (
        <span
          style={{
            display: 'inline-block',
            fontSize: fontSize.xs,
            color: color.labText,
            border: `1px solid ${color.border}`,
            borderRadius: radius.md,
            padding: `${space.xs}px ${space.sm}px`,
          }}
        >
          {ingredient.class.replace(/_/g, ' ')}
        </span>
      ) : null}

      {ingredient.summary ? (
        <p style={{ color: color.text, maxWidth: 560, marginTop: space.lg }}>
          {ingredient.summary}
        </p>
      ) : null}

      <p style={{ color: color.textSubtle, fontSize: fontSize.xs, marginTop: space.md }}>
        General education, not medical advice.
      </p>

      {productList.length > 0 ? (
        <section style={{ marginTop: space['2xl'] }}>
          <h2 style={{ fontSize: fontSize.lg, margin: `0 0 ${space.md}px` }}>
            Products containing it
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: space.md,
            }}
          >
            {productList.map((p) => (
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
                <h3
                  style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600, color: color.text }}
                >
                  {p.name}
                </h3>
                <div style={{ color: color.textMuted, fontSize: fontSize.xs }}>
                  {p.brand ? `${p.brand} · ` : ''}
                  {p.category}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
