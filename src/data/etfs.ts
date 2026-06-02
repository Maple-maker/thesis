import type { ETF, EtfTag } from "@/store/types";
import { catalogEntryBySymbol, catalogEntryToEtf } from "@/data/etf-catalog";
import { enrichEtfTags } from "@/lib/etf-tags";

type EtfSeed = Omit<ETF, "tags"> & { tags?: EtfTag[] };

// ─── Broad US Market ───────────────────────────────────────────────
const BROAD_US: EtfSeed[] = [
  {
    symbol: "VOO", name: "Vanguard S&P 500 ETF", expense: 0.03,
    themes: ["compounders", "cash-flow-defensives"],
    description: "The 500 largest US companies, market-cap weighted. The default S&P 500 vehicle.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","JNJ","UNH","V","MA","WMT","PG","KO","PEP","ABBV","LLY","COST"],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "VTI", name: "Vanguard Total Stock Market", expense: 0.03,
    themes: ["compounders", "cash-flow-defensives"],
    description: "Total US equity exposure — large, mid, and small caps in one fund.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","JNJ","UNH","V","MA","WMT","PG","KO","ABBV","LLY","TSLA","PLTR"],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "IVV", name: "iShares Core S&P 500", expense: 0.03,
    themes: ["compounders", "cash-flow-defensives"],
    description: "iShares' S&P 500 flagship — identical exposure to VOO, different issuer.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","UNH","JNJ","V","MA","WMT","PG","KO","ABBV","LLY","COST"],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "SPLG", name: "SPDR Portfolio S&P 500", expense: 0.02,
    themes: ["compounders", "cash-flow-defensives"],
    description: "Lowest-cost S&P 500 ETF, same index as VOO and IVV.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","UNH","JNJ","V","MA","WMT","PG","KO","ABBV","LLY","COST"],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "RSP", name: "Invesco S&P 500 Equal Weight", expense: 0.20,
    themes: ["compounders"],
    description: "Equal-weight S&P 500 — less top-heavy than cap-weighted, more mid-cap exposure, historically higher risk-adjusted return over long cycles.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","JNJ","UNH","V","MA","WMT","PG","KO","ABBV","LLY","COST"],
    tags: ["broad-market"],
  },
  {
    symbol: "QQQ", name: "Invesco QQQ Trust", expense: 0.20,
    themes: ["ai-infrastructure", "compounders"],
    description: "Nasdaq-100, concentrated in mega-cap US tech and growth — not a diversified index fund, despite its popularity.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","TSLA","AMD","ARM","CRWD","PANW","ASML","COST","PEP"],
    tags: ["broad-market","growth-tilt"],
  },
  {
    symbol: "QQQM", name: "Invesco Nasdaq 100 (lower-cost)", expense: 0.15,
    themes: ["ai-infrastructure", "compounders"],
    description: "Same index as QQQ with a lower expense ratio, designed for buy-and-hold investors.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","TSLA","AMD","ARM","CRWD","PANW","ASML","COST"],
    tags: ["broad-market","growth-tilt","low-cost"],
  },
];

// ─── Mid / Small Cap ───────────────────────────────────────────────
const MID_SMALL: EtfSeed[] = [
  {
    symbol: "VO", name: "Vanguard Mid-Cap", expense: 0.04,
    themes: ["compounders"],
    description: "S&P 400–style mid-cap exposure, blend of growth and value.",
    holdings: [],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "VB", name: "Vanguard Small-Cap", expense: 0.05,
    themes: ["compounders"],
    description: "S&P 600–style small-cap US equities, higher growth potential and volatility.",
    holdings: [],
    tags: ["broad-market","low-cost"],
  },
  {
    symbol: "IWM", name: "iShares Russell 2000", expense: 0.19,
    themes: ["compounders"],
    description: "The benchmark small-cap ETF, Russell 2000 index — 2,000 smallest names in the Russell 3000.",
    holdings: [],
    tags: ["broad-market","small-cap"],
  },
  {
    symbol: "AVUV", name: "Avantis US Small Cap Value", expense: 0.25,
    themes: ["compounders", "income"],
    description: "Actively managed small-cap value — screens for profitability and value jointly, academic-factor approach.",
    holdings: [],
    tags: ["small-cap", "income-heavy"],
  },
];

// ─── International ─────────────────────────────────────────────────
const INTERNATIONAL: EtfSeed[] = [
  {
    symbol: "VXUS", name: "Vanguard Total International Stock", expense: 0.07,
    themes: ["global-diversification"],
    description: "Everything outside the US — developed and emerging markets in one fund.",
    holdings: ["TSM","NSRGY","ASML","ADYEN","BABA","MELI","ENB"],
    tags: ["international","low-cost"],
  },
  {
    symbol: "VEA", name: "Vanguard FTSE Developed Markets", expense: 0.05,
    themes: ["global-diversification"],
    description: "Developed ex-US: Europe, Japan, Australia, Canada — no emerging markets.",
    holdings: ["NSRGY","ASML","ADYEN","ENB"],
    tags: ["international","low-cost"],
  },
  {
    symbol: "VWO", name: "Vanguard FTSE Emerging Markets", expense: 0.07,
    themes: ["global-diversification"],
    description: "Emerging-market exposure weighted heavily to China, India, Taiwan, Brazil.",
    holdings: ["TSM","BABA","MELI"],
    tags: ["international","emerging-markets","low-cost"],
  },
  {
    symbol: "IEMG", name: "iShares Core MSCI Emerging Markets", expense: 0.09,
    themes: ["global-diversification"],
    description: "iShares' emerging markets core — broader than VWO, includes small-caps.",
    holdings: ["TSM","BABA","MELI"],
    tags: ["international","emerging-markets","low-cost"],
  },
  {
    symbol: "EFA", name: "iShares MSCI EAFE", expense: 0.33,
    themes: ["global-diversification"],
    description: "Europe, Australasia, Far East — the classic developed ex-US benchmark.",
    holdings: ["NSRGY","ASML","ADYEN"],
    tags: ["international"],
  },
  {
    symbol: "EWJ", name: "iShares MSCI Japan", expense: 0.50,
    themes: ["global-diversification"],
    description: "Single-country Japan exposure — Topix-heavy, yen-sensitive.",
    holdings: [],
    tags: ["international"],
  },
  {
    symbol: "INDA", name: "iShares MSCI India", expense: 0.65,
    themes: ["global-diversification", "emerging-tech"],
    description: "India equity, one of the fastest-growing large economies — financials, tech, and industrials heavy.",
    holdings: [],
    tags: ["international","emerging-markets"],
  },
  {
    symbol: "EWZ", name: "iShares MSCI Brazil", expense: 0.59,
    themes: ["global-diversification"],
    description: "Single-country Brazil — commodity and financial-heavy, volatile, high dividend yield on paper.",
    holdings: ["MELI"],
    tags: ["international","emerging-markets"],
  },
];

