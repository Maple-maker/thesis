import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import {
  autoAddsFromSuggestions,
  buildPieSleeveSuggestions,
  type PieSleeveSuggestion,
} from "@/lib/pie-sleeve-suggestions";
import type { ThesisPortfolioCandidate } from "@/lib/thesis-portfolio-builder";
import {
  CASH_SLICE_SYMBOL,
  DEFAULT_PIE_CUSTOMIZATION,
  type PieAllocationRow,
  type PieCustomization,
  type PieSleeveAdd,
} from "@/types/pie-customization";
import type { ThemeId, UserProfile } from "@/store/types";

const DEFENSIVE_ETFS = new Set(["BND", "AGG", "SCHD", "VGIT", "IEF", "VTI", "VOO"]);
const MAX_CASH_PCT = 35;

export type PiePreferencePatch = {
  cashReservePct?: number;
  weightDeltas?: Record<string, number>;
  rebalance?: "proportional" | "even" | "thesis";
  capMaxPct?: number;
  addSleeves?: PieSleeveAdd[];
  messages: string[];
};

const MAX_PIE_SLICES = 10;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function pieTotalPct(rows: PieAllocationRow[]): number {
  return round1(rows.reduce((s, r) => s + r.weightPct, 0));
}

function distributeRoundingDelta(rows: PieAllocationRow[], target: number) {
  const sum = round1(rows.reduce((s, r) => s + r.weightPct, 0));
  const delta = round1(target - sum);
  if (Math.abs(delta) < 0.05 || rows.length === 0) return;

  let maxIdx = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].weightPct > rows[maxIdx].weightPct) maxIdx = i;
  }
  rows[maxIdx] = {
    ...rows[maxIdx],
    weightPct: round1(clamp(rows[maxIdx].weightPct + delta, 0, 100)),
  };
}

/** Guarantees invested + cash sleeves sum to exactly 100%. */
export function finalizePieRows(rows: PieAllocationRow[]): PieAllocationRow[] {
  if (rows.length === 0) return rows;

  const cashRow = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
  const cashPct = cashRow ? clamp(round1(cashRow.weightPct), 0, MAX_CASH_PCT) : 0;
  const invested = rows
    .filter((r) => r.symbol !== CASH_SLICE_SYMBOL)
    .map((r) => ({ ...r, weightPct: Math.max(0, round1(r.weightPct)) }));

  if (invested.length === 0) {
    return cashPct > 0 ? [cashSliceRow(cashPct)] : [];
  }

  const targetInvested = round1(100 - cashPct);
  const sum = invested.reduce((s, r) => s + r.weightPct, 0);

  let scaled: PieAllocationRow[];
  if (sum <= 0) {
    const each = round1(targetInvested / invested.length);
    scaled = invested.map((r) => ({ ...r, weightPct: each }));
  } else {
    scaled = invested.map((r) => ({
      ...r,
      weightPct: round1((r.weightPct / sum) * targetInvested),
    }));
  }

  distributeRoundingDelta(scaled, targetInvested);

  const out = cashPct > 0 ? [...scaled, cashSliceRow(cashPct)] : scaled;
  const totalFix = round1(100 - pieTotalPct(out));
  if (Math.abs(totalFix) >= 0.05) {
    if (cashPct > 0) {
      const last = out[out.length - 1]!;
      if (last.symbol === CASH_SLICE_SYMBOL) {
        out[out.length - 1] = cashSliceRow(round1(clamp(last.weightPct + totalFix, 0, MAX_CASH_PCT)));
      }
    } else if (scaled.length > 0) {
      distributeRoundingDelta(out, 100);
    }
  }

  return out;
}

export function candidatesToPieRows(candidates: ThesisPortfolioCandidate[]): PieAllocationRow[] {
  return finalizePieRows(
    candidates.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      weightPct: c.weightPct,
      role: c.role,
      kind: c.kind,
    }))
  );
}

