import type { ForecastLifeEvent } from "@/lib/forecast-model";

/** Tappable “what if” presets for the forecast screen, adjust sliders instantly. */
export type ForecastScenarioPreset = {
  id: string;
  question: string;
  hint: string;
  apply: (current: ForecastScenarioValues) => ForecastScenarioValues;
  /** Optional life events bundled with this scenario. */
  events?: ForecastLifeEvent[];
};

export type ForecastScenarioValues = {
  retirementAge: number;
  annualReturnPct: number;
  monthlySavings: number;
  effectiveTaxRatePct: number;
  monthlyBurn: number;
  currentNetWorth: number;
};

export const FORECAST_SCENARIO_DEFAULTS: ForecastScenarioValues = {
  retirementAge: 65,
  annualReturnPct: 6,
  monthlySavings: 1000,
  effectiveTaxRatePct: 22,
  monthlyBurn: 3500,
  currentNetWorth: 45_000,
};

export const FORECAST_EVENT_TEMPLATES: Omit<ForecastLifeEvent, "year">[] = [
  { label: "Buy a home", impactUsd: -85_000 },
  { label: "Down payment", impactUsd: -60_000 },
  { label: "Have a kid", impactUsd: -12_000 },
  { label: "Wedding", impactUsd: -35_000 },
  { label: "Job loss (6 mo)", impactUsd: -30_000, monthlySavingsOverride: 0 },
  { label: "Promotion (+20% save)", impactUsd: 15_000, savingsMultiplier: 1.2 },
  { label: "Sabbatical year", impactUsd: -20_000, monthlySavingsOverride: 0 },
  { label: "Inheritance", impactUsd: 75_000 },
  { label: "Car purchase", impactUsd: -28_000 },
  { label: "MBA / degree", impactUsd: -45_000 },
];

export const FORECAST_SCENARIOS: ForecastScenarioPreset[] = [
  {
    id: "house-500k",
    question: "Can I afford a ~$500k home?",
    hint: "Down payment + higher burn after purchase",
    apply: (v) => ({ ...v, monthlyBurn: 4200, monthlySavings: Math.max(400, v.monthlySavings - 200) }),
    events: [
      { year: 2029, label: "Home down payment", impactUsd: -95_000 },
      { year: 2030, label: "Higher housing costs", impactUsd: -8_000 },
    ],
  },
  {
    id: "kid-3y",
    question: "What if we have a kid in 3 years?",
    hint: "One-time costs + slightly higher burn",
    apply: (v) => ({ ...v, monthlyBurn: 3800 }),
    events: [
      { year: 2029, label: "Have a kid", impactUsd: -15_000 },
      { year: 2030, label: "Childcare year 1", impactUsd: -10_000 },
    ],
  },
  {
    id: "job-loss",
    question: "What if I lose my job for 6 months?",
    hint: "Pauses savings, one-time draw",
    apply: (v) => ({ ...v, monthlySavings: 0 }),
    events: [{ year: 2028, label: "Job loss (6 mo)", impactUsd: -28_000, monthlySavingsOverride: 0 }],
  },
  {
    id: "promotion",
    question: "What if I get a 25% raise?",
    hint: "Boosts savings for several years",
    apply: (v) => ({ ...v, monthlySavings: Math.round(v.monthlySavings * 1.25) }),
    events: [{ year: 2028, label: "Promotion", impactUsd: 10_000, savingsMultiplier: 1.25 }],
  },
  {
    id: "retire-55",
    question: "What if I retire at 55?",
    hint: "Earlier stop to work, longer drawdown",
    apply: (v) => ({ ...v, retirementAge: 55 }),
  },
  {
    id: "tax-22",
    question: "What if my effective tax rate is 22%?",
    hint: "Lowers after-tax compounding on the curve",
    apply: (v) => ({ ...v, effectiveTaxRatePct: 22 }),
  },
  {
    id: "tax-32",
    question: "What if taxes run closer to 32%?",
    hint: "Higher drag, common in high-income coastal states",
    apply: (v) => ({ ...v, effectiveTaxRatePct: 32 }),
  },
  {
    id: "burn-4k",
    question: "What if my burn rate is $4k/month in retirement?",
    hint: "More spending after you stop working",
    apply: (v) => ({ ...v, monthlyBurn: 4000 }),
  },
  {
    id: "burn-6k",
    question: "What if I need $6k/month to live comfortably?",
    hint: "Stress-tests retirement drawdown",
    apply: (v) => ({ ...v, monthlyBurn: 6000 }),
  },
  {
    id: "save-more",
    question: "What if I save $1,500/month instead?",
    hint: "Boosts contributions while working",
    apply: (v) => ({ ...v, monthlySavings: 1500 }),
  },
  {
    id: "retire-60",
    question: "What if I retire at 60?",
    hint: "Fewer earning years, longer drawdown phase",
    apply: (v) => ({ ...v, retirementAge: 60 }),
  },
  {
    id: "return-4",
    question: "What if markets only return ~4% a year?",
    hint: "Conservative growth assumption",
    apply: (v) => ({ ...v, annualReturnPct: 4 }),
  },
  {
    id: "return-8",
    question: "What if I earn ~8% before taxes long term?",
    hint: "Optimistic, still illustrative",
    apply: (v) => ({ ...v, annualReturnPct: 8 }),
  },
];
