import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

function initClient(): SupabaseClient {
  if (_client) return _client;

  // SSR guard — static rendering (expo export -p web) has no window.
  // Return a stub; the landing page deploy doesn't need a real Supabase client.
  if (typeof window === "undefined") {
    return {} as SupabaseClient;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  // Dynamic require — avoids crashing SSR (expo export -p web) at module load
  require("react-native-url-polyfill/auto");
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  const { createClient } = require("@supabase/supabase-js");

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _client!;
}

/**
 * Lazy-init Supabase client. Module-level import would crash static web export
 * because react-native-url-polyfill and AsyncStorage access `window`.
 *
 * Use this instead of a top-level `supabase` const. All existing call sites
 * (`supabase.auth.signOut()`, etc.) work because the Proxy forwards everything.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (initClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
}) as SupabaseClient;
