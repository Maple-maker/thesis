import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { etfHoldingOverlap } from "@/lib/etf-overlap";
import type { Holding } from "@/types/linked-accounts";
import type { ThemeId } from "@/store/types";

export type OverlapFlag = {
  id: string;
  severity: "high" | "medium";
  title: string;
  detail: string;
  symbols: string[];
  duelParams?: { a: string; b: string };
};

export type ThemeGap = {
  themeId: ThemeId;
  title: string;
  exposurePct: number;
  message: string;
};

export type UnderlyingExposure = {
  symbol: string;
  name: string;
  effectivePct: number;
  directPct: number;
  viaEtfPct: number;
};

export type PortfolioXrayResult = {
  themeExposure: { themeId: ThemeId; title: string; pct: number }[];
  topUnderlying: UnderlyingExposure[];
  overlaps: OverlapFlag[];
  gaps: ThemeGap[];
  lacking: string[];
  summary: string;
};

/** Cap-weight-ish look-through so top ETF names show meaningful overlap in demo books. */
const TOP_HOLDING_WEIGHTS = [0.28, 0.18, 0.12, 0.09, 0.07];

function underlyingFromEtf(holding: Holding): Record<string, number> {
  const etf = etfBySymbol(holding.symbol);
  if (!etf || !etf.holdings.length) return {};

  const out: Record<string, number> = {};
  const top = etf.holdings.slice(0, TOP_HOLDING_WEIGHTS.length);
  let allocated = 0;
  top.forEach((sym, i) => {
    const w = TOP_HOLDING_WEIGHTS[i] ?? 0.05;
    out[sym] = (out[sym] ?? 0) + holding.weightPct * w;
    allocated += w;
  });
  const rest = etf.holdings.slice(top.length);
  const each = (holding.weightPct * Math.max(0, 1 - allocated)) / Math.max(rest.length, 1);
  for (const sym of rest) {
    out[sym] = (out[sym] ?? 0) + each;
  }
  return out;
}

function effectiveThemesForHolding(h: Holding): ThemeId[] {
  const stock = stockBySymbol(h.symbol);
  if (stock) return stock.themes;
  const etf = etfBySymbol(h.symbol);
  if (etf) return etf.themes;
  return [];
}

