-- 0007_altamind_checkin_fields.sql
-- AltaMind Daily Check-in: add the remaining gentle inputs from the design
-- (focus, mental load, primary need). All non-diagnostic, owner-only, excluded
-- from analytics. Additive + safe to re-run.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'primary_need') then
    create type primary_need as enum (
      'rest', 'space', 'connection', 'focus', 'movement', 'comfort', 'direction'
    );
  end if;
end $$;

alter table mind_checkins
  add column if not exists focus smallint check (focus between 1 and 5);
alter table mind_checkins
  add column if not exists mental_load smallint check (mental_load between 1 and 5);
alter table mind_checkins
  add column if not exists primary_need primary_need;

comment on column mind_checkins.mental_load is 'Self-reported capacity (1 light .. 5 heavy). Informational, never an alarm.';
comment on column mind_checkins.primary_need is 'What the user most needs right now. Reflective, never prescriptive.';
