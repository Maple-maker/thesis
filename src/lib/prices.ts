import { supabase } from "@/lib/supabase";

/** Shape returned by the Supabase `prices` Edge Function (Polygon prev-day). */
export type LiveQuote = {
  symbol: string;
  close: number;
  open: number;
  change: number;
  changePct: number; // fraction, e.g. 0.0167
  date: string; // YYYY-MM-DD
  stale?: boolean;
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { at: number; quote: LiveQuote }>();

async function authToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {
    // fall through to anon key — price data is public market data
  }
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

/**
 * Fetch a previous-day quote through the Supabase price proxy.
 * Polygon's key stays server-side; responses are cached 15 min on both ends.
 * Returns null on any failure — callers fall back to illustrative data.
 */
export async function fetchQuote(symbol: string): Promise<LiveQuote | null> {
  const sym = symbol.trim().toUpperCase();
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!sym || !url) return null;

  const cached = cache.get(sym);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.quote;

  const token = await authToken();
  if (!token) return null;

  try {
    const res = await fetch(`${url}/functions/v1/prices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol: sym }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const quote = (await res.json()) as LiveQuote | null;
    if (!quote || typeof quote.close !== "number") return null;
    cache.set(sym, { at: Date.now(), quote });
    return quote;
  } catch {
    return null;
  }
}

/**
 * Sequential batch fetch (server cache absorbs repeats; sequencing keeps the
 * Polygon free tier under its 5 req/min limit on cold caches).
 */
export async function fetchQuotes(
  symbols: string[]
): Promise<Record<string, LiveQuote>> {
  const results: Record<string, LiveQuote> = {};
  for (const sym of symbols.slice(0, 5)) {
    const q = await fetchQuote(sym);
    if (q) results[q.symbol] = q;
  }
  return results;
}
