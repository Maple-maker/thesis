import {
  catalogEntryToEtf,
  classifyEtfAssetClass,
  ETF_CATALOG_COUNT,
  type EtfAssetClass,
} from "@/data/etf-catalog";
import { ETFS } from "@/data/etfs";
import {
  catalogEntryToStock,
  searchCatalogStocks,
  STOCK_CATALOG_COUNT,
} from "@/data/stocks-catalog";
import { STOCKS } from "@/data/stocks";
import { screenEtfs, type ScreenerFilters, type ScreenerResult } from "@/lib/etf-screener";
import type { MarketSearchHit } from "@/lib/market-api";
import type { Stock, ThemeId } from "@/store/types";

export type SecurityKind = "etf" | "stock";

export type SecurityResult =
  | (ScreenerResult & { kind: "etf" })
  | (Stock & { kind: "stock"; curated: boolean });

export type SecurityScreenerFilters = ScreenerFilters & {
  kind: "all" | SecurityKind;
};

function searchStocks(query: string, limit = 80): SecurityResult[] {
  const curatedSymbols = new Set(STOCKS.map((s) => s.symbol));
  const q = query.trim().toLowerCase();
  let curated = [...STOCKS];

  if (q) {
    curated = curated.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        s.thesis.toLowerCase().includes(q)
    );
  }

  const catalogHits = searchCatalogStocks(q, {
    limit: q ? 120 : 80,
    excludeSymbols: curatedSymbols,
  });

  const catalogResults: SecurityResult[] = catalogHits.map((entry) => ({
    ...catalogEntryToStock(entry),
    kind: "stock" as const,
    curated: false,
  }));

  const curatedResults: SecurityResult[] = curated.map((s) => ({
    ...s,
    kind: "stock" as const,
    curated: true,
  }));

  const merged = [...curatedResults, ...catalogResults];
  const exact = (sym: string) =>
    sym.toLowerCase() === q ? 0 : sym.toLowerCase().startsWith(q) ? 1 : 2;

  return merged
    .sort((a, b) => {
      if (a.curated !== b.curated) return a.curated ? -1 : 1;
      return exact(a.symbol) - exact(b.symbol) || a.symbol.localeCompare(b.symbol);
    })
    .slice(0, limit);
}

function etfToSecurity(results: ScreenerResult[]): SecurityResult[] {
  return results.map((e) => ({ ...e, kind: "etf" as const }));
}

