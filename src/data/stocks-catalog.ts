import type { Stock, Sector } from "@/store/types";
import { enrichStockTags } from "@/lib/stock-tags";
import {
  STOCK_CATALOG,
  STOCK_CATALOG_COUNT,
  type StockCatalogRow,
} from "@/data/stocks-catalog.generated";

export type { StockCatalogRow };
export { STOCK_CATALOG_COUNT };

export type StockCatalogEntry = {
  symbol: string;
  name: string;
  sector: Sector;
  marketCapB: number | null;
};

const CATALOG_BY_SYMBOL = new Map<string, StockCatalogEntry>();

for (const row of STOCK_CATALOG) {
  const [symbol, name, sector, marketCapB] = row;
  CATALOG_BY_SYMBOL.set(symbol, { symbol, name, sector, marketCapB });
}

export function catalogEntryBySymbol(symbol: string): StockCatalogEntry | undefined {
  return CATALOG_BY_SYMBOL.get(symbol.trim().toUpperCase());
}

/** Minimal stock for navigation, watchlist, and duel when not in curated set. */
export function catalogEntryToStock(entry: StockCatalogEntry): Stock {
  const cap = entry.marketCapB ?? 0;
  return enrichStockTags({
    symbol: entry.symbol,
    name: entry.name,
    sector: entry.sector,
    themes: [],
    tags: [],
    thesis: `${entry.name} (${entry.symbol}), US-listed equity in our searchable catalog. Open a broker or Yahoo Finance for filings, earnings, and risk disclosures.`,
    marketCap: cap,
    divYield: 0,
    peRatio: null,
    volatility: cap >= 200 ? "med" : cap >= 10 ? "med" : "high",
  });
}

export function searchCatalogStocks(
  query: string,
  options?: { limit?: number; excludeSymbols?: Set<string> }
): StockCatalogEntry[] {
  const q = query.trim().toLowerCase();
  const limit = options?.limit ?? 80;
  const exclude = options?.excludeSymbols ?? new Set<string>();
  let list = [...CATALOG_BY_SYMBOL.values()].filter((e) => !exclude.has(e.symbol));

  if (q) {
    list = list.filter(
      (e) =>
        e.symbol.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.sector.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    if (q) {
      const aExact = a.symbol.toLowerCase() === q ? 0 : 1;
      const bExact = b.symbol.toLowerCase() === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aStart = a.symbol.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.symbol.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
    }
    const ca = a.marketCapB ?? 0;
    const cb = b.marketCapB ?? 0;
    if (ca !== cb) return cb - ca;
    return a.symbol.localeCompare(b.symbol);
  });

  return list.slice(0, limit);
}
