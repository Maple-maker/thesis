import { searchCatalogEtfs } from "@/data/etf-catalog";
import { searchCatalogStocks } from "@/data/stocks-catalog";
import { etfBySymbol, ETFS } from "@/data/etfs";
import { stockBySymbol, STOCKS } from "@/data/stocks";
import {
  buildPortfolioCompareMetrics,
  portfolioDuelVerdict,
  portfolioOverlap,
  resolvePortfolio,
  type ResolvedPortfolio,
} from "@/lib/duel-portfolio";
import { financialsForSymbol } from "@/data/stock-financials";
import {
  etfHoldingOverlap,
  suggestEtfForPair,
  suggestEtfVsEtf,
  type ETFSuggestion,
} from "@/lib/etf-overlap";
import type { ConceptId } from "@/data/concepts";
import { conceptIdForMetricLabel } from "@/lib/duel-metric-info";
import { thesisFitForAsset, thesisLackingForAsset } from "@/lib/thesis-fit";
import type { Holding } from "@/types/linked-accounts";
import type { ETF, Stock, ThemeId, UserProfile } from "@/store/types";

export type DuelAssetKind = "stock" | "etf" | "portfolio";

export type DuelAsset = {
  kind: DuelAssetKind;
  /** Display label (ticker or short portfolio code). */
  symbol: string;
  /** Stable id for routes & journal, ticker or lens:… / thesis:… / portfolio:my */
  duelRef: string;
  name: string;
  themes: ThemeId[];
  thesis: string;
  expense?: number;
  stock?: Stock;
  etf?: ETF;
  portfolio?: ResolvedPortfolio;
};

export function isPortfolioRef(ref: string): boolean {
  const r = ref.trim().toLowerCase();
  return (
    r.startsWith("lens:") ||
    r.startsWith("thesis:") ||
    r.startsWith("benchmark:") ||
    r.startsWith("portfolio:") ||
    r === "my" ||
    r === "my-portfolio"
  );
}

export function resolveDuelAsset(
  symbol: string,
  userHoldings: Holding[] = []
): DuelAsset | null {
  const raw = symbol.trim();
  if (isPortfolioRef(raw)) {
    const portfolio = resolvePortfolio(raw, userHoldings);
    if (!portfolio) return null;
    return {
      kind: "portfolio",
      symbol: portfolio.displaySymbol,
      duelRef: portfolio.ref,
      name: portfolio.name,
      themes: portfolio.themeIds,
      thesis: portfolio.thesis,
      expense: portfolio.stats.expensePct,
      portfolio,
    };
  }

  const sym = raw.toUpperCase();
  const stock = stockBySymbol(sym);
  if (stock) {
    return {
      kind: "stock",
      symbol: stock.symbol,
      duelRef: stock.symbol,
      name: stock.name,
      themes: stock.themes,
      thesis: stock.thesis,
      stock,
    };
  }
  const etf = etfBySymbol(sym);
  if (etf) {
    return {
      kind: "etf",
      symbol: etf.symbol,
      duelRef: etf.symbol,
      name: etf.name,
      themes: etf.themes,
      thesis: etf.description,
      expense: etf.expense,
      etf,
    };
  }
  return null;
}

export type CompareMetric = {
  label: string;
  a: string;
  b: string;
  better: "a" | "b" | "tie";
  conceptId?: ConceptId;
};

export function buildCompareMetrics(a: DuelAsset, b: DuelAsset): CompareMetric[] {
  if (a.kind === "portfolio" && b.kind === "portfolio" && a.portfolio && b.portfolio) {
    return buildPortfolioCompareMetrics(a.portfolio, b.portfolio);
  }
  if (a.kind === "portfolio" || b.kind === "portfolio") {
    return portfolioMixedMetrics(a, b);
  }
  if (a.kind === "stock" && b.kind === "stock" && a.stock && b.stock) {
    return stockMetrics(a.stock, b.stock);
  }
  if (a.kind === "etf" && b.kind === "etf" && a.etf && b.etf) {
    return etfMetrics(a.etf, b.etf);
  }
  return mixedMetrics(a, b);
}

function portfolioMixedMetrics(a: DuelAsset, b: DuelAsset): CompareMetric[] {
  const p = a.portfolio ?? b.portfolio!;
  const other = a.portfolio ? b : a;
  const otherHoldings =
    other.kind === "portfolio" ? String(other.portfolio!.stats.holdingsCount) : "1 name";
  return [
    metric("Type", a.kind, b.kind, "tie"),
    metric("Holdings", String(p.stats.holdingsCount), otherHoldings, "tie"),
    metric(
      "Blended expense",
      `${p.stats.expensePct}%`,
      other.expense != null ? `${other.expense}%` : "-",
      p.stats.expensePct < (other.expense ?? 999) ? "a" : p.stats.expensePct > (other.expense ?? 0) ? "b" : "tie"
    ),
    metric(
      "Risk",
      p.stats.risk,
      other.portfolio?.stats.risk ?? other.stock?.volatility ?? "-",
      "tie"
    ),
    metric(
      "1Y (illustrative)",
      `${p.stats.return1y}%`,
      other.portfolio ? `${other.portfolio.stats.return1y}%` : "-",
      "tie"
    ),
  ];
}

