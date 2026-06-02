import type { LensHolding } from "@/data/investor-lenses";
import {
  SPY_BENCHMARK,
  SPY_BENCHMARK_AS_OF,
  SPY_BENCHMARK_DISCLAIMER,
  type BenchmarkReturns,
} from "@/data/spy-benchmark";
import { symbolHistoricalReturns } from "@/data/symbol-historical-returns";

export type PortfolioBacktestPeriod = "trailing1y" | "ann3y" | "ann5y" | "ann10y";

// ─── Risk metrics ──────────────────────────────────────────────────
export type RiskMetrics = {
  /** Annualized volatility estimate (%) */
  volatility: number;
  /** Estimated max drawdown from peak (%) */
  maxDrawdown: number;
  /** Sharpe ratio (excess return over risk-free / volatility), risk-free ~4.5% */
  sharpe: number;
  /** Beta vs SPY (1.0 = moves with the market) */
  beta: number;
  /** % of months positive (estimated from volatility and return) */
  positiveMonthPct: number;
  /** Coverage tier — how much of the portfolio has real data */
  coverageTier: "high" | "medium" | "low";
};

export type DCAResult = {
  /** Monthly contribution used in simulation */
  monthlyAmount: number;
  /** Final value after the period (lump sum) */
  lumpSumFinal: number;
  /** Final value after the period (dollar-cost averaging) */
  dcaFinal: number;
  /** DCA advantage over lump sum (%) */
  dcaAdvantage: number;
};

export type PortfolioBacktestResult = {
  asOf: string;
  /** Weighted portfolio return (%) for each period */
  portfolio: BenchmarkReturns;
  benchmark: BenchmarkReturns;
  /** Portfolio minus SPY (percentage points) */
  alpha: BenchmarkReturns;
  /** Risk-adjusted metrics */
  risk: RiskMetrics;
  /** DCA simulation for trailing 1Y */
  dca: DCAResult | null;
  /** % of book weight with symbol-specific return data (not SPY-imputed) */
  coveragePct: number;
  missingSymbols: string[];
  /** Symbols that used SPY return for the missing slice */
  imputedSymbols: string[];
  /** Holdings-level detail for transparency */
  holdingsDetail: HoldingBacktestRow[];
  disclaimer: string;
};

export type HoldingBacktestRow = {
  symbol: string;
  weightPct: number;
  trailing1y: number;
  ann5y: number;
  hasRealData: boolean;
};

const PERIOD_LABELS: Record<PortfolioBacktestPeriod, string> = {
  trailing1y: "2025 (calendar)",
  ann3y: "3 year (ann.)",
  ann5y: "5 year (ann.)",
  ann10y: "10 year (ann.)",
};

export function periodLabel(p: PortfolioBacktestPeriod): string {
  return PERIOD_LABELS[p];
}

/** Estimated risk-free rate */
const RISK_FREE = 4.5;

/** Estimate volatility from annualized return and asset type.
 *  Stocks typically 15-25% vol, ETFs lower depending on concentration.
 *  We estimate conservatively from the spread of returns when we have data. */
function estimateVolatility(
  holdings: LensHolding[],
  portfolioReturn: number
): number {
  // Base: if concentrated (<5 holdings), vol is higher. If diversified (>15), lower.
  const uniqueSymbols = new Set(holdings.map((h) => h.symbol)).size;
  const concentration = uniqueSymbols <= 3 ? 1.3 : uniqueSymbols <= 8 ? 1.1 : uniqueSymbols <= 15 ? 1.0 : 0.9;

  // Estimate from return magnitude — higher absolute return suggests higher vol
  const absReturn = Math.abs(portfolioReturn);
  let baseVol: number;
  if (absReturn > 30) baseVol = 22;
  else if (absReturn > 20) baseVol = 18;
  else if (absReturn > 10) baseVol = 15;
  else baseVol = 12;

  return Math.round(baseVol * concentration * 10) / 10;
}

/** Estimate max drawdown from volatility.
 *  Rule of thumb: max DD ≈ 1.5–2.5× annual vol depending on market regime.
 *  Growth/tech skews higher. */
function estimateMaxDrawdown(volatility: number, holdings: LensHolding[]): number {
  const hasTech = holdings.some(
    (h) =>
      ["NVDA", "AMD", "TSLA", "PLTR", "ARM", "SMH", "SOXX", "QQQ", "ARKK"].includes(
        h.symbol
      )
  );
  const multiplier = hasTech ? 2.2 : 1.8;
  return Math.round(volatility * multiplier * 10) / 10;
}

/** Estimate beta vs SPY from composition.
 *  Tech-heavy → beta >1. Defensive/income → beta <1. */
