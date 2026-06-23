import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { createDecision } from '../actions';

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export default async function DecisionsPage({
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

  const { data: decisions } = await supabase
    .from('mind_decisions')
    .select('id, title, context, options, factors, reflection, status')
    .order('created_at', { ascending: false });

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Decision room</h1>
      <p style={muted}>
        Frame a decision: options, the factors that matter, and your reflection. AltaMind never
        decides for you — you do.
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'empty' ? 'Give the decision a title.' : sp.error}
        </p>
      ) : null}

      <form action={createDecision} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="title">
            Decision
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            style={field}
            placeholder="e.g. Which role to take"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="context">
            Context (optional)
          </label>
          <textarea id="context" name="context" rows={2} style={{ ...field, resize: 'vertical' }} />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: space.md,
          }}
        >
          <div>
            <label style={labelStyle} htmlFor="options">
              Options (one per line)
            </label>
            <textarea
              id="options"
              name="options"
              rows={4}
              style={{ ...field, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="factors">
              Factors (one per line)
            </label>
            <textarea
              id="factors"
              name="factors"
              rows={4}
              style={{ ...field, resize: 'vertical' }}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle} htmlFor="reflection">
            Reflection (optional)
          </label>
          <textarea
            id="reflection"
            name="reflection"
            rows={3}
            style={{ ...field, resize: 'vertical' }}
          />
        </div>
        <div>
          <button type="submit" style={primaryBtn}>
            Save decision
          </button>
        </div>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.md }}>
        {(decisions ?? []).length === 0 ? (
          <p style={muted}>No decisions framed yet.</p>
        ) : (
          (decisions ?? []).map((d) => {
            const options = asList(d.options);
            const factors = asList(d.factors);
            return (
              <article key={d.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--alta-font-family-display)',
                      fontSize: fontSize.lg,
                    }}
                  >
                    {d.title}
                  </h2>
                  <span style={{ ...muted, fontSize: fontSize.xs, textTransform: 'capitalize' }}>
                    {d.status}
                  </span>
                </div>
                {d.context ? (
                  <p style={{ ...muted, margin: `${space.xs}px 0` }}>{d.context}</p>
                ) : null}
                <div
                  style={{ display: 'flex', gap: space.xl, flexWrap: 'wrap', marginTop: space.xs }}
                >
                  {options.length > 0 ? (
                    <div>
                      <span style={{ ...muted, fontSize: fontSize.xs }}>Options</span>
                      <ul style={{ margin: `${space.xs}px 0 0`, paddingLeft: space.lg }}>
                        {options.map((o, i) => (
                          <li key={i} style={{ color: color.text }}>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {factors.length > 0 ? (
                    <div>
                      <span style={{ ...muted, fontSize: fontSize.xs }}>Factors</span>
                      <ul style={{ margin: `${space.xs}px 0 0`, paddingLeft: space.lg }}>
                        {factors.map((f, i) => (
                          <li key={i} style={{ color: color.text }}>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {d.reflection ? (
                  <p
                    style={{
                      margin: `${space.sm}px 0 0`,
                      color: color.text,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {d.reflection}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
