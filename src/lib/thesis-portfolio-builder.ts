import type { LensHolding } from "@/data/investor-lenses";
import { climateById } from "@/data/investing-climates";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { resolveClimatePick } from "@/lib/climate-explorer";
import { rankEtfsByConviction, rankStocksByConviction } from "@/lib/conviction-rank";
import { scoreThesis } from "@/lib/thesis-score";
import { backtestPortfolio } from "@/lib/portfolio-backtest";
import type { PortfolioBacktestResult } from "@/lib/portfolio-backtest";
import type { ThemeId, UserProfile } from "@/store/types";

export type ThesisPortfolioCandidate = {
  symbol: string;
  kind: "stock" | "etf";
  name: string;
  weightPct: number;
  score: number;
  role: string;
};

export type BuiltThesisPortfolio = {
  name: string;
  conviction: string;
  climateId: string | null;
  themeIds: ThemeId[];
  holdings: LensHolding[];
  candidates: ThesisPortfolioCandidate[];
  avoidSymbols: string[];
  rationale: string[];
  backtest: PortfolioBacktestResult;
};

function normalizeWeights(
  items: { symbol: string; kind: "stock" | "etf"; raw: number }[],
  maxPositions: number
): LensHolding[] {
  const top = items.sort((a, b) => b.raw - a.raw).slice(0, maxPositions);
  const sum = top.reduce((s, x) => s + x.raw, 0) || 1;
  let holdings = top.map((x) => ({
    symbol: x.symbol,
    kind: x.kind,
    weightPct: Math.round((x.raw / sum) * 1000) / 10,
  }));

  const total = holdings.reduce((s, h) => s + h.weightPct, 0);
  if (holdings.length && Math.abs(total - 100) > 0.1) {
    holdings = holdings.map((h, i) =>
      i === 0 ? { ...h, weightPct: Math.round((h.weightPct + (100 - total)) * 10) / 10 } : h
    );
  }
  return holdings;
}

