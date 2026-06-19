// Edge Function: export-user-data
// Returns a complete JSON export of the calling user's own data.
//
// Reads use a USER-SCOPED client so RLS guarantees only the caller's rows are
// returned (no service-role read of private content). The service role is used
// ONLY to append an audit_events row. verify_jwt is enabled.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const TABLES = [
  'profiles',
  'user_preferences',
  'user_consents',
  'mind_life_domains',
  'mind_checkins',
  'mind_journal_entries',
  'mind_goals',
  'mind_weekly_reviews',
  'mind_decisions',
  'wear_style_profiles',
  'wear_items',
  'wear_item_images',
  'wear_outfits',
  'wear_outfit_items',
  'wear_usage_logs',
  'wear_wishlist',
  'lab_user_products',
  'lab_skin_profiles',
  'lab_routines',
  'lab_routine_steps',
  'lab_skin_logs',
  'lab_experiments',
] as const;

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });

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
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

  const data: Record<string, unknown> = {
    format: 'alta-universe-export-v1',
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
  };
  for (const table of TABLES) {
    const { data: rows } = await userClient.from(table).select('*');
    data[table] = rows ?? [];
  }

  // Audit (service role; audit_events is server-only).
  const admin = createClient(url, serviceKey);
  await admin.from('audit_events').insert({
    actor_user_id: user.id,
    actor_role: 'authenticated',
    action: 'account.export',
    metadata: { tables: TABLES.length },
  });

  return json(data, 200, {
    'Content-Disposition': 'attachment; filename="alta-universe-export.json"',
  });
});
