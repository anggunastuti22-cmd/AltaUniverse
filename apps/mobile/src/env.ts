import { z } from 'zod';
import { createEnv } from '@alta/config';

/**
 * Validated environment for the mobile app.
 *
 * Only EXPO_PUBLIC_* (publishable) values are available to the client bundle.
 * The Supabase secret key is never present in the mobile app.
 */
export const env = createEnv({
  client: {
    EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
  },
  isServer: false,
});
