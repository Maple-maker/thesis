import type {
  Holding,
  LinkedAccount,
  NetWorthSnapshot,
  PerformanceBenchmark,
} from "@/types/linked-accounts";

/** Monarch-style demo data until Plaid Link is live. */
export const DEMO_ACCOUNTS: LinkedAccount[] = [
  {
    id: "chk-1",
    institution: "Chase",
    name: "Premier Plus Checking",
    mask: "4821",
    type: "depository",
    subtype: "Checking",
    balance: 8420.12,
    changePct1m: 2.1,
    changeUsd1m: 173,
    lastSyncedAt: Date.now() - 7 * 3600_000,
  },
  {
    id: "sav-1",
    institution: "Marcus",
    name: "High-Yield Savings",
    mask: "9102",
    type: "depository",
    subtype: "Savings",
    balance: 18500,
    changePct1m: 0.4,
    changeUsd1m: 74,
    lastSyncedAt: Date.now() - 7 * 3600_000,
  },
  {
    id: "cc-1",
    institution: "Amex",
    name: "Gold Card",
    mask: "1004",
    type: "credit",
    subtype: "Credit Card",
    balance: -2140.55,
    changePct1m: -5.2,
    changeUsd1m: -118,
    lastSyncedAt: Date.now() - 12 * 3600_000,
  },
  {
    id: "cc-2",
    institution: "Chase",
    name: "Freedom Unlimited",
    mask: "3390",
    type: "credit",
    subtype: "Credit Card",
    balance: -890.2,
    changePct1m: 1.1,
    changeUsd1m: 10,
    lastSyncedAt: Date.now() - 12 * 3600_000,
  },
  {
    id: "inv-1",
    institution: "Fidelity",
    name: "Individual (Taxable)",
    mask: "7721",
    type: "investment",
    subtype: "Brokerage",
    balance: 42180.44,
    changePct1m: 4.8,
    changeUsd1m: 1930,
    lastSyncedAt: Date.now() - 4 * 3600_000,
  },
  {
    id: "inv-2",
    institution: "Fidelity",
    name: "Roth IRA",
    mask: "2290",
    type: "investment",
    subtype: "Retirement",
    balance: 28450,
    changePct1m: 3.2,
    changeUsd1m: 882,
    lastSyncedAt: Date.now() - 4 * 3600_000,
  },
];

export const DEMO_HOLDINGS: Holding[] = [
  {
    id: "h1",
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    assetClass: "ETF",
    price: 512.4,
    quantity: 28.5,
    value: 14603.4,
    weightPct: 20.1,
    changePct3m: 8.2,
    sparkline: [100, 102, 98, 105, 108, 112, 115],
  },
  {
    id: "h2",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "Equity",
    price: 892.1,
    quantity: 12,
    value: 10705.2,
    weightPct: 14.7,
    changePct3m: 22.4,
    sparkline: [100, 115, 120, 118, 130, 145, 152],
  },
  {
    id: "h3",
    symbol: "SCHD",
    name: "Schwab US Dividend Equity",
    assetClass: "ETF",
    price: 78.2,
    quantity: 95,
    value: 7429,
    weightPct: 10.2,
    changePct3m: 4.1,
    sparkline: [100, 101, 102, 103, 104, 105, 106],
  },
  {
    id: "h4",
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "Equity",
    price: 198.5,
    quantity: 40,
    value: 7940,
    weightPct: 10.9,
    changePct3m: 6.8,
    sparkline: [100, 98, 102, 104, 103, 107, 109],
  },
  {
    id: "h5",
    symbol: "BTC",
    name: "Bitcoin",
    assetClass: "Crypto",
    price: 67500,
    quantity: 0.08,
    value: 5400,
    weightPct: 7.4,
    changePct3m: 18.5,
    sparkline: [100, 110, 95, 120, 115, 125, 130],
  },
];

export const DEMO_BENCHMARKS: PerformanceBenchmark[] = [
  { id: "portfolio", label: "Your portfolio", changePct3m: 16.2, changePctToday: 0.84, color: "#0E7A66" },
  { id: "sp500", label: "S&P 500", changePct3m: 10.17, changePctToday: 0.32, color: "#3B82F6" },
  { id: "us-stocks", label: "US Stocks", changePct3m: 9.85, changePctToday: 0.28, color: "#7C3AED" },
  { id: "us-bonds", label: "US Bonds", changePct3m: -1.58, changePctToday: -0.05, color: "#8C988F" },
];

export function computeNetWorth(accounts: LinkedAccount[]): NetWorthSnapshot {
  let assets = 0;
  let liabilities = 0;
  let cash = 0;
  let investments = 0;
  let credit = 0;

  for (const a of accounts) {
    if (a.balance >= 0) {
      assets += a.balance;
      if (a.type === "depository") cash += a.balance;
      if (a.type === "investment") investments += a.balance;
    } else {
      liabilities += Math.abs(a.balance);
      if (a.type === "credit") credit += Math.abs(a.balance);
    }
  }

  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
    assetMix: [
      { label: "Investments", value: investments, color: "#3B82F6" },
      { label: "Cash", value: cash, color: "#0E7A66" },
    ],
    liabilityMix: [
      { label: "Credit Cards", value: credit, color: "#C43B3B" },
    ],
  };
}
