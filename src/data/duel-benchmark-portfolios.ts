import type { LensHolding } from "@/data/investor-lenses";

/** 100% SPY, the "why wouldn't I just do this?" baseline */
export const SP500_INDEX_PORTFOLIO = {
  id: "sp500-index",
  name: "S&P 500 index",
  subtitle: "SPY · buy-the-market baseline",
  thesis:
    "The default alternative: one fund that tracks the S&P 500. Every model portfolio on Thesis is benchmarked against this so you can see if a thesis earned its complexity.",
  themeIds: [],
  holdings: [{ symbol: "SPY", weightPct: 100, kind: "etf" as const }] satisfies LensHolding[],
  stats: {
    holdingsCount: 1,
    expensePct: 0.09,
    dividendYieldPct: 1.3,
    risk: "Medium" as const,
    return1y: 25.6,
  },
};
