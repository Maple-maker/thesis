import { SP500_INDEX_PORTFOLIO } from "@/data/duel-benchmark-portfolios";
import { DUEL_THESIS_PRESETS, thesisPresetById } from "@/data/duel-thesis-presets";
import type { LensHolding } from "@/data/investor-lenses";
import { INVESTOR_LENSES, lensById } from "@/data/investor-lenses";
import { backtestPortfolio, type PortfolioBacktestResult } from "@/lib/portfolio-backtest";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import type { ConceptId } from "@/data/concepts";
import { conceptIdForMetricLabel } from "@/lib/duel-metric-info";
import { thesisFitForThemes, thesisLackingForAsset } from "@/lib/thesis-fit";
import type { Holding } from "@/types/linked-accounts";
import type { ThemeId, UserProfile } from "@/store/types";

export type PortfolioHolding = LensHolding;

export type DuelPortfolioStats = {
  holdingsCount: number;
  expensePct: number;
  dividendYieldPct: number;
  risk: "Low" | "Medium" | "High";
  return1y: number;
};

export type DuelPortfolioSource =
  | { type: "lens"; lensId: string }
  | { type: "thesis"; thesisId: string }
  | { type: "benchmark"; benchmarkId: string }
  | { type: "my" };

/** Stable route param, e.g. lens:buffett-quality, thesis:ai-edge, portfolio:my */
export type DuelPortfolioRef = string;

export const DUEL_PORTFOLIO_MATCHUPS: {
  id: string;
  label: string;
  hint: string;
  a: DuelPortfolioRef;
  b: DuelPortfolioRef;
  tag?: string;
}[] = [
  {
    id: "thesis-a-vs-b",
    label: "Thesis A vs Thesis B",
    hint: "Value investing vs AI edge, both backtested vs SPY",
    a: "thesis:value-investing",
    b: "thesis:ai-edge",
    tag: "Featured",
  },
  {
    id: "buffett-vs-spy",
    label: "Buffett vs S&P 500",
    hint: "Did quality compounders beat just buying SPY?",
    a: "lens:buffett-quality",
    b: "benchmark:sp500-index",
    tag: "vs index",
  },
  {
    id: "buffett-vs-you",
    label: "Buffett vs my book",
    hint: "Famous model vs what you actually hold",
    a: "lens:buffett-quality",
    b: "portfolio:my",
  },
  {
    id: "value-vs-ai",
    label: "Value vs AI edge",
    hint: "Dividend defensives vs semiconductor & AI thematic",
    a: "thesis:value-investing",
    b: "thesis:ai-edge",
  },
  {
    id: "dalio-vs-income",
    label: "Dalio balance vs income sleeve",
    hint: "All-weather mix vs dividend-first plan",
    a: "lens:dalio-all-weather",
    b: "thesis:income-defensive",
  },
  {
    id: "ai-lens-vs-ai-edge",
    label: "AI lens vs AI edge thesis",
    hint: "Theme lens allocation vs aggressive thesis preset",
    a: "lens:ai-infrastructure",
    b: "thesis:ai-edge",
  },
  {
    id: "wood-vs-spy",
    label: "Innovation vs S&P 500",
    hint: "High-vol ARK-style sleeve vs the index",
    a: "lens:wood-disruptive",
    b: "benchmark:sp500-index",
    tag: "vs index",
  },
];

export function parsePortfolioRef(ref: string): DuelPortfolioSource | null {
  const raw = ref.trim().toLowerCase();
  if (raw === "portfolio:my" || raw === "my" || raw === "my-portfolio") {
    return { type: "my" };
  }
  if (raw.startsWith("lens:")) {
    const lensId = raw.slice(5);
    return lensId ? { type: "lens", lensId } : null;
  }
  if (raw.startsWith("thesis:")) {
    const thesisId = raw.slice(7);
    return thesisId ? { type: "thesis", thesisId } : null;
  }
  if (raw.startsWith("benchmark:")) {
    const benchmarkId = raw.slice(10);
    return benchmarkId ? { type: "benchmark", benchmarkId } : null;
  }
  if (lensById(raw)) return { type: "lens", lensId: raw };
  if (thesisPresetById(raw)) return { type: "thesis", thesisId: raw };
  if (raw === SP500_INDEX_PORTFOLIO.id) return { type: "benchmark", benchmarkId: raw };
  return null;
}