export function cashSliceRow(pct: number): PieAllocationRow {
  return {
    symbol: CASH_SLICE_SYMBOL,
    name: "Dry powder (cash)",
    weightPct: round1(clamp(pct, 0, MAX_CASH_PCT)),
    kind: "cash",
    role: "Uninvested, deploy on dips (educational model)",
  };
}

export function resetToThesisBaseline(
  thesisBaseline: PieAllocationRow[],
  cashReservePct = 0
): PieAllocationRow[] {
  const base = thesisBaseline.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  return finalizePieRows(setCashReserve(base, cashReservePct));
}

export function setCashReserve(
  rows: PieAllocationRow[],
  cashPct: number
): PieAllocationRow[] {
  const cash = clamp(cashPct, 0, MAX_CASH_PCT);
  const invested = rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  if (invested.length === 0) return cash > 0 ? [cashSliceRow(cash)] : [];

  const target = round1(100 - cash);
  const sum = invested.reduce((s, r) => s + r.weightPct, 0) || 1;
  const scaled = invested.map((r) => ({
    ...r,
    weightPct: round1((r.weightPct / sum) * target),
  }));

  return finalizePieRows(cash > 0 ? [...scaled, cashSliceRow(cash)] : scaled);
}

export function normalizeInvestedWeights(
  rows: PieAllocationRow[],
  mode: "proportional" | "even"
): PieAllocationRow[] {
  const cash = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
  const cashPct = cash?.weightPct ?? 0;
  const invested = rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  if (invested.length === 0) return rows;

  const target = round1(100 - cashPct);
  let next: PieAllocationRow[];
  if (mode === "even") {
    const each = round1(target / invested.length);
    next = invested.map((r) => ({ ...r, weightPct: each }));
  } else {
    const sum = invested.reduce((s, r) => s + r.weightPct, 0) || 1;
    next = invested.map((r) => ({
      ...r,
      weightPct: round1((r.weightPct / sum) * target),
    }));
  }

  return finalizePieRows(cashPct > 0 ? [...next, cashSliceRow(cashPct)] : next);
}

export function capHoldings(rows: PieAllocationRow[], maxPct: number): PieAllocationRow[] {
  const cash = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
  const cashPct = cash?.weightPct ?? 0;
  let invested = rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  let excess = 0;

  invested = invested.map((r) => {
    if (r.weightPct <= maxPct) return r;
    excess += r.weightPct - maxPct;
    return { ...r, weightPct: maxPct, role: r.role ?? `Capped at ${maxPct}%` };
  });

  if (excess > 0) {
    const eligible = invested.filter((r) => r.weightPct < maxPct);
    const pool = eligible.length ? eligible : invested;
    const sum = pool.reduce((s, r) => s + r.weightPct, 0) || 1;
    invested = invested.map((r) => {
      if (r.weightPct >= maxPct) return r;
      return {
        ...r,
        weightPct: round1(r.weightPct + (excess * r.weightPct) / sum),
      };
    });
  }

  return finalizePieRows(cashPct > 0 ? [...invested, cashSliceRow(cashPct)] : invested);
}

export function adjustSliceWeight(
  rows: PieAllocationRow[],
  symbol: string,
  newWeight: number
): PieAllocationRow[] {
  const sym = symbol.toUpperCase();
  if (sym === CASH_SLICE_SYMBOL) {
    return setCashReserve(
      rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL),
      clamp(newWeight, 0, MAX_CASH_PCT)
    );
  }

  const cash = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
  const cashPct = cash?.weightPct ?? 0;
  const invested = rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  const idx = invested.findIndex((r) => r.symbol === sym);
  if (idx < 0) return finalizePieRows(rows);

  const target = round1(100 - cashPct);
  const w = clamp(newWeight, 0, target);
  const delta = w - invested[idx].weightPct;
  const others = invested.filter((r) => r.symbol !== sym);
  const otherSum = others.reduce((s, r) => s + r.weightPct, 0);

  const next = invested.map((r) => {
    if (r.symbol === sym) return { ...r, weightPct: round1(w) };
    if (otherSum <= 0) return { ...r, weightPct: round1((target - w) / others.length) };
    const share = (r.weightPct / otherSum) * (otherSum - delta);
    return { ...r, weightPct: round1(Math.max(0, share)) };
  });

  return finalizePieRows(cashPct > 0 ? [...next, cashSliceRow(cashPct)] : next);
}

