import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { createProduct, deleteProduct, togglePublish } from './actions';

const field = {
  display: 'block',
  width: '100%',
  padding: space.sm,
  borderRadius: radius.md,
  border: `1px solid ${color.border}`,
  fontSize: 15,
} as const;
const label = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 } as const;
const cardStyle = {
  border: `1px solid ${color.border}`,
  borderRadius: radius.lg,
  padding: space.lg,
  backgroundColor: color.surface,
} as const;

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('lab_products')
    .select('id, name, brand, category, is_published, key_ingredients')
    .order('created_at', { ascending: false });

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: space.xl }}>
      <h1 style={{ marginTop: 0 }}>Product catalogue</h1>
      <p style={{ color: color.textMuted }}>
        Shared skincare catalogue (AltaLab). Published rows are publicly readable; drafts are not.
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Name and category are required.' : sp.error}
        </p>
      ) : null}

      <form
        action={createProduct}
        style={{ ...cardStyle, display: 'grid', gap: space.md, marginBottom: space.xl }}
      >
        <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>Add product</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.md }}>
          <div>
            <label style={label} htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required style={field} />
          </div>
          <div>
            <label style={label} htmlFor="brand">
              Brand
            </label>
            <input id="brand" name="brand" style={field} />
          </div>
          <div>
            <label style={label} htmlFor="category">
              Category
            </label>
            <input id="category" name="category" required style={field} placeholder="cleanser" />
          </div>
        </div>
        <div>
          <label style={label} htmlFor="key_ingredients">
            Key ingredients (comma or newline separated)
          </label>
          <input
            id="key_ingredients"
            name="key_ingredients"
            style={field}
            placeholder="niacinamide, glycerin"
          />
        </div>
        <label style={{ display: 'flex', gap: space.sm, alignItems: 'center' }}>
          <input type="checkbox" name="is_published" /> Publish immediately
        </label>
        <button
          type="submit"
          style={{
            justifySelf: 'start',
            padding: `${space.sm}px ${space.lg}px`,
            borderRadius: radius.md,
            border: '1px solid transparent',
            backgroundColor: color.primary,
            color: color.primaryContrast,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Add product
        </button>
      </form>

      <div style={{ display: 'grid', gap: space.sm }}>
        {(products ?? []).length === 0 ? (
          <p style={{ color: color.textMuted }}>No products yet.</p>
        ) : (
          (products ?? []).map((p) => (
            <div
              key={p.id}
              style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: space.md }}
            >
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    display: 'inline',
                    margin: 0,
                    fontSize: fontSize.base,
                    fontWeight: 600,
                    color: color.text,
                  }}
                >
                  {p.name}
                </h2>
                <span
                  style={{ color: color.textMuted, fontSize: fontSize.xs, marginLeft: space.sm }}
                >
                  {p.brand ? `${p.brand} · ` : ''}
                  {p.category}
                </span>
                <div>
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      color: p.is_published ? color.success : color.textSubtle,
                    }}
                  >
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <form action={togglePublish}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="next" value={p.is_published ? 'false' : 'true'} />
                <button
                  type="submit"
                  style={{
                    border: `1px solid ${color.border}`,
                    background: 'transparent',
                    borderRadius: radius.md,
                    padding: `${space.xs}px ${space.md}px`,
                    cursor: 'pointer',
                    fontSize: fontSize.sm,
                  }}
                >
                  {p.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </form>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: color.danger,
                    cursor: 'pointer',
                    fontSize: fontSize.sm,
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