export function buildThesisPortfolio(input: {
  name: string;
  conviction: string;
  profile: UserProfile;
  themeIds: ThemeId[];
  climateId?: string | null;
  maxStocks?: number;
  maxEtfs?: number;
}): BuiltThesisPortfolio | null {
  const themeIds = [...new Set(input.themeIds)];
  if (themeIds.length === 0 && !input.climateId) return null;

  const climate = input.climateId ? climateById(input.climateId) : null;
  const mergedThemes = climate
    ? [...new Set([...themeIds, ...climate.themeIds])]
    : themeIds;

  const avoidSet = new Set(
    climate?.avoid.map((a) => a.symbol.toUpperCase()) ?? []
  );

  const rationale: string[] = [];
  if (climate) {
    rationale.push(climate.implication);
  }
  if (input.conviction.trim()) {
    rationale.push(input.conviction.trim());
  }

  const stockRows = rankStocksByConviction(input.profile, mergedThemes, 24);
  const etfRows = rankEtfsByConviction(input.profile, mergedThemes, 16);

  const climateBoost = new Set(
    climate?.favor.map((f) => f.symbol.toUpperCase()) ?? []
  );

  const stockCandidates: { symbol: string; kind: "stock" | "etf"; raw: number; score: number; role: string }[] = [];
  for (const row of stockRows) {
    if (avoidSet.has(row.symbol)) continue;
    let raw = row.score;
    if (climateBoost.has(row.symbol)) raw += 15;
    const stock = stockBySymbol(row.symbol);
    if (!stock) continue;
    stockCandidates.push({
      symbol: row.symbol,
      kind: "stock",
      raw,
      score: row.score,
      role: climateBoost.has(row.symbol)
        ? "Climate fit + thesis score"
        : "Thesis conviction rank",
    });
  }

  const etfCandidates: typeof stockCandidates = [];
  for (const row of etfRows) {
    if (avoidSet.has(row.symbol)) continue;
    let raw = row.score;
    if (climateBoost.has(row.symbol)) raw += 12;
    etfCandidates.push({
      symbol: row.symbol,
      kind: "etf",
      raw,
      score: row.score,
      role: climateBoost.has(row.symbol) ? "Climate ETF sleeve" : "Diversifier ETF",
    });
  }

  if (climate) {
    for (const pick of climate.favor) {
      const sym = pick.symbol.toUpperCase();
      if (avoidSet.has(sym)) continue;
      const exists = stockCandidates.some((c) => c.symbol === sym) || etfCandidates.some((c) => c.symbol === sym);
      if (exists) continue;
      const resolved = resolveClimatePick(pick);
      if (!resolved.found) continue;
      const bucket = pick.kind === "etf" ? etfCandidates : stockCandidates;
      bucket.push({
        symbol: sym,
        kind: pick.kind,
        raw: 72,
        score: 70,
        role: pick.reason,
      });
    }
  }

  const maxStocks = input.maxStocks ?? 5;
  const maxEtfs = input.maxEtfs ?? 3;
  const merged = [
    ...stockCandidates.slice(0, maxStocks),
    ...etfCandidates.slice(0, maxEtfs),
  ];

  if (merged.length === 0) return null;

  const holdings = normalizeWeights(
    merged.map((m) => ({ symbol: m.symbol, kind: m.kind, raw: m.raw })),
    maxStocks + maxEtfs
  );

  const candidates: ThesisPortfolioCandidate[] = holdings.map((h) => {
    const meta = merged.find((m) => m.symbol === h.symbol);
    const stock = stockBySymbol(h.symbol);
    const etf = etfBySymbol(h.symbol);
    return {
      symbol: h.symbol,
      kind: h.kind,
      name: stock?.name ?? etf?.name ?? h.symbol,
      weightPct: h.weightPct,
      score: meta?.score ?? 50,
      role: meta?.role ?? "Model weight",
    };
  });

  const backtest = backtestPortfolio(holdings);

  return {
    name: input.name.trim() || "My thesis",
    conviction: input.conviction,
    climateId: input.climateId ?? null,
    themeIds: mergedThemes,
    holdings,
    candidates,
    avoidSymbols: [...avoidSet],
    rationale,
    backtest,
  };
}

/** Score a single symbol against active thesis for inline "does this fit?" */
export function scoreSymbolForThesis(
  symbol: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  climateId?: string | null
): { score: number; verdict: "favor" | "avoid" | "neutral"; reason: string } | null {
  const sym = symbol.toUpperCase();
  const climate = climateId ? climateById(climateId) : null;
  if (climate?.avoid.some((a) => a.symbol.toUpperCase() === sym)) {
    const pick = climate.avoid.find((a) => a.symbol.toUpperCase() === sym)!;
    return { score: 25, verdict: "avoid", reason: pick.reason };
  }
  if (climate?.favor.some((f) => f.symbol.toUpperCase() === sym)) {
    const pick = climate.favor.find((f) => f.symbol.toUpperCase() === sym)!;
    return { score: 78, verdict: "favor", reason: pick.reason };
  }
  const stock = stockBySymbol(sym);
  if (stock) {
    const result = scoreThesis(stock, profile, themeIds);
    return {
      score: result.overall,
      verdict: result.overall >= 55 ? "favor" : result.overall >= 40 ? "neutral" : "avoid",
      reason: result.topReason,
    };
  }
  const etf = etfBySymbol(sym);
  if (etf) {
    const overlap = etf.themes.filter((t) => themeIds.includes(t)).length;
    const score = Math.min(100, overlap * 25 + (etf.expense < 0.2 ? 10 : 0));
    return {
      score,
      verdict: score >= 55 ? "favor" : "neutral",
      reason: overlap ? `Overlaps ${overlap} of your themes` : "Low theme overlap",
    };
  }
  return null;
}