// ─── Fixed Income / Bonds ──────────────────────────────────────────
const BONDS: EtfSeed[] = [
  {
    symbol: "AGG", name: "iShares Core US Aggregate Bond", expense: 0.03,
    themes: ["cash-flow-defensives"],
    description: "Total US investment-grade bond market — Treasuries, MBS, corporates. The bond-market equivalent of VTI.",
    holdings: [],
    tags: ["low-cost","defensive"],
  },
  {
    symbol: "BND", name: "Vanguard Total Bond Market", expense: 0.03,
    themes: ["cash-flow-defensives"],
    description: "Vanguard's total bond market fund — nearly identical to AGG, different issuer.",
    holdings: [],
    tags: ["low-cost","defensive"],
  },
  {
    symbol: "SHY", name: "iShares 1-3 Year Treasury", expense: 0.15,
    themes: ["cash-flow-defensives"],
    description: "Short-term Treasuries — low duration risk, near-cash holding for dry powder or emergency-fund tier.",
    holdings: [],
    tags: ["defensive","low-cost"],
  },
  {
    symbol: "IEF", name: "iShares 7-10 Year Treasury", expense: 0.15,
    themes: ["cash-flow-defensives"],
    description: "Intermediate Treasuries — the classic risk-off asset, rates up = price down.",
    holdings: [],
    tags: ["defensive"],
  },
  {
    symbol: "TLT", name: "iShares 20+ Year Treasury", expense: 0.15,
    themes: ["cash-flow-defensives"],
    description: "Long-duration Treasuries — high rate sensitivity, recession hedge, pairs with equity heavy portfolios.",
    holdings: [],
    tags: ["defensive"],
  },
  {
    symbol: "TIP", name: "iShares TIPS Bond", expense: 0.19,
    themes: ["cash-flow-defensives"],
    description: "Treasury Inflation-Protected Securities — principal adjusts with CPI, inflation-hedge bond sleeve.",
    holdings: [],
    tags: ["defensive"],
  },
  {
    symbol: "SGOV", name: "iShares 0-3 Month Treasury", expense: 0.09,
    themes: ["cash-flow-defensives"],
    description: "Ultra-short T-bills — cash alternative earning the risk-free rate, popular for dry powder and emergency funds.",
    holdings: [],
    tags: ["defensive","low-cost","income"],
  },
  {
    symbol: "BIL", name: "SPDR Bloomberg 1-3 Month T-Bill", expense: 0.14,
    themes: ["cash-flow-defensives"],
    description: "T-bill ETF — functionally similar to SGOV, different issuer, very low duration.",
    holdings: [],
    tags: ["defensive","low-cost","income"],
  },
  {
    symbol: "LQD", name: "iShares iBoxx Investment Grade Corporate Bond", expense: 0.14,
    themes: ["cash-flow-defensives"],
    description: "Investment-grade corporate bonds — higher yield than Treasuries with moderate credit risk.",
    holdings: [],
    tags: ["defensive","income"],
  },
  {
    symbol: "HYG", name: "iShares iBoxx High Yield Corporate", expense: 0.49,
    themes: ["income"],
    description: "High-yield / junk bonds — equity-like returns with bond-like structure, default risk is real in recessions.",
    holdings: [],
    tags: ["income","higher-fee"],
  },
  {
    symbol: "BNDX", name: "Vanguard Total International Bond", expense: 0.07,
    themes: ["global-diversification", "cash-flow-defensives"],
    description: "International investment-grade bonds, currency-hedged — diversifies rate exposure outside the Fed.",
    holdings: [],
    tags: ["international","defensive","low-cost"],
  },
  {
    symbol: "VTEB", name: "Vanguard Tax-Exempt Bond", expense: 0.05,
    themes: ["cash-flow-defensives"],
    description: "Municipal bonds — federal tax-free income, useful for high-income earners in taxable accounts.",
    holdings: [],
    tags: ["defensive","income","low-cost"],
  },
];

// ─── Sectors ────────────────────────────────────────────────────────
const SECTORS: EtfSeed[] = [
  { symbol: "XLK", name: "Technology Select Sector", expense: 0.09,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "S&P 500 tech — Apple, Microsoft, NVIDIA heavy, ~47% of the fund in the top 3.",
    holdings: ["AAPL","MSFT","NVDA","AVGO","CRM","ORCL","CSCO","ACN","ADBE","AMD"],
    tags: ["sector-bundle","growth-tilt"],
  },
  { symbol: "XLF", name: "Financials Select Sector", expense: 0.09,
    themes: ["cash-flow-defensives", "fintech"],
    description: "S&P 500 financials — banks, insurers, capital markets, Berkshire Hathaway.",
    holdings: ["BRK.B","V","MA","JPM","BAC","WFC","GS","MS","AXP","BLK"],
    tags: ["sector-bundle"],
  },
  { symbol: "XLV", name: "Health Care Select Sector", expense: 0.09,
    themes: ["aging-demographics", "cash-flow-defensives"],
    description: "S&P 500 healthcare — pharma, biotech, medtech, insurers.",
    holdings: ["LLY","JNJ","UNH","ABBV","MDT","ISRG","VRTX","REGN"],
    tags: ["sector-bundle","defensive","healthcare"],
  },
  { symbol: "XLE", name: "Energy Select Sector", expense: 0.09,
    themes: [],
    description: "S&P 500 energy — Exxon, Chevron, ConocoPhillips heavy, cyclical, commodity-price sensitive.",
    holdings: [],
    tags: ["sector-bundle","cyclical","energy-commodity"],
  },
  { symbol: "XLI", name: "Industrials Select Sector", expense: 0.09,
    themes: ["cash-flow-defensives"],
    description: "S&P 500 industrials — aerospace, defense, machinery, transportation.",
    holdings: [],
    tags: ["sector-bundle"],
  },
  { symbol: "XLY", name: "Consumer Discretionary Select Sector", expense: 0.09,
    themes: [],
    description: "S&P 500 consumer discretionary — Amazon, Tesla, Home Depot heavy, sensitive to spending cycles.",
    holdings: ["AMZN","TSLA","HD","MCD","NKE","LOW","SBUX","BKNG"],
    tags: ["sector-bundle","cyclical","consumer-discretionary"],
  },
  { symbol: "XLP", name: "Consumer Staples Select Sector", expense: 0.09,
    themes: ["consumer-staples", "cash-flow-defensives", "income"],
    description: "S&P staples — household, food, beverage giants, defensive, steady dividends.",
    holdings: ["PG","KO","PEP","COST","WMT","MDLZ"],
    tags: ["sector-bundle","defensive","consumer-staples"],
  },
  { symbol: "XLU", name: "Utilities Select Sector", expense: 0.09,
    themes: ["income", "cash-flow-defensives"],
    description: "S&P 500 utilities — regulated monopolies, rate-sensitive, bond-proxy income.",
    holdings: ["NEE","DUK","SO","D","AEP","EXC"],
    tags: ["sector-bundle","defensive","income"],
  },
  { symbol: "XLRE", name: "Real Estate Select Sector", expense: 0.09,
    themes: ["income"],
    description: "S&P 500 REITs — data centers, towers, industrial, retail, residential.",
    holdings: ["O","PLD","AMT","EQIX","CCI","SPG","PSA"],
    tags: ["sector-bundle","real-estate","income"],
  },
];

