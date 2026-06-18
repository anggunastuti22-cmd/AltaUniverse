/**
 * GENERATED TYPES (placeholder).
 *
 * This file is regenerated from the local Supabase schema:
 *
 *   pnpm db:types
 *   # => supabase gen types typescript --local > packages/database/src/types.gen.ts
 *
 * It is intentionally an empty-but-valid schema during the foundation phase,
 * because no migrations have been authored yet (see supabase/migrations).
 * Do NOT hand-edit beyond this placeholder; regenerate after each migration.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
