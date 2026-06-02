/**
 * Builds src/data/etf-catalog.generated.ts — US-listed ETFs for screener search.
 * Curated overlap/thesis data stays in etfs.ts; catalog is symbol + name + fee + class.
 *
 * Run: node scripts/generate-etf-catalog.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../src/data/etf-catalog.generated.ts");

/** @type {Record<string, string>} */
const ISSUERS = {
  vanguard: "Vanguard",
  ishares: "iShares",
  spdr: "SPDR",
  invesco: "Invesco",
  schwab: "Schwab",
  globalx: "Global X",
  vaneck: "VanEck",
  firsttrust: "First Trust",
  proshares: "ProShares",
  direxion: "Direxion",
  ark: "ARK",
  jpmorgan: "JPMorgan",
  fidelity: "Fidelity",
  statestreet: "State Street",
  wisdomtree: "WisdomTree",
  other: "Other",
};

/**
 * @typedef {[string, string, number|null, string, string?]} Row
 * symbol, name, expense|null, assetClass, issuerKey?
 */

/** @type {Row[]} */
const rows = [];

function add(symbol, name, expense, assetClass, issuer = "other") {
  rows.push([symbol.toUpperCase(), name, expense, assetClass, issuer]);
}

function addMany(list, assetClass, issuer = "other") {
  for (const [sym, name, exp] of list) add(sym, name, exp ?? null, assetClass, issuer);
}

// ── Broad US equity ──
addMany(
  [
    ["SPY", "SPDR S&P 500 ETF Trust", 0.09],
    ["IVV", "iShares Core S&P 500 ETF", 0.03],
    ["VOO", "Vanguard S&P 500 ETF", 0.03],
    ["VTI", "Vanguard Total Stock Market ETF", 0.03],
    ["ITOT", "iShares Core S&P Total U.S. Stock Market ETF", 0.03],
    ["SCHB", "Schwab U.S. Broad Market ETF", 0.03],
    ["SCHX", "Schwab U.S. Large-Cap ETF", 0.03],
    ["VV", "Vanguard Large-Cap ETF", 0.04],
    ["VUG", "Vanguard Growth ETF", 0.04],
    ["VTV", "Vanguard Value ETF", 0.04],
    ["IWF", "iShares Russell 1000 Growth ETF", 0.19],
    ["IWD", "iShares Russell 1000 Value ETF", 0.19],
    ["RSP", "Invesco S&P 500 Equal Weight ETF", 0.2],
    ["QQQ", "Invesco QQQ Trust", 0.2],
    ["QQQM", "Invesco NASDAQ 100 ETF", 0.15],
    ["DIA", "SPDR Dow Jones Industrial Average ETF", 0.16],
    ["IWM", "iShares Russell 2000 ETF", 0.19],
    ["VB", "Vanguard Small-Cap ETF", 0.05],
    ["VBK", "Vanguard Small-Cap Growth ETF", 0.07],
    ["VBR", "Vanguard Small-Cap Value ETF", 0.07],
    ["IJR", "iShares Core S&P Small-Cap ETF", 0.06],
    ["IJH", "iShares Core S&P Mid-Cap ETF", 0.05],
    ["VO", "Vanguard Mid-Cap ETF", 0.04],
    ["MDY", "SPDR S&P MidCap 400 ETF Trust", 0.23],
    ["SPLG", "SPDR Portfolio S&P 500 ETF", 0.02],
    ["SPTM", "SPDR Portfolio S&P 1500 Composite Stock Market ETF", 0.03],
    ["SCHG", "Schwab U.S. Large-Cap Growth ETF", 0.04],
    ["SCHV", "Schwab U.S. Large-Cap Value ETF", 0.04],
    ["MGK", "Vanguard Mega Cap Growth ETF", 0.07],
    ["MGV", "Vanguard Mega Cap Value ETF", 0.07],
  ],
  "us-equity",
  "vanguard"
);

// ── International equity ──
addMany(
  [
    ["VXUS", "Vanguard Total International Stock ETF", 0.07],
    ["VEA", "Vanguard FTSE Developed Markets ETF", 0.05],
    ["VWO", "Vanguard FTSE Emerging Markets ETF", 0.08],
    ["IEFA", "iShares Core MSCI EAFE ETF", 0.07],
    ["IEMG", "iShares Core MSCI Emerging Markets ETF", 0.09],
    ["EFA", "iShares MSCI EAFE ETF", 0.32],
    ["EEM", "iShares MSCI Emerging Markets ETF", 0.68],
    ["SCHF", "Schwab International Equity ETF", 0.06],
    ["SCHE", "Schwab Emerging Markets Equity ETF", 0.11],
    ["IXUS", "iShares Core MSCI Total International Stock ETF", 0.07],
    ["SPDW", "SPDR Portfolio Developed World ex-US ETF", 0.04],
    ["SPEM", "SPDR Portfolio Emerging Markets ETF", 0.07],
    ["VSS", "Vanguard FTSE All-World ex-US Small-Cap ETF", 0.07],
    ["EFG", "iShares MSCI EAFE Growth ETF", 0.4],
    ["EFV", "iShares MSCI EAFE Value ETF", 0.34],
    ["VPL", "Vanguard FTSE Pacific ETF", 0.08],
    ["VGK", "Vanguard FTSE Europe ETF", 0.08],
    ["EWJ", "iShares MSCI Japan ETF", 0.5],
    ["FXI", "iShares China Large-Cap ETF", 0.74],
    ["INDA", "iShares MSCI India ETF", 0.64],
    ["EWZ", "iShares MSCI Brazil ETF", 0.59],
    ["EWG", "iShares MSCI Germany ETF", 0.51],
    ["EWU", "iShares MSCI United Kingdom ETF", 0.5],
    ["EWC", "iShares MSCI Canada ETF", 0.5],
    ["EWT", "iShares MSCI Taiwan ETF", 0.59],
    ["EWY", "iShares MSCI South Korea ETF", 0.59],
    ["EWH", "iShares MSCI Hong Kong ETF", 0.5],
    ["EWA", "iShares MSCI Australia ETF", 0.5],
    ["EWW", "iShares MSCI Mexico ETF", 0.5],
  ],
  "intl-equity"
);

