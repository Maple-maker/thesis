import { allConcepts, conceptById, type Concept } from "@/data/concepts";
import type { AssistantContextInput } from "./assistant-context";

const CONCEPT_ALIASES: { pattern: RegExp; id?: string; inline?: Concept }[] = [
  { pattern: /\bebitda\b|\bebita\b/i, id: "ebitda" },
  { pattern: /\bcagr\b|compound annual growth/i, inline: {
    id: "compound-interest" as const,
    tier: "foundational",
    term: "CAGR (compound annual growth rate)",
    short: "The smoothed yearly growth rate of an investment over time.",
    body: "CAGR is the constant annual rate that would take an investment from its starting value to its ending value over a period, assuming profits were reinvested. If $10,000 grows to $16,105 in five years, CAGR is about 10%, even if the path was bumpy year to year.",
    whyItMatters: "CAGR lets you compare investments on a level timeline. It's how people quote long-run stock or fund returns. It ignores volatility in between, so pair it with drawdown thinking when you judge risk.",
  }},
  { pattern: /\bp\/?e\b|price.?earnings|pe ratio/i, id: "pe-ratio" },
  { pattern: /\bmarket cap\b/i, id: "market-cap" },
  { pattern: /\bexpense ratio\b/i, id: "expense-ratio" },
  { pattern: /\bdividend yield\b/i, id: "dividend-yield" },
  { pattern: /\bdrawdown\b/i, id: "drawdown" },
  { pattern: /\bbeta\b/i, id: "beta" },
  { pattern: /\beps\b|earnings per share/i, id: "eps" },
  { pattern: /\bcompound interest\b/i, id: "compound-interest" },
  { pattern: /\bdiversif/i, id: "diversification" },
  { pattern: /\broth\b/i, id: "roth-vs-traditional" },
  { pattern: /\bwhat is an? etf\b|\bwhat's an? etf\b/i, id: "what-is-etf" },
];

export function conceptAnswerForQuestion(userText: string): Concept | null {
  const q = userText.toLowerCase().trim();

  for (const row of CONCEPT_ALIASES) {
    if (!row.pattern.test(q)) continue;
    if (row.inline) return row.inline;
    if (row.id) {
      const c = conceptById(row.id as Concept["id"]) ?? allConcepts().find((x) => x.id === row.id);
      if (c) return c;
    }
  }

  if (!/^(what is|what's|explain|define|meaning of|tell me about)\b/i.test(q)) {
    return null;
  }

  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  let best: Concept | null = null;
  let bestScore = 0;

  for (const c of allConcepts()) {
    if (c.id === "what-is-stock" || c.id === "what-is-etf") continue;

    const hay = `${c.term} ${c.short} ${c.id}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (c.id.includes(t) || hay.includes(t)) score += 4;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return bestScore >= 4 ? best : null;
}

export function formatConceptAsCoachReply(concept: Concept, profileNote?: string): string {
  const tail = profileNote ? `\n\n${profileNote}` : "";
  const why = concept.whyItMatters
    ? `\n\nWhy it matters: ${concept.whyItMatters}`
    : "";
  return `${concept.term}, ${concept.short}\n\n${concept.body}${why}${tail}\n\nEducational tool, not investment advice.`;
}

export function buildConceptCoachReply(
  userText: string,
  _input: AssistantContextInput
): string | null {
  const concept = conceptAnswerForQuestion(userText);
  if (!concept) return null;
  let note = "";
  if (concept.id === "ebitda" && /ebita/i.test(userText)) {
    note = "(You wrote EBITA, meant EBITDA.)";
  }
  return formatConceptAsCoachReply(concept, note || undefined);
}