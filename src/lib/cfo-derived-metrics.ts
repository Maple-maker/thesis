import { recommendedTargetNetWorth } from "@/lib/target-net-worth-guide";
import type { CfoDerivedMetrics, CfoProfile } from "@/types/cfo-profile";

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

const RISK_MAP: Record<string, number> = {
  "very-low": 15,
  low: 30,
  medium: 50,
  high: 72,
  "very-high": 90,
};

const HORIZON_MAP: Record<string, number> = {
  short: 20,
  medium: 45,
  long: 72,
  "very-long": 92,
};

export function computeDerivedMetrics(profile: CfoProfile): CfoDerivedMetrics {
  const ex = profile.extended;
  const riskBase = RISK_MAP[profile.risk] ?? 50;
  const maxDd = ex.risk?.maximumAcceptableDrawdown ?? riskBase;
  const behavioralPenalty =
    (profile.reactionToDrawdown === "panic-sell" ? 25 : 0) +
    (ex.behavioral?.panicSellHistory ? 15 : 0) +
    ((ex.behavioral?.fomoTendency ?? 5) > 7 ? 10 : 0);

  const behavioralScore = clamp(100 - behavioralPenalty - (ex.behavioral?.overconfidenceScore ?? 5) * 2);

  const liquid =
    ex.balanceSheet?.liquidNetWorth ??
    (ex.balanceSheet?.cash ?? 0) +
      (ex.balanceSheet?.checking ?? 0) +
      (ex.balanceSheet?.savings ?? 0);
  const efTarget = ex.liquidity?.emergencyFundTarget ?? profile.monthlyContribution * 6;
  const efCurrent = ex.liquidity?.emergencyFundCurrent ?? (profile.hasEmergencyFund ? efTarget : 0);
  const liquidityScore = clamp(efTarget > 0 ? (efCurrent / efTarget) * 100 : profile.hasEmergencyFund ? 80 : 35);

  const nw =
    profile.netInvestable +
    (ex.balanceSheet?.retirementAccounts ?? 0) +
    (ex.balanceSheet?.realEstate ?? 0) -
    (ex.balanceSheet?.mortgageBalance ?? 0) -
    (ex.balanceSheet?.studentLoans ?? 0) -
    (ex.balanceSheet?.creditCards ?? 0);

  let wealthStage: CfoDerivedMetrics["wealthStage"] = "starter";
  if (nw >= 500_000) wealthStage = "preserver";
  else if (nw >= 100_000) wealthStage = "accumulator";
  else if (nw >= 25_000) wealthStage = "builder";

  const burn = ex.expenses?.monthlyExpenses;
  const inferredFi =
    typeof burn === "number" && burn > 0 ? recommendedTargetNetWorth(burn) : null;
  const fiTarget = ex.goals?.targetNetWorth ?? inferredFi ?? 1_000_000;
  const fiProgress = clamp((nw / fiTarget) * 100);

  const retAge = ex.retirement?.desiredRetirementAge ?? ex.goals?.retirementAgeGoal ?? 65;
  const yearsToRet = Math.max(0, retAge - profile.age);
  const retirementReadiness = clamp(
    (HORIZON_MAP[profile.horizon] ?? 50) * 0.4 +
      (ex.balanceSheet?.retirementAccounts ? 25 : 0) +
      (yearsToRet > 10 ? 20 : yearsToRet > 5 ? 10 : 0)
  );

  const concentrationRisk = clamp(
    100 -
      (ex.risk?.concentrationTolerance === "high" ? 0 : ex.risk?.concentrationTolerance === "medium" ? 15 : 35) -
      (profile.experience === "none" ? 10 : 0)
  );

  const taxScore = clamp(
    (ex.tax?.hasTaxDeferredAccounts ? 25 : 0) +
      (ex.tax?.hasTaxFreeAccounts ? 25 : 0) +
      (profile.horizon === "long" || profile.horizon === "very-long" ? 25 : 10) +
      25
  );

  const incomeStability = ex.income?.incomeStabilityRating ?? ex.risk?.incomeStabilityScore ?? 6;
  const incomeResilience = clamp(incomeStability * 10 - (profile.hasHighInterestDebt ? 20 : 0));

  const leverageScore = clamp(
    ex.risk?.leverageTolerance === "high"
      ? 40
      : ex.risk?.leverageTolerance === "moderate"
        ? 65
        : ex.risk?.leverageTolerance === "low"
          ? 85
          : 95
  );

  const portfolioHealth = clamp(
    (profile.experience === "experienced" ? 20 : profile.experience === "some" ? 12 : 5) +
      (profile.hasEmergencyFund ? 25 : 0) +
      (!profile.hasHighInterestDebt ? 20 : 0) +
      liquidityScore * 0.35
  );

  const sectionCount = profile.meta.completedSections.length;
  const overallCfoReadiness = clamp(
    riskBase * 0.12 +
      behavioralScore * 0.15 +
      liquidityScore * 0.15 +
      fiProgress * 0.1 +
      retirementReadiness * 0.12 +
      portfolioHealth * 0.16 +
      Math.min(sectionCount * 3, 30)
  );

  return {
    riskScore: clamp(maxDd || riskBase),
    behavioralScore,
    wealthStage,
    financialIndependenceProgress: fiProgress,
    retirementReadinessScore: retirementReadiness,
    concentrationRiskScore: concentrationRisk,
    liquidityScore,
    taxEfficiencyScore: taxScore,
    leverageScore,
    incomeResilienceScore: incomeResilience,
    portfolioHealthScore: portfolioHealth,
    overallCfoReadiness,
  };
}
