export type ForecastLifeEvent = {
  year: number;
  label: string;
  /** One-time net worth impact (negative = cost). */
  impactUsd: number;
  /** Multiply monthly savings for this calendar year (e.g. 1.25 after promotion). */
  savingsMultiplier?: number;
  /** Replace monthly savings for this year (e.g. 0 during sabbatical). */
  monthlySavingsOverride?: number;
};

export type ForecastPoint = {
  year: number;
  netWorth: number;
};

export type ForecastInput = {
  startYear: number;
  endYear: number;
  currentNetWorth: number;
  currentAge: number;
  retirementAge: number;
  /** Pre-tax annual return while invested (e.g. 0.06). */
  annualReturn: number;
  /** Effective tax drag on portfolio growth (0–0.4). Simplified illustration. */
  effectiveTaxRate?: number;
  /** Monthly contributions while working. */
  monthlySavings: number;
  /** Monthly spending in retirement (burn rate). */
  monthlyBurn?: number;
  events?: ForecastLifeEvent[];
};

export const DEFAULT_FORECAST_EVENTS: ForecastLifeEvent[] = [
  { year: 2029, label: "Buy a home", impactUsd: -85_000 },
  { year: 2032, label: "Have a kid", impactUsd: -12_000 },
  { year: 2037, label: "Major expense", impactUsd: -25_000 },
  { year: 2043, label: "Income bump", impactUsd: 40_000, savingsMultiplier: 1.2 },
];

/**
 * Simple illustrative projection, not financial advice.
 * Tax rate reduces after-tax compounding; burn rate draws down in retirement.
 */
export function buildNetWorthForecast(input: ForecastInput): ForecastPoint[] {
  const {
    startYear,
    endYear,
    currentNetWorth,
    currentAge,
    retirementAge,
    annualReturn,
    effectiveTaxRate = 0,
    monthlySavings,
    monthlyBurn = 3_500,
    events = DEFAULT_FORECAST_EVENTS,
  } = input;

  const taxDrag = Math.min(0.4, Math.max(0, effectiveTaxRate));
  const afterTaxReturn = annualReturn * (1 - taxDrag);
  const retireReturn = Math.max(0.01, afterTaxReturn * 0.45);

  const eventByYear = new Map(events.map((e) => [e.year, e]));
  const points: ForecastPoint[] = [];
  let nw = Math.max(0, currentNetWorth);

  for (let year = startYear; year <= endYear; year++) {
    const age = currentAge + (year - startYear);
    const working = age < retirementAge;
    const ev = eventByYear.get(year);

    if (working) {
      let monthly = monthlySavings;
      if (ev?.monthlySavingsOverride != null) monthly = ev.monthlySavingsOverride;
      else if (ev?.savingsMultiplier != null) monthly = monthly * ev.savingsMultiplier;
      nw += monthly * 12;
      nw *= 1 + afterTaxReturn;
    } else {
      nw -= monthlyBurn * 12;
      nw *= 1 + retireReturn;
    }

    if (ev) nw += ev.impactUsd;

    nw = Math.max(0, nw);
    points.push({ year, netWorth: Math.round(nw) });
  }

  return points;
}

export function formatForecastUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

export function peakForecastPoint(points: ForecastPoint[]): ForecastPoint | undefined {
  if (!points.length) return undefined;
  return points.reduce((best, p) => (p.netWorth > best.netWorth ? p : best), points[0]);
}

/** First year net worth hits zero after start (if ever). */
export function forecastRunsOutYear(
  points: ForecastPoint[],
  startYear: number
): number | null {
  for (const p of points) {
    if (p.year > startYear && p.netWorth <= 0) return p.year;
  }
  return null;
}

/** Crude “years of burn” at retirement using last working-year NW. */
export function yearsOfBurnAtRetirement(
  points: ForecastPoint[],
  retirementYear: number,
  monthlyBurn: number
): number | null {
  const at = points.find((p) => p.year === retirementYear);
  if (!at || monthlyBurn <= 0) return null;
  const annual = monthlyBurn * 12;
  return Math.round((at.netWorth / annual) * 10) / 10;
}
