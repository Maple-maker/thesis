#!/usr/bin/env node
/**
 * Golden-set eval — run against live API.
 * Pass threshold: 80% substantive (length + no banned phrases).
 */
import "dotenv/config";

const port = process.env.PORT ?? 8787;
const secret = process.env.THESIS_APP_SECRET ?? "dev-shared-secret-change-me";

const QUESTIONS = [
  "What ETFs for rare earth metals?",
  "I want something to hedge against inflation",
  "What etfs can serve as a cash cushion for dry powder when things go down?",
  "How would Fed rate cuts affect my portfolio?",
  "Explain Bitcoin halving in plain terms",
  "What is EBITDA and why do investors care?",
  "Is my portfolio too concentrated?",
  "What is a SATA in investing?",
  "Thoughts on NVDA earnings — what should I watch?",
  "Recommend defense sector ETFs",
];

const BANNED = /try rephrasing|npm run|EXPO_PUBLIC|server did not return|could you be more specific/i;

async function ask(q) {
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Thesis-App-Key": secret,
    },
    body: JSON.stringify({
      userId: "eval-user-001",
      userMessage: q,
      system:
        "You are Thesis CFO. User: wealth goal, long horizon, moderate risk. Holdings: VOO 20%, NVDA 15%, SCHD 10%, AAPL 11%, BTC 7%.",
      history: [],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? res.status);
  return data.content ?? "";
}

function pass(text) {
  return text.length >= 140 && !BANNED.test(text);
}

let ok = 0;
for (const q of QUESTIONS) {
  try {
    const a = await ask(q);
    const p = pass(a);
    if (p) ok++;
    console.log(p ? "PASS" : "FAIL", q.slice(0, 50));
    if (!p) console.log("  →", a.slice(0, 120));
  } catch (e) {
    console.log("ERR ", q.slice(0, 50), String(e).slice(0, 80));
  }
}

const pct = Math.round((ok / QUESTIONS.length) * 100);
console.log(`\n${ok}/${QUESTIONS.length} = ${pct}% (target 80%)`);
process.exit(pct >= 80 ? 0 : 1);
