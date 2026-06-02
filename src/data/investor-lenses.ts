import type { ThemeId } from "@/store/types";
import { FAMOUS_INVESTOR_LENSES } from "@/data/famous-investor-lenses";

export type LensHolding = {
  symbol: string;
  weightPct: number;
  kind: "stock" | "etf";
};

export type LensCategory = "theme" | "famous";

export type InvestorLens = {
  id: string;
  category: LensCategory;
  /** Public figure or style name (famous lenses). */
  inspiredBy?: string;
  name: string;
  subtitle: string;
  bio: string;
  methodology: string[];
  themeIds: ThemeId[];
  holdings: LensHolding[];
  stats: {
    holdingsCount: number;
    expensePct: number;
    dividendYieldPct: number;
    risk: "Low" | "Medium" | "High";
    return1y: number;
    return3y: number;
    return5y: number;
  };
  performanceNote: string;
  /** Illustrative, not live copy-trading */
  disclaimer: string;
};

const THEME_INVESTOR_LENSES: InvestorLens[] = [
  {
    id: "ai-infrastructure",
    category: "theme",
    name: "AI infrastructure lens",
    subtitle: "Physical-world bottlenecks · semis & power",
    bio: "Inspired by investors focused on AGI scaling constraints, power grids, fabs, and industrial capacity that software-first portfolios often underweight.",
    methodology: [
      "Map AGI compute demand to semiconductor and utility supply chains",
      "Prefer liquid ETFs for broad semi exposure; single names for concentrated conviction",
      "Rebalance when theme weights drift more than 5% from targets",
    ],
    themeIds: ["ai-infrastructure", "emerging-tech"],
    holdings: [
      { symbol: "SMH", weightPct: 35, kind: "etf" },
      { symbol: "NVDA", weightPct: 20, kind: "stock" },
      { symbol: "TSM", weightPct: 15, kind: "stock" },
      { symbol: "VST", weightPct: 12, kind: "stock" },
      { symbol: "ARM", weightPct: 10, kind: "stock" },
      { symbol: "QQQ", weightPct: 8, kind: "etf" },
    ],
    stats: {
      holdingsCount: 6,
      expensePct: 0.22,
      dividendYieldPct: 0.4,
      risk: "High",
      return1y: 48.2,
      return3y: 112.5,
      return5y: 89.1,
    },
    performanceNote: "Illustrative backtest vs equal-weight theme basket, not a live fund.",
    disclaimer: "Educational model portfolio. Not affiliated with any named investor or fund.",
  },
  {
    id: "global-growth",
    category: "theme",
    name: "Global growth sleeve",
    subtitle: "Cap-weight growth across regions",
    bio: "A rules-based growth allocation similar to model portfolios that weight international growth by market cap and use low-cost ETFs per sleeve.",
    methodology: [
      "Weight international growth asset classes by market capitalization",
      "Run quantitative screens for low-cost ETFs to track each sleeve",
      "Cap any single ETF at 80% of the growth bucket",
    ],
    themeIds: ["compounders", "global-diversification"],
    holdings: [
      { symbol: "SCHG", weightPct: 76, kind: "etf" },
      { symbol: "EFG", weightPct: 15, kind: "etf" },
      { symbol: "VOT", weightPct: 7, kind: "etf" },
      { symbol: "VBK", weightPct: 2, kind: "etf" },
    ],
    stats: {
      holdingsCount: 4,
      expensePct: 0.09,
      dividendYieldPct: 0.71,
      risk: "Medium",
      return1y: 24.38,
      return3y: 81.52,
      return5y: 77.72,
    },
    performanceNote: "Methodology mirrors cap-weight growth model portfolios (M1-style).",
    disclaimer: "Illustrative targets for learning, verify fees and holdings on issuer sites.",
  },
  {
    id: "quality-income",
    category: "theme",
    name: "Quality income lens",
    subtitle: "Dividend compounders + defensive yield",
    bio: "For investors who want cash flow without abandoning quality, dividend growers with balance-sheet discipline.",
    methodology: [
      "Filter for dividend growth and payout sustainability",
      "Blend dividend ETF core with selective single-name yield",
      "Keep sector concentration below 35% in any one group",
    ],
    themeIds: ["income", "cash-flow-defensives"],
    holdings: [
      { symbol: "SCHD", weightPct: 45, kind: "etf" },
      { symbol: "VYM", weightPct: 25, kind: "etf" },
      { symbol: "JNJ", weightPct: 10, kind: "stock" },
      { symbol: "KO", weightPct: 8, kind: "stock" },
      { symbol: "PG", weightPct: 7, kind: "stock" },
      { symbol: "ABBV", weightPct: 5, kind: "stock" },
    ],
    stats: {
      holdingsCount: 6,
      expensePct: 0.12,
      dividendYieldPct: 2.8,
      risk: "Low",
      return1y: 11.4,
      return3y: 34.2,
      return5y: 52.1,
    },
    performanceNote: "Emphasizes yield and drawdown depth vs pure growth baskets.",
    disclaimer: "Educational only, not a recommendation to replicate any public figure's trades.",
  },
  {
    id: "contrarian-hard-assets",
    category: "theme",
    name: "Hard assets & miners lens",
    subtitle: "Precious metals · junior miners · inflation hedge",
    bio: "A contrarian sleeve emphasizing precious metals and mining exposure, for investors who want explicit inflation and commodity optionality.",
    methodology: [
      "Anchor with physical-backed or broad commodity ETFs",
      "Add selective miners with operating leverage to metal prices",
      "Size position to portfolio risk, typically a satellite, not core",
    ],
    themeIds: ["cash-flow-defensives"],
    holdings: [
      { symbol: "GLD", weightPct: 30, kind: "etf" },
      { symbol: "GDX", weightPct: 25, kind: "etf" },
      { symbol: "FCX", weightPct: 15, kind: "stock" },
      { symbol: "NEM", weightPct: 15, kind: "stock" },
      { symbol: "SLV", weightPct: 15, kind: "etf" },
    ],
    stats: {
      holdingsCount: 5,
      expensePct: 0.35,
      dividendYieldPct: 1.1,
      risk: "High",
      return1y: 18.9,
      return3y: 42.3,
      return5y: 38.7,
    },
    performanceNote: "Volatile sleeve, compare overlap with existing equity beta before adding.",
    disclaimer: "Thematic education, not copy-trading or personalized advice.",
  },
];

export const INVESTOR_LENSES: InvestorLens[] = [
  ...THEME_INVESTOR_LENSES,
  ...FAMOUS_INVESTOR_LENSES,
];

export function lensesByCategory(category: LensCategory): InvestorLens[] {
  return INVESTOR_LENSES.filter((l) => l.category === category);
}

export function lensById(id: string): InvestorLens | undefined {
  return INVESTOR_LENSES.find((l) => l.id === id);
}
