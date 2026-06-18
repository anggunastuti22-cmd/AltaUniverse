import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { saveStyleProfile } from '../actions';

const STYLE_WORDS = ['Tailored', 'Minimal', 'Romantic', 'Edgy', 'Classic'];
const OCCASIONS = ['Work', 'Casual', 'Social', 'Active'];

export default async function StylePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('wear_style_profiles')
    .select('preferred_colors, preferred_fits, occasions, notes')
    .eq('user_id', user.id)
    .maybeSingle();

  const fits = new Set(profile?.preferred_fits ?? []);
  const occ = new Set(profile?.occasions ?? []);

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Style profile</h1>
      <p style={muted}>Describe your real life so AltaWear reflects it — editable forever.</p>

      {sp.saved ? (
        <p role="status" style={{ color: color.success }}>
          Saved.
        </p>
      ) : null}

      <form action={saveStyleProfile} style={{ ...card, display: 'grid', gap: space.lg }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Style words you relate to</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.md }}>
            {STYLE_WORDS.map((w) => (
              <label key={w} style={{ display: 'flex', gap: space.xs, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="preferred_fits"
                  value={w}
                  defaultChecked={fits.has(w)}
                />
                {w}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>How your week actually splits</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.md }}>
            {OCCASIONS.map((o) => (
              <label key={o} style={{ display: 'flex', gap: space.xs, alignItems: 'center' }}>
                <input type="checkbox" name="occasions" value={o} defaultChecked={occ.has(o)} />
                {o}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label style={labelStyle} htmlFor="preferred_colors">
            Colours you wear most (one per line or comma-separated)
          </label>
          <textarea
            id="preferred_colors"
            name="preferred_colors"
            rows={3}
            defaultValue={(profile?.preferred_colors ?? []).join('\n')}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="notes">
            Fit notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={profile?.notes ?? ''}
            placeholder="Prefer relaxed shoulders; size up in knitwear."
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <button type="submit" style={primaryBtn}>
            Save style profile
          </button>
        </div>
      </form>
    </div>
  );
}