// ── Sector SPDR + sector ETFs ──
addMany(
  [
    ["XLK", "Technology Select Sector SPDR Fund", 0.09],
    ["XLF", "Financial Select Sector SPDR Fund", 0.09],
    ["XLE", "Energy Select Sector SPDR Fund", 0.09],
    ["XLV", "Health Care Select Sector SPDR Fund", 0.09],
    ["XLI", "Industrial Select Sector SPDR Fund", 0.09],
    ["XLY", "Consumer Discretionary Select Sector SPDR Fund", 0.09],
    ["XLP", "Consumer Staples Select Sector SPDR Fund", 0.09],
    ["XLU", "Utilities Select Sector SPDR Fund", 0.09],
    ["XLB", "Materials Select Sector SPDR Fund", 0.09],
    ["XLRE", "Real Estate Select Sector SPDR Fund", 0.09],
    ["XLC", "Communication Services Select Sector SPDR Fund", 0.09],
    ["VGT", "Vanguard Information Technology ETF", 0.1],
    ["VFH", "Vanguard Financials ETF", 0.1],
    ["VDE", "Vanguard Energy ETF", 0.1],
    ["VHT", "Vanguard Health Care ETF", 0.1],
    ["VIS", "Vanguard Industrials ETF", 0.1],
    ["VCR", "Vanguard Consumer Discretionary ETF", 0.1],
    ["VDC", "Vanguard Consumer Staples ETF", 0.1],
    ["VPU", "Vanguard Utilities ETF", 0.1],
    ["VAW", "Vanguard Materials ETF", 0.1],
    ["VNQ", "Vanguard Real Estate ETF", 0.12],
    ["VOX", "Vanguard Communication Services ETF", 0.1],
    ["SMH", "VanEck Semiconductor ETF", 0.35],
    ["SOXX", "iShares Semiconductor ETF", 0.35],
    ["XBI", "SPDR S&P Biotech ETF", 0.35],
    ["IBB", "iShares Biotechnology ETF", 0.44],
    ["ITA", "iShares U.S. Aerospace & Defense ETF", 0.4],
    ["XAR", "SPDR S&P Aerospace & Defense ETF", 0.35],
    ["PPA", "Invesco Aerospace & Defense ETF", 0.58],
    ["KRE", "SPDR S&P Regional Banking ETF", 0.35],
    ["XHB", "SPDR S&P Homebuilders ETF", 0.35],
    ["XRT", "SPDR S&P Retail ETF", 0.35],
    ["IYT", "iShares Transportation Average ETF", 0.4],
  ],
  "sector",
  "spdr"
);

// ── Fixed income ──
addMany(
  [
    ["BND", "Vanguard Total Bond Market ETF", 0.03],
    ["AGG", "iShares Core U.S. Aggregate Bond ETF", 0.03],
    ["SCHZ", "Schwab U.S. Aggregate Bond ETF", 0.04],
    ["VGIT", "Vanguard Intermediate-Term Treasury ETF", 0.04],
    ["VGLT", "Vanguard Long-Term Treasury ETF", 0.04],
    ["VGSH", "Vanguard Short-Term Treasury ETF", 0.04],
    ["SHY", "iShares 1-3 Year Treasury Bond ETF", 0.15],
    ["IEI", "iShares 3-7 Year Treasury Bond ETF", 0.15],
    ["IEF", "iShares 7-10 Year Treasury Bond ETF", 0.15],
    ["TLT", "iShares 20+ Year Treasury Bond ETF", 0.15],
    ["GOVT", "iShares U.S. Treasury Bond ETF", 0.05],
    ["TIP", "iShares TIPS Bond ETF", 0.19],
    ["VTIP", "Vanguard Short-Term Inflation-Protected Securities ETF", 0.04],
    ["LQD", "iShares iBoxx $ Investment Grade Corporate Bond ETF", 0.14],
    ["VCIT", "Vanguard Intermediate-Term Corporate Bond ETF", 0.04],
    ["VCSH", "Vanguard Short-Term Corporate Bond ETF", 0.04],
    ["HYG", "iShares iBoxx $ High Yield Corporate Bond ETF", 0.48],
    ["JNK", "SPDR Bloomberg High Yield Bond ETF", 0.4],
    ["USHY", "iShares Broad USD High Yield Corporate Bond ETF", 0.15],
    ["MUB", "iShares National Muni Bond ETF", 0.05],
    ["VTEB", "Vanguard Tax-Exempt Bond ETF", 0.05],
    ["BIL", "SPDR Bloomberg 1-3 Month T-Bill ETF", 0.14],
    ["SGOV", "iShares 0-3 Month Treasury Bond ETF", 0.09],
    ["SHV", "iShares Short Treasury Bond ETF", 0.15],
    ["BSV", "Vanguard Short-Term Bond ETF", 0.04],
    ["BIV", "Vanguard Intermediate-Term Bond ETF", 0.04],
    ["BLV", "Vanguard Long-Term Bond ETF", 0.04],
    ["EMB", "iShares J.P. Morgan USD Emerging Markets Bond ETF", 0.39],
    ["BNDX", "Vanguard Total International Bond ETF", 0.07],
  ],
  "fixed-income"
);

