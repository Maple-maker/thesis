import {
  polygonGet,
  polygonTickerSymbol,
  PolygonApiError,
} from "./polygon-client.js";
import {
  aggsHistoryDays,
  quoteRecencyLabel,
  useSnapshotQuotes,
} from "./market-plan.js";
import {
  getCachedQuote,
  getCachedSearch,
  setCachedQuote,
  setCachedSearch,
  withMarketThrottle,
} from "./market-data-guard.js";

export type MarketHit = {
  symbol: string;
  name: string;
  kind: "stock" | "etf";
  exchange?: string;
  sector?: string;
  marketCapB?: number | null;
  expense?: number | null;
};

export type MarketQuoteResponse = {
  symbol: string;
  price: number;
  changePctDay: number;
  changePct1y: number | null;
  range1yLow: number;
  range1yHigh: number;
  sparkline: number[];
  marketCapB: number | null;
  source: "polygon";
  asOf: string;
  delayed: boolean;
  /** eod = Stocks Basic (prev close); delayed = Starter+ snapshot */
  recency: "eod" | "delayed" | "realtime";
};

type SnapshotTicker = {
  ticker?: string;
  todaysChangePerc?: number;
  day?: { c?: number; o?: number; h?: number; l?: number };
  prevDay?: { c?: number; o?: number; h?: number; l?: number };
  lastTrade?: { p?: number };
  updated?: number;
};

type AggsResponse = {
  results?: { c: number; h: number; l: number; t: number }[];
};

type TickerSearchResult = {
  ticker?: string;
  name?: string;
  market?: string;
  type?: string;
  market_cap?: number;
  primary_exchange?: string;
  sic_description?: string;
};

function mapSector(sic?: string): string | undefined {
  if (!sic) return undefined;
  const s = sic.toLowerCase();
  if (s.includes("semiconductor") || s.includes("software") || s.includes("computer"))
    return "Technology";
  if (s.includes("oil") || s.includes("energy") || s.includes("petrol")) return "Energy";
  if (s.includes("pharma") || s.includes("health") || s.includes("medical"))
    return "Healthcare";
  if (s.includes("bank") || s.includes("financial") || s.includes("insurance"))
    return "Financials";
  if (s.includes("retail") || s.includes("food") || s.includes("beverage"))
    return "Consumer";
  if (s.includes("aerospace") || s.includes("industrial")) return "Industrials";
  if (s.includes("mining") || s.includes("metal")) return "Materials";
  if (s.includes("utility") || s.includes("electric")) return "Utilities";
  if (s.includes("reit") || s.includes("real estate")) return "Real Estate";
  if (s.includes("media") || s.includes("telecom") || s.includes("entertainment"))
    return "Communication";
  return undefined;
}

function pickPrice(snap: SnapshotTicker): number | null {
  const dayClose = snap.day?.c;
  if (dayClose != null && dayClose > 0) return dayClose;
  const last = snap.lastTrade?.p;
  if (last != null && last > 0) return last;
  const prev = snap.prevDay?.c;
  if (prev != null && prev > 0) return prev;
  return null;
}

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchSnapshot(sym: string): Promise<SnapshotTicker | null> {
  const res = await polygonGet<{ ticker?: SnapshotTicker }>(
    `/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(sym)}`
  );
  return res.ticker ?? null;
}

async function fetchWeeklyCloses(sym: string): Promise<number[]> {
  const from = isoDateDaysAgo(aggsHistoryDays());
  const to = isoDateDaysAgo(1);
  const res = await polygonGet<AggsResponse>(
    `/v2/aggs/ticker/${encodeURIComponent(sym)}/range/1/week/${from}/${to}`,
    { adjusted: true, sort: "asc", limit: 60 }
  );
  return (res.results ?? []).map((b) => b.c).filter((c) => c > 0);
}

type PrevBar = { c: number; o?: number; h?: number; l?: number; t?: number };

