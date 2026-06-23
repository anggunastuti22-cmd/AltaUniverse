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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: space.md,
          }}
        >
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

      {(products ?? []).length === 0 ? (
        <p style={{ color: color.textMuted }}>No products yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize.sm }}>
          <caption style={{ color: color.textMuted, textAlign: 'left', marginBottom: space.sm }}>
            Catalogue products
          </caption>
          <thead>
            <tr style={{ textAlign: 'left', color: color.textMuted }}>
              <th scope="col" style={{ padding: `${space.xs}px ${space.sm}px`, fontWeight: 600 }}>
                Product
              </th>
              <th scope="col" style={{ padding: `${space.xs}px ${space.sm}px`, fontWeight: 600 }}>
                Details
              </th>
              <th scope="col" style={{ padding: `${space.xs}px ${space.sm}px`, fontWeight: 600 }}>
                Status
              </th>
              <th scope="col" style={{ padding: `${space.xs}px ${space.sm}px`, fontWeight: 600 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${color.border}` }}>
                <th
                  scope="row"
                  style={{
                    padding: space.sm,
                    fontWeight: 600,
                    color: color.text,
                    textAlign: 'left',
                  }}
                >
                  {p.name}
                </th>
                <td style={{ padding: space.sm, color: color.textMuted }}>
                  {p.brand ? `${p.brand} · ` : ''}
                  {p.category}
                </td>
                <td
                  style={{
                    padding: space.sm,
                    color: p.is_published ? color.success : color.textSubtle,
                  }}
                >
                  {p.is_published ? 'Published' : 'Draft'}
                </td>
                <td style={{ padding: space.sm }}>
                  <div style={{ display: 'flex', gap: space.sm }}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