// ── Dividend / factor ──
addMany(
  [
    ["SCHD", "Schwab U.S. Dividend Equity ETF", 0.06],
    ["VYM", "Vanguard High Dividend Yield ETF", 0.06],
    ["DVY", "iShares Select Dividend ETF", 0.38],
    ["HDV", "iShares Core High Dividend ETF", 0.08],
    ["DGRO", "iShares Core Dividend Growth ETF", 0.08],
    ["VIG", "Vanguard Dividend Appreciation ETF", 0.06],
    ["SDY", "SPDR S&P Dividend ETF", 0.35],
    ["NOBL", "ProShares S&P 500 Dividend Aristocrats ETF", 0.35],
    ["JEPI", "JPMorgan Equity Premium Income ETF", 0.35],
    ["JEPQ", "JPMorgan NASDAQ Equity Premium Income ETF", 0.35],
    ["DIVO", "Amplify CWP Enhanced Dividend Income ETF", 0.55],
    ["QYLD", "Global X NASDAQ 100 Covered Call ETF", 0.6],
    ["XYLD", "Global X S&P 500 Covered Call ETF", 0.6],
    ["MTUM", "iShares MSCI USA Momentum Factor ETF", 0.15],
    ["QUAL", "iShares MSCI USA Quality Factor ETF", 0.15],
    ["USMV", "iShares MSCI USA Min Vol Factor ETF", 0.15],
    ["VLUE", "iShares MSCI USA Value Factor ETF", 0.15],
    ["SIZE", "iShares MSCI USA Size Factor ETF", 0.15],
    ["SPHB", "Invesco S&P 500 High Beta ETF", 0.25],
    ["SPLV", "Invesco S&P 500 Low Volatility ETF", 0.25],
    ["MOAT", "VanEck Morningstar Wide Moat ETF", 0.47],
    ["VOT", "Vanguard Mid-Cap Growth ETF", 0.07],
  ],
  "factor"
);

// ── Thematic / innovation ──
addMany(
  [
    ["ARKK", "ARK Innovation ETF", 0.75],
    ["ARKG", "ARK Genomic Revolution ETF", 0.75],
    ["ARKW", "ARK Next Generation Internet ETF", 0.75],
    ["ARKF", "ARK Fintech Innovation ETF", 0.75],
    ["ARKQ", "ARK Autonomous Technology & Robotics ETF", 0.75],
    ["BOTZ", "Global X Robotics & Artificial Intelligence ETF", 0.68],
    ["AIQ", "Global X Artificial Intelligence & Technology ETF", 0.68],
    ["ROBO", "Robo Global Robotics & Automation Index ETF", 0.95],
    ["HACK", "ETFMG Prime Cyber Security ETF", 0.6],
    ["CIBR", "First Trust NASDAQ Cybersecurity ETF", 0.6],
    ["FINX", "Global X FinTech ETF", 0.68],
    ["IPAY", "Amplify Digital Payments ETF", 0.75],
    ["ICLN", "iShares Global Clean Energy ETF", 0.4],
    ["TAN", "Invesco Solar ETF", 0.66],
    ["QCLN", "First Trust NASDAQ Clean Edge Green Energy Index Fund", 0.58],
    ["LIT", "Global X Lithium & Battery Tech ETF", 0.75],
    ["URA", "Global X Uranium ETF", 0.69],
    ["REMX", "VanEck Rare Earth/Strategic Metals ETF", 0.58],
    ["COPX", "Global X Copper Miners ETF", 0.65],
    ["PAVE", "Global X U.S. Infrastructure Development ETF", 0.47],
    ["ITA", "iShares U.S. Aerospace & Defense ETF", 0.4],
    ["BITO", "ProShares Bitcoin Strategy ETF", 0.95],
    ["IBIT", "iShares Bitcoin Trust ETF", 0.25],
    ["FBTC", "Fidelity Wise Origin Bitcoin Fund", 0.25],
    ["ETHA", "iShares Ethereum Trust ETF", 0.25],
    ["WGMI", "Valkyrie Bitcoin Miners ETF", 0.75],
  ],
  "thematic"
);

// ── Commodity / real assets ──
addMany(
  [
    ["GLD", "SPDR Gold Shares", 0.4],
    ["IAU", "iShares Gold Trust", 0.25],
    ["SLV", "iShares Silver Trust", 0.5],
    ["GDX", "VanEck Gold Miners ETF", 0.51],
    ["GDXJ", "VanEck Junior Gold Miners ETF", 0.52],
    ["USO", "United States Oil Fund", 0.6],
    ["UNG", "United States Natural Gas Fund", 0.6],
    ["DBC", "Invesco DB Commodity Index Tracking Fund", 0.87],
    ["PDBC", "Invesco Optimum Yield Diversified Commodity Strategy No K-1 ETF", 0.59],
    ["DBA", "Invesco DB Agriculture Fund", 0.93],
    ["VNQ", "Vanguard Real Estate ETF", 0.12],
    ["SCHH", "Schwab U.S. REIT ETF", 0.07],
    ["IYR", "iShares U.S. Real Estate ETF", 0.39],
    ["REM", "iShares Mortgage Real Estate Capped ETF", 0.48],
  ],
  "commodity"
);

// ── Leveraged / inverse (US brokerage access; educational tag) ──
addMany(
  [
    ["TQQQ", "ProShares UltraPro QQQ", 0.86],
    ["SQQQ", "ProShares UltraPro Short QQQ", 0.86],
    ["UPRO", "ProShares UltraPro S&P500", 0.91],
    ["SPXU", "ProShares UltraPro Short S&P500", 0.91],
    ["SOXL", "Direxion Daily Semiconductor Bull 3X Shares", 0.94],
    ["SOXS", "Direxion Daily Semiconductor Bear 3X Shares", 0.94],
    ["TNA", "Direxion Daily Small Cap Bull 3X Shares", 0.95],
    ["TZA", "Direxion Daily Small Cap Bear 3X Shares", 0.95],
    ["FAS", "Direxion Daily Financial Bull 3X Shares", 0.95],
    ["FAZ", "Direxion Daily Financial Bear 3X Shares", 0.95],
    ["LABU", "Direxion Daily Biotech Bull 3X Shares", 0.95],
    ["LABD", "Direxion Daily Biotech Bear 3X Shares", 0.95],
    ["UVXY", "ProShares Ultra VIX Short-Term Futures ETF", 1.65],
    ["SVXY", "ProShares Short VIX Short-Term Futures ETF", 1.65],
  ],
  "leveraged-inverse",
  "proshares"
);