export function parsePiePreferences(
  input: string,
  rows: PieAllocationRow[]
): PiePreferencePatch {
  const t = input.trim().toLowerCase();
  const messages: string[] = [];
  const patch: PiePreferencePatch = { messages };

  if (!t) return patch;

  const pctMatch = t.match(/(\d{1,2})\s*%?\s*(?:cash|dry\s*powder|powder|reserve)/);
  if (pctMatch) {
    patch.cashReservePct = clamp(Number(pctMatch[1]), 0, MAX_CASH_PCT);
    messages.push(`Set ${patch.cashReservePct}% dry powder (cash sleeve).`);
  }

  if (
    /dry\s*powder|powder\s*for|for\s*(the\s*)?dips|buy\s*(the\s*)?dip|on\s*the\s*sidelines|cash\s*reserve|hold\s*cash|keep\s*cash|opportunistic/.test(
      t
    ) &&
    patch.cashReservePct == null
  ) {
    patch.cashReservePct = /aggressive|all\s*in|fully\s*invested/.test(t) ? 5 : 12;
    messages.push(`Added ${patch.cashReservePct}% dry powder for dip-buying.`);
  }

  if (/rebalance|normalize|reset\s*weights|back\s*to\s*thesis|thesis\s*weights|original\s*weights/.test(t)) {
    patch.rebalance = /even|equal/.test(t)
      ? "even"
      : /thesis|original|default/.test(t)
        ? "thesis"
        : "proportional";
    if (patch.rebalance === "thesis") {
      messages.push("Restored original thesis weights from your model book.");
    } else if (patch.rebalance === "even") {
      messages.push("Rebalanced invested sleeves to equal weight.");
    } else {
      messages.push("Rebalanced invested sleeves proportionally.");
    }
  }

  const capMatch = t.match(/cap(?:\s*at)?\s*(\d{1,2})\s*%|max(?:imum)?\s*(?:at\s*)?(\d{1,2})\s*%/);
  if (capMatch || /concentrat|too\s*much\s*in\s*one/.test(t)) {
    const n = capMatch ? Number(capMatch[1] ?? capMatch[2]) : 25;
    patch.capMaxPct = clamp(n, 10, 40);
    messages.push(`Capped any slice above ${patch.capMaxPct}%.`);
  }

  if (
    /defensive|conservative|safer|less\s*risk|bond/.test(t) &&
    !/dividend|income\s*stability|international|vxus|schd/.test(t)
  ) {
    const deltas: Record<string, number> = {};
    for (const r of rows) {
      if (r.symbol === CASH_SLICE_SYMBOL) continue;
      if (DEFENSIVE_ETFS.has(r.symbol) || r.kind === "etf") {
        deltas[r.symbol] = (deltas[r.symbol] ?? 0) + 4;
      } else {
        deltas[r.symbol] = (deltas[r.symbol] ?? 0) - 3;
      }
    }
    patch.weightDeltas = deltas;
    patch.cashReservePct = patch.cashReservePct ?? 8;
    messages.push("Tilted toward diversifiers and added a modest cash sleeve.");
  }

  if (/aggressive|growth|more\s*risk|tech\s*heavy/.test(t)) {
    patch.cashReservePct = patch.cashReservePct ?? 5;
    messages.push("Trimmed cash sleeve for a more invested book.");
  }

  const lessMatch = t.match(/(?:less|trim|reduce|cut)\s+([a-z]{1,5})/i);
  if (lessMatch) {
    const sym = lessMatch[1].toUpperCase();
    patch.weightDeltas = { ...patch.weightDeltas, [sym]: -8 };
    messages.push(`Trimmed ${sym} by ~8 pts.`);
  }

  const moreMatch = t.match(/(?:more|add|increase|boost)\s+([a-z]{1,5})/i);
  if (moreMatch) {
    const sym = moreMatch[1].toUpperCase();
    patch.weightDeltas = { ...patch.weightDeltas, [sym]: 8 };
    messages.push(`Boosted ${sym} by ~8 pts.`);
  }

  if (messages.length === 0) {
    messages.push(
      'Try: “I want dividend stability”, “more international exposure”, “10% dry powder”, or “add SCHD”.'
    );
  }

  return patch;
}

