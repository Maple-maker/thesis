import type { ThemeId } from "@/store/types";

/** Illustrative CAGR for a representative basket tied to each thesis.
 *  These are MOCK data for educational demonstration only. */
export type BacktestCAGR = {
  /** 1-year trailing total return (%) */
  y1: number;
  /** 5-year annualized total return (%) */
  y5: number;
  /** 10-year annualized total return (%) */
  y10: number;
};

export const BACKTEST_DISCLAIMER =
  "Illustrative hypothetical performance of a representative model basket, not actual returns, not live data, and not a recommendation to replicate. Past performance does not guarantee future results.";

const BACKTEST: Record<ThemeId, BacktestCAGR> = {
  "ai-infrastructure": { y1: 31.2, y5: 21.8, y10: 18.4 },
  compounders: { y1: 14.6, y5: 12.3, y10: 13.8 },
  "cash-flow-defensives": { y1: 7.8, y5: 9.1, y10: 10.2 },
  "clean-energy": { y1: -4.5, y5: 11.2, y10: 7.6 },
  "aging-demographics": { y1: 10.3, y5: 13.6, y10: 12.9 },
  income: { y1: 5.2, y5: 6.8, y10: 8.1 },
  cybersecurity: { y1: 17.4, y5: 15.9, y10: 14.3 },
  fintech: { y1: 11.8, y5: 9.7, y10: 11.5 },
  biotech: { y1: 8.1, y5: 5.9, y10: 10.7 },
  "consumer-staples": { y1: 4.2, y5: 7.3, y10: 9.4 },
  "global-diversification": { y1: 8.9, y5: 7.6, y10: 6.8 },
  "emerging-tech": { y1: 22.1, y5: 14.5, y10: 11.2 },
};

export function backtestForTheme(id: ThemeId): BacktestCAGR | undefined {
  return BACKTEST[id];
}

export function allBacktests(): Record<ThemeId, BacktestCAGR> {
  return { ...BACKTEST };
}
