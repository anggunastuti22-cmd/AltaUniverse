// Edge Function: enqueue-reminders
// Creates gentle, system-generated reminders for the calling user — respecting
// their notifications consent and preferences, and idempotent within a day.
//
// notifications.insert is service-role only (RLS), so reminders are created here,
// never by the client directly. Intended to be scheduled (e.g. pg_cron) in
// production; can also be invoked on demand. verify_jwt enabled.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const admin = createClient(url, serviceKey);

  // Respect notifications consent.
  const { data: consent } = await admin
    .from('user_consents')
    .select('granted')
    .eq('user_id', user.id)
    .eq('consent_type', 'notifications')
    .maybeSingle();
  if (!consent?.granted) return json({ created: 0, reason: 'notifications-consent-off' });

  const { data: prefs } = await admin
    .from('user_preferences')
    .select('notify_routine_reminders, notify_weekly_review')
    .eq('user_id', user.id)
    .maybeSingle();
  const { data: profile } = await admin
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const tz = profile?.timezone ?? 'UTC';

  const since = new Date(Date.now() - 18 * 3600 * 1000).toISOString();
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(
    new Date(),
  );

  const toInsert: { user_id: string; type: string; title: string; body: string }[] = [];

  // Routine reminder (daily) — only if the user has at least one routine.
  if (prefs?.notify_routine_reminders) {
    const { count: routineCount } = await admin
      .from('lab_routines')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    const { count: already } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'routine_reminder')
      .gte('created_at', since);
    if ((routineCount ?? 0) > 0 && (already ?? 0) === 0) {
      toInsert.push({
        user_id: user.id,
        type: 'routine_reminder',
        title: 'Your skincare routine',
        body: 'A gentle nudge to follow your routine today, if it helps.',
      });
    }
  }

  // Weekly reset nudge (Mondays).
  if (prefs?.notify_weekly_review && weekday === 'Monday') {
    const weekAgo = new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString();
    const { count: already } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'weekly_review')
      .gte('created_at', weekAgo);
    if ((already ?? 0) === 0) {
      toInsert.push({
        user_id: user.id,
        type: 'weekly_review',
        title: 'Weekly reset',
        body: 'A few quiet minutes to reflect on your week, whenever you’re ready.',
      });
    }
  }

  if (toInsert.length > 0) {
    await admin.from('notifications').insert(toInsert);
  }
  return json({ created: toInsert.length });
});
