/**
 * AI CFO master profile, sections map to research, radar, and scoring.
 * @see docs/cfo-profile-schema.md
 */

import type {
  Concern,
  Horizon,
  IncomeNeed,
  Interest,
  RiskTolerance,
  UserProfile,
  Value,
} from "@/store/types";

// ─── Section IDs (25 + derived) ─────────────────────────────────────────────

export type CfoSectionId =
  | "identity"
  | "goals"
  | "timeHorizon"
  | "risk"
  | "behavioral"
  | "income"
  | "expenses"
  | "balanceSheet"
  | "tax"
  | "portfolio"
  | "restrictions"
  | "liquidity"
  | "retirement"
  | "estate"
  | "insurance"
  | "career"
  | "family"
  | "realEstate"
  | "business"
  | "alternatives"
  | "construction"
  | "crypto"
  | "communication"
  | "personalization";

export type InvestmentPhilosophy =
  | "index"
  | "value"
  | "growth"
  | "income"
  | "factor"
  | "crypto-maximalist"
  | "balanced"
  | "exploring";

export type DecisionStyle = "analytical" | "intuitive" | "collaborative" | "delegator";

export type SecondaryGoal =
  | "wealth"
  | "early-retirement"
  | "income"
  | "preservation"
  | "tax-min"
  | "college"
  | "real-estate"
  | "business"
  | "charitable";

export type IdentitySection = {
  fullName?: string;
  dateOfBirth?: string;
  countryOfResidence?: string;
  stateProvince?: string;
  citizenship?: string;
  maritalStatus?: "single" | "married" | "partnered" | "divorced" | "widowed";
  dependentsCount?: number;
  employmentStatus?: "employed" | "self-employed" | "unemployed" | "student" | "retired";
  occupation?: string;
  militaryStatus?: "none" | "active" | "veteran" | "reserve";
  retirementStatus?: "pre-retirement" | "semi-retired" | "retired";
};

export type GoalsSection = {
  secondaryGoals?: SecondaryGoal[];
  targetNetWorth?: number;
  financialIndependenceGoal?: boolean;
  retirementAgeGoal?: number;
  annualIncomeGoal?: number;
  passiveIncomeGoal?: number;
  legacyGoal?: boolean;
  charitableGivingGoal?: boolean;
  majorPurchaseGoals?: string;
  goalPriorityRanking?: string;
};

export type TimeHorizonSection = {
  investmentTimeHorizonYears?: number;
  retirementHorizonYears?: number;
  goalSpecificHorizons?: string;
  expectedWithdrawalStartDate?: string;
  liquidityEventTimeline?: string;
};

export type RiskSection = {
  maximumAcceptableDrawdown?: number;
  sleepAtNightThreshold?: number;
  volatilityComfortLevel?: number;
  leverageTolerance?: "none" | "low" | "moderate" | "high";
  concentrationTolerance?: "low" | "medium" | "high";
  speculationTolerance?: "none" | "small" | "moderate" | "high";
  incomeStabilityScore?: number;
};

export type BehavioralSection = {
  panicSellHistory?: boolean;
  fomoTendency?: number;
  overconfidenceScore?: number;
  decisionStyle?: DecisionStyle;
  researchDepthPreference?: number;
  investmentDisciplineScore?: number;
  tradingFrequencyPreference?: "rare" | "occasional" | "active";
  emotionalTriggers?: string;
  pastMistakes?: string;
  investmentPhilosophy?: InvestmentPhilosophy;
};

export type IncomeSection = {
  grossIncome?: number;
  netIncome?: number;
  incomeGrowthExpectation?: "declining" | "flat" | "growing" | "high-growth";
  incomeStabilityRating?: number;
  otherIncomeSources?: string;
};

export type ExpensesSection = {
  monthlyExpenses?: number;
  annualExpenses?: number;
  housingCosts?: number;
  debtPayments?: number;
  savingsRate?: number;
};

