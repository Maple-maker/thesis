import type { Sector, Stock, StockTag, ThemeId } from "@/store/types";

const MAX_TAGS = 8;

const SEMICONDUCTOR_SYMBOLS = new Set([
  "NVDA",
  "TSM",
  "AVGO",
  "AMD",
  "ARM",
  "ASML",
  "INTC",
  "MU",
  "QCOM",
  "LRCX",
  "AMAT",
  "KLAC",
]);

const PAYMENTS_SYMBOLS = new Set(["V", "MA", "PYPL", "SQ", "ADYEN", "MELI"]);

const EXTRA_TAGS: Record<string, StockTag[]> = {
  PYPL: ["turnaround", "payments"],
  TSLA: ["consumer-discretionary", "energy-transition"],
  PLTR: ["ai-compute", "cloud-software"],
  UAL: ["cyclical"],
  DAL: ["cyclical"],
  EQIX: ["reit", "infrastructure", "ai-compute"],
  VST: ["infrastructure", "energy-transition"],
  IBM: ["cloud-software", "infrastructure"],
  IONQ: ["ai-compute"],
};

const SECTOR_TAGS: Partial<Record<Sector, StockTag[]>> = {
  Utilities: ["defensive", "infrastructure"],
  "Real Estate": ["reit"],
  Energy: ["energy-commodity", "cyclical"],
  Healthcare: ["pharma"],
  Financials: ["financials"],
  Technology: ["cloud-software"],
  Industrials: ["cyclical"],
  Materials: ["cyclical", "energy-commodity"],
  Communication: ["cloud-software"],
};

const THEME_TAGS: Partial<Record<ThemeId, StockTag[]>> = {
  "ai-infrastructure": ["ai-compute"],
  biotech: ["biotech"],
  cybersecurity: ["cybersecurity"],
  "clean-energy": ["energy-transition", "esg"],
  "consumer-staples": ["consumer-staples", "defensive"],
  fintech: ["payments", "financials"],
  income: ["income-heavy"],
  "cash-flow-defensives": ["defensive"],
  "global-diversification": ["international"],
  "emerging-tech": ["speculative"],
};

/** Human-readable chip label for UI. */
export function stockTagLabel(tag: StockTag): string {
  const labels: Record<StockTag, string> = {
    growth: "Growth",
    value: "Value",
    dividend: "Dividend",
    speculative: "Speculative",
    "blue-chip": "Blue chip",
    "mega-cap": "Mega-cap",
    "large-cap": "Large-cap",
    "mid-cap": "Mid-cap",
    "small-cap": "Small-cap",
    international: "International",
    esg: "ESG",
    moat: "Wide moat",
    "high-volatility": "High volatility",
    defensive: "Defensive",
    cyclical: "Cyclical",
    "income-heavy": "Income focus",
    semiconductor: "Semiconductor",
    "ai-compute": "AI & compute",
    biotech: "Biotech",
    pharma: "Pharma & devices",
    reit: "REIT",
    infrastructure: "Infrastructure",
    "consumer-staples": "Consumer staples",
    "consumer-discretionary": "Discretionary",
    financials: "Financials",
    "energy-commodity": "Energy & commodities",
    "energy-transition": "Energy transition",
    payments: "Payments",
    cybersecurity: "Cybersecurity",
    "cloud-software": "Cloud & software",
    turnaround: "Turnaround",
  };
  return labels[tag] ?? tag;
}

export type StockTagTone = "default" | "brand" | "pos" | "amber" | "violet" | "neg";

export function stockTagTone(tag: StockTag): StockTagTone {
  if (tag === "speculative" || tag === "high-volatility" || tag === "cyclical") return "amber";
  if (tag === "defensive" || tag === "dividend" || tag === "income-heavy" || tag === "moat")
    return "pos";
  if (tag === "ai-compute" || tag === "semiconductor" || tag === "cybersecurity") return "violet";
  if (tag === "esg" || tag === "energy-transition") return "brand";
  if (tag === "turnaround" || tag === "small-cap") return "neg";
  return "default";
}

/** Merge curated tags with cap tier, sector, themes, and fundamentals. */
export function inferStockTags(stock: Stock): StockTag[] {
  const tags = new Set<StockTag>(stock.tags);

  if (stock.marketCap >= 200) tags.add("mega-cap");
  else if (stock.marketCap >= 50) tags.add("large-cap");
  else if (stock.marketCap >= 10) tags.add("mid-cap");
  else tags.add("small-cap");

  if (stock.marketCap >= 100 && stock.volatility === "low") tags.add("blue-chip");

  if (stock.divYield >= 3) tags.add("income-heavy");
  if (stock.divYield >= 1.2) tags.add("dividend");

  if (stock.volatility === "high") tags.add("high-volatility");
  if (stock.volatility === "low" && stock.sector !== "Energy") tags.add("defensive");

  if (stock.peRatio != null && stock.peRatio > 50) tags.add("high-volatility");
  if (stock.peRatio != null && stock.peRatio < 16 && !tags.has("growth")) tags.add("value");

  for (const t of SECTOR_TAGS[stock.sector] ?? []) tags.add(t);

  if (stock.sector === "Consumer") {
    if (stock.themes.includes("consumer-staples")) tags.add("consumer-staples");
    else tags.add("consumer-discretionary");
  }

  if (stock.sector === "Healthcare" && stock.themes.includes("biotech")) {
    tags.add("biotech");
    tags.delete("pharma");
  }

  for (const tid of stock.themes) {
    for (const t of THEME_TAGS[tid] ?? []) tags.add(t);
  }

  if (SEMICONDUCTOR_SYMBOLS.has(stock.symbol)) tags.add("semiconductor");
  if (PAYMENTS_SYMBOLS.has(stock.symbol)) tags.add("payments");

  for (const t of EXTRA_TAGS[stock.symbol] ?? []) tags.add(t);

  if (tags.has("value") && stock.peRatio != null && stock.peRatio < 22) tags.add("turnaround");

  const ordered = prioritizeStockTags([...tags]);
  return ordered.slice(0, MAX_TAGS);
}

const TAG_PRIORITY: StockTag[] = [
  "mega-cap",
  "large-cap",
  "mid-cap",
  "small-cap",
  "blue-chip",
  "growth",
  "value",
  "dividend",
  "income-heavy",
  "moat",
  "defensive",
  "cyclical",
  "semiconductor",
  "ai-compute",
  "biotech",
  "cybersecurity",
  "energy-transition",
  "international",
  "speculative",
  "high-volatility",
  "turnaround",
  "esg",
];

function prioritizeStockTags(tags: StockTag[]): StockTag[] {
  const rank = new Map(TAG_PRIORITY.map((t, i) => [t, i]));
  return [...tags].sort(
    (a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99) || a.localeCompare(b)
  );
}

export function enrichStockTags(stock: Stock): Stock {
  return { ...stock, tags: inferStockTags(stock) };
}
