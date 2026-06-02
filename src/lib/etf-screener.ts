import {
  catalogEntryToEtf,
  ETF_CATALOG_COUNT,
  searchCatalogEtfs,
  type EtfAssetClass,
} from "@/data/etf-catalog";
import { ETFS } from "@/data/etfs";
import type { ETF } from "@/store/types";
import type { ThemeId } from "@/store/types";

export type ScreenerFilters = {
  query: string;
  maxExpense: number | null;
  themeId: ThemeId | "all";
  assetClass: EtfAssetClass | "all";
  includeLeveraged: boolean;
  sort: "expense" | "name" | "symbol";
};

export type ScreenerResult = ETF & { curated: boolean; assetClass?: EtfAssetClass };

export function screenEtfs(filters: ScreenerFilters): ScreenerResult[] {
  const curatedSymbols = new Set(ETFS.map((e) => e.symbol));
  const q = filters.query.trim();
  const hasQuery = q.length > 0;

  let curated = [...ETFS];

  if (hasQuery) {
    const lower = q.toLowerCase();
    curated = curated.filter(
      (e) =>
        e.symbol.toLowerCase().includes(lower) ||
        e.name.toLowerCase().includes(lower) ||
        e.description.toLowerCase().includes(lower)
    );
  }

  if (filters.maxExpense != null) {
    curated = curated.filter((e) => e.expense <= filters.maxExpense!);
  }

  if (filters.themeId !== "all") {
    curated = curated.filter((e) => e.themes.includes(filters.themeId as ThemeId));
  }

  const showCatalog = filters.themeId === "all";
  const catalogHits = showCatalog
    ? searchCatalogEtfs(q, {
        assetClass: filters.assetClass,
        maxExpense: filters.maxExpense,
        limit: hasQuery ? 120 : 80,
        excludeSymbols: curatedSymbols,
      }).filter(
        (e) => filters.includeLeveraged || e.assetClass !== "leveraged-inverse"
      )
    : [];

  const catalogEtfs: ScreenerResult[] = catalogHits.map((entry) => ({
    ...catalogEntryToEtf(entry),
    curated: false,
    assetClass: entry.assetClass,
  }));

  const curatedResults: ScreenerResult[] = curated.map((e) => ({
    ...e,
    curated: true,
  }));

  const merged = [...curatedResults, ...catalogEtfs];

  merged.sort((a, b) => {
    if (a.curated !== b.curated) return a.curated ? -1 : 1;
    if (filters.sort === "expense") return a.expense - b.expense;
    if (filters.sort === "symbol") return a.symbol.localeCompare(b.symbol);
    return a.name.localeCompare(b.name);
  });

  return merged;
}

export function screenerSummary(etf: ETF, curated?: boolean): string {
  if (curated) {
    return `${etf.expense}% fee · ${etf.holdings.length} top holdings · ${etf.themes.length} theme${etf.themes.length === 1 ? "" : "s"}`;
  }
  const fee = etf.expense > 0 ? `${etf.expense}% fee · ` : "";
  return `${fee}Catalog · prospectus & watchlist`;
}

export function screenerUniverseLabel(shown: number): string {
  return `${shown} shown · ${ETF_CATALOG_COUNT}+ US-listed ETFs in catalog`;
}
