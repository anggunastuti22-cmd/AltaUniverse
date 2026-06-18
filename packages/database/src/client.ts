import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from '@supabase/supabase-js';
import type { Database } from './types.gen';

export type AltaSupabaseClient = SupabaseClient<Database>;

export interface CreateClientParams {
  /** Supabase project URL. */
  url: string;
  /**
   * The Supabase **publishable** (anon) key — the only key allowed in web /
   * mobile clients. The secret/service-role key must never be passed here from
   * a client bundle (see CLAUDE.md §2, PRIVACY_AND_SECURITY.md §4).
   */
  key: string;
  options?: SupabaseClientOptions<'public'>;
}

/**
 * Framework-agnostic Supabase client factory typed against the generated
 * `Database` schema. Apps supply platform-specific options (e.g. an RN storage
 * adapter) via `options`.
 */
export function createSupabaseClient(params: CreateClientParams): AltaSupabaseClient {
  return createClient<Database>(params.url, params.key, params.options);
}
