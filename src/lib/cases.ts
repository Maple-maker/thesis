import type { ETF, Stock, UserProfile } from "@/store/types";
import { financialsForSymbol } from "@/data/stock-financials";

/**
 * Generate bull/bear cases for a stock from its tags + stats + real financials.
 * Deterministic, template-based, pulls real data when available.
 */
export function casesFor(stock: Stock): { bull: string[]; bear: string[] } {
  const bull: string[] = [];
  const bear: string[] = [];
  const fin = financialsForSymbol(stock.symbol);

  // Data-driven bull cases (prefer real numbers over tag templates)
  if (fin) {
    if (fin.revenueGrowthYoY > 0.20)
      bull.push(`Revenue surged ${(fin.revenueGrowthYoY * 100).toFixed(0)}% year-over-year, well ahead of the market.`);
    else if (fin.revenueGrowthYoY > 0.10)
      bull.push(`Revenue grew ${(fin.revenueGrowthYoY * 100).toFixed(0)}% YoY with consistent compounding.`);
    if (fin.grossMargin > 0.70)
      bull.push(`Gross margin of ${(fin.grossMargin * 100).toFixed(0)}% signals strong pricing power and competitive advantage.`);
    if (fin.operatingMargin > 0.30)
      bull.push(`Operating margin of ${(fin.operatingMargin * 100).toFixed(0)}%, exceptional operational efficiency.`);
    if (fin.earningsGrowth3yCAGR > 0.20)
      bull.push(`Earnings compounded at ${(fin.earningsGrowth3yCAGR * 100).toFixed(0)}% annually over 3 years.`);
    if (fin.debtToEquity !== null && fin.debtToEquity < 0.3)
      bull.push("Clean balance sheet with minimal debt, financial flexibility.");
  }

  // Tag-driven bull cases (fill remaining)
  if (stock.tags.includes("moat")) bull.push("Durable competitive moat protects long-term margins.");
  if (stock.tags.includes("blue-chip"))
    bull.push("Blue-chip stability, balance sheet that holds up across cycles.");
  if (stock.tags.includes("growth") && !fin)
    bull.push("Top-line growth still ahead of the broader market.");
  if (stock.tags.includes("dividend"))
    bull.push(`Pays you ${stock.divYield}% while you wait, yield with optionality.`);
  if (stock.tags.includes("esg"))
    bull.push("Aligned with secular ESG capital flows.");
  if (stock.tags.includes("international"))
    bull.push("Currency-diversified exposure beyond the US.");
  if (stock.tags.includes("value"))
    bull.push(`Cheaper than peers (P/E ${stock.peRatio ?? "n/a"}), re-rating optionality.`);
  if (stock.tags.includes("semiconductor") || stock.tags.includes("ai-compute"))
    bull.push("Structural demand for compute and chips, secular tailwind if capex holds.");
  if (stock.tags.includes("biotech"))
    bull.push("Pipeline optionality, one approved therapy can re-rate the whole platform.");
  if (stock.tags.includes("defensive") || stock.tags.includes("consumer-staples"))
    bull.push("Recession-resistant demand, earnings tend to hold when consumers pull back.");
  if (stock.tags.includes("income-heavy"))
    bull.push("Cash yield cushions volatility while you wait for total return.");

  // Data-driven bear cases
  if (fin) {
    if (fin.revenueGrowthYoY < 0)
      bear.push(`Revenue declining ${(Math.abs(fin.revenueGrowthYoY) * 100).toFixed(0)}% YoY, shrinking top line.`);
    if (fin.operatingMargin < 0)
      bear.push(`Not yet profitable on an operating basis (margin: ${(fin.operatingMargin * 100).toFixed(0)}%).`);
    if (fin.debtToEquity !== null && fin.debtToEquity > 2)
      bear.push(`Levered balance sheet (debt/equity: ${fin.debtToEquity.toFixed(1)}x), sensitive to rate changes.`);
    if (fin.beta > 2)
      bear.push(`High beta (${fin.beta.toFixed(2)}), amplified moves in both directions.`);
  }

  // Tag-driven bear cases
  if (stock.volatility === "high")
    bear.push("Higher beta, drawdowns are sharper than the average stock.");
  if (stock.tags.includes("speculative"))
    bear.push("Story stock, fundamentals still need to validate the narrative.");
  if (stock.peRatio && stock.peRatio > 50)
    bear.push(`Rich valuation at ${stock.peRatio}x P/E, leaves little margin for error.`);
  if (stock.tags.includes("high-volatility"))
    bear.push("Pricing in good news already, sentiment shifts hit hard.");
  if (stock.sector === "Energy")
    bear.push("Commodity exposure, earnings swing with oil/gas cycles.");
  if (stock.sector === "Healthcare")
    bear.push("Drug pricing & regulatory headlines can compress multiples.");
  if (stock.marketCap > 1000)
    bear.push("Mega-cap size, law of large numbers caps explosive growth.");
  if (stock.divYield === 0 && stock.tags.includes("growth"))
    bear.push("No dividend support if growth re-rates lower.");
  if (stock.tags.includes("cyclical"))
    bear.push("Earnings tied to the economic cycle, downturns hit before staples.");
  if (stock.tags.includes("turnaround"))
    bear.push("Turnaround stories often take longer than the market's patience.");
  if (stock.tags.includes("international"))
    bear.push("FX, geopolitics, and local regulation add layers US-only names skip.");
  if (stock.tags.includes("reit"))
    bear.push("Rate-sensitive, rising yields can pressure property valuations.");
  if (stock.tags.includes("biotech"))
    bear.push("Clinical trial risk, failed studies can gap the stock down.");

  // Pad to at least 3 each with generic fallbacks if needed
  if (bull.length < 3) {
    bull.push(...defaultBull(stock).slice(0, 3 - bull.length));
  }
  if (bear.length < 3) {
    bear.push(...defaultBear(stock).slice(0, 3 - bear.length));
  }

  return { bull: bull.slice(0, 4), bear: bear.slice(0, 4) };
}