// ── More country, bond, and niche US ETFs ──
addMany(
  [
    ["EPP", "iShares MSCI Pacific ex Japan ETF", 0.5],
    ["EPU", "iShares MSCI Peru ETF", 0.59],
    ["ECH", "iShares MSCI Chile ETF", 0.59],
    ["EIS", "iShares MSCI Israel ETF", 0.59],
    ["EIDO", "iShares MSCI Indonesia ETF", 0.59],
    ["EPHE", "iShares MSCI Philippines ETF", 0.59],
    ["THD", "iShares MSCI Thailand ETF", 0.59],
    ["EWM", "iShares MSCI Malaysia ETF", 0.5],
    ["EWS", "iShares MSCI Singapore ETF", 0.5],
    ["EZA", "iShares MSCI South Africa ETF", 0.59],
    ["ERUS", "iShares MSCI Russia ETF", 0.59],
    ["TUR", "iShares MSCI Turkey ETF", 0.59],
    ["GREK", "Global X MSCI Greece ETF", 0.57],
    ["EIRL", "iShares MSCI Ireland ETF", 0.5],
    ["ENZL", "iShares MSCI New Zealand ETF", 0.5],
    ["EWD", "iShares MSCI Sweden ETF", 0.5],
    ["EWN", "iShares MSCI Netherlands ETF", 0.5],
    ["EWL", "iShares MSCI Switzerland ETF", 0.5],
    ["EWP", "iShares MSCI Spain ETF", 0.5],
    ["EWQ", "iShares MSCI France ETF", 0.5],
    ["EWI", "iShares MSCI Italy ETF", 0.5],
    ["NORW", "Global X MSCI Norway ETF", 0.5],
    ["KSA", "iShares MSCI Saudi Arabia ETF", 0.74],
    ["UAE", "iShares MSCI UAE ETF", 0.74],
    ["QAT", "iShares MSCI Qatar ETF", 0.74],
    ["MCHI", "iShares MSCI China ETF", 0.59],
    ["ASHR", "Xtrackers Harvest CSI 300 China A-Shares ETF", 0.65],
    ["FXI", "iShares China Large-Cap ETF", 0.74],
    ["KWEB", "KraneShares CSI China Internet ETF", 0.69],
    ["CQQQ", "Invesco China Technology ETF", 0.7],
    ["YINN", "Direxion Daily FTSE China Bull 3X Shares", 0.95],
    ["YANG", "Direxion Daily FTSE China Bear 3X Shares", 0.95],
    ["EWJV", "iShares MSCI Japan Value ETF", 0.15],
    ["DXJS", "WisdomTree Japan Hedged SmallCap Equity Fund", 0.58],
    ["SCJ", "iShares MSCI Japan Small-Cap ETF", 0.5],
    ["FLJP", "Franklin FTSE Japan ETF", 0.09],
    ["BBJP", "JPMorgan BetaBuilders Japan ETF", 0.19],
    ["BBEU", "JPMorgan BetaBuilders Europe ETF", 0.09],
    ["BBAX", "JPMorgan BetaBuilders Developed Asia Pacific ex-Japan ETF", 0.09],
    ["BBIN", "JPMorgan BetaBuilders International Equity ETF", 0.09],
    ["BBUS", "JPMorgan BetaBuilders U.S. Equity ETF", 0.02],
    ["BBRE", "JPMorgan BetaBuilders MSCI U.S. REIT ETF", 0.11],
    ["BBHY", "JPMorgan BetaBuilders USD High Yield Corporate Bond ETF", 0.19],
    ["BBAG", "JPMorgan BetaBuilders U.S. Aggregate Bond ETF", 0.05],
    ["VCRB", "Vanguard Core Bond ETF", 0.04],
    ["VTEC", "Vanguard Technology ETF", 0.1],
    ["VONE", "Vanguard Russell 1000 ETF", 0.07],
    ["VTWO", "Vanguard Russell 2000 ETF", 0.07],
    ["VTHR", "Vanguard Russell 3000 ETF", 0.07],
    ["VT", "Vanguard Total World Stock ETF", 0.07],
    ["VEGN", "US Vegan Climate ETF", 0.45],
    ["ESGV", "Vanguard ESG U.S. Stock ETF", 0.09],
    ["ESGU", "iShares ESG Aware MSCI USA ETF", 0.15],
    ["SUSL", "iShares ESG MSCI USA Leaders ETF", 0.1],
    ["USSG", "Xtrackers MSCI USA ESG Leaders Equity ETF", 0.1],
    ["SNPE", "Xtrackers S&P 500 ESG ETF", 0.1],
    ["EFIV", "SPDR S&P 500 ESG ETF", 0.1],
    ["CRBN", "iShares MSCI ACWI Low Carbon Target ETF", 0.2],
    ["LOWC", "SPDR MSCI ACWI Low Carbon Target ETF", 0.2],
    ["PBUS", "Invesco PureBeta MSCI USA ETF", 0.15],
    ["PBD", "Invesco Global Clean Energy ETF", 0.66],
    ["ICF", "iShares Cohen & Steers REIT ETF", 0.33],
    ["USRT", "iShares Core U.S. REIT ETF", 0.08],
    ["RWR", "SPDR Dow Jones REIT ETF", 0.25],
    ["FREL", "Fidelity MSCI Real Estate Index ETF", 0.084],
    ["HOMZ", "Hoya Capital Housing ETF", 0.3],
    ["ITB", "iShares U.S. Home Construction ETF", 0.38],
    ["PKB", "Invesco Building & Construction ETF", 0.58],
    ["WOOD", "iShares Global Timber & Forestry ETF", 0.43],
    ["CUT", "Invesco MSCI Global Timber ETF", 0.51],
    ["GNR", "SPDR S&P Global Natural Resources ETF", 0.4],
    ["IXC", "iShares Global Energy ETF", 0.4],
    ["IXN", "iShares Global Tech ETF", 0.4],
    ["IXG", "iShares Global Financials ETF", 0.4],
    ["EXI", "iShares Global Industrials ETF", 0.4],
    ["MXI", "iShares Global Materials ETF", 0.4],
    ["JETS", "U.S. Global Jets ETF", 0.6],
    ["AWAY", "ETFMG Travel Tech ETF", 0.75],
    ["PEJ", "Invesco Dynamic Leisure and Entertainment ETF", 0.58],
    ["XLC", "Communication Services Select Sector SPDR Fund", 0.09],
    ["VOOG", "Vanguard S&P 500 Growth ETF", 0.04],
    ["VOOV", "Vanguard S&P 500 Value ETF", 0.04],
    ["VIOO", "Vanguard S&P Small-Cap 600 ETF", 0.04],
    ["VIOG", "Vanguard S&P Small-Cap 600 Growth ETF", 0.04],
    ["VIOV", "Vanguard S&P Small-Cap 600 Value ETF", 0.04],
    ["SPMD", "SPDR Portfolio S&P 400 Mid Cap ETF", 0.03],
    ["IVOO", "Vanguard S&P Mid-Cap 400 ETF", 0.04],
    ["IVOV", "Vanguard S&P Mid-Cap 400 Value ETF", 0.04],
    ["IVOG", "Vanguard S&P Mid-Cap 400 Growth ETF", 0.04],
    ["IJK", "iShares S&P Mid-Cap 400 Growth ETF", 0.25],
    ["IJJ", "iShares S&P Mid-Cap 400 Value ETF", 0.25],
    ["SPBO", "SPDR Portfolio Corporate Bond ETF", 0.03],
    ["SPSB", "SPDR Portfolio Short Term Corporate Bond ETF", 0.03],
    ["SPIB", "SPDR Portfolio Intermediate Term Corporate Bond ETF", 0.03],
    ["SPTI", "SPDR Portfolio Intermediate Term Treasury ETF", 0.03],
    ["SPTS", "SPDR Portfolio Short Term Treasury ETF", 0.03],
    ["SPTL", "SPDR Portfolio Long Term Treasury ETF", 0.03],
    ["SPTB", "SPDR Portfolio Treasury ETF", 0.03],
    ["SPAB", "SPDR Portfolio Aggregate Bond ETF", 0.03],
    ["SPMB", "SPDR Portfolio Mortgage Backed Bond ETF", 0.03],
    ["SPHY", "SPDR Portfolio High Yield Bond ETF", 0.03],
    ["SPXB", "ProShares S&P 500 Bond ETF", 0.05],
    ["VWOB", "Vanguard Emerging Markets Government Bond ETF", 0.25],
    ["EMLC", "VanEck EM Local Currency Bond ETF", 0.3],
    ["EBND", "SPDR Bloomberg Emerging Markets Local Bond ETF", 0.3],
    ["LEMB", "iShares J.P. Morgan EM Local Currency Bond ETF", 0.3],
    ["PCY", "Invesco Emerging Markets Sovereign Debt ETF", 0.5],
    ["EMHY", "iShares Emerging Markets High Yield Bond ETF", 0.5],
    ["HYEM", "VanEck Emerging Markets High Yield Bond ETF", 0.4],
    ["CEMB", "iShares J.P. Morgan EM Corporate Bond ETF", 0.5],
    ["EMB", "iShares J.P. Morgan USD Emerging Markets Bond ETF", 0.39],
    ["IGOV", "iShares International Treasury Bond ETF", 0.35],
    ["BWX", "SPDR Bloomberg International Treasury Bond ETF", 0.35],
    ["WIP", "SPDR FTSE International Government Inflation-Protected Bond ETF", 0.5],
    ["GTIP", "Goldman Sachs Access Inflation Protected USD Bond ETF", 0.2],
    ["RINF", "ProShares Inflation Expectations ETF", 0.3],
    ["TIPS", "iShares TIPS Bond ETF", 0.19],
    ["SCHP", "Schwab U.S. TIPS ETF", 0.05],
    ["STIP", "iShares 0-5 Year TIPS Bond ETF", 0.05],
    ["VTIP", "Vanguard Short-Term Inflation-Protected Securities ETF", 0.04],
    ["LTPZ", "PIMCO 15+ Year U.S. TIPS Index ETF", 0.2],
    ["TIPX", "SPDR Bloomberg 1-10 Year TIPS ETF", 0.15],
    ["COMT", "iShares GSCI Commodity Dynamic Roll Strategy ETF", 0.48],
    ["PIT", "VanEck Commodity Strategy ETF", 0.5],
    ["GCC", "WisdomTree Enhanced Commodity Strategy Fund", 0.55],
    ["TAGS", "Teucrium Agricultural Fund", 0.75],
    ["CORN", "Teucrium Corn Fund", 0.75],
    ["WEAT", "Teucrium Wheat Fund", 0.75],
    ["SOYB", "Teucrium Soybean Fund", 0.75],
    ["CANE", "Teucrium Sugar Fund", 0.75],
    ["URA", "Global X Uranium ETF", 0.69],
    ["URNM", "Sprott Uranium Miners ETF", 0.75],
    ["NLR", "VanEck Uranium+Nuclear Energy ETF", 0.58],
    ["NUCL", "VanEck Uranium and Nuclear ETF", 0.58],
  ],
  "us-equity"
);

