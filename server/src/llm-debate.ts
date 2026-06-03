import type { Request, Response } from "express";
import { z } from "zod";
import { completeChat, type ChatTurn, type LlmCompletion } from "./llm.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── Job storage ────────────────────────────────────────────────────────
const JOBS_DIR = path.resolve("data", "debate-jobs");
function ensureJobsDir() { if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true }); }

type DebateJob = {
  jobId: string;
  ticker: string;
  status: "running" | "done" | "error";
  result?: DebateResult;
  error?: string;
  createdAt: number;
};

function saveJob(job: DebateJob) {
  ensureJobsDir();
  fs.writeFileSync(path.join(JOBS_DIR, `${job.jobId}.json`), JSON.stringify(job, null, 2));
}

function loadJob(jobId: string): DebateJob | null {
  try {
    const p = path.join(JOBS_DIR, `${jobId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch { return null; }
}

// ── Types ──────────────────────────────────────────────────────────────

const DebateBody = z.object({
  ticker: z.string().min(1).max(10),
  thesisContext: z.string().optional(),
  profile: z
    .object({
      timeHorizon: z.string().optional(),
      riskTolerance: z.string().optional(),
      experienceLevel: z.string().optional(),
      topGoal: z.string().optional(),
    })
    .optional(),
});

type AnalystRole = {
  id: string;
  label: string;
  stance: "bull" | "bear" | "neutral";
  systemPrompt: string;
};

type DebateRoundEntry = {
  role: string;
  stanceLabel: string;
  content: string;
  score: number; // 0-100 conviction
};

type DebateResult = {
  ticker: string;
  rounds: DebateRoundEntry[];
  consensus: {
    verdict: "Bullish" | "Bearish" | "Neutral" | "Split";
    convictionScore: number; // 0-100
    keyDisagreements: string[];
    mergedRisks: string[];
    mergedUpsides: string[];
    summary: string;
  };
};

// ── Analyst definitions ───────────────────────────────────────────────

const ANALYSTS: AnalystRole[] = [
  {
    id: "value",
    label: "Value Analyst",
    stance: "neutral",
    systemPrompt: `You are a disciplined Value Analyst grounded in Graham/Buffett principles.
Analyze the ticker through a value lens: intrinsic value, margin of safety, free cash flow yield, P/E relative to sector, book value, competitive moat, management quality.
Be quantitative where possible. State your conviction score (0-100).
If you see deep value, argue the bull case. If overvalued, argue the bear case. Be honest — no cheerleading.`,
  },
  {
    id: "growth",
    label: "Growth Analyst",
    stance: "bull",
    systemPrompt: `You are a Growth Analyst focused on revenue acceleration, TAM expansion, and forward multiples.
Analyze the ticker through a growth lens: revenue growth rate, market share trajectory, total addressable market, product pipeline, unit economics, retention cohorts.
Be quantitative where possible. State your conviction score (0-100).
You are naturally bullish but must identify when growth is decelerating or priced to perfection.`,
  },
  {
    id: "macro",
    label: "Macro Strategist",
    stance: "neutral",
    systemPrompt: `You are a Macro Strategist focused on cross-asset and macro regime context.
Analyze the ticker through a macro lens: interest rate sensitivity, sector rotation, currency exposure, geopolitical risk, fiscal/monetary policy tailwinds/headwinds, commodity input exposure.
Be quantitative where possible. State your conviction score (0-100).
Your job is to flag what the stock-level analysts miss: regime change, correlation risk, liquidity conditions.`,
  },
  {
    id: "bear",
    label: "Bear Case Strategist",
    stance: "bear",
    systemPrompt: `You are a professional Devil's Advocate — your job is to build the strongest possible BEAR case.
Analyze the ticker for: competitive threats, disruption risk, valuation compression scenarios, accounting red flags, execution risk, regulatory risk, insider selling, short interest signals, negative catalysts.
Be specific and quantitative where possible. State your conviction score (0-100) for how compelling the bear case is.
Even if you personally think the company is fine, find the cracks. The best investors stress-test their thesis.`,
  },
];

// ── Prompt builders ────────────────────────────────────────────────────

function buildAnalystPrompt(
  analyst: AnalystRole,
  ticker: string,
  thesisContext: string | undefined,
  profile: z.infer<typeof DebateBody>["profile"]
): string {
  const contextParts: string[] = [];
  if (thesisContext) contextParts.push(`Investor's thesis context: ${thesisContext}`);
  if (profile) {
    contextParts.push(
      `Investor profile: time horizon ${profile.timeHorizon ?? "unknown"}, ` +
        `risk tolerance ${profile.riskTolerance ?? "unknown"}, ` +
        `experience ${profile.experienceLevel ?? "unknown"}, ` +
        `goal: ${profile.topGoal ?? "wealth building"}`
    );
  }

  return `## Ticker: $${ticker.toUpperCase()}
${contextParts.length ? "\n### Context\n" + contextParts.join("\n") + "\n" : ""}
### Instructions
Provide your analysis as ${analyst.label}:
1. **Thesis** (3-5 sentences): Your core view on $${ticker.toUpperCase()}
2. **Key Metrics** (3-5 bullet points): The numbers that matter most for your lens
3. **Catalysts** (2-3): Upcoming events that could move the stock
4. **Risks** (2-3): What could prove your thesis wrong
5. **Conviction Score** (0-100): Final score: 0-100

Format your response with clear ## headings. End with: **Conviction: [score]/100**`;
}

function buildRebuttalPrompt(
  analyst: AnalystRole,
  ticker: string,
  opponentArguments: { role: string; content: string }[]
): string {
  const args = opponentArguments
    .map((a) => `### ${a.role}'s argument:\n${a.content.slice(0, 600)}...`)
    .join("\n\n");

  return `## Rebuttal Round — ${analyst.label}
You previously analyzed $${ticker.toUpperCase()}. Now you've read the other analysts' arguments:

${args}

### Instructions
As ${analyst.label}:
1. **Agree with** (1-2 points): What do other analysts get right?
2. **Challenge** (2-3 points): What do they miss, overstate, or get wrong?
3. **Refined conviction** (0-100): After hearing others, has your view changed?
4. **Key disagreement**: The single most important point of debate

End with: **Refined Conviction: [score]/100**`;
}

function buildSynthesisPrompt(
  ticker: string,
  allRounds: DebateRoundEntry[]
): string {
  const summaries = allRounds
    .map((r) => `### ${r.role} (${r.stanceLabel}, score: ${r.score}/100):\n${r.content.slice(0, 500)}...`)
    .join("\n\n");

  return `## Synthesis — $${ticker.toUpperCase()}

You are the Lead Investment Committee Chair. Below are analyses from 4 specialists. Synthesize them into a final verdict.

${summaries}

### Instructions
Output a JSON object (no markdown, just raw JSON):
{
  "verdict": "Bullish" | "Bearish" | "Neutral" | "Split",
  "convictionScore": number (0-100, higher = more conviction in the verdict direction),
  "keyDisagreements": ["point 1", "point 2"],
  "mergedRisks": ["risk 1", "risk 2", "risk 3"],
  "mergedUpsides": ["upside 1", "upside 2", "upside 3"],
  "summary": "2-4 sentence synthesis capturing the central debate and your judgment"
}`;
}

// ── LLM helpers ────────────────────────────────────────────────────────

async function callAnalyst(
  analyst: AnalystRole,
  systemPrompt: string,
  userPrompt: string
): Promise<{ completion: LlmCompletion; score: number }> {
  const messages: ChatTurn[] = [{ role: "user", content: userPrompt }];
  const completion = await completeChat({
    system: `${analyst.systemPrompt}\n\nAlways end your response with **Conviction: [number]/100** or **Refined Conviction: [number]/100**.`,
    messages,
    maxTokens: 1200,
  });

  // Extract score from response
  const scoreMatch = completion.text.match(/(?:Refined\s+)?Conviction:\s*(\d+)\s*\/?\s*100/i);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 50;

  return { completion, score };
}

function parseSynthesisJson(text: string): DebateResult["consensus"] | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      verdict: parsed.verdict ?? "Neutral",
      convictionScore: Math.min(100, Math.max(0, parsed.convictionScore ?? 50)),
      keyDisagreements: parsed.keyDisagreements ?? [],
      mergedRisks: parsed.mergedRisks ?? [],
      mergedUpsides: parsed.mergedUpsides ?? [],
      summary: parsed.summary ?? "Analysis complete.",
    };
  } catch {
    return null;
  }
}

