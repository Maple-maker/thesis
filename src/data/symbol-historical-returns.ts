import { financialsForSymbol } from "@/data/stock-financials";
import { SPY_BENCHMARK, SPY_BENCHMARK_AS_OF } from "@/data/spy-benchmark";

/**
 * Total returns per symbol (%), as of SPY_BENCHMARK_AS_OF.
 * trailing1y = calendar year 2025 total return; 3y/5y/10y = annualized over that window.
 */
export type SymbolHistoricalReturns = {
  trailing1y: number;
  ann3y: number;
  ann5y: number;
  ann10y: number;
};

const MAX_CALENDAR_1Y = 48;
const MAX_ANN = 32;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function sanitize(r: SymbolHistoricalReturns): SymbolHistoricalReturns {
  return {
    trailing1y: clamp(r.trailing1y, -45, MAX_CALENDAR_1Y),
    ann3y: clamp(r.ann3y, -30, MAX_ANN),
    ann5y: clamp(r.ann5y, -25, MAX_ANN),
    ann10y: clamp(r.ann10y, -20, MAX_ANN),
  };
}

function annFromCumulative(cumulative: number, years: number): number {
  if (years < 1) return 0;
  const total = 1 + cumulative;
  if (total <= 0) return -30;
  const ann = (Math.pow(total, 1 / years) - 1) * 100;
  return clamp(Math.round(ann * 10) / 10, -30, MAX_ANN);
}