async function fetchPrevBar(sym: string): Promise<PrevBar | null> {
  const res = await polygonGet<AggsResponse>(
    `/v2/aggs/ticker/${encodeURIComponent(sym)}/prev`,
    { adjusted: true }
  );
  const bar = res.results?.[0];
  if (!bar || bar.c <= 0) return null;
  return bar;
}

function buildQuoteFromBars(
  sym: string,
  price: number,
  changePctDay: number,
  sparkline: number[],
  marketCapB: number | null,
  asOfMs: number
): MarketQuoteResponse {
  const range1yLow = sparkline.length ? Math.min(...sparkline) : price;
  const range1yHigh = sparkline.length ? Math.max(...sparkline) : price;
  const first = sparkline[0];
  const changePct1y =
    first > 0 && sparkline.length >= 2
      ? Math.round(((price / first - 1) * 100) * 10) / 10
      : null;

  return {
    symbol: sym,
    price: Math.round(price * 100) / 100,
    changePctDay,
    changePct1y,
    range1yLow: Math.round(range1yLow * 100) / 100,
    range1yHigh: Math.round(range1yHigh * 100) / 100,
    sparkline: sparkline.length >= 2 ? sparkline : [price],
    marketCapB,
    source: "polygon",
    asOf: new Date(asOfMs).toISOString(),
    delayed: quoteRecencyLabel() !== "realtime",
    recency: quoteRecencyLabel(),
  };
}

/** Stocks Basic: prev day bar + weekly aggs (2 calls, EOD, no snapshot). */
async function polygonStockQuoteBasic(sym: string): Promise<MarketQuoteResponse | null> {
  const prev = await withMarketThrottle(() => fetchPrevBar(sym));
  if (!prev) return null;

  const closes = await withMarketThrottle(() => fetchWeeklyCloses(sym));
  const sparkline = closes.length >= 2 ? closes : [prev.c];
  const changePctDay =
    prev.o != null && prev.o > 0
      ? Math.round(((prev.c / prev.o - 1) * 100) * 10) / 10
      : 0;

  return buildQuoteFromBars(sym, prev.c, changePctDay, sparkline, null, prev.t ?? Date.now());
}

/** Starter+: snapshot + weekly aggs + ticker overview (market cap). */
async function polygonStockQuoteSnapshot(sym: string): Promise<MarketQuoteResponse | null> {
  const snap = await withMarketThrottle(() => fetchSnapshot(sym));
  if (!snap) return null;

  const price = pickPrice(snap);
  if (price == null) return null;

  const closes = await withMarketThrottle(() => fetchWeeklyCloses(sym));
  const overview = await withMarketThrottle(() => fetchTickerOverview(sym));

  const sparkline = closes.length >= 2 ? closes : [price];
  const changePctDay =
    snap.todaysChangePerc != null
      ? Math.round(snap.todaysChangePerc * 10) / 10
      : snap.prevDay?.c && snap.prevDay.c > 0
        ? Math.round(((price / snap.prevDay.c - 1) * 100) * 10) / 10
        : 0;

  const marketCapB =
    overview?.market_cap != null
      ? Math.round((overview.market_cap / 1e9) * 10) / 10
      : null;

  return buildQuoteFromBars(
    sym,
    price,
    changePctDay,
    sparkline,
    marketCapB,
    snap.updated ?? Date.now()
  );
}

async function fetchTickerOverview(sym: string): Promise<TickerSearchResult | null> {
  try {
    const res = await polygonGet<{ results?: TickerSearchResult }>(
      `/v3/reference/tickers/${encodeURIComponent(sym)}`
    );
    return res.results ?? null;
  } catch (e) {
    if (e instanceof PolygonApiError && e.status === 404) return null;
    throw e;
  }
}

export async function polygonStockQuote(symbol: string): Promise<MarketQuoteResponse | null> {
  const sym = polygonTickerSymbol(symbol);
  const cacheKey = `quote:${sym}`;
  const cached = getCachedQuote<MarketQuoteResponse>(cacheKey);
  if (cached) return cached;

  const quote = useSnapshotQuotes()
    ? await polygonStockQuoteSnapshot(sym)
    : await polygonStockQuoteBasic(sym);

  if (!quote) return null;
  setCachedQuote(cacheKey, quote);
  return quote;
}

