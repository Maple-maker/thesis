import type { ModelThesis, ThesisRadarReport } from "@/store/index";
import { isPieCustomized } from "@/types/pie-customization";
import type { CfoProfile } from "@/types/cfo-profile";
import type { ThemeId } from "@/store/types";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export type TodayActionKind =
  | "lesson"
  | "duel"
  | "scenario"
  | "radar-revisit"
  | "builder"
  | "watchlist"
  | "pie"
  | "thesis-model";

export type TodayForThesisAction = {
  id: string;
  kind: TodayActionKind;
  title: string;
  subtitle: string;
  route: string;
  params?: Record<string, string>;
};

export function dueRadarRevisits(reports: ThesisRadarReport[]): ThesisRadarReport[] {
  const now = Date.now();
  return reports.filter((r) => {
    const due = r.revisitAt ?? r.createdAt + NINETY_DAYS_MS;
    return due <= now;
  });
}

function firstModelStock(model: ModelThesis): string | null {
  const stock = model.holdings.find((h) => h.kind === "stock");
  return stock?.symbol.toUpperCase() ?? null;
}

/**
 * One next best action for Home, ordered for the conviction loop:
 * themes → save book → customize pie → research → duel → watchlist.
 */
export function pickTodayForThesis(input: {
  profile: CfoProfile;
  themeIds: ThemeId[];
  watchlist: string[];
  modelThesis: ModelThesis | null;
  completedLessons: string[];
  journalCount: number;
}): TodayForThesisAction | null {
  const { themeIds, watchlist, modelThesis, completedLessons, journalCount } = input;

  const due = modelThesis ? dueRadarRevisits(modelThesis.radarReports) : [];
  if (due.length > 0) {
    const r = due[0];
    return {
      id: "radar-revisit",
      kind: "radar-revisit",
      title: `Revisit: ${r.title}`,
      subtitle: "90-day check, does this still fit your thesis?",
      route: "/thesis-model",
    };
  }

  if (themeIds.length === 0) {
    return {
      id: "builder-themes",
      kind: "builder",
      title: "Choose your 2 theses",
      subtitle: "Everything else builds on a clear point of view",
      route: "/(tabs)/builder",
    };
  }

  if (!modelThesis) {
    return {
      id: "builder-save",
      kind: "builder",
      title: "Build & save your model book",
      subtitle: "M1-style pie from your themes, then customize weights",
      route: "/(tabs)/builder/portfolio",
    };
  }

  if (!isPieCustomized(modelThesis.pieCustomization)) {
    return {
      id: "pie-customize",
      kind: "pie",
      title: "Customize your allocation pie",
      subtitle: "Dry powder, caps, or rebalance, make the book yours",
      route: "/(tabs)/builder/portfolio",
    };
  }

  const sym = firstModelStock(modelThesis);
  if (sym && modelThesis.radarReports.length === 0) {
    return {
      id: "radar-first",
      kind: "thesis-model",
      title: `Run conviction dossier on ${sym}`,
      subtitle: "Bull/bear + key metric nested in your thesis",
      route: "/(tabs)/watchlist",
      params: { radarSymbol: sym, radarTemplate: "conviction-dossier" },
    };
  }

  if (themeIds.length >= 2 && watchlist.length >= 2 && journalCount < 2) {
    return {
      id: "duel-today",
      kind: "duel",
      title: "Run a conviction duel",
      subtitle: `Compare ${watchlist[0]} vs ${watchlist[1]}, capture what changed your mind`,
      route: "/duel",
      params: { a: watchlist[0], b: watchlist[1] },
    };
  }

  if (modelThesis.appliedLifeScenarios.length > 0) {
    return {
      id: "scenario-review",
      kind: "scenario",
      title: "Review stress-tested book",
      subtitle: `${modelThesis.appliedLifeScenarios.length} life scenario(s) on your model`,
      route: "/thesis-model",
    };
  }

  if (watchlist.length < 2) {
    return {
      id: "watchlist-search",
      kind: "watchlist",
      title: "Search names for your thesis",
      subtitle: "We'll show thesis-fit before you add to the book",
      route: "/(tabs)/watchlist",
    };
  }

  if (!completedLessons.includes("ib-diversification-risk") && themeIds.length > 0) {
    return {
      id: "lesson-div",
      kind: "lesson",
      title: "5 min: diversification",
      subtitle: "Core idea before you size any single name",
      route: "/courses/investing-building-blocks/ib-diversification-risk",
    };
  }

  return {
    id: "thesis-model-home",
    kind: "thesis-model",
    title: "Open your thesis model",
    subtitle: "Life scenarios · radar · conviction journal",
    route: "/thesis-model",
  };
}
