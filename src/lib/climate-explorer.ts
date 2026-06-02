import {
  INVESTING_CLIMATES,
  climateById,
  type ClimateSecurityPick,
  type InvestingClimate,
} from "@/data/investing-climates";
import { searchCatalogEtfs } from "@/data/etf-catalog";
import { catalogEntryToEtf } from "@/data/etf-catalog";
import { searchCatalogStocks } from "@/data/stocks-catalog";
import { catalogEntryToStock } from "@/data/stocks-catalog";
import { ETFS, etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import type { ThemeId } from "@/store/types";

export type ResolvedClimatePick = ClimateSecurityPick & {
  name: string;
  found: boolean;
};

export function matchClimates(query: string, limit = 5): InvestingClimate[] {
  const q = query.trim().toLowerCase();
  if (!q) return INVESTING_CLIMATES.slice(0, limit);

  const scored = INVESTING_CLIMATES.map((c) => {
    let score = 0;
    const blob = [
      c.title,
      c.exampleHeadline,
      c.summary,
      ...c.matchTerms,
    ]
      .join(" ")
      .toLowerCase();

    if (c.title.toLowerCase().includes(q)) score += 8;
    if (c.exampleHeadline.toLowerCase().includes(q)) score += 6;
    for (const term of c.matchTerms) {
      if (q.includes(term) || term.includes(q)) score += 4;
    }
    if (blob.includes(q)) score += 3;
    return { c, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c)
    .slice(0, limit);
}

export function resolveClimatePick(pick: ClimateSecurityPick): ResolvedClimatePick {
  const sym = pick.symbol.toUpperCase();
  const stock = stockBySymbol(sym);
  if (stock) {
    return { ...pick, symbol: sym, name: stock.name, found: true };
  }
  const etf = etfBySymbol(sym) ?? catalogEntryToEtf(
    searchCatalogEtfs(sym, { limit: 1 }).find((e) => e.symbol === sym) ?? {
      symbol: sym,
      name: sym,
      expense: null,
      assetClass: "us-equity",
    }
  );
  if (etf) {
    return { ...pick, symbol: sym, kind: "etf", name: etf.name, found: true };
  }
  return { ...pick, symbol: sym, name: sym, found: false };
}

export function climatePicksResolved(climate: InvestingClimate): {
  favor: ResolvedClimatePick[];
  avoid: ResolvedClimatePick[];
} {
  return {
    favor: climate.favor.map(resolveClimatePick),
    avoid: climate.avoid.map(resolveClimatePick),
  };
}

/** Expand climate + themes into searchable universe for thesis builder */
export function symbolsForClimate(climateId: string | null, themeIds: ThemeId[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (sym: string) => {
    const s = sym.toUpperCase();
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  let mergedThemes = [...new Set(themeIds)];
  if (climateId) {
    const c = climateById(climateId);
    if (c) {
      for (const p of c.favor) add(p.symbol);
      mergedThemes = [...new Set([...mergedThemes, ...c.themeIds])];
    }
  }
  for (const stock of searchCatalogStocks("", { limit: 200 })) {
    const s = catalogEntryToStock(stock);
    if (s.themes.some((t) => mergedThemes.includes(t))) add(s.symbol);
  }
  for (const etf of ETFS) {
    if (etf.themes.some((t) => mergedThemes.includes(t))) add(etf.symbol);
  }

  return out;
}

export { climateById, INVESTING_CLIMATES };
