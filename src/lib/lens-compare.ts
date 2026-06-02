import type { InvestorLens } from "@/data/investor-lenses";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import type { Holding } from "@/types/linked-accounts";
import type { ThemeId } from "@/store/types";

export type LensTargetGap = {
  symbol: string;
  targetPct: number;
  yourPct: number;
  message: string;
};

export type LensCompareResult = {
  alignmentScore: number;
  heldCount: number;
  totalTargets: number;
  combinedHeldPct: number;
  summary: string;
  gaps: LensTargetGap[];
  strengths: string[];
};

export function compareLensToBook(
  lens: InvestorLens,
  holdings: Holding[],
  userThemeIds: ThemeId[]
): LensCompareResult {
  const heldBySym = new Map(holdings.map((h) => [h.symbol, h.weightPct]));
  let heldCount = 0;
  let combinedHeldPct = 0;
  const gaps: LensTargetGap[] = [];
  const strengths: string[] = [];

  for (const t of lens.holdings) {
    const your = heldBySym.get(t.symbol) ?? 0;
    if (your > 0) {
      heldCount++;
      combinedHeldPct += your;
      if (your >= t.weightPct * 0.5) {
        strengths.push(`${t.symbol} at ${your.toFixed(1)}% (target ${t.weightPct}%)`);
      }
    } else if (t.weightPct >= 10) {
      gaps.push({
        symbol: t.symbol,
        targetPct: t.weightPct,
        yourPct: 0,
        message: `Lens targets ${t.weightPct}% in ${t.symbol}, not in your book.`,
      });
    }
  }

  const themeOverlap = lens.themeIds.filter((id) => userThemeIds.includes(id));
  let alignmentScore = Math.min(100, heldCount * 14 + themeOverlap.length * 12);
  if (combinedHeldPct > 15) alignmentScore = Math.min(100, alignmentScore + 15);

  const summary =
    holdings.length === 0
      ? "Load demo or connect accounts to see how this lens compares to your weights."
      : heldCount === 0
        ? `None of the ${lens.holdings.length} lens targets are in your book yet.`
        : `You hold ${heldCount}/${lens.holdings.length} targets (~${combinedHeldPct.toFixed(1)}% combined). Alignment score ${alignmentScore}/100.`;

  return {
    alignmentScore,
    heldCount,
    totalTargets: lens.holdings.length,
    combinedHeldPct: Math.round(combinedHeldPct * 10) / 10,
    summary,
    gaps: gaps.slice(0, 4),
    strengths: strengths.slice(0, 3),
  };
}

export function lensThemeFit(lens: InvestorLens, userThemeIds: ThemeId[]): string {
  const matched = lens.themeIds.filter((id) => userThemeIds.includes(id));
  if (!matched.length) return "This lens uses themes you haven't matched, still useful as a reference shape.";
  return matched
    .map((id) => themeById(id)?.title ?? id)
    .join(" · ");
}

export function resolveLensSymbolName(symbol: string): string {
  return stockBySymbol(symbol)?.name ?? etfBySymbol(symbol)?.name ?? symbol;
}
