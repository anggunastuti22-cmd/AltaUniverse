-- 0010_schedule_reminders.sql
-- Automatic daily reminders (server-side), replacing the need to invoke the
-- enqueue-reminders Edge Function manually. The function inserts gentle
-- reminders for eligible users, respecting notifications consent + preferences,
-- idempotent within a day. Scheduled with pg_cron at 08:00 UTC.

create or replace function public.enqueue_daily_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Routine reminder (daily) for users with a routine, consent + preference on.
  insert into notifications (user_id, type, title, body)
  select p.user_id, 'routine_reminder', 'Your skincare routine',
         'A gentle nudge to follow your routine today, if it helps.'
  from user_preferences p
  join user_consents c
    on c.user_id = p.user_id and c.consent_type = 'notifications' and c.granted
  where p.notify_routine_reminders
    and exists (select 1 from lab_routines r where r.user_id = p.user_id)
    and not exists (
      select 1 from notifications n
      where n.user_id = p.user_id and n.type = 'routine_reminder'
        and n.created_at >= now() - interval '18 hours'
    );

  -- Weekly reset nudge on Mondays (UTC).
  if extract(isodow from now()) = 1 then
    insert into notifications (user_id, type, title, body)
    select p.user_id, 'weekly_review', 'Weekly reset',
           'A few quiet minutes to reflect on your week, whenever you are ready.'
    from user_preferences p
    join user_consents c
      on c.user_id = p.user_id and c.consent_type = 'notifications' and c.granted
    where p.notify_weekly_review
      and not exists (
        select 1 from notifications n
        where n.user_id = p.user_id and n.type = 'weekly_review'
          and n.created_at >= now() - interval '6 days'
      );
  end if;
end;
$$;
revoke all on function public.enqueue_daily_reminders() from public;

-- Scheduling requires pg_cron (available on Supabase). Best-effort so this
-- migration still applies on plain PostgreSQL (e.g. the no-Docker test harness).
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule(
    'alta-daily-reminders',
    '0 8 * * *',
    'select public.enqueue_daily_reminders();'
  );
exception
  when others then
    raise notice 'pg_cron not scheduled (unavailable or already scheduled): %', sqlerrm;
end
$$;
