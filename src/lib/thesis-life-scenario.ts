import {
  lifeScenarioById,
  type LifeScenarioId,
  type LifeScenarioPreset,
} from "@/data/life-scenario-presets";
import type { LensHolding } from "@/data/investor-lenses";
import { buildThesisPortfolio, type BuiltThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import type { ThemeId, UserProfile } from "@/store/types";

export type AppliedLifeScenario = {
  id: LifeScenarioId;
  appliedAt: number;
};

type ModelThesisShape = {
  name: string;
  conviction: string;
  climateId: string | null;
  themeIds: ThemeId[];
  holdings: LensHolding[];
  appliedLifeScenarios?: AppliedLifeScenario[];
};

function overlayProfile(base: UserProfile, presets: LifeScenarioPreset[]): UserProfile {
  let monthlyContribution = base.monthlyContribution;
  let risk = base.risk;
  let hasEmergencyFund = base.hasEmergencyFund;
  let hasHighInterestDebt = base.hasHighInterestDebt;

  for (const p of presets) {
    const o = p.profileOverlay;
    if (o.monthlyContributionFactor != null) {
      monthlyContribution = Math.round(monthlyContribution * o.monthlyContributionFactor);
    }
    if (o.hasEmergencyFund != null) hasEmergencyFund = o.hasEmergencyFund;
    if (o.hasHighInterestDebt != null) hasHighInterestDebt = o.hasHighInterestDebt;
    if (o.riskDownshift) {
      if (risk === "very-high") risk = "high";
      else if (risk === "high") risk = "medium";
      else if (risk === "medium") risk = "low";
      else if (risk === "low") risk = "very-low";
    }
  }

  return {
    ...base,
    monthlyContribution,
    risk,
    hasEmergencyFund,
    hasHighInterestDebt,
  };
}

function overlayHoldings(
  holdings: LensHolding[],
  presets: LifeScenarioPreset[]
): LensHolding[] {
  if (!holdings.length) return holdings;

  let stockFactor = 1;
  let etfFactor = 1;
  for (const p of presets) {
    stockFactor *= p.holdingsOverlay.stockWeightFactor;
    etfFactor *= p.holdingsOverlay.etfWeightFactor;
  }

  const raw = holdings.map((h) => ({
    ...h,
    raw:
      h.weightPct *
      (h.kind === "stock" ? stockFactor : h.kind === "etf" ? etfFactor : 1),
  }));
  const sum = raw.reduce((s, x) => s + x.raw, 0) || 1;
  let out = raw.map((h) => ({
    symbol: h.symbol,
    kind: h.kind,
    weightPct: Math.round((h.raw / sum) * 1000) / 10,
  }));
  const total = out.reduce((s, h) => s + h.weightPct, 0);
  if (out.length && Math.abs(total - 100) > 0.1) {
    out = out.map((h, i) =>
      i === 0 ? { ...h, weightPct: Math.round((h.weightPct + (100 - total)) * 10) / 10 } : h
    );
  }
  return out;
}

export function buildConvictionWithScenarios(
  baseConviction: string,
  applied: AppliedLifeScenario[]
): string {
  const presets = applied
    .map((a) => lifeScenarioById(a.id))
    .filter((p): p is LifeScenarioPreset => !!p);
  if (!presets.length) return baseConviction.trim();
  const notes = presets.map((p) => p.convictionNote).join("\n\n");
  const base = baseConviction.trim();
  return base ? `${base}\n\n${notes}` : notes;
}

export function stressSummariesForScenarios(applied: AppliedLifeScenario[]): string[] {
  return applied
    .map((a) => lifeScenarioById(a.id)?.stressSummary)
    .filter((s): s is string => !!s);
}

export function reformModelThesisFromScenarios(input: {
  model: ModelThesisShape;
  profile: UserProfile;
  applied: AppliedLifeScenario[];
}): {
  holdings: LensHolding[];
  conviction: string;
  stressSummaries: string[];
  rebuilt: BuiltThesisPortfolio | null;
} {
  const presets = input.applied
    .map((a) => lifeScenarioById(a.id))
    .filter((p): p is LifeScenarioPreset => !!p);

  const profile = overlayProfile(input.profile, presets);
  let maxStocks = 4;
  let maxEtfs = 3;
  for (const p of presets) {
    maxStocks = Math.max(2, maxStocks + p.holdingsOverlay.maxStocksDelta);
  }

  const conviction = buildConvictionWithScenarios(input.model.conviction, input.applied);
  const rebuilt = buildThesisPortfolio({
    name: input.model.name,
    conviction,
    profile,
    themeIds: input.model.themeIds as ThemeId[],
    climateId: input.model.climateId,
    maxStocks,
    maxEtfs,
  });

  const holdings = rebuilt
    ? overlayHoldings(rebuilt.holdings, presets)
    : overlayHoldings(input.model.holdings, presets);

  return {
    holdings,
    conviction,
    stressSummaries: stressSummariesForScenarios(input.applied),
    rebuilt,
  };
}
