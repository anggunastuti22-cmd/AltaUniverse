-- 0009_security_hardening.sql
-- Address Supabase security advisors after the AltaMind/AltaWear/AltaLab DDL.
-- All statements are idempotent.

-- 1. Pin search_path on helper functions (function_search_path_mutable).
alter function public.set_updated_at() set search_path = '';
alter function public.setup_owned_table(regclass) set search_path = '';

-- 2. is_admin() should not be callable by anonymous visitors
--    (anon_security_definer_function_executable). authenticated keeps EXECUTE
--    because owner-scoped admin policies call it.
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. Avatars is a public bucket; a broad SELECT policy lets clients *list* every
--    file. Public object URLs work without it, so remove the listing policy
--    (public_bucket_allows_listing).
drop policy if exists "avatars public read" on storage.objects;

-- Note: audit_events intentionally has RLS enabled with NO policy and no
-- anon/authenticated grants — it is reachable only via the service role
-- (server/Edge Functions). This satisfies "deny by default".
