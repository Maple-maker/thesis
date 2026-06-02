import type { ThemeId } from "@/store/types";

export type ThesisPersona = {
  themeId: ThemeId;
  philosophy: string;
  personaName: string;
  tagline: string;
  riskLevel: "low" | "moderate" | "high";
  timeHorizon: "short" | "medium" | "long" | "very-long";
  modelAllocation: { label: string; pct: number }[];
  exposureTags: string[];
  pros: string[];
  cons: string[];
  modelETFs: string[];
  modelStocks: string[];
};

const PERSONAS: ThesisPersona[] = [
  {
    themeId: "ai-infrastructure",
    philosophy:
      "The build-out of intelligence is the defining investment of our lifetime. Every dollar of AI capex flows through chips, power, and data centers before it reaches software.",
    personaName: "The Compute Believer",
    tagline: "Hardware first, software later.",
    riskLevel: "high",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Semiconductors", pct: 45 },
      { label: "Cloud / Data Centers", pct: 25 },
      { label: "Power / Grid", pct: 20 },
      { label: "Cash / Opportunistic", pct: 10 },
    ],
    exposureTags: ["Growth", "Tech-heavy", "US", "High beta", "Thematic"],
    pros: [
      "Direct exposure to the fastest-growing capex cycle in decades",
      "Semiconductor moats are wide, TSMC and ASML have no near-term competitors",
      "Power constraints create pricing power for existing data center operators",
    ],
    cons: [
      "Highly cyclical, AI capex could slow if hyperscaler returns disappoint",
      "Concentrated in semiconductors, single-sector risk is real",
      "Geopolitical tail risk around Taiwan and chip export controls",
    ],
    modelETFs: ["SMH", "SOXX", "AIQ"],
    modelStocks: ["NVDA", "TSM", "AVGO", "MSFT", "VST"],
  },
  {
    themeId: "compounders",
    philosophy:
      "I buy wonderful companies with durable competitive advantages at fair prices, then let time and compounding do the heavy lifting. I do not trade. I own.",
    personaName: "The Quality Owner",
    tagline: "Patience is the edge.",
    riskLevel: "moderate",
    timeHorizon: "very-long",
    modelAllocation: [
      { label: "Wide-moat industrials", pct: 35 },
      { label: "Brand / consumer", pct: 25 },
      { label: "Financial infrastructure", pct: 25 },
      { label: "Cash / Opportunistic", pct: 15 },
    ],
    exposureTags: ["Large Cap", "US", "Quality", "Low turnover", "Dividend growers"],
    pros: [
      "Lower portfolio turnover means fewer taxable events and lower fees",
      "Moat-based businesses tend to survive and compound through downturns",
      "Proven framework, Buffett, Munger, and others have 50+ year track records",
    ],
    cons: [
      "Requires patience, underperformance during speculative manias is common",
      "Hard to identify true moats before they are obvious to everyone else",
      "Can underperform in rapid technological disruption cycles",
    ],
    modelETFs: ["MOAT", "QUAL", "VOO"],
    modelStocks: ["BRK.B", "MA", "V", "AAPL", "COST"],
  },
  {
    themeId: "cash-flow-defensives",
    philosophy:
      "I want to sleep at night. I own businesses that people need regardless of the economy, things they buy on Tuesday in a recession and on Tuesday in a boom.",
    personaName: "The All-Weather Investor",
    tagline: "Calm in any climate.",
    riskLevel: "low",
    timeHorizon: "medium",
    modelAllocation: [
      { label: "Consumer Staples", pct: 30 },
      { label: "Healthcare", pct: 25 },
      { label: "Utilities", pct: 20 },
      { label: "Cash / Bonds", pct: 25 },
    ],
    exposureTags: ["Defensive", "Low volatility", "Dividend", "US", "Stable"],
    pros: [
      "Predictable cash flows hold up across economic cycles",
      "Dividend growth from staples and healthcare provides inflation protection",
      "Low correlation to tech/growth, portfolio diversifier",
    ],
    cons: [
      "Lower upside in strong bull markets",
      "Defensive sectors can be expensive in low-rate environments",
      "Slow growth means compounding takes longer to show results",
    ],
    modelETFs: ["SCHD", "XLP", "VYM"],
    modelStocks: ["KO", "PG", "WMT", "JNJ", "COST"],
  },
  {
    themeId: "clean-energy",
    philosophy:
      "Electrification of everything is not a political story, it is a physics story. The grid has to double in size, and every electron will come from a different source than it did in 2000.",
    personaName: "The Energy Transitionalist",
    tagline: "Follow the electrons.",
    riskLevel: "high",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Renewable Generation", pct: 30 },
      { label: "Grid / Transmission", pct: 25 },
      { label: "Storage / Batteries", pct: 20 },
      { label: "Critical Minerals", pct: 15 },
      { label: "Cash", pct: 10 },
    ],
    exposureTags: ["Thematic", "Infrastructure", "Global", "Policy-dependent", "Growth"],
    pros: [
      "Multi-decade structural tailwind independent of short-term politics",
      "Grid buildout is underinvested globally, trillions in required capex",
      "Battery costs continue to fall on Wright's Law curves, improving project economics",
    ],
    cons: [
      "High interest rates make renewable project financing more expensive",
      "Policy risk, IRA, feed-in tariffs, and tax credits can change with administration",
      "Commodity exposure to lithium, copper, and rare earths adds volatility",
    ],
    modelETFs: ["ICLN", "TAN", "QCLN"],
    modelStocks: ["NEE", "FSLR", "ENPH", "BEP", "VST"],
  },
  {
    themeId: "aging-demographics",
    philosophy:
      "The most predictable trend on Earth is that people get older. Every day, 10,000 Americans turn 65. They will spend more on healthcare than any generation before them.",
    personaName: "The Demographic Realist",
    tagline: "Aging is the surest bet.",
    riskLevel: "moderate",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Pharma / Biotech", pct: 35 },
      { label: "Medical Devices", pct: 25 },
      { label: "Managed Care", pct: 20 },
      { label: "Healthcare Services", pct: 20 },
    ],
    exposureTags: ["Defensive Growth", "Healthcare", "US-heavy", "Regulatory risk", "Steady"],
    pros: [
      "Demographics are predictable decades in advance, cannot be disrupted by technology",
      "Healthcare spending grows faster than GDP in every developed economy",
      "GLP-1 drugs are creating a new multi-hundred-billion market almost overnight",
    ],
    cons: [
      "Regulatory and political risk around drug pricing in the US",
      "Patent cliffs for large pharma companies can create revenue gaps",
      "Biotech is binary, individual drug approvals make or break small companies",
    ],
    modelETFs: ["XLV", "IHI", "IBB"],
    modelStocks: ["UNH", "LLY", "ISRG", "ABBV", "MDT"],
  },
  {
    themeId: "income",
    philosophy:
      "I want my portfolio to pay me, not someday, but every quarter. I build around dividend growers with long track records of raising payouts through every cycle.",
    personaName: "The Income Builder",
    tagline: "Paid to wait.",
    riskLevel: "low",
    timeHorizon: "medium",
    modelAllocation: [
      { label: "Dividend Aristocrats", pct: 40 },
      { label: "REITs", pct: 20 },
      { label: "Utilities / Infrastructure", pct: 20 },
      { label: "Short-duration bonds", pct: 20 },
    ],
    exposureTags: ["Income", "Low volatility", "Dividend", "Yield", "US"],
    pros: [
      "Dividend aristocrats have raised payouts for 25+ consecutive years",
      "Income provides a cushion during flat or down markets",
      "REITs and utilities offer inflation-linked cash flows",
    ],
    cons: [
      "High-yield chasing can lead to value traps, declining businesses with unsustainably high yields",
      "Rising rates compress REIT and utility valuations",
      "Misses growth, income portfolios underperform during tech-led bull markets",
    ],
    modelETFs: ["SCHD", "VYM", "JEPI"],
    modelStocks: ["O", "VZ", "PEP", "ENB"],
  },
  {
    themeId: "cybersecurity",
    philosophy:
      "Every device, every service, every company is a target. Attack surfaces grow exponentially with digitalization. Defense budgets only go one direction.",
    personaName: "The Digital Defender",
    tagline: "Security is not optional.",
    riskLevel: "high",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Endpoint / Cloud Security", pct: 35 },
      { label: "Identity / Access", pct: 25 },
      { label: "Network / Infrastructure", pct: 25 },
      { label: "Cash", pct: 15 },
    ],
    exposureTags: ["Growth", "Tech", "Secular", "Recurring revenue", "US"],
    pros: [
      "Cybersecurity spending is not discretionary, companies cannot opt out",
      "Recurring subscription models create predictable revenue streams",
      "Zero-trust architecture migration is still in early innings (<40% enterprise adoption)",
    ],
    cons: [
      "Consolidation risk, Microsoft bundles security into enterprise agreements",
      "Valuations are high across the sector, leaving little margin for error",
      "Crowded trade, when the sector thesis is consensus, alpha is harder to find",
    ],
    modelETFs: ["HACK", "CIBR"],
    modelStocks: ["CRWD", "PANW", "ZS", "FTNT"],
  },
  {
    themeId: "fintech",
    philosophy:
      "Banking still runs on COBOL and batch processing. The replacement of legacy financial infrastructure with digital rails is a multi-decade rebuild.",
    personaName: "The Digital Banker",
    tagline: "Money moves at the speed of software.",
    riskLevel: "high",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Payment Networks", pct: 30 },
      { label: "Digital Banking", pct: 30 },
      { label: "Enterprise Fintech", pct: 25 },
      { label: "Cash", pct: 15 },
    ],
    exposureTags: ["Growth", "Fintech", "Global", "Disruption", "Regulatory risk"],
    pros: [
      "Payment networks (Visa, Mastercard) are toll-booth businesses, they earn on every transaction",
      "Digital banking adoption in emerging markets is leapfrogging traditional banking",
      "Embedded finance is creating new revenue streams inside non-financial apps",
    ],
    cons: [
      "Regulatory risk, fintech faces scrutiny on lending practices, fees, and data privacy",
      "Credit cycle risk for lenders, neo-banks have not been tested in a recession",
      "Incumbents (JPM, BoA) are spending billions on their own digital transformations",
    ],
    modelETFs: ["FINX", "IPAY"],
    modelStocks: ["SQ", "SOFI", "ADYEN", "PYPL"],
  },
  {
    themeId: "biotech",
    philosophy:
      "Biotech is asymmetric. Most drugs fail, but the ones that succeed change medicine and create enormous value. You are buying optionality on scientific breakthroughs.",
    personaName: "The Asymmetry Hunter",
    tagline: "Small bets, enormous outcomes.",
    riskLevel: "high",
    timeHorizon: "very-long",
    modelAllocation: [
      { label: "Large-cap Biotech", pct: 35 },
      { label: "Gene Editing / CRISPR", pct: 20 },
      { label: "Oncology", pct: 20 },
      { label: "Platform / Tools", pct: 15 },
      { label: "Cash", pct: 10 },
    ],
    exposureTags: ["Speculative", "Healthcare", "Binary risk", "Long duration", "Global"],
    pros: [
      "GLP-1 drugs are expanding into new diseases, the addressable market is growing faster than expected",
      "CRISPR gene editing is moving from lab to approved treatments",
      "AI-accelerated drug discovery is shortening timelines from years to months",
    ],
    cons: [
      "Most drugs fail clinical trials, individual stock risk is very high",
      "Drug pricing is a perennial political target in the US",
      "Requires scientific literacy to evaluate, not suitable for passive investors",
    ],
    modelETFs: ["IBB", "XBI", "ARKG"],
    modelStocks: ["VRTX", "REGN", "LLY", "CRSP"],
  },
  {
    themeId: "consumer-staples",
    philosophy:
      "People brush their teeth, wash their clothes, and eat snacks regardless of what the Fed does. I own the brands that are in every pantry and bathroom cabinet on Earth.",
    personaName: "The Brand Loyalist",
    tagline: "Buy what people already buy.",
    riskLevel: "low",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Household / Personal Care", pct: 35 },
      { label: "Food & Beverage", pct: 35 },
      { label: "Tobacco / Alcohol", pct: 15 },
      { label: "Cash", pct: 15 },
    ],
    exposureTags: ["Defensive", "Dividend", "Global brands", "Low volatility", "Recession-resistant"],
    pros: [
      "Pricing power, consumers do not switch toothpaste brands over a 50¢ difference",
      "Dividend records stretching back 50+ years at many staples companies",
      "Emerging market consumers trading up to global brands provides growth optionality",
    ],
    cons: [
      "Slow organic growth, most staples grow at GDP + 1-2%",
      "Private label competition is rising as retailers push store brands",
      "Valuations can be stretched in low-rate, risk-off environments",
    ],
    modelETFs: ["XLP", "VDC"],
    modelStocks: ["KO", "PG", "PEP", "MDLZ", "WMT"],
  },
  {
    themeId: "global-diversification",
    philosophy:
      "The US has dominated for 15 years. History says that does not last forever. I want exposure to growth wherever it happens, not just in one country.",
    personaName: "The Global Citizen",
    tagline: "The world is bigger than the S&P.",
    riskLevel: "moderate",
    timeHorizon: "long",
    modelAllocation: [
      { label: "Developed International", pct: 40 },
      { label: "Emerging Markets", pct: 30 },
      { label: "US (anchor)", pct: 20 },
      { label: "Cash / Currency hedge", pct: 10 },
    ],
    exposureTags: ["International", "Diversified", "Value tilt", "Currency exposure", "Global"],
    pros: [
      "International stocks trade at significantly lower P/E ratios than US peers",
      "Currency diversification protects against dollar weakness",
      "Demographic tailwinds in India, Southeast Asia, and parts of Latin America",
    ],
    cons: [
      "International has underperformed US for 15+ years, mean reversion is not guaranteed",
      "Higher volatility and political risk in emerging markets",
      "Currency moves can amplify losses even when the underlying stock performs well",
    ],
    modelETFs: ["VXUS", "VWO", "EWZ"],
    modelStocks: ["BABA", "MELI", "TSM"],
  },
  {
    themeId: "emerging-tech",
    philosophy:
      "I am early. Robotics, quantum, autonomy, space, these are not 2026 stories. They are 2036 stories. I size small, hold long, and accept that most will fail.",
    personaName: "The Frontier Scout",
    tagline: "Early is uncomfortable. Early is the point.",
    riskLevel: "high",
    timeHorizon: "very-long",
    modelAllocation: [
      { label: "Robotics / Autonomy", pct: 30 },
      { label: "Space Economy", pct: 25 },
      { label: "Quantum / Advanced Compute", pct: 20 },
      { label: "Speculative / Moonshots", pct: 15 },
      { label: "Cash", pct: 10 },
    ],
    exposureTags: ["Speculative", "Frontier", "Long duration", "High variance", "Global"],
    pros: [
      "Asymmetric upside, a single winner can return 100x and cover the portfolio",
      "Technological progress is accelerating across multiple fronts simultaneously",
      "Government and defense spending is de-risking some frontier bets (space, quantum)",
    ],
    cons: [
      "Most frontier companies are pre-revenue or deeply unprofitable",
      "Timelines are uncertain, being right too early is the same as being wrong",
      "Requires deep technical knowledge and high tolerance for drawdowns",
    ],
    modelETFs: ["ARKK", "BOTZ"],
    modelStocks: ["TSLA", "RKLB", "ASTS", "IONQ", "PLTR"],
  },
];

export function personaForTheme(themeId: ThemeId): ThesisPersona | undefined {
  return PERSONAS.find((p) => p.themeId === themeId);
}

export function allPersonas(): ThesisPersona[] {
  return PERSONAS;
}
