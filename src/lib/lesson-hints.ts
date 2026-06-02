import type { RadarSearchTemplateId } from "@/data/radar-search-templates";
import type { CategoryBreakdown } from "@/lib/thesis-score";

export type LessonHint = {
  lessonId: string;
  courseId: string;
  title: string;
};

const BY_CONCEPT: Record<string, LessonHint> = {
  volatility: {
    lessonId: "rv-volatility-fee",
    courseId: "risk-volatility",
    title: "Volatility is the fee",
  },
  "risk-vs-return": {
    lessonId: "rv-margin-safety",
    courseId: "risk-volatility",
    title: "Margin of safety",
  },
  diversification: {
    lessonId: "ib-diversification-risk",
    courseId: "investing-building-blocks",
    title: "Diversification",
  },
  "dollar-cost-averaging": {
    lessonId: "ra-dollar-cost-averaging",
    courseId: "retirement-accounts",
    title: "Dollar-cost averaging",
  },
  bitcoin: {
    lessonId: "btc-portfolio-context",
    courseId: "bitcoin-101",
    title: "Bitcoin in a portfolio",
  },
};

export function lessonHintForRadar(templateId: RadarSearchTemplateId): LessonHint | null {
  if (templateId === "relative-valuation") {
    return {
      lessonId: "rv-margin-safety",
      courseId: "risk-volatility",
      title: "Margin of safety in practice",
    };
  }
  if (templateId === "conviction-dossier") {
    return {
      lessonId: "beh-reasonable",
      courseId: "behavioral-investing",
      title: "Reasonable > rational (conviction)",
    };
  }
  return {
    lessonId: "beh-reasonable",
    courseId: "behavioral-investing",
    title: "Reasonable > rational",
  };
}

export function lessonHintFromBreakdown(
  breakdown: CategoryBreakdown[] | undefined
): LessonHint | null {
  if (!breakdown?.length) return null;
  const weak = [...breakdown].sort((a, b) => a.score - b.score)[0];
  if (weak.category === "alignment") {
    return {
      lessonId: "ib-what-are-duels",
      courseId: "investing-building-blocks",
      title: "Find your investing game",
    };
  }
  if (weak.category === "risk-fit") {
    return BY_CONCEPT["risk-vs-return"];
  }
  if (weak.category === "horizon-fit") {
    return {
      lessonId: "ra-time-horizon",
      courseId: "retirement-accounts",
      title: "Time horizon",
    };
  }
  return BY_CONCEPT.diversification;
}

export function lessonPath(hint: LessonHint): string {
  return `/courses/${hint.courseId}/${hint.lessonId}`;
}