export function portfolioRef(source: DuelPortfolioSource): DuelPortfolioRef {
  if (source.type === "my") return "portfolio:my";
  if (source.type === "lens") return `lens:${source.lensId}`;
  if (source.type === "benchmark") return `benchmark:${source.benchmarkId}`;
  return `thesis:${source.thesisId}`;
}

export type ResolvedPortfolio = {
  ref: DuelPortfolioRef;
  displaySymbol: string;
  name: string;
  subtitle: string;
  thesis: string;
  themeIds: ThemeId[];
  holdings: PortfolioHolding[];
  stats: DuelPortfolioStats;
  inspiredBy?: string;
  backtest: PortfolioBacktestResult;
};

function blendedExpense(holdings: PortfolioHolding[]): number {
  let sum = 0;
  for (const h of holdings) {
    const etf = etfBySymbol(h.symbol);
    sum += (etf?.expense ?? 0) * (h.weightPct / 100);
  }
  return Math.round(sum * 100) / 100;
}

function portfolioFromHoldings(holdings: Holding[]): ResolvedPortfolio | null {
  if (!holdings.length) return null;
  const mapped: PortfolioHolding[] = holdings.map((h) => ({
    symbol: h.symbol,
    weightPct: h.weightPct,
    kind: h.assetClass === "ETF" ? "etf" : "stock",
  }));
  const themes = new Set<ThemeId>();
  for (const h of holdings) {
    const s = stockBySymbol(h.symbol);
    const e = etfBySymbol(h.symbol);
    for (const t of s?.themes ?? e?.themes ?? []) themes.add(t);
  }
  const backtest = backtestPortfolio(mapped);
  return {
    ref: "portfolio:my",
    displaySymbol: "YOU",
    name: "My portfolio",
    subtitle: `${holdings.length} positions · from linked demo book`,
    thesis:
      "Your current allocation, compare famous models and thesis presets to see overlap, gaps, and concentration.",
    themeIds: [...themes].slice(0, 6),
    holdings: mapped,
    stats: {
      holdingsCount: holdings.length,
      expensePct: blendedExpense(mapped),
      dividendYieldPct: 1.2,
      risk: holdings.length <= 4 ? "High" : "Medium",
      return1y: backtest.portfolio.trailing1y,
    },
    backtest,
  };
}

export function resolvePortfolio(
  ref: string,
  userHoldings: Holding[]
): ResolvedPortfolio | null {
  const source = parsePortfolioRef(ref);
  if (!source) return null;

  if (source.type === "my") {
    return portfolioFromHoldings(userHoldings);
  }

  if (source.type === "lens") {
    const lens = lensById(source.lensId);
    if (!lens) return null;
    const short = lens.name.split(" ")[0].slice(0, 6).toUpperCase();
    const backtest = backtestPortfolio(lens.holdings);
    return {
      ref: portfolioRef(source),
      displaySymbol: short,
      name: lens.name,
      subtitle: lens.subtitle,
      thesis: lens.bio,
      themeIds: lens.themeIds,
      holdings: lens.holdings,
      stats: {
        holdingsCount: lens.stats.holdingsCount,
        expensePct: lens.stats.expensePct,
        dividendYieldPct: lens.stats.dividendYieldPct,
        risk: lens.stats.risk,
        return1y: backtest.portfolio.trailing1y,
      },
      inspiredBy: lens.inspiredBy,
      backtest,
    };
  }

  if (source.type === "benchmark") {
    if (source.benchmarkId !== SP500_INDEX_PORTFOLIO.id) return null;
    const backtest = backtestPortfolio(SP500_INDEX_PORTFOLIO.holdings);
    return {
      ref: portfolioRef(source),
      displaySymbol: "SPY",
      name: SP500_INDEX_PORTFOLIO.name,
      subtitle: SP500_INDEX_PORTFOLIO.subtitle,
      thesis: SP500_INDEX_PORTFOLIO.thesis,
      themeIds: [],
      holdings: [...SP500_INDEX_PORTFOLIO.holdings],
      stats: { ...SP500_INDEX_PORTFOLIO.stats },
      backtest,
    };
  }

  const preset = thesisPresetById(source.thesisId);
  if (!preset) return null;
  const short = preset.name.split(" ")[0].slice(0, 6).toUpperCase();
  const backtest = backtestPortfolio(preset.holdings);
  return {
    ref: portfolioRef(source),
    displaySymbol: short,
    name: preset.name,
    subtitle: preset.subtitle,
    thesis: preset.thesis,
    themeIds: preset.themeIds,
    holdings: preset.holdings,
    stats: {
      ...preset.stats,
      return1y: backtest.portfolio.trailing1y,
    },
    backtest,
  };
}

