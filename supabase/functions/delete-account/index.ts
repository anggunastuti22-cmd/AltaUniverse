// Edge Function: delete-account
// Permanently deletes the calling user's account. Deleting the auth.users row
// cascades all owned data (every user_id FK is ON DELETE CASCADE); audit_events
// is retained with the actor reference nulled (ON DELETE SET NULL).
//
// The user is identified from their JWT (verify_jwt enabled); the service role
// performs the privileged delete and writes the audit row.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

  const admin = createClient(url, serviceKey);

  // Audit before deletion (actor_user_id is nulled by FK after the delete).
  await admin.from('audit_events').insert({
    actor_user_id: user.id,
    actor_role: 'authenticated',
    action: 'account.delete',
    target_table: 'auth.users',
    target_id: user.id,
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
});
