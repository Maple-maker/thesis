import type { ConceptId } from "./concepts";
import type { CourseId, Lesson } from "./courses";

export type LearningProvider = "youtube" | "khan" | "other";

export type LearningResource = {
  id: string;
  provider: LearningProvider;
  title: string;
  channel: string;
  url: string;
  duration?: string;
};

/** Khan Academy + trusted channels, opens in browser. */
const KHAN_BY_CONCEPT: Partial<Record<ConceptId, LearningResource[]>> = {
  "compound-interest": [
    {
      id: "khan-compound",
      provider: "khan",
      title: "Compound interest basics",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/compound-interest-tutorial/v/compound-interest-introduction",
      duration: "6 min",
    },
  ],
  "interest-rate": [
    {
      id: "khan-interest",
      provider: "khan",
      title: "Introduction to interest",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/interest-basics-tutorial/v/introduction-to-interest",
      duration: "5 min",
    },
  ],
  inflation: [
    {
      id: "khan-inflation",
      provider: "khan",
      title: "Inflation overview",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/inflation-tutorial/inflation-basics-tutorial/v/inflation-overview",
      duration: "8 min",
    },
  ],
  "credit-score": [
    {
      id: "khan-credit",
      provider: "khan",
      title: "Credit scores & reports",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance/pf-credit/pf-credit-score-and-reports/a/credit-scores-and-reports",
      duration: "10 min",
    },
  ],
  "roth-vs-traditional": [
    {
      id: "khan-retirement",
      provider: "khan",
      title: "Retirement accounts",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance/pf-saving-and-budgeting/pf-retirement-accounts/a/retirement-accounts",
      duration: "12 min",
    },
  ],
  "dollar-cost-averaging": [
    {
      id: "khan-dca",
      provider: "khan",
      title: "Investing: dollar-cost averaging",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance/pf-investing/pf-investing-basics/a/dollar-cost-averaging",
      duration: "7 min",
    },
  ],
  diversification: [
    {
      id: "khan-diversify",
      provider: "khan",
      title: "Diversification and risk",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/stock-valuation-and-investment-decisions/risk-and-return-tutorial/v/diversification",
      duration: "9 min",
    },
  ],
  "what-is-etf": [
    {
      id: "khan-etf",
      provider: "khan",
      title: "Mutual funds and ETFs",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/economics-finance-domain/core-finance/stock-valuation-and-investment-decisions/investment-vehicles-tutorial/v/mutual-funds-and-etf",
      duration: "8 min",
    },
  ],
};

const BY_COURSE: Partial<Record<CourseId, LearningResource[]>> = {
  "money-foundations": [
    {
      id: "khan-finance-intro",
      provider: "khan",
      title: "Personal finance course",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance",
      duration: "Multi-unit",
    },
  ],
  "credit-borrowing": [
    {
      id: "khan-credit-unit",
      provider: "khan",
      title: "Credit & borrowing unit",
      channel: "Khan Academy",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance/pf-credit",
      duration: "Multi-lesson",
    },
  ],
};

export function khanForConcept(conceptId: ConceptId): LearningResource[] {
  return KHAN_BY_CONCEPT[conceptId] ?? [];
}

export function collectConceptIdsFromLesson(lesson: Lesson): ConceptId[] {
  const ids = new Set<ConceptId>();
  for (const step of lesson.steps) {
    if (step.kind === "content" && step.conceptLinks) {
      step.conceptLinks.forEach((c) => ids.add(c));
    }
  }
  return [...ids];
}
