import Link from 'next/link';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';

type LinkedIngredient = { slug: string; name: string };

export default async function ProductsPage() {
  const supabase = await createClient();
  // Public read: RLS only returns published catalogue rows (no private data).
  const { data: products } = await supabase
    .from('lab_products')
    .select('id, name, brand, category, key_ingredients')
    .order('name');

  const list = products ?? [];

  // Fetch linked ingredients for the listed products. The generated types carry
  // no relationship metadata, so we query the join table and ingredients
  // separately and join in JS (RLS returns published ingredients only).
  const byProduct = new Map<string, LinkedIngredient[]>();
  if (list.length > 0) {
    const { data: links } = await supabase
      .from('lab_product_ingredients')
      .select('product_id, ingredient_id')
      .in(
        'product_id',
        list.map((p) => p.id),
      );
    const ingredientIds = [...new Set((links ?? []).map((l) => l.ingredient_id))];
    const { data: ingredients } = ingredientIds.length
      ? await supabase.from('lab_ingredients').select('id, slug, name').in('id', ingredientIds)
      : { data: [] };
    const ingredientById = new Map((ingredients ?? []).map((i) => [i.id, i]));
    for (const l of links ?? []) {
      const ing = ingredientById.get(l.ingredient_id);
      if (!ing) continue;
      const arr = byProduct.get(l.product_id) ?? [];
      arr.push({ slug: ing.slug, name: ing.name });
      byProduct.set(l.product_id, arr);
    }
  }

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
              <h2
                style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600, color: color.text }}
              >
                {p.name}
              </h2>
              <div style={{ color: color.textMuted, fontSize: fontSize.xs }}>
                {p.brand ? `${p.brand} · ` : ''}
                {p.category}
              </div>
              {(() => {
                const linked = byProduct.get(p.id) ?? [];
                if (linked.length > 0) {
                  return (
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: space.xs,
                        padding: 0,
                        margin: `${space.sm}px 0 0`,
                      }}
                    >
                      {linked.map((ing) => (
                        <li key={ing.slug}>
                          <Link
                            href={`/ingredients/${ing.slug}`}
                            style={{
                              display: 'inline-block',
                              fontSize: fontSize.xs,
                              color: color.labText,
                              textDecoration: 'none',
                              border: `1px solid ${color.border}`,
                              borderRadius: radius.md,
                              padding: `${space.xs}px ${space.sm}px`,
                            }}
                          >
                            {ing.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (p.key_ingredients.length > 0) {
                  return (
                    <p
                      style={{
                        color: color.textSubtle,
                        fontSize: fontSize.xs,
                        margin: `${space.sm}px 0 0`,
                      }}
                    >
                      {p.key_ingredients.join(', ')}
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
