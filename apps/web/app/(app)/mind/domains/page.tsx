import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { createLifeDomain } from '../actions';

export default async function DomainsPage({
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

  const { data: domains } = await supabase
    .from('mind_life_domains')
    .select('id, name, description')
    .order('sort_order');

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Life domains</h1>
      <p style={muted}>
        The areas of life you want to pay attention to — career, health, relationships…
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'empty' ? 'Give the domain a name.' : sp.error}
        </p>
      ) : null}

      <form action={createLifeDomain} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={80}
            style={field}
            placeholder="e.g. Career"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="description">
            Description (optional)
          </label>
          <input id="description" name="description" style={field} />
        </div>
        <div>
          <button type="submit" style={primaryBtn}>
            Add domain
          </button>
        </div>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(domains ?? []).length === 0 ? (
          <p style={muted}>No domains yet.</p>
        ) : (
          (domains ?? []).map((d) => (
            <div key={d.id} style={{ ...card, borderLeft: `3px solid ${color.mind}` }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--alta-font-family-display)',
                  fontSize: fontSize.lg,
                }}
              >
                {d.name}
              </h2>
              {d.description ? (
                <p style={{ ...muted, margin: `${space.xs}px 0 0` }}>{d.description}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
