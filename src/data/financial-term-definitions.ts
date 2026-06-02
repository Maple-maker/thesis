/**
 * Plain-English definitions for onboarding & builder, education first.
 */

export type FinancialTermDef = {
  id: string;
  term: string;
  definition: string;
  example?: string;
};

export const FINANCIAL_TERM_DEFINITIONS: FinancialTermDef[] = [
  {
    id: "capital-preservation",
    term: "Capital preservation",
    definition:
      "Keeping the money you already have safe, with modest growth. You accept smaller ups and downs so a near-term goal (house, tuition) is less likely to be hurt by a market drop.",
    example: "Often pairs with bonds, cash, and lower-volatility stocks.",
  },
  {
    id: "burn-rate",
    term: "Burn rate",
    definition:
      "How much cash you spend per month (or year) to live, especially after you stop working. In retirement forecasts, burn rate is what your portfolio must cover after other income (Social Security, pension).",
    example: "$4,000/month spending ≈ $48,000/year burn rate.",
  },
  {
    id: "target-net-worth",
    term: "Target net worth",
    definition:
      "What you want your assets minus debts to reach, a finish line for planning. Thesis suggests multiples of your annual burn (yearly spending), not just income.",
  },
  {
    id: "four-times-burn",
    term: "4× annual burn",
    definition:
      "Four years of yearly spending saved as net worth, a resilience floor (roughly 4 × monthly burn × 12). Helpful as a milestone, not a full retirement number for most people.",
    example: "$4,000/mo burn → $192,000 (4× $48k/yr).",
  },
  {
    id: "four-percent-rule",
    term: "25× annual burn (4% rule)",
    definition:
      "A common retirement heuristic: net worth ≈ 25 times yearly spending, so you might withdraw ~4% per year. If burn is $48k/yr, target ≈ $1.2M.",
  },
  {
    id: "state-tax-residency",
    term: "State of residence (tax)",
    definition:
      "Where you live and usually file state income taxes. Drives state brackets, some credits, and whether you have local income tax (e.g. TX/FL none; CA/NY higher).",
  },
  {
    id: "drawdown",
    term: "Drawdown",
    definition:
      "How far an investment falls from a recent peak. A 25% drawdown means a $100,000 portfolio dropped to about $75,000 before recovering.",
  },
  {
    id: "volatility",
    term: "Volatility",
    definition:
      "How much an investment’s price swings up and down. High volatility can mean higher long-term returns, but bigger stomach-churning drops along the way.",
  },
  {
    id: "emergency-fund",
    term: "Emergency fund",
    definition:
      "Cash set aside for surprises (job loss, medical bill, car repair). A common rule of thumb is roughly three to six months of essential expenses before taking extra market risk.",
  },
  {
    id: "high-interest-debt",
    term: "High-interest debt",
    definition:
      "Borrowing with a very high APR, often credit cards or payday loans. Paying it down is like earning a guaranteed return at that rate, which usually beats expected stock market returns.",
  },
  {
    id: "investable-assets",
    term: "Investable assets",
    definition:
      "Money you could put in markets without breaking near-term plans, brokerage, retirement accounts, and cash earmarked for investing. Not your emergency fund or next month’s rent.",
  },
  {
    id: "time-horizon",
    term: "Time horizon",
    definition:
      "How long until you need the money. Short horizons (under ~3 years) usually mean less stock risk; long horizons (10+ years) can tolerate more volatility.",
  },
  {
    id: "risk-tolerance",
    term: "Risk tolerance",
    definition:
      "How much loss and volatility you can handle emotionally and financially, not how much risk you wish you could take.",
  },
  {
    id: "leverage",
    term: "Leverage",
    definition:
      "Using borrowed money or derivatives to magnify gains and losses. Can boost returns in good times but increases blow-up risk.",
  },
  {
    id: "fomo",
    term: "FOMO",
    definition:
      "Fear of missing out, the urge to buy because a stock or theme is hot. A common behavioral trap that pushes people into risk they did not plan for.",
  },
  {
    id: "compounders",
    term: "Compounders / blue-chip compounders",
    definition:
      "Large, durable companies that reinvest profits and grow steadily over many years (think household brands with wide moats). Often lower drama than speculative tech.",
  },
  {
    id: "esg",
    term: "ESG",
    definition:
      "Environmental, social, and governance factors, a lens for favoring companies scored as more responsible on climate, labor, ethics, and board quality.",
  },
  {
    id: "emerging-markets",
    term: "Emerging markets",
    definition:
      "Countries with faster growth potential but more political, currency, and regulatory risk than developed markets (e.g. parts of Asia, Latin America).",
  },
  {
    id: "reit",
    term: "REIT",
    definition:
      "Real Estate Investment Trust, a company that owns or finances property and pays out most income as dividends. Gives stock-market access to real estate.",
  },
  {
    id: "index-funds",
    term: "Index funds",
    definition:
      "Funds that track a market basket (like the S&P 500) instead of picking individual stocks. Usually low fee and diversified.",
  },
  {
    id: "tax-efficiency",
    term: "Tax efficiency",
    definition:
      "Structuring investments and accounts so you keep more after taxes, using retirement accounts, holding periods, and asset location thoughtfully.",
  },
  {
    id: "savings-rate",
    term: "Savings rate",
    definition:
      "The share of your take-home pay you do not spend, what is left to invest or build cash reserves.",
  },
  {
    id: "income-focus",
    term: "Income focus",
    definition:
      "Prioritizing dividends, interest, and cash distributions from investments instead of mainly betting on price appreciation.",
  },
  {
    id: "growth-focus",
    term: "Growth focus",
    definition:
      "Prioritizing companies or funds expected to grow earnings faster, often with less emphasis on dividends today.",
  },
  {
    id: "sleep-at-night",
    term: "Sleep-at-night threshold",
    definition:
      "The portfolio drop you can tolerate without panic-selling. Honest answers here shape how much stock risk Thesis suggests.",
  },
  {
    id: "foreign-exposure",
    term: "Foreign / international exposure",
    definition:
      "Investing outside your home country, often via ETFs like VXUS or individual global stocks, to diversify away from one economy’s risks.",
  },
  {
    id: "sharpe-ratio",
    term: "Sharpe ratio",
    definition:
      "A measure of return per unit of risk. Higher is better — it means you’re getting more reward for the volatility you’re enduring. Above 1.0 is solid, above 2.0 is excellent, below 0 means you’d have done better in cash. Compares your excess return (over the risk-free rate) to how bumpy the ride was.",
    example: "A portfolio returning 15% with 12% volatility and a 4.5% risk-free rate has a Sharpe of about 0.88.",
  },
  {
    id: "beta",
    term: "Beta",
    definition:
      "How much your portfolio moves relative to the S&P 500. A beta of 1.0 means it tracks the market. Above 1.0 means it amplifies market moves (tech-heavy portfolios often do). Below 1.0 means it’s steadier than the market (dividend and bond-heavy portfolios).",
    example: "Beta 1.3 = if the S&P 500 goes up 10%, expect your book to go up ~13% — and down ~13% when the market drops 10%.",
  },
  {
    id: "max-drawdown",
    term: "Max drawdown",
    definition:
      "The largest peak-to-trough drop your portfolio would experience. A 35% max drawdown means at some point your $100,000 became $65,000 before recovering. The real test is whether you’d hold through it or panic-sell at the bottom.",
    example: "S&P 500 max drawdowns: -34% (2020), -57% (2008), -51% (2000-02). Tech-heavy portfolios often draw down more.",
  },
];

