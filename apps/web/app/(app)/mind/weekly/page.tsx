import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { saveWeeklyReview } from '../actions';

function currentWeekStart(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export default async function WeeklyPage({
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

  const weekStart = currentWeekStart(new Date());
  const { data: review } = await supabase
    .from('mind_weekly_reviews')
    .select('wins, friction, intention')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle();

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Weekly reset</h1>
      <p style={muted}>
        A gentle review for the week of {weekStart}. Wins, friction, and one intention.
      </p>

      {sp.saved ? (
        <p role="status" style={{ color: color.success }}>
          Saved.
        </p>
      ) : null}

      <form action={saveWeeklyReview} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="wins">
            Wins
          </label>
          <textarea
            id="wins"
            name="wins"
            rows={3}
            defaultValue={review?.wins ?? ''}
            style={{ ...field, resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="friction">
            Friction
          </label>
          <textarea
            id="friction"
            name="friction"
            rows={3}
            defaultValue={review?.friction ?? ''}
            style={{ ...field, resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="intention">
            Intention for next week
          </label>
          <textarea
            id="intention"
            name="intention"
            rows={2}
            defaultValue={review?.intention ?? ''}
            style={{ ...field, resize: 'vertical' }}
          />
        </div>
        <div>
          <button type="submit" style={primaryBtn}>
            {review ? 'Update reset' : 'Save reset'}
          </button>
        </div>
      </form>
    </div>
  );
}
