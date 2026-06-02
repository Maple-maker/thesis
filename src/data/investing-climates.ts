import type { ThemeId } from "@/store/types";

export type ClimateSecurityPick = {
  symbol: string;
  kind: "stock" | "etf";
  reason: string;
};

export type InvestingClimate = {
  id: string;
  /** Short label for cards */
  title: string;
  /** Example headline the user might have seen */
  exampleHeadline: string;
  summary: string;
  /** What this climate means for positioning */
  implication: string;
  themeIds: ThemeId[];
  favor: ClimateSecurityPick[];
  avoid: ClimateSecurityPick[];
  /** Extra search terms for matching user paste */
  matchTerms: string[];
  askSeed: string;
};

export const INVESTING_CLIMATES: InvestingClimate[] = [
  {
    id: "quantum-computing-grants",
    title: "Quantum computing push",
    exampleHeadline: "Government unveils grants to accelerate quantum computing",
    summary:
      "Policy and capex are flowing into quantum research, early winners are often semis, cloud platforms, and niche ETFs, not pure-play revenue yet.",
    implication:
      "Treat as a long-dated thematic sleeve: size small, favor liquid ETFs + platform names, avoid confusing hype with earnings.",
    themeIds: ["emerging-tech", "ai-infrastructure"],
    matchTerms: [
      "quantum",
      "qubit",
      "quantum computing",
      "government grant",
      "national lab",
      "defense tech",
    ],
    favor: [
      { symbol: "IONQ", kind: "stock", reason: "Pure-play quantum narrative, high volatility" },
      { symbol: "IBM", kind: "stock", reason: "Enterprise quantum + hybrid cloud research" },
      { symbol: "GOOGL", kind: "stock", reason: "Quantum research + cloud scale" },
      { symbol: "QTUM", kind: "etf", reason: "Quantum computing ETF basket" },
      { symbol: "ARKQ", kind: "etf", reason: "Autonomous & frontier tech exposure" },
      { symbol: "SMH", kind: "etf", reason: "Semiconductor pick-and-shovel for compute" },
    ],
    avoid: [
      { symbol: "XLP", kind: "etf", reason: "Defensive staples, weak link to quantum theme" },
      { symbol: "BND", kind: "etf", reason: "Bond ballast, different risk story" },
    ],
    askSeed:
      "Government grants are flowing into quantum computing. How should a long-term investor explore this theme without over-concentrating?",
  },
  {
    id: "consumer-spending-tight",
    title: "Consumer spending tightens",
    exampleHeadline: "Inflation squeezes discretionary spending, retailers warn on outlook",
    summary:
      "When households trade down, non-essential brands (athleisure, premium apparel) often see margin pressure before staples and value retail.",
    implication:
      "Favor essentials and pricing power; be cautious on discretionary consumer until data improves.",
    themeIds: ["consumer-staples", "cash-flow-defensives", "income"],
    matchTerms: [
      "consumer spending",
      "discretionary",
      "retail sales",
      "inflation",
      "trade down",
      "tightening",
      "nike",
      "lululemon",
      "apparel",
    ],
    favor: [
      { symbol: "PG", kind: "stock", reason: "Essential household products, pricing power" },
      { symbol: "KO", kind: "stock", reason: "Affordable staple, resilient demand" },
      { symbol: "WMT", kind: "stock", reason: "Value retail benefits from trade-down" },
      { symbol: "COST", kind: "stock", reason: "Membership model + value perception" },
      { symbol: "XLP", kind: "etf", reason: "Consumer staples sector basket" },
      { symbol: "SCHD", kind: "etf", reason: "Quality dividend, defensive tilt" },
    ],
    avoid: [
      { symbol: "NKE", kind: "stock", reason: "Discretionary athletic, sensitive to spending" },
      { symbol: "LULU", kind: "stock", reason: "Premium discretionary, not essential" },
      { symbol: "TSLA", kind: "stock", reason: "Big-ticket discretionary, rate + spending risk" },
    ],
    askSeed:
      "Consumer spending is tightening with inflation still elevated. Which types of stocks tend to hold up vs discretionary names like apparel?",
  },
  {
    id: "rate-cuts-growth",
    title: "Fed pivots toward cuts",
    exampleHeadline: "Fed signals rate cuts as inflation cools",
    summary:
      "Falling rates usually help long-duration growth and rate-sensitive housing; defensives can lag in the first leg of a rally.",
    implication:
      "Re-check growth tilt vs income, duration risk in bonds matters too.",
    themeIds: ["emerging-tech", "ai-infrastructure", "compounders"],
    matchTerms: ["rate cut", "fed pivot", "soft landing", "lower rates", "dovish"],
    favor: [
      { symbol: "QQQ", kind: "etf", reason: "Growth beta when rates fall" },
      { symbol: "NVDA", kind: "stock", reason: "Long-duration growth leadership" },
      { symbol: "MSFT", kind: "stock", reason: "Quality growth + cloud" },
      { symbol: "VNQ", kind: "etf", reason: "REITs often rate-sensitive" },
    ],
    avoid: [
      { symbol: "SHV", kind: "etf", reason: "Ultra-short cash, less upside if cuts priced in" },
    ],
    askSeed:
      "If the Fed is cutting rates, how might that affect my mix of growth stocks vs dividend defensives?",
  },
  {
    id: "ai-capex-surge",
    title: "AI capex surge",
    exampleHeadline: "Hyperscalers raise AI infrastructure spending forecasts",
    summary:
      "Cloud giants are directing record capex to GPUs, networking, and power, suppliers and ETFs often move before profits fully follow.",
    implication:
      "Map capex chain: semis, networking, utilities, data-center REITs, watch concentration.",
    themeIds: ["ai-infrastructure", "emerging-tech"],
    matchTerms: ["ai capex", "hyperscaler", "data center", "gpu", "nvidia", "cloud spending"],
    favor: [
      { symbol: "NVDA", kind: "stock", reason: "GPU demand center of gravity" },
      { symbol: "AVGO", kind: "stock", reason: "Custom silicon + networking" },
      { symbol: "SMH", kind: "etf", reason: "Broad semiconductor exposure" },
      { symbol: "VST", kind: "stock", reason: "Power for data centers" },
      { symbol: "EQIX", kind: "stock", reason: "Data-center real estate" },
    ],
    avoid: [
      { symbol: "BND", kind: "etf", reason: "Low beta, misses AI capex beta" },
    ],
    askSeed:
      "Hyperscalers are raising AI capex. How do I express that theme without only owning one chip name?",
  },
  {
    id: "energy-shock",
    title: "Energy prices spike",
    exampleHeadline: "Oil jumps on supply shock, inflation fears return",
    summary:
      "Energy shocks hit consumers and transport but can reward producers and certain real assets.",
    implication:
      "Separate trading energy from owning your core thesis, often a satellite sleeve.",
    themeIds: ["clean-energy", "cash-flow-defensives"],
    matchTerms: ["oil", "gas prices", "opec", "energy shock", "crude"],
    favor: [
      { symbol: "XLE", kind: "etf", reason: "US energy producers" },
      { symbol: "CVX", kind: "stock", reason: "Integrated major" },
      { symbol: "XOM", kind: "stock", reason: "Cash-flow heavy major" },
      { symbol: "GLD", kind: "etf", reason: "Often used as geopolitical hedge" },
    ],
    avoid: [
      { symbol: "UAL", kind: "stock", reason: "Airlines, fuel cost headwind" },
      { symbol: "DAL", kind: "stock", reason: "Transport margin pressure" },
    ],
    askSeed:
      "Energy prices are spiking again. How might that interact with a long-term stock portfolio?",
  },
  {
    id: "defensive-rotation",
    title: "Flight to defensives",
    exampleHeadline: "Investors rotate into staples and utilities amid recession fears",
    summary:
      "Late-cycle fear often lifts low-beta staples, healthcare, and utilities while speculative growth sells off.",
    implication:
      "Check whether your book is pro-cyclical, add defensives if overlap is low.",
    themeIds: ["consumer-staples", "cash-flow-defensives", "income"],
    matchTerms: ["recession", "defensive", "staples", "flight to quality", "late cycle"],
    favor: [
      { symbol: "JNJ", kind: "stock", reason: "Healthcare defensive" },
      { symbol: "PG", kind: "stock", reason: "Staples pricing power" },
      { symbol: "XLP", kind: "etf", reason: "Staples sector" },
      { symbol: "XLU", kind: "etf", reason: "Utilities, bond-proxy behavior" },
    ],
    avoid: [
      { symbol: "ARKK", kind: "etf", reason: "High-beta innovation, weak in risk-off" },
      { symbol: "TSLA", kind: "stock", reason: "Cyclical growth, volatile in recessions" },
    ],
    askSeed:
      "Markets are rotating into defensives. How do I stress-test my portfolio for a recession scare?",
  },
];

export function climateById(id: string): InvestingClimate | undefined {
  return INVESTING_CLIMATES.find((c) => c.id === id);
}
