/**
 * Stock-detail metric glossary (tap-to-learn on financial pills & thesis text).
 */

export type InvestingGlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  example?: string;
};

const TERMS: InvestingGlossaryTerm[] = [
  {
    id: "revenue-growth",
    term: "Revenue growth",
    definition:
      "How fast a company's sales are increasing year over year. Strong growth can support a higher valuation if margins hold.",
    example: "+18% YoY means sales are 18% higher than the same quarter last year.",
  },
  {
    id: "gross-margin",
    term: "Gross margin",
    definition:
      "Revenue minus direct costs of goods sold, as a percentage of revenue. Shows pricing power before operating expenses.",
  },
  {
    id: "operating-margin",
    term: "Operating margin",
    definition:
      "Operating income divided by revenue. Reflects core business profitability after R&D, SG&A, and other operating costs.",
  },
  {
    id: "debt-to-equity",
    term: "Debt / equity",
    definition:
      "Total debt relative to shareholder equity. Higher ratios mean more leverage and sensitivity to rate hikes or downturns.",
  },
  {
    id: "cagr",
    term: "Earnings CAGR (3Y)",
    definition:
      "Compound annual growth rate of earnings over three years. Smooths single-year spikes or write-downs.",
  },
  {
    id: "free-cash-flow",
    term: "Free cash flow yield",
    definition:
      "Free cash flow divided by market cap. A higher yield can mean the business generates more cash per dollar of valuation.",
  },
  {
    id: "p-e-ratio",
    term: "P/E ratio",
    definition:
      "Price divided by earnings per share. Compare vs peers and history — not a buy signal on its own.",
  },
  {
    id: "market-cap",
    term: "Market cap",
    definition: "Share price × shares outstanding. Rough size bucket for liquidity and index inclusion.",
  },
  {
    id: "dividend-yield",
    term: "Dividend yield",
    definition: "Annual dividend per share divided by price. Income return before price appreciation.",
  },
  {
    id: "moat",
    term: "Moat",
    definition:
      "Durable competitive advantage — network effects, switching costs, scale, or IP that protects margins over time.",
  },
  {
    id: "volatility",
    term: "Volatility",
    definition: "How sharply the stock price moves. Higher volatility often means wider drawdowns and bigger swings.",
  },
];

const BY_ID = new Map(TERMS.map((t) => [t.id, t]));

export function glossaryTermById(id: string): InvestingGlossaryTerm | undefined {
  return BY_ID.get(id);
}

/** All terms sorted longest-first for inline matching in GlossaryText. */
export function allGlossaryTerms(): InvestingGlossaryTerm[] {
  return [...TERMS].sort((a, b) => b.term.length - a.term.length);
}
