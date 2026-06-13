import { supabase } from "@/lib/supabase";
import { useStore } from "@/store";

/**
 * Push the local Zustand store to Supabase (users + decisions tables) via the
 * `sync` Edge Function. Fire-and-forget safe: returns false instead of
 * throwing when signed out, offline, or the function errors — local state in
 * AsyncStorage remains the source of truth.
 */
export async function syncToCloud(): Promise<boolean> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) return false;

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return false;

    const s = useStore.getState();
    const res = await fetch(`${url}/functions/v1/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: s.profile,
        themeIds: s.themeIds,
        onboarding: s.onboarding,
        journal: s.journal,
        portfolio: s.portfolio,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
