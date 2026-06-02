import type { Request, Response } from "express";
import { completeChat, type ChatTurn } from "./llm.js";

// ── Types ──────────────────────────────────────────────────────────────

type SentimentSnapshot = {
  fearGreedScore: number;
  fearGreedRating: "extreme fear" | "fear" | "neutral" | "greed" | "extreme greed";
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
  previous1Year: number;
  dipOpportunities: DipOpportunity[];
  sectorRotation: { sector: string; direction: "inflow" | "outflow"; strength: number }[];
  macroTailwinds: string[];
  macroHeadwinds: string[];
  summary: string;
  source: "cnn" | "synthesized";
};

type DipOpportunity = {
  ticker: string;
  company: string;
  sector: string;
  whyDown: string;
  whyMarketWrong: string;
  bullThesis: string;
  bearThesis: string;
  catalysts: string;
  estimatedUpside: number;
  estimatedDownside: number;
  rewardRiskRatio: number;
  convictionScore: number; // 1-10
  finalGrade: string; // A+, A, B, C
  aiDefenseExposure: string[];
};

// ── CNN Fear & Greed fetch ──────────────────────────────────────────────

const CNN_API = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";
const CNN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://edition.cnn.com/markets/fear-and-greed",
  Origin: "https://edition.cnn.com",
};

let cachedFearGreed: {
  score: number;
  rating: string;
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
  previous1Year: number;
  fetchedAt: number;
} | null = null;

