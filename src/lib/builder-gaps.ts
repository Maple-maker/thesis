import type { CfoProfile } from "@/types/cfo-profile";
import { hasMilitaryAffiliation } from "@/lib/military-profile";
import type { ThemeId } from "@/store/types";

export type BuilderGap = {
  id: string;
  title: string;
  body: string;
  cta: string;
  route: string;
  priority: number;
};

export function builderGapsForProfile(
  profile: CfoProfile,
  themeIds: ThemeId[],
  hasModel: boolean
): BuilderGap[] {
  const gaps: BuilderGap[] = [];

  if (hasMilitaryAffiliation(profile)) {
    gaps.push({
      id: "military-resources",
      title: "Service member programs",
      body: "SCRA, TSP/Roth TSP, SDP (deployments), and combat-zone tax rules can change what to fund first.",
      cta: "Open military resources",
      route: "/military-resources",
      priority: 98,
    });
  }

  if (!profile.hasEmergencyFund) {
    gaps.push({
      id: "emergency-fund",
      title: "Emergency fund first",
      body: "Before sizing thesis risk, build 3–6 months of expenses in cash or a HYSA.",
      cta: "Money foundations lesson",
      route: "/courses/money-foundations/mf-time-value-money",
      priority: 100,
    });
  }

  if (profile.hasHighInterestDebt) {
    gaps.push({
      id: "high-debt",
      title: "High-interest debt",
      body: "Paydown often beats adding single-stock risk until APR is under control.",
      cta: "Credit & borrowing",
      route: "/courses/credit-borrowing/cb-credit-vs-investing",
      priority: 95,
    });
  }

  if (themeIds.length === 0) {
    gaps.push({
      id: "pick-themes",
      title: "Pick up to 2 theses",
      body: "Conviction starts with a clear point of view, not five conflicting stories.",
      cta: "Open library",
      route: "/(tabs)/themes",
      priority: 90,
    });
  }

  if (themeIds.length > 0 && !hasModel) {
    gaps.push({
      id: "build-model",
      title: "Build your model book",
      body: "Turn themes into weighted names you can stress-test and compare to SPY.",
      cta: "Build portfolio",
      route: "/(tabs)/builder/portfolio",
      priority: 85,
    });
  }

  if (profile.experience === "none" && themeIds.length > 0) {
    gaps.push({
      id: "learn-basics",
      title: "Learn before you size",
      body: "A short course on diversification and risk makes duels and radar more useful.",
      cta: "Investing building blocks",
      route: "/courses/investing-building-blocks",
      priority: 70,
    });
  }

  return gaps.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