function metric(
  label: string,
  a: string,
  b: string,
  better: "a" | "b" | "tie"
): CompareMetric {
  return { label, a, b, better, conceptId: conceptIdForMetricLabel(label) };
}

function stockMetrics(a: Stock, b: Stock): CompareMetric[] {
  const finA = financialsForSymbol(a.symbol);
  const finB = financialsForSymbol(b.symbol);
  const betaA = finA?.beta != null ? finA.beta.toFixed(2) : "-";
  const betaB = finB?.beta != null ? finB.beta.toFixed(2) : "-";
  const rows: CompareMetric[] = [
    metric("Market Cap", fmtCap(a.marketCap), fmtCap(b.marketCap), a.marketCap > b.marketCap ? "a" : "b"),
    metric(
      "P/E",
      a.peRatio ? String(a.peRatio) : "-",
      b.peRatio ? String(b.peRatio) : "-",
      betterLower(a.peRatio, b.peRatio)
    ),
    metric(
      "Div. Yield",
      a.divYield > 0 ? `${a.divYield}%` : "-",
      b.divYield > 0 ? `${b.divYield}%` : "-",
      a.divYield > b.divYield ? "a" : a.divYield < b.divYield ? "b" : "tie"
    ),
    metric("Volatility", a.volatility, b.volatility, volBetter(a.volatility, b.volatility)),
  ];
  if (betaA !== "-" || betaB !== "-") {
    rows.push(
      metric("Beta", betaA, betaB, betterLower(finA?.beta ?? null, finB?.beta ?? null))
    );
  }
  return rows;
}

function etfMetrics(a: ETF, b: ETF): CompareMetric[] {
  return [
    metric("Expense", `${a.expense}%`, `${b.expense}%`, a.expense < b.expense ? "a" : a.expense > b.expense ? "b" : "tie"),
    metric("Holdings", String(a.holdings.length), String(b.holdings.length), "tie"),
    metric("Top theme", a.themes[0] ?? "-", b.themes[0] ?? "-", "tie"),
  ];
}

function mixedMetrics(a: DuelAsset, b: DuelAsset): CompareMetric[] {
  const aExp = a.expense != null ? `${a.expense}%` : "-";
  const bExp = b.expense != null ? `${b.expense}%` : "-";
  return [
    { label: "Type", a: a.kind.toUpperCase(), b: b.kind.toUpperCase(), better: "tie" },
    {
      label: "Expense",
      a: aExp,
      b: bExp,
      better:
        a.expense != null && b.expense != null
          ? a.expense < b.expense
            ? "a"
            : a.expense > b.expense
              ? "b"
              : "tie"
          : a.expense != null
            ? "a"
            : b.expense != null
              ? "b"
              : "tie",
    },
    {
      label: "Thesis fit",
      a: "See below",
      b: "See below",
      better: "tie",
    },
    { label: "Volatility", a: a.stock?.volatility ?? "-", b: b.stock?.volatility ?? "-", better: "tie" },
  ];
}

export function duelVerdict(
  a: DuelAsset,
  b: DuelAsset,
  userThemeIds: ThemeId[],
  profile: UserProfile,
  holdings: Holding[]
): {
  fitA: ReturnType<typeof thesisFitForAsset>;
  fitB: ReturnType<typeof thesisFitForAsset>;
  lackingA: string[];
  lackingB: string[];
  overlapNote: string | null;
  overlapPct: number | null;
  recommendation: string;
} {
  if (a.kind === "portfolio" && b.kind === "portfolio" && a.portfolio && b.portfolio) {
    const v = portfolioDuelVerdict(a.portfolio, b.portfolio, userThemeIds, profile);
    const overlap = portfolioOverlap(a.portfolio, b.portfolio);
    return {
      ...v,
      overlapPct: overlap.overlapPct,
      overlapNote: v.overlapNote,
    };
  }

  const fitA = thesisFitForAsset(a, profile, userThemeIds);
  const fitB = thesisFitForAsset(b, profile, userThemeIds);
  const better = fitA.score >= fitB.score ? a : b;
  const worse = better.symbol === a.symbol ? b : a;

  const lackingA = thesisLackingForAsset(a.themes, userThemeIds);
  const lackingB = thesisLackingForAsset(b.themes, userThemeIds);

  let overlapNote: string | null = null;
  let overlapPct: number | null = null;
  const heldA = holdings.find((h) => h.symbol === a.symbol);
  const heldB = holdings.find((h) => h.symbol === b.symbol);
  if (heldA && heldB) {
    overlapNote = `You hold both ${a.symbol} (${heldA.weightPct}%) and ${b.symbol} (${heldB.weightPct}%), compare whether they add diversification or duplicate risk.`;
  } else if (heldA || heldB) {
    const h = heldA ?? heldB!;
    overlapNote = `You already hold ${h.symbol} at ${h.weightPct}%, adding the other may increase concentration in the same theme.`;
  }

  if (a.kind === "etf" && b.kind === "etf" && a.etf && b.etf) {
    const o = etfHoldingOverlap(a.etf, b.etf);
    overlapPct = o.overlapPct;
    if (o.sharedCount >= 2) {
      overlapNote = `${a.symbol} vs ${b.symbol}: ~${o.overlapPct}% holdings overlap (${o.shared.slice(0, 4).join(", ")}${o.shared.length > 4 ? "…" : ""}). ${o.onlyA.length ? `${a.symbol} unique: ${o.onlyA.slice(0, 2).join(", ")}. ` : ""}${o.onlyB.length ? `${b.symbol} unique: ${o.onlyB.slice(0, 2).join(", ")}.` : ""}`;
    }
  }

  const expenseNote =
    a.expense != null && b.expense != null
      ? a.expense < b.expense
        ? `${a.symbol} is cheaper (${a.expense}% vs ${b.expense}%).`
        : `${b.symbol} is cheaper (${b.expense}% vs ${a.expense}%).`
      : "";

  const betterFit = better.symbol === a.symbol ? fitA : fitB;
  const worseFit = better.symbol === a.symbol ? fitB : fitA;
  const recommendation = `For your themes, ${better.symbol} fits better (${betterFit.score}/100 vs ${worseFit.score} for ${worse.symbol}). ${expenseNote} ${overlapNote ? "Watch overlap before holding both." : "Check X-Ray if you already own a related fund."} Educational only, not a buy/sell call.`;

  return { fitA, fitB, lackingA, lackingB, overlapNote, overlapPct, recommendation };
}

