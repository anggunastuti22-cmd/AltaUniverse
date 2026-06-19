import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSupabaseClient } from '@alta/database';
import { env } from '../env';

/** Supabase client for React Native with persisted sessions (AsyncStorage). */
export const supabase = createSupabaseClient({
  url: env.EXPO_PUBLIC_SUPABASE_URL,
  key: env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options: {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
});