// ─── Factor / Style ─────────────────────────────────────────────────
const FACTORS: EtfSeed[] = [
  {
    symbol: "QUAL", name: "iShares MSCI USA Quality Factor", expense: 0.15,
    themes: ["compounders"],
    description: "US large-caps screened for high ROE, stable earnings growth, and low leverage — quality at a reasonable price.",
    holdings: ["AAPL","MSFT","NVDA","META","V","MA","COST","LLY"],
    tags: ["broad-market"],
  },
  {
    symbol: "MTUM", name: "iShares MSCI USA Momentum Factor", expense: 0.15,
    themes: ["compounders", "ai-infrastructure"],
    description: "US stocks with the strongest recent risk-adjusted price momentum — trend-following factor.",
    holdings: ["NVDA","META","AVGO","LLY","TSLA","PLTR"],
    tags: ["broad-market","growth-tilt"],
  },
  {
    symbol: "USMV", name: "iShares MSCI USA Min Vol Factor", expense: 0.15,
    themes: ["cash-flow-defensives"],
    description: "Lower-volatility US large-caps — aims to participate in up markets with smaller drawdowns.",
    holdings: ["BRK.B","JNJ","V","MA","PG","KO","WMT","PEP"],
    tags: ["defensive"],
  },
  {
    symbol: "VLUE", name: "iShares MSCI USA Value Factor", expense: 0.15,
    themes: ["income"],
    description: "Cheapest US large-caps by P/E, P/B, and EV/CF — classic value factor.",
    holdings: ["BRK.B","JNJ","VZ","CVX","XOM","CSCO","IBM"],
    tags: ["income-heavy"],
  },
  {
    symbol: "VUG", name: "Vanguard Growth", expense: 0.04,
    themes: ["ai-infrastructure", "emerging-tech", "compounders"],
    description: "S&P 500 growth index — Apple, Microsoft, NVIDIA, Amazon heavy, low yield, high expected growth.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","LLY","TSLA","V","MA"],
    tags: ["broad-market","growth-tilt","low-cost"],
  },
  {
    symbol: "VBR", name: "Vanguard Small-Cap Value", expense: 0.07,
    themes: ["income"],
    description: "Small-cap value — historically higher long-term returns than large-cap growth, with higher volatility and drawdowns.",
    holdings: [],
    tags: ["small-cap","income-heavy","low-cost"],
  },
];

// ─── Thematics ──────────────────────────────────────────────────────
const THEMATICS: EtfSeed[] = [
  // AI / chips
  {
    symbol: "SMH", name: "VanEck Semiconductor", expense: 0.35,
    themes: ["ai-infrastructure"],
    description: "The 25 largest US-listed semiconductor companies — direct AI compute and chip exposure.",
    holdings: ["NVDA","TSM","AVGO","AMD","ARM","ASML"],
    tags: ["thematic","semiconductor"],
  },
  {
    symbol: "SOXX", name: "iShares Semiconductor", expense: 0.35,
    themes: ["ai-infrastructure"],
    description: "Alternative semiconductor ETF, similar holdings to SMH with different weighting methodology.",
    holdings: ["NVDA","AVGO","TSM","AMD","ARM"],
    tags: ["thematic","semiconductor"],
  },
  {
    symbol: "AIQ", name: "Global X Artificial Intelligence", expense: 0.68,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "Companies developing or applying AI across hardware and software — broader than pure chips.",
    holdings: ["NVDA","MSFT","GOOGL","META","AVGO","PLTR","CRWD","ARM"],
    tags: ["thematic","ai-compute","higher-fee"],
  },
  {
    symbol: "BOTZ", name: "Global X Robotics & AI", expense: 0.68,
    themes: ["emerging-tech", "ai-infrastructure"],
    description: "Robotics, industrial automation, and applied AI companies.",
    holdings: ["NVDA","ISRG","ARM","TSLA"],
    tags: ["thematic","higher-fee"],
  },
  // Cybersecurity
  {
    symbol: "HACK", name: "ETFMG Prime Cyber Security", expense: 0.60,
    themes: ["cybersecurity"],
    description: "Pure-play cybersecurity basket — vendors and infrastructure providers. First pure cyber ETF.",
    holdings: ["CRWD","PANW","ZS","FTNT","PLTR"],
    tags: ["thematic","cybersecurity"],
  },
  {
    symbol: "CIBR", name: "First Trust NASDAQ Cybersecurity", expense: 0.60,
    themes: ["cybersecurity"],
    description: "Alternative cybersecurity ETF — similar names, NASDAQ-screened methodology.",
    holdings: ["CRWD","PANW","ZS","FTNT","PLTR"],
    tags: ["thematic","cybersecurity"],
  },
  // Clean energy
  {
    symbol: "ICLN", name: "iShares Global Clean Energy", expense: 0.41,
    themes: ["clean-energy"],
    description: "Global clean energy producers and equipment makers — solar, wind, hydro, storage.",
    holdings: ["FSLR","ENPH","NEE","BEP","VST"],
    tags: ["thematic","clean-energy"],
  },
  {
    symbol: "TAN", name: "Invesco Solar", expense: 0.67,
    themes: ["clean-energy"],
    description: "Concentrated solar exposure — high beta to panel pricing, subsidies, and policy tailwinds/headwinds.",
    holdings: ["FSLR","ENPH"],
    tags: ["thematic","clean-energy","higher-fee"],
  },
  {
    symbol: "QCLN", name: "First Trust Clean Edge Green Energy", expense: 0.59,
    themes: ["clean-energy", "emerging-tech"],
    description: "Broader clean-energy basket including EVs, storage, and grid tech.",
    holdings: ["FSLR","ENPH","TSLA","NEE"],
    tags: ["thematic","clean-energy"],
  },
  // ARK suite
  {
    symbol: "ARKK", name: "ARK Innovation", expense: 0.75,
    themes: ["emerging-tech", "biotech"],
    description: "Active high-conviction fund — disruptive innovation across genomics, AI, fintech, robotics. High volatility.",
    holdings: ["TSLA","CRSP","SQ","PLTR","RBLX"],
    tags: ["thematic","active-concentrated","higher-fee"],
  },
  {
    symbol: "ARKG", name: "ARK Genomic Revolution", expense: 0.75,
    themes: ["biotech", "emerging-tech"],
    description: "Active fund concentrated in gene-editing, diagnostics, synthetic biology, and longevity companies.",
    holdings: ["CRSP","REGN","VRTX"],
    tags: ["thematic","biotech","active-concentrated","higher-fee"],
  },
  {
    symbol: "ARKF", name: "ARK Fintech Innovation", expense: 0.75,
    themes: ["fintech", "emerging-tech"],
    description: "Active fund — digital wallets, blockchain, lending platforms, payments infrastructure.",
    holdings: ["SQ","PYPL","COIN","MELI"],
    tags: ["thematic","fintech","active-concentrated","higher-fee"],
  },
  // Fintech
  {
    symbol: "FINX", name: "Global X FinTech", expense: 0.68,
    themes: ["fintech", "emerging-tech"],
    description: "Companies digitizing finance — payments, banking, insurance, capital markets.",
    holdings: ["SQ","PYPL","ADYEN","V","MA","MELI"],
    tags: ["thematic","fintech","payments","higher-fee"],
  },
  // Defense / aerospace
  {
    symbol: "ITA", name: "iShares US Aerospace & Defense", expense: 0.40,
    themes: [],
    description: "US aerospace and defense contractors — Boeing, Lockheed, RTX, Northrop heavy.",
    holdings: [],
    tags: ["thematic","sector-bundle"],
  },
  {
    symbol: "PPA", name: "Invesco Aerospace & Defense", expense: 0.58,
    themes: [],
    description: "Broader defense exposure than ITA — includes cyber-defense and homeland security names.",
    holdings: [],
    tags: ["thematic","sector-bundle","higher-fee"],
  },
  // Infrastructure
  {
    symbol: "IGF", name: "iShares Global Infrastructure", expense: 0.41,
    themes: ["cash-flow-defensives", "income"],
    description: "Global infrastructure — utilities, pipelines, toll roads, airports, telecom towers.",
    holdings: [],
    tags: ["thematic","infrastructure","income"],
  },
  {
    symbol: "PAVE", name: "Global X US Infrastructure Development", expense: 0.47,
    themes: [],
    description: "US industrial and infrastructure companies — construction, engineering, materials, equipment.",
    holdings: [],
    tags: ["thematic","infrastructure"],
  },
  // Lithium / battery
  {
    symbol: "LIT", name: "Global X Lithium & Battery Tech", expense: 0.75,
    themes: ["clean-energy", "emerging-tech"],
    description: "Full lithium cycle — miners, refiners, and battery producers. EV supply chain play.",
    holdings: [],
    tags: ["thematic","clean-energy","higher-fee"],
  },
  // Cannabis
  {
    symbol: "MSOS", name: "AdvisorShares Pure US Cannabis", expense: 0.74,
    themes: [],
    description: "US cannabis operators — multi-state operators (MSOs), still federally Schedule III, no NASDAQ listing for plant-touching companies.",
    holdings: [],
    tags: ["thematic","speculative","higher-fee"],
  },
];

