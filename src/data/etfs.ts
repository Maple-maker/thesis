import type { ETF } from "@/store/types";

// Curated illustrative ETF universe with representative top holdings.
// Holdings are simplified picks from our mock stock universe so that the
// ETF-overlap engine has meaningful matches in the prototype.
export const ETFS: ETF[] = [
  // --- Broad market ---
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    expense: 0.03,
    themes: ["compounders", "cash-flow-defensives"],
    description:
      "The 500 largest US companies, market-cap weighted. The default S&P 500 vehicle.",
    holdings: [
      "AAPL", "MSFT", "NVDA", "GOOGL", "META", "BRK.B", "AVGO", "JNJ",
      "UNH", "V", "MA", "WMT", "PG", "KO", "PEP", "ABBV", "LLY", "COST",
    ],
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market",
    expense: 0.03,
    themes: ["compounders", "cash-flow-defensives"],
    description: "Total US equity exposure — large, mid, and small caps in one fund.",
    holdings: [
      "AAPL", "MSFT", "NVDA", "GOOGL", "META", "BRK.B", "AVGO", "JNJ",
      "UNH", "V", "MA", "WMT", "PG", "KO", "ABBV", "LLY", "TSLA", "PLTR",
    ],
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    expense: 0.2,
    themes: ["ai-infrastructure", "compounders"],
    description: "Nasdaq-100 — concentrated in mega-cap US tech and growth.",
    holdings: [
      "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AVGO", "TSLA", "AMD",
      "ARM", "CRWD", "PANW", "ASML", "COST", "PEP",
    ],
  },

  // --- AI / Tech infrastructure ---
  {
    symbol: "SMH",
    name: "VanEck Semiconductor",
    expense: 0.35,
    themes: ["ai-infrastructure"],
    description: "The 25 largest US-listed semiconductor companies — direct AI compute exposure.",
    holdings: ["NVDA", "TSM", "AVGO", "AMD", "ARM", "ASML"],
  },
  {
    symbol: "SOXX",
    name: "iShares Semiconductor",
    expense: 0.35,
    themes: ["ai-infrastructure"],
    description: "Alternative semi ETF — similar holdings to SMH with different weighting methodology.",
    holdings: ["NVDA", "AVGO", "TSM", "AMD", "ARM"],
  },
  {
    symbol: "AIQ",
    name: "Global X Artificial Intelligence",
    expense: 0.68,
    themes: ["ai-infrastructure", "emerging-tech"],
    description: "Companies developing or applying AI across hardware and software.",
    holdings: ["NVDA", "MSFT", "GOOGL", "META", "AVGO", "PLTR", "CRWD", "ARM"],
  },

  // --- Cybersecurity ---
  {
    symbol: "HACK",
    name: "ETFMG Prime Cyber Security",
    expense: 0.6,
    themes: ["cybersecurity"],
    description: "Pure-play cybersecurity basket — vendors and infrastructure providers.",
    holdings: ["CRWD", "PANW", "ZS", "FTNT", "PLTR"],
  },
  {
    symbol: "CIBR",
    name: "First Trust NASDAQ Cybersecurity",
    expense: 0.6,
    themes: ["cybersecurity"],
    description: "Alternative cybersecurity ETF — similar names, NASDAQ-screened.",
    holdings: ["CRWD", "PANW", "ZS", "FTNT", "PLTR"],
  },

  // --- Clean energy ---
  {
    symbol: "ICLN",
    name: "iShares Global Clean Energy",
    expense: 0.41,
    themes: ["clean-energy"],
    description: "Global clean energy producers and equipment makers.",
    holdings: ["FSLR", "ENPH", "NEE", "BEP", "VST"],
  },
  {
    symbol: "TAN",
    name: "Invesco Solar",
    expense: 0.67,
    themes: ["clean-energy"],
    description: "Concentrated solar exposure — high beta to panel pricing and policy.",
    holdings: ["FSLR", "ENPH"],
  },
  {
    symbol: "QCLN",
    name: "First Trust Clean Edge Green Energy",
    expense: 0.59,
    themes: ["clean-energy", "emerging-tech"],
    description: "Broader clean-energy basket including EVs and storage.",
    holdings: ["FSLR", "ENPH", "TSLA", "NEE"],
  },

  // --- Healthcare / Aging ---
  {
    symbol: "XLV",
    name: "Health Care Select Sector",
    expense: 0.09,
    themes: ["aging-demographics", "cash-flow-defensives"],
    description: "S&P 500 healthcare — large pharma, medtech, insurers.",
    holdings: ["LLY", "JNJ", "UNH", "ABBV", "MDT", "ISRG", "VRTX", "REGN"],
  },
  {
    symbol: "IHI",
    name: "iShares US Medical Devices",
    expense: 0.4,
    themes: ["aging-demographics", "compounders"],
    description: "US medical device makers — surgical robotics, diagnostics, devices.",
    holdings: ["ISRG", "MDT"],
  },
  {
    symbol: "IBB",
    name: "iShares Biotechnology",
    expense: 0.45,
    themes: ["biotech"],
    description: "Large-cap biotech with some mid-cap exposure.",
    holdings: ["VRTX", "REGN", "LLY", "CRSP"],
  },
  {
    symbol: "ARKG",
    name: "ARK Genomic Revolution",
    expense: 0.75,
    themes: ["biotech", "emerging-tech"],
    description: "Active fund concentrated in gene-editing, diagnostics, and longevity.",
    holdings: ["CRSP", "REGN", "VRTX"],
  },

  // --- Income / Dividend ---
  {
    symbol: "SCHD",
    name: "Schwab US Dividend Equity",
    expense: 0.06,
    themes: ["income", "cash-flow-defensives"],
    description: "Quality dividend payers screened for sustainability and growth.",
    holdings: ["ABBV", "PEP", "KO", "VZ", "PG", "MDT", "JNJ"],
  },
  {
    symbol: "VYM",
    name: "Vanguard High Dividend Yield",
    expense: 0.06,
    themes: ["income"],
    description: "Broader high-yield basket than SCHD with more financials and utilities.",
    holdings: ["JNJ", "PG", "ABBV", "KO", "PEP", "VZ", "NEE"],
  },
  {
    symbol: "JEPI",
    name: "JPMorgan Equity Premium Income",
    expense: 0.35,
    themes: ["income", "cash-flow-defensives"],
    description: "Covered-call income strategy — high monthly distribution, capped upside.",
    holdings: ["MSFT", "AAPL", "AVGO", "KO", "PG", "JNJ", "MA"],
  },

  // --- Consumer staples & defensives ---
  {
    symbol: "XLP",
    name: "Consumer Staples Select Sector",
    expense: 0.09,
    themes: ["consumer-staples", "cash-flow-defensives", "income"],
    description: "S&P staples — household, food, beverage giants.",
    holdings: ["PG", "KO", "PEP", "COST", "WMT", "MDLZ"],
  },

  // --- Quality compounders ---
  {
    symbol: "MOAT",
    name: "VanEck Morningstar Wide Moat",
    expense: 0.47,
    themes: ["compounders", "cash-flow-defensives"],
    description: "Equal-weighted basket of companies with Morningstar wide-moat ratings.",
    holdings: ["BRK.B", "MA", "V", "MSFT", "GOOGL", "UNH", "ISRG"],
  },
  {
    symbol: "QUAL",
    name: "iShares MSCI USA Quality Factor",
    expense: 0.15,
    themes: ["compounders"],
    description: "US large-caps screened for high ROE, stable earnings, low leverage.",
    holdings: ["AAPL", "MSFT", "NVDA", "META", "V", "MA", "COST", "LLY"],
  },

  // --- Fintech ---
  {
    symbol: "FINX",
    name: "Global X FinTech",
    expense: 0.68,
    themes: ["fintech", "emerging-tech"],
    description: "Companies digitizing finance — payments, banking, capital markets.",
    holdings: ["SQ", "PYPL", "ADYEN", "V", "MA", "MELI"],
  },
  {
    symbol: "IPAY",
    name: "Amplify Mobile Payments",
    expense: 0.75,
    themes: ["fintech"],
    description: "Payments ecosystem — networks, processors, and acquirers.",
    holdings: ["V", "MA", "SQ", "PYPL", "ADYEN"],
  },

  // --- International / Global ---
  {
    symbol: "VXUS",
    name: "Vanguard Total International Stock",
    expense: 0.07,
    themes: ["global-diversification"],
    description: "Everything outside the US — developed and emerging markets.",
    holdings: ["TSM", "NSRGY", "ASML", "ADYEN", "BABA", "MELI", "ENB"],
  },
  {
    symbol: "VWO",
    name: "Vanguard FTSE Emerging Markets",
    expense: 0.07,
    themes: ["global-diversification"],
    description: "Emerging-market exposure weighted heavily to China, India, Taiwan.",
    holdings: ["TSM", "BABA", "MELI"],
  },
  {
    symbol: "EWZ",
    name: "iShares MSCI Brazil",
    expense: 0.59,
    themes: ["global-diversification"],
    description: "Single-country bet on Brazil — commodities and financials heavy.",
    holdings: ["MELI"],
  },

  // --- Real assets / income hybrids ---
  {
    symbol: "VNQ",
    name: "Vanguard Real Estate",
    expense: 0.12,
    themes: ["income"],
    description: "US REITs — diversified across residential, retail, industrial, and data centers.",
    holdings: ["O"],
  },

  // --- Emerging tech / disruptive ---
  {
    symbol: "ARKK",
    name: "ARK Innovation",
    expense: 0.75,
    themes: ["emerging-tech", "biotech"],
    description: "Active high-conviction fund — disruptive innovation across biotech, AI, fintech.",
    holdings: ["TSLA", "CRSP", "SQ", "PLTR", "RBLX"],
  },
  {
    symbol: "BOTZ",
    name: "Global X Robotics & AI",
    expense: 0.68,
    themes: ["emerging-tech", "ai-infrastructure"],
    description: "Robotics, industrial automation, and applied AI.",
    holdings: ["NVDA", "ISRG", "ARM", "TSLA"],
  },
];

export const etfBySymbol = (sym: string): ETF | undefined =>
  ETFS.find((e) => e.symbol === sym);
