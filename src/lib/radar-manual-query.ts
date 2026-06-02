import type { MarketSearchHit } from "@/lib/market-api";
import { securitiesFromMarketHits } from "@/lib/radar-market-sync";
import { catalogEntryToEtf, searchCatalogEtfs } from "@/data/etf-catalog";
import { catalogEntryToStock, searchCatalogStocks } from "@/data/stocks-catalog";
import { ETFS } from "@/data/etfs";
import { STOCKS } from "@/data/stocks";
import { THEMES, themeById } from "@/data/themes";
import { scoreThesis } from "@/lib/thesis-score";
import { thesisFitForEtf, thesisFitForStock } from "@/lib/thesis-fit";
import { screenSecurities, type SecurityResult } from "@/lib/security-screener";
import type { StockTag, ThemeId, UserProfile } from "@/store/types";
import type { WatchlistRadarSuggestion } from "@/lib/watchlist-radar-suggestions";

function labelFromScore(score: number): WatchlistRadarSuggestion["label"] {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  if (score >= 25) return "Weak";
  return "Mismatch";
}

function queryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

type ManualIntent = {
  id: string;
  label: string;
  themeIds: ThemeId[];
  tags: StockTag[];
  prioritySymbols: string[];
};

const MANUAL_INTENTS: { pattern: RegExp; intent: ManualIntent }[] = [
  {
    pattern:
      /foreign|international|global(?!\s+brand)|overseas|ex-?us|emerging\s+market|non-?us|abroad|vxus/i,
    intent: {
      id: "foreign",
      label: "foreign / international exposure",
      themeIds: ["global-diversification"],
      tags: ["international"],
      prioritySymbols: ["VXUS", "VWO", "VEA", "IEMG", "EFA", "IXUS", "MELI", "BABA", "TSM"],
    },
  },
  {
    pattern: /biotech|gene|pharma|drug|longevity|crispr|glp/i,
    intent: {
      id: "biotech",
      label: "biotech",
      themeIds: ["biotech", "aging-demographics"],
      tags: ["biotech"],
      prioritySymbols: ["XBI", "IBB", "REGN", "VRTX", "MRNA"],
    },
  },
  {
    pattern: /dividend|income|yield|schd|jepi/i,
    intent: {
      id: "income",
      label: "income",
      themeIds: ["income"],
      tags: ["dividend", "income-heavy"],
      prioritySymbols: ["SCHD", "VYM", "JEPI", "DGRO"],
    },
  },
  {
    pattern: /ai\b|artificial|semiconductor|nvidia|data center|chip/i,
    intent: {
      id: "ai",
      label: "AI & compute",
      themeIds: ["ai-infrastructure"],
      tags: ["semiconductor", "ai-compute"],
      prioritySymbols: ["SMH", "SOXX", "AIQ", "NVDA", "AVGO"],
    },
  },
];

export function detectManualIntents(query: string): ManualIntent[] {
  const q = query.trim();
  if (q.length < 3) return [];
  const hits: ManualIntent[] = [];
  for (const { pattern, intent } of MANUAL_INTENTS) {
    if (pattern.test(q)) hits.push(intent);
  }
  return hits;
}

/** Map free-text notes to theme ids (even if not selected in Builder). */
export function themeIdsFromManualQuery(query: string): ThemeId[] {
  const q = query.toLowerCase();
  const tokens = queryTokens(query);
  const hits = new Set<ThemeId>();

  for (const intent of detectManualIntents(query)) {
    for (const tid of intent.themeIds) hits.add(tid);
  }

  for (const theme of THEMES) {
    const id = theme.id as ThemeId;
    if (q.includes(theme.id.replace(/-/g, " ")) || q.includes(theme.id)) {
      hits.add(id);
    }
    for (const kw of theme.keywords ?? []) {
      const k = kw.toLowerCase();
      if (q.includes(k) || tokens.some((t) => k.includes(t) || t.includes(k))) {
        hits.add(id);
      }
    }
    if (theme.kicker && q.includes(theme.kicker.toLowerCase())) {
      hits.add(id);
    }
  }

  return [...hits];
}