export function casesForEtf(etf: ETF): { bull: string[]; bear: string[] } {
  const themeLine =
    etf.themes.length > 0
      ? etf.themes.map((t) => t.replace(/-/g, " ")).join(", ")
      : "its benchmark sleeve";

  const bull: string[] = [
    `One-ticket exposure to ${themeLine}.`,
    `${etf.expense}% expense ratio, know the drag vs holding singles.`,
  ];
  if (etf.holdings.length > 0) {
    bull.push(
      `${etf.holdings.length} representative holdings, diversification without picking every name.`
    );
  }
  if (etf.tags.includes("low-cost"))
    bull.push("Low fee structure, more of the return stays in your pocket over decades.");
  if (etf.tags.includes("broad-market"))
    bull.push("Broad beta, hard to beat the market, but hard to miss it either.");
  if (etf.tags.includes("income") || etf.tags.includes("dividend-growth"))
    bull.push("Income-oriented sleeve, distributions can smooth the psychological ride.");
  if (etf.tags.includes("semiconductor") || etf.tags.includes("clean-energy"))
    bull.push("Thematic basket, captures a sector wave without single-name blow-up risk.");
  bull.push("Useful when you want theme exposure without single-stock idiosyncratic risk.");

  const bear: string[] = [
    "You inherit every holding's flaws, including the largest weights you may not want.",
    etf.expense > 0.4
      ? "Higher fee sleeve, compounding cost matters over decades."
      : "Fees still compound, compare to a cheaper ETF in Duel before adding.",
  ];
  if (etf.tags.includes("active-concentrated") || etf.tags.includes("higher-fee"))
    bear.push("Active or high-fee funds need to outperform just to match a plain index fund.");
  if (etf.tags.includes("emerging-markets") || etf.tags.includes("international"))
    bear.push("Currency and country risk, US headlines are not the only driver of returns.");
  if (etf.tags.includes("leveraged-inverse"))
    bear.push("Leveraged/inverse products decay over time, not buy-and-hold vehicles.");
  bear.push("Overlap with other ETFs in your book can silently double exposure (check X-Ray).");
  bear.push("Methodology changes and tracking error can diverge from the theme you expect.");

  return { bull: bull.slice(0, 4), bear: bear.slice(0, 4) };
}

function defaultBull(s: Stock): string[] {
  return [
    `Category leader in ${s.sector} with reinvestment runway.`,
    "Cash generation funds the next leg of compounding.",
    "Management has skin in the game and clear capital allocation discipline.",
  ];
}