// ─── Healthcare / Biotech ──────────────────────────────────────────
const HEALTHCARE: EtfSeed[] = [
  {
    symbol: "IHI", name: "iShares US Medical Devices", expense: 0.40,
    themes: ["aging-demographics", "compounders"],
    description: "US medical device makers — surgical robotics, orthopedics, diagnostics, imaging.",
    holdings: ["ISRG","MDT"],
    tags: ["sector-bundle","healthcare"],
  },
  {
    symbol: "IBB", name: "iShares Biotechnology", expense: 0.45,
    themes: ["biotech"],
    description: "Large-cap biotech with mid-cap exposure — Gilead, Amgen, Vertex, Regeneron heavy.",
    holdings: ["VRTX","REGN","LLY","CRSP"],
    tags: ["thematic","biotech"],
  },
  {
    symbol: "XBI", name: "SPDR S&P Biotech", expense: 0.35,
    themes: ["biotech"],
    description: "Equal-weight biotech — more small/mid-cap exposure than IBB, higher volatility, binary-outcome companies.",
    holdings: ["CRSP","VRTX"],
    tags: ["thematic","biotech"],
  },
];

// ─── Dividend / Income ──────────────────────────────────────────────
const DIVIDEND: EtfSeed[] = [
  {
    symbol: "SCHD", name: "Schwab US Dividend Equity", expense: 0.06,
    themes: ["income", "cash-flow-defensives"],
    description: "Quality dividend payers screened for yield, growth, and sustainability — not just highest yield.",
    holdings: ["ABBV","PEP","KO","VZ","PG","MDT","JNJ"],
    tags: ["income","dividend-growth","low-cost"],
  },
  {
    symbol: "VYM", name: "Vanguard High Dividend Yield", expense: 0.06,
    themes: ["income"],
    description: "Broader high-yield basket than SCHD — more financials, energy, and utilities.",
    holdings: ["JNJ","PG","ABBV","KO","PEP","VZ","NEE"],
    tags: ["income","low-cost"],
  },
  {
    symbol: "VIG", name: "Vanguard Dividend Appreciation", expense: 0.06,
    themes: ["compounders", "income"],
    description: "Companies that have grown dividends for 10+ consecutive years — quality-growth tilt, not pure yield.",
    holdings: ["AAPL","MSFT","JNJ","V","MA","PG","KO","PEP","COST","UNH"],
    tags: ["income","dividend-growth","low-cost"],
  },
  {
    symbol: "DGRO", name: "iShares Core Dividend Growth", expense: 0.08,
    themes: ["compounders", "income"],
    description: "Dividend growers with payout ratios below 75% — sustainable growth, not yield traps.",
    holdings: ["AAPL","MSFT","JNJ","V","MA","PG","KO","PEP"],
    tags: ["income","dividend-growth","low-cost"],
  },
  {
    symbol: "JEPI", name: "JPMorgan Equity Premium Income", expense: 0.35,
    themes: ["income", "cash-flow-defensives"],
    description: "Covered-call income strategy on low-volatility large-caps — high monthly distribution, capped upside in rallies.",
    holdings: ["MSFT","AAPL","AVGO","KO","PG","JNJ","MA"],
    tags: ["income","active-concentrated"],
  },
  {
    symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium Income", expense: 0.35,
    themes: ["income", "ai-infrastructure"],
    description: "Covered-call strategy on Nasdaq-100 names — higher yield than JEPI, more tech and growth exposure.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","TSLA"],
    tags: ["income","active-concentrated"],
  },
  {
    symbol: "NOBL", name: "ProShares S&P 500 Dividend Aristocrats", expense: 0.35,
    themes: ["compounders", "income"],
    description: "S&P 500 companies that have increased dividends for 25+ consecutive years — equal-weight, quality tilt.",
    holdings: ["JNJ","PG","KO","PEP","WMT","ABBV","MDT"],
    tags: ["income","dividend-growth"],
  },
];

// ─── Commodities / Real Assets ─────────────────────────────────────
const COMMODITIES: EtfSeed[] = [
  {
    symbol: "GLD", name: "SPDR Gold Shares", expense: 0.40,
    themes: ["cash-flow-defensives"],
    description: "Physical gold bullion held in London vaults — inflation hedge, currency debasement, no correlation to equities.",
    holdings: [],
    tags: ["commodity"],
  },
  {
    symbol: "IAU", name: "iShares Gold Trust", expense: 0.25,
    themes: ["cash-flow-defensives"],
    description: "Lower-cost alternative to GLD — same physical gold exposure, different trustee and vault.",
    holdings: [],
    tags: ["commodity","low-cost"],
  },
  {
    symbol: "SLV", name: "iShares Silver Trust", expense: 0.50,
    themes: ["cash-flow-defensives"],
    description: "Physical silver bullion — higher beta than gold, industrial demand component.",
    holdings: [],
    tags: ["commodity"],
  },
  {
    symbol: "GDX", name: "VanEck Gold Miners", expense: 0.51,
    themes: ["cash-flow-defensives"],
    description: "Gold mining equities — operating leverage to gold price, not a direct gold proxy.",
    holdings: ["NEM","FCX"],
    tags: ["commodity"],
  },
  {
    symbol: "PDBC", name: "Invesco Optimum Yield Diversified Commodity", expense: 0.59,
    themes: [],
    description: "Broad commodity basket — energy, metals, agriculture — futures-based, optimizes roll yield.",
    holdings: [],
    tags: ["commodity","higher-fee"],
  },
];