export function parsePiePrompt(
  input: string,
  rows: PieAllocationRow[],
  ctx: {
    profile: UserProfile;
    themeIds: ThemeId[];
    thesisBaseline?: PieAllocationRow[];
  }
): { patch: PiePreferencePatch; suggestions: PieSleeveSuggestion[] } {
  const patch = parsePiePreferences(input, rows);
  const suggestions = buildPieSleeveSuggestions(
    input,
    rows,
    ctx.profile,
    ctx.themeIds
  );

  if (suggestions.length) {
    patch.messages = patch.messages.filter(
      (m) => !m.startsWith("Try:")
    );
  }

  for (const s of suggestions.slice(0, 4)) {
    patch.messages.unshift(
      s.alreadyInPie
        ? `${s.symbol} (${s.name}), already in pie; tap Add to boost +${s.suggestedWeightPct}%`
        : `Suggested: ${s.symbol} (${s.name}), ${s.intentLabel} · ~${s.suggestedWeightPct}%`
    );
  }

  const adds = autoAddsFromSuggestions(input, suggestions);
  if (adds.length) {
    patch.addSleeves = adds;
    for (const a of adds) {
      patch.messages.unshift(`Added ${a.symbol} at ${a.weightPct}%, ${a.role}`);
    }
  }

  return { patch, suggestions };
}

export function applyPiePrompt(
  rows: PieAllocationRow[],
  input: string,
  ctx: {
    profile: UserProfile;
    themeIds: ThemeId[];
    thesisBaseline?: PieAllocationRow[];
  }
): {
  rows: PieAllocationRow[];
  patch: PiePreferencePatch;
  suggestions: PieSleeveSuggestion[];
} {
  const { patch, suggestions } = parsePiePrompt(input, rows, ctx);
  const next = applyPiePatch(rows, patch, ctx.thesisBaseline);
  return { rows: next, patch, suggestions };
}

/** Add or boost a ticker sleeve; scales other invested slices to make room. */
export function addSleeveToPie(
  rows: PieAllocationRow[],
  sleeve: PieSleeveAdd
): PieAllocationRow[] {
  const sym = sleeve.symbol.toUpperCase();
  const existing = rows.find((r) => r.symbol === sym);
  if (existing) {
    return adjustSliceWeight(
      rows,
      sym,
      round1(existing.weightPct + sleeve.weightPct)
    );
  }

  const cash = rows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
  const cashPct = cash?.weightPct ?? 0;
  let invested = rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL);
  const addPct = clamp(sleeve.weightPct, 2, 100 - cashPct - 5);
  const targetInvested = round1(100 - cashPct);
  const room = targetInvested - addPct;
  const sum = invested.reduce((s, r) => s + r.weightPct, 0) || 1;

  invested = invested.map((r) => ({
    ...r,
    weightPct: round1((r.weightPct / sum) * room),
  }));

  const newRow: PieAllocationRow = {
    symbol: sym,
    name: sleeve.name,
    weightPct: addPct,
    kind: sleeve.kind,
    role: sleeve.role,
  };

  let combined = [...invested, newRow];
  if (combined.length > MAX_PIE_SLICES) {
    combined = combined
      .sort((a, b) => b.weightPct - a.weightPct)
      .slice(0, MAX_PIE_SLICES);
  }

  return finalizePieRows(cashPct > 0 ? [...combined, cashSliceRow(cashPct)] : combined);
}

