import { allFinancials } from "@/data/stock-financials";

const CACHE = new Map<string, number[]>();

/**
 * Generate a 1-year weekly price history for a symbol.
 * Based on its beta + return1y to produce a realistic-looking path.
 * Deterministic (seed-based) so it stays consistent per symbol.
 */
export function priceHistory(symbol: string): number[] {
  if (CACHE.has(symbol)) return CACHE.get(symbol)!;

  const fin = allFinancials().find((f) => f.symbol === symbol);
  const volatility = fin?.beta ?? 1;
  const annualReturn = fin?.return1y ?? 0.1;
  const weeklyReturn = (1 + annualReturn) ** (1 / 52) - 1;

  const seed = symbol.charCodeAt(0) + (symbol.charCodeAt(symbol.length - 1) ?? 0) * 10;
  const points: number[] = [100];

  for (let i = 1; i < 52; i++) {
    // Deterministic pseudo-random walk
    const r = pseudoRandom(seed, i);
    const noise = (r - 0.5) * volatility * 0.06;
    const trend = weeklyReturn;
    const next = points[i - 1] * (1 + trend + noise);
    points.push(Math.round(next * 100) / 100);
  }

  CACHE.set(symbol, points);
  return points;
}

function pseudoRandom(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