// ─── REITs / Real Estate ───────────────────────────────────────────
const REITS: EtfSeed[] = [
  {
    symbol: "VNQ", name: "Vanguard Real Estate", expense: 0.12,
    themes: ["income"],
    description: "US REITs diversified across residential, retail, industrial, data centers, and telecom towers.",
    holdings: ["O"],
    tags: ["real-estate","income","low-cost"],
  },
  {
    symbol: "SCHH", name: "Schwab US REIT", expense: 0.07,
    themes: ["income"],
    description: "Lowest-cost broad US REIT exposure — similar holdings to VNQ.",
    holdings: ["O"],
    tags: ["real-estate","income","low-cost"],
  },
  {
    symbol: "REET", name: "iShares Global REIT", expense: 0.14,
    themes: ["income", "global-diversification"],
    description: "Global REITs — US + international real estate in one fund.",
    holdings: ["O"],
    tags: ["real-estate","income","international"],
  },
];

// ─── Compounders / Quality ─────────────────────────────────────────
const COMPOUNDERS: EtfSeed[] = [
  {
    symbol: "MOAT", name: "VanEck Morningstar Wide Moat", expense: 0.47,
    themes: ["compounders", "cash-flow-defensives"],
    description: "Equal-weight basket of companies with Morningstar wide-moat ratings — sustainable competitive advantages.",
    holdings: ["BRK.B","MA","V","MSFT","GOOGL","UNH","ISRG"],
    tags: ["thematic","income-heavy"],
  },
  {
    symbol: "COWZ", name: "Pacer US Cash Cows 100", expense: 0.49,
    themes: ["income", "compounders"],
    description: "S&P 500 companies with highest free-cash-flow yield — cash-generative, often value-tilted.",
    holdings: [],
    tags: ["income-heavy"],
  },
];

// ─── Leveraged / Inverse (use with caution) ─────────────────────────
const LEVERAGED: EtfSeed[] = [
  {
    symbol: "SSO", name: "ProShares Ultra S&P 500", expense: 0.89,
    themes: [],
    description: "2× daily S&P 500 — resets daily, decay over time, not for buy-and-hold. Educational: understand daily reset before touching this.",
    holdings: [],
    tags: ["leveraged-inverse","higher-fee"],
  },
  {
    symbol: "TQQQ", name: "ProShares UltraPro QQQ", expense: 0.88,
    themes: [],
    description: "3× daily Nasdaq-100 — extreme volatility, 80%+ drawdowns in bear markets. Educational: this is not a long-term investment, daily reset means decay compounds.",
    holdings: [],
    tags: ["leveraged-inverse","higher-fee"],
  },
  {
    symbol: "SOXL", name: "Direxion Daily Semiconductor Bull 3×", expense: 0.99,
    themes: ["ai-infrastructure"],
    description: "3× daily semiconductor index — extreme beta to chip cycle. Educational: understand daily reset and volatility decay before considering.",
    holdings: [],
    tags: ["leveraged-inverse","higher-fee","semiconductor"],
  },
];

// ─── Crypto Spot ETFs ──────────────────────────────────────────────
const CRYPTO: EtfSeed[] = [
  {
    symbol: "IBIT", name: "iShares Bitcoin Trust", expense: 0.25,
    themes: ["emerging-tech"],
    description: "Spot Bitcoin ETF — physically holds BTC, iShares custody. Most liquid spot BTC vehicle. 2024 launch.",
    holdings: [],
    tags: ["thematic"],
  },
  {
    symbol: "FBTC", name: "Fidelity Wise Origin Bitcoin Fund", expense: 0.25,
    themes: ["emerging-tech"],
    description: "Fidelity's spot Bitcoin ETF — self-custodied BTC, competitive with IBIT on liquidity and fee.",
    holdings: [],
    tags: ["thematic"],
  },
  {
    symbol: "ETHA", name: "iShares Ethereum Trust", expense: 0.25,
    themes: ["emerging-tech"],
    description: "Spot Ethereum ETF — physically holds ETH. Launched 2024 alongside BTC spot products.",
    holdings: [],
    tags: ["thematic"],
  },
  {
    symbol: "BITO", name: "ProShares Bitcoin Strategy ETF", expense: 0.95,
    themes: ["emerging-tech"],
    description: "Bitcoin futures-based ETF (not spot) — rolls CME Bitcoin futures monthly, contango drag possible. Pre-dates spot ETFs.",
    holdings: [],
    tags: ["thematic", "higher-fee"],
  },
];

// ─── Water / Natural Resources ─────────────────────────────────────
const NATURAL_RESOURCES: EtfSeed[] = [
  {
    symbol: "PHO", name: "Invesco Water Resources", expense: 0.60,
    themes: ["cash-flow-defensives"],
    description: "US-listed water infrastructure and treatment companies — pipes, pumps, utilities, filtration.",
    holdings: [],
    tags: ["thematic", "infrastructure"],
  },
  {
    symbol: "CGW", name: "Invesco S&P Global Water Index", expense: 0.57,
    themes: ["global-diversification", "cash-flow-defensives"],
    description: "Global water infrastructure — broader than PHO, includes international water utilities and tech.",
    holdings: [],
    tags: ["thematic", "infrastructure", "international"],
  },
  {
    symbol: "URA", name: "Global X Uranium", expense: 0.69,
    themes: ["clean-energy"],
    description: "Uranium miners and physical uranium — nuclear energy supply chain, inelastic demand from reactor fleet.",
    holdings: [],
    tags: ["commodity", "thematic", "higher-fee"],
  },
  {
    symbol: "REMX", name: "VanEck Rare Earth/Strategic Metals", expense: 0.58,
    themes: ["ai-infrastructure", "clean-energy"],
    description: "Rare earth miners and refiners — neodymium, dysprosium for magnets in EVs, wind turbines, defense, and electronics.",
    holdings: [],
    tags: ["commodity", "thematic"],
  },
  {
    symbol: "COPX", name: "Global X Copper Miners", expense: 0.65,
    themes: ["clean-energy", "cash-flow-defensives"],
    description: "Copper mining companies — electrification and grid buildout thesis, supply-constrained.",
    holdings: ["FCX"],
    tags: ["commodity", "thematic", "higher-fee"],
  },
  {
    symbol: "GUNR", name: "FlexShares Global Upstream Natural Resources", expense: 0.46,
    themes: ["cash-flow-defensives"],
    description: "Broad natural resources — energy, metals, agriculture, timber, water. Inflation-hedge basket.",
    holdings: [],
    tags: ["commodity", "international"],
  },
];

