import {
  buildConvictionDossierUserMessage,
  buildDeepResearchUserMessage,
} from "@/data/conviction-research-framework";

export type RadarSearchTemplateId =
  | "deep-research"
  | "conviction-dossier"
  | "relative-valuation";

export type RadarSearchTemplate = {
  id: RadarSearchTemplateId;
  title: string;
  subtitle: string;
  /** Requires two peer tickers from the model book */
  needsCompetitors: boolean;
};

export const RADAR_SEARCH_TEMPLATES: RadarSearchTemplate[] = [
  {
    id: "conviction-dossier",
    title: "Conviction dossier",
    subtitle: "Full bull/bear, key metric, scenarios, depth for your thesis",
    needsCompetitors: false,
  },
  {
    id: "deep-research",
    title: "Deep research brief",
    subtitle: "Business model, moat, catalysts, thesis fit, faster pass",
    needsCompetitors: false,
  },
  {
    id: "relative-valuation",
    title: "Relative valuation table",
    subtitle: "P/S, EV/EBITDA, Value/Growth score vs model peers",
    needsCompetitors: true,
  },
];

export function buildDeepResearchUserMessageForRadar(ticker: string): string {
  return buildDeepResearchUserMessage(ticker);
}

export function buildConvictionDossierUserMessageForRadar(ticker: string): string {
  return buildConvictionDossierUserMessage(ticker, "full");
}

export function buildRelativeValuationUserMessage(
  ticker: string,
  competitor1: string,
  competitor2: string
): string {
  return `Search market data sources (cite when possible). Create a relative valuation table for ${ticker.toUpperCase()} vs ${competitor1.toUpperCase()} and ${competitor2.toUpperCase()}.

Include for each name:
- P/S (TTM and forward)
- EV/EBITDA
- Gross margin
- YoY revenue growth (%)
- Value/Growth Score = P/S TTM ÷ YoY revenue growth % (use growth ≥ 1% to avoid divide-by-zero; lower score = more growth per valuation dollar)

Present as labeled lines (ticker: P/S TTM X, P/S Fwd Y, EV/EBITDA Z, etc.), then 3 bullets on what the comparison implies for a thesis holder. Educational only.`;
}

export function buildRadarUserMessage(
  templateId: RadarSearchTemplateId,
  ticker: string,
  competitors: [string, string]
): string {
  if (templateId === "conviction-dossier") {
    return buildConvictionDossierUserMessageForRadar(ticker);
  }
  if (templateId === "relative-valuation") {
    return buildRelativeValuationUserMessage(ticker, competitors[0], competitors[1]);
  }
  return buildDeepResearchUserMessageForRadar(ticker);
}