export type BalanceSheetSection = {
  cash?: number;
  checking?: number;
  savings?: number;
  brokerageAccounts?: number;
  retirementAccounts?: number;
  realEstate?: number;
  cryptoHoldings?: number;
  mortgageBalance?: number;
  studentLoans?: number;
  creditCards?: number;
  otherLiabilities?: number;
  liquidNetWorth?: number;
  debtToIncomeRatio?: number;
};

export type TaxSection = {
  countryTaxResidency?: string;
  stateTaxResidency?: string;
  federalTaxBracket?: string;
  effectiveTaxRate?: number;
  hasTaxDeferredAccounts?: boolean;
  hasTaxFreeAccounts?: boolean;
};

export type PortfolioSection = {
  portfolioValue?: number;
  cashPosition?: number;
  assetAllocationNotes?: string;
  sectorAllocationNotes?: string;
  activeVsPassive?: "passive" | "blend" | "active";
};

export type RestrictionsSection = {
  ethicalConstraints?: string;
  esgPreferences?: "none" | "light" | "strict";
  industryAvoidanceList?: string;
  optionsPermission?: boolean;
  marginPermission?: boolean;
  cryptoPermission?: boolean;
};

export type LiquiditySection = {
  emergencyFundTarget?: number;
  emergencyFundCurrent?: number;
  upcomingLargeExpenses?: string;
  minimumCashBuffer?: number;
};

export type RetirementSection = {
  desiredRetirementAge?: number;
  retirementSpendingGoal?: number;
  withdrawalRateTarget?: number;
  socialSecurityEstimate?: number;
};

export type EstateSection = {
  willExists?: boolean;
  trustExists?: boolean;
  beneficiariesCurrent?: boolean;
};

export type InsuranceSection = {
  healthInsurance?: boolean;
  lifeInsurance?: boolean;
  disabilityInsurance?: boolean;
  coverageGaps?: string;
};

export type CareerSection = {
  careerField?: string;
  yearsUntilRetirement?: number;
  jobStability?: number;
  futureIncomePotential?: number;
};

export type FamilySection = {
  spouseIncome?: number;
  childrenCount?: number;
  collegeFundingGoals?: boolean;
  eldercareResponsibilities?: boolean;
};

export type RealEstateSection = {
  primaryResidence?: boolean;
  homeEquity?: number;
  rentalProperties?: number;
  futureRealEstateGoals?: string;
};

export type BusinessSection = {
  businessesOwned?: number;
  ownershipPercentages?: string;
  exitPlans?: string;
};

export type AlternativesSection = {
  privateEquity?: boolean;
  ventureCapital?: boolean;
  collectibles?: boolean;
  commodities?: boolean;
};

export type ConstructionSection = {
  growthFocus?: number;
  incomeFocus?: number;
  capitalPreservationFocus?: number;
  preferredAssetClasses?: string;
  rebalancingFrequency?: "annual" | "quarterly" | "opportunistic" | "never";
};

export type CryptoSection = {
  btcConvictionLevel?: number;
  targetBtcAllocation?: number;
  cryptoAllocationLimit?: number;
  bitcoinOnlyOrMulticoin?: "btc-only" | "multicoin" | "none";
};

export type CommunicationSection = {
  researchDepth?: number;
  preferredAnalysisStyle?: "visual" | "narrative" | "data-dense";
  summaryLength?: "brief" | "standard" | "deep";
  reportingFrequency?: "daily" | "weekly" | "monthly";
  communicationStyle?: "direct" | "educational" | "coaching";
};

export type PersonalizationSection = {
  favoriteInvestors?: string;
  trustedSources?: string;
  sectorsFollowed?: string;
  newslettersFollowed?: string;
};