function estimateBeta(holdings: LensHolding[]): number {
  let totalWeight = 0;
  let weightedBeta = 0;

  const HIGH_BETA = new Set([
    "NVDA", "AMD", "TSLA", "PLTR", "ARM", "SMH", "SOXX", "TQQQ", "SOXL",
    "ARKK", "ARKG", "ARKW", "BOTZ", "AIQ",
  ]);
  const LOW_BETA = new Set([
    "PG", "KO", "PEP", "WMT", "JNJ", "MDT", "DUK", "SO", "NEE",
    "SCHD", "VYM", "USMV", "SPLV", "XLP", "XLU", "GLD", "IAU",
    "AGG", "BND", "SHY", "SGOV", "BIL", "TLT", "IEF",
  ]);

  for (const h of holdings) {
    const w = h.weightPct / 100;
    if (w <= 0) continue;
    totalWeight += w;

    if (HIGH_BETA.has(h.symbol)) weightedBeta += 1.5 * w;
    else if (LOW_BETA.has(h.symbol)) weightedBeta += 0.6 * w;
    else weightedBeta += 1.0 * w;
  }

  return totalWeight > 0
    ? Math.round((weightedBeta / totalWeight) * 100) / 100
    : 1.0;
}

function estimatePositiveMonthPct(annualReturn: number, volatility: number): number {
  // Monthly expected return ≈ annual / 12. Monthly vol ≈ annual / sqrt(12).
  const monthlyRet = annualReturn / 12;
  const monthlyVol = volatility / Math.sqrt(12);
  // P(positive month) ≈ 1 - Φ(-monthlyRet / monthlyVol) using normal approximation
  const z = monthlyRet / Math.max(monthlyVol, 1);
  // Approximation of normal CDF
  const p = 1 / (1 + Math.exp(-1.7 * z));
  return Math.round(Math.min(95, Math.max(40, p * 100)));
}

function computeRiskMetrics(
  holdings: LensHolding[],
  portfolioReturn1y: number
): RiskMetrics {
  const volatility = estimateVolatility(holdings, portfolioReturn1y);
  const maxDrawdown = estimateMaxDrawdown(volatility, holdings);
  const excessReturn = portfolioReturn1y - RISK_FREE;
  const sharpe =
    volatility > 0 ? Math.round((excessReturn / volatility) * 100) / 100 : 0;
  const beta = estimateBeta(holdings);
  const positiveMonthPct = estimatePositiveMonthPct(portfolioReturn1y, volatility);

  const coveragePct = computeCoverage(holdings);
  const coverageTier: RiskMetrics["coverageTier"] =
    coveragePct >= 80 ? "high" : coveragePct >= 50 ? "medium" : "low";

  return { volatility, maxDrawdown, sharpe, beta, positiveMonthPct, coverageTier };
}

function computeCoverage(holdings: LensHolding[]): number {
  if (holdings.length === 0) return 0;
  let totalWeight = 0;
  let coveredWeight = 0;
  for (const h of holdings) {
    const w = h.weightPct / 100;
    if (w <= 0) continue;
    totalWeight += w;
    if (symbolHistoricalReturns(h.symbol)) coveredWeight += w;
  }
  return totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 0;
}

function simulateDCA(
  holdings: LensHolding[],
  portfolioReturn1y: number,
  volatility: number
): DCAResult | null {
  const totalWeight = holdings.reduce((sum, h) => sum + h.weightPct, 0);
  if (totalWeight <= 0) return null;

  const monthlyAmount = 1000;
  const months = 12;
  const monthlyRet = portfolioReturn1y / 100 / 12;

  // Lump sum: invest full amount at start, grows for 12 months
  const lumpSum = monthlyAmount * months * Math.pow(1 + monthlyRet, months);

  // DCA: invest monthlyAmount each month, each contribution compounds for remaining months
  let dca = 0;
  for (let m = 0; m < months; m++) {
    const remainingMonths = months - m;
    dca += monthlyAmount * Math.pow(1 + monthlyRet, remainingMonths);
  }

  const dcaAdvantage = Math.round(((dca - lumpSum) / lumpSum) * 1000) / 10;

  return {
    monthlyAmount,
    lumpSumFinal: Math.round(lumpSum),
    dcaFinal: Math.round(dca),
    dcaAdvantage,
  };
}

// ─── Core backtest engine ──────────────────────────────────────────

function weightedReturn(
  holdings: LensHolding[],
  field: keyof BenchmarkReturns
): {
  value: number;
  coveragePct: number;
  missing: string[];
  imputed: string[];
} {
  if (holdings.length === 0) {
    return { value: 0, coveragePct: 0, missing: [], imputed: [] };
  }

  let weighted = 0;
  let knownWeight = 0;
  let totalWeight = 0;
  const missing: string[] = [];
  const imputed: string[] = [];

  for (const h of holdings) {
    const w = h.weightPct / 100;
    if (w <= 0) continue;
    totalWeight += w;

    const specific = symbolHistoricalReturns(h.symbol);
    const returns = specific ?? SPY_BENCHMARK;

    if (!specific) {
      missing.push(h.symbol);
      imputed.push(h.symbol);
    } else {
      knownWeight += w;
    }

    weighted += returns[field] * w;
  }

  if (totalWeight <= 0) {
    return { value: 0, coveragePct: 0, missing, imputed };
  }

  const normalized = totalWeight < 0.995 ? weighted / totalWeight : weighted;

  return {
    value: Math.round(normalized * 10) / 10,
    coveragePct: Math.round((knownWeight / totalWeight) * 100),
    missing,
    imputed,
  };
}