export function listPortfolioOptions(userHoldings: Holding[]): {
  ref: DuelPortfolioRef;
  name: string;
  subtitle: string;
  category: "famous" | "thesis" | "yours" | "benchmark";
  backtestLine: string;
}[] {
  const out: {
    ref: DuelPortfolioRef;
    name: string;
    subtitle: string;
    category: "famous" | "thesis" | "yours" | "benchmark";
    backtestLine: string;
  }[] = [];

  out.push({
    ref: "benchmark:sp500-index",
    name: SP500_INDEX_PORTFOLIO.name,
    subtitle: SP500_INDEX_PORTFOLIO.subtitle,
    category: "benchmark",
    backtestLine: "Baseline · SPY total return",
  });

  for (const preset of DUEL_THESIS_PRESETS) {
    const bt = backtestPortfolio(preset.holdings);
    out.push({
      ref: `thesis:${preset.id}`,
      name: preset.name,
      subtitle: preset.subtitle,
      category: "thesis",
      backtestLine: backtestHeadlineShort(bt),
    });
  }

  for (const lens of INVESTOR_LENSES.filter((l) => l.category === "famous")) {
    const bt = backtestPortfolio(lens.holdings);
    out.push({
      ref: `lens:${lens.id}`,
      name: lens.inspiredBy ? `${lens.inspiredBy}` : lens.name,
      subtitle: lens.name,
      category: "famous",
      backtestLine: backtestHeadlineShort(bt),
    });
  }

  if (userHoldings.length > 0) {
    const resolved = portfolioFromHoldings(userHoldings);
    out.push({
      ref: "portfolio:my",
      name: "My portfolio",
      subtitle: `${userHoldings.length} holdings · your book`,
      category: "yours",
      backtestLine: resolved ? backtestHeadlineShort(resolved.backtest) : "",
    });
  }

  return out;
}

function backtestHeadlineShort(bt: PortfolioBacktestResult): string {
  const a = bt.alpha.trailing1y;
  return a > 0 ? `Beat SPY 1Y (+${a.toFixed(1)} pts)` : `Trailed SPY 1Y (${a.toFixed(1)} pts)`;
}

export type PortfolioCompareMetric = {
  label: string;
  a: string;
  b: string;
  better: "a" | "b" | "tie";
  conceptId?: ConceptId;
};

function metric(
  label: string,
  a: string,
  b: string,
  better: "a" | "b" | "tie"
): PortfolioCompareMetric {
  return { label, a, b, better, conceptId: conceptIdForMetricLabel(label) };
}

export function portfolioOverlap(a: ResolvedPortfolio, b: ResolvedPortfolio) {
  const mapB = new Map(b.holdings.map((h) => [h.symbol, h.weightPct]));
  const shared: { symbol: string; weightA: number; weightB: number }[] = [];
  for (const h of a.holdings) {
    const wb = mapB.get(h.symbol);
    if (wb != null) shared.push({ symbol: h.symbol, weightA: h.weightPct, weightB: wb });
  }
  const overlapWeight = shared.reduce((s, x) => s + Math.min(x.weightA, x.weightB), 0);
  return { shared, overlapPct: Math.round(overlapWeight) };
}

