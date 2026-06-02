/**
 * Educational net-worth targets from monthly burn (spending).
 * Not personalized financial advice.
 */

/** Approximate U.S. medians for context (Census / BLS, recent years). */
export const US_INCOME_CONTEXT = {
  medianHouseholdIncome: 74_580,
  medianPersonalEarnings: 56_368,
  sourceNote: "U.S. Census Bureau & BLS, rounded for education; varies by age and region.",
};

export type NetWorthTargetGuide = {
  monthlyBurn: number;
  annualBurn: number;
  /** 4 × annual burn, ~4 years of lifestyle expenses saved */
  fourTimesAnnualBurn: number;
  /** 25 × annual burn, common FI heuristic (≈4% annual withdrawal) */
  twentyFiveTimesAnnualBurn: number;
};

export function netWorthTargetsFromMonthlyBurn(monthlyBurn: number): NetWorthTargetGuide | null {
  if (!Number.isFinite(monthlyBurn) || monthlyBurn <= 0) return null;
  const annualBurn = monthlyBurn * 12;
  return {
    monthlyBurn,
    annualBurn,
    fourTimesAnnualBurn: Math.round(annualBurn * 4),
    twentyFiveTimesAnnualBurn: Math.round(annualBurn * 25),
  };
}

export function formatUsdWhole(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Default suggestion for target net worth field, 25× annual burn (4% rule). */
export function recommendedTargetNetWorth(monthlyBurn: number): number | null {
  const g = netWorthTargetsFromMonthlyBurn(monthlyBurn);
  return g?.twentyFiveTimesAnnualBurn ?? null;
}
