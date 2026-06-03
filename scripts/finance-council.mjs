#!/usr/bin/env node
/**
 * Multi-model finance council — parallel specialists + chair synthesis.
 * Usage: node scripts/finance-council.mjs [--out reports/council-YYYY-MM-DD.md]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load server/.env
const envPath = path.join(ROOT, "server", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const SNAPSHOT = fs.readFileSync(path.join(ROOT, "finance-snapshot.md"), "utf8");

const ROLES = {
  quant: {
    provider: "deepseek",
    label: "Quant / Allocator",
    system: `You are a cold, quantitative portfolio analyst. No motivational language. No sympathy.
Rules: cite specific numbers from the snapshot only. Rank problems by dollar impact.
Output structure:
## Root causes (ranked by $ impact)
## Math that matters
## What the data proves (3 bullets max)
Be brutal. If the user is the problem, say so with evidence.`,
  },
  behavioral: {
    provider: "anthropic",
    label: "Behavioral / Bias Auditor",
    system: `You are a behavioral finance auditor. You diagnose self-deception, FOMO, narrative investing, and action bias.
Rules: reference specific trades and patterns from the snapshot. No investment product recommendations.
Output structure:
## Behavioral diagnosis
## The story you're telling yourself vs. what the trades show
## Top 3 self-inflicted wounds
Be brutally honest. No hedging words like "consider" or "might".`,
  },
  macro: {
    provider: "gemini",
    label: "Macro / Regime Analyst",
    system: `You are a macro strategist assessing whether this portfolio fits the current market regime (2026 bull market).
Rules: no stock picks. Assess structural mismatch between holdings and regime.
Output structure:
## Regime fit score (1-10) and why
## What bull-market participation you're missing
## Structural risks if regime shifts
Be direct. No fluff.`,
  },
  devil: {
    provider: "deepseek",
    label: "Devil's Advocate",
    system: `You find the simplest, most embarrassing explanation the other analysts are soft-pedaling.
The user is losing money in a bull market with negative net worth and massive trading volume.
One paragraph. Then one sentence: the one thing they must stop doing today.`,
  },
  chair: {
    provider: "anthropic",
    label: "Chair (Synthesis)",
    system: `You are the Chair of a personal finance review committee. Synthesize analyst reports into ONE gameplan.
Educational framing only — not personalized investment advice. Focus on debt, behavior, and process.
Output ONLY valid JSON (no markdown fences):
{
  "verdict": "Structural" | "Behavioral" | "Mixed",
  "brutalSummary": "2-3 sentences, no comfort",
  "rootCauseRanked": [{"cause": "...", "evidence": "...", "estimatedDragUsdPerYear": number}],
  "consensusActions": [{"action": "...", "timeframe": "this week|30 days|90 days", "impact": "critical|high|medium"}],
  "stopDoing": ["max 5 items"],
  "gameplan30Days": ["max 5 items, ordered"],
  "gameplan90Days": ["max 5 items, ordered"],
  "metricsToTrack": ["max 5"],
  "disagreements": ["where analysts differ"],
  "hardRules": ["max 5 non-negotiable rules going forward"]
}`,
  },
};

async function completeOpenAICompatible({ baseUrl, apiKey, model, system, user, maxTokens }) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(model.includes("deepseek-v4") ? { thinking: { type: "disabled" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response");
  return text;
}

async function completeAnthropic({ model, system, user, maxTokens }) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  return data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
}

async function completeProvider(provider, { system, user, maxTokens = 2000 }) {
  const tryOrder =
    provider === "anthropic"
      ? ["anthropic", "deepseek"]
      : provider === "gemini"
        ? ["gemini", "deepseek"]
        : [provider, "deepseek"];

  let lastErr;
  for (const p of tryOrder) {
    try {
      if (p === "deepseek") {
        const key = process.env.DEEPSEEK_API_KEY?.trim();
        if (!key?.startsWith("sk-") || key.includes("your-deepseek")) throw new Error("DEEPSEEK_API_KEY missing");
        const text = await completeOpenAICompatible({
          baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
          apiKey: key,
          model: process.env.ASSISTANT_MODEL_PRO ?? "deepseek-v4-flash",
          system,
          user,
          maxTokens,
        });
        return { text, usedProvider: p, requestedProvider: provider };
      }
      if (p === "anthropic") {
        if (!process.env.ANTHROPIC_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY.includes("your-key"))
          throw new Error("ANTHROPIC_API_KEY missing");
        const text = await completeAnthropic({
          model: process.env.PACE_ALTERNATE_MODEL_PRO ?? "claude-3-5-haiku-20241022",
          system,
          user,
          maxTokens,
        });
        return { text, usedProvider: p, requestedProvider: provider };
      }
      if (p === "gemini") {
        const key = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)?.trim();
        if (!key || key.includes("your-gemini")) throw new Error("GEMINI_API_KEY missing");
        const text = await completeOpenAICompatible({
          baseUrl: process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
          apiKey: key,
          model: process.env.PACE_EMERGENCY_MODEL ?? "gemini-2.0-flash",
          system,
          user,
          maxTokens,
        });
        return { text, usedProvider: p, requestedProvider: provider };
      }
    } catch (e) {
      lastErr = e;
      if (p !== tryOrder[tryOrder.length - 1]) {
        console.error(`[council] ${provider} unavailable (${String(e).slice(0, 80)}), falling back...`);
      }
    }
  }
  throw lastErr ?? new Error(`No provider for ${provider}`);
}

const userPrompt = `Analyze this personal finance snapshot. Use ONLY facts in the document. No invented numbers.

---
${SNAPSHOT}
---

The user wants a brutally honest, emotion-free assessment. Underperforming ~$9k vs bull market. Negative net worth.`;

async function runRole(roleKey, extra = "") {
  const role = ROLES[roleKey];
  console.error(`[council] Running ${role.label} (${role.provider})...`);
  const { text, usedProvider, requestedProvider } = await completeProvider(role.provider, {
    system: role.system,
    user: userPrompt + extra,
    maxTokens: roleKey === "chair" ? 2500 : 1800,
  });
  const fallbackNote = usedProvider !== requestedProvider ? ` [fallback: ${usedProvider}]` : "";
  console.error(`[council] Done ${role.label}${fallbackNote} (${text.length} chars)`);
  return { roleKey, ...role, text, usedProvider, requestedProvider };
}

function parseChairJson(text) {
  const cleaned = text.replace(/^```json?\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Chair did not return valid JSON");
  }
}

function renderCleanReport({ round1, round2, devil, chair, outPath }) {
  const j = chair.parsed;
  const date = new Date().toISOString().slice(0, 10);
  const models = [
    ...round1.map((r) => `${r.label.split("/")[0].trim()} (${r.usedProvider ?? r.provider})`),
    `Chair (${chair.usedProvider ?? chair.provider})`,
  ].join(" · ");

  const devilLines = devil.text.split("\n").map((l) => l.trim()).filter(Boolean);
  const devilLine =
    devilLines.find((l) => l.toLowerCase().startsWith("stop ")) ??
    devilLines.find((l) => l.length < 200 && !l.startsWith("#") && !l.startsWith("*") && !l.includes("Analyst")) ??
    j.stopDoing?.[0] ??
    "";

  const lines = [
    `# Personal Finance Council`,
    ``,
    `**Date:** ${date}`,
    `**Models:** ${models}`,
    ``,
    `*Educational review only — not investment advice.*`,
    ``,
    `---`,
    ``,
    `## Executive summary`,
    ``,
    `**Verdict: ${j.verdict}**`,
    ``,
    j.brutalSummary,
    ``,
    `### The one thing to do today`,
    ``,
    devilLine,
    ``,
    `---`,
    ``,
    `## Your numbers`,
    ``,
    `| | |`,
    `|---|---|`,
    `| Net worth | ~−$5,875 |`,
    `| Take-home | $2,700 every 2 weeks (~$5,850/mo) |`,
    `| Expenses | ≤ $500/mo |`,
    `| Fixed debt service | ~$3,202/mo (Amex+SoFi $1k, margin $1,083, cow $619, expenses $500) |`,
    `| Avalanche firepower | ~$1,216/mo ($500/pay margin redirect + SATA ~$133) |`,
    `| Consumer debt payoff (avalanche) | **~26 months** (Amex ~9 → SoFi ~7 → margin ~10) |`,
    ``,
    `You have **enough income** to fix this — but autopay only covers **minimums**. The problem is **where surplus goes**, not income.`,
    ``,
    `---`,
    ``,
    `## Gameplan`,
    ``,
    `### Stop immediately`,
    ``,
    ...(j.stopDoing ?? []).map((s, i) => `${i + 1}. ${s}`),
    ``,
    `### Next 30 days`,
    ``,
    ...(j.gameplan30Days ?? []).map((s, i) => `${i + 1}. ${s}`),
    ``,
    `### Next 90 days`,
    ``,
    ...(j.gameplan90Days ?? []).map((s, i) => `${i + 1}. ${s}`),
    ``,
    `### Hard rules`,
    ``,
    ...(j.hardRules ?? []).map((s) => `- ${s}`),
    ``,
    `---`,
    ``,
    `## Root causes (ranked)`,
    ``,
    ...(j.rootCauseRanked ?? []).map(
      (r, i) =>
        `### ${i + 1}. ${r.cause}\n\n${r.evidence}\n\n*Est. drag: ~$${Number(r.estimatedDragUsdPerYear ?? 0).toLocaleString()}/yr*\n`
    ),
    ``,
    `---`,
    ``,
    `## Priority actions`,
    ``,
    `| # | Action | When | Impact |`,
    `|---|--------|------|--------|`,
    ...(j.consensusActions ?? []).map(
      (a, i) => `| ${i + 1} | ${a.action} | ${a.timeframe} | ${a.impact} |`
    ),
    ``,
    `---`,
    ``,
    `## Metrics (check monthly)`,
    ``,
    ...(j.metricsToTrack ?? []).map((m) => `- [ ] ${m}`),
    ``,
  ];

  if (j.disagreements?.length) {
    lines.push(`---`, ``, `## Open debates`, ``);
    for (const d of j.disagreements) lines.push(`- ${d}`);
    lines.push(``);
  }

  lines.push(
    `---`,
    ``,
    `## Note on SATA (~13% yield)`,
    ``,
    `SATA targets ~13% yield but has **traded below PAR**. A 1–2 point discount to par wipes a year of dividends. Paying Amex at **12% is guaranteed**; SATA is not. Do not hold prefs instead of paying consumer debt.`,
    ``,
    `*Full analyst transcripts:* \`${path.basename(outPath.replace(/\.md$/, "-appendix.md"))}\``,
    ``
  );

  const cleanPath = outPath.replace(/\.md$/, "-read.md");
  fs.writeFileSync(cleanPath, lines.join("\n"));

  const appendix = [
    `# Council appendix — full analyst transcripts`,
    ``,
    `Companion to \`${path.basename(cleanPath)}\` · ${date}`,
    ``,
    `---`,
    ``,
    `## Round 1`,
    ``,
    ...round1.flatMap((r) => [
      `### ${r.label} (${r.usedProvider ?? r.provider})`,
      ``,
      r.text,
      ``,
      `---`,
      ``,
    ]),
    `## Round 2 — Rebuttals`,
    ``,
    ...round2.flatMap((r) => [`### ${r.label}`, ``, r.text, ``, `---`, ``]),
    `## Devil's Advocate`,
    ``,
    devil.text,
    ``,
  ];
  const appendixPath = outPath.replace(/\.md$/, "-appendix.md");
  fs.writeFileSync(appendixPath, appendix.join("\n"));

  return { cleanPath, appendixPath };
}

async function main() {
  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const outPath =
    outArg?.slice(6) ??
    path.join(ROOT, "reports", `council-${new Date().toISOString().slice(0, 10)}.md`);

  // Round 1 — parallel
  const round1 = await Promise.all([
    runRole("quant"),
    runRole("behavioral"),
    runRole("macro"),
  ]);

  // Round 2 — rebuttals
  const opponents = round1.map((r) => `### ${r.label}\n${r.text.slice(0, 2500)}`).join("\n\n");
  const rebuttalSystem = `You are one analyst in a finance council. Review the other analysts' work. Agree or disagree on the #1 root cause. Name one thing they missed. Score your confidence 0-100. Be blunt.`;

  const round2 = await Promise.all(
    round1.map((r) =>
      runRole(r.roleKey, `\n\n## Other analysts said:\n${round1.filter((x) => x.roleKey !== r.roleKey).map((x) => `### ${x.label}\n${x.text.slice(0, 1500)}`).join("\n\n")}\n\nProvide your rebuttal.`)
        .then((res) => ({ ...res, label: `${r.label} — Rebuttal` }))
    )
  );

  // Devil
  const devil = await runRole("devil", `\n\n## All analyst reports:\n${round1.map((r) => `### ${r.label}\n${r.text}`).join("\n\n")}`);

  // Chair
  const chairRaw = await runRole("chair", `\n\n## Round 1:\n${round1.map((r) => r.text).join("\n---\n")}\n\n## Devil:\n${devil.text}`);
  const chair = { ...chairRaw, parsed: parseChairJson(chairRaw.text) };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const { cleanPath, appendixPath } = renderCleanReport({ round1, round2, devil, chair, outPath });
  console.error(`[council] Clean report: ${cleanPath}`);
  console.error(`[council] Appendix:    ${appendixPath}`);
  console.log(fs.readFileSync(cleanPath, "utf8"));
}

main().catch((e) => {
  console.error("[council] FATAL:", e);
  process.exit(1);
});
