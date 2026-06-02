import type {
  Concern,
  Horizon,
  IncomeNeed,
  Interest,
  RiskTolerance,
  UserProfile,
  Value,
} from "@/store/types";

export type QuestionId = keyof UserProfile;

export type ChoiceOption<T> = {
  value: T;
  label: string;
  hint?: string;
  /** Glossary id, shows ? bubble with definition */
  termId?: string;
};

export type Step = {
  id: string;
  title: string;
  subtitle: string;
  questions: QuestionDef[];
};

export type QuestionDef =
  | {
      kind: "choice";
      id: QuestionId;
      prompt: string;
      help?: string;
      options: ChoiceOption<any>[];
    }
  | {
      kind: "multichoice";
      id: QuestionId;
      prompt: string;
      help?: string;
      options: ChoiceOption<any>[];
      min?: number;
      max?: number;
    }
  | {
      kind: "number";
      id: QuestionId;
      prompt: string;
      help?: string;
      placeholder?: string;
      min?: number;
      max?: number;
    }
  | {
      kind: "bool";
      id: QuestionId;
      prompt: string;
      help?: string;
    };

export const STEPS: Step[] = [
  {
    id: "situation",
    title: "Your situation",
    subtitle: "A few baseline facts so the rest of the app stays grounded.",
    questions: [
      {
        kind: "number",
        id: "age",
        prompt: "How old are you?",
        placeholder: "e.g. 32",
        min: 16,
        max: 100,
      },
      {
        kind: "number",
        id: "netInvestable",
        prompt: "Roughly how much can you put to work in markets right now?",
        help: "Ballpark is fine, money already invested counts.",
        placeholder: "USD",
        min: 0,
      },
      {
        kind: "number",
        id: "monthlyContribution",
        prompt: "How much can you add per month, on average?",
        placeholder: "USD / month",
        min: 0,
      },
      {
        kind: "bool",
        id: "hasEmergencyFund",
        prompt: "Do you have ~3 months of expenses in cash?",
        help: "If not, that usually comes before investing.",
      },
      {
        kind: "bool",
        id: "hasHighInterestDebt",
        prompt: "Any high-interest debt (credit cards, payday loans)?",
        help: "Paying it down often beats expected market returns.",
      },
    ],
  },
  {
    id: "goals",
    title: "What you want",
    subtitle: "Goals shape what we surface, be honest, not aspirational.",
    questions: [
      {
        kind: "choice",
        id: "primaryGoal",
        prompt: "What's the main job for this money?",
        options: [
          { value: "retirement", label: "Long-term retirement" },
          { value: "wealth", label: "General wealth building" },
          { value: "house", label: "Save for a big purchase (house, etc.)" },
          { value: "income", label: "Generate income now" },
          { value: "exploration", label: "Learn / explore the market" },
        ],
      },
      {
        kind: "choice",
        id: "horizon",
        prompt: "When do you actually need this money?",
        options: [
          { value: "short", label: "Within 3 years" },
          { value: "medium", label: "3–7 years" },
          { value: "long", label: "7–15 years" },
          { value: "very-long", label: "15+ years" },
        ] as ChoiceOption<Horizon>[],
      },
      {
        kind: "choice",
        id: "targetReturn",
        prompt: "What kind of return are you targeting?",
        help: "Higher targets require accepting bigger drawdowns.",
        options: [
          { value: "conservative", label: "Preserve capital + modest growth (~5%/yr)" },
          { value: "moderate", label: "Solid long-term growth (~7–9%/yr)" },
          { value: "aggressive", label: "Maximize growth, accept big swings (10%+/yr)" },
        ],
      },
    ],
  },
  {
    id: "temperament",
    title: "How you behave",
    subtitle: "The honest answer here matters more than the optimistic one.",
    questions: [
      {
        kind: "choice",
        id: "risk",
        prompt: "How would you describe your risk tolerance?",
        options: [
          { value: "very-low", label: "I can't handle losing money" },
          { value: "low", label: "Small declines (5–10%) make me nervous" },
          { value: "medium", label: "I can ride out 20% drawdowns" },
          { value: "high", label: "I can stomach 30–40% drawdowns" },
          { value: "very-high", label: "Volatility doesn't bother me at all" },
        ] as ChoiceOption<RiskTolerance>[],
      },
      {
        kind: "choice",
        id: "reactionToDrawdown",
        prompt: "Your portfolio drops 25% in a month. What do you do?",
        options: [
          { value: "panic-sell", label: "Sell, I can't watch it" },
          { value: "hold", label: "Hold and try not to look" },
          { value: "buy-more", label: "Buy more, sale prices" },
        ],
      },
      {
        kind: "choice",
        id: "experience",
        prompt: "How much investing experience do you have?",
        options: [
          { value: "none", label: "Brand new" },
          { value: "some", label: "Some, I've owned funds or stocks" },
          { value: "experienced", label: "Experienced, I've held through cycles" },
        ],
      },
    ],
  },
  {
    id: "interests",
    title: "What you care about",
    subtitle: "We use these to bias toward themes that resonate with you.",
    questions: [
      {
        kind: "multichoice",
        id: "interests",
        prompt: "What themes interest you? Pick any.",
        min: 0,
        max: 6,
        options: [
          { value: "climate", label: "Climate & clean energy" },
          { value: "ai", label: "AI & computing infrastructure" },
          { value: "aging", label: "Aging populations & healthcare" },
          { value: "crypto", label: "Crypto & digital assets" },
          { value: "biotech", label: "Biotech & longevity" },
          { value: "consumer-brands", label: "Consumer brands you actually use" },
          { value: "international", label: "International / emerging markets" },
          { value: "small-companies", label: "Small, underfollowed companies" },
          { value: "cybersecurity", label: "Cybersecurity" },
          { value: "real-assets", label: "Real assets (real estate, infrastructure)" },
        ] as ChoiceOption<Interest>[],
      },
      {
        kind: "multichoice",
        id: "concerns",
        prompt: "What are you worried about?",
        min: 0,
        max: 4,
        options: [
          { value: "inflation", label: "Persistent inflation" },
          { value: "recession", label: "Recession" },
          { value: "market-crash", label: "Major market crash" },
          { value: "geopolitical", label: "Geopolitical risk" },
          { value: "regulation", label: "Tech regulation" },
          { value: "missing-out", label: "Missing the next big thing" },
        ] as ChoiceOption<Concern>[],
      },
      {
        kind: "multichoice",
        id: "values",
        prompt: "Any values you want reflected?",
        min: 0,
        max: 3,
        options: [
          { value: "esg", label: "ESG / sustainability lean" },
          { value: "made-in-america", label: "US-domiciled companies" },
          { value: "avoid-fossil", label: "Avoid fossil fuels" },
          { value: "avoid-tobacco-weapons", label: "Avoid tobacco / weapons" },
          { value: "no-preference", label: "No preference" },
        ] as ChoiceOption<Value>[],
      },
      {
        kind: "choice",
        id: "incomeNeed",
        prompt: "Do you need this portfolio to produce income now?",
        options: [
          { value: "none", label: "No, I'm growing wealth" },
          { value: "some", label: "Some, a little yield would be nice" },
          { value: "primary", label: "Yes, income is the point" },
        ] as ChoiceOption<IncomeNeed>[],
      },
    ],
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  netInvestable: 10000,
  monthlyContribution: 500,
  hasEmergencyFund: true,
  hasHighInterestDebt: false,
  primaryGoal: "wealth",
  horizon: "long",
  targetReturn: "moderate",
  risk: "medium",
  reactionToDrawdown: "hold",
  experience: "some",
  interests: [],
  concerns: [],
  values: [],
  incomeNeed: "none",
};
