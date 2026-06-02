import type { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

import {
  getCachedSearch,
  isMarketLiveSearchEnabled,
  isRateLimitError,
  setCachedSearch,
  withMarketThrottle,
} from "./market-data-guard.js";
import {
  polygonMarketSearch,
  polygonStockQuote,
  type MarketHit,
} from "./market-polygon.js";
import { preferPolygonMarketData } from "./polygon-client.js";

yahooFinance.suppressNotices?.(["yahooSurvey"]);

const US_EXCHANGES = new Set(["NMS", "NYQ", "NGM", "ASE", "PCX", "BTS", "NCM", "NYM"]);

function mapSector(sector?: string): string | undefined {
  if (!sector) return undefined;
  const s = sector.toLowerCase();
  if (s.includes("technology")) return "Technology";
  if (s.includes("energy")) return "Energy";
  if (s.includes("health")) return "Healthcare";
  if (s.includes("financial")) return "Financials";
  if (s.includes("consumer")) return "Consumer";
  if (s.includes("industrial")) return "Industrials";
  if (s.includes("material")) return "Materials";
  if (s.includes("utilit")) return "Utilities";
  if (s.includes("real estate")) return "Real Estate";
  if (s.includes("communication")) return "Communication";
  return "Technology";
}

function yahooQuoteToHit(q: {
  symbol?: string;
  shortName?: string;
  longName?: string;
  quoteType?: string;
  exchange?: string;
  sector?: string;
  marketCap?: number;
  annualReportExpenseRatio?: number;
}): MarketHit | null {
  if (!q.symbol || !q.quoteType) return null;
  if (q.exchange && !US_EXCHANGES.has(q.exchange)) return null;
  const kind = q.quoteType === "ETF" ? "etf" : q.quoteType === "EQUITY" ? "stock" : null;
  if (!kind) return null;
  return {
    symbol: q.symbol,
    name: q.shortName || q.longName || q.symbol,
    kind,
    exchange: q.exchange,
    sector: kind === "stock" ? mapSector(q.sector) : undefined,
    marketCapB:
      q.marketCap != null ? Math.round((q.marketCap / 1e9) * 10) / 10 : null,
    expense:
      q.annualReportExpenseRatio != null
        ? Math.round(q.annualReportExpenseRatio * 10000) / 100
        : null,
  };
}

async function yahooSearch(q: string, limit: number): Promise<MarketHit[]> {
  const search = await yahooFinance.search(q, {
    quotesCount: limit,
    newsCount: 0,
  });

  const hits: MarketHit[] = (search.quotes ?? [])
    .map((row) => {
      const q = row as {
        symbol?: string;
        shortname?: string;
        shortName?: string;
        longname?: string;
        longName?: string;
        quoteType?: string;
        exchange?: string;
      };
      return yahooQuoteToHit({
        symbol: q.symbol,
        shortName: q.shortname ?? q.shortName,
        longName: q.longname ?? q.longName,
        quoteType: q.quoteType,
        exchange: q.exchange,
      });
    })
    .filter((h): h is MarketHit => h != null);

  return hits.slice(0, limit);
}

export async function getMarketSearch(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  const type = String(req.query.type ?? "all") as "all" | "stock" | "etf";
  const limit = Math.min(25, Math.max(1, Number(req.query.limit ?? 12) || 12));

  if (!q) {
    res.status(400).json({ error: "Query parameter q is required" });
    return;
  }

  if (!isMarketLiveSearchEnabled()) {
    res.json({
      query: q,
      hits: [],
      live: false,
      reason: "Live market search disabled (MARKET_LIVE_SEARCH=0). Use bundled catalog.",
    });
    return;
  }

  const cacheKey = `${preferPolygonMarketData() ? "polygon" : "yahoo"}:${type}:${limit}:${q.toLowerCase()}`;
  const cached = getCachedSearch<MarketHit[]>(cacheKey);
  if (cached) {
    res.json({ query: q, hits: cached, cached: true, provider: preferPolygonMarketData() ? "polygon" : "yahoo" });
    return;
  }

  try {
    let hits: MarketHit[];
    if (preferPolygonMarketData()) {
      hits = await polygonMarketSearch(q, limit, type);
    } else {
      hits = await withMarketThrottle(() => yahooSearch(q, limit * 2)).then((all) => {
        let filtered = all;
        if (type === "stock") filtered = filtered.filter((h) => h.kind === "stock");
        if (type === "etf") filtered = filtered.filter((h) => h.kind === "etf");
        return filtered.slice(0, limit);
      });
    }

    setCachedSearch(cacheKey, hits);
    res.json({
      query: q,
      hits,
      provider: preferPolygonMarketData() ? "polygon" : "yahoo",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Market search failed";
    const status = isRateLimitError(err) ? 429 : 502;
    if (status === 429) res.setHeader("Retry-After", "60");
    res.status(status).json({
      error: message,
      hint:
        status === 429
          ? preferPolygonMarketData()
            ? "Polygon rate limit. Wait a minute or use the bundled catalog."
            : "Yahoo rate limit. Set MASSIVE_API_KEY for live data, or MARKET_LIVE_SEARCH=0."
          : preferPolygonMarketData()
            ? "Check MASSIVE_API_KEY and plan limits at massive.com"
            : undefined,
    });
  }
}

export async function getMarketQuote(req: Request, res: Response) {
  const symbol = String(req.query.symbol ?? "")
    .trim()
    .toUpperCase();
  if (!symbol || symbol.length > 12) {
    res.status(400).json({ error: "Query parameter symbol is required" });
    return;
  }

  if (!preferPolygonMarketData()) {
    res.status(503).json({
      error: "Live quotes require MASSIVE_API_KEY on the server",
      symbol,
      live: false,
    });
    return;
  }

  try {
    const quote = await polygonStockQuote(symbol);
    if (!quote) {
      res.status(404).json({ error: `No Polygon quote for ${symbol}`, symbol });
      return;
    }
    res.json(quote);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote fetch failed";
    const status = isRateLimitError(err) ? 429 : 502;
    if (status === 429) res.setHeader("Retry-After", "60");
    res.status(status).json({ error: message, symbol });
  }
}
