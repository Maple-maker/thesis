import type { Request, Response } from "express";
import { z } from "zod";
import { completeChat, type ChatTurn } from "./llm.js";

// ── Types ──────────────────────────────────────────────────────────────

const CatalystBody = z.object({
  ticker: z.string().min(1).max(10),
  layers: z.array(z.string()).optional(), // L1-L7, defaults to all
});

type CatalystLayer = {
  layer: string;
  label: string;
  events: {
    date: string; // "2026-06-15" or "Q3 2026" or "TBD"
    title: string;
    impact: "High" | "Medium" | "Low";
    direction: "Bullish" | "Bearish" | "Neutral";
    detail: string;
  }[];
  summary: string;
};

type CatalystResult = {
  ticker: string;
  layers: CatalystLayer[];
  topCatalysts: { layer: string; title: string; impact: string; date: string }[];
  aggregateScore: number; // -100 (all bearish) to +100 (all bullish)
  summary: string;
};

// ── Layer definitions ──────────────────────────────────────────────────

const LAYER_LABELS: Record<string, string> = {
  L1: "Earnings & Guidance",
  L2: "FDA & Regulatory",
  L3: "Product & Pipeline",
  L4: "Macro & Rates",
  L5: "Insider & Institutional Activity",
  L6: "Options & Derivatives Flow",
  L7: "Sector & Index Catalysts",
};

const ALL_LAYERS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];

// ── Per-layer prompts ──────────────────────────────────────────────────

const LAYER_PROMPTS: Record<string, string> = {
  L1: `Analyze upcoming EARNINGS catalysts for the ticker:
- Next earnings report date (estimated if not confirmed)
- Consensus EPS/revenue expectations
- Historical earnings surprise pattern (beat/miss %)
- Guidance revision trend (raised/lowered)
- Key metrics to watch (margins, growth rate, specific KPIs)
Output 2-4 specific events with dates and impact ratings.`,

  L2: `Analyze upcoming FDA & REGULATORY catalysts for the ticker:
- PDUFA dates, clinical trial readouts, phase transitions
- Regulatory decisions (FDA, FTC, SEC, international regulators)
- Patent expirations or challenges
- Compliance deadlines, litigation milestones
- If not a healthcare/regulated company, note "No significant regulatory catalysts" and skip
Output 1-3 specific events (or empty if N/A).`,

  L3: `Analyze upcoming PRODUCT & PIPELINE catalysts for the ticker:
- Product launches, feature releases, platform expansions
- Partnership announcements, contract wins
- Manufacturing ramp, capacity expansion
- Geographic expansion, new market entry
- Competitive product launches that threaten share
Output 2-4 specific events with dates and impact ratings.`,

  L4: `Analyze MACRO & RATES catalysts affecting the ticker:
- Fed meeting dates and rate decision implications
- CPI, PPI, employment data releases
- Currency exposure (USD strength/weakness impact)
- Commodity price sensitivity (oil, metals, ag)
- Fiscal policy, tax changes, tariffs
Output 2-4 macro events with estimated dates and impact on this specific ticker.`,

  L5: `Analyze INSIDER & INSTITUTIONAL activity signals for the ticker:
- Recent insider buying/selling patterns (last 3 months)
- Institutional ownership changes (13F filings)
- Share buyback programs or dilution events
- Activist investor involvement
- Executive turnover, board changes
Output 2-4 specific signals with impact ratings.`,

  L6: `Analyze OPTIONS & DERIVATIVES flow for the ticker:
- Unusual options activity (deep OTM calls/puts, large block trades)
- Put/call ratio anomalies vs historical average
- Max pain / options strike concentration
- Gamma exposure and potential pin risk
- Short interest changes, days to cover
Output 2-4 specific flow signals with impact ratings.`,

  L7: `Analyze SECTOR & INDEX catalysts for the ticker:
- ETF rebalancing dates (if in major ETFs)
- Index inclusion/reconstitution events (S&P, Russell, Nasdaq)
- Sector rotation signals (cyclical vs defensive)
- Peer company earnings that set sector tone
- Industry conference presentations, analyst days
Output 2-4 sector-level events with estimated dates and impact ratings.`,
};

// ── Per-layer system prompts ───────────────────────────────────────────

