import type { Theme } from "@/store/types";

export const THEMES: Theme[] = [
  {
    id: "ai-infrastructure",
    title: "The Decade Ahead",
    thesis:
      "The build-out of intelligence, chips, power, and data centers, as the defining investment of the 2020s.",
    color: "#0E7A66",
    glyph: "bolt",
    kicker: "AI & COMPUTE",
    heat: "Heating up",
    author: "after Leopold Aschenbrenner",
    drivers: [
      "Exponential compute demand",
      "Power & grid bottlenecks",
      "Capex from hyperscalers",
      "Reshoring of fabs",
    ],
    emoji: "⚙️",
    keywords: [
      "ai", "compute", "chips", "semiconductor", "nvidia", "data center",
      "gpu", "hyperscaler", "machine learning", "deep learning",
      "power infrastructure", "fab", "tsmc", "reshoring",
    ],
  },
  {
    id: "compounders",
    title: "Wonderful Companies",
    thesis:
      "Buy great businesses with durable moats at a fair price, then let time and compounding do the work.",
    color: "#2563EB",
    glyph: "moat",
    kicker: "QUALITY",
    heat: "Timeless",
    author: "after Warren Buffett",
    drivers: [
      "Durable competitive moats",
      "Pricing power",
      "Owner-minded management",
      "Margin of safety",
    ],
    emoji: "📈",
    keywords: [
      "quality", "moat", "buffett", "value", "blue chip", "wonderful companies",
      "compounding", "pricing power", "management", "durable",
      "dividend aristocrat", "margin of safety", "owner operator",
    ],
  },
  {
    id: "cash-flow-defensives",
    title: "The All-Weather",
    thesis:
      "Boring, durable businesses with strong free cash flow and pricing power. Sleep-well-at-night holdings.",
    color: "#149059",
    glyph: "shield",
    kicker: "BALANCED",
    heat: "Evergreen",
    author: "after Ray Dalio",
    drivers: [
      "Risk parity over dollar parity",
      "Uncorrelated cash flows",
      "Survive any environment",
      "Sleep at night",
    ],
    emoji: "🛡️",
    keywords: [
      "defensive", "all weather", "dalio", "risk parity", "uncorrelated",
      "safe", "stable", "free cash flow", "reits", "utilities",
      "consumer staples", "healthcare", "low volatility", "sleep at night",
    ],
  },
  {
    id: "clean-energy",
    title: "The Energy Transition",
    thesis:
      "Electrification of everything, and the grid, storage, and metals that have to scale to power it.",
    color: "#16A34A",
    glyph: "leaf",
    kicker: "ENERGY",
    heat: "Long arc",
    author: "a structural shift",
    drivers: [
      "Electrification of transport",
      "Grid modernization",
      "Battery & storage scale-up",
      "Critical minerals supply",
    ],
    emoji: "🌱",
    keywords: [
      "energy", "green", "solar", "wind", "battery", "electrification",
      "grid", "esg", "sustainable", "uranium", "nuclear", "clean tech",
      "critical minerals", "lithium", "copper", "storage", "renewable",
    ],
  },
  {
    id: "aging-demographics",
    title: "The Aging World",
    thesis:
      "One of the most predictable trends on earth: the population is getting older, and it will spend on health.",
    color: "#7C3AED",
    glyph: "pulse",
    kicker: "HEALTHCARE",
    heat: "Steady",
    author: "a demographic certainty",
    drivers: [
      "Rising 65+ population",
      "GLP-1 / obesity drugs",
      "Medical devices growth",
      "Care infrastructure demand",
    ],
    emoji: "🧬",
    keywords: [
      "healthcare", "aging", "longevity", "glp-1", "pharma", "medical",
      "demographics", "65 plus", "obesity drugs", "medical devices",
      "care infrastructure", "biotech", "hospitals", "senior living",
    ],
  },
  {
    id: "income",
    title: "Reliable Income",
    thesis:
      "Dividend payers and stable cash-distributors for portfolio yield without sacrificing quality.",
    color: "#D98512",
    glyph: "piggy",
    kicker: "INCOME",
    heat: "Steady",
    author: "yield-first investing",
    drivers: [
      "Quality dividend payers",
      "Inflation-protected cash flows",
      "Buybacks + distributions",
      "Lower portfolio volatility",
    ],
    emoji: "💵",
    keywords: [
      "dividend", "yield", "income", "distributions", "cash flow",
      "retirement", "reits", "bonds", "fixed income", "dividend growth",
      "payout", "buybacks", "shareholder return", "monthly income",
    ],
  },
  {
    id: "cybersecurity",
    title: "The Defense Layer",
    thesis:
      "Attack surfaces expand with every device and service, defense budgets only go up.",
    color: "#DC2626",
    glyph: "lock",
    kicker: "CYBERSECURITY",
    heat: "Heating up",
    author: "a secular tailwind",
    drivers: [
      "Cloud + SaaS attack surface",
      "AI-enabled threat vectors",
      "Zero-trust replacements",
      "Regulatory teeth",
    ],
    emoji: "🔒",
    keywords: [
      "cyber", "security", "hacking", "zero trust", "defense",
      "cloud security", "ransomware", "firewall", "endpoint",
      "network security", "threat intelligence", "sase", "sse",
    ],
  },
  {
    id: "fintech",
    title: "Digital Money Rails",
    thesis:
      "Digital rails replacing legacy banking and payment infrastructure globally.",
    color: "#A3E635",
    glyph: "compass",
    kicker: "FINTECH",
    heat: "Evergreen",
    author: "the rebundling of finance",
    drivers: [
      "Card-network toll-booths",
      "Embedded finance everywhere",
      "Cross-border real-time rails",
      "Cash → digital in emerging markets",
    ],
    emoji: "💳",
    keywords: [
      "fintech", "payments", "digital", "banking", "crypto", "blockchain",
      "cards", "visa", "mastercard", "embedded finance", "cross border",
      "real time payments", "neobank", "digital wallet",
    ],
  },
  {
    id: "biotech",
    title: "The Biotech Frontier",
    thesis:
      "Speculative but transformative, gene editing, GLP-1s, oncology, longevity. High variance, high asymmetry.",
    color: "#C084FC",
    glyph: "seed",
    kicker: "BIOTECH",
    heat: "Long arc",
    author: "asymmetric upside",
    drivers: [
      "Gene editing approvals",
      "GLP-1 expansion into new diseases",
      "AI-accelerated drug discovery",
      "Personalized oncology",
    ],
    emoji: "🔬",
    keywords: [
      "biotech", "gene therapy", "crispr", "drugs", "pharma",
      "oncology", "glp-1", "gene editing", "personalized medicine",
      "clinical trials", "fda", "immunotherapy", "rare disease",
    ],
  },
  {
    id: "consumer-staples",
    title: "Brands You Already Buy",
    thesis:
      "Things people buy regardless of economy, household, food, beverages with global brand moats.",
    color: "#FB923C",
    glyph: "gem",
    kicker: "STAPLES",
    heat: "Timeless",
    author: "the dividend kings",
    drivers: [
      "Pricing power across cycles",
      "Emerging-market consumer growth",
      "Decades-long dividend records",
      "Defensive cash machines",
    ],
    emoji: "🛒",
    keywords: [
      "staples", "consumer", "brands", "defensive", "household",
      "food", "beverage", "pricing power", "recession proof",
      "dividend kings", "global brands", "consumer goods", "cpg",
    ],
  },
  {
    id: "global-diversification",
    title: "Beyond the S&P",
    thesis:
      "Exposure beyond the US, developed markets, emerging markets, and currency hedging.",
    color: "#0EA5E9",
    glyph: "grid",
    kicker: "GLOBAL",
    heat: "Evergreen",
    author: "diversification done right",
    drivers: [
      "Mean-reversion vs US",
      "Cheaper valuations abroad",
      "Currency diversification",
      "Demographic dispersion",
    ],
    emoji: "🌍",
    keywords: [
      "international", "global", "emerging markets", "diversification",
      "foreign", "ex-us", "china", "india", "europe", "developed markets",
      "currency hedging", "international etf", "geographic", "expat",
    ],
  },
  {
    id: "emerging-tech",
    title: "What's Next",
    thesis:
      "Robotics, quantum, autonomy, space, earlier-stage themes with longer payoff curves.",
    color: "#818CF8",
    glyph: "sparkle",
    kicker: "FRONTIER",
    heat: "Long arc",
    author: "the long-tail bets",
    drivers: [
      "Humanoid robotics",
      "Quantum compute milestones",
      "Autonomous mobility",
      "Space economy scale-up",
    ],
    emoji: "🚀",
    keywords: [
      "frontier", "robotics", "quantum", "space", "autonomous",
      "emerging", "future", "humanoid", "autonomy", "small cap",
      "disruption", "moonshot", "venture", "early stage", "innovation",
    ],
  },
];

export const themeById = (id: string): Theme | undefined =>
  THEMES.find((t) => t.id === id);

// Heat-to-color mapping for chips
export const HEAT_COLOR: Record<string, string> = {
  "Heating up": "#D8472C",
  Evergreen: "#0E7A66",
  Timeless: "#7C3AED",
  "Long arc": "#149059",
  Steady: "#D98512",
};