export function screenSecurities(filters: SecurityScreenerFilters): SecurityResult[] {
  const { kind, ...etfFilters } = filters;

  if (kind === "stock") {
    return searchStocks(filters.query, 120);
  }

  if (kind === "etf") {
    return etfToSecurity(screenEtfs(etfFilters));
  }

  const q = filters.query.trim();
  const stocks = searchStocks(q, q ? 50 : 30);
  const etfs = etfToSecurity(screenEtfs({ ...etfFilters, query: q }));

  const merged = [...stocks, ...etfs];
  if (!q) {
    return merged.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "stock" ? -1 : 1;
      if ("curated" in a && "curated" in b && a.curated !== b.curated) {
        return a.curated ? -1 : 1;
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }

  const exact = (sym: string) =>
    sym.toLowerCase() === q.toLowerCase()
      ? 0
      : sym.toLowerCase().startsWith(q.toLowerCase())
        ? 1
        : 2;

  return merged.sort((a, b) => {
    const ea = exact(a.symbol);
    const eb = exact(b.symbol);
    if (ea !== eb) return ea - eb;
    if (a.kind !== b.kind) return a.kind === "etf" && "curated" in a && a.curated ? -1 : 1;
    if ("curated" in a && "curated" in b && a.curated !== b.curated) {
      return a.curated ? -1 : 1;
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

export function securitySummary(item: SecurityResult): string {
  if (item.kind === "stock") {
    if (item.curated) {
      const cap =
        item.marketCap >= 1000
          ? `$${(item.marketCap / 1000).toFixed(1)}T`
          : `$${item.marketCap}B`;
      return `${item.sector} · ${cap} · P/E ${item.peRatio ?? "-"}`;
    }
    const cap =
      item.marketCap >= 1000
        ? `$${(item.marketCap / 1000).toFixed(1)}T`
        : item.marketCap > 0
          ? `$${item.marketCap}B`
          : "Market cap unknown";
    return `${item.sector} · ${cap} · catalog`;
  }
  if (item.curated) {
    return `${item.expense}% fee · ${item.holdings.length} holdings · ${item.themes.length} themes`;
  }
  const ac = item.assetClass;
  return ac ? `${item.expense}% fee · ${ac.replace(/-/g, " ")}` : `${item.expense}% fee`;
}

export function securityUniverseLabel(count: number, kind: SecurityScreenerFilters["kind"]): string {
  const stockN = STOCK_CATALOG_COUNT || STOCKS.length;
  if (kind === "stock") {
    return `${count} shown · ${STOCKS.length} deep dives · ${stockN}+ stocks`;
  }
  if (kind === "etf") {
    return `${count} shown · ${ETFS.length} deep dives · ${ETF_CATALOG_COUNT}+ ETFs`;
  }
  return `${count} shown · ${stockN}+ stocks · ${ETF_CATALOG_COUNT}+ ETFs`;
}

/** Quick typeahead for header search elsewhere */
export function quickSearchSymbols(query: string, limit = 12): { symbol: string; kind: SecurityKind; name: string }[] {
  const q = query.trim();
  if (!q) return [];
  const out: { symbol: string; kind: SecurityKind; name: string }[] = [];
  const seen = new Set<string>();

  for (const s of searchStocks(q, 6)) {
    if (!seen.has(s.symbol)) {
      seen.add(s.symbol);
      out.push({ symbol: s.symbol, kind: "stock", name: s.name });
    }
  }
  for (const e of screenEtfs({ query: q, themeId: "all", assetClass: "all", maxExpense: null, includeLeveraged: false, sort: "symbol" }).slice(0, 8)) {
    if (!seen.has(e.symbol)) {
      seen.add(e.symbol);
      out.push({ symbol: e.symbol, kind: "etf", name: e.name });
    }
  }
  return out.slice(0, limit);
}

/** Turn live Yahoo hits into screener rows (when API is up and local catalog misses). */
export function securitiesFromMarketHits(hits: MarketSearchHit[]): SecurityResult[] {
  return hits.map((hit) => {
    if (hit.kind === "etf") {
      const entry = {
        symbol: hit.symbol,
        name: hit.name,
        expense: hit.expense ?? null,
        assetClass: classifyEtfAssetClass(hit.name),
      };
      return {
        ...catalogEntryToEtf(entry),
        curated: false,
        assetClass: entry.assetClass,
        kind: "etf" as const,
      };
    }
    const stock = catalogEntryToStock({
      symbol: hit.symbol,
      name: hit.name,
      sector: (hit.sector as Stock["sector"]) ?? "Technology",
      marketCapB: hit.marketCapB ?? null,
    });
    return { ...stock, kind: "stock" as const, curated: false };
  });
}

export function mergeLiveSecurities(
  local: SecurityResult[],
  live: SecurityResult[]
): SecurityResult[] {
  const seen = new Set(local.map((r) => r.symbol));
  const extra = live.filter((r) => !seen.has(r.symbol));
  return extra.length ? [...local, ...extra] : local;
}

/**
 * Skip Yahoo live search when the bundled catalog already answers the query.
 * Reduces 429s during screener typing.
 */
export function needsLiveMarketSearch(query: string, local: SecurityResult[]): boolean {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return false;

  const exact = local.some((r) => r.symbol.toLowerCase() === q);
  if (exact) return false;

  const prefixHits = local.filter(
    (r) =>
      r.symbol.toLowerCase().startsWith(q) ||
      r.name.toLowerCase().includes(q)
  );
  if (prefixHits.length >= 4) return false;

  return true;
}

export { type EtfAssetClass, type ThemeId };
