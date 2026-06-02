import { lifeScenarioById, type LifeScenarioId } from "@/data/life-scenario-presets";
import type { ForecastScenarioValues } from "@/data/forecast-scenarios";

export type LifeChecklistItem = {
  id: string;
  label: string;
  educational: boolean;
};

const CHECKLISTS: Partial<Record<LifeScenarioId, LifeChecklistItem[]>> = {
  married: [
    { id: "ben", label: "Update beneficiaries on retirement accounts", educational: true },
    { id: "joint", label: "Align joint goals & monthly surplus", educational: true },
    { id: "tax", label: "Review filing status & tax bracket together", educational: true },
  ],
  "new-child": [
    { id: "ins", label: "Review life & disability insurance", educational: true },
    { id: "529", label: "Understand 529 / education savings options", educational: true },
    { id: "burn", label: "Raise emergency fund target for higher burn", educational: true },
  ],
  "home-purchase": [
    { id: "down", label: "Separate down-payment cash from thesis sleeve", educational: true },
    { id: "dti", label: "Stress-test debt-to-income after mortgage", educational: true },
  ],
  "job-loss": [
    { id: "runway", label: "Calculate months of runway at current burn", educational: true },
    { id: "pause", label: "Pause automatic investing until income stabilizes", educational: true },
  ],
};

export function checklistForScenario(id: LifeScenarioId): LifeChecklistItem[] {
  return CHECKLISTS[id] ?? [];
}

export function forecastPatchForScenario(
  id: LifeScenarioId,
  current: ForecastScenarioValues
): Partial<ForecastScenarioValues> {
  const preset = lifeScenarioById(id);
  if (!preset) return {};

  switch (id) {
    case "job-loss":
      return {
        monthlySavings: 0,
        monthlyBurn: Math.round(current.monthlyBurn * 1.05),
      };
    case "emergency-expense":
      return {
        monthlySavings: Math.round(current.monthlySavings * 0.5),
        currentNetWorth: current.currentNetWorth - 20_000,
      };
    case "married":
      return { monthlySavings: Math.round(current.monthlySavings * 1.1) };
    case "new-child":
      return {
        monthlyBurn: Math.round(current.monthlyBurn * 1.08),
        monthlySavings: Math.round(current.monthlySavings * 0.8),
      };
    case "home-purchase":
      return {
        currentNetWorth: current.currentNetWorth - 60_000,
        monthlySavings: Math.round(current.monthlySavings * 0.65),
      };
    case "promotion":
      return { monthlySavings: Math.round(current.monthlySavings * 1.25) };
    default:
      return {};
  }
}

export function forecastScenarioIdForLife(id: LifeScenarioId): string | null {
  const map: Partial<Record<LifeScenarioId, string>> = {
    "job-loss": "job-loss",
    "new-child": "kid-3y",
    "home-purchase": "house-500k",
    married: "promotion",
  };
  return map[id] ?? null;
}
