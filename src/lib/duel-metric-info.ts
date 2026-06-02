import type { ConceptId } from "@/data/concepts";

/** Glossary concept for a head-to-head metric label (education-first duel). */
export function conceptIdForMetricLabel(label: string): ConceptId | undefined {
  const map: Record<string, ConceptId> = {
    "Market Cap": "market-cap",
    "P/E": "pe-ratio",
    "FWD P/E": "pe-ratio",
    Expense: "expense-ratio",
    "Div Yield": "dividend-yield",
    "Div. Yield": "dividend-yield",
    Volatility: "volatility",
    Beta: "beta",
    Holdings: "what-is-etf",
    "Top theme": "sector-industry",
    Type: "what-is-etf",
  };
  return map[label];
}
