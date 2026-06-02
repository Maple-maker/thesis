import { resolveDuelAsset, type DuelAsset } from "@/lib/duel-asset";
import type { Holding } from "@/types/linked-accounts";

/** Watchlist tickers that resolve to a stock or ETF duel (not portfolios). */
export function duelableWatchlistSymbols(
  watchlist: string[],
  holdings: Holding[] = []
): string[] {
  return watchlist.filter((sym) => {
    const asset = resolveDuelAsset(sym, holdings);
    return asset?.kind === "stock" || asset?.kind === "etf";
  });
}

export function canDuelFromWatchlist(watchlist: string[], holdings: Holding[] = []): boolean {
  return duelableWatchlistSymbols(watchlist, holdings).length >= 2;
}

/** First two duelable symbols in watchlist order (stable, not random). */
export function defaultWatchlistDuelSymbols(
  watchlist: string[],
  holdings: Holding[] = []
): [string, string] | null {
  const syms = duelableWatchlistSymbols(watchlist, holdings);
  if (syms.length < 2) return null;
  return [syms[0], syms[1]];
}

export function resolveWatchlistDuelPair(
  a: string,
  b: string,
  holdings: Holding[] = []
): [DuelAsset, DuelAsset] | null {
  const pa = resolveDuelAsset(a, holdings);
  const pb = resolveDuelAsset(b, holdings);
  if (!pa || !pb) return null;
  if (pa.kind === "portfolio" || pb.kind === "portfolio") return null;
  if (pa.duelRef === pb.duelRef) return null;
  return [pa, pb];
}

/** Picks an interesting pair from the watchlist (themed overlap preferred). */
export function pickWatchlistDuelPair(
  watchlist: string[],
  holdings: Holding[] = []
): [DuelAsset, DuelAsset] | null {
  const assets = duelableWatchlistSymbols(watchlist, holdings)
    .map((s) => resolveDuelAsset(s, holdings))
    .filter(Boolean) as DuelAsset[];
  if (assets.length < 2) return null;

  const candidatePairs: [DuelAsset, DuelAsset][] = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const a = assets[i];
      const b = assets[j];
      if (a.themes.some((t) => b.themes.includes(t))) {
        candidatePairs.push([a, b]);
      }
    }
  }
  if (candidatePairs.length > 0) {
    return candidatePairs[Math.floor(Math.random() * candidatePairs.length)];
  }
  return [assets[0], assets[1]];
}
