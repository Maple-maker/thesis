import { etfBySymbol } from "@/data/etfs";
import { lifeScenarioById } from "@/data/life-scenario-presets";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import {
  convictionLeaderboard,
  type ConvictionRankRow,
} from "@/lib/conviction-rank";
import { thesisFitForEtf, thesisFitForStock } from "@/lib/thesis-fit";
import { watchlistFitHeadline } from "@/lib/watchlist-search";
import type { ModelThesis } from "@/store/index";
import type { ThemeId, UserProfile } from "@/store/types";
import type { LifeScenarioId } from "@/data/life-scenario-presets";
import type { MarketSearchHit } from "@/lib/market-api";
import {
  hasActiveManualIntent,
  suggestionsFromManualQuery,
  themeIdsFromManualQuery,
} from "@/lib/radar-manual-query";

export type WatchlistRadarSuggestion = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  score: number;
  label: ConvictionRankRow["label"];
  headline: string;
  subline: string;
  blurb: string;
};

const GOAL_LABEL: Record<UserProfile["primaryGoal"], string> = {
  retirement: "long-term compounding",
  wealth: "building net worth",
  house: "home down payment",
  income: "income and stability",
  exploration: "learning and discovery",
};

function goalBoost(profile: UserProfile, row: ConvictionRankRow): number {
  const stock = row.kind === "stock" ? stockBySymbol(row.symbol) : null;
  if (!stock) return 0;
  let boost = 0;
  if (profile.primaryGoal === "income") {
    if (stock.tags.some((t) => /dividend|income|reit/i.test(t))) boost += 8;
    if (stock.sector === "Utilities" || stock.sector === "Real Estate") boost += 4;
  }
  if (profile.primaryGoal === "house" || profile.targetReturn === "conservative") {
    if (stock.tags.some((t) => /compound|quality|moat/i.test(t))) boost += 5;
    if (stock.sector === "Technology" && profile.risk === "low") boost -= 4;
  }
  if (profile.primaryGoal === "exploration") {
    if (!stock.tags.includes("mega-cap")) boost += 3;
  }
  if (profile.horizon === "very-long" || profile.primaryGoal === "retirement") {
    if (stock.tags.some((t) => /growth|compound/i.test(t))) boost += 4;
  }
  return boost;
}

function rowToSuggestion(
  row: ConvictionRankRow,
  profile: UserProfile,
  themeIds: ThemeId[]
): WatchlistRadarSuggestion | null {
  if (row.kind === "stock") {
    const stock = stockBySymbol(row.symbol);
    if (!stock) return null;
    const fit = thesisFitForStock(stock, profile, themeIds);
    const { headline, subline } = watchlistFitHeadline(row.symbol, fit);
    return {
      symbol: row.symbol,
      name: row.name,
      kind: "stock",
      score: row.score,
      label: row.label,
      headline,
      subline,
      blurb: row.blurb,
    };
  }
  const etf = etfBySymbol(row.symbol);
  if (!etf) return null;
  const fit = thesisFitForEtf(etf, profile, themeIds);
  const { headline, subline } = watchlistFitHeadline(row.symbol, fit);
  return {
    symbol: row.symbol,
    name: row.name,
    kind: "etf",
    score: row.score,
    label: row.label,
    headline,
    subline,
    blurb: row.blurb,
  };
}

export function radarPassiveContext(
  profile: UserProfile,
  themeIds: ThemeId[],
  modelThesis: ModelThesis | null,
  manualQuery?: string
): string {
  const goal = GOAL_LABEL[profile.primaryGoal] ?? "your goals";
  const themes =
    themeIds.length > 0
      ? themeIds
          .map((id) => themeById(id)?.kicker)
          .filter(Boolean)
          .join(" · ")
      : "no themes yet";
  const lifeId = modelThesis?.appliedLifeScenarios[0]?.id as LifeScenarioId | undefined;
  const life = lifeId ? lifeScenarioById(lifeId)?.label : null;
  const note = manualQuery?.trim();
  const noteBit = note && note.length >= 3 ? ` · Note: “${note.length > 40 ? `${note.slice(0, 37)}…` : note}”` : "";
  if (life) return `Radar pass · ${life} · ${goal} · ${themes}${noteBit}`;
  return `Radar pass · ${goal} · ${themes}${noteBit}`;
}

