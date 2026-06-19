-- 0013_index_user_product_fks.sql
-- Add covering indexes for the two foreign keys that reference
-- lab_user_products (id). Postgres does not auto-index FK columns, and both use
-- `on delete set null`, so deleting a cabinet product would otherwise force a
-- sequential scan of these tables to null the references. The indexes also
-- speed up lookups of routine steps / experiments by cabinet product.

create index if not exists idx_lab_routine_steps_user_product
  on lab_routine_steps (user_product_id);
create index if not exists idx_lab_experiments_user_product
  on lab_experiments (user_product_id);
