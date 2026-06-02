import { hasMilitaryAffiliation } from "@/lib/military-profile";
import type { UserProfile } from "@/store/types";

export type ResearchModuleId =
  | "market-scenarios"
  | "simulations"
  | "portfolio-analysis"
  | "risk-assessment"
  | "spending-insights"
  | "buy-a-home"
  | "thesis-backtest"
  | "military-programs";

export type ResearchModule = {
  id: ResearchModuleId;
  title: string;
  subtitle: string;
  /** Shown when profile matches */
  relevant?: (p: UserProfile) => boolean;
  /** Higher = closer to top of home list */
  priority?: (p: UserProfile) => number;
};

export const RESEARCH_MODULES: ResearchModule[] = [
  {
    id: "portfolio-analysis",
    title: "Portfolio X-Ray",
    subtitle: "See overlap, theme gaps, and where you're doubled up.",
    relevant: () => true,
    priority: () => 10,
  },
  {
    id: "simulations",
    title: "Scenario planning",
    subtitle: "Model net worth with marriage, kids, and retirement markers.",
    relevant: () => true,
    priority: (p) => (p.horizon === "long" || p.horizon === "very-long" ? 9 : 6),
  },
  {
    id: "risk-assessment",
    title: "Advice checklist",
    subtitle: "What to fix first, emergency fund, debt, concentration.",
    relevant: () => true,
    priority: (p) => (!p.hasEmergencyFund || p.hasHighInterestDebt ? 9 : 5),
  },
  {
    id: "market-scenarios",
    title: "Thesis Radar",
    subtitle: "Find thesis-fit stocks, run conviction dossiers, track watchlist.",
    relevant: () => true,
    priority: () => 8,
  },
  {
    id: "thesis-backtest",
    title: "Thesis backtest",
    subtitle: "Illustrative returns for your top matched theme.",
    relevant: () => true,
    priority: () => 3,
  },
  {
    id: "spending-insights",
    title: "Credit & cash flow",
    subtitle: "Scores, utilization, and when to pay debt before investing more.",
    relevant: (p) => !p.hasEmergencyFund || p.hasHighInterestDebt,
    priority: () => 8,
  },
  {
    id: "buy-a-home",
    title: "Home down payment math",
    subtitle: "Tradeoffs between saving for a house and staying invested.",
    relevant: (p) => p.primaryGoal === "house",
    priority: () => 7,
  },
  {
    id: "military-programs",
    title: "Military financial programs",
    subtitle: "SCRA, TSP/Roth TSP, SDP, CZTE, official links for service members.",
    relevant: (p) => hasMilitaryAffiliation(p),
    priority: () => 11,
  },
];

export function researchModulesForProfile(profile: UserProfile, limit = 5): ResearchModule[] {
  const ranked = RESEARCH_MODULES.filter((m) => !m.relevant || m.relevant(profile)).sort(
    (a, b) => (b.priority?.(profile) ?? 0) - (a.priority?.(profile) ?? 0)
  );
  return ranked.slice(0, limit);
}
