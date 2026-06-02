import { ETFS } from "@/data/etfs";
import { themeById } from "@/data/themes";
import type { ThemeId } from "@/store/types";

export type ThesisEtfPick = {
  symbol: string;
  name: string;
  expense: number;
  why: string;
};

/** Educational ETF examples aligned to matched themes, not buy recommendations. */
export function etfsForThemes(themeIds: ThemeId[], limit = 4): ThesisEtfPick[] {
  const picks: ThesisEtfPick[] = [];
  const seen = new Set<string>();

  for (const id of themeIds) {
    const theme = themeById(id);
    if (!theme) continue;

    const matches = ETFS.filter((e) => e.themes.includes(id));
    for (const etf of matches) {
      if (seen.has(etf.symbol) || picks.length >= limit) continue;
      seen.add(etf.symbol);
      picks.push({
        symbol: etf.symbol,
        name: etf.name,
        expense: etf.expense,
        why: `Lines up with your "${theme.title}" lens, ${theme.thesis.slice(0, 90)}…`,
      });
    }
  }

  if (picks.length < limit) {
    for (const etf of ETFS) {
      if (seen.has(etf.symbol) || picks.length >= limit) continue;
      if (themeIds.some((id) => etf.themes.includes(id))) continue;
      seen.add(etf.symbol);
      picks.push({
        symbol: etf.symbol,
        name: etf.name,
        expense: etf.expense,
        why: etf.description.slice(0, 100),
      });
    }
  }

  return picks.slice(0, limit);
}