function searchResultToHit(row: TickerSearchResult): MarketHit | null {
  if (!row.ticker || row.market !== "stocks") return null;
  const type = row.type ?? "";
  const kind =
    type === "ETF" || type === "ETV" || type === "ETS"
      ? "etf"
      : type === "CS" || type === "ADRC"
        ? "stock"
        : null;
  if (!kind) return null;

  return {
    symbol: row.ticker.toUpperCase(),
    name: row.name || row.ticker,
    kind,
    exchange: row.primary_exchange,
    sector: kind === "stock" ? mapSector(row.sic_description) : undefined,
    marketCapB:
      row.market_cap != null ? Math.round((row.market_cap / 1e9) * 10) / 10 : null,
    expense: null,
  };
}

export async function polygonMarketSearch(
  query: string,
  limit: number,
  type: "all" | "stock" | "etf"
): Promise<MarketHit[]> {
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `polygon:${type}:${limit}:${q.toLowerCase()}`;
  const cached = getCachedSearch<MarketHit[]>(cacheKey);
  if (cached) return cached;

  const typeParam =
    type === "stock" ? "CS" : type === "etf" ? "ETF" : undefined;

  const res = await withMarketThrottle(() =>
    polygonGet<{ results?: TickerSearchResult[] }>("/v3/reference/tickers", {
      search: q,
      active: true,
      market: "stocks",
      limit: Math.min(limit * 2, 25),
      ...(typeParam ? { type: typeParam } : {}),
    })
  );

  let hits = (res.results ?? [])
    .map(searchResultToHit)
    .filter((h): h is MarketHit => h != null);

  if (type === "stock") hits = hits.filter((h) => h.kind === "stock");
  if (type === "etf") hits = hits.filter((h) => h.kind === "etf");

  hits = hits.slice(0, limit);
  setCachedSearch(cacheKey, hits);
  return hits;
}

export type ValuationRow = {
  symbol: string;
  price: number | null;
  marketCapB: number | null;
  psTtm: number | null;
  psForward: number | null;
  evEbitda: number | null;
  grossMarginPct: number | null;
  revenueGrowthPct: number | null;
  valueGrowthScore: number | null;
};

/** Price + market cap from Polygon for radar valuation (no Yahoo). */
export async function polygonValuationRow(symbol: string): Promise<ValuationRow> {
  const sym = polygonTickerSymbol(symbol);
  try {
    const quote = await polygonStockQuote(sym);
    let marketCapB = quote?.marketCapB ?? null;
    if (marketCapB == null && useSnapshotQuotes()) {
      const overview = await withMarketThrottle(() => fetchTickerOverview(sym));
      marketCapB =
        overview?.market_cap != null
          ? Math.round((overview.market_cap / 1e9) * 10) / 10
          : null;
    }
    return {
      symbol: sym,
      price: quote?.price ?? null,
      marketCapB,
      psTtm: null,
      psForward: null,
      evEbitda: null,
      grossMarginPct: null,
      revenueGrowthPct: null,
      valueGrowthScore: null,
    };
  } catch (e) {
    console.warn("[polygon] valuation row failed", sym, e);
    return {
      symbol: sym,
      price: null,
      marketCapB: null,
      psTtm: null,
      psForward: null,
      evEbitda: null,
      grossMarginPct: null,
      revenueGrowthPct: null,
      valueGrowthScore: null,
    };
  }
}

export function formatPolygonValuationBlock(rows: ValuationRow[]): string {
  const lines = rows.map((r) => {
    const fmt = (n: number | null) => (n != null ? String(n) : "n/a");
    return `${r.symbol}: Price $${fmt(r.price)}, Mkt cap ${fmt(r.marketCapB)}B (P/S, EV/EBITDA, margins: verify on filings / Macrotrends, not in Polygon basic snapshot)`;
  });
  return `Polygon market snapshot (delayed; verify fundamentals on filings):\n${lines.join("\n")}`;
}
