// Price proxy — Polygon.io previous-day OHLCV with a 15-minute server cache.
// Keys live in Edge Function secrets; the client never sees them.
// verify_jwt=true: the platform rejects requests without a valid project JWT
// (anon or user) before this code runs. Price data is public market data, so a
// signed-out Quick Take visitor (anon key) may read it; the Polygon key stays
// server-side either way.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const SYMBOL_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;

type Quote = {
  symbol: string;
  close: number;
  open: number;
  change: number;
  changePct: number;
  date: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let symbol = "";
  try {
    const body = await req.json();
    symbol = String(body?.symbol ?? "").trim().toUpperCase();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!SYMBOL_RE.test(symbol)) return json({ error: "Invalid symbol" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: cached } = await admin
    .from("price_cache")
    .select("data, cached_at")
    .eq("symbol", symbol)
    .maybeSingle();

  const cachedQuote = (cached?.data ?? null) as Quote | null;
  const fresh =
    cached &&
    Date.now() - new Date(cached.cached_at).getTime() < CACHE_TTL_MS;
  if (fresh && cachedQuote) return json({ ...cachedQuote, stale: false });

  const polygonKey = Deno.env.get("POLYGON_API_KEY") ?? "";
  if (polygonKey) {
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/prev?adjusted=true&apiKey=${polygonKey}`,
        { signal: AbortSignal.timeout(6000) },
      );
      if (res.ok) {
        const payload = await res.json();
        const r = payload?.results?.[0];
        if (r && typeof r.c === "number" && typeof r.o === "number" && r.o !== 0) {
          const quote: Quote = {
            symbol,
            close: r.c,
            open: r.o,
            change: r.c - r.o,
            changePct: (r.c - r.o) / r.o,
            date: new Date(r.t).toISOString().slice(0, 10),
          };
          await admin.from("price_cache").upsert({
            symbol,
            data: quote,
            cached_at: new Date().toISOString(),
          });
          return json({ ...quote, stale: false });
        }
      }
    } catch {
      // Polygon down or rate-limited — fall through to stale cache.
    }
  }

  if (cachedQuote) return json({ ...cachedQuote, stale: true });
  return json(null);
});
