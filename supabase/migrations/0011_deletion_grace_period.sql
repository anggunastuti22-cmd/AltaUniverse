-- 0011_deletion_grace_period.sql
-- Account deletion with a grace period. A request is recorded (pending) and the
-- account is purged after `purge_after` by a scheduled job; the user can cancel
-- any time before then.

create type deletion_status as enum ('pending', 'cancelled', 'completed');

create table deletion_requests (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  status       deletion_status not null default 'pending',
  requested_at timestamptz not null default now(),
  purge_after  timestamptz not null,
  updated_at   timestamptz not null default now()
);
comment on table deletion_requests is 'Account deletion requests with a grace period. Inserted by the delete-account Edge Function (service role); the owner may cancel; purged by purge_due_deletions().';

alter table deletion_requests enable row level security;
grant select, update on deletion_requests to authenticated;
grant all on deletion_requests to service_role;
-- Owner can see and cancel their own request; inserts happen via service role.
create policy owner_select on deletion_requests for select to authenticated using (user_id = auth.uid());
create policy owner_cancel on deletion_requests for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger trg_set_updated_at before update on deletion_requests
  for each row execute function public.set_updated_at();

-- Purge accounts whose grace period has elapsed. Deleting auth.users cascades
-- all owned data; audit_events is retained (actor nulled).
create or replace function public.purge_due_deletions()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  r record;
begin
  for r in select user_id from deletion_requests where status = 'pending' and purge_after <= now()
  loop
    insert into audit_events (action, target_table, target_id, metadata)
    values ('account.purge', 'auth.users', r.user_id, jsonb_build_object('scheduled', true));
    delete from auth.users where id = r.user_id;
  end loop;
end;
$$;
revoke all on function public.purge_due_deletions() from public;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('alta-purge-deletions', '30 3 * * *', 'select public.purge_due_deletions();');
exception
  when others then
    raise notice 'pg_cron not scheduled: %', sqlerrm;
end
$$;