export function applyPiePatch(
  rows: PieAllocationRow[],
  patch: PiePreferencePatch,
  thesisBaseline?: PieAllocationRow[]
): PieAllocationRow[] {
  const cashFromPatch = patch.cashReservePct;
  const cashFromRows =
    rows.find((r) => r.symbol === CASH_SLICE_SYMBOL)?.weightPct ?? 0;
  const cashPct =
    cashFromPatch != null ? cashFromPatch : cashFromRows;

  let next: PieAllocationRow[];

  if (patch.rebalance === "thesis" && thesisBaseline?.length) {
    next = resetToThesisBaseline(thesisBaseline, cashPct);
  } else {
    next = [...rows];
  }

  if (patch.weightDeltas) {
    for (const [sym, delta] of Object.entries(patch.weightDeltas)) {
      const row = next.find((r) => r.symbol === sym.toUpperCase());
      if (!row || row.symbol === CASH_SLICE_SYMBOL) continue;
      next = adjustSliceWeight(next, sym, row.weightPct + delta);
    }
  }

  if (patch.capMaxPct != null) {
    next = capHoldings(next, patch.capMaxPct);
  }

  if (patch.cashReservePct != null) {
    next = setCashReserve(
      next.filter((r) => r.symbol !== CASH_SLICE_SYMBOL),
      patch.cashReservePct
    );
  }

  if (patch.rebalance === "even") {
    next = normalizeInvestedWeights(next, "even");
  } else if (patch.rebalance === "proportional") {
    next = normalizeInvestedWeights(next, "proportional");
  }

  if (patch.addSleeves?.length) {
    for (const add of patch.addSleeves) {
      next = addSleeveToPie(next, add);
    }
  }

  return finalizePieRows(next);
}

export function pieRowsToHoldings(rows: PieAllocationRow[]) {
  return rows
    .filter((r) => r.symbol !== CASH_SLICE_SYMBOL && r.weightPct > 0)
    .map((r) => ({
      symbol: r.symbol,
      weightPct: r.weightPct,
      kind: (r.kind === "etf" ? "etf" : "stock") as "stock" | "etf",
    }));
}

export function weightOverridesFromRows(
  baseline: PieAllocationRow[],
  current: PieAllocationRow[]
): Record<string, number> {
  const overrides: Record<string, number> = {};
  for (const r of current) {
    if (r.symbol === CASH_SLICE_SYMBOL) continue;
    const base = baseline.find((b) => b.symbol === r.symbol);
    if (!base || Math.abs(base.weightPct - r.weightPct) > 0.05) {
      overrides[r.symbol] = r.weightPct;
    }
  }
  return overrides;
}

export function composePieRows(
  candidates: ThesisPortfolioCandidate[],
  customization?: PieCustomization | null
): PieAllocationRow[] {
  const base = candidatesToPieRows(candidates);
  const custom = customization ?? DEFAULT_PIE_CUSTOMIZATION;

  if (Object.keys(custom.weightOverrides).length > 0) {
    const merged = base
      .filter((r) => r.symbol !== CASH_SLICE_SYMBOL)
      .map((r) => ({
        ...r,
        weightPct: custom.weightOverrides[r.symbol] ?? r.weightPct,
      }));
    return finalizePieRows(setCashReserve(merged, custom.cashReservePct));
  }

  if (custom.cashReservePct > 0) {
    return setCashReserve(
      base.filter((r) => r.symbol !== CASH_SLICE_SYMBOL),
      custom.cashReservePct
    );
  }

  return base;
}

export function enrichPieRowMeta(row: PieAllocationRow): PieAllocationRow {
  if (row.symbol === CASH_SLICE_SYMBOL) return row;
  const stock = stockBySymbol(row.symbol);
  const etf = etfBySymbol(row.symbol);
  return {
    ...row,
    name: row.name || stock?.name || etf?.name || row.symbol,
    kind: row.kind ?? (etf ? "etf" : "stock"),
  };
}
