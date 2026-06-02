import type { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { z } from "zod";

import { isUserPro } from "./entitlements.js";
import { completeChat, defaultModels } from "./llm.js";
import { withMarketThrottle } from "./market-data-guard.js";
import {
  formatPolygonValuationBlock,
  polygonValuationRow,
  type ValuationRow,
} from "./market-polygon.js";
import { preferPolygonMarketData } from "./polygon-client.js";

yahooFinance.suppressNotices?.(["yahooSurvey"]);

const Body = z.object({
  userId: z.string().min(8).max(128),
  templateId: z.enum(["deep-research", "conviction-dossier", "relative-valuation"]),
  symbol: z.string().min(1).max(12),
  competitors: z.array(z.string().min(1).max(12)).max(2).optional(),
  thesisContext: z.string().max(12000),
  userMessage: z.string().min(1).max(8000),
});

async function fetchYahooValuationRow(symbol: string): Promise<ValuationRow> {
  const sym = symbol.toUpperCase();
  try {
    const summary = await withMarketThrottle(() =>
      yahooFinance.quoteSummary(sym, {
        modules: ["financialData", "defaultKeyStatistics", "summaryDetail"],
      })
    );

    const fd = summary.financialData as Record<string, number | undefined> | undefined;
    const ks = summary.defaultKeyStatistics as Record<string, number | undefined> | undefined;
    const psTtm = ks?.priceToSalesTrailing12Months ?? fd?.priceToSalesTrailing12Months ?? null;
    const psForward = ks?.forwardPriceToSales ?? null;
    const evEbitda = ks?.enterpriseToEbitda ?? fd?.enterpriseToEbitda ?? null;
    const grossMarginPct =
      fd?.grossMargins != null ? Math.round(fd.grossMargins * 1000) / 10 : null;
    const revenueGrowthPct =
      fd?.revenueGrowth != null ? Math.round(fd.revenueGrowth * 1000) / 10 : null;
    const growth = revenueGrowthPct != null && revenueGrowthPct >= 1 ? revenueGrowthPct : null;
    const valueGrowthScore =
      psTtm != null && growth != null ? Math.round((psTtm / growth) * 100) / 100 : null;

    return {
      symbol: sym,
      price: null,
      marketCapB: null,
      psTtm: psTtm != null ? Math.round(psTtm * 100) / 100 : null,
      psForward: psForward != null ? Math.round(psForward * 100) / 100 : null,
      evEbitda: evEbitda != null ? Math.round(evEbitda * 100) / 100 : null,
      grossMarginPct,
      revenueGrowthPct,
      valueGrowthScore,
    };
  } catch (e) {
    console.warn("[thesis-research] yahoo row failed", sym, e);
    return {
      symbol: sym,
      price: null,
      marketCapB: null,
      psTtm: null,
      psForward: null,
      evEbitda: null,
      grossMarginPct: null,
      revenueGrowthPct: null,
      valueGrowthScore: null,
    };
  }
}

function formatYahooValuationBlock(rows: ValuationRow[]): string {
  const lines = rows.map((r) => {
    const fmt = (n: number | null) => (n != null ? String(n) : "n/a");
    return `${r.symbol}: P/S TTM ${fmt(r.psTtm)}, P/S Fwd ${fmt(r.psForward)}, EV/EBITDA ${fmt(r.evEbitda)}, Gross margin ${fmt(r.grossMarginPct)}%, Rev growth YoY ${fmt(r.revenueGrowthPct)}%, Value/Growth ${fmt(r.valueGrowthScore)}`;
  });
  return `Yahoo Finance snapshot (server-fetched; verify on Macrotrends):\n${lines.join("\n")}`;
}

async function fetchValuationRow(symbol: string): Promise<ValuationRow> {
  if (preferPolygonMarketData()) {
    return polygonValuationRow(symbol);
  }
  return fetchYahooValuationRow(symbol);
}

function formatValuationBlock(rows: ValuationRow[]): string {
  if (preferPolygonMarketData()) {
    return formatPolygonValuationBlock(rows);
  }
  return formatYahooValuationBlock(rows);
}

const RESEARCH_SYSTEM = `You are Thesis research radar, structured equity dossiers for education inside a user's chosen investment thesis model.

For conviction dossier or deep research:
- Conviction score (1-10) with rationale vs their thesis
- Stock snapshot (price, market cap, key multiples), business model, moat and competitors
- Symmetric bull and bear cases (specific, with numbers when possible)
- One key metric to track with bull/bear thresholds
- 12-month catalysts; optional probability-weighted scenario table (educational framing, not price targets)
- Always close with how the name fits THEIR themes and model weights

Rules:
- Nest every finding under their thesis, not generic macro blogging.
- Use the market data block when provided; supplement with Macrotrends-style framing and say when figures should be verified.
- Never give buy/sell/hold orders or position sizes.
- Write in plain English paragraphs with numbered sections and bullet points. Never use markdown headers (##) or pipe tables (|---|---|). The chat renderer does not parse them — raw markdown looks broken.
- For structured data like valuation comparisons or scenario tables, use clear labeled lines instead of tables (e.g. "P/S TTM: 2.4, P/S Fwd: 1.9, EV/EBITDA: 5.2").
- End with: Educational research, not investment advice.`;

export async function postThesisResearch(req: Request, res: Response) {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { userId, templateId, symbol, competitors = [], thesisContext, userMessage } =
    parsed.data;
  const pro = isUserPro(userId);

  try {
    let marketBlock = "";
    if (templateId === "relative-valuation") {
      const peers = competitors.slice(0, 2);
      const symbols = [symbol, ...peers];
      const rows: ValuationRow[] = [];
      for (const sym of symbols) {
        rows.push(await fetchValuationRow(sym));
      }
      marketBlock = formatValuationBlock(rows);
    }

    const system = `${RESEARCH_SYSTEM}\n\n\nUser thesis model:\n\n${thesisContext}${marketBlock ? `\n\n${marketBlock}` : ""}`;

    const { model, maxTokens } = defaultModels(pro);
    const result = await completeChat({
      system,
      messages: [{ role: "user", content: userMessage }],
      model,
      maxTokens: Math.min(maxTokens, pro ? 4096 : 2800),
      pro,
    });

    res.json({
      content: result.text,
      templateId,
      symbol: symbol.toUpperCase(),
      competitors: competitors.map((c) => c.toUpperCase()),
      marketSnapshot: marketBlock || undefined,
      model: result.model,
      provider: result.provider,
    });
  } catch (e) {
    console.error("[thesis-research]", e);
    res.status(500).json({
      error: e instanceof Error ? e.message : "Research failed",
    });
  }
}
