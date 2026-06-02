import { conceptById, type ConceptId } from "@/data/concepts";
import { ETFS } from "@/data/etfs";
import { STOCKS } from "@/data/stocks";

export type EntityKind = "concept" | "stock" | "etf";

export type MessageEntity = {
  kind: EntityKind;
  key: string;
  label: string;
  start: number;
  end: number;
};

export type MessageSegment =
  | { type: "text"; value: string }
  | { type: "entity"; entity: MessageEntity };

const SYMBOL_KIND = new Map<string, "stock" | "etf">();
for (const s of STOCKS) SYMBOL_KIND.set(s.symbol, "stock");
for (const e of ETFS) SYMBOL_KIND.set(e.symbol, "etf");

/** Multi-word phrases → glossary concept (longest match wins). */
const PHRASE_TO_CONCEPT = [
  { phrase: "inflation hedge", id: "inflation-hedge" },
  { phrase: "dry powder", id: "dry-powder" },
  { phrase: "expense ratio", id: "expense-ratio" },
  { phrase: "price to earnings", id: "pe-ratio" },
  { phrase: "price-to-earnings", id: "pe-ratio" },
  { phrase: "p/e ratio", id: "pe-ratio" },
  { phrase: "market cap", id: "market-cap" },
  { phrase: "dividend yield", id: "dividend-yield" },
  { phrase: "compound interest", id: "compound-interest" },
  { phrase: "dollar cost averaging", id: "dollar-cost-averaging" },
  { phrase: "dollar-cost averaging", id: "dollar-cost-averaging" },
  { phrase: "bull market", id: "bull-bear-market" },
  { phrase: "bear market", id: "bull-bear-market" },
  { phrase: "fed rate", id: "fed-rate" },
  { phrase: "federal reserve", id: "fed-rate" },
  { phrase: "interest rate", id: "interest-rate" },
  { phrase: "credit score", id: "credit-score" },
  { phrase: "free cash flow", id: "free-cash-flow" },
  { phrase: "exchange traded fund", id: "what-is-etf" },
  { phrase: "exchange-traded fund", id: "what-is-etf" },
  { phrase: "etfs", id: "what-is-etf" },
  { phrase: "etf", id: "what-is-etf" },
  { phrase: "inflation", id: "inflation" },
  { phrase: "diversification", id: "diversification" },
  { phrase: "volatility", id: "volatility" },
  { phrase: "drawdown", id: "drawdown" },
  { phrase: "beta", id: "beta" },
  { phrase: "moat", id: "moat" },
] as const satisfies readonly { phrase: string; id: ConceptId }[];

const PHRASES_SORTED = [...PHRASE_TO_CONCEPT].sort((a, b) => b.phrase.length - a.phrase.length);

function collectPhraseMatches(text: string): MessageEntity[] {
  const out: MessageEntity[] = [];
  for (const { phrase, id } of PHRASES_SORTED) {
    if (!conceptById(id)) continue;
    const re = new RegExp(
      `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      out.push({
        kind: "concept",
        key: id,
        label: text.slice(m.index, m.index + m[0].length),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }
  return out;
}

function collectSymbolMatches(text: string): MessageEntity[] {
  const out: MessageEntity[] = [];
  for (const sym of SYMBOL_KIND.keys()) {
    const re = new RegExp(`\\$?\\b(${sym})\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const kind = SYMBOL_KIND.get(sym.toUpperCase())!;
      out.push({
        kind,
        key: sym.toUpperCase(),
        label: m[1].toUpperCase(),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }
  return out;
}

function mergeNonOverlapping(matches: MessageEntity[]): MessageEntity[] {
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });
  const kept: MessageEntity[] = [];
  for (const m of sorted) {
    if (kept.some((k) => m.start < k.end && m.end > k.start)) continue;
    kept.push(m);
  }
  return kept.sort((a, b) => a.start - b.start);
}

export function parseMessageSegments(text: string): MessageSegment[] {
  const matches = mergeNonOverlapping([
    ...collectPhraseMatches(text),
    ...collectSymbolMatches(text),
  ]);

  if (!matches.length) return [{ type: "text", value: text }];

  const segments: MessageSegment[] = [];
  let cursor = 0;
  for (const ent of matches) {
    if (ent.start > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, ent.start) });
    }
    segments.push({ type: "entity", entity: ent });
    cursor = ent.end;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }
  return segments;
}

export function entityKindLabel(kind: EntityKind): string {
  if (kind === "stock") return "Stock";
  if (kind === "etf") return "ETF";
  return "Learn";
}
