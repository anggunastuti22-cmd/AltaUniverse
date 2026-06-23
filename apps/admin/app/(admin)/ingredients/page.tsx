import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { createIngredient, deleteIngredient, togglePublishIngredient } from './actions';

const INGREDIENT_CLASSES = [
  'retinoid',
  'aha',
  'bha',
  'vitamin_c',
  'niacinamide',
  'benzoyl_peroxide',
  'peptide',
  'hydrator',
  'ceramide',
  'spf',
  'antioxidant',
  'exfoliant_physical',
  'other',
] as const;

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

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  // Admin RLS sees unpublished rows too.
  const { data: ingredients } = await supabase
    .from('lab_ingredients')
    .select('id, name, slug, class, is_published')
    .order('created_at', { ascending: false });

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: space.xl }}>
      <h1 style={{ marginTop: 0 }}>Ingredients</h1>
      <p style={{ color: color.textMuted }}>
        Generic ingredient education (AltaLab). Published rows are publicly readable; drafts are
        not. Content is general education only — never personalized or medical advice.
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Name and slug are required.' : sp.error}
        </p>
      ) : null}

      <form
        action={createIngredient}
        style={{ ...cardStyle, display: 'grid', gap: space.md, marginBottom: space.xl }}
      >
        <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>Add ingredient</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            <label style={label} htmlFor="slug">
              Slug
            </label>
            <input id="slug" name="slug" required style={field} placeholder="niacinamide" />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: space.md,
          }}
        >
          <div>
            <label style={label} htmlFor="inci_name">
              INCI name
            </label>
            <input id="inci_name" name="inci_name" style={field} />
          </div>
          <div>
            <label style={label} htmlFor="class">
              Class
            </label>
            <select id="class" name="class" style={field} defaultValue="">
              <option value="">—</option>
              {INGREDIENT_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={label} htmlFor="summary">
            Summary
          </label>
          <textarea id="summary" name="summary" rows={3} style={field} />
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
          Add ingredient
        </button>
      </form>

      <div style={{ display: 'grid', gap: space.sm }}>
        {(ingredients ?? []).length === 0 ? (
          <p style={{ color: color.textMuted }}>No ingredients yet.</p>
        ) : (
          (ingredients ?? []).map((i) => (
            <div
              key={i.id}
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
                  {i.name}
                </h2>
                <span
                  style={{ color: color.textMuted, fontSize: fontSize.xs, marginLeft: space.sm }}
                >
                  {i.class ? `${i.class.replace(/_/g, ' ')} · ` : ''}
                  {i.slug}
                </span>
                <div>
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      color: i.is_published ? color.success : color.textSubtle,
                    }}
                  >
                    {i.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <form action={togglePublishIngredient}>
                <input type="hidden" name="id" value={i.id} />
                <input type="hidden" name="next" value={i.is_published ? 'false' : 'true'} />
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
                  {i.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </form>
              <form action={deleteIngredient}>
                <input type="hidden" name="id" value={i.id} />
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
