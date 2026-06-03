import type { ConceptId } from "@/data/concepts";

export type SignalSeverity = "info" | "notice" | "caution";

export type StockSignal = {
  id: string;
  symbol: string;
  severity: SignalSeverity;
  title: string;
  fact: string;
  context?: string;
  conceptIds?: ConceptId[];
};

const SIGNALS: StockSignal[] = [
  {
    id: "nvda-ceo-tenure",
    symbol: "NVDA",
    severity: "info",
    title: "Founder-led",
    fact: "Jensen Huang has been CEO since NVIDIA's founding in 1993 — 30+ years at the helm.",
    context: "Founder-led companies often have a clearer long-term vision, but also higher key-person risk.",
    conceptIds: ["moat"],
  },
  {
    id: "nvda-customer-concentration",
    symbol: "NVDA",
    severity: "notice",
    title: "Customer concentration",
    fact: "Top 4 hyperscaler customers (MSFT, AMZN, GOOGL, META) represent ~40% of data center revenue.",
    context: "When a few customers drive a large share of revenue, any one of them building in-house chips (TPU, Trainium) could affect demand.",
    conceptIds: ["revenue-vs-profit"],
  },
  {
    id: "aapl-china-revenue",
    symbol: "AAPL",
    severity: "caution",
    title: "China revenue decline",
    fact: "Greater China revenue declined 8% YoY in the most recent fiscal year.",
    context: "China is Apple's third-largest market. Market share losses to Huawei in the premium segment are structural, not cyclical.",
    conceptIds: ["yoy"],
  },
  {
    id: "aapl-accretive-buybacks",
    symbol: "AAPL",
    severity: "info",
    title: "Consistent buybacks",
    fact: "Apple has repurchased over $700B in stock over the past decade, the largest buyback program in history.",
    context: "Large buybacks reduce share count and boost EPS, but they also signal the company sees its stock as undervalued.",
    conceptIds: ["pe-ratio"],
  },
  {
    id: "pltr-gov-concentration",
    symbol: "PLTR",
    severity: "notice",
    title: "Government revenue concentration",
    fact: "US government contracts generate ~55% of Palantir's total revenue.",
    context: "Government deals provide long-term visibility but are subject to budget cycles, leadership changes, and procurement policy shifts.",
  },
  {
    id: "pltr-insider-sales",
    symbol: "PLTR",
    severity: "caution",
    title: "Insider selling",
    fact: "Co-founder and CEO Alex Karp sold over $1B in stock through a pre-arranged trading plan in 2024.",
    context: "Insider sales via 10b5-1 plans are scheduled and not necessarily a signal. But large sustained selling by founders is worth monitoring.",
  },
  {
    id: "enph-nem-headwind",
    symbol: "ENPH",
    severity: "notice",
    title: "Policy headwind — NEM 3.0",
    fact: "California's NEM 3.0 policy reduced solar export rates by ~75%, making rooftop solar economics significantly less attractive.",
    context: "California represents ~30% of US residential solar. This policy change directly impacts Enphase's addressable market in its largest region.",
    conceptIds: ["drawdown"],
  },
  {
    id: "crwd-post-incident-recovery",
    symbol: "CRWD",
    severity: "info",
    title: "Post-outage recovery",
    fact: "CrowdStrike regained enterprise trust after the July 2024 outage, with net-new logos growing 28% YoY post-incident.",
    context: "How a company handles a crisis tells you about its culture. CrowdStrike's transparent post-mortem and compensation packages helped retain customers.",
    conceptIds: ["moat"],
  },
  {
    id: "sofi-profitability-milestone",
    symbol: "SOFI",
    severity: "info",
    title: "Approaching GAAP profitability",
    fact: "SoFi reported positive GAAP net income for the first time in Q4 2024.",
    context: "Crossing into GAAP profitability is a milestone that can expand the addressable investor base (many institutional mandates require positive earnings).",
    conceptIds: ["ebitda"],
  },
  {
    id: "sofi-credit-risk",
    symbol: "SOFI",
    severity: "caution",
    title: "Personal loan credit risk",
    fact: "Personal loan net charge-offs rose to 5.2% in 2024, up from 3.8% in 2023.",
    context: "SoFi's automated underwriting has not been tested through a full credit cycle. Rising delinquencies in personal loans are a leading indicator to watch.",
  },
  {
    id: "enph-europe-slowdown",
    symbol: "ENPH",
    severity: "notice",
    title: "European demand softening",
    fact: "European inverter revenue declined 18% YoY as Germany and Netherlands pulled back on residential solar subsidies.",
    context: "Enphase generates ~25% of revenue from Europe. Regulatory changes in key EU markets create near-term headwinds.",
  },
];

const BY_SYMBOL: Record<string, StockSignal[]> = {};
for (const s of SIGNALS) {
  if (!BY_SYMBOL[s.symbol]) BY_SYMBOL[s.symbol] = [];
  BY_SYMBOL[s.symbol].push(s);
}

export function signalsForSymbol(symbol: string): StockSignal[] {
  return BY_SYMBOL[symbol.toUpperCase()] ?? [];
}

export function allSignals(): StockSignal[] {
  return SIGNALS;
}

export const SIGNAL_DISCLAIMER = "Illustrative facts for education only — not live data or advice.";
