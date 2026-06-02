import { allConcepts, type ConceptId } from "./concepts";
import { STOCKS } from "./stocks";
import { THEMES } from "./themes";
import { personaForTheme } from "./thesis-personas";
import type { ThemeId } from "@/store/types";

export type LibraryEntryKind = "theme" | "concept" | "stock" | "topic";

export type LibraryEntry = {
  id: string;
  kind: LibraryEntryKind;
  title: string;
  subtitle: string;
  keywords: string[];
  themeId?: ThemeId;
  conceptId?: ConceptId;
  symbol?: string;
};

/** Curated topic aliases → theme ids (expand over time) */
const TOPIC_ALIASES: { terms: string[]; themeIds: ThemeId[]; blurb: string }[] = [
  {
    terms: ["oil", "energy", "commodities", "hard assets", "real assets", "gold", "copper", "natural gas"],
    themeIds: ["clean-energy", "cash-flow-defensives"],
    blurb: "Energy, commodities & real-asset exposure",
  },
  {
    terms: ["space", "aerospace", "defense", "satellite", "rockets"],
    themeIds: ["emerging-tech", "ai-infrastructure"],
    blurb: "Frontier tech & infrastructure",
  },
  {
    terms: ["blue chip", "blue-chip", "quality", "dividend aristocrat", "wonderful companies"],
    themeIds: ["compounders", "consumer-staples", "income"],
    blurb: "Quality & dividend compounders",
  },
  {
    terms: ["futures", "derivatives", "options", "hedging"],
    themeIds: ["cash-flow-defensives"],
    blurb: "Risk tools, see also glossary: options basics",
  },
  {
    terms: ["crypto", "bitcoin", "digital assets", "blockchain"],
    themeIds: ["fintech", "emerging-tech"],
    blurb: "Digital assets & fintech",
  },
  {
    terms: ["biotech", "longevity", "gene therapy", "pharma"],
    themeIds: ["biotech", "aging-demographics"],
    blurb: "Healthcare innovation & aging",
  },
  {
    terms: ["ai", "artificial intelligence", "chips", "semiconductor", "nvidia", "data center"],
    themeIds: ["ai-infrastructure"],
    blurb: "AI & compute build-out",
  },
  {
    terms: ["cyber", "cybersecurity", "hacking", "zero trust"],
    themeIds: ["cybersecurity"],
    blurb: "Cybersecurity theme",
  },
  {
    terms: ["emerging markets", "international", "china", "india", "global"],
    themeIds: ["global-diversification"],
    blurb: "International diversification",
  },
  {
    terms: ["inflation", "rates", "fed", "interest rate", "bonds", "treasury"],
    themeIds: ["income", "cash-flow-defensives"],
    blurb: "Rates, income & defensives",
  },
  {
    terms: ["reits", "real estate", "property", "reit", "commercial real estate"],
    themeIds: ["income", "cash-flow-defensives"],
    blurb: "Real estate & REIT income",
  },
  {
    terms: ["uranium", "nuclear", "nuclear energy", "smr", "small modular reactor"],
    themeIds: ["clean-energy"],
    blurb: "Nuclear energy, part of the clean transition",
  },
  {
    terms: ["small cap", "small-cap", "russell", "micro cap", "russell 2000"],
    themeIds: ["emerging-tech", "global-diversification"],
    blurb: "Small & micro-cap equities",
  },
  {
    terms: ["water", "water infrastructure", "water scarcity", "desalination"],
    themeIds: ["clean-energy", "cash-flow-defensives"],
    blurb: "Water infrastructure & scarcity plays",
  },
  {
    terms: ["robotics", "automation", "factory", "manufacturing", "industrial automation"],
    themeIds: ["emerging-tech"],
    blurb: "Robotics & industrial automation",
  },
  {
    terms: ["quantum", "quantum computing", "qubit", "quantum supremacy"],
    themeIds: ["emerging-tech"],
    blurb: "Quantum computing, early-stage frontier tech",
  },
  {
    terms: ["value investing", "deep value", "undervalued", "margin of safety", "graham"],
    themeIds: ["compounders"],
    blurb: "Value investing & margin of safety",
  },
  {
    terms: ["growth", "high growth", "hypergrowth", "momentum", "growth stocks"],
    themeIds: ["emerging-tech", "ai-infrastructure"],
    blurb: "Growth & momentum investing",
  },
  {
    terms: ["etf", "index fund", "passive investing", "vanguard", "indexing"],
    themeIds: ["global-diversification", "compounders"],
    blurb: "ETFs, index funds & passive investing",
  },
  {
    terms: ["esg", "sustainable", "green", "climate", "impact investing"],
    themeIds: ["clean-energy"],
    blurb: "Sustainable & ESG-aligned investing",
  },
  {
    terms: ["bonds", "fixed income", "treasuries", "t bills", "corporate bonds", "municipal"],
    themeIds: ["income"],
    blurb: "Fixed income & bond markets",
  },
  {
    terms: ["tax", "tax loss", "tax efficient", "municipal bonds", "tax planning"],
    themeIds: ["income", "cash-flow-defensives"],
    blurb: "Tax-aware investing strategies",
  },
];

function buildIndex(): LibraryEntry[] {
  const entries: LibraryEntry[] = [];

  for (const t of THEMES) {
    const p = personaForTheme(t.id);
    const kw = [
      t.id,
      t.title,
      t.kicker,
      t.thesis,
      t.author,
      ...t.drivers,
      ...(t.keywords ?? []),
      ...(p?.philosophy.split(/\s+/) ?? []),
      ...(p?.personaName.split(/\s+/) ?? []),
      ...(p?.tagline.split(/\s+/) ?? []),
      ...(p?.exposureTags ?? []),
      ...(p?.modelStocks ?? []),
      ...(p?.modelETFs ?? []),
    ].map((s) => s.toLowerCase());
    entries.push({
      id: `theme-${t.id}`,
      kind: "theme",
      title: t.title,
      subtitle: p?.tagline ?? t.kicker,
      keywords: [...new Set(kw)],
      themeId: t.id,
    });
  }

  for (const c of allConcepts()) {
    const kw = [c.id, c.term, c.short, c.body, ...(c.related ?? [])]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
    entries.push({
      id: `concept-${c.id}`,
      kind: "concept",
      title: c.term,
      subtitle: c.short,
      keywords: [...new Set(kw)],
      conceptId: c.id,
    });
  }

  for (const s of STOCKS) {
    const kw = [
      s.symbol,
      s.name,
      s.sector,
      s.thesis,
      ...s.tags,
      ...s.themes,
    ].map((x) => String(x).toLowerCase());
    entries.push({
      id: `stock-${s.symbol}`,
      kind: "stock",
      title: s.symbol,
      subtitle: s.name,
      keywords: [...new Set(kw)],
      symbol: s.symbol,
      themeId: s.themes[0],
    });
  }

  for (const topic of TOPIC_ALIASES) {
    entries.push({
      id: `topic-${topic.terms[0]}`,
      kind: "topic",
      title: topic.terms[0].replace(/^\w/, (c) => c.toUpperCase()),
      subtitle: topic.blurb,
      keywords: topic.terms.map((t) => t.toLowerCase()),
      themeId: topic.themeIds[0],
    });
  }

  return entries;
}

let _cache: LibraryEntry[] | null = null;

export function libraryIndex(): LibraryEntry[] {
  if (!_cache) _cache = buildIndex();
  return _cache;
}
