import { buildMacroSnapshot } from "./macro-snapshot.js";
import { fetchFedHeadlines } from "./macro-news.js";
import { fetchFredLatest } from "./fred.js";
import { fetchTreasuryYields } from "./treasury.js";

export type ToolRunResult = {
  ok: boolean;
  tool: string;
  asOf?: string;
  data: Record<string, unknown>;
  summary: string;
};

export const MACRO_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_macro_snapshot",
      description:
        "Fetch current US macro snapshot: Fed funds rate, Treasury 2y/10y yields, yield curve spread, CPI index level, and recent Fed press headlines. Use when the user asks about rates, inflation, the Fed, yield curve, or 'what's going on in markets'.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_fed_funds_rate",
      description: "Latest effective Federal Funds rate from FRED with as-of date.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_treasury_yields",
      description: "Latest US Treasury 2-year and 10-year yields and 10y−2y spread from Treasury.gov.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_fed_headlines",
      description:
        "Recent Federal Reserve press release headlines, use for 'what did the Fed say' or macro news context.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max headlines (default 5)" },
        },
      },
    },
  },
];

export async function runMacroTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolRunResult> {
  switch (name) {
    case "get_macro_snapshot": {
      const snap = await buildMacroSnapshot();
      return {
        ok: true,
        tool: name,
        asOf: snap.fetchedAt,
        data: {
          series: snap.series,
          headlines: snap.headlines,
          configured: snap.configured,
        },
        summary: snap.series.map((s) => `${s.label} ${s.value}`).join("; ") || "No live data",
      };
    }
    case "get_fed_funds_rate": {
      const fed = await fetchFredLatest("FEDFUNDS", "Fed funds", "percent");
      if (!fed) {
        return {
          ok: false,
          tool: name,
          data: {},
          summary: "Fed funds unavailable, set FRED_API_KEY on server",
        };
      }
      return {
        ok: true,
        tool: name,
        asOf: fed.asOf,
        data: { rate_pct: fed.value, series: fed.seriesId },
        summary: `Fed funds ${fed.value}% as of ${fed.asOf}`,
      };
    }
    case "get_treasury_yields": {
      const t = await fetchTreasuryYields();
      if (!t) {
        return { ok: false, tool: name, data: {}, summary: "Treasury yields unavailable" };
      }
      return {
        ok: true,
        tool: name,
        asOf: t.asOf,
        data: {
          year2_pct: t.year2,
          year10_pct: t.year10,
          spread_10y_2y_pct: t.spread10y2y,
        },
        summary: `2y ${t.year2}% · 10y ${t.year10}% · spread ${t.spread10y2y}% (${t.asOf})`,
      };
    }
    case "get_fed_headlines": {
      const limit = typeof args.limit === "number" ? Math.min(8, args.limit) : 5;
      const items = await fetchFedHeadlines(limit);
      return {
        ok: true,
        tool: name,
        data: { headlines: items },
        summary: items.map((h) => h.title).join(" | ") || "No headlines fetched",
      };
    }
    default:
      return { ok: false, tool: name, data: {}, summary: `Unknown tool: ${name}` };
  }
}

export function macroToolsEnabled(): boolean {
  return process.env.ASSISTANT_TOOLS !== "0";
}