export function backtestPortfolio(
  holdings: LensHolding[]
): PortfolioBacktestResult {
  const fields: (keyof BenchmarkReturns)[] = [
    "trailing1y",
    "ann3y",
    "ann5y",
    "ann10y",
  ];
  const portfolio = {} as BenchmarkReturns;
  const alpha = {} as BenchmarkReturns;
  let coveragePct = 100;
  const missingSet = new Set<string>();
  const imputedSet = new Set<string>();

  for (const f of fields) {
    const w = weightedReturn(holdings, f);
    portfolio[f] = w.value;
    alpha[f] = Math.round((w.value - SPY_BENCHMARK[f]) * 10) / 10;
    coveragePct = Math.min(coveragePct, w.coveragePct);
    w.missing.forEach((s) => missingSet.add(s));
    w.imputed.forEach((s) => imputedSet.add(s));
  }

  const risk = computeRiskMetrics(holdings, portfolio.trailing1y);
  const dca = simulateDCA(holdings, portfolio.trailing1y, risk.volatility);

  const holdingsDetail: HoldingBacktestRow[] = holdings.map((h) => {
    const data = symbolHistoricalReturns(h.symbol);
    return {
      symbol: h.symbol,
      weightPct: h.weightPct,
      trailing1y: data?.trailing1y ?? SPY_BENCHMARK.trailing1y,
      ann5y: data?.ann5y ?? SPY_BENCHMARK.ann5y,
      hasRealData: !!data,
    };
  });

  return {
    asOf: SPY_BENCHMARK_AS_OF,
    portfolio,
    benchmark: { ...SPY_BENCHMARK },
    alpha,
    risk,
    dca,
    coveragePct,
    missingSymbols: [...missingSet],
    imputedSymbols: [...imputedSet],
    holdingsDetail,
    disclaimer: SPY_BENCHMARK_DISCLAIMER,
  };
}

export function beatSpy(
  backtest: PortfolioBacktestResult,
  period: PortfolioBacktestPeriod
): boolean {
  return backtest.alpha[period] > 0;
}

export function formatAlpha(alpha: number): string {
  const sign = alpha > 0 ? "+" : "";
  return `${sign}${alpha.toFixed(1)} pts vs SPY`;
}

export function backtestHeadline(backtest: PortfolioBacktestResult): string {
  const a1 = backtest.alpha.trailing1y;
  const a5 = backtest.alpha.ann5y;
  const beat1 = a1 > 0 ? "beat" : "trailed";
  const beat5 = a5 > 0 ? "beat" : "trailed";
  return `2025: ${beat1} SPY (${formatAlpha(a1)}) · 5Y: ${beat5} SPY (${formatAlpha(a5)})`;
}

export function backtestRichSummary(
  backtest: PortfolioBacktestResult
): string {
  const { risk, portfolio, alpha, coveragePct } = backtest;
  const parts: string[] = [
    `Portfolio 2025 return: ${portfolio.trailing1y}% (SPY ${backtest.benchmark.trailing1y}%, alpha ${formatAlpha(alpha.trailing1y)})`,
    `Volatility: ${risk.volatility}% annual est. · Max drawdown: ${risk.maxDrawdown}% est.`,
    `Sharpe: ${risk.sharpe} · Beta: ${risk.beta} · ${risk.positiveMonthPct}% positive months`,
    `Coverage: ${coveragePct}% of holdings have real return data`,
  ];

  if (risk.coverageTier === "low") {
    parts.push(
      "Note: Most holdings use SPY returns as a placeholder. Backtest improves as more names get historical data."
    );
  }

  return parts.join("\n");
}

export function coverageWarning(
  backtest: PortfolioBacktestResult
): string | null {
  if (backtest.risk.coverageTier === "low") {
    return "Low data coverage — many holdings default to SPY returns. Backtest is illustrative, not predictive.";
  }
  if (backtest.risk.coverageTier === "medium") {
    return "Moderate data coverage. Some holdings use SPY returns where specific data is unavailable.";
  }
  return null;
}

export const WHY_NOT_JUST_SPY = [
  {
    title: "Thesis, not tickers",
    body: "SPY owns everything. Thesis helps you name what you believe (AI build-out, quality compounders, income) and see if your picks match that story.",
  },
  {
    title: "Overlap & concentration",
    body: "Holding NVDA and SMH feels diversified, X-Ray and duels show when you're doubling the same bet. The index hides that.",
  },
  {
    title: "Fit to you",
    body: "We score names against your horizon, risk, and values, not just past returns. Beating SPY one year means nothing if the drawdown would make you sell.",
  },
  {
    title: "Learn before you size",
    body: "Model portfolios (Buffett, Dalio, value vs AI) are backtested vs SPY so you can ask: is the extra complexity worth it for my goals?",
  },
];
