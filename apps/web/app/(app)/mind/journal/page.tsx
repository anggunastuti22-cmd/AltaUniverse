import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { createJournalEntry } from '../actions';

export default async function JournalPage({
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

  const [{ data: entries }, { data: domains }] = await Promise.all([
    supabase
      .from('mind_journal_entries')
      .select('id, body, entry_date, life_domain_id')
      .order('entry_date', { ascending: false })
      .limit(50),
    supabase.from('mind_life_domains').select('id, name').order('sort_order'),
  ]);

  const domainName = new Map((domains ?? []).map((d) => [d.id, d.name]));

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Journal</h1>
      <p style={muted}>Private free writing. Tag it or link it to a life domain if it helps.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'empty' ? 'Write something before saving.' : sp.error}
        </p>
      ) : null}

      <form action={createJournalEntry} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="body">
            New entry
          </label>
          <textarea
            id="body"
            name="body"
            rows={5}
            required
            placeholder="Today I noticed…"
            style={{ ...field, resize: 'vertical' }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: space.md,
          }}
        >
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
            <label style={labelStyle} htmlFor="tags">
              Tags (optional, one per line)
            </label>
            <input id="tags" name="tags" style={field} placeholder="reflection" />
          </div>
        </div>
        <div>
          <button type="submit" style={primaryBtn}>
            Save entry
          </button>
        </div>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.md }}>
        {(entries ?? []).length === 0 ? (
          <p style={muted}>No entries yet.</p>
        ) : (
          (entries ?? []).map((e) => (
            <article key={e.id} style={card}>
              <div style={{ display: 'flex', gap: space.sm, alignItems: 'baseline' }}>
                <span style={{ ...muted, fontSize: fontSize.xs }}>{e.entry_date}</span>
                {e.life_domain_id && domainName.get(e.life_domain_id) ? (
                  <span style={{ fontSize: fontSize.xs, color: color.mindText }}>
                    · {domainName.get(e.life_domain_id)}
                  </span>
                ) : null}
              </div>
              <p style={{ margin: `${space.xs}px 0 0`, color: color.text, whiteSpace: 'pre-wrap' }}>
                {e.body}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
