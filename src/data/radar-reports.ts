import type { ThemeId } from "@/store/types";
import type { UserProfile } from "@/store/types";

export type RadarReport = {
  id: string;
  title: string;
  ago: string;
  bullets: string[];
  themeId?: ThemeId;
  learnLink?: string;
};

/** Illustrative reports, replace with real monitors + API later */
export function radarReportsForContext(
  profile: UserProfile,
  themeIds: ThemeId[],
  watchlist: string[]
): RadarReport[] {
  const top = themeIds[0];
  const reports: RadarReport[] = [];

  if (top === "ai-infrastructure") {
    reports.push({
      id: "r-ai-gap",
      title: "Gap check: software vs hardware in your AI thesis",
      ago: "Today",
      bullets: [
        "Your watchlist may be heavy on chips and cloud, lighter on application software.",
        "Consider whether you want downstream beneficiaries, not just picks-and-shovels.",
        "Tap any ticker to read an illustrative context card.",
      ],
      themeId: top,
      learnLink: "what-is-etf",
    });
  }

  if (watchlist.length >= 2) {
    reports.push({
      id: "r-duel",
      title: "Sharpen conviction: compare two watchlist names",
      ago: "Today",
      bullets: [
        `You have ${watchlist.length} names saved, duels force a clear preference.`,
        "Capture why you chose one side, builds literacy, not a trade signal.",
      ],
    });
  }

  if (!profile.hasEmergencyFund) {
    reports.push({
      id: "r-cash",
      title: "Before markets: emergency cash",
      ago: "1d ago",
      bullets: [
        "Three months of expenses in a HYSA often comes before maxing brokerage contributions.",
        "See Tools for your plan on Home for savings account comparisons.",
      ],
      learnLink: "dollar-cost-averaging",
    });
  }

  if (profile.hasHighInterestDebt) {
    reports.push({
      id: "r-debt",
      title: "High-interest debt vs investing",
      ago: "2d ago",
      bullets: [
        "Paying ~20%+ APR usually beats expected market returns on the same dollars.",
        "Finish Learn: Credit & borrowing before increasing risk assets.",
      ],
    });
  }

  reports.push({
    id: "r-literacy",
    title: "Baseline check: one concept today",
    ago: "3d ago",
    bullets: [
      profile.experience === "none"
        ? "You're early in the journey, one 4-minute lesson compounds over time."
        : "Revisit glossary terms tied to your top thesis drivers.",
    ],
    learnLink: "compound-interest",
  });

  return reports.slice(0, 5);
}
