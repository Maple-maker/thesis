import type { ChoiceOption } from "@/data/questionnaire";
import type { CfoSectionId } from "@/types/cfo-profile";
import type {
  Concern,
  Horizon,
  IncomeNeed,
  Interest,
  RiskTolerance,
  Value,
} from "@/store/types";

export type BuilderQuestion =
  | {
      kind: "choice";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
      options: ChoiceOption<unknown>[];
    }
  | {
      kind: "multichoice";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
      options: ChoiceOption<unknown>[];
      min?: number;
      max?: number;
    }
  | {
      kind: "number";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
      placeholder?: string;
      min?: number;
      max?: number;
    }
  | {
      kind: "bool";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
    }
  | {
      kind: "scale";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
      min?: number;
      max?: number;
      lowLabel?: string;
      highLabel?: string;
    }
  | {
      kind: "text";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
      placeholder?: string;
    }
  | {
      kind: "us-state";
      path: string;
      prompt: string;
      help?: string;
      termId?: string;
    };

export type ThesisBuilderChapter = {
  id: string;
  sectionIds: CfoSectionId[];
  title: string;
  subtitle: string;
  essential: boolean;
  questions: BuilderQuestion[];
};

export const THESIS_BUILDER_CHAPTERS: ThesisBuilderChapter[] = [
  {
    id: "situation",
    sectionIds: ["identity", "liquidity"],
    title: "Your situation",
    subtitle: "Baseline facts so every insight stays grounded in your life.",
    essential: true,
    questions: [
      { kind: "number", path: "age", prompt: "How old are you?", min: 16, max: 100 },
      {
        kind: "choice",
        path: "extended.identity.employmentStatus",
        prompt: "Employment status",
        options: [
          { value: "employed", label: "Employed" },
          { value: "self-employed", label: "Self-employed" },
          { value: "student", label: "Student" },
          { value: "retired", label: "Retired" },
          { value: "unemployed", label: "Between jobs" },
        ],
      },
      {
        kind: "choice",
        path: "extended.identity.militaryStatus",
        prompt: "Military status (if any)",
        help:
          "If you serve or served, Thesis surfaces SCRA, TSP/Roth TSP, SDP, combat-zone tax (CZTE), and related official resources on Home and Builder.",
        options: [
          { value: "none", label: "None" },
          { value: "active", label: "Active duty" },
          { value: "veteran", label: "Veteran" },
          { value: "reserve", label: "Reserve / Guard" },
        ],
      },
      {
        kind: "us-state",
        path: "extended.identity.stateProvince",
        prompt: "State of residence (tax)",
        termId: "state-tax-residency",
        help: "Used for state tax context and educational planning, pick where you file as resident today.",
      },
      {
        kind: "number",
        path: "netInvestable",
        prompt: "Investable assets today (USD)",
        termId: "investable-assets",
        help: "Brokerage + retirement + cash earmarked for investing.",
        min: 0,
      },
      { kind: "number", path: "monthlyContribution", prompt: "Typical monthly contribution (USD)", min: 0 },
      {
        kind: "bool",
        path: "hasEmergencyFund",
        prompt: "~3 months expenses in cash?",
        termId: "emergency-fund",
        help: "Usually before maxing risk assets.",
      },
      {
        kind: "bool",
        path: "hasHighInterestDebt",
        prompt: "High-interest debt (cards, payday)?",
        termId: "high-interest-debt",
      },
    ],
  },
  {
    id: "goals",
    sectionIds: ["goals"],
    title: "Financial goals",
    subtitle: "What this money is for, honest beats aspirational.",
    essential: true,
    questions: [
      {
        kind: "choice",
        path: "primaryGoal",
        prompt: "Primary goal",
        options: [
          { value: "retirement", label: "Retirement" },
          { value: "wealth", label: "Wealth building" },
          { value: "house", label: "Major purchase (home, etc.)" },
          { value: "income", label: "Income now" },
          { value: "exploration", label: "Learn / explore" },
        ],
      },
      {
        kind: "multichoice",
        path: "extended.goals.secondaryGoals",
        prompt: "Secondary goals (any)",
        min: 0,
        max: 5,
        options: [
          { value: "early-retirement", label: "Early retirement" },
          { value: "tax-min", label: "Tax efficiency" },
          { value: "college", label: "College funding" },
          { value: "real-estate", label: "Real estate" },
          { value: "charitable", label: "Charitable giving" },
          { value: "preservation", label: "Capital preservation", termId: "capital-preservation" },
        ],
      },
      {
        kind: "number",
        path: "extended.expenses.monthlyExpenses",
        prompt: "Monthly expenses, your burn rate (USD)",
        termId: "burn-rate",
        help: "What you spend each month to live (housing, food, debt payments, etc.). We use this for net-worth suggestions below.",
        min: 0,
      },
      {
        kind: "number",
        path: "extended.goals.targetNetWorth",
        prompt: "Target net worth (USD)",
        termId: "target-net-worth",
        help: "Optional number, tap a suggestion below (4× or 25× annual burn) or enter your own goal.",
        placeholder: "USD",
        min: 0,
      },
      { kind: "number", path: "extended.goals.retirementAgeGoal", prompt: "Target retirement age", min: 50, max: 80 },
    ],
  },
  {
    id: "horizon",
    sectionIds: ["timeHorizon"],
    title: "Time horizon",
    subtitle: "When you need money sets how much risk you can take.",
    essential: true,
    questions: [
      {
        kind: "choice",
        path: "horizon",
        prompt: "Overall investment horizon",
        termId: "time-horizon",
        options: [
          { value: "short", label: "Within 3 years" },
          { value: "medium", label: "3–7 years" },
          { value: "long", label: "7–15 years" },
          { value: "very-long", label: "15+ years" },
        ] as ChoiceOption<Horizon>[],
      },
      { kind: "number", path: "extended.timeHorizon.investmentTimeHorizonYears", prompt: "Years until you need most of this capital", min: 1, max: 50 },
      { kind: "text", path: "extended.timeHorizon.goalSpecificHorizons", prompt: "Goal-specific timelines", placeholder: "e.g. House: 3y, Retirement: 25y", help: "One line per goal is fine." },
    ],
  },
  {
    id: "risk",
    sectionIds: ["risk"],
    title: "Risk profile",
    subtitle: "Drawdowns are inevitable — the dot-com crash (−51%), 2008 (−57%), even 2020's 34% plunge all recovered. Long time horizons turn temporary drops into noise.",
    essential: true,
    questions: [
      {
        kind: "choice",
        path: "risk",
        prompt: "Self-assessed risk tolerance",
        termId: "risk-tolerance",
        options: [
          { value: "very-low", label: "Very low" },
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "very-high", label: "Very high" },
        ] as ChoiceOption<RiskTolerance>[],
      },
      {
        kind: "scale",
        path: "extended.risk.maximumAcceptableDrawdown",
        prompt: "Max drawdown still comfortable (%)",
        termId: "drawdown",
        min: 5,
        max: 50,
        lowLabel: "-5%",
        highLabel: "-50%",
      },
      {
        kind: "scale",
        path: "extended.risk.sleepAtNightThreshold",
        prompt: "Sleep-at-night threshold (portfolio drop %)",
        termId: "sleep-at-night",
        min: 5,
        max: 40,
      },
      {
        kind: "choice",
        path: "reactionToDrawdown",
        prompt: "Portfolio drops 25% in a month, you…",
        options: [
          { value: "panic-sell", label: "Sell" },
          { value: "hold", label: "Hold" },
          { value: "buy-more", label: "Buy more" },
        ],
      },
      {
        kind: "choice",
        path: "extended.risk.leverageTolerance",
        prompt: "Leverage tolerance",
        termId: "leverage",
        options: [
          { value: "none", label: "None" },
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
        ],
      },
    ],
  },
  {
    id: "behavior",
    sectionIds: ["behavioral"],
    title: "How you behave",
    subtitle: "Psychology often beats spreadsheets.",
    essential: true,
    questions: [
      {
        kind: "choice",
        path: "experience",
        prompt: "Investing experience",
        options: [
          { value: "none", label: "Brand new" },
          { value: "some", label: "Some" },
          { value: "experienced", label: "Experienced" },
        ],
      },
      {
        kind: "choice",
        path: "extended.behavioral.investmentPhilosophy",
        prompt: "Investment philosophy (closest fit)",
        options: [
          { value: "index", label: "Index / passive" },
          { value: "value", label: "Value" },
          { value: "growth", label: "Growth" },
          { value: "income", label: "Income" },
          { value: "crypto-maximalist", label: "Bitcoin / crypto focused" },
          { value: "exploring", label: "Still exploring" },
        ],
      },
      { kind: "bool", path: "extended.behavioral.panicSellHistory", prompt: "Have you panic-sold before?" },
      {
        kind: "scale",
        path: "extended.behavioral.fomoTendency",
        prompt: "FOMO tendency (1–10)",
        termId: "fomo",
        min: 1,
        max: 10,
      },
      {
        kind: "choice",
        path: "extended.behavioral.decisionStyle",
        prompt: "Decision style",
        options: [
          { value: "analytical", label: "Analytical" },
          { value: "intuitive", label: "Intuitive" },
          { value: "collaborative", label: "Collaborative" },
          { value: "delegator", label: "Prefer delegation" },
        ],
      },
    ],
  },
  {
    id: "cashflow",
    sectionIds: ["income", "expenses"],
    title: "Income & expenses",
    subtitle: "Cash flow is the engine, investments ride on top.",
    essential: true,
    questions: [
      { kind: "number", path: "extended.income.grossIncome", prompt: "Annual gross income (USD)", min: 0 },
      { kind: "scale", path: "extended.income.incomeStabilityRating", prompt: "Income stability (1–10)", min: 1, max: 10 },
      {
        kind: "scale",
        path: "extended.expenses.savingsRate",
        prompt: "Savings rate (% of take-home)",
        termId: "savings-rate",
        min: 0,
        max: 80,
      },
    ],
  },
  {
    id: "balance",
    sectionIds: ["balanceSheet"],
    title: "Balance sheet (snapshot)",
    subtitle: "Assets and liabilities, ballpark is fine.",
    essential: false,
    questions: [
      { kind: "number", path: "extended.balanceSheet.cash", prompt: "Cash & equivalents", min: 0 },
      { kind: "number", path: "extended.balanceSheet.retirementAccounts", prompt: "Retirement accounts", min: 0 },
      { kind: "number", path: "extended.balanceSheet.mortgageBalance", prompt: "Mortgage balance", min: 0 },
      { kind: "number", path: "extended.balanceSheet.creditCards", prompt: "Credit card debt", min: 0 },
    ],
  },
  {
    id: "portfolio",
    sectionIds: ["portfolio", "construction"],
    title: "Portfolio & preferences",
    subtitle: "What you hold and how you want to construct exposure.",
    essential: true,
    questions: [
      { kind: "number", path: "extended.portfolio.portfolioValue", prompt: "Total portfolio value (USD)", min: 0 },
      {
        kind: "choice",
        path: "targetReturn",
        prompt: "Return target",
        options: [
          { value: "conservative", label: "Conservative" },
          { value: "moderate", label: "Moderate" },
          { value: "aggressive", label: "Aggressive" },
        ],
      },
      {
        kind: "scale",
        path: "extended.construction.growthFocus",
        prompt: "Growth focus (1–10)",
        termId: "growth-focus",
        min: 1,
        max: 10,
      },
      {
        kind: "scale",
        path: "extended.construction.incomeFocus",
        prompt: "Income focus (1–10)",
        termId: "income-focus",
        min: 1,
        max: 10,
      },
      {
        kind: "scale",
        path: "extended.construction.capitalPreservationFocus",
        prompt: "Capital preservation (1–10)",
        termId: "capital-preservation",
        min: 1,
        max: 10,
      },
      {
        kind: "choice",
        path: "incomeNeed",
        prompt: "Need portfolio income now?",
        options: [
          { value: "none", label: "No" },
          { value: "some", label: "Some" },
          { value: "primary", label: "Primary" },
        ] as ChoiceOption<IncomeNeed>[],
      },
    ],
  },
  {
    id: "constraints",
    sectionIds: ["restrictions"],
    title: "Constraints & values",
    subtitle: "What Thesis should never recommend.",
    essential: true,
    questions: [
      {
        kind: "multichoice",
        path: "interests",
        prompt: "What topics interest you?",
        help: "Pick what resonates, not just tech. We'll balance recommendations across your picks.",
        min: 0,
        max: 8,
        options: [
          {
            value: "broad-index",
            label: "Broad market / index funds",
            hint: "S&P 500, total market",
            termId: "index-funds",
          },
          {
            value: "quality-blue-chip",
            label: "Quality & blue-chip compounders",
            termId: "compounders",
          },
          { value: "dividends", label: "Dividends & steady income", termId: "income-focus" },
          { value: "consumer-brands", label: "Brands you use every day" },
          { value: "healthcare", label: "Healthcare & life sciences" },
          { value: "aging", label: "Aging populations" },
          { value: "international", label: "International / global", termId: "foreign-exposure" },
          { value: "emerging-markets", label: "Emerging markets", termId: "emerging-markets" },
          { value: "real-assets", label: "Real assets (REITs, infrastructure)", termId: "reit" },
          { value: "housing-reits", label: "Housing & REITs", termId: "reit" },
          { value: "energy-commodities", label: "Energy & commodities" },
          { value: "climate", label: "Climate & clean energy" },
          { value: "ai", label: "AI & semiconductors" },
          { value: "cybersecurity", label: "Cybersecurity" },
          { value: "defense", label: "Defense & aerospace" },
          { value: "fintech-payments", label: "Fintech & payments" },
          { value: "biotech", label: "Biotech & genomics" },
          { value: "small-companies", label: "Smaller / underfollowed companies" },
          { value: "crypto", label: "Crypto & digital assets" },
        ] as ChoiceOption<Interest>[],
      },
      {
        kind: "multichoice",
        path: "concerns",
        prompt: "Top worries",
        min: 0,
        max: 4,
        options: [
          { value: "inflation", label: "Inflation" },
          { value: "recession", label: "Recession" },
          { value: "market-crash", label: "Market crash" },
          { value: "geopolitical", label: "Geopolitical" },
          { value: "missing-out", label: "FOMO / missing out", termId: "fomo" },
        ] as ChoiceOption<Concern>[],
      },
      {
        kind: "multichoice",
        path: "values",
        prompt: "Screening preferences (optional)",
        help: "ESG = environmental, social, and governance factors, favoring companies scored as responsible.",
        min: 0,
        max: 3,
        options: [
          {
            value: "esg",
            label: "Prefer responsible companies (ESG)",
            hint: "Environmental, social & governance scores",
          },
          { value: "avoid-fossil", label: "Avoid fossil fuels" },
          { value: "avoid-tobacco-weapons", label: "Avoid tobacco / weapons" },
          { value: "made-in-america", label: "Prefer US-domiciled companies" },
          { value: "no-preference", label: "No screening preference" },
        ] as ChoiceOption<Value>[],
      },
      { kind: "text", path: "extended.restrictions.industryAvoidanceList", prompt: "Industries to avoid", placeholder: "e.g. tobacco, gambling" },
    ],
  },
  {
    id: "communication",
    sectionIds: ["communication", "personalization"],
    title: "Your AI CFO style",
    subtitle: "How Thesis should research and talk to you.",
    essential: false,
    questions: [
      {
        kind: "choice",
        path: "extended.communication.reportingFrequency",
        prompt: "Briefing frequency",
        options: [
          { value: "daily", label: "Daily digest" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ],
      },
      {
        kind: "choice",
        path: "extended.communication.communicationStyle",
        prompt: "Communication style",
        options: [
          { value: "direct", label: "Direct & concise" },
          { value: "educational", label: "Educational" },
          { value: "coaching", label: "Coaching" },
        ],
      },
      { kind: "text", path: "extended.personalization.favoriteInvestors", prompt: "Investors you admire", placeholder: "e.g. Buffett, Dalio" },
    ],
  },
];

export const ESSENTIAL_CHAPTER_COUNT = THESIS_BUILDER_CHAPTERS.filter((c) => c.essential).length;