async function fetchFearGreed(): Promise<{
  score: number;
  rating: string;
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
  previous1Year: number;
} | null> {
  // Cache for 5 minutes
  if (cachedFearGreed && Date.now() - cachedFearGreed.fetchedAt < 300_000) {
    return cachedFearGreed;
  }

  try {
    const res = await fetch(CNN_API, { headers: CNN_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const fg = data.fear_and_greed;
    if (!fg) return null;

    cachedFearGreed = {
      score: Math.round(fg.score),
      rating: fg.rating,
      previousClose: Math.round(fg.previous_close),
      previous1Week: Math.round(fg.previous_1_week),
      previous1Month: Math.round(fg.previous_1_month),
      previous1Year: Math.round(fg.previous_1_year),
      fetchedAt: Date.now(),
    };
    return cachedFearGreed;
  } catch {
    return null;
  }
}

// ── Dip scanner system prompt ──────────────────────────────────────────

const DIP_SCANNER_SYSTEM = `You are a professional hedge fund analyst specializing in identifying asymmetric equity buying opportunities.

Your objective is NOT to recommend popular stocks. Your objective is to find high-probability situations where the market may be mispricing risk, creating an attractive entry point.

Search the entire U.S. equity market and identify 8-12 potential buying opportunities.

For each candidate, evaluate:

1. Price Action — current price, 52-week range, % below ATH, recent drawdown, key support
2. Reason For Decline — classify as: temporary fear, earnings miss, sector rotation, macro, regulatory, competitive threat, business deterioration, one-time event
3. Fundamental Quality — revenue growth, FCF, margins, balance sheet, debt, insider ownership, ROIC, moat
4. Valuation — P/E, EV/EBITDA, P/S, FCF Yield, PEG vs historical and peers
5. Market Expectations — what's priced in? what must happen for investors to be wrong?
6. AI / Defense / Infrastructure Exposure — AI, Defense Tech, Autonomous Systems, Drones, Robotics, Cybersecurity, Data Centers, Energy Infrastructure, Photonics, Semiconductors, Space
7. Asymmetric Return — Bear/Base/Bull cases with estimated upside/downside and reward-to-risk ratio
8. Catalysts — 30-day, 90-day, 6-month, 12-month
9. Institutional Activity — insider buying/selling, hedge fund trends
10. Final Rating — A+ (Exceptional), A (Strong Buy), B (Watchlist), C (Avoid)

Favor: negative sentiment + intact fundamentals + competent management + secular tailwinds + upside ≥ 3x downside.
Avoid: meme stocks, pure speculation, deteriorating fundamentals, equity-raise-dependent businesses.

Output ONLY valid JSON (no markdown, no backticks):
{
  "opportunities": [
    {
      "ticker": "AAPL",
      "company": "Apple Inc.",
      "sector": "Technology",
      "whyDown": "...",
      "whyMarketWrong": "...",
      "bullThesis": "...",
      "bearThesis": "...",
      "catalysts": "...",
      "estimatedUpside": 35,
      "estimatedDownside": 10,
      "rewardRiskRatio": 3.5,
      "convictionScore": 8,
      "finalGrade": "A",
      "aiDefenseExposure": ["Consumer AI", "Edge Computing"]
    }
  ],
  "topPick": { ...same structure, the single best opportunity },
  "marketContext": "2-3 sentence macro context for why these dips exist right now",
  "fearGreedAlignment": "How current sentiment aligns with or contradicts these opportunities"
}`;

// ── Endpoints ──────────────────────────────────────────────────────────

export async function getMarketSentiment(req: Request, res: Response) {
  const type = (req.query.type as string) ?? "overview";

  // Fetch real CNN Fear & Greed
  const fg = await fetchFearGreed();

  if (type === "dip-scan") {
    try {
      const contextLine = fg
        ? `Current CNN Fear & Greed Index: ${fg.score}/100 (${fg.rating}). 1 month ago: ${fg.previous1Month}.`
        : "Current market sentiment data unavailable.";

      const messages: ChatTurn[] = [
        {
          role: "user",
          content: `${contextLine}

Run a full dip-buying scan across the U.S. equity market. Identify 8-12 names with asymmetric return profiles.

Focus on: negative sentiment + intact fundamentals + secular tailwinds (AI, defense, infrastructure, energy transition).

For each, provide the full analysis per the system prompt format. Then rank from most to least attractive and isolate the top pick.`,
        },
      ];

      const completion = await completeChat({
        system: DIP_SCANNER_SYSTEM,
        messages,
        maxTokens: 4000,
        pro: true,
      });

      const jsonMatch = completion.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({
          ...parsed,
          fearGreed: fg
            ? { score: fg.score, rating: fg.rating }
            : { score: 50, rating: "neutral" },
          source: "llm",
        });
        return;
      }

      res.json({
        opportunities: [],
        topPick: null,
        marketContext: "Unable to parse dip scan results.",
        fearGreed: fg ?? { score: 50, rating: "neutral" },
        source: "fallback",
      });
      return;
    } catch (e) {
      res.status(500).json({ error: String(e) });
      return;
    }
  }

  // Overview: return CNN Fear & Greed + LLM macro context
  try {
    let macroTailwinds: string[] = [];
    let macroHeadwinds: string[] = [];
    let summary = "";
    let sectorRotation: { sector: string; direction: "inflow" | "outflow"; strength: number }[] = [];

    if (fg) {
      // Use LLM for macro context only
      const messages: ChatTurn[] = [
        {
          role: "user",
          content: `CNN Fear & Greed Index is currently at ${fg.score}/100 (${fg.rating}).
1 month ago: ${fg.previous1Month}. 1 week ago: ${fg.previous1Week}.

Based on current market conditions in early June 2026:
1. Identify 2-3 macro tailwinds
2. Identify 2-3 macro headwinds
3. Note 4-6 sector rotation signals
4. Write a 2-sentence market regime summary

Output ONLY valid JSON:
{
  "macroTailwinds": ["string"],
  "macroHeadwinds": ["string"],
  "sectorRotation": [{"sector": "Tech", "direction": "inflow", "strength": 8}],
  "summary": "2 sentences"
}`,
        },
      ];

      const completion = await completeChat({
        system:
          "You are a macro strategist. Provide concise, specific market context. Output ONLY valid JSON.",
        messages,
        maxTokens: 600,
        pro: true,
      });

      const jsonMatch = completion.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        macroTailwinds = parsed.macroTailwinds ?? [];
        macroHeadwinds = parsed.macroHeadwinds ?? [];
        sectorRotation = parsed.sectorRotation ?? [];
        summary = parsed.summary ?? "";
      }
    }

    const snapshot: SentimentSnapshot = {
      fearGreedScore: fg?.score ?? 50,
      fearGreedRating: (fg?.rating as SentimentSnapshot["fearGreedRating"]) ?? "neutral",
      previousClose: fg?.previousClose ?? 50,
      previous1Week: fg?.previous1Week ?? 50,
      previous1Month: fg?.previous1Month ?? 50,
      previous1Year: fg?.previous1Year ?? 50,
      dipOpportunities: [],
      sectorRotation,
      macroTailwinds,
      macroHeadwinds,
      summary: summary || (fg ? `Fear & Greed at ${fg.score} (${fg.rating})` : "Market data unavailable"),
      source: fg ? "cnn" : "synthesized",
    };

    res.json(snapshot);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
