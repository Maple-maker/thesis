import type { MarketSearchHit } from "@/lib/market-api";
import { fetchMarketQuote, isMarketLiveCooldown, searchMarketLive } from "@/lib/market-api";
import { quoteSourceLabel, stockQuoteFromMarket } from "@/lib/stock-quote-display";
import type { WatchlistRadarSuggestion } from "@/lib/watchlist-radar-suggestions";
import { catalogEntryToEtf, searchCatalogEtfs } from "@/data/etf-catalog";
import { catalogEntryToStock, searchCatalogStocks } from "@/data/stocks-catalog";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import type { SecurityResult } from "@/lib/security-screener";

export type RadarMarketMeta = {
  price: number;
  changePctDay: number;
  sourceLabel: string;
};

export type WatchlistRadarSuggestionWithMarket = WatchlistRadarSuggestion & {
  market?: RadarMarketMeta;
  liveFromMassive?: boolean;
};

function hitToSecurity(hit: MarketSearchHit): SecurityResult | null {
  if (hit.kind === "etf") {
    const etf = etfBySymbol(hit.symbol);
    if (etf) return { ...etf, kind: "etf", curated: true };
    const entry = searchCatalogEtfs(hit.symbol, { limit: 1 })[0];
    if (entry) return { ...catalogEntryToEtf(entry), kind: "etf", curated: false };
  } else {
    const stock = stockBySymbol(hit.symbol);
    if (stock) return { ...stock, kind: "stock", curated: true };
    const entry = searchCatalogStocks(hit.symbol, { limit: 1 })[0];
    if (entry) return { ...catalogEntryToStock(entry), kind: "stock", curated: false };
  }
  return null;
}

/** Massive-backed ticker search merged into radar discovery. */
export async function liveMarketHitsForRadarQuery(
  query: string,
  limit = 12
): Promise<MarketSearchHit[]> {
  const q = query.trim();
  if (q.length < 3 || isMarketLiveCooldown()) return [];
  try {
    return await searchMarketLive(q, "all", limit);
  } catch {
    return [];
  }
}

export function securitiesFromMarketHits(hits: MarketSearchHit[]): SecurityResult[] {
  const out: SecurityResult[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const item = hitToSecurity(hit);
    if (!item || seen.has(item.symbol)) continue;
    seen.add(item.symbol);
    out.push(item);
  }
  return out;
}

/** Attach Massive quotes to top radar rows (respects API throttle via cache). */
export async function attachMarketQuotesToRadar(
  suggestions: WatchlistRadarSuggestion[],
  maxQuotes = 4
): Promise<WatchlistRadarSuggestionWithMarket[]> {
  const top = suggestions.slice(0, maxQuotes);
  const rest = suggestions.slice(maxQuotes);

  const quoted = await Promise.all(
    top.map(async (row): Promise<WatchlistRadarSuggestionWithMarket> => {
      const q = await fetchMarketQuote(row.symbol);
      if (!q) return { ...row, liveFromMassive: false };
      const display = stockQuoteFromMarket(q);
      return {
        ...row,
        liveFromMassive: true,
        market: {
          price: display.price,
          changePctDay: display.changePctDay,
          sourceLabel: quoteSourceLabel(display),
        },
      };
    })
  );

  return [...quoted, ...rest.map((r) => ({ ...r, liveFromMassive: false }))];
}

export async function enrichRadarSuggestions(
  base: { stocks: WatchlistRadarSuggestion[]; etfs: WatchlistRadarSuggestion[] },
  manualQuery: string
): Promise<{
  stocks: WatchlistRadarSuggestionWithMarket[];
  etfs: WatchlistRadarSuggestionWithMarket[];
  massiveActive: boolean;
}> {
  const hits = await liveMarketHitsForRadarQuery(manualQuery, 14);
  const massiveActive = hits.length > 0 && !isMarketLiveCooldown();

  const stocks = await attachMarketQuotesToRadar(base.stocks, 4);
  const etfs = await attachMarketQuotesToRadar(base.etfs, 3);

  return { stocks, etfs, massiveActive };
}