export function buildPortfolioCompareMetrics(
  a: ResolvedPortfolio,
  b: ResolvedPortfolio
): PortfolioCompareMetric[] {
  const overlap = portfolioOverlap(a, b);
  const riskRank: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
  const ra = riskRank[a.stats.risk] ?? 1;
  const rb = riskRank[b.stats.risk] ?? 1;

  return [
    metric(
      "Holdings",
      String(a.stats.holdingsCount),
      String(b.stats.holdingsCount),
      a.stats.holdingsCount < b.stats.holdingsCount ? "a" : a.stats.holdingsCount > b.stats.holdingsCount ? "b" : "tie"
    ),
    metric(
      "Blended expense",
      `${a.stats.expensePct}%`,
      `${b.stats.expensePct}%`,
      a.stats.expensePct < b.stats.expensePct ? "a" : a.stats.expensePct > b.stats.expensePct ? "b" : "tie"
    ),
    metric(
      "Div. yield (illustrative)",
      `${a.stats.dividendYieldPct}%`,
      `${b.stats.dividendYieldPct}%`,
      a.stats.dividendYieldPct > b.stats.dividendYieldPct ? "a" : a.stats.dividendYieldPct < b.stats.dividendYieldPct ? "b" : "tie"
    ),
    metric(
      "Risk profile",
      a.stats.risk,
      b.stats.risk,
      ra < rb ? "a" : ra > rb ? "b" : "tie"
    ),
    metric(
      "1Y vs SPY (model)",
      `${a.stats.return1y}% (${a.backtest.alpha.trailing1y >= 0 ? "+" : ""}${a.backtest.alpha.trailing1y} pts)`,
      `${b.stats.return1y}% (${b.backtest.alpha.trailing1y >= 0 ? "+" : ""}${b.backtest.alpha.trailing1y} pts)`,
      a.stats.return1y > b.stats.return1y ? "a" : a.stats.return1y < b.stats.return1y ? "b" : "tie"
    ),
    metric(
      "5Y ann. vs SPY",
      `${a.backtest.portfolio.ann5y}% (${a.backtest.alpha.ann5y >= 0 ? "+" : ""}${a.backtest.alpha.ann5y})`,
      `${b.backtest.portfolio.ann5y}% (${b.backtest.alpha.ann5y >= 0 ? "+" : ""}${b.backtest.alpha.ann5y})`,
      a.backtest.portfolio.ann5y > b.backtest.portfolio.ann5y
        ? "a"
        : a.backtest.portfolio.ann5y < b.backtest.portfolio.ann5y
          ? "b"
          : "tie"
    ),
    metric(
      "Holdings overlap",
      `${overlap.overlapPct}%`,
      `${overlap.overlapPct}%`,
      "tie"
    ),
  ];
}

export function portfolioDuelVerdict(
  a: ResolvedPortfolio,
  b: ResolvedPortfolio,
  userThemeIds: ThemeId[],
  profile: UserProfile
): {
  fitA: ReturnType<typeof thesisFitForThemes>;
  fitB: ReturnType<typeof thesisFitForThemes>;
  lackingA: string[];
  lackingB: string[];
  overlapNote: string;
  recommendation: string;
} {
  const fitA = thesisFitForThemes(a.themeIds, userThemeIds, profile);
  const fitB = thesisFitForThemes(b.themeIds, userThemeIds, profile);
  const better = fitA.score >= fitB.score ? a : b;
  const worse = better.ref === a.ref ? b : a;
  const betterFit = better.ref === a.ref ? fitA : fitB;
  const worseFit = better.ref === a.ref ? fitB : fitA;
  const overlap = portfolioOverlap(a, b);
  const lackingA = thesisLackingForAsset(a.themeIds, userThemeIds);
  const lackingB = thesisLackingForAsset(b.themeIds, userThemeIds);

  const sharedNote =
    overlap.shared.length > 0
      ? `Shared names: ${overlap.shared.slice(0, 5).map((s) => s.symbol).join(", ")}${overlap.shared.length > 5 ? "…" : ""} (~${overlap.overlapPct}% weight overlap).`
      : "No direct ticker overlap, these books diversify each other on holdings.";

  const spyLine = `${a.name} vs SPY: 1Y ${a.backtest.alpha.trailing1y >= 0 ? "+" : ""}${a.backtest.alpha.trailing1y} pts · ${b.name}: ${b.backtest.alpha.trailing1y >= 0 ? "+" : ""}${b.backtest.alpha.trailing1y} pts.`;
  const recommendation = `For your themes, ${better.name} aligns better (${betterFit.score}/100 vs ${worseFit.score} for ${worse.name}). ${spyLine} ${sharedNote} Educational comparison, not a recommendation to copy either book.`;

  return {
    fitA,
    fitB,
    lackingA,
    lackingB,
    overlapNote: sharedNote,
    recommendation,
  };
}
