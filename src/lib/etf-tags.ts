import type { EtfAssetClass } from "@/data/etf-catalog.generated";
import type { ETF, EtfTag, ThemeId } from "@/store/types";

const MAX_TAGS = 7;

const BROAD = new Set(["VOO", "VTI", "SPY", "IVV", "SPLG", "ITOT"]);
const GROWTH_TILT = new Set(["QQQ", "QQQM", "VUG", "IWF", "ARKK"]);
const SEMI = new Set(["SMH", "SOXX", "XSD"]);
const INTL = new Set(["VXUS", "VEA", "IEFA", "IXUS", "EFA"]);
const EM = new Set(["VWO", "IEMG", "EEM", "EWZ", "INDA"]);

const THEME_TAGS: Partial<Record<ThemeId, EtfTag[]>> = {
  "ai-infrastructure": ["semiconductor", "thematic"],
  cybersecurity: ["cybersecurity", "thematic"],
  "clean-energy": ["clean-energy", "thematic"],
  "aging-demographics": ["healthcare"],
  biotech: ["biotech", "thematic"],
  income: ["income"],
  "consumer-staples": ["defensive"],
  "global-diversification": ["international"],
  "emerging-tech": ["active-concentrated", "thematic"],
  compounders: ["dividend-growth"],
};

const EXTRA: Record<string, EtfTag[]> = {
  SCHD: ["dividend-growth", "income"],
  VYM: ["income"],
  JEPI: ["income", "higher-fee"],
  MOAT: ["dividend-growth", "thematic"],
  GLD: ["commodity", "defensive"],
  GDX: ["commodity"],
  SLV: ["commodity"],
  VNQ: ["real-estate", "income"],
  HACK: ["cybersecurity", "sector-bundle"],
  CIBR: ["cybersecurity", "sector-bundle"],
};

export function etfTagLabel(tag: EtfTag): string {
  const labels: Record<EtfTag, string> = {
    "broad-market": "Broad market",
    "growth-tilt": "Growth tilt",
    defensive: "Defensive",
    "sector-bundle": "Sector",
    thematic: "Thematic",
    international: "International",
    "emerging-markets": "Emerging markets",
    income: "Income",
    "dividend-growth": "Dividend growth",
    "low-cost": "Low cost",
    "higher-fee": "Higher fee",
    semiconductor: "Semiconductors",
    "clean-energy": "Clean energy",
    healthcare: "Healthcare",
    cybersecurity: "Cybersecurity",
    biotech: "Biotech",
    "real-estate": "Real estate",
    commodity: "Commodity",
    "active-concentrated": "Active / concentrated",
    "leveraged-inverse": "Leveraged / inverse",
    "small-cap": "Small cap",
    "income-heavy": "Income heavy",
    cyclical: "Cyclical",
    "energy-commodity": "Energy",
    "consumer-discretionary": "Consumer disc.",
    "consumer-staples": "Consumer staples",
    fintech: "Fintech",
    payments: "Payments",
    "ai-compute": "AI compute",
    infrastructure: "Infrastructure",
    speculative: "Speculative",
  };
  return labels[tag] ?? tag;
}

export type EtfTagTone = "default" | "brand" | "pos" | "amber" | "violet";

export function etfTagTone(tag: EtfTag): EtfTagTone {
  if (tag === "low-cost" || tag === "defensive" || tag === "income" || tag === "dividend-growth" || tag === "income-heavy" || tag === "consumer-staples") return "pos";
  if (tag === "higher-fee" || tag === "active-concentrated" || tag === "leveraged-inverse" || tag === "cyclical" || tag === "energy-commodity" || tag === "speculative")
    return "amber";
  if (tag === "semiconductor" || tag === "cybersecurity" || tag === "biotech" || tag === "ai-compute" || tag === "fintech" || tag === "payments") return "violet";
  if (tag === "clean-energy" || tag === "international" || tag === "infrastructure") return "brand";
  return "default";
}

export function inferEtfTags(etf: ETF, assetClass?: EtfAssetClass): EtfTag[] {
  const tags = new Set<EtfTag>(etf.tags ?? []);

  if (etf.expense <= 0.12) tags.add("low-cost");
  if (etf.expense >= 0.5) tags.add("higher-fee");

  if (BROAD.has(etf.symbol)) tags.add("broad-market");
  if (GROWTH_TILT.has(etf.symbol)) tags.add("growth-tilt");
  if (SEMI.has(etf.symbol)) tags.add("semiconductor");
  if (INTL.has(etf.symbol)) tags.add("international");
  if (EM.has(etf.symbol)) tags.add("emerging-markets");

  if (/dividend|income|yield|schd|vym|jepi/i.test(etf.name)) tags.add("income");
  if (/sector|select sector/i.test(etf.name)) tags.add("sector-bundle");
  if (/ark |innovation|thematic|genomic|robot|ai /i.test(etf.name)) tags.add("thematic");

  for (const tid of etf.themes) {
    for (const t of THEME_TAGS[tid] ?? []) tags.add(t);
  }

  for (const t of EXTRA[etf.symbol] ?? []) tags.add(t);

  if (assetClass) {
    if (assetClass === "intl-equity") tags.add("international");
    if (assetClass === "fixed-income") tags.add("defensive");
    if (assetClass === "real-estate") tags.add("real-estate");
    if (assetClass === "commodity") tags.add("commodity");
    if (assetClass === "sector") tags.add("sector-bundle");
    if (assetClass === "thematic") tags.add("thematic");
    if (assetClass === "factor") tags.add("dividend-growth");
    if (assetClass === "leveraged-inverse") tags.add("leveraged-inverse");
  }

  if (!tags.has("broad-market") && etf.themes.length === 0 && !assetClass) {
    tags.add("sector-bundle");
  }

  return [...tags].slice(0, MAX_TAGS);
}

export function enrichEtfTags(etf: ETF, assetClass?: EtfAssetClass): ETF {
  return { ...etf, tags: inferEtfTags(etf, assetClass) };
}