export function runPortfolioXray(
  holdings: Holding[],
  userThemeIds: ThemeId[]
): PortfolioXrayResult {
  if (!holdings.length) {
    return {
      themeExposure: [],
      topUnderlying: [],
      overlaps: [],
      gaps: [],
      lacking: ["Connect accounts (or load demo) to see overlap, gaps, and what's missing from your thesis."],
      summary: "Connect accounts to run overlap and gap checks on your real book.",
    };
  }

  const themePct: Record<string, number> = {};
  const directSymbols = new Map<string, number>();
  const underlying: Record<string, number> = {};

  for (const h of holdings) {
    directSymbols.set(h.symbol, (directSymbols.get(h.symbol) ?? 0) + h.weightPct);
    for (const t of effectiveThemesForHolding(h)) {
      themePct[t] = (themePct[t] ?? 0) + h.weightPct;
    }
    const u = underlyingFromEtf(h);
    for (const [sym, pct] of Object.entries(u)) {
      underlying[sym] = (underlying[sym] ?? 0) + pct;
    }
  }

  const overlaps: OverlapFlag[] = [];

  for (const [sym, directPct] of directSymbols) {
    const viaEtf = underlying[sym] ?? 0;
    if (viaEtf < 2 && directPct < 12) continue;
    const total = directPct + viaEtf;
    if (total < 10) continue;
    overlaps.push({
      id: `overlap-${sym}`,
      severity: total > 22 ? "high" : "medium",
      title: `Double-covered on ${sym}`,
      detail: `~${directPct.toFixed(1)}% direct ${sym} plus ~${viaEtf.toFixed(1)}% via ETF look-through (~${total.toFixed(1)}% effective). Same bet counted twice.`,
      symbols: [sym],
    });
  }

  const etfHoldings = holdings.filter((h) => etfBySymbol(h.symbol));
  for (let i = 0; i < etfHoldings.length; i++) {
    for (let j = i + 1; j < etfHoldings.length; j++) {
      const ea = etfBySymbol(etfHoldings[i].symbol);
      const eb = etfBySymbol(etfHoldings[j].symbol);
      if (!ea || !eb) continue;
      const o = etfHoldingOverlap(ea, eb);
      if (o.sharedCount < 3) continue;
      const wa = etfHoldings[i].weightPct;
      const wb = etfHoldings[j].weightPct;
      if (wa < 5 || wb < 5) continue;
      overlaps.push({
        id: `etf-${ea.symbol}-${eb.symbol}`,
        severity: o.overlapPct > 50 ? "high" : "medium",
        title: `${ea.symbol} + ${eb.symbol}: ${o.overlapPct}% name overlap`,
        detail: `Both funds in your book (${wa.toFixed(1)}% + ${wb.toFixed(1)}%) share ${o.sharedCount} holdings including ${o.shared.slice(0, 3).join(", ")}.`,
        symbols: [ea.symbol, eb.symbol],
        duelParams: { a: ea.symbol, b: eb.symbol },
      });
    }
  }

  const etfPairs: [string, string][] = [
    ["VOO", "SCHD"],
    ["VOO", "VTI"],
    ["QQQ", "SMH"],
    ["SMH", "SOXX"],
  ];
  for (const [a, b] of etfPairs) {
    const wa = directSymbols.get(a) ?? 0;
    const wb = directSymbols.get(b) ?? 0;
    if (wa > 5 && wb > 5 && !overlaps.some((o) => o.id === `etf-${a}-${b}`)) {
      overlaps.push({
        id: `etf-${a}-${b}`,
        severity: "medium",
        title: `${a} + ${b} overlap`,
        detail: `Both are large-cap US equity sleeves (${wa.toFixed(1)}% + ${wb.toFixed(1)}%), similar backbone, not additive diversification.`,
        symbols: [a, b],
        duelParams: { a, b },
      });
    }
  }

  const allUnderlyingSyms = new Set([
    ...directSymbols.keys(),
    ...Object.keys(underlying),
  ]);
  const topUnderlying: UnderlyingExposure[] = [...allUnderlyingSyms]
    .map((sym) => {
      const directPct = directSymbols.get(sym) ?? 0;
      const viaEtfPct = underlying[sym] ?? 0;
      const effectivePct = directPct + viaEtfPct;
      const stock = stockBySymbol(sym);
      return {
        symbol: sym,
        name: stock?.name ?? sym,
        effectivePct: Math.round(effectivePct * 10) / 10,
        directPct: Math.round(directPct * 10) / 10,
        viaEtfPct: Math.round(viaEtfPct * 10) / 10,
      };
    })
    .filter((u) => u.effectivePct >= 4)
    .sort((a, b) => b.effectivePct - a.effectivePct)
    .slice(0, 8);

  const themeExposure = Object.entries(themePct)
    .map(([themeId, pct]) => ({
      themeId: themeId as ThemeId,
      title: themeById(themeId as ThemeId)?.title ?? themeId,
      pct: Math.round(pct * 10) / 10,
    }))
    .sort((a, b) => b.pct - a.pct);

  const gaps: ThemeGap[] = [];
  for (const id of userThemeIds) {
    const exp = themePct[id] ?? 0;
    if (exp < 5) {
      const t = themeById(id);
      gaps.push({
        themeId: id,
        title: t?.title ?? id,
        exposurePct: exp,
        message:
          exp === 0
            ? "You matched this theme in onboarding but hold little that expresses it."
            : `Only ~${exp.toFixed(1)}% of your book maps here, theme is under-expressed.`,
      });
    }
  }

  const lacking: string[] = [];
  if (gaps.length) {
    lacking.push(
      `Under-expressed vs your thesis: ${gaps.map((g) => g.title).slice(0, 3).join(", ")}.`
    );
  }
  const top = topUnderlying[0];
  if (top && top.effectivePct > 18) {
    lacking.push(
      `${top.symbol} is ~${top.effectivePct}% of effective exposure (direct + ETFs), concentration risk if that name re-rates.`
    );
  }
  if (!lacking.length) {
    lacking.push("No major thesis gaps in this pass, still run Duel before adding a second fund in the same sleeve.");
  }

  const lead = themeExposure[0];
  const summary =
    overlaps.length > 0
      ? `Led by ${lead?.title ?? "your core"} · ${overlaps.length} overlap flag${overlaps.length > 1 ? "s" : ""} · ${gaps.length} theme gap${gaps.length !== 1 ? "s" : ""}.`
      : gaps.length > 0
        ? `Theme mix is spread out, but ${gaps.length} matched theme${gaps.length > 1 ? "s are" : " is"} still under 5% exposure.`
        : "Theme alignment and overlap look reasonable on this pass, use Duel before adding another sleeve.";

  return { themeExposure, topUnderlying, overlaps, gaps, lacking, summary };
}
