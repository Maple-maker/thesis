import { ETFS } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import type { ETF, Stock, UserProfile } from "@/store/types";

export type EtfOverlapResult = {
  shared: string[];
  sharedCount: number;
  overlapPct: number;
  onlyA: string[];
  onlyB: string[];
};

/** % of the smaller fund's holdings that also appear in the other fund. */
export function etfHoldingOverlap(a: ETF, b: ETF): EtfOverlapResult {
  const setB = new Set(b.holdings);
  const shared = a.holdings.filter((s) => setB.has(s));
  const onlyA = a.holdings.filter((s) => !setB.has(s));
  const onlyB = b.holdings.filter((s) => !a.holdings.includes(s));
  const denom = Math.min(a.holdings.length, b.holdings.length) || 1;
  return {
    shared,
    sharedCount: shared.length,
    overlapPct: Math.round((shared.length / denom) * 100),
    onlyA: onlyA.slice(0, 5),
    onlyB: onlyB.slice(0, 5),
  };
}

export type ETFSuggestion = {
  etf: ETF;
  containsBoth: boolean;
  matchScore: number;
  why: string;
};

/**
 * Find ETFs that give exposure to both stocks, ranked by quality of match.
 * Falls back to ETFs that cover at least one of the stocks if no perfect match.
 */
export function suggestEtfForPair(
  a: Stock,
  b: Stock,
  profile?: UserProfile,
  limit = 3
): ETFSuggestion[] {
  const sharedThemes = a.themes.filter((t) => b.themes.includes(t));

  const scored: ETFSuggestion[] = ETFS.map((etf) => {
    const hasA = etf.holdings.includes(a.symbol);
    const hasB = etf.holdings.includes(b.symbol);
    const containsBoth = hasA && hasB;

    let score = 0;
    if (containsBoth) score += 100;
    else if (hasA || hasB) score += 25;

    // Theme alignment with the duel
    const themeOverlap = etf.themes.filter((t) => sharedThemes.includes(t)).length;
    score += themeOverlap * 10;

    // Bonus for low expense ratio
    score += Math.max(0, 5 - etf.expense * 10);

    // Profile-aware tilts
    if (profile) {
      if (profile.incomeNeed === "primary" && etf.themes.includes("income")) score += 8;
      if (profile.values.includes("esg") && etf.themes.includes("clean-energy")) score += 4;
    }

    const why = buildReason(etf, a, b, containsBoth, hasA, hasB, themeOverlap);

    return { etf, containsBoth, matchScore: score, why };
  });

  return scored
    .filter((s) => s.matchScore > 5)
    .sort((x, y) => y.matchScore - x.matchScore)
    .slice(0, limit);
}

function buildReason(
  etf: ETF,
  a: Stock,
  b: Stock,
  both: boolean,
  hasA: boolean,
  hasB: boolean,
  themeOverlap: number
): string {
  if (both) {
    const otherCount = etf.holdings.length - 2;
    return `Holds both ${a.symbol} and ${b.symbol}, plus ${otherCount} similar names. Expense ${etf.expense}%.`;
  }
  if (hasA || hasB) {
    const has = hasA ? a.symbol : b.symbol;
    return `Holds ${has} alongside related names in the same theme. Expense ${etf.expense}%.`;
  }
  if (themeOverlap > 0) {
    return `Aligned to the shared theme even though it doesn't hold either name directly.`;
  }
  return `Related exposure via overlapping themes.`;
}

/** Given a watchlist of symbols, find ETFs that subsume the most positions. */
export function suggestEtfForWatchlist(
  symbols: string[],
  limit = 3
): { etf: ETF; covered: string[] }[] {
  if (symbols.length < 2) return [];
  const scored = ETFS.map((etf) => {
    const covered = symbols.filter((s) => etf.holdings.includes(s));
    return { etf, covered };
  });
  return scored
    .filter((s) => s.covered.length >= 2)
    .sort((a, b) => b.covered.length - a.covered.length)
    .slice(0, limit);
}

/** Convenience helper for screens that have only symbols. */
export function suggestForSymbols(
  symA: string,
  symB: string,
  profile?: UserProfile,
  limit = 3
): ETFSuggestion[] {
  const a = stockBySymbol(symA);
  const b = stockBySymbol(symB);
  if (!a || !b) return [];
  return suggestEtfForPair(a, b, profile, limit);
}

export function suggestEtfVsEtf(a: ETF, b: ETF, profile?: UserProfile, limit = 3): ETFSuggestion[] {
  const o = etfHoldingOverlap(a, b);
  const cheaper = a.expense <= b.expense ? a : b;
  const pricier = cheaper === a ? b : a;
  const suggestions: ETFSuggestion[] = [
    {
      etf: cheaper,
      containsBoth: o.sharedCount >= 3,
      matchScore: 100 - cheaper.expense * 10,
      why: `Lower fee (${cheaper.expense}% vs ${pricier.expense}%). ~${o.overlapPct}% holdings overlap with ${pricier.symbol}, holding both may duplicate ${o.shared.slice(0, 3).join(", ")}.`,
    },
  ];
  if (o.onlyA.length || o.onlyB.length) {
    const uniqueA = o.onlyA.slice(0, 2).join(", ");
    const uniqueB = o.onlyB.slice(0, 2).join(", ");
    suggestions.push({
      etf: pricier,
      containsBoth: false,
      matchScore: 50,
      why: `Adds names the other lacks${uniqueB ? ` (e.g. ${uniqueB})` : ""}${uniqueA ? `, ${a.symbol} unique: ${uniqueA}` : ""}.`,
    });
  }
  if (profile?.incomeNeed === "primary") {
    const income = ETFS.find((e) => e.themes.includes("income"));
    if (income && income.symbol !== a.symbol && income.symbol !== b.symbol) {
      suggestions.push({
        etf: income,
        containsBoth: false,
        matchScore: 30,
        why: `Neither duel pick is income-focused, ${income.symbol} may fill a gap if dividends matter to you.`,
      });
    }
  }
  return suggestions.slice(0, limit);
}
