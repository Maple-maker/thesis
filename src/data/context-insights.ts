import type { ConceptId } from "@/data/concepts";

export type ContextInsight = {
  id: string;
  /** Stock symbol if this is a stock-level insight. */
  symbol?: string;
  /** Theme ID if this is a theme-level insight. */
  themeId?: string;
  /** Date-style kicker. */
  kicker?: string;
  /** One-line narrative headline. */
  headline: string;
  /** Attribution line, defaults to "Thesis lens · illustrative". */
  attribution?: string;
  /** Optional short body paragraph. */
  body?: string;
  /** 2–4 bullet reasons explaining why it matters. */
  whyItMatters: string[];
  /** Concept IDs for TermLink wiring inside whyItMatters. */
  conceptIds?: ConceptId[];
  /** Counter-risk / caution paragraph. */
  watch?: string;
  /** Optional metric pills. */
  chips?: { label: string; delta?: string; tone?: "pos" | "neg" | "neutral" }[];
};

// ─────────────────────────────────────────────────────────────────────────────

const STOCK_INSIGHTS: ContextInsight[] = [
  {
    id: "nvda-ai-capex",
    symbol: "NVDA",
    kicker: "Thesis lens · illustrative",
    headline: "AI capex cycle still ramping, GPU demand outruns supply through 2026.",
    body: "Hyperscaler capex commitments (MSFT, AMZN, GOOGL) grew 45% YoY in Q1 2026, with the majority allocated to AI compute. NVIDIA's data center revenue tracks these commitments with a two-quarter lag, suggesting near-term visibility remains strong despite the stock's elevated multiple.",
    whyItMatters: [
      "Data center revenue now represents 86% of total revenue, the story is pure AI compute exposure.",
      "Gross margins above 75% reflect pricing power from supply-constrained H100/B200-class silicon.",
      "The key risk is not demand but lead time: Blackwell architecture deliveries will define Q3-Q4 outperformance.",
    ],
    conceptIds: ["pe-ratio", "moat"],
    watch: "Trading at 35x forward earnings, NVDA leaves little room for delivery hiccups. Any customer deferral (cloud optimization cycles, self-designed ASICs) could compress the multiple faster than earnings catch up.",
    chips: [
      { label: "Rev growth", delta: "114% YoY", tone: "pos" },
      { label: "Gross margin", delta: "76%", tone: "pos" },
      { label: "Beta", delta: "1.65", tone: "neg" },
    ],
  },
  {
    id: "pltr-gov-ai",
    symbol: "PLTR",
    kicker: "Thesis lens · illustrative",
    headline: "Government AI contracts accelerating, but revenue concentration is a watchpoint.",
    body: "Palantir's AIP platform is seeing adoption across DoD, intelligence, and allied governments, with US government revenue growing 32% YoY. The commercial side is smaller but growing faster, driven by supply chain and manufacturing use cases.",
    whyItMatters: [
      "Government contracts provide multi-year visibility but create concentration risk, 55% of revenue from USG.",
      "AIP boot camps are converting to production deployments with 6-18 month ramp cycles.",
      "Operating margin turning positive for the first time suggests the business model is maturing.",
    ],
    conceptIds: ["moat", "run-rate"],
    watch: "Trading at a premium that assumes perfect execution on commercial expansion. If government budgets tighten or leadership changes strategy, the multiple re-rates quickly. 95% gross margins are attractive, but scale is still unproven outside government.",
    chips: [
      { label: "Rev growth", delta: "26% YoY", tone: "pos" },
      { label: "Gross margin", delta: "82%", tone: "pos" },
      { label: "Beta", delta: "1.85", tone: "neg" },
    ],
  },
  {
    id: "enph-solar-drag",
    symbol: "ENPH",
    kicker: "Thesis lens · illustrative",
    headline: "Solar demand pulling back, near-term headwinds mask a long-term structural story.",
    body: "US residential solar installations declined 12% in Q1 2026 as high interest rates and NEM 3.0 policy changes in California weighed on consumer economics. Enphase's revenue (-12% YoY) reflects the macro drag, but the company remains cash-flow positive and dominant in microinverters.",
    whyItMatters: [
      "Revenue declining YoY, but the company stayed EBITDA-positive, a sign of cost discipline.",
      "NEM 3.0 comps ease in Q3, creating a potential inflection for US residential solar.",
      "Battery attach rates are rising (now ~25% of new installs), expanding per-customer revenue.",
    ],
    conceptIds: ["free-cash-flow"],
    watch: "If rate cuts do not materialize as the market expects, residential solar economics remain pressured. European demand is also softening. Long-term electrification still holds, but the timing is uncertain.",
    chips: [
      { label: "Rev growth", delta: "-12% YoY", tone: "neg" },
      { label: "FCF yield", delta: "6.2%", tone: "pos" },
      { label: "52-wk low", delta: "-48%", tone: "neg" },
    ],
  },
  {
    id: "crwd-cyber-secular",
    symbol: "CRWD",
    kicker: "Thesis lens · illustrative",
    headline: "Cybersecurity spending is structurally supported, zero-trust migrations still early.",
    body: "CrowdStrike's Falcon platform benefits from an ongoing replacement cycle as organizations move from legacy antivirus to cloud-native endpoint protection. The 2024 outage incident is largely behind them, with net-new enterprise logos growing 28% YoY.",
    whyItMatters: [
      "Zero-trust architecture is still in early innings, most enterprises are <40% migrated.",
      "Dollar-based net retention above 115% means existing customers expand faster than churn.",
      "The platform strategy (endpoint + identity + cloud security) increases switching costs over time.",
    ],
    conceptIds: ["moat", "yoy"],
    watch: "Cybersecurity spending is less discretionary than most IT, but macro budget freezes could slow deal velocity. Microsoft's Defender continues to bundle security into its enterprise suite, pressuring pure-play vendors on price.",
    chips: [
      { label: "Rev growth", delta: "32% YoY", tone: "pos" },
      { label: "Net retention", delta: "115%", tone: "pos" },
      { label: "Op margin", delta: "8%", tone: "neutral" },
    ],
  },
  {
    id: "sofi-fintech-tailwind",
    symbol: "SOFI",
    kicker: "Thesis lens · illustrative",
    headline: "Rate-sensitive tailwind building, deposit base provides low-cost funding edge.",
    body: "SoFi's member growth (45% YoY) continues to compound as the platform expands beyond student loan refinancing into banking, credit cards, and investing. The Galileo origination platform adds an enterprise revenue stream that is more stable than direct lending.",
    whyItMatters: [
      "Membership growth is the most important metric, >10M members drives cross-sell into higher-margin products.",
      "Deposit base (now 35% of funding) reduces cost of funds vs. wholesale lending, improving net interest margin.",
      "The business is approaching GAAP profitability, a milestone that could expand the addressable investor base.",
    ],
    conceptIds: ["pe-ratio", "yoy"],
    watch: "Credit risk remains the variable to watch. Student loan delinquencies have normalized post-pause, and personal loan losses are ticking up. SoFi's underwriting is automated, which works well in good times but has not been tested through a full cycle.",
    chips: [
      { label: "Members", delta: "10M+", tone: "pos" },
      { label: "Rev growth", delta: "45% YoY", tone: "pos" },
      { label: "Beta", delta: "2.10", tone: "neg" },
    ],
  },
  {
    id: "aapl-services-shift",
    symbol: "AAPL",
    kicker: "Thesis lens · illustrative",
    headline: "Services revenue becoming the earnings driver, hardware cycles are less important over time.",
    body: "Apple's Services segment (App Store, Apple Music, iCloud, Apple Pay) now accounts for 26% of revenue and 38% of gross profit. The installed base of 2.3B active devices provides a recurring revenue stream that grows without requiring a blockbuster iPhone cycle each year.",
    whyItMatters: [
      "Services margins (~71%) are roughly 2.5x hardware margins, so a mix shift toward services boosts overall margins structurally.",
      "The installed base grows even when unit sales are flat, because users hold devices longer and spend more per device.",
      "Regulatory pressure on the App Store (EU DMA, DOJ) is the main risk to Services growth, a 10-15% revenue haircut is priced into some scenarios.",
    ],
    conceptIds: ["moat", "dividend-yield"],
    watch: "China revenue declining 8% YoY remains a structural concern, market share losses to Huawei in premium phones are not reversing quickly. If services growth dips below 10%, the thesis shifts significantly since the stock's premium multiple relies on that growth rate.",
    chips: [
      { label: "Revenue", delta: "5% YoY", tone: "neutral" },
      { label: "Services margin", delta: "71%", tone: "pos" },
      { label: "Div yield", delta: "0.5%", tone: "neg" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const THEME_INSIGHTS: ContextInsight[] = [
  {
    id: "ai-infra-hyperscaler-capex",
    themeId: "ai-infrastructure",
    kicker: "Thesis lens · illustrative",
    headline: "Hyperscaler capex is the structural bedrock, power is now the binding constraint.",
    body: "Combined 2026 capex from Microsoft, Amazon, Google, and Meta is projected to exceed $250B, with over 60% allocated to AI infrastructure. The bottleneck is no longer chip supply but power availability, data center lead times have stretched to 3-5 years in some regions.",
    whyItMatters: [
      "Power and grid infrastructure spending is becoming a parallel investment theme, utilities, transformers, and grid equipment companies benefit alongside AI compute.",
      "The US CHIPS Act and IRA are reshoring semiconductor fab construction, creating a multi-year capex cycle for equipment manufacturers.",
      "If hyperscaler returns on AI investment disappoint, the capex cycle could peak in 2027, the signal to watch is commentary on inference compute utilization.",
    ],
    conceptIds: ["ebitda", "free-cash-flow"],
    watch: "The most important risk to the AI infrastructure theme is not regulation or competition, it is the power grid. If interconnection timelines slip further, the spend gets pushed out rather than cancelled, but it pressures near-term returns for hyperscaler investors.",
    chips: [
      { label: "Combined capex", delta: "$250B+", tone: "pos" },
      { label: "Data center lead time", delta: "3-5 yr", tone: "neg" },
      { label: "Power as constraint", delta: "binding", tone: "neutral" },
    ],
  },
  {
    id: "clean-energy-policy",
    themeId: "clean-energy",
    kicker: "Thesis lens · illustrative",
    headline: "Policy support is trending positive, but near-term demand is rate-sensitive.",
    body: "The IRA continues to drive utility-scale solar and battery deployments at record levels, but residential solar has pulled back sharply in key markets (California, Germany) where feed-in tariffs changed and rates stay elevated. The divergence between utility-scale (growing) and residential (contracting) creates a nuanced picture.",
    whyItMatters: [
      "Utility-scale solar and storage are less sensitive to rate policy, corporate PPAs drive demand regardless of consumer sentiment.",
      "Battery storage is the highest-growth sub-segment (>50% YoY) as grid operators address intermittency with 4-hour+ duration systems.",
      "The long-term electrification thesis (transportation, buildings, industry) is intact regardless of short-term solar demand swings, the grid will need more capacity from every source.",
    ],
    conceptIds: ["fed-rate", "revenue-vs-profit"],
    watch: "A second Trump administration could slow IRA disbursements or modify EV tax credits, creating headline risk for the sector. However, most utility-scale projects have >5 year PPA contracts signed under current rules, limiting immediate earnings impact.",
    chips: [
      { label: "Utility solar", delta: "+22% YoY", tone: "pos" },
      { label: "Residential solar", delta: "-12% YoY", tone: "neg" },
      { label: "Battery storage", delta: "+52% YoY", tone: "pos" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const BY_SYMBOL: Record<string, ContextInsight> = {};
for (const ins of STOCK_INSIGHTS) {
  if (ins.symbol) BY_SYMBOL[ins.symbol] = ins;
}

const BY_THEME: Record<string, ContextInsight> = {};
for (const ins of THEME_INSIGHTS) {
  if (ins.themeId) BY_THEME[ins.themeId] = ins;
}

export function insightForSymbol(symbol: string): ContextInsight | undefined {
  return BY_SYMBOL[symbol];
}

export function insightForTheme(themeId: string): ContextInsight | undefined {
  return BY_THEME[themeId];
}

export function allStockInsights(): ContextInsight[] {
  return STOCK_INSIGHTS;
}

export function allThemeInsights(): ContextInsight[] {
  return THEME_INSIGHTS;
}
