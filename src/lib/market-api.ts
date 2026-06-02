import { getThesisApiConfig } from "@/lib/thesis-api";

export type MarketSearchHit = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  exchange?: string;
  sector?: string;
  marketCapB?: number | null;
  expense?: number | null;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const COOLDOWN_AFTER_429_MS = 90 * 1000;

const hitCache = new Map<string, { at: number; hits: MarketSearchHit[] }>();
let rateLimitedUntil = 0;

function cacheKey(query: string, type: string, limit: number) {
  return `${type}:${limit}:${query.trim().toLowerCase()}`;
}

export type MarketQuote = {
  symbol: string;
  price: number;
  changePctDay: number;
  changePct1y: number | null;
  range1yLow: number;
  range1yHigh: number;
  sparkline: number[];
  marketCapB: number | null;
  source: "polygon";
  asOf: string;
  delayed: boolean;
  recency?: "eod" | "delayed" | "realtime";
};

const quoteCache = new Map<string, { at: number; quote: MarketQuote }>();
/** Match server Basic plan cache (15 min), avoids burning free-tier quota. */
const QUOTE_CACHE_MS = 15 * 60 * 1000;

/** True when market API returned 429 recently, skip live calls until cooldown ends. */
export function isMarketLiveCooldown(): boolean {
  return Date.now() < rateLimitedUntil;
}

/** Live stock quote via Thesis API (Polygon on server). */
export async function fetchMarketQuote(symbol: string): Promise<MarketQuote | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym || isMarketLiveCooldown()) return null;

  const cached = quoteCache.get(sym);
  if (cached && Date.now() - cached.at < QUOTE_CACHE_MS) {
    return cached.quote;
  }

  const { url, key: appKey } = getThesisApiConfig();
  if (!url) return null;

  const params = new URLSearchParams({ symbol: sym });
  const res = await fetch(`${url}/v1/market/quote?${params}`, {
    headers: appKey ? { "X-Thesis-App-Key": appKey } : {},
  });

  if (res.status === 429) {
    rateLimitedUntil = Date.now() + COOLDOWN_AFTER_429_MS;
    return null;
  }
  if (!res.ok) return null;

  const quote = (await res.json()) as MarketQuote;
  quoteCache.set(sym, { at: Date.now(), quote });
  return quote;
}

export async function searchMarketLive(
  query: string,
  type: "all" | "stock" | "etf" = "all",
  limit = 12
): Promise<MarketSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  if (isMarketLiveCooldown()) return [];

  const cacheId = cacheKey(q, type, limit);
  const cached = hitCache.get(cacheId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.hits;
  }

  const { url, key: appKey } = getThesisApiConfig();
  if (!url) return [];

  const params = new URLSearchParams({ q, type, limit: String(limit) });
  const res = await fetch(`${url}/v1/market/search?${params}`, {
    headers: appKey ? { "X-Thesis-App-Key": appKey } : {},
  });

  if (res.status === 429) {
    rateLimitedUntil = Date.now() + COOLDOWN_AFTER_429_MS;
    return [];
  }
  if (!res.ok) return [];

  const data = (await res.json()) as { hits?: MarketSearchHit[] };
  const hits = data.hits ?? [];
  hitCache.set(cacheId, { at: Date.now(), hits });
  return hits;
}
