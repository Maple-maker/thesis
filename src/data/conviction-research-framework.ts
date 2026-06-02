/**
 * Stock research scaffold for Thesis Radar, nested under the user's thesis model.
 * Educational prompts only; not investment advice.
 */

export type ConvictionAnalysisDepth = "standard" | "full";

export const CONVICTION_DOSSIER_SECTIONS = [
  "Conviction score (1–10) with one-line rationale tied to the user's thesis",
  "Stock snapshot: price, market cap, 52-week range, YTD, P/E, forward P/E, P/S, other key multiples if relevant. Use labeled lines, not a markdown table.",
  "Business model, how they make money; revenue mix by segment if applicable",
  "Moat, 3 numbered advantages; top 3 competitors with one-line contrast",
  "Bull case, 4–6 specific bullets (catalysts, numbers where possible)",
  "Bear case, 4–6 specific bullets (risks, valuation, competition)",
  "Key metric to track, one KPI + what level confirms bull vs bear",
  "Catalysts (next 12 months), dated events when possible",
  "Probability-weighted scenarios, scenario, price range, probability, implied return presented as labeled lines (educational framing)",
  "Thesis fit, how this name supports, challenges, or overlaps the user's active themes and model weights",
] as const;

export const THEMATIC_BOOK_SECTIONS = [
  "Sector temperature (1–10) with signal label (e.g. cautiously optimistic / frothy)",
  "Macro backdrop, 4–6 bullets on sector flows, policy, retail/institutional tone",
  "Tier framework, Core / Growth / Asymmetric (or sector-appropriate tiers) with target % bands",
  "Relative valuation table when peers are known (P/S, EV/EBITDA, margins, growth, Value/Growth score)",
] as const;

export function buildConvictionDossierUserMessage(
  ticker: string,
  depth: ConvictionAnalysisDepth = "full"
): string {
  const sym = ticker.toUpperCase();
  const sections = CONVICTION_DOSSIER_SECTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n");

  const extra =
    depth === "full"
      ? `
Also include:
- Optional position tier suggestion (Core / Growth / Asymmetric) if it were in a thematic book
- Liquidity / tradability note if OTC, ADR, or thin volume
- Cross-risks vs the user's profile (rate sensitivity, credit cycle, geopolitical) when obvious`
      : "";

  return `Generate a conviction dossier on ${sym} nested under the user's thesis model.

Cover these sections in order (use numbered section labels, not markdown ## headers):

${sections}
${extra}

Style rules:
- Plain English; cite approximate figures when confident, flag when to verify on filings or market data.
- Bull and bear must be symmetric in depth, no cheerleading.
- Probability table is educational scenario math, not a price target recommendation. Present it as labeled lines (e.g. "Bull case: 20% probability, $180-220 range, +35% implied return"), not a pipe table.
- No markdown headers (##) or pipe tables (|---|---|). The chat renderer does not parse them — raw markdown looks broken.
- End with: Educational research, not investment advice.`;
}

export function buildDeepResearchUserMessage(ticker: string): string {
  const sym = ticker.toUpperCase();
  return `Generate a focused research brief on ${sym} for the user's thesis model.

Cover these sections:

1. Conviction snapshot — score 1–10 with one line why, tied to the user's thesis.
2. Business model — how they make money, plain English.
3. Moat and competition — top 3 competitors; unique edge or lack thereof.
4. Bull case (4 specific bullets with numbers where possible)
5. Bear case (4 specific bullets with risks and valuation concerns)
6. Catalysts for the next 12 months
7. Key metric to watch
8. Thesis fit — how this supports or clashes with THEIR model book.

No markdown headers (##), no pipe tables. Use plain paragraphs, numbered sections, and bullet lists.`;
}

export function radarTemplateLabel(templateId: string): string {
  switch (templateId) {
    case "conviction-dossier":
      return "Conviction dossier";
    case "relative-valuation":
      return "Valuation";
    case "deep-research":
    default:
      return "Deep research";
  }
}