function defaultBear(s: Stock): string[] {
  return [
    `Cyclical exposure in ${s.sector} could compress earnings.`,
    "Competition from well-funded incumbents is rising.",
    "Macro shocks (rates, FX, geopolitics) could de-rate the multiple.",
  ];
}

/**
 * "Take" engine, decides which side the profile leans, returns a paragraph + reasons.
 */
export function takeFor(a: Stock, b: Stock, profile: UserProfile): {
  pick: string;
  body: string;
  chips: string[];
} {
  // Score each based on profile alignment
  const score = (s: Stock) => {
    let v = 0;
    if (profile.risk === "very-low" || profile.risk === "low") {
      if (s.volatility === "low") v += 3;
      if (s.volatility === "high") v -= 3;
      if (s.tags.includes("blue-chip")) v += 2;
      if (s.tags.includes("dividend")) v += 1;
      if (s.tags.includes("speculative")) v -= 3;
    }
    if (profile.risk === "very-high" || profile.risk === "high") {
      if (s.tags.includes("growth")) v += 2;
      if (s.tags.includes("speculative")) v += 1;
    }
    if (profile.incomeNeed === "primary") {
      if (s.divYield >= 2.5) v += 3;
      if (s.divYield === 0) v -= 2;
    }
    if (profile.horizon === "very-long") {
      if (s.tags.includes("growth")) v += 1;
      if (s.tags.includes("moat")) v += 1;
    }
    if (profile.horizon === "short") {
      if (s.tags.includes("blue-chip")) v += 2;
      if (s.volatility === "high") v -= 2;
    }
    return v;
  };

  const sa = score(a);
  const sb = score(b);
  const pick = sa >= sb ? a : b;
  const other = pick === a ? b : a;

  const reasons: string[] = [];
  if (pick.tags.includes("moat") && !other.tags.includes("moat"))
    reasons.push("a stronger moat");
  if (pick.volatility === "low" && other.volatility !== "low" && (profile.risk === "low" || profile.risk === "very-low"))
    reasons.push("a calmer ride that matches your risk tolerance");
  if (pick.divYield > other.divYield && profile.incomeNeed !== "none")
    reasons.push(`more income (${pick.divYield}% vs ${other.divYield}%)`);
  if (pick.tags.includes("growth") && profile.horizon === "very-long")
    reasons.push("a growth profile that compounds over a long horizon");
  if (reasons.length === 0) reasons.push("better overall alignment to your profile");

  const chips = [
    profile.risk.replace("-", " ") + " risk",
    profile.horizon + " horizon",
    profile.incomeNeed === "none" ? "growth-first" : profile.incomeNeed + " income",
  ];

  return {
    pick: pick.symbol,
    body: `${pick.symbol} fits your profile with ${reasons.join(", ")}. ${other.symbol} is the higher-octane / different-shape bet, defensible, but a different trade-off.`,
    chips,
  };
}

/** After user picks a side, narrative take for synthesis (mockup-style CFO take). */
export function takeForUserPick(
  winner: Stock,
  loser: Stock,
  profile: UserProfile,
  options?: { techWeightPct?: number }
): { pick: string; body: string; chips: string[] } {
  const riskLabel = profile.risk.replace("-", " ") + " risk";
  const horizonLabel =
    profile.horizon === "very-long"
      ? "Long-term (10+ yrs)"
      : profile.horizon === "long"
        ? "Long horizon"
        : profile.horizon + " horizon";

  const chips = [riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1)];
  if (options?.techWeightPct != null && options.techWeightPct > 20) {
    chips.push(`${Math.round(options.techWeightPct)}% tech-weighted`);
  }
  chips.push(horizonLabel);

  const body = `You chose ${winner.symbol} over ${loser.symbol}. For your ${riskLabel} profile, ${winner.name.split(" ")[0]} aligns with how you've framed your goals, while ${loser.symbol} may still add diversification or theme exposure. Compare overlap with your book before sizing either position.`;

  return { pick: winner.symbol, body, chips };
}

export function techWeightFromHoldings(
  holdings: { symbol: string; weightPct: number }[]
): number {
  const techSyms = new Set([
    "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "AVGO", "AMD", "TSM", "QQQ", "SMH", "VOO",
  ]);
  return holdings
    .filter((h) => techSyms.has(h.symbol))
    .reduce((s, h) => s + h.weightPct, 0);
}
