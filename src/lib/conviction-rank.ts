import { catalogEntryToEtf, searchCatalogEtfs } from "@/data/etf-catalog";
import { catalogEntryToStock, searchCatalogStocks } from "@/data/stocks-catalog";
import { ETFS, etfBySymbol } from "@/data/etfs";
import { STOCKS, stockBySymbol } from "@/data/stocks";
import { scoreThesis } from "@/lib/thesis-score";
import { rankStocksForTheme } from "@/lib/theme-engine";
import type { ETF, Stock, ThemeId, UserProfile } from "@/store/types";

export type ConvictionRankRow = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  score: number;
  label: "Strong" | "Moderate" | "Weak" | "Mismatch";
  blurb: string;
  curated: boolean;
};

function labelForScore(score: number): ConvictionRankRow["label"] {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  if (score >= 25) return "Weak";
  return "Mismatch";
}

/** Rank curated + catalog stocks for the user's active themes (Builder / Home). */
export function rankStocksByConviction(
  profile: UserProfile,
  themeIds: ThemeId[],
  limit = 12
): ConvictionRankRow[] {
  if (themeIds.length === 0) return [];

  const seen = new Set<string>();
  const rows: ConvictionRankRow[] = [];

  for (const tid of themeIds) {
    for (const s of rankStocksForTheme(tid, profile, 8)) {
      if (seen.has(s.symbol)) continue;
      seen.add(s.symbol);
      const scr = scoreThesis(s, profile, themeIds);
      rows.push({
        symbol: s.symbol,
        name: s.name,
        kind: "stock",
        score: scr.overall,
        label: labelForScore(scr.overall),
        blurb: scr.topReason,
        curated: true,
      });
    }
  }

  for (const entry of searchCatalogStocks("", { limit: 40 })) {
    if (seen.has(entry.symbol) || stockBySymbol(entry.symbol)) continue;
    const stock = catalogEntryToStock(entry);
    const scr = scoreThesis(stock, profile, themeIds);
    if (scr.overall < 40) continue;
    seen.add(stock.symbol);
    rows.push({
      symbol: stock.symbol,
      name: stock.name,
      kind: "stock",
      score: scr.overall,
      label: labelForScore(scr.overall),
      blurb: scr.topReason,
      curated: false,
    });
  }

  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Score a single ETF against the user's profile and themes. */
export function computeEtfConviction(
  etf: ETF,
  profile: UserProfile,
  themeIds: ThemeId[],
): number {
  const themeSet = new Set(themeIds);
  const overlap = etf.themes.filter((t) => themeSet.has(t)).length;

  let score = overlap * 18 + (etf.expense <= 0.2 ? 8 : 0);
  const holdingScores: number[] = [];
  for (const sym of etf.holdings.slice(0, 4)) {
    const stock = stockBySymbol(sym);
    if (!stock) continue;
    holdingScores.push(scoreThesis(stock, profile, themeIds).overall);
  }
  if (holdingScores.length) {
    const avg = holdingScores.reduce((a, b) => a + b, 0) / holdingScores.length;
    score = Math.round(score * 0.35 + avg * 0.65);
  }
  return Math.min(100, Math.max(0, score));
}

/** Rank ETFs by theme overlap + underlying holding thesis scores. */
export function rankEtfsByConviction(
  profile: UserProfile,
  themeIds: ThemeId[],
  limit = 8
): ConvictionRankRow[] {
  if (themeIds.length === 0) return [];

  const candidates: ETF[] = [...ETFS];
  for (const entry of searchCatalogEtfs("", { limit: 60 })) {
    const etf = etfBySymbol(entry.symbol) ?? catalogEntryToEtf(entry);
    if (!candidates.some((e) => e.symbol === etf.symbol)) candidates.push(etf);
  }

  const themeSet = new Set(themeIds);
  const rows: ConvictionRankRow[] = [];

  for (const etf of candidates) {
    const overlap = etf.themes.filter((t) => themeSet.has(t)).length;
    if (overlap === 0 && themeIds.length > 0) continue;

    const score = computeEtfConviction(etf, profile, themeIds);
    if (score < 35) continue;

    rows.push({
      symbol: etf.symbol,
      name: etf.name,
      kind: "etf",
      score,
      label: labelForScore(score),
      blurb: `${overlap} theme overlap · ${etf.expense}% fee`,
      curated: ETFS.some((e) => e.symbol === etf.symbol),
    });
  }

  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function convictionLeaderboard(
  profile: UserProfile,
  themeIds: ThemeId[],
  stockLimit = 10,
  etfLimit = 6
): { stocks: ConvictionRankRow[]; etfs: ConvictionRankRow[] } {
  return {
    stocks: rankStocksByConviction(profile, themeIds, stockLimit),
    etfs: rankEtfsByConviction(profile, themeIds, etfLimit),
  };
}