function stockToSecurity(stock: (typeof STOCKS)[number]): SecurityResult {
  return { ...stock, kind: "stock" as const, curated: true };
}

function etfToSecurity(etf: (typeof ETFS)[number]): SecurityResult {
  return { ...etf, kind: "etf" as const, curated: true };
}

function resolveSymbol(sym: string): SecurityResult | null {
  const key = sym.toUpperCase();
  const stock = STOCKS.find((s) => s.symbol === key);
  if (stock) return stockToSecurity(stock);
  const etf = ETFS.find((e) => e.symbol === key);
  if (etf) return etfToSecurity(etf);

  const catE = searchCatalogEtfs(key, { limit: 1 }).find((e) => e.symbol === key);
  if (catE) return { ...catalogEntryToEtf(catE), kind: "etf", curated: false };

  const catS = searchCatalogStocks(key, { limit: 1 }).find((s) => s.symbol === key);
  if (catS) return { ...catalogEntryToStock(catS), kind: "stock", curated: false };

  return null;
}

/** Full-catalog discovery, not limited to text search on the query string. */
export function discoverSecuritiesForManualQuery(
  query: string,
  liveMarketHits?: MarketSearchHit[]
): SecurityResult[] {
  const q = query.trim();
  if (q.length < 3) return [];

  const intents = detectManualIntents(q);
  const tokens = queryTokens(q);
  const seen = new Set<string>();
  const out: SecurityResult[] = [];

  const push = (item: SecurityResult | null, boost: number) => {
    if (!item || seen.has(item.symbol)) return;
    seen.add(item.symbol);
    out.push(item);
    (item as SecurityResult & { _boost?: number })._boost = boost;
  };

  for (const item of securitiesFromMarketHits(liveMarketHits ?? [])) {
    push(item, 95);
  }

  for (const intent of intents) {
    for (const sym of intent.prioritySymbols) {
      push(resolveSymbol(sym), 100);
    }
    for (const etf of ETFS) {
      if (intent.themeIds.some((t) => etf.themes.includes(t))) {
        push(etfToSecurity(etf), 80);
      }
    }
    for (const stock of STOCKS) {
      const themeHit = intent.themeIds.some((t) => stock.themes.includes(t));
      const tagHit = intent.tags.some((t) => stock.tags.includes(t));
      if (themeHit || tagHit) push(stockToSecurity(stock), 70);
    }
  }

  for (const stock of STOCKS) {
    const text = `${stock.name} ${stock.thesis} ${stock.sector} ${stock.tags.join(" ")}`.toLowerCase();
    if (tokens.some((t) => text.includes(t))) push(stockToSecurity(stock), 40);
    if (stock.tags.includes("international") && /foreign|international|global|exposure/.test(q)) {
      push(stockToSecurity(stock), 55);
    }
  }

  for (const etf of ETFS) {
    const text = `${etf.name} ${etf.description}`.toLowerCase();
    if (tokens.some((t) => text.includes(t))) push(etfToSecurity(etf), 40);
  }

  for (const item of screenSecurities({
    query: q,
    kind: "all",
    themeId: "all",
    assetClass: "all",
    maxExpense: null,
    includeLeveraged: false,
    sort: "symbol",
  })) {
    push(item, 35);
  }

  return out.sort(
    (a, b) =>
      ((b as SecurityResult & { _boost?: number })._boost ?? 0) -
      ((a as SecurityResult & { _boost?: number })._boost ?? 0)
  );
}

function manualMatchScore(
  item: SecurityResult,
  query: string,
  tokens: string[],
  intents: ManualIntent[]
): number {
  const sym = item.symbol.toLowerCase();
  const name = item.name.toLowerCase();
  const sector = item.kind === "stock" ? item.sector.toLowerCase() : "";
  const thesis = item.kind === "stock" ? item.thesis.toLowerCase() : item.description.toLowerCase();
  const q = query.toLowerCase();
  let score = (item as SecurityResult & { _boost?: number })._boost ?? 0;

  if (q.length >= 4 && (sym.includes(q) || name.includes(q))) score += 40;

  for (const intent of intents) {
    if (intent.prioritySymbols.includes(item.symbol)) score += 50;
    if (intent.themeIds.some((t) => item.themes.includes(t))) score += 28;
    if (item.kind === "stock" && intent.tags.some((t) => item.tags.includes(t))) score += 22;
  }

  for (const t of tokens) {
    if (sym.includes(t)) score += 18;
    if (name.includes(t)) score += 16;
    if (sector.includes(t)) score += 12;
    if (thesis.includes(t)) score += 14;
    if (item.kind === "stock" && item.tags.some((tag) => tag.toLowerCase().includes(t))) {
      score += 12;
    }
  }

  return score;
}

