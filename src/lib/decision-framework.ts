import type { CfoProfile } from "@/types/cfo-profile";

export type FrameworkCheck = {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
  route?: string;
};

export function decisionFrameworkChecks(profile: CfoProfile): FrameworkCheck[] {
  return [
    {
      id: "ef",
      label: "Emergency fund",
      ok: profile.hasEmergencyFund,
      hint: profile.hasEmergencyFund
        ? "Buffer in place before adding thesis risk"
        : "Build cash buffer before sizing stocks",
      route: "/courses/money-foundations/mf-time-value-money",
    },
    {
      id: "debt",
      label: "High-interest debt",
      ok: !profile.hasHighInterestDebt,
      hint: profile.hasHighInterestDebt
        ? "Paydown may beat new stock bets"
        : "No high-APR debt flagged",
      route: "/courses/credit-borrowing/cb-credit-vs-investing",
    },
    {
      id: "horizon",
      label: "Time horizon set",
      ok: profile.horizon === "long" || profile.horizon === "very-long" || profile.horizon === "medium",
      hint: `Horizon: ${profile.horizon}, match volatility to when you need the money`,
      route: "/thesis-profile",
    },
    {
      id: "risk",
      label: "Risk tolerance honest",
      ok: true,
      hint: `Drawdown reaction: ${profile.reactionToDrawdown.replace("-", " ")}`,
      route: "/thesis-profile",
    },
  ];
}
