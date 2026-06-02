import { allFinancials } from "@/data/stock-financials";
import { priceHistory } from "@/data/price-data";
import type { MarketQuote } from "@/lib/market-api";

/** Illustrative spot prices for common tickers (not live quotes). */
const REFERENCE_USD: Record<string, number> = {
  AAPL: 198.5,
  MSFT: 425.2,
  NVDA: 135.8,
  GOOGL: 178.4,
  META: 512.4,
  AMZN: 192.3,
  TSLA: 248.6,
  PLTR: 78.2,
  AMD: 162.5,
  AVGO: 168.9,
  COST: 892.1,
  JPM: 198.7,
  V: 278.4,
  MA: 478.2,
  KO: 62.4,
  PEP: 168.3,
  XOM: 112.5,
  JNJ: 158.2,
  UNH: 512.8,
  LLY: 782.4,
  BRK: 468.2,
  "BRK.B": 468.2,
  SPY: 528.4,
  QQQ: 448.2,
};

export type StockQuoteDisplay = {
  price: number;
  changePct1y: number | null;
  changePctDay: number;
  range1yLow: number;
  range1yHigh: number;
  sparkline?: number[];
  source: "polygon" | "illustrative";
  asOf?: string;
  recency?: "eod" | "delayed" | "realtime";
};

function referenceUsd(symbol: string): number {
  const sym = symbol.toUpperCase();
  if (REFERENCE_USD[sym] != null) return REFERENCE_USD[sym];
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
  return 12 + (h % 380) + ((h >> 8) % 100) / 100;
}

/** Deterministic illustrative quote from 1y index path + financials when available. */
export function stockQuoteDisplay(symbol: string): StockQuoteDisplay | null {
  const sym = symbol.toUpperCase();
  const hist = priceHistory(sym);
  if (hist.length < 2) return null;

  const ref = referenceUsd(sym);
  const first = hist[0];
  const last = hist[hist.length - 1];
  const min = Math.min(...hist);
  const max = Math.max(...hist);

  const price = ref * (last / 100);
  const price1yAgo = ref * (first / 100);
  const changePct1y = price1yAgo > 0 ? ((price / price1yAgo - 1) * 100) : 0;

  const fin = allFinancials().find((f) => f.symbol === sym);
  const changePctYtd = fin != null ? fin.returnYTD * 100 : changePct1y * 0.45;

  return {
    price,
    changePct1y,
    changePctDay: changePctYtd,
    range1yLow: ref * (min / 100),
    range1yHigh: ref * (max / 100),
    sparkline: hist,
    source: "illustrative",
  };
}

export function quoteSourceLabel(q: StockQuoteDisplay): string {
  if (q.source !== "polygon") return "Illustrative";
  if (q.asOf && q.recency === "eod") return "Massive · EOD";
  if (q.recency === "realtime") return "Massive · live";
  return "Massive · delayed";
}

export function stockQuoteFromMarket(q: MarketQuote): StockQuoteDisplay {
  return {
    price: q.price,
    changePct1y: q.changePct1y,
    changePctDay: q.changePctDay,
    range1yLow: q.range1yLow,
    range1yHigh: q.range1yHigh,
    sparkline: q.sparkline,
    source: "polygon",
    asOf: q.asOf,
    recency: q.recency,
  };
}

export function formatUsdPrice(value: number): string {
  if (value >= 10_000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (value >= 100) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatPctChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
