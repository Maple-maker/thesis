import type { PortfolioHolding, Stock } from "@/store/types";

export type PortfolioTension = {
  symbolA: string;
  symbolB: string;
  dimension: "volatility" | "horizon" | "thesis-conflict";
  description: string;
};

/**
 * Surface educational tensions between holdings — observations, not warnings.
 * Copy stays in "these pull in different directions" register; never "sell".
 */
export function detectTensions(
  holdings: PortfolioHolding[],
  stocks: Stock[]
): PortfolioTension[] {
  const tensions: PortfolioTension[] = [];
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const a = stocks.find((s) => s.symbol === holdings[i].symbol);
      const b = stocks.find((s) => s.symbol === holdings[j].symbol);
      if (!a || !b) continue;
      const pair: [Stock, Stock] | null =
        a.volatility === "high" && b.volatility === "low"
          ? [a, b]
          : b.volatility === "high" && a.volatility === "low"
            ? [b, a]
            : null;
      if (pair) {
        tensions.push({
          symbolA: pair[0].symbol,
          symbolB: pair[1].symbol,
          dimension: "volatility",
          description: `${pair[0].symbol} is high-volatility; ${pair[1].symbol} is low-volatility — these pull in different directions. Explore the trade-off in your next Duel.`,
        });
      }
    }
  }
  return tensions.slice(0, 2); // max 2 shown at once
}
