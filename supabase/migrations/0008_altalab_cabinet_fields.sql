-- 0008_altalab_cabinet_fields.sql
-- AltaLab Product Cabinet: add the fields the design needs on the user's cabinet
-- (function, cadence, brand, estimated uses for cost-per-use). Educational only —
-- no efficacy claims; overlap is computed, never stored. Additive + safe to re-run.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'product_function') then
    create type product_function as enum ('cleanse', 'treat', 'moisturise', 'protect');
  end if;
end $$;

alter table lab_user_products
  add column if not exists brand text;
alter table lab_user_products
  add column if not exists function product_function;
alter table lab_user_products
  add column if not exists cadence text;
alter table lab_user_products
  add column if not exists est_uses integer check (est_uses is null or est_uses > 0);

comment on column lab_user_products.function is 'Cleanse/treat/moisturise/protect. Used to compute (educational) function overlap.';
comment on column lab_user_products.est_uses is 'Estimated number of uses, for derived cost-per-use (price_paid / est_uses).';