// ─── ESG ───────────────────────────────────────────────────────────
const ESG: EtfSeed[] = [
  {
    symbol: "ESGU", name: "iShares ESG Aware MSCI USA", expense: 0.15,
    themes: ["compounders"],
    description: "S&P 500–like exposure with ESG screen — excludes worst-in-class on environmental, social, governance metrics.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","V","MA","JNJ","PG","KO"],
    tags: ["broad-market"],
  },
  {
    symbol: "ESGD", name: "iShares ESG Aware MSCI EAFE", expense: 0.20,
    themes: ["global-diversification"],
    description: "Developed international with ESG screen — Europe, Japan, Australia, ex-fossil-fuel laggards and governance risks.",
    holdings: ["NSRGY","ASML","ADYEN"],
    tags: ["international"],
  },
  {
    symbol: "ESGE", name: "iShares ESG Aware MSCI EM", expense: 0.25,
    themes: ["global-diversification"],
    description: "Emerging markets with ESG screen — filters out state-owned enterprises with poor governance and high carbon intensity.",
    holdings: ["TSM","BABA"],
    tags: ["international", "emerging-markets"],
  },
  {
    symbol: "SUSA", name: "iShares MSCI USA ESG Select", expense: 0.25,
    themes: ["compounders"],
    description: "Tighter ESG screen than ESGU — only sector leaders, more concentrated, higher active share vs S&P 500.",
    holdings: ["AAPL","MSFT","GOOGL","V","MA","PG","KO"],
    tags: ["broad-market"],
  },
];

// ─── Additional Factors ────────────────────────────────────────────
const MORE_FACTORS: EtfSeed[] = [
  {
    symbol: "AVDV", name: "Avantis International Small Cap Value", expense: 0.36,
    themes: ["global-diversification"],
    description: "International developed small-cap value — profitability + value screens, academic-factor approach from former Dimensional team.",
    holdings: [],
    tags: ["international", "small-cap", "income-heavy"],
  },
  {
    symbol: "DFAC", name: "Dimensional U.S. Core Equity 2", expense: 0.17,
    themes: ["compounders"],
    description: "Systematic US total-market exposure tilted mildly toward small-cap, value, and profitability factors.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","JNJ","V","MA"],
    tags: ["broad-market"],
  },
  {
    symbol: "DFSV", name: "Dimensional US Small Cap Value", expense: 0.29,
    themes: ["income"],
    description: "Deep small-cap value — bottom decile by size, screens for profitability and low relative price. Academic factor implementation.",
    holdings: [],
    tags: ["small-cap", "income-heavy"],
  },
  {
    symbol: "SPLV", name: "Invesco S&P 500 Low Volatility", expense: 0.25,
    themes: ["cash-flow-defensives", "income"],
    description: "100 lowest-volatility S&P 500 stocks, inverse-volatility weighted — utilities, staples, healthcare heavy.",
    holdings: ["JNJ","PG","KO","PEP","WMT","MDT","DUK","SO"],
    tags: ["defensive", "income"],
  },
  {
    symbol: "FNDA", name: "Schwab Fundamental US Small Company", expense: 0.25,
    themes: ["income"],
    description: "Fundamentally weighted small-cap — weights by sales, cash flow, dividends + buybacks, not market cap. Reduces bubble exposure.",
    holdings: [],
    tags: ["small-cap", "income-heavy"],
  },
  {
    symbol: "COWZ", name: "Pacer US Cash Cows 100", expense: 0.49,
    themes: ["income", "compounders"],
    description: "S&P 500 companies with highest free-cash-flow yield — screens for cash generation, often value-tilted, energy and healthcare heavy.",
    holdings: [],
    tags: ["income-heavy"],
  },
];

// ─── Additional Bonds ──────────────────────────────────────────────
const MORE_BONDS: EtfSeed[] = [
  {
    symbol: "EMB", name: "iShares JP Morgan USD Emerging Markets Bond", expense: 0.39,
    themes: ["global-diversification", "income"],
    description: "USD-denominated sovereign and quasi-sovereign EM bonds — higher yield than US corporates, political and currency risk.",
    holdings: [],
    tags: ["international", "emerging-markets", "income"],
  },
  {
    symbol: "MUB", name: "iShares National Muni Bond", expense: 0.05,
    themes: ["cash-flow-defensives", "income"],
    description: "National municipal bonds — federal tax-free income. Useful for high earners in taxable accounts.",
    holdings: [],
    tags: ["defensive", "income", "low-cost"],
  },
  {
    symbol: "BIV", name: "Vanguard Intermediate-Term Bond", expense: 0.04,
    themes: ["cash-flow-defensives"],
    description: "Broad intermediate-term US investment-grade bonds — Treasury, agency, and corporate blend. Core bond holding.",
    holdings: [],
    tags: ["defensive", "low-cost"],
  },
  {
    symbol: "VCSH", name: "Vanguard Short-Term Corporate Bond", expense: 0.04,
    themes: ["cash-flow-defensives"],
    description: "Short-term investment-grade corporate bonds — low duration risk, slightly higher yield than Treasuries.",
    holdings: [],
    tags: ["defensive", "low-cost", "income"],
  },
  {
    symbol: "VCIT", name: "Vanguard Intermediate-Term Corporate Bond", expense: 0.04,
    themes: ["cash-flow-defensives"],
    description: "Intermediate-term investment-grade corporates — sweet spot between yield and duration risk.",
    holdings: [],
    tags: ["defensive", "low-cost", "income"],
  },
  {
    symbol: "MBB", name: "iShares MBS", expense: 0.06,
    themes: ["cash-flow-defensives"],
    description: "Agency mortgage-backed securities — government-guaranteed, prepayment risk, yield premium over Treasuries.",
    holdings: [],
    tags: ["defensive", "low-cost"],
  },
  {
    symbol: "USHY", name: "iShares Broad USD High Yield Corporate Bond", expense: 0.15,
    themes: ["income"],
    description: "Broad high-yield corporate — wider coverage than HYG, lower cost, good for income-seeking investors who understand credit risk.",
    holdings: [],
    tags: ["income", "low-cost"],
  },
  {
    symbol: "FLOT", name: "iShares Floating Rate Bond", expense: 0.15,
    themes: ["cash-flow-defensives"],
    description: "Investment-grade floating-rate notes — rate resets periodically, near-zero duration, rate-hike beneficiary.",
    holdings: [],
    tags: ["defensive"],
  },
];

