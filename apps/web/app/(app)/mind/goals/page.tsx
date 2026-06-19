import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { createGoal } from '../actions';

export default async function GoalsPage({
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

  const [{ data: goals }, { data: domains }] = await Promise.all([
    supabase
      .from('mind_goals')
      .select('id, title, detail, status, life_domain_id')
      .order('created_at', { ascending: false }),
    supabase.from('mind_life_domains').select('id, name').order('sort_order'),
  ]);
  const domainName = new Map((domains ?? []).map((d) => [d.id, d.name]));

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Goals &amp; progress</h1>
      <p style={muted}>Reflective intentions, not strict targets. Tie them to a life domain.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'empty' ? 'Give the goal a title.' : sp.error}
        </p>
      ) : null}

      <form action={createGoal} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="title">
            Goal
          </label>
          <input id="title" name="title" required maxLength={200} style={field} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
          <div>
            <label style={labelStyle} htmlFor="life_domain_id">
              Life domain (optional)
            </label>
            <select id="life_domain_id" name="life_domain_id" style={field} defaultValue="">
              <option value="">None</option>
              {(domains ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="detail">
              Detail (optional)
            </label>
            <input id="detail" name="detail" style={field} />
          </div>
        </div>
        <div>
          <button type="submit" style={primaryBtn}>
            Add goal
          </button>
        </div>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(goals ?? []).length === 0 ? (
          <p style={muted}>No goals yet.</p>
        ) : (
          (goals ?? []).map((g) => (
            <div key={g.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm }}>
                <strong style={{ color: color.text }}>{g.title}</strong>
                <span style={{ ...muted, fontSize: fontSize.xs, textTransform: 'capitalize' }}>
                  {g.status}
                </span>
              </div>
              {g.life_domain_id && domainName.get(g.life_domain_id) ? (
                <span style={{ fontSize: fontSize.xs, color: color.mindText }}>
                  {domainName.get(g.life_domain_id)}
                </span>
              ) : null}
              {g.detail ? (
                <p style={{ ...muted, margin: `${space.xs}px 0 0` }}>{g.detail}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