// ── Core debate runner (used by both sync and async paths) ────────────

async function runFullDebate(
  ticker: string,
  thesisContext?: string,
  profile?: z.infer<typeof DebateBody>["profile"]
): Promise<DebateResult> {
  // Round 1: Independent analyses
  const round1Promises = ANALYSTS.map((analyst) => {
    const prompt = buildAnalystPrompt(analyst, ticker, thesisContext, profile);
    return callAnalyst(analyst, analyst.systemPrompt, prompt).then(
      (r) =>
        ({
          role: analyst.label,
          stanceLabel: r.score >= 65 ? "Bullish" : r.score <= 35 ? "Bearish" : "Neutral",
          content: r.completion.text,
          score: r.score,
        } as DebateRoundEntry)
    );
  });
  const round1 = await Promise.all(round1Promises);

  // Round 2: Rebuttals
  const round2Promises = ANALYSTS.map(async (analyst, i) => {
    const opponents = round1.filter((_, j) => j !== i).map((r) => ({ role: r.role, content: r.content }));
    const prompt = buildRebuttalPrompt(analyst, ticker, opponents);
    return callAnalyst(analyst, analyst.systemPrompt, prompt).then(
      (r) =>
        ({
          role: `${analyst.label} (rebuttal)`,
          stanceLabel: r.score >= 65 ? "Bullish" : r.score <= 35 ? "Bearish" : "Neutral",
          content: r.completion.text,
          score: r.score,
        } as DebateRoundEntry)
    );
  });
  const round2 = await Promise.all(round2Promises);

  // Synthesis
  const allRounds = [...round1, ...round2];
  const synthesisCompletion = await completeChat({
    system: "You are an experienced Investment Committee Chair. Synthesize analyst debates into a clear, decisive verdict. Output ONLY valid JSON.",
    messages: [{ role: "user", content: buildSynthesisPrompt(ticker, allRounds) }],
    maxTokens: 1000,
  });

  const consensus = parseSynthesisJson(synthesisCompletion.text) ?? {
    verdict: "Neutral" as const,
    convictionScore: 50,
    keyDisagreements: ["Unable to parse synthesis — review individual analyses."],
    mergedRisks: [],
    mergedUpsides: [],
    summary: "Synthesis parsing failed. See individual analyst rounds for details.",
  };

  return { ticker: ticker.toUpperCase(), rounds: allRounds, consensus };
}