export type CfoExtended = {
  identity?: IdentitySection;
  goals?: GoalsSection;
  timeHorizon?: TimeHorizonSection;
  risk?: RiskSection;
  behavioral?: BehavioralSection;
  income?: IncomeSection;
  expenses?: ExpensesSection;
  balanceSheet?: BalanceSheetSection;
  tax?: TaxSection;
  portfolio?: PortfolioSection;
  restrictions?: RestrictionsSection;
  liquidity?: LiquiditySection;
  retirement?: RetirementSection;
  estate?: EstateSection;
  insurance?: InsuranceSection;
  career?: CareerSection;
  family?: FamilySection;
  realEstate?: RealEstateSection;
  business?: BusinessSection;
  alternatives?: AlternativesSection;
  construction?: ConstructionSection;
  crypto?: CryptoSection;
  communication?: CommunicationSection;
  personalization?: PersonalizationSection;
};

/** AI-derived metrics (computed, not user-entered) */
export type CfoDerivedMetrics = {
  riskScore: number;
  behavioralScore: number;
  wealthStage: "starter" | "builder" | "accumulator" | "preserver";
  financialIndependenceProgress: number;
  retirementReadinessScore: number;
  concentrationRiskScore: number;
  liquidityScore: number;
  taxEfficiencyScore: number;
  leverageScore: number;
  incomeResilienceScore: number;
  portfolioHealthScore: number;
  overallCfoReadiness: number;
};

export type CfoMeta = {
  version: 2;
  completedChapters: string[];
  completedSections: CfoSectionId[];
  updatedAt: number;
};

/** Full profile: legacy core fields + extended CFO sections */
export type CfoProfile = UserProfile & {
  extended: CfoExtended;
  meta: CfoMeta;
  derived: CfoDerivedMetrics;
};

export const CFO_SECTION_LABELS: Record<CfoSectionId, { title: string; subtitle: string }> = {
  identity: { title: "Identity & demographics", subtitle: "Who you are shapes tax, benefits, and planning." },
  goals: { title: "Financial goals", subtitle: "What success looks like, ranked and specific." },
  timeHorizon: { title: "Time horizon", subtitle: "When you need money drives risk and liquidity." },
  risk: { title: "Risk profile", subtitle: "Drawdowns, volatility, and what you can tolerate." },
  behavioral: { title: "Behavioral finance", subtitle: "How you act under stress, often matters more than math." },
  income: { title: "Income profile", subtitle: "What you earn and how stable it is." },
  expenses: { title: "Expenses", subtitle: "What you spend, savings rate follows." },
  balanceSheet: { title: "Balance sheet", subtitle: "Assets, liabilities, and net worth." },
  tax: { title: "Tax profile", subtitle: "Brackets and account types for location strategies." },
  portfolio: { title: "Portfolio", subtitle: "What you hold today." },
  restrictions: { title: "Investment restrictions", subtitle: "Ethical, religious, and permission boundaries." },
  liquidity: { title: "Liquidity needs", subtitle: "Cash buffers and upcoming expenses." },
  retirement: { title: "Retirement planning", subtitle: "Age, spending, and income sources." },
  estate: { title: "Estate planning", subtitle: "Wills, trusts, and beneficiaries." },
  insurance: { title: "Insurance", subtitle: "Coverage gaps that can wipe out a plan." },
  career: { title: "Career & human capital", subtitle: "Your earning power is often your largest asset." },
  family: { title: "Family situation", subtitle: "Spouse, kids, college, and eldercare." },
  realEstate: { title: "Real estate", subtitle: "Home equity and rental exposure." },
  business: { title: "Business ownership", subtitle: "Equity, cash flow, and exit plans." },
  alternatives: { title: "Alternative investments", subtitle: "PE, VC, collectibles, commodities." },
  construction: { title: "Portfolio preferences", subtitle: "Growth vs income vs preservation mix." },
  crypto: { title: "Bitcoin & crypto", subtitle: "Conviction, allocation limits, custody." },
  communication: { title: "How Thesis should talk to you", subtitle: "Depth, frequency, and style." },
  personalization: { title: "Personalization", subtitle: "Heroes, sources, and what you follow." },
};
