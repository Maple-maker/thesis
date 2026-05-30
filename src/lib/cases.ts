import type { Stock, UserProfile } from "@/store/types";
import { financialsForSymbol } from "@/data/stock-financials";

/**
 * Generate bull/bear cases for a stock from its tags + stats + real financials.
 * Deterministic, template-based — pulls real data when available.
 */
export function casesFor(stock: Stock): { bull: string[]; bear: string[] } {
  const bull: string[] = [];
  const bear: string[] = [];
  const fin = financialsForSymbol(stock.symbol);

  // Data-driven bull cases (prefer real numbers over tag templates)
  if (fin) {
    if (fin.revenueGrowthYoY > 0.20)
      bull.push(`Revenue surged ${(fin.revenueGrowthYoY * 100).toFixed(0)}% year-over-year — well ahead of the market.`);
    else if (fin.revenueGrowthYoY > 0.10)
      bull.push(`Revenue grew ${(fin.revenueGrowthYoY * 100).toFixed(0)}% YoY with consistent compounding.`);
    if (fin.grossMargin > 0.70)
      bull.push(`Gross margin of ${(fin.grossMargin * 100).toFixed(0)}% signals strong pricing power and competitive advantage.`);
    if (fin.operatingMargin > 0.30)
      bull.push(`Operating margin of ${(fin.operatingMargin * 100).toFixed(0)}% — exceptional operational efficiency.`);
    if (fin.earningsGrowth3yCAGR > 0.20)
      bull.push(`Earnings compounded at ${(fin.earningsGrowth3yCAGR * 100).toFixed(0)}% annually over 3 years.`);
    if (fin.debtToEquity !== null && fin.debtToEquity < 0.3)
      bull.push("Clean balance sheet with minimal debt — financial flexibility.");
  }

  // Tag-driven bull cases (fill remaining)
  if (stock.tags.includes("moat")) bull.push("Durable competitive moat protects long-term margins.");
  if (stock.tags.includes("blue-chip"))
    bull.push("Blue-chip stability — balance sheet that holds up across cycles.");
  if (stock.tags.includes("growth") && !fin)
    bull.push("Top-line growth still ahead of the broader market.");
  if (stock.tags.includes("dividend"))
    bull.push(`Pays you ${stock.divYield}% while you wait — yield with optionality.`);
  if (stock.tags.includes("esg"))
    bull.push("Aligned with secular ESG capital flows.");
  if (stock.tags.includes("international"))
    bull.push("Currency-diversified exposure beyond the US.");
  if (stock.tags.includes("value"))
    bull.push(`Cheaper than peers (P/E ${stock.peRatio ?? "n/a"}) — re-rating optionality.`);

  // Data-driven bear cases
  if (fin) {
    if (fin.revenueGrowthYoY < 0)
      bear.push(`Revenue declining ${(Math.abs(fin.revenueGrowthYoY) * 100).toFixed(0)}% YoY — shrinking top line.`);
    if (fin.operatingMargin < 0)
      bear.push(`Not yet profitable on an operating basis (margin: ${(fin.operatingMargin * 100).toFixed(0)}%).`);
    if (fin.debtToEquity !== null && fin.debtToEquity > 2)
      bear.push(`Levered balance sheet (debt/equity: ${fin.debtToEquity.toFixed(1)}x) — sensitive to rate changes.`);
    if (fin.beta > 2)
      bear.push(`High beta (${fin.beta.toFixed(2)}) — amplified moves in both directions.`);
  }

  // Tag-driven bear cases
  if (stock.volatility === "high")
    bear.push("Higher beta — drawdowns are sharper than the average stock.");
  if (stock.tags.includes("speculative"))
    bear.push("Story stock — fundamentals still need to validate the narrative.");
  if (stock.peRatio && stock.peRatio > 50)
    bear.push(`Rich valuation at ${stock.peRatio}x P/E — leaves little margin for error.`);
  if (stock.tags.includes("high-volatility"))
    bear.push("Pricing in good news already — sentiment shifts hit hard.");
  if (stock.sector === "Energy")
    bear.push("Commodity exposure — earnings swing with oil/gas cycles.");
  if (stock.sector === "Healthcare")
    bear.push("Drug pricing & regulatory headlines can compress multiples.");
  if (stock.marketCap > 1000)
    bear.push("Mega-cap size — law of large numbers caps explosive growth.");
  if (stock.divYield === 0 && stock.tags.includes("growth"))
    bear.push("No dividend support if growth re-rates lower.");

  // Pad to at least 3 each with generic fallbacks if needed
  if (bull.length < 3) {
    bull.push(...defaultBull(stock).slice(0, 3 - bull.length));
  }
  if (bear.length < 3) {
    bear.push(...defaultBear(stock).slice(0, 3 - bear.length));
  }

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
 * "Take" engine — decides which side the profile leans, returns a paragraph + reasons.
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
    body: `${pick.symbol} fits your profile with ${reasons.join(", ")}. ${other.symbol} is the higher-octane / different-shape bet — defensible, but a different trade-off.`,
    chips,
  };
}