// ─── Additional International ──────────────────────────────────────
const MORE_INTL: EtfSeed[] = [
  {
    symbol: "KWEB", name: "KraneShares CSI China Internet", expense: 0.69,
    themes: ["emerging-tech", "global-diversification"],
    description: "China internet and tech — Alibaba, Tencent, Meituan, Baidu. High policy risk and regulatory exposure.",
    holdings: ["BABA"],
    tags: ["international", "emerging-markets", "thematic", "higher-fee"],
  },
  {
    symbol: "FLIN", name: "Franklin FTSE India", expense: 0.19,
    themes: ["global-diversification"],
    description: "Low-cost India equity — broad market-cap coverage, financials and tech heavy. Strong demographic tailwind.",
    holdings: [],
    tags: ["international", "emerging-markets", "low-cost"],
  },
  {
    symbol: "FLJP", name: "Franklin FTSE Japan", expense: 0.09,
    themes: ["global-diversification"],
    description: "Low-cost Japan equity — broad market-cap coverage, yen-denominated, Toyota/Sony/Mitsubishi heavy.",
    holdings: [],
    tags: ["international", "low-cost"],
  },
  {
    symbol: "BBEU", name: "JPMorgan BetaBuilders Europe", expense: 0.09,
    themes: ["global-diversification"],
    description: "Low-cost developed Europe — UK, France, Switzerland, Germany heavy. Broad and cheap.",
    holdings: ["NSRGY","ASML"],
    tags: ["international", "low-cost"],
  },
  {
    symbol: "VT", name: "Vanguard Total World Stock", expense: 0.07,
    themes: ["compounders", "global-diversification"],
    description: "Every investable stock market in one ETF — ~60% US, ~40% international, market-cap weighted. The ultimate one-fund equity portfolio.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","TSM","ASML","NSRGY"],
    tags: ["broad-market", "international", "low-cost"],
  },
  {
    symbol: "FXI", name: "iShares China Large-Cap", expense: 0.74,
    themes: ["global-diversification"],
    description: "50 largest Chinese stocks listed in Hong Kong — financials and tech heavy, state-owned enterprise exposure.",
    holdings: ["BABA"],
    tags: ["international", "emerging-markets", "higher-fee"],
  },
  {
    symbol: "EWG", name: "iShares MSCI Germany", expense: 0.51,
    themes: ["global-diversification"],
    description: "German equities — SAP, Siemens, Allianz, Deutsche Telekom heavy. Eurozone's largest economy.",
    holdings: [],
    tags: ["international"],
  },
  {
    symbol: "EWU", name: "iShares MSCI United Kingdom", expense: 0.50,
    themes: ["global-diversification", "income"],
    description: "UK equities — HSBC, AstraZeneca, Shell, Unilever heavy. Higher dividend yield than US markets.",
    holdings: [],
    tags: ["international", "income"],
  },
];

// ─── Additional Thematics ──────────────────────────────────────────
const MORE_THEMATICS: EtfSeed[] = [
  {
    symbol: "SKYY", name: "First Trust Cloud Computing", expense: 0.60,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "Cloud infrastructure and software — AWS/Azure/GCP adjacent names, SaaS companies, data center REITs.",
    holdings: ["MSFT","AMZN","GOOGL","CRM","ORCL"],
    tags: ["thematic", "cybersecurity"],
  },
  {
    symbol: "ESPO", name: "VanEck Video Gaming and eSports", expense: 0.55,
    themes: ["emerging-tech"],
    description: "Video game publishers, hardware, and esports — NVIDIA, Tencent, Nintendo, Activision exposure.",
    holdings: ["NVDA"],
    tags: ["thematic"],
  },
  {
    symbol: "ARKW", name: "ARK Next Generation Internet", expense: 0.75,
    themes: ["emerging-tech", "ai-infrastructure", "fintech"],
    description: "Active fund — cloud, AI, crypto, blockchain, digital payments. ARK's internet and platform thesis.",
    holdings: ["TSLA","SQ","COIN","PLTR","META"],
    tags: ["thematic", "active-concentrated", "higher-fee"],
  },
  {
    symbol: "GRID", name: "First Trust Clean Edge Smart Grid Infrastructure", expense: 0.58,
    themes: ["clean-energy", "cash-flow-defensives"],
    description: "Electric grid modernization — smart meters, transmission, energy storage, distributed generation. Infrastructure + clean energy crossover.",
    holdings: [],
    tags: ["thematic", "infrastructure", "clean-energy"],
  },
  {
    symbol: "IFRA", name: "iShares US Infrastructure", expense: 0.30,
    themes: ["cash-flow-defensives"],
    description: "US infrastructure — utilities, railroads, pipelines, engineering firms. Lower volatility, regulated returns.",
    holdings: [],
    tags: ["thematic", "infrastructure", "defensive"],
  },
  {
    symbol: "ROBO", name: "Robo Global Robotics & Automation", expense: 0.95,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "Robotics and industrial automation — factory automation, surgical robots, autonomous vehicles, drones.",
    holdings: ["ISRG","NVDA"],
    tags: ["thematic", "higher-fee"],
  },
  {
    symbol: "DRIV", name: "Global X Autonomous & Electric Vehicles", expense: 0.68,
    themes: ["clean-energy", "emerging-tech", "ai-infrastructure"],
    description: "EV and autonomous driving supply chain — automakers, battery, lidar, chips, charging infrastructure.",
    holdings: ["TSLA","NVDA","AMD"],
    tags: ["thematic", "clean-energy", "higher-fee"],
  },
  {
    symbol: "KRE", name: "SPDR S&P Regional Banking", expense: 0.35,
    themes: ["fintech"],
    description: "US regional banks — equal-weight, more rate-sensitive than money-center banks, consolidation thesis.",
    holdings: [],
    tags: ["sector-bundle", "cyclical"],
  },
];