const BY_ID = new Map(FINANCIAL_TERM_DEFINITIONS.map((d) => [d.id, d]));

/** Match onboarding copy to a glossary entry. */
export function financialTermForText(text: string): FinancialTermDef | undefined {
  const lower = text.toLowerCase();
  for (const def of FINANCIAL_TERM_DEFINITIONS) {
    if (lower.includes(def.term.toLowerCase())) return def;
  }
  const rules: [RegExp, string][] = [
    [/capital preservation/i, "capital-preservation"],
    [/burn rate/i, "burn-rate"],
    [/target net worth/i, "target-net-worth"],
    [/4×|four times.*burn|4x annual burn/i, "four-times-burn"],
    [/25×|25x|4% rule|four percent/i, "four-percent-rule"],
    [/state of residence|state tax/i, "state-tax-residency"],
    [/drawdown/i, "drawdown"],
    [/volatilit/i, "volatility"],
    [/emergency fund|3 months/i, "emergency-fund"],
    [/high-interest debt|credit cards/i, "high-interest-debt"],
    [/investable assets/i, "investable-assets"],
    [/time horizon|investment horizon/i, "time-horizon"],
    [/risk tolerance/i, "risk-tolerance"],
    [/leverage/i, "leverage"],
    [/\bfomo\b|missing out/i, "fomo"],
    [/compounders?|blue-chip/i, "compounders"],
    [/\besg\b|responsible companies/i, "esg"],
    [/emerging market/i, "emerging-markets"],
    [/\breit/i, "reit"],
    [/index fund|s&p 500|total market/i, "index-funds"],
    [/tax efficien/i, "tax-efficiency"],
    [/savings rate/i, "savings-rate"],
    [/income focus/i, "income-focus"],
    [/growth focus/i, "growth-focus"],
    [/sleep-at-night/i, "sleep-at-night"],
    [/foreign|international exposure|global/i, "foreign-exposure"],
    [/sharpe ratio|sharpe\b/i, "sharpe-ratio"],
    [/\bbeta\b/i, "beta"],
    [/max drawdown|max dd/i, "max-drawdown"],
  ];
  for (const [re, id] of rules) {
    if (re.test(text)) return BY_ID.get(id);
  }
  return undefined;
}

export function financialTermById(id: string): FinancialTermDef | undefined {
  return BY_ID.get(id);
}