// ── Additional popular US ETFs (expand search surface) ──
const EXTRA = `
SPYG SPDR Portfolio S&P 500 Growth ETF 0.04
SPYV SPDR Portfolio S&P 500 Value ETF 0.04
IUSG iShares Core S&P U.S. Growth ETF 0.04
IUSV iShares Core S&P U.S. Value ETF 0.04
SPMD SPDR Portfolio S&P 400 Mid Cap ETF 0.03
SPSM SPDR Portfolio S&P 600 Small Cap ETF 0.03
ONEQ Fidelity Nasdaq Composite Index ETF 0.21
FCOM Fidelity MSCI Communication Services Index ETF 0.084
FTEC Fidelity MSCI Information Technology Index ETF 0.084
FHLC Fidelity MSCI Health Care Index ETF 0.084
FENY Fidelity MSCI Energy Index ETF 0.084
FREL Fidelity MSCI Real Estate Index ETF 0.084
FDIS Fidelity MSCI Consumer Discretionary Index ETF 0.084
FSTA Fidelity MSCI Consumer Staples Index ETF 0.084
FUTY Fidelity MSCI Utilities Index ETF 0.084
FIDU Fidelity MSCI Industrials Index ETF 0.084
FLRG Fidelity U.S. Low Volatility Factor ETF 0.15
FVAL Fidelity Value Factor ETF 0.29
FDLO Fidelity Low Volatility Factor ETF 0.15
FPRO Fidelity Real Estate Investment ETF 0.45
IGV iShares Expanded Tech-Software Sector ETF 0.4
IGF iShares Global Infrastructure ETF 0.4
PICK iShares MSCI Global Metals & Mining Producers ETF 0.39
SIL Global X Silver Miners ETF 0.65
GUNR FlexShares Morningstar Global Upstream Natural Resources Index Fund 0.46
WOOD iShares Global Timber & Forestry ETF 0.43
PHO Invesco Water Resources ETF 0.5
CGW Invesco S&P Global Water Index ETF 0.6
IDU iShares U.S. Utilities ETF 0.38
IYE iShares U.S. Energy ETF 0.38
IYF iShares U.S. Financials ETF 0.38
IYH iShares U.S. Healthcare ETF 0.38
IYW iShares U.S. Technology ETF 0.38
IYC iShares U.S. Consumer Discretionary ETF 0.38
IYK iShares U.S. Consumer Staples ETF 0.38
IYM iShares U.S. Basic Materials ETF 0.38
IYJ iShares U.S. Industrials ETF 0.38
IYZ iShares U.S. Telecommunications ETF 0.38
KBE SPDR S&P Bank ETF 0.35
KIE SPDR S&P Insurance ETF 0.35
XME SPDR S&P Metals & Mining ETF 0.35
XOP SPDR S&P Oil & Gas Exploration & Production ETF 0.35
OIH VanEck Oil Services ETF 0.35
AMLP Alerian MLP ETF 0.85
MLPA Global X MLP ETF 0.45
PFF iShares Preferred & Income Securities ETF 0.46
PGX Invesco Preferred ETF 0.52
FPE First Trust Preferred Securities & Income ETF 0.85
BIZD VanEck BDC Income ETF 0.42
SRLN SPDR Blackstone Senior Loan ETF 0.7
SJB ProShares Short High Yield 0.3
TBT ProShares UltraShort 20+ Year Treasury 0.89
TMF Direxion Daily 20+ Year Treasury Bull 3X Shares 0.95
TMV Direxion Daily 20+ Year Treasury Bear 3X Shares 0.95
EDV Vanguard Extended Duration Treasury Index Fund ETF 0.07
ZROZ PIMCO 25+ Year Zero Coupon U.S. Treasury Index ETF 0.15
STIP iShares 0-5 Year TIPS Bond ETF 0.05
SCHP Schwab U.S. TIPS ETF 0.05
CMF iShares California Muni Bond ETF 0.25
SUB iShares Short-Term National Muni Bond ETF 0.25
VMBS Vanguard Mortgage-Backed Securities ETF 0.04
MBB iShares MBS ETF 0.06
SPAB SPDR Portfolio Aggregate Bond ETF 0.03
SPTL SPDR Portfolio Long Term Treasury ETF 0.03
SPTS SPDR Portfolio Short Term Treasury ETF 0.03
SPTI SPDR Portfolio Intermediate Term Treasury ETF 0.03
IGIB iShares 5-10 Year Investment Grade Corporate Bond ETF 0.06
IGSB iShares 1-5 Year Investment Grade Corporate Bond ETF 0.06
FALN iShares Fallen Angels USD Bond ETF 0.25
ANGL VanEck Fallen Angel High Yield Bond ETF 0.25
BKLN Invesco Senior Loan ETF 0.65
SRLN SPDR Blackstone Senior Loan ETF 0.7
CLOA iShares AAA CLO Active ETF 0.2
JAAA Janus Henderson AAA CLO ETF 0.2
VCLT Vanguard Long-Term Corporate Bond ETF 0.04
VCRB Vanguard Core Bond ETF 0.04
SPIB SPDR Portfolio Intermediate Term Corporate Bond ETF 0.03
SPSB SPDR Portfolio Short Term Corporate Bond ETF 0.03
SPTB SPDR Portfolio Treasury ETF 0.03
GBIL Goldman Sachs Access Treasury 0-1 Year ETF 0.12
TFLO iShares Treasury Floating Rate Bond ETF 0.15
FLOT iShares Floating Rate Bond ETF 0.15
FLRN SPDR Bloomberg Investment Grade Floating Rate ETF 0.15
SCHI Schwab 5-10 Year Corporate Bond ETF 0.04
SCHR Schwab Intermediate-Term U.S. Treasury ETF 0.05
SCHO Schwab Short-Term U.S. Treasury ETF 0.05
SCHQ Schwab Long-Term U.S. Treasury ETF 0.05
VUSB Vanguard Ultra-Short Bond ETF 0.1
MINT PIMCO Enhanced Short Maturity Active ETF 0.36
JPST JPMorgan Ultra-Short Income ETF 0.18
ICSH iShares Ultra Short-Term Bond ETF 0.15
BSCO Invesco BulletShares 2025 Corporate Bond ETF 0.1
BSV Vanguard Short-Term Bond ETF 0.04
IUSB iShares Core Total USD Bond Market ETF 0.06
ISTB iShares Core 1-5 Year USD Bond ETF 0.06
ACWI iShares MSCI ACWI ETF 0.32
URTH iShares MSCI World ETF 0.24
VEU Vanguard FTSE All-World ex-US ETF  0.07
VXF Vanguard Extended Market ETF 0.06
VBK Vanguard Small-Cap Growth ETF 0.07
VBR Vanguard Small-Cap Value ETF 0.07
IJK iShares S&P Mid-Cap 400 Growth ETF 0.25
IJJ iShares S&P Mid-Cap 400 Value ETF 0.25
IWP iShares Russell Mid-Cap Growth ETF 0.24
IWS iShares Russell Mid-Cap Value ETF 0.24
SPGP Invesco S&P 500 GARP ETF 0.36
RPV Invesco S&P 500 Pure Value ETF 0.35
RPG Invesco S&P 500 Pure Growth ETF 0.35
SPMO Invesco S&P 500 Momentum ETF 0.13
SPHQ Invesco S&P 500 Quality ETF 0.15
SPYD SPDR Portfolio S&P 500 High Dividend ETF 0.07
SPHD Invesco S&P 500 High Dividend Low Volatility ETF 0.3
RDVY First Trust Rising Dividend Achievers ETF 0.5
PID Invesco International Dividend Achievers ETF 0.54
VYMI Vanguard International High Dividend Yield ETF 0.22
IDV iShares International Select Dividend ETF 0.49
DHS WisdomTree U.S. High Dividend Fund 0.38
DES WisdomTree U.S. SmallCap Dividend Fund 0.38
DON WisdomTree U.S. MidCap Dividend Fund 0.38
DLN WisdomTree U.S. LargeCap Dividend Fund 0.28
DTD WisdomTree U.S. Total Dividend Fund 0.28
KBWD Invesco KBW High Dividend Yield Financial ETF 0.71
KBWB Invesco KBW Bank ETF 0.35
KBE SPDR S&P Bank ETF 0.35
IAT iShares U.S. Regional Banks ETF 0.38
TOTL SPDR DoubleLine Total Return Tactical ETF 0.55
DBMF iMGP DBi Managed Futures Strategy ETF 0.85
KMLM KFA Mount Lucas Managed Futures Index Strategy ETF 0.9
CTA Simplify Managed Futures Strategy ETF 0.85
SWAN Amplify BlackSwan Growth & Treasury Core ETF 0.49
TAIL Cambria Tail Risk ETF 0.55
MNA IQ Merger Arbitrage ETF 0.71
CVRD Madison Covered Call ETF 0.95
XYLG Global X S&P 500 Covered Call & Growth ETF 0.6
QYLG Global X NASDAQ 100 Covered Call & Growth ETF 0.6
NUSC Nuveen ESG Small-Cap ETF 0.35
ESGU iShares ESG Aware MSCI USA ETF 0.15
SUSA iShares MSCI USA ESG Select ETF 0.25
VSGX Vanguard ESG International Stock ETF 0.15
ESGD iShares ESG Aware MSCI EAFE ETF 0.2
ESGE iShares ESG Aware MSCI EM ETF 0.25
SCHC Schwab International Small-Cap Equity ETF 0.11
SCZ iShares MSCI International Small-Cap ETF 0.4
GWX SPDR S&P International Small Cap ETF 0.4
VSS Vanguard FTSE All-World ex-US Small-Cap ETF 0.07
AVDV Avantis International Small Cap Value ETF 0.36
AVEM Avantis Emerging Markets Equity ETF 0.33
DFAE Dimensional Emerging Markets Core Equity 2 ETF 0.28
DFAI Dimensional International Core Equity 2 ETF 0.22
DFUS Dimensional U.S. Equity ETF 0.21
DFAC Dimensional U.S. Core Equity 2 ETF 0.17
DFSV Dimensional US Small Cap Value ETF 0.29
DFIV Dimensional International Vector Equity ETF 0.29
DFGR Dimensional Global Real Estate ETF 0.28
FNDA Schwab Fundamental U.S. Small Company ETF 0.25
FNDC Schwab Fundamental International Small Company ETF 0.39
FNDF Schwab Fundamental International Large Company ETF 0.25
FNDE Schwab Fundamental Emerging Markets ETF 0.39
RSPG Invesco S&P 500 Equal Weight Growth ETF 0.25
RSPV Invesco S&P 500 Equal Weight Value ETF 0.25
EQAL Invesco Russell 1000 Equal Weight ETF 0.25
OMFL Invesco Russell 1000 Dynamic Multifactor ETF 0.25
PDP Invesco Dorsey Wright Momentum ETF 0.6
PTLC Pacer Trendpilot US Large Cap ETF 0.6
PTNQ Pacer Trendpilot 100 ETF 0.6
COWZ Pacer US Cash Cows 100 ETF 0.49
CALF Pacer US Small Cap Cash Cows 100 ETF 0.59
VFLO Vanguard U.S. Value Factor ETF 0.29
VFMF Vanguard U.S. Multifactor ETF 0.29
VFQY Vanguard U.S. Quality Factor ETF 0.29
VFVA Vanguard U.S. Value Factor ETF 0.29
SPUS Invesco S&P 500 ex Fossil Fuel ETF 0.15
SPLV Invesco S&P 500 Low Volatility ETF 0.25
USMV iShares MSCI USA Min Vol Factor ETF 0.15
LVHD Franklin U.S. Low Volatility High Dividend Index ETF 0.19
DGRW WisdomTree U.S. Quality Dividend Growth Fund 0.38
VIGI Vanguard International Dividend Appreciation ETF 0.22
BBJP WisdomTree Japan Hedged Equity Fund 0.48
DXJ WisdomTree Japan Hedged Equity Fund 0.48
HEFA iShares Currency Hedged MSCI EAFE ETF 0.35
HEWJ iShares Currency Hedged MSCI Japan ETF 0.43
HEDJ WisdomTree Europe Hedged Equity Fund 0.58
DBEF Xtrackers MSCI EAFE Hedged Equity ETF 0.35
IHDG WisdomTree International Hedged Quality Dividend Growth Fund 0.58
EPI WisdomTree India Earnings Fund 0.84
INDY iShares India 50 ETF 0.89
FLIN Franklin FTSE India ETF 0.19
FM iShares Frontier and Select EM ETF 0.79
FMET Fidelity Metaverse ETF 0.39
BOTZ Global X Robotics & Artificial Intelligence ETF 0.68
CHAT Roundhill Generative AI & Technology ETF 0.75
IRBO iShares Robotics and Artificial Intelligence Multisector ETF 0.47
THNQ Robo Global Artificial Intelligence ETF 0.75
SKYY First Trust Cloud Computing ETF 0.6
WCLD WisdomTree Cloud Computing Fund 0.45
CLOU Global X Cloud Computing ETF 0.68
NETL Miller Value Partners Digital Infrastructure ETF 0.75
SRVR Pacer Data & Infrastructure Real Estate ETF 0.49
INDS Pacer Industrial Real Estate ETF 0.49
NFRA FlexShares STOXX Global Broad Infrastructure Index Fund 0.47
IFRA iShares U.S. Infrastructure ETF 0.3
GRID First Trust NASDAQ Clean Edge Smart Grid Infrastructure Index Fund 0.58
ACES ALPS Clean Energy ETF 0.55
CTEC Global X CleanTech ETF 0.5
RNRG Global X Renewable Energy Producers ETF 0.5
FAN First Trust Global Wind Energy ETF 0.6
TAN Invesco Solar ETF 0.66
PBW Invesco WilderHill Clean Energy ETF 0.61
SMOG VanEck Low Carbon Energy ETF 0.58
EVX VanEck Environmental Services ETF 0.53
ERTH Invesco MSCI Sustainable Future ETF 0.55
ESPO VanEck Video Gaming and eSports ETF 0.55
HERO Global X Video Games & Esports ETF 0.5
NERD Roundhill Video Games ETF 0.5
BJK VanEck Gaming ETF 0.59
UFO Procure Space ETF 0.75
ARKX ARK Space Exploration & Innovation ETF 0.75
ROKT SPDR S&P Kensho Final Frontiers ETF 0.45
XITK SPDR FactSet Innovative Technology ETF 0.45
KOMP SPDR S&P Kensho New Economies Composite ETF 0.2
DTEC ALPS Disruptive Technologies ETF 0.5
TECB iShares U.S. Tech Breakthrough Multisector ETF 0.3
IETC iShares U.S. Tech Breakthrough Multisector ETF 0.3
WCBR WisdomTree Cybersecurity Fund 0.45
BUG Global X Cybersecurity ETF 0.5
CIBR First Trust NASDAQ Cybersecurity ETF 0.6
HACK ETFMG Prime Cyber Security ETF 0.6
XSW SPDR S&P Software & Services ETF 0.35
IGV iShares Expanded Tech-Software Sector ETF 0.4
SKYY First Trust Cloud Computing ETF 0.6
WCLD WisdomTree Cloud Computing Fund 0.45
FDN First Trust Dow Jones Internet Index Fund 0.51
ONLN ProShares Online Retail ETF 0.58
CLIX ProShares Long Online/Short Stores ETF 0.65
IBUY Amplify Online Retail ETF 0.65
XRT SPDR S&P Retail ETF 0.35
RTH VanEck Retail ETF 0.35
PBJ Invesco Food & Beverage ETF 0.58
PBS Invesco Dynamic Media ETF 0.58
PEJ Invesco Dynamic Leisure and Entertainment ETF 0.58
XLY Consumer Discretionary Select Sector SPDR Fund 0.09
XLP Consumer Staples Select Sector SPDR Fund 0.09
VDC Vanguard Consumer Staples ETF 0.1
VCR Vanguard Consumer Discretionary ETF 0.1
IYK iShares U.S. Consumer Staples ETF 0.38
IYC iShares U.S. Consumer Discretionary ETF 0.38
PFF iShares Preferred & Income Securities ETF 0.46
PGX Invesco Preferred ETF 0.52
PFFD Global X U.S. Preferred ETF 0.5
VRP Invesco Variable Rate Preferred ETF 0.5
AIS VistaShares Artificial Intelligence Supercycle ETF 0.85
SHLD Global X Defense Tech ETF 0.5
DRAM Roundhill Memory ETF 0.75
MAGS Roundhill Magnificent Seven ETF 0.29
`;

