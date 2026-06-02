import { themeById } from "@/data/themes";
import type { ThemeId, UserProfile } from "@/store/types";

const RISK_LABELS: Record<string, string> = {
  "very-low": "Very conservative",
  low: "Conservative",
  medium: "Balanced",
  high: "Growth-oriented",
  "very-high": "Aggressive",
};

const HORIZON_LABELS: Record<string, string> = {
  short: "Under 3 years",
  medium: "3–7 years",
  long: "7–15 years",
  "very-long": "15+ years",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  none: "New to investing",
  some: "Some experience",
  experienced: "Experienced investor",
};

export type BuilderProfileChip = {
  id: string;
  label: string;
  value: string;
};

export function builderProfileChips(profile: UserProfile, themeIds: ThemeId[]): BuilderProfileChip[] {
  const chips: BuilderProfileChip[] = [
    { id: "risk", label: "Risk", value: RISK_LABELS[profile.risk] ?? profile.risk },
    { id: "horizon", label: "Timeline", value: HORIZON_LABELS[profile.horizon] ?? profile.horizon },
    {
      id: "experience",
      label: "Experience",
      value: EXPERIENCE_LABELS[profile.experience] ?? profile.experience,
    },
    {
      id: "goal",
      label: "Primary goal",
      value:
        {
          retirement: "Retirement",
          wealth: "Build wealth",
          house: "Home down payment",
          income: "Income & dividends",
          exploration: "Learn & explore",
        }[profile.primaryGoal] ?? "Grow wealth",
    },
  ];

  if (profile.monthlyContribution > 0) {
    chips.push({
      id: "contrib",
      label: "Monthly invest",
      value: `$${profile.monthlyContribution.toLocaleString()}`,
    });
  }

  const interests = themeIds
    .map((id) => themeById(id)?.title)
    .filter(Boolean) as string[];
  if (interests.length > 0) {
    chips.push({
      id: "interests",
      label: "Thesis interests",
      value: interests.slice(0, 3).join(" · ") + (interests.length > 3 ? " …" : ""),
    });
  }

  return chips;
}

export function builderThesisConvictionDefault(
  profile: UserProfile,
  themeIds: ThemeId[]
): string {
  const risk = RISK_LABELS[profile.risk] ?? "balanced";
  const horizon = HORIZON_LABELS[profile.horizon] ?? "long-term";
  const themes = themeIds.map((id) => themeById(id)?.title).filter(Boolean);
  if (themes.length === 0) {
    return `I'm building a ${risk.toLowerCase()} portfolio for a ${horizon.toLowerCase()} horizon.`;
  }
  return `I'm ${risk.toLowerCase()} with a ${horizon.toLowerCase()} horizon, focused on ${themes.slice(0, 2).join(" and ")}.`;
}
