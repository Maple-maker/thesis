import type { CfoProfile } from "@/types/cfo-profile";
import type { LinkedAccount, PlaidConnectionStatus } from "@/types/linked-accounts";

export type AdviceCategory = "save" | "spend" | "paydown" | "protect" | "invest" | "wellness" | "setup";

export type AdviceItem = {
  id: string;
  category: AdviceCategory;
  pillar: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "done";
  tasksRemaining: number;
  prioritized?: boolean;
};

export function adviceForUser(
  profile: CfoProfile,
  plaidStatus: PlaidConnectionStatus,
  accounts: LinkedAccount[]
): AdviceItem[] {
  const items: AdviceItem[] = [];

  if (plaidStatus === "disconnected") {
    items.push({
      id: "link-accounts",
      category: "setup",
      pillar: "Setup",
      title: "Get everything in one place",
      description:
        "Link checking, cards, and investments so your AI CFO sees real balances, not just questionnaire guesses.",
      status: "not-started",
      tasksRemaining: 1,
      prioritized: true,
    });
  }

  if (!profile.hasEmergencyFund) {
    items.push({
      id: "efund",
      category: "save",
      pillar: "Save up",
      title: "Build an emergency fund",
      description:
        "Aim for 3–6 months of essential expenses in a high-yield savings account before taking extra investment risk.",
      status: "not-started",
      tasksRemaining: 4,
      prioritized: true,
    });
  }

  if (profile.hasHighInterestDebt) {
    items.push({
      id: "pay-debt",
      category: "paydown",
      pillar: "Pay down",
      title: "Tackle high-interest debt",
      description:
        "Paying down APR above ~8% is often a better guaranteed return than investing, especially before maxing risky bets.",
      status: "not-started",
      tasksRemaining: 3,
      prioritized: true,
    });
  }

  items.push({
    id: "budget",
    category: "spend",
    pillar: "Spend",
    title: "Set up a budget",
    description:
      "Track cash in vs. out. Thesis uses linked data (when connected) to spot surplus you could invest or use for debt payoff.",
    status: accounts.length > 0 ? "in-progress" : "not-started",
    tasksRemaining: 5,
    prioritized: profile.primaryGoal === "house",
  });

  items.push({
    id: "retirement",
    category: "invest",
    pillar: "Invest",
    title: "Save for retirement",
    description:
      "Tax-advantaged accounts (Roth/traditional) matter as much as picking funds, especially with your horizon.",
    status: "not-started",
    tasksRemaining: 4,
    prioritized: profile.primaryGoal === "retirement",
  });

  items.push({
    id: "insurance",
    category: "protect",
    pillar: "Protect",
    title: "Review insurance coverage",
    description: "Health, renters/home, and auto, protect the foundation before optimizing portfolio tweaks.",
    status: "not-started",
    tasksRemaining: 3,
  });

  items.push({
    id: "concentration",
    category: "invest",
    pillar: "Invest",
    title: "Check portfolio concentration",
    description:
      "When investments are linked, Thesis flags single-stock or sector bets that clash with your stated risk comfort.",
    status: accounts.some((a) => a.type === "investment") ? "in-progress" : "not-started",
    tasksRemaining: 2,
  });

  return items;
}

export const ADVICE_CATEGORIES: { id: AdviceCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "setup", label: "Setup" },
  { id: "save", label: "Save up" },
  { id: "spend", label: "Spend" },
  { id: "paydown", label: "Pay down" },
  { id: "invest", label: "Invest" },
  { id: "protect", label: "Protect" },
];
