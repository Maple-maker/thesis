/**
 * Massive.com plan-aware limits (Stocks Basic = free tier).
 * @see docs/massive-market-data.md
 */

export type MassivePlan = "basic" | "starter" | "developer" | "advanced" | "full";

export function getMassivePlan(): MassivePlan {
  const raw = (process.env.MASSIVE_PLAN ?? "basic").trim().toLowerCase();
  if (
    raw === "starter" ||
    raw === "developer" ||
    raw === "advanced" ||
    raw === "full"
  ) {
    return raw;
  }
  return "basic";
}

/** Snapshot endpoints need Stocks Starter+; Basic uses prev bar + weekly aggs only. */
export function useSnapshotQuotes(): boolean {
  const plan = getMassivePlan();
  return plan !== "basic";
}

/** Min ms between API calls, Basic free tier ≈ 5 requests/minute. */
export function marketApiGapMs(): number {
  const override = Number(process.env.MARKET_API_GAP_MS);
  if (Number.isFinite(override) && override > 0) return override;
  if (getMassivePlan() === "basic") return 12_500;
  return Number(process.env.MARKET_POLYGON_GAP_MS ?? process.env.MARKET_YAHOO_GAP_MS ?? 300);
}

/** Server-side quote cache TTL. */
export function quoteCacheTtlMs(): number {
  const override = Number(process.env.MARKET_QUOTE_CACHE_MS);
  if (Number.isFinite(override) && override > 0) return override;
  if (getMassivePlan() === "basic") return 15 * 60 * 1000;
  return 60_000;
}

/** Max lookback for weekly aggs on Stocks Basic (2 years). */
export function aggsHistoryDays(): number {
  if (getMassivePlan() === "basic") return 730;
  return 370;
}

export function quoteRecencyLabel(): "eod" | "delayed" | "realtime" {
  const plan = getMassivePlan();
  if (plan === "basic") return "eod";
  if (plan === "advanced" || plan === "full") return "realtime";
  return "delayed";
}

export function marketPlanSummary() {
  return {
    plan: getMassivePlan(),
    quoteMode: useSnapshotQuotes() ? "snapshot" : "eod-bars",
    recency: quoteRecencyLabel(),
    apiGapMs: marketApiGapMs(),
    quoteCacheMs: quoteCacheTtlMs(),
    aggsHistoryDays: aggsHistoryDays(),
  };
}