function layerSystemPrompt(layer: string): string {
  const label = LAYER_LABELS[layer] ?? layer;
  return `You are a catalyst research analyst specializing in ${label}.
Given a stock ticker, identify specific, dateable catalysts in your layer.
Output ONLY valid JSON (no markdown, no backticks):
{
  "events": [
    { "date": "YYYY-MM-DD or Q# YYYY or TBD", "title": string, "impact": "High" | "Medium" | "Low", "direction": "Bullish" | "Bearish" | "Neutral", "detail": "1-2 sentences" }
  ],
  "summary": "1-2 sentence layer summary"
}
If there are truly no relevant catalysts in this layer for this ticker, return an empty events array and a brief explanation in summary.
Impact: High = stock-moving, Medium = notable, Low = background noise.`;
}

// ── Main research function ─────────────────────────────────────────────

export async function postCatalystResearch(req: Request, res: Response) {
  const parsed = CatalystBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", detail: parsed.error.flatten() });
    return;
  }

  const { ticker, layers: requestedLayers } = parsed.data;
  const layers = requestedLayers?.length ? requestedLayers : ALL_LAYERS;

  try {
    // Run each layer in parallel
    const layerPromises = layers.map(async (layerId) => {
      const label = LAYER_LABELS[layerId] ?? layerId;
      const prompt = LAYER_PROMPTS[layerId];
      if (!prompt) return null;

      const messages: ChatTurn[] = [
        {
          role: "user",
          content: `## Ticker: $${ticker.toUpperCase()}\n## Layer: ${label}\n\n${prompt}`,
        },
      ];

      try {
        const completion = await completeChat({
          system: layerSystemPrompt(layerId),
          messages,
          maxTokens: 800,
          pro: true,
        });

        const jsonMatch = completion.text.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { events: [], summary: "Parse failed" };

        return {
          layer: layerId,
          label,
          events: (parsed.events ?? []).slice(0, 4),
          summary: parsed.summary ?? "",
        } as CatalystLayer;
      } catch {
        return {
          layer: layerId,
          label,
          events: [],
          summary: "Layer analysis unavailable",
        } as CatalystLayer;
      }
    });

    const layerResults = (await Promise.all(layerPromises)).filter(Boolean) as CatalystLayer[];

    // Aggregate
    const topCatalysts = layerResults
      .flatMap((l) =>
        l.events.map((e) => ({
          layer: l.label,
          title: e.title,
          impact: e.impact,
          date: e.date,
        }))
      )
      .sort((a, b) => {
        const impactWeight = (i: string) => (i === "High" ? 3 : i === "Medium" ? 2 : 1);
        return impactWeight(b.impact) - impactWeight(a.impact);
      })
      .slice(0, 8);

    // Aggregate score: each event weighted by impact and direction
    let aggregateScore = 0;
    let totalWeight = 0;
    for (const l of layerResults) {
      for (const e of l.events) {
        const w = e.impact === "High" ? 3 : e.impact === "Medium" ? 2 : 1;
        const d = e.direction === "Bullish" ? 1 : e.direction === "Bearish" ? -1 : 0;
        aggregateScore += w * d;
        totalWeight += w;
      }
    }
    aggregateScore = totalWeight > 0
      ? Math.round((aggregateScore / totalWeight) * 100)
      : 0;

    // Synthesize overall summary
    const synthPrompt = `Summarize the catalyst outlook for $${ticker.toUpperCase()} across these layers:
${layerResults.map((l) => `**${l.label}**: ${l.summary}`).join("\n")}

Provide a 2-3 sentence synthesis of the overall catalyst picture. Which catalysts matter most? What's the net bias (bullish/bearish/neutral)?`;

    let synthesisSummary = "";
    try {
      const synthCompletion = await completeChat({
        system: "You are an investment research editor. Write concise, insightful summaries.",
        messages: [{ role: "user", content: synthPrompt }],
        maxTokens: 300,
        pro: true,
      });
      synthesisSummary = synthCompletion.text.trim();
    } catch {
      synthesisSummary = `Catalyst analysis complete for $${ticker.toUpperCase()}. ${topCatalysts.length} notable events across ${layerResults.length} layers.`;
    }

    const result: CatalystResult = {
      ticker: ticker.toUpperCase(),
      layers: layerResults,
      topCatalysts,
      aggregateScore: Math.min(100, Math.max(-100, aggregateScore)),
      summary: synthesisSummary,
    };

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
