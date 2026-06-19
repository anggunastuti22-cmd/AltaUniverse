import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, eduBox, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { createExperiment } from '../actions';

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: experiments }, { data: products }] = await Promise.all([
    supabase
      .from('lab_experiments')
      .select('id, hypothesis, status, started_on, ended_on, outcome, user_product_id')
      .order('created_at', { ascending: false }),
    supabase.from('lab_user_products').select('id, custom_name'),
  ]);
  const productName = new Map((products ?? []).map((p) => [p.id, p.custom_name]));

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Product experiments</h1>
      <p style={muted}>
        Try one change at a time and note what you observe — calmly, never as proof.
      </p>

      <div style={{ ...eduBox, marginBottom: space.lg }}>
        An experiment is a structured note for yourself, not a clinical trial. No results are
        promised.
      </div>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Describe what you want to try.' : sp.error}
        </p>
      ) : null}

      <form action={createExperiment} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="hypothesis">
            What do you want to try?
          </label>
          <textarea
            id="hypothesis"
            name="hypothesis"
            rows={2}
            required
            placeholder="New cleanser reduces dryness over 4 weeks."
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: space.md }}>
          <div>
            <label style={labelStyle} htmlFor="user_product_id">
              Product (optional)
            </label>
            <select id="user_product_id" name="user_product_id" style={fieldStyle} defaultValue="">
              <option value="">—</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.custom_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="started_on">
              Start date
            </label>
            <input id="started_on" name="started_on" type="date" style={fieldStyle} />
          </div>
        </div>
        <button type="submit" style={primaryBtn}>
          Start experiment
        </button>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(experiments ?? []).length === 0 ? (
          <p style={muted}>No experiments yet.</p>
        ) : (
          (experiments ?? []).map((e) => (
            <article key={e.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm }}>
                <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600, color: color.text }}>
                  {e.hypothesis}
                </h2>
                <span style={{ ...muted, fontSize: fontSize.xs, textTransform: 'capitalize' }}>
                  {e.status}
                </span>
              </div>
              <span style={{ ...muted, fontSize: fontSize.xs }}>
                {e.user_product_id ? (productName.get(e.user_product_id) ?? '') : ''}
                {e.started_on ? ` · from ${e.started_on}` : ''}
              </span>
              {e.outcome ? (
                <p style={{ margin: `${space.xs}px 0 0`, color: color.text }}>{e.outcome}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