for (const line of EXTRA.trim().split("\n")) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) continue;
  const sym = parts[0];
  const exp = parseFloat(parts[parts.length - 1]);
  const name = parts.slice(1, parts.length - 1).join(" ");
  if (!Number.isFinite(exp)) continue;
  let assetClass = "us-equity";
  if (/bond|treasury|muni|tips|yield|loan|clo|aggregate|credit/i.test(name)) assetClass = "fixed-income";
  else if (/international|emerging|eafe|world ex|global|europe|japan|china|india|brazil|mexico|canada|uk|hedged equity/i.test(name))
    assetClass = "intl-equity";
  else if (/gold|silver|oil|gas|commodity|uranium|lithium|copper|metal|timber|water|infrastructure|reit|real estate|mlp/i.test(name))
    assetClass = /reit|real estate/i.test(name) ? "real-estate" : "commodity";
  else if (/ultra|ultrapro|bear|bull 3x|short |inverse|vix/i.test(name)) assetClass = "leveraged-inverse";
  else if (/sector|semiconductor|biotech|bank|energy|tech|health|financial|utility|material|industrial|aerospace|defense|cyber|software|retail/i.test(name))
    assetClass = "sector";
  else if (/bitcoin|ethereum|crypto|blockchain|innovation|robot|ai |artificial|clean|solar|wind|esg|metaverse|gaming|space|cloud|fintech|genomic|ark /i.test(name))
    assetClass = "thematic";
  else if (/dividend|momentum|quality|value factor|low vol|moat|factor|multifactor|equal weight garp/i.test(name))
    assetClass = "factor";
  add(sym, name, exp, assetClass);
}

// Dedupe by symbol (first wins — curated entries should be added in etfs.ts separately)
const seen = new Set();
const unique = rows.filter(([sym]) => {
  if (seen.has(sym)) return false;
  seen.add(sym);
  return true;
});

unique.sort((a, b) => a[0].localeCompare(b[0]));

const ts = `/** AUTO-GENERATED by scripts/generate-etf-catalog.mjs — do not edit by hand */
export type EtfAssetClass =
  | "us-equity"
  | "intl-equity"
  | "fixed-income"
  | "commodity"
  | "real-estate"
  | "sector"
  | "thematic"
  | "factor"
  | "leveraged-inverse";

/** Compact catalog row: symbol, name, expense % or null, asset class, issuer key */
export type EtfCatalogRow = [
  symbol: string,
  name: string,
  expense: number | null,
  assetClass: EtfAssetClass,
  issuer?: string,
];

export const ETF_CATALOG: EtfCatalogRow[] = ${JSON.stringify(unique, null, 0)};

export const ETF_CATALOG_COUNT = ${unique.length};
`;

writeFileSync(outPath, ts, "utf8");
console.log(`Wrote ${unique.length} ETFs to ${outPath}`);
