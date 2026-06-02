/**
 * SPDR S&P 500 ETF (SPY) total returns, public fund data, fixed as-of date.
 * Used as the default "why wouldn't I just buy the index?" benchmark.
 *
 * Calendar 2025 total return ~17.7% (SPDR/Yahoo). Multi-year figures are
 * annualized total return over the window ending 2025-12-31.
 */
export const SPY_BENCHMARK_AS_OF = "2025-12-31";

export type BenchmarkReturns = {
  /** Calendar-year total return for the labeled year (%) */
  trailing1y: number;
  /** 3-year annualized total return (%) */
  ann3y: number;
  /** 5-year annualized total return (%) */
  ann5y: number;
  /** 10-year annualized total return (%) */
  ann10y: number;
};

export const SPY_BENCHMARK: BenchmarkReturns = {
  trailing1y: 17.7,
  ann3y: 12.8,
  ann5y: 14.2,
  ann10y: 12.6,
};

export const SPY_BENCHMARK_DISCLAIMER =
  `Benchmark: SPY total return as of ${SPY_BENCHMARK_AS_OF}. Model books use weighted calendar-year 2025 returns for each holding (missing names assume SPY). Not live prices, not advice. Past performance does not guarantee future results.`;