// ── POST /v1/research/debate (sync or async via ?async=1) ─────────────

export async function postDebate(req: Request, res: Response) {
  const parsed = DebateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", detail: parsed.error.flatten() });
    return;
  }
  const { ticker, thesisContext, profile } = parsed.data;
  const isAsync = req.query.async === "1";

  if (!isAsync) {
    // Sync: run and return
    try {
      const result = await runFullDebate(ticker, thesisContext, profile);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
    return;
  }

  // Async: start job, return jobId immediately
  const jobId = crypto.randomBytes(6).toString("hex");
  const job: DebateJob = { jobId, ticker, status: "running", createdAt: Date.now() };
  saveJob(job);

  // Fire and forget
  runFullDebate(ticker, thesisContext, profile)
    .then((result) => {
      job.status = "done";
      job.result = result;
      saveJob(job);
    })
    .catch((e) => {
      job.status = "error";
      job.error = String(e);
      saveJob(job);
    });

  res.json({ jobId, status: "running", ticker });
}

// ── GET /v1/research/debate/:jobId ─────────────────────────────────────

export async function getDebateJob(req: Request, res: Response) {
  const jobId = String(req.params.jobId);
  if (!jobId || jobId === "undefined") { res.status(400).json({ error: "Missing jobId" }); return; }
  const job = loadJob(jobId);
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(job);
}