function manualHeadline(
  symbol: string,
  query: string,
  intents: ManualIntent[],
  matchedThemes: ThemeId[]
): { headline: string; subline: string } {
  const sym = symbol.toUpperCase();
  const snippet =
    query.trim().length > 48 ? `${query.trim().slice(0, 45)}…` : query.trim();
  const intentLabel = intents[0]?.label;
  const theme = matchedThemes[0] ? themeById(matchedThemes[0]) : null;

  if (intentLabel) {
    return {
      headline: `${sym}, ${intentLabel}`,
      subline: `From your note: “${snippet}”`,
    };
  }
  if (theme) {
    return {
      headline: `${sym}, matches your note (${theme.kicker ?? theme.title})`,
      subline: `From your note: “${snippet}”`,
    };
  }
  return {
    headline: `${sym}, matches your radar note`,
    subline: `From your note: “${snippet}”`,
  };
}

export function suggestionsFromManualQuery(input: {
  query: string;
  profile: UserProfile;
  themeIds: ThemeId[];
  stockLimit?: number;
  etfLimit?: number;
  liveMarketHits?: MarketSearchHit[];
}): { stocks: WatchlistRadarSuggestion[]; etfs: WatchlistRadarSuggestion[]; intents: ManualIntent[] } {
  const q = input.query.trim();
  if (q.length < 3) {
    return { stocks: [], etfs: [], intents: [] };
  }

  const stockLimit = input.stockLimit ?? 6;
  const etfLimit = input.etfLimit ?? 3;
  const intents = detectManualIntents(q);
  const extraThemes = themeIdsFromManualQuery(q);
  const effectiveThemes = [...new Set([...input.themeIds, ...extraThemes])] as ThemeId[];

  const securities = discoverSecuritiesForManualQuery(q, input.liveMarketHits);
  const minManual = intents.length > 0 ? 8 : 12;

  const ranked = securities
    .map((item) => {
      const manual = manualMatchScore(item, q, queryTokens(q), intents);
      if (manual < minManual) return null;

      let thesisOverall = 50;
      if (item.kind === "stock") {
        const full = STOCKS.find((s) => s.symbol === item.symbol) ?? item;
        thesisOverall = scoreThesis(full, input.profile, effectiveThemes).overall;
      } else {
        const full = ETFS.find((e) => e.symbol === item.symbol) ?? item;
        thesisOverall = thesisFitForEtf(full, input.profile, effectiveThemes).score;
      }

      const combined = Math.min(
        100,
        Math.round(manual * 0.62 + thesisOverall * 0.38)
      );
      const matchedThemes = extraThemes.filter((tid) => item.themes.includes(tid));
      const { headline, subline } = manualHeadline(item.symbol, q, intents, matchedThemes);

      return {
        symbol: item.symbol,
        name: item.name,
        kind: item.kind,
        score: combined,
        label: labelFromScore(combined),
        headline,
        subline,
        blurb: `Radar note match (${combined})`,
        sortKey: manual * 2 + thesisOverall,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => b.sortKey - a.sortKey);

  const stocks: WatchlistRadarSuggestion[] = [];
  const etfs: WatchlistRadarSuggestion[] = [];

  for (const row of ranked) {
    const { sortKey: _s, ...suggestion } = row;
    if (row.kind === "etf") {
      if (etfs.length < etfLimit) etfs.push(suggestion);
    } else if (stocks.length < stockLimit) {
      stocks.push(suggestion);
    }
  }

  return { stocks, etfs, intents };
}

export function hasActiveManualIntent(query: string): boolean {
  return detectManualIntents(query.trim()).length > 0;
}
