import type { ThemeId, UserProfile } from "@/store/types";
import type { Holding } from "@/types/linked-accounts";
import { runPortfolioXray } from "@/lib/portfolio-xray";

export type EventBrief = {
  id: string;
  headline: string;
  ago: string;
  context: string;
  bullets: string[];
  actionLabel?: string;
  actionRoute?: string;
  /** Optional second CTA */
  secondaryActionLabel?: string;
  secondaryActionRoute?: string;
  tags?: string[];
};

function buildAllEventBriefs(
  profile: UserProfile,
  themeIds: ThemeId[],
  holdings: Holding[],
  watchlist: string[] = []
): EventBrief[] {
  const xray = runPortfolioXray(holdings, themeIds);
  const briefs: EventBrief[] = [];

  if (holdings.length > 0 && xray.overlaps.length > 0) {
    const top = xray.overlaps[0];
    briefs.push({
      id: "evt-overlap",
      headline: top.title,
      ago: "Just now",
      context:
        "Your connected book shows layered exposure, the same economic bet may appear as a single stock and again inside an ETF.",
      bullets: [
        top.detail,
        "Open Portfolio X-Ray to see all overlap flags and theme gaps.",
        "Use Duel to compare whether a second fund adds diversification or doubles down.",
      ],
      tags: ["overlap", "portfolio"],
      actionLabel: "Open X-Ray",
      actionRoute: "/xray",
      secondaryActionLabel: "Duel overlapping names",
      secondaryActionRoute:
        top.duelParams != null
          ? `/duel?a=${top.duelParams.a}&b=${top.duelParams.b}`
          : "/duel",
    });
  }

  if (watchlist.length >= 2) {
    briefs.push({
      id: "evt-duel-watchlist",
      headline: "Watchlist check-in: force a preference",
      ago: "Today",
      context:
        "You have multiple names saved, a duel records why you prefer one shape of risk over another.",
      bullets: [
        `Compare ${watchlist[0]} vs ${watchlist[1]} for thesis fit and overlap.`,
        "Works for ETFs too, expense ratio and fund overlap included.",
        "Journal entry builds literacy; not a trade signal.",
      ],
      tags: ["duel", "watchlist"],
      actionLabel: "Run a duel",
      actionRoute: `/duel?a=${watchlist[0]}&b=${watchlist[1]}`,
    });
  }

  if (themeIds.includes("ai-infrastructure")) {
    briefs.push({
      id: "evt-ai-earnings",
      headline: "Mega-cap tech earnings week, check semi vs cloud mix",
      ago: "Today",
      context:
        "When hyperscalers report, your AI thesis can shift between application software and infrastructure picks-and-shovels.",
      bullets: [
        "If you hold NVDA or SMH, ask whether results re-rate hardware or software beneficiaries.",
        "Review the AI infrastructure lens targets if you want a reference allocation shape.",
        "Not a trade signal, a literacy checkpoint before you rebalance.",
      ],
      actionLabel: "View AI lens",
      actionRoute: "/lenses/ai-infrastructure",
    });
  }

  if (xray.gaps.length > 0) {
    const g = xray.gaps[0];
    briefs.push({
      id: "evt-gap",
      headline: `Gap: ${g.title} under-expressed`,
      ago: "Today",
      context: "You matched this theme in onboarding but your holdings don't express it much yet.",
      bullets: [
        g.message,
        "Browse Investor Lenses for an educational target allocation to compare against.",
        "Duel two ETFs in the same theme to see expense ratio and overlap.",
      ],
      actionLabel: "Browse lenses",
      actionRoute: "/lenses",
    });
  }

  if (holdings.length > 0) {
    briefs.push({
      id: "evt-famous-lenses",
      headline: "See how your book compares to famous portfolios",
      ago: "This week",
      context:
        "Model portfolios inspired by Buffett, Dalio, Aschenbrenner, Huang, Pelosi, Lynch, and Wood, educational targets, not copy-trading.",
      bullets: [
        "Open any lens to see target weights vs what you actually hold.",
        "Use alignment score and gaps before chasing a headline allocation.",
        "Duel overlapping names if a lens doubles down on tech you already own.",
      ],
      tags: ["lenses", "education"],
      actionLabel: "Famous portfolios",
      actionRoute: "/lenses",
      secondaryActionLabel: "Buffett-style lens",
      secondaryActionRoute: "/lenses/buffett-quality",
    });
  }

  if (holdings.length === 0) {
    briefs.push({
      id: "evt-connect",
      headline: "Connect a book to unlock tailored briefs",
      ago: "Today",
      context: "Event briefs use your holdings to flag overlap, gaps, and lens alignment.",
      bullets: [
        "Load demo data from Accounts or X-Ray for tonight's walkthrough.",
        "Overlap detection improves once weights are visible.",
      ],
      tags: ["setup"],
      actionLabel: "Portfolio X-Ray",
      actionRoute: "/xray",
    });
  }

  if (themeIds.includes("income") && holdings.length > 0) {
    const hasIncome = holdings.some((h) => ["SCHD", "VYM", "JNJ", "KO", "PG"].includes(h.symbol));
    if (!hasIncome) {
      briefs.push({
        id: "evt-income-gap",
        headline: "Income theme matched, yield sleeve missing?",
        ago: "Today",
        context: "You selected income as a thesis theme but hold few dividend-focused names.",
        bullets: [
          "Compare SCHD vs VYM in Duel for expense and overlap.",
          "Quality income lens shows an illustrative 45/25 ETF core split.",
        ],
        tags: ["income", "gap"],
        actionLabel: "Income lens",
        actionRoute: "/lenses/quality-income",
        secondaryActionLabel: "Duel SCHD vs VYM",
        secondaryActionRoute: "/duel?a=SCHD&b=VYM",
      });
    }
  }

  if (profile.hasHighInterestDebt) {
    briefs.push({
      id: "evt-rates",
      headline: "Rate headline: debt payoff vs new contributions",
      ago: "1d ago",
      context: "When yields stay elevated, the hurdle rate for new risk assets rises for indebted households.",
      bullets: [
        "Paying down high-APR debt often beats expected equity returns on the same dollars.",
        "If investing anyway, prefer lower-volatility sleeves until debt is manageable.",
      ],
      actionLabel: "Credit hub",
      actionRoute: "/credit",
    });
  }

  return briefs;
}

/** Tailored briefs from profile + holdings + themes (illustrative “live event” layer). */
export function eventBriefsForContext(
  profile: UserProfile,
  themeIds: ThemeId[],
  holdings: Holding[],
  watchlist: string[] = [],
  limit = 4
): EventBrief[] {
  return buildAllEventBriefs(profile, themeIds, holdings, watchlist).slice(0, limit);
}

export function eventBriefById(
  id: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  holdings: Holding[],
  watchlist: string[] = []
): EventBrief | undefined {
  return buildAllEventBriefs(profile, themeIds, holdings, watchlist).find((b) => b.id === id);
}