// ─── Quick Hits (fill gaps to 150+) ────────────────────────────────
const QUICK_HITS: EtfSeed[] = [
  {
    symbol: "SPY", name: "SPDR S&P 500 ETF Trust", expense: 0.09,
    themes: ["compounders", "cash-flow-defensives"],
    description: "The original S&P 500 ETF — most liquid, highest AUM. Slightly higher fee than VOO/IVV but tighter spreads for active traders.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","BRK.B","AVGO","UNH","JNJ","V","MA","WMT","PG","KO","ABBV","LLY","COST"],
    tags: ["broad-market"],
  },
  {
    symbol: "VGT", name: "Vanguard Information Technology", expense: 0.10,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "US tech sector — Apple, Microsoft, NVIDIA heavy. Broad tech exposure at low cost.",
    holdings: ["AAPL","MSFT","NVDA","AVGO","CRM","ORCL","CSCO","ACN","ADBE","AMD"],
    tags: ["sector-bundle", "growth-tilt", "low-cost"],
  },
  {
    symbol: "DIA", name: "SPDR Dow Jones Industrial Average", expense: 0.16,
    themes: ["compounders", "cash-flow-defensives", "income"],
    description: "The 30 Dow stocks — price-weighted, blue-chip, industrials and financials heavy. Oldest ETF still traded.",
    holdings: ["AAPL","MSFT","JNJ","V","JPM","WMT","PG","KO","HD","MCD"],
    tags: ["broad-market", "income"],
  },
  {
    symbol: "IWF", name: "iShares Russell 1000 Growth", expense: 0.19,
    themes: ["ai-infrastructure", "compounders", "emerging-tech"],
    description: "Large-cap growth — Apple, Microsoft, NVIDIA, Amazon heavy. The growth benchmark alongside IWD.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","LLY","TSLA","V","MA"],
    tags: ["broad-market", "growth-tilt"],
  },
  {
    symbol: "IWD", name: "iShares Russell 1000 Value", expense: 0.19,
    themes: ["income", "cash-flow-defensives"],
    description: "Large-cap value — Berkshire, J&J, JP Morgan, Exxon heavy. The value benchmark alongside IWF.",
    holdings: ["BRK.B","JNJ","JPM","XOM","PG","WMT","KO","CVX","BAC","WFC"],
    tags: ["broad-market", "income-heavy"],
  },
  {
    symbol: "SCHG", name: "Schwab US Large-Cap Growth", expense: 0.04,
    themes: ["ai-infrastructure", "compounders"],
    description: "Low-cost large-cap growth — similar to VUG but Schwab. Apple, Microsoft, NVIDIA heavy.",
    holdings: ["AAPL","MSFT","NVDA","GOOGL","META","AVGO","LLY","TSLA","V","MA"],
    tags: ["broad-market", "growth-tilt", "low-cost"],
  },
  {
    symbol: "SCHV", name: "Schwab US Large-Cap Value", expense: 0.04,
    themes: ["income", "cash-flow-defensives"],
    description: "Low-cost large-cap value — Berkshire, J&J, JP Morgan heavy. Dividend-oriented.",
    holdings: ["BRK.B","JNJ","JPM","XOM","PG","WMT","KO","BAC","WFC","CVX"],
    tags: ["broad-market", "income-heavy", "low-cost"],
  },
  {
    symbol: "IYR", name: "iShares US Real Estate", expense: 0.39,
    themes: ["income"],
    description: "Broad US REIT exposure — data centers, towers, industrial, residential, retail, healthcare. Higher fee than VNQ/SCHH.",
    holdings: ["O","PLD","AMT","EQIX","CCI","SPG","PSA"],
    tags: ["real-estate", "income"],
  },
  {
    symbol: "XME", name: "SPDR S&P Metals & Mining", expense: 0.35,
    themes: ["cash-flow-defensives"],
    description: "US metals and mining — equal-weight, steel, copper, aluminum, coal. Cyclical, commodity-price sensitive.",
    holdings: ["FCX","NEM"],
    tags: ["sector-bundle", "commodity", "cyclical"],
  },
  {
    symbol: "XOP", name: "SPDR S&P Oil & Gas Exploration & Production", expense: 0.35,
    themes: [],
    description: "US oil and gas E&P companies — equal-weight, high beta to crude prices, consolidation thesis in Permian.",
    holdings: [],
    tags: ["sector-bundle", "commodity", "cyclical", "energy-commodity"],
  },
  {
    symbol: "PFF", name: "iShares Preferred & Income Securities", expense: 0.46,
    themes: ["income"],
    description: "US preferred stocks — bank, insurance, utility preferreds. Higher yield than common stock, tax-advantaged for qualified dividends.",
    holdings: [],
    tags: ["income", "income-heavy"],
  },
  {
    symbol: "IJH", name: "iShares Core S&P Mid-Cap", expense: 0.05,
    themes: ["compounders"],
    description: "S&P 400 mid-cap — blend of growth and value, historically higher long-term returns than large-cap with moderate extra volatility.",
    holdings: [],
    tags: ["broad-market", "low-cost"],
  },
  {
    symbol: "IJR", name: "iShares Core S&P Small-Cap 600", expense: 0.06,
    themes: ["compounders"],
    description: "S&P 600 small-cap — profitability screen means higher quality than Russell 2000. Long-term factor premium potential.",
    holdings: [],
    tags: ["broad-market", "small-cap", "low-cost"],
  },
  {
    symbol: "VXF", name: "Vanguard Extended Market", expense: 0.06,
    themes: ["compounders"],
    description: "Every US stock outside the S&P 500 — mid and small caps in one fund. Pairs with VOO to make VTI.",
    holdings: [],
    tags: ["broad-market", "small-cap", "low-cost"],
  },
  {
    symbol: "XLU", name: "Utilities Select Sector SPDR", expense: 0.09,
    themes: ["income", "cash-flow-defensives"],
    description: "S&P 500 utilities — regulated monopolies, rate-sensitive, bond-proxy income. Defensive sector with steady dividends.",
    holdings: ["NEE","DUK","SO","D","AEP","EXC"],
    tags: ["sector-bundle", "defensive", "income"],
  },
  {
    symbol: "XLI", name: "Industrial Select Sector SPDR", expense: 0.09,
    themes: ["cash-flow-defensives"],
    description: "S&P 500 industrials — aerospace, defense, railroads, machinery, waste management. Cyclical but diversified.",
    holdings: [],
    tags: ["sector-bundle"],
  },
  {
    symbol: "XLB", name: "Materials Select Sector SPDR", expense: 0.09,
    themes: ["cash-flow-defensives"],
    description: "S&P 500 materials — chemicals, metals, packaging, construction materials. Commodity-price sensitive.",
    holdings: ["FCX","NEM"],
    tags: ["sector-bundle", "commodity", "cyclical"],
  },
  {
    symbol: "IXUS", name: "iShares Core MSCI Total International Stock", expense: 0.07,
    themes: ["global-diversification"],
    description: "Total international — developed + emerging, all market caps. iShares' answer to VXUS.",
    holdings: ["TSM","NSRGY","ASML","ADYEN","BABA","MELI"],
    tags: ["international", "low-cost"],
  },
  {
    symbol: "SCHF", name: "Schwab International Equity", expense: 0.06,
    themes: ["global-diversification"],
    description: "Low-cost developed international — large and mid-cap, Europe and Pacific. Pairs with SCHE for full international.",
    holdings: ["NSRGY","ASML","ADYEN"],
    tags: ["international", "low-cost"],
  },
];

// ─── Assemble ───────────────────────────────────────────────────────
const ALL_SEEDS: EtfSeed[] = [
  ...BROAD_US,
  ...MID_SMALL,
  ...INTERNATIONAL,
  ...BONDS,
  ...SECTORS,
  ...FACTORS,
  ...THEMATICS,
  ...HEALTHCARE,
  ...DIVIDEND,
  ...COMMODITIES,
  ...REITS,
  ...COMPOUNDERS,
  ...LEVERAGED,
  ...CRYPTO,
  ...NATURAL_RESOURCES,
  ...ESG,
  ...MORE_FACTORS,
  ...MORE_BONDS,
  ...MORE_INTL,
  ...MORE_THEMATICS,
  ...QUICK_HITS,
];

export const ETFS: ETF[] = ALL_SEEDS.map((e) => enrichEtfTags(e as ETF));

const CURATED_BY_SYMBOL = new Map(ETFS.map((e) => [e.symbol, e]));

export function isCuratedEtf(symbol: string): boolean {
  return CURATED_BY_SYMBOL.has(symbol.trim().toUpperCase());
}

export function curatedEtfCount(): number {
  return CURATED_BY_SYMBOL.size;
}

export const etfBySymbol = (sym: string): ETF | undefined => {
  const key = sym.trim().toUpperCase();
  const curated = CURATED_BY_SYMBOL.get(key);
  if (curated) return curated;
  const entry = catalogEntryBySymbol(key);
  return entry ? catalogEntryToEtf(entry) : undefined;
};
