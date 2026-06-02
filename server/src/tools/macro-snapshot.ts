import { fetchFedHeadlines, type MacroHeadline } from "./macro-news.js";
import { fetchFredLatest, fredConfigured } from "./fred.js";
import { fetchTreasuryYields } from "./treasury.js";

export type MacroSeries = {
  id: string;
  label: string;
  value: string;
  asOf: string;
  source: string;
  detail?: string;
};

export type MacroSnapshot = {
  fetchedAt: string;
  configured: { fred: boolean; treasury: boolean; news: boolean };
  series: MacroSeries[];
  headlines: MacroHeadline[];
  contextBlock: string;
  disclaimer: string;
};

function fmtPct(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}

export async function buildMacroSnapshot(): Promise<MacroSnapshot> {
  const [fedFunds, cpi, treasury, headlines] = await Promise.all([
    fetchFredLatest("FEDFUNDS", "Fed funds effective rate", "percent"),
    fetchFredLatest("CPIAUCSL", "CPI (all urban consumers, index)", "index"),
    fetchTreasuryYields(),
    fetchFedHeadlines(5),
  ]);

  const series: MacroSeries[] = [];

  if (fedFunds) {
    series.push({
      id: "fed_funds",
      label: "Fed funds rate",
      value: fmtPct(fedFunds.value),
      asOf: fedFunds.asOf,
      source: "FRED (FEDFUNDS)",
      detail: "Benchmark overnight rate set by Federal Reserve policy.",
    });
  }

  if (treasury?.year10 != null) {
    series.push({
      id: "treasury_10y",
      label: "10-year Treasury yield",
      value: fmtPct(treasury.year10),
      asOf: treasury.asOf,
      source: "US Treasury",
    });
  }

  if (treasury?.year2 != null) {
    series.push({
      id: "treasury_2y",
      label: "2-year Treasury yield",
      value: fmtPct(treasury.year2),
      asOf: treasury.asOf,
      source: "US Treasury",
    });
  }

  if (treasury?.spread10y2y != null) {
    const inverted = treasury.spread10y2y < 0;
    series.push({
      id: "curve_10y2y",
      label: "10y − 2y yield spread",
      value: `${treasury.spread10y2y >= 0 ? "+" : ""}${treasury.spread10y2y.toFixed(2)}%`,
      asOf: treasury.asOf,
      source: "US Treasury",
      detail: inverted
        ? "Inverted curve, often discussed as a recession watch signal (not a forecast)."
        : "Positive spread, typical late-cycle shape.",
    });
  }

  if (cpi) {
    series.push({
      id: "cpi_index",
      label: "CPI index level",
      value: cpi.value.toFixed(1),
      asOf: cpi.asOf,
      source: "FRED (CPIAUCSL)",
      detail: "Use year-over-year % change in prose if user asks about inflation pace.",
    });
  }

  const lines = series.map(
    (s) => `• ${s.label}: ${s.value} (as of ${s.asOf}, ${s.source})${s.detail ? `, ${s.detail}` : ""}`
  );

  const headlineLines = headlines.map((h) => `• ${h.title}${h.date ? ` (${h.date})` : ""}`);

  const contextBlock = [
    "Live macro and markets data (fetched for this turn):",
    lines.length ? lines.join("\n") : "• Live series unavailable, explain mechanisms without inventing current levels.",
    headlines.length ? "\nRecent Fed press headlines:\n" + headlineLines.join("\n") : "",
    "\nRules: Cite these figures when answering rate, inflation, or curve questions. If a series is missing, say you do not have a live reading and teach the framework. Never fabricate today's rates or headlines.",
  ].join("\n");

  return {
    fetchedAt: new Date().toISOString(),
    configured: {
      fred: fredConfigured(),
      treasury: treasury != null,
      news: headlines.length > 0,
    },
    series,
    headlines,
    contextBlock,
    disclaimer: "Educational tool, not investment advice. Macro data is delayed and rounded.",
  };
}

export function isMacroQuestion(text: string): boolean {
  return /fed|federal reserve|interest rate|yield curve|treasury|inflation|cpi|pce|macro|monetary policy|rate cut|rate hike|powell|fomc|bond market|10[- ]?year|2[- ]?year|headline|news|market today/i.test(
    text
  );
}
