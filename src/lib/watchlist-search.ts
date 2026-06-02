import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import type { ThesisFitResult } from "@/lib/thesis-fit";
import { thesisFitForEtf, thesisFitForStock, thesisFitForThemes } from "@/lib/thesis-fit";
import { isMarketLiveCooldown, searchMarketLive } from "@/lib/market-api";
import {
  mergeLiveSecurities,
  needsLiveMarketSearch,
  screenSecurities,
  securitiesFromMarketHits,
  type SecurityResult,
} from "@/lib/security-screener";
import type { ThemeId, UserProfile } from "@/store/types";

export type WatchlistSearchRow = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  curated: boolean;
  fit: ThesisFitResult;
  /** e.g. "Look into NVDA, it fits your AI Infrastructure thesis" */
  headline: string;
  subline: string;
};

export function watchlistFitHeadline(
  symbol: string,
  fit: ThesisFitResult
): { headline: string; subline: string } {
  const sym = symbol.toUpperCase();
  const topTheme = fit.matchedThemes[0] ? themeById(fit.matchedThemes[0]) : null;

  if (fit.score >= 62) {
    const headline = topTheme
      ? `Look into ${sym}, it fits your ${topTheme.title} thesis`
      : `Look into ${sym}, it fits your thesis`;
    return {
      headline,
      subline: fit.reasons[0] ?? `${fit.label} alignment with your active themes`,
    };
  }
  if (fit.score >= 40) {
    return {
      headline: `${sym}, moderate fit with your book`,
      subline: fit.reasons[0] ?? "Worth comparing in a duel before you add it",
    };
  }
  return {
    headline: `${sym}, weak overlap with your themes`,
    subline: fit.reasons[0] ?? "Could work as a small satellite, not a core thesis name",
  };
}

function fitForSecurity(
  item: SecurityResult,
  profile: UserProfile,
  themeIds: ThemeId[]
): ThesisFitResult {
  if (item.kind === "stock") {
    const full = stockBySymbol(item.symbol);
    if (full) return thesisFitForStock(full, profile, themeIds);
    return thesisFitForThemes(item.themes, themeIds, profile);
  }
  const full = etfBySymbol(item.symbol);
  if (full) return thesisFitForEtf(full, profile, themeIds);
  return thesisFitForThemes(item.themes, themeIds, profile);
}

function toWatchlistRow(
  item: SecurityResult,
  profile: UserProfile,
  themeIds: ThemeId[]
): WatchlistSearchRow {
  const fit = fitForSecurity(item, profile, themeIds);
  const { headline, subline } = watchlistFitHeadline(item.symbol, fit);
  return {
    symbol: item.symbol,
    name: item.name,
    kind: item.kind,
    curated: item.curated,
    fit,
    headline,
    subline,
  };
}

export function searchWatchlistLocal(
  query: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  limit = 16
): WatchlistSearchRow[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const securities = screenSecurities({
    query: q,
    kind: "all",
    themeId: "all",
    assetClass: "all",
    maxExpense: null,
    includeLeveraged: false,
    sort: "symbol",
  });

  return securities
    .slice(0, limit * 2)
    .map((item) => toWatchlistRow(item, profile, themeIds))
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, limit);
}

export async function searchWatchlistWithLive(
  query: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  localRows: WatchlistSearchRow[]
): Promise<WatchlistSearchRow[]> {
  const q = query.trim();
  if (q.length < 3 || isMarketLiveCooldown()) return localRows;

  const localSecurities = screenSecurities({
    query: q,
    kind: "all",
    themeId: "all",
    assetClass: "all",
    maxExpense: null,
    includeLeveraged: false,
    sort: "symbol",
  });

  if (!needsLiveMarketSearch(q, localSecurities)) return localRows;

  const hits = await searchMarketLive(q, "all", 10);
  const liveSec = securitiesFromMarketHits(hits);
  const merged = mergeLiveSecurities(localSecurities, liveSec);
  const seen = new Set(localRows.map((r) => r.symbol));
  const extra = merged
    .filter((s) => !seen.has(s.symbol))
    .map((item) => toWatchlistRow(item, profile, themeIds));

  return [...localRows, ...extra]
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 16);
}