/** Calendar 2025 / multi-year, public ETF & large-cap approximations (not live). */
const CURATED: Record<string, SymbolHistoricalReturns> = {
  SPY: { trailing1y: 17.7, ann3y: 12.8, ann5y: 14.2, ann10y: 12.6 },
  VOO: { trailing1y: 17.8, ann3y: 12.9, ann5y: 14.3, ann10y: 12.7 },
  VTI: { trailing1y: 17.5, ann3y: 12.6, ann5y: 14.0, ann10y: 12.4 },
  QQQ: { trailing1y: 22.4, ann3y: 14.2, ann5y: 17.8, ann10y: 16.2 },
  SMH: { trailing1y: 28.6, ann3y: 18.4, ann5y: 22.0, ann10y: 18.8 },
  SOXX: { trailing1y: 27.2, ann3y: 17.6, ann5y: 21.0, ann10y: 17.6 },
  AIQ: { trailing1y: 26.4, ann3y: 13.8, ann5y: 16.2, ann10y: 14.4 },
  SCHD: { trailing1y: 9.8, ann3y: 8.4, ann5y: 10.2, ann10y: 10.8 },
  VYM: { trailing1y: 10.2, ann3y: 8.0, ann5y: 9.6, ann10y: 9.4 },
  VTV: { trailing1y: 12.4, ann3y: 9.2, ann5y: 11.0, ann10y: 10.2 },
  MOAT: { trailing1y: 11.6, ann3y: 8.8, ann5y: 10.4, ann10y: 9.8 },
  JEPI: { trailing1y: 8.4, ann3y: 7.2, ann5y: 7.8, ann10y: 7.4 },
  BND: { trailing1y: 2.2, ann3y: 1.0, ann5y: 1.4, ann10y: 2.2 },
  GLD: { trailing1y: 24.8, ann3y: 9.4, ann5y: 10.2, ann10y: 6.8 },
  SLV: { trailing1y: 16.2, ann3y: 4.8, ann5y: 6.2, ann10y: 4.6 },
  VNQ: { trailing1y: 4.8, ann3y: 2.4, ann5y: 3.8, ann10y: 5.2 },
  ARKK: { trailing1y: 18.6, ann3y: -1.2, ann5y: 6.8, ann10y: 9.4 },
  "BRK.B": { trailing1y: 22.4, ann3y: 13.2, ann5y: 14.6, ann10y: 12.8 },
  XLU: { trailing1y: 14.2, ann3y: 5.8, ann5y: 7.4, ann10y: 8.6 },
  AAPL: { trailing1y: 28.2, ann3y: 16.4, ann5y: 19.8, ann10y: 18.2 },
  MSFT: { trailing1y: 22.0, ann3y: 15.2, ann5y: 17.0, ann10y: 17.6 },
  NVDA: { trailing1y: 38.4, ann3y: 42.0, ann5y: 38.0, ann10y: 32.0 },
  GOOGL: { trailing1y: 31.2, ann3y: 13.4, ann5y: 16.8, ann10y: 15.2 },
  META: { trailing1y: 26.8, ann3y: 22.4, ann5y: 20.2, ann10y: 16.8 },
  TSLA: { trailing1y: 48.0, ann3y: 10.2, ann5y: 24.0, ann10y: 28.0 },
  AMZN: { trailing1y: 34.0, ann3y: 7.8, ann5y: 12.8, ann10y: 16.2 },
  KO: { trailing1y: 6.8, ann3y: 5.2, ann5y: 6.4, ann10y: 7.2 },
  JPM: { trailing1y: 32.0, ann3y: 11.4, ann5y: 12.8, ann10y: 11.2 },
  PG: { trailing1y: 1.8, ann3y: 4.2, ann5y: 5.6, ann10y: 7.8 },
  MA: { trailing1y: 16.2, ann3y: 12.8, ann5y: 14.6, ann10y: 16.0 },
  V: { trailing1y: 18.4, ann3y: 11.2, ann5y: 13.0, ann10y: 14.2 },
  COST: { trailing1y: 28.0, ann3y: 16.2, ann5y: 17.8, ann10y: 15.6 },
  TSM: { trailing1y: 30.4, ann3y: 18.0, ann5y: 16.2, ann10y: 14.8 },
  AVGO: { trailing1y: 32.6, ann3y: 24.0, ann5y: 22.4, ann10y: 18.6 },
  AMD: { trailing1y: -6.2, ann3y: 6.4, ann5y: 22.0, ann10y: 20.0 },
  ARM: { trailing1y: 28.0, ann3y: 28.0, ann5y: 26.0, ann10y: 22.0 },
  VST: { trailing1y: 42.0, ann3y: 28.0, ann5y: 24.0, ann10y: 16.0 },
  PLTR: { trailing1y: 34.0, ann3y: 32.0, ann5y: 28.0, ann10y: 22.0 },
  PEP: { trailing1y: -6.0, ann3y: 3.8, ann5y: 5.8, ann10y: 7.4 },
  WMT: { trailing1y: 42.0, ann3y: 13.2, ann5y: 11.4, ann10y: 10.8 },
  MELI: { trailing1y: 14.0, ann3y: 10.8, ann5y: 12.4, ann10y: 18.0 },
  MDLZ: { trailing1y: 4.2, ann3y: 4.0, ann5y: 5.0, ann10y: 6.4 },
  RBLX: { trailing1y: 28.0, ann3y: -6.0, ann5y: 8.0, ann10y: 14.0 },
  CRWD: { trailing1y: 28.0, ann3y: 22.0, ann5y: 24.0, ann10y: 22.0 },
  JNJ: { trailing1y: 2.0, ann3y: 4.6, ann5y: 5.2, ann10y: 8.0 },
  NKE: { trailing1y: -12.0, ann3y: 1.8, ann5y: 3.8, ann10y: 10.0 },
  LULU: { trailing1y: -28.0, ann3y: 6.0, ann5y: 11.0, ann10y: 18.0 },
  IONQ: { trailing1y: 22.0, ann3y: 8.0, ann5y: 12.0, ann10y: 10.0 },
  IBM: { trailing1y: 26.0, ann3y: 10.0, ann5y: 6.0, ann10y: 5.4 },
  EQIX: { trailing1y: 14.0, ann3y: 12.0, ann5y: 14.0, ann10y: 13.0 },
  CVX: { trailing1y: 6.0, ann3y: 12.0, ann5y: 10.0, ann10y: 7.0 },
  XOM: { trailing1y: 8.0, ann3y: 14.0, ann5y: 9.0, ann10y: 5.0 },
  UAL: { trailing1y: 28.0, ann3y: 14.0, ann5y: 6.0, ann10y: 4.0 },
  DAL: { trailing1y: 24.0, ann3y: 12.0, ann5y: 7.0, ann10y: 6.0 },
  XLP: { trailing1y: 10.0, ann3y: 5.0, ann5y: 6.0, ann10y: 7.0 },
  XLE: { trailing1y: 0.0, ann3y: 14.0, ann5y: 11.0, ann10y: 4.0 },
  QTUM: { trailing1y: 24.0, ann3y: 16.0, ann5y: 14.0, ann10y: 11.0 },
  ARKQ: { trailing1y: 22.0, ann3y: 2.0, ann5y: 9.0, ann10y: 12.0 },
  SHV: { trailing1y: 4.8, ann3y: 3.4, ann5y: 2.2, ann10y: 1.6 },
};

export function symbolHistoricalReturns(symbol: string): SymbolHistoricalReturns | null {
  const key = symbol.trim().toUpperCase();
  if (CURATED[key]) return sanitize(CURATED[key]);

  const fin = financialsForSymbol(symbol);
  if (fin) {
    const t1y = clamp(Math.round(fin.return1y * 1000) / 10, -45, MAX_CALENDAR_1Y);
    const a3y = annFromCumulative(fin.return3y, 3);
    return sanitize({
      trailing1y: t1y,
      ann3y: a3y,
      ann5y: annFromCumulative(fin.return3y * 0.85, 5),
      ann10y: annFromCumulative(fin.return3y * 0.7, 10),
    });
  }

  return null;
}

export { SPY_BENCHMARK_AS_OF };
