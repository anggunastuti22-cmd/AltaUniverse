-- 0012_lock_down_operational_functions.sql
-- Harden operational SECURITY DEFINER functions so they cannot be invoked from
-- the public REST API.
--
-- `enqueue_daily_reminders()` (0010) and `purge_due_deletions()` (0011) are
-- meant to be called only by the scheduler (pg_cron runs them as the owning
-- superuser) — never by end users. `revoke ... from public` in their original
-- migrations was insufficient: Supabase's default privileges grant EXECUTE on
-- new public functions to `anon` and `authenticated` explicitly, so PostgREST
-- still exposed them at `/rest/v1/rpc/...`. Revoke those grants directly.
--
-- The function owner (and service_role) retain EXECUTE, so the cron jobs keep
-- working. No data/schema change — security only.

revoke all on function public.enqueue_daily_reminders() from public, anon, authenticated;
revoke all on function public.purge_due_deletions() from public, anon, authenticated;