export function suggestForDuelAssets(
  a: DuelAsset,
  b: DuelAsset,
  profile?: UserProfile,
  limit = 3
): ETFSuggestion[] {
  if (a.etf && b.etf) return suggestEtfVsEtf(a.etf, b.etf, profile, limit);
  if (a.stock && b.stock) return suggestEtfForPair(a.stock, b.stock, profile, limit);
  const stock = a.stock ?? b.stock;
  const etf = a.etf ?? b.etf;
  if (stock && etf) {
    const hasStock = etf.holdings.includes(stock.symbol);
    return [
      {
        etf,
        containsBoth: hasStock,
        matchScore: hasStock ? 90 : 40,
        why: hasStock
          ? `${etf.symbol} holds ${stock.symbol}, one ticket at ${etf.expense}% expense.`
          : `${etf.symbol} is theme-aligned but doesn't hold ${stock.symbol}, check X-Ray overlap.`,
      },
    ];
  }
  return [];
}

export const DUEL_SEARCH_SYMBOLS: string[] = [
  ...STOCKS.map((s) => s.symbol),
  ...ETFS.map((e) => e.symbol),
];

/** Symbol search for duel pick, stocks + curated + catalog ETFs. */
export function searchDuelSymbols(query: string, limit = 30): string[] {
  const q = query.trim().toUpperCase();
  if (!q) {
    return [...STOCKS.map((s) => s.symbol), ...ETFS.map((e) => e.symbol)].slice(0, 24);
  }
  const stockHits = [
    ...STOCKS.filter(
      (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
    ).map((s) => s.symbol),
    ...searchCatalogStocks(q, { limit: 30 }).map((e) => e.symbol),
  ];
  const curatedHits = ETFS.filter(
    (e) => e.symbol.includes(q) || e.name.toUpperCase().includes(q)
  ).map((e) => e.symbol);
  const seen = new Set<string>();
  const dedupedStocks = stockHits.filter((sym) => {
    if (seen.has(sym)) return false;
    seen.add(sym);
    return true;
  });
  const dedupedCurated = curatedHits.filter((sym) => {
    if (seen.has(sym)) return false;
    seen.add(sym);
    return true;
  });
  const catalogHits = searchCatalogEtfs(q, { limit: 40 })
    .map((e) => e.symbol)
    .filter((sym) => !seen.has(sym) && (seen.add(sym), true));
  const exact = (sym: string) => (sym === q ? 0 : sym.startsWith(q) ? 1 : 2);
  return [...dedupedStocks, ...dedupedCurated, ...catalogHits]
    .sort((a, b) => exact(a) - exact(b) || a.localeCompare(b))
    .slice(0, limit);
}

function fmtCap(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${b}B`;
}

function betterLower(a: number | null, b: number | null): "a" | "b" | "tie" {
  if (a == null && b == null) return "tie";
  if (a == null) return "b";
  if (b == null) return "a";
  if (a < b) return "a";
  if (b < a) return "b";
  return "tie";
}

function volBetter(av: string, bv: string): "a" | "b" | "tie" {
  const rank: Record<string, number> = { low: 0, med: 1, high: 2 };
  if (rank[av] < rank[bv]) return "a";
  if (rank[bv] < rank[av]) return "b";
  return "tie";
}
