export const CASH_SLICE_SYMBOL = "CASH";

export type PieAllocationRow = {
  symbol: string;
  name: string;
  weightPct: number;
  role?: string;
  kind?: "stock" | "etf" | "cash";
};

export type PieSleeveAdd = {
  symbol: string;
  kind: "stock" | "etf";
  name: string;
  weightPct: number;
  role: string;
};

export type PieCustomization = {
  /** Cash sleeve for dips / dry powder (0–35%) */
  cashReservePct: number;
  /** Explicit target weights for symbols (excludes CASH, use cashReservePct) */
  weightOverrides: Record<string, number>;
  preferenceNote: string;
};

export const DEFAULT_PIE_CUSTOMIZATION: PieCustomization = {
  cashReservePct: 0,
  weightOverrides: {},
  preferenceNote: "",
};

/** True after user saved pie edits (chips, sliders, or dry powder). */
export function isPieCustomized(c: PieCustomization | null | undefined): boolean {
  if (!c) return false;
  if ((c.cashReservePct ?? 0) > 0) return true;
  if (c.preferenceNote.trim().length > 0) return true;
  return Object.keys(c.weightOverrides ?? {}).length > 0;
}

export type PieSuggestionChip = {
  id: string;
  label: string;
  prompt: string;
};

/** @deprecated — use PIE_QUICK_ACTIONS with direct actions instead */
export const PIE_SUGGESTION_CHIPS: PieSuggestionChip[] = [];

export type PieQuickAction = {
  id: string;
  label: string;
  action: "dry-powder" | "rebalance" | "cap" | "add-etf";
  value?: number;
  symbol?: string;
  name?: string;
};

export const PIE_QUICK_ACTIONS: PieQuickAction[] = [
  { id: "dry-10", label: "10% dry powder", action: "dry-powder", value: 10 },
  { id: "rebalance", label: "Rebalance to 100%", action: "rebalance" },
  { id: "cap-25", label: "Cap holdings at 25%", action: "cap", value: 25 },
  { id: "add-schd", label: "Add SCHD", action: "add-etf", symbol: "SCHD", name: "Schwab US Dividend Equity", value: 10 },
  { id: "add-vxus", label: "Add VXUS", action: "add-etf", symbol: "VXUS", name: "Vanguard Total International Stock", value: 10 },
  { id: "add-bnd", label: "Add BND", action: "add-etf", symbol: "BND", name: "Vanguard Total Bond Market", value: 10 },
  { id: "add-sgov", label: "Add T-bills (SGOV)", action: "add-etf", symbol: "SGOV", name: "iShares 0-3 Month Treasury", value: 5 },
];
