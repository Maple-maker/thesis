import type { LensHolding } from "@/data/investor-lenses";
import type { ThemeId } from "@/store/types";

/** Illustrative thesis-shaped portfolios for education duels, not live models. */
export type DuelThesisPreset = {
  id: string;
  name: string;
  subtitle: string;
  thesis: string;
  themeIds: ThemeId[];
  holdings: LensHolding[];
  stats: {
    holdingsCount: number;
    expensePct: number;
    dividendYieldPct: number;
    risk: "Low" | "Medium" | "High";
    return1y: number;
  };
};

export const DUEL_THESIS_PRESETS: DuelThesisPreset[] = [
  {
    id: "value-investing",
    name: "Value investing",
    subtitle: "Moats · dividends · quality at a price",
    thesis:
      "Patient compounders and cash-generative franchises, less about hype, more about durable returns on capital.",
    themeIds: ["compounders", "consumer-staples", "income"],
    holdings: [
      { symbol: "BRK.B", weightPct: 18, kind: "stock" },
      { symbol: "JPM", weightPct: 14, kind: "stock" },
      { symbol: "KO", weightPct: 12, kind: "stock" },
      { symbol: "PG", weightPct: 10, kind: "stock" },
      { symbol: "SCHD", weightPct: 20, kind: "etf" },
      { symbol: "VTV", weightPct: 16, kind: "etf" },
      { symbol: "MOAT", weightPct: 10, kind: "etf" },
    ],
    stats: {
      holdingsCount: 7,
      expensePct: 0.12,
      dividendYieldPct: 2.4,
      risk: "Medium",
      return1y: 14.2,
    },
  },
  {
    id: "ai-edge",
    name: "AI edge",
    subtitle: "Semis · hyperscaler capex · thematic ETFs",
    thesis:
      "Bet on the physical build-out of intelligence, chips, power, memory, and infrastructure ETFs alongside concentrated winners.",
    themeIds: ["ai-infrastructure", "emerging-tech"],
    holdings: [
      { symbol: "NVDA", weightPct: 22, kind: "stock" },
      { symbol: "SMH", weightPct: 20, kind: "etf" },
      { symbol: "AVGO", weightPct: 12, kind: "stock" },
      { symbol: "TSM", weightPct: 10, kind: "stock" },
      { symbol: "AIS", weightPct: 10, kind: "etf" },
      { symbol: "DRAM", weightPct: 8, kind: "etf" },
      { symbol: "QQQ", weightPct: 18, kind: "etf" },
    ],
    stats: {
      holdingsCount: 7,
      expensePct: 0.28,
      dividendYieldPct: 0.4,
      risk: "High",
      return1y: 38.5,
    },
  },
  {
    id: "income-defensive",
    name: "Income & defensives",
    subtitle: "Dividends · bonds · lower beta",
    thesis:
      "Prioritize cash flow and drawdown resilience, dividend equity plus core bond ballast for planners who hate surprises.",
    themeIds: ["income", "cash-flow-defensives"],
    holdings: [
      { symbol: "SCHD", weightPct: 25, kind: "etf" },
      { symbol: "VYM", weightPct: 15, kind: "etf" },
      { symbol: "JEPI", weightPct: 15, kind: "etf" },
      { symbol: "BND", weightPct: 20, kind: "etf" },
      { symbol: "PG", weightPct: 10, kind: "stock" },
      { symbol: "JNJ", weightPct: 10, kind: "stock" },
      { symbol: "XLU", weightPct: 5, kind: "etf" },
    ],
    stats: {
      holdingsCount: 7,
      expensePct: 0.09,
      dividendYieldPct: 3.1,
      risk: "Low",
      return1y: 8.4,
    },
  },
];

export function thesisPresetById(id: string): DuelThesisPreset | undefined {
  return DUEL_THESIS_PRESETS.find((p) => p.id === id);
}
