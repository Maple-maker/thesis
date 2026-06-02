import type { ConceptId } from "@/data/concepts";
import type { CourseId, LessonStep } from "@/data/courses";
import {
  CONCEPT_TO_LESSON_IMAGE,
  COURSE_DEFAULT_IMAGE,
  lessonImage,
  type LessonImage,
  type LessonImageKey,
} from "@/data/lesson-images";

const TITLE_HINTS: [RegExp, LessonImageKey][] = [
  [/bond|coupon|treasury|duration/i, "bonds-stack"],
  [/fed|federal reserve|rate cut|rate hike|liquidity/i, "fed-building"],
  [/bitcoin|crypto|blockchain/i, "bitcoin-coin"],
  [/foreign|international|global|emerging|developed market/i, "global-markets"],
  [/diversif|correlation|overlap|rebalanc/i, "diversify-pie"],
  [/tax|capital gain|harvest|after-tax/i, "tax-receipt"],
  [/dividend|yield|payout|income etf/i, "dividend-coins"],
  [/behavior|fomo|panic|psychology/i, "behavior-brain"],
  [/recession|bear market|emergency fund|resilien/i, "recession-umbrella"],
  [/interest|apr|apy|borrow/i, "money-coins"],
  [/compound|growth|double/i, "compound-chart"],
  [/inflation|purchas/i, "inflation-prices"],
  [/time value|horizon/i, "time-horizon"],
  [/credit score|fico/i, "credit-score"],
  [/credit card|utilization/i, "credit-card"],
  [/debt|loan|pay down/i, "debt-balance"],
  [/emergency|savings/i, "savings-jar"],
  [/retire|401|ira|roth/i, "roth-ira"],
  [/brokerage|account open/i, "brokerage"],
  [/dollar.?cost|dca/i, "dca-calendar"],
  [/etf|fund|index/i, "etf-diversify"],
  [/stock|share|equity/i, "stocks-chart"],
  [/beta|drawdown|volatil/i, "risk-volatility"],
  [/theme|thesis/i, "themes-map"],
  [/duel|compare/i, "duel-compare"],
];

export function imageKeyForStep(
  step: LessonStep,
  courseId: CourseId
): LessonImageKey {
  if (step.kind === "quiz") return "quiz-check";

  if (step.imageKey) return step.imageKey;

  const concept = step.conceptLinks?.[0] as ConceptId | undefined;
  if (concept && CONCEPT_TO_LESSON_IMAGE[concept]) {
    return CONCEPT_TO_LESSON_IMAGE[concept]!;
  }

  for (const [re, key] of TITLE_HINTS) {
    if (re.test(step.title) || step.paragraphs.some((p) => re.test(p))) {
      return key;
    }
  }

  return COURSE_DEFAULT_IMAGE[courseId];
}

export function visualForStep(step: LessonStep, courseId: CourseId): LessonImage {
  return lessonImage(imageKeyForStep(step, courseId));
}