function mergeSuggestions(
  manual: WatchlistRadarSuggestion[],
  passive: WatchlistRadarSuggestion[],
  limit: number
): WatchlistRadarSuggestion[] {
  const seen = new Set<string>();
  const out: WatchlistRadarSuggestion[] = [];
  for (const row of [...manual, ...passive]) {
    if (seen.has(row.symbol)) continue;
    seen.add(row.symbol);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

/** Passive thesis radar, names not yet on watchlist or in linked holdings. */
export function watchlistRadarSuggestions(input: {
  profile: UserProfile;
  themeIds: ThemeId[];
  watchlist: string[];
  holdingSymbols?: string[];
  modelThesis?: ModelThesis | null;
  manualQuery?: string;
  liveMarketHits?: MarketSearchHit[];
  stockLimit?: number;
  etfLimit?: number;
  minScore?: number;
}): { stocks: WatchlistRadarSuggestion[]; etfs: WatchlistRadarSuggestion[]; context: string } {
  const {
    profile,
    themeIds,
    watchlist,
    holdingSymbols = [],
    modelThesis = null,
    manualQuery = "",
    liveMarketHits = [],
    stockLimit = 8,
    etfLimit = 4,
    minScore = 45,
  } = input;

  const skip = new Set([
    ...watchlist.map((s) => s.toUpperCase()),
    ...holdingSymbols.map((s) => s.toUpperCase()),
  ]);

  const context = radarPassiveContext(profile, themeIds, modelThesis, manualQuery);
  const manualQ = manualQuery.trim();

  const manualRaw =
    manualQ.length >= 3
      ? suggestionsFromManualQuery({
          query: manualQ,
          profile,
          themeIds,
          stockLimit,
          etfLimit,
          liveMarketHits,
        })
      : {
          stocks: [] as WatchlistRadarSuggestion[],
          etfs: [] as WatchlistRadarSuggestion[],
          intents: [],
        };

  const noteDriven = hasActiveManualIntent(manualQ);

  const filterSkip = (rows: WatchlistRadarSuggestion[]) =>
    rows.filter((r) => !skip.has(r.symbol));

  const manualStocks = filterSkip(manualRaw.stocks);
  const manualEtfs = filterSkip(manualRaw.etfs);

  if (themeIds.length === 0 && manualQ.length < 3) {
    return { stocks: [], etfs: [], context };
  }

  if (themeIds.length === 0) {
    return {
      stocks: manualStocks,
      etfs: manualEtfs,
      context,
    };
  }

  const expandedThemes = [
    ...new Set([
      ...themeIds,
      ...(manualQ.length >= 3 ? themeIdsFromManualQuery(manualQ) : []),
    ]),
  ] as ThemeId[];

  const board = convictionLeaderboard(profile, expandedThemes, 20, 12);

  const rankWithGoals = (rows: ConvictionRankRow[]) =>
    rows
      .map((r) => ({ r, adj: r.score + goalBoost(profile, r) }))
      .sort((a, b) => b.adj - a.adj)
      .map((x) => x.r);

  const stocks: WatchlistRadarSuggestion[] = [];
  for (const row of rankWithGoals(board.stocks)) {
    if (skip.has(row.symbol)) continue;
    if (row.score < minScore) continue;
    const s = rowToSuggestion(row, profile, expandedThemes);
    if (s) stocks.push(s);
    if (stocks.length >= stockLimit) break;
  }

  const etfs: WatchlistRadarSuggestion[] = [];
  for (const row of rankWithGoals(board.etfs)) {
    if (skip.has(row.symbol)) continue;
    if (row.score < minScore) continue;
    const s = rowToSuggestion(row, profile, expandedThemes);
    if (s) etfs.push(s);
    if (etfs.length >= etfLimit) break;
  }

  // When the note maps to a clear intent (e.g. foreign exposure), lead with note matches
  // instead of blending with the same passive theme list.
  if (noteDriven && (manualStocks.length > 0 || manualEtfs.length > 0)) {
    return {
      stocks: manualStocks,
      etfs: manualEtfs,
      context,
    };
  }

  return {
    stocks: mergeSuggestions(manualStocks, stocks, stockLimit),
    etfs: mergeSuggestions(manualEtfs, etfs, etfLimit),
    context,
  };
}
