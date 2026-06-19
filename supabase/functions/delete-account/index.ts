// Edge Function: delete-account
// Schedules account deletion with a grace period (default 7 days) instead of
// deleting immediately. Records a pending deletion_requests row; the user can
// cancel before purge_after. A scheduled job (purge_due_deletions) performs the
// actual delete, which cascades all owned data; audit_events is retained.
//
// The user is identified from their JWT (verify_jwt enabled); the service role
// records the request and writes the audit row.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GRACE_DAYS = 7;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

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

  const purgeAfter = new Date(Date.now() + GRACE_DAYS * 24 * 3600 * 1000).toISOString();
  const admin = createClient(url, serviceKey);

  const { error } = await admin.from('deletion_requests').upsert(
    {
      user_id: user.id,
      status: 'pending',
      requested_at: new Date().toISOString(),
      purge_after: purgeAfter,
    },
    { onConflict: 'user_id' },
  );
  if (error) return json({ error: error.message }, 500);

  await admin.from('audit_events').insert({
    actor_user_id: user.id,
    actor_role: 'authenticated',
    action: 'account.delete_requested',
    target_table: 'auth.users',
    target_id: user.id,
    metadata: { purge_after: purgeAfter },
  });

  return json({ ok: true, scheduled_for: purgeAfter });
});
