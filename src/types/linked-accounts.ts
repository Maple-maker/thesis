export type AccountType = "depository" | "credit" | "investment" | "loan" | "other";

export type LinkedAccount = {
  id: string;
  plaidAccountId?: string;
  institution: string;
  name: string;
  mask: string;
  type: AccountType;
  subtype: string;
  balance: number;
  /** 1-month change % */
  changePct1m?: number;
  changeUsd1m?: number;
  lastSyncedAt: number;
};

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  assetClass: "Equity" | "ETF" | "Crypto" | "Cash" | "Other";
  price: number;
  quantity: number;
  value: number;
  weightPct: number;
  changePct3m: number;
  sparkline: number[];
};

export type NetWorthSnapshot = {
  assets: number;
  liabilities: number;
  netWorth: number;
  assetMix: { label: string; value: number; color: string }[];
  liabilityMix: { label: string; value: number; color: string }[];
};

export type PerformanceBenchmark = {
  id: string;
  label: string;
  changePct3m: number;
  changePctToday: number;
  color: string;
};

export type PlaidConnectionStatus = "disconnected" | "linking" | "connected" | "demo";
