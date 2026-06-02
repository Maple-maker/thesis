/** Indexed cumulative return (%) for backtest chart, aligns with DEMO_BENCHMARKS 3mo totals. */
export type PerformanceSeries = {
  id: string;
  label: string;
  color: string;
  values: number[];
};

/** Weekly-ish points over ~3 months (13 samples). */
export const DEMO_PERFORMANCE_X_LABELS = [
  "Mar 2",
  "Mar 16",
  "Mar 30",
  "Apr 13",
  "Apr 27",
  "May 11",
  "May 25",
  "Today",
];

export const DEMO_PERFORMANCE_SERIES: PerformanceSeries[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    color: "#0E7A66",
    values: [0, 3.2, 2.1, 6.5, 9.8, 12.4, 14.1, 16.2],
  },
  {
    id: "sp500",
    label: "S&P 500",
    color: "#3B82F6",
    values: [0, 2.1, 1.8, 4.2, 6.1, 7.8, 9.2, 10.17],
  },
  {
    id: "us-stocks",
    label: "US Stocks",
    color: "#7C3AED",
    values: [0, 2.0, 1.5, 4.0, 5.9, 7.5, 8.8, 9.85],
  },
  {
    id: "us-bonds",
    label: "US Bonds",
    color: "#8C988F",
    values: [0, -0.4, -0.8, -1.1, -1.3, -1.5, -1.55, -1.58],
  },
];
