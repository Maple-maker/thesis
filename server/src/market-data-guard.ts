/**
 * Throttle + TTL cache for Massive / Yahoo market data.
 */

import { marketApiGapMs, quoteCacheTtlMs } from "./market-plan.js";

const SEARCH_TTL_MS = Number(process.env.MARKET_SEARCH_CACHE_MS ?? 15 * 60 * 1000);

type CacheEntry<T> = { at: number; value: T };

const searchCache = new Map<string, CacheEntry<unknown>>();
const quoteCache = new Map<string, CacheEntry<unknown>>();

let lastApiAt = 0;
let apiChain: Promise<void> = Promise.resolve();

export function isMarketLiveSearchEnabled(): boolean {
  const v = process.env.MARKET_LIVE_SEARCH;
  if (v === "0" || v === "false") return false;
  return true;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function withMarketThrottle<T>(fn: () => Promise<T>): Promise<T> {
  const gap = marketApiGapMs();
  const run = apiChain.then(async () => {
    const elapsed = Date.now() - lastApiAt;
    if (elapsed < gap) await sleep(gap - elapsed);
    lastApiAt = Date.now();
    return fn();
  });
  apiChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function getCachedSearch<T>(key: string): T | null {
  return getCached(searchCache, key, SEARCH_TTL_MS);
}

export function setCachedSearch<T>(key: string, value: T): void {
  setCached(searchCache, key, value);
}

export function getCachedQuote<T>(key: string): T | null {
  return getCached(quoteCache, key, quoteCacheTtlMs());
}

export function setCachedQuote<T>(key: string, value: T): void {
  setCached(quoteCache, key, value);
}

function getCached<T>(
  map: Map<string, CacheEntry<unknown>>,
  key: string,
  ttl: number
): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    map.delete(key);
    return null;
  }
  return hit.value as T;
}

function setCached<T>(map: Map<string, CacheEntry<unknown>>, key: string, value: T): void {
  map.set(key, { at: Date.now(), value });
}

export function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /too many|429|rate limit|valid json/i.test(msg);
}
