import type { CfoProfile } from "@/types/cfo-profile";

/** Ever-growing durable facts, injected every CFO turn (not model fine-tuning). */
export type MemoryCategory =
  | "goal"
  | "holdings"
  | "preference"
  | "constraint"
  | "topic"
  | "life"
  | "other";

export type AssistantMemoryNote = {
  id: string;
  text: string;
  source: "user" | "assistant" | "system" | "extracted";
  createdAt: number;
  category?: MemoryCategory;
  /** 1 = minor, 5 = critical for personalization */
  importance?: number;
};

const MAX_NOTES = 160;
const MAX_NOTE_LEN = 500;

export function trimMemoryNotes(notes: AssistantMemoryNote[]): AssistantMemoryNote[] {
  const ranked = [...notes].sort((a, b) => memoryScore(b) - memoryScore(a));
  return ranked.slice(0, MAX_NOTES).map((n) => ({
    ...n,
    text: n.text.slice(0, MAX_NOTE_LEN),
  }));
}

function memoryScore(n: AssistantMemoryNote): number {
  const imp = n.importance ?? (n.source === "system" ? 3 : 2);
  const ageDays = (Date.now() - n.createdAt) / 86_400_000;
  const recency = Math.max(0, 5 - ageDays * 0.15);
  const sourceBoost =
    n.source === "user" ? 2 : n.source === "extracted" ? 1.5 : n.source === "system" ? 1 : 0.5;
  return imp * 2 + recency + sourceBoost;
}

function normalizeMemoryKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s$%.,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isDuplicateMemory(existing: AssistantMemoryNote[], text: string): boolean {
  const key = normalizeMemoryKey(text);
  if (key.length < 8) return true;
  return existing.some((n) => {
    const ek = normalizeMemoryKey(n.text);
    if (ek === key) return true;
    if (ek.length > 12 && key.length > 12) {
      if (ek.includes(key) || key.includes(ek)) return true;
      const a = new Set(ek.split(" "));
      const b = new Set(key.split(" "));
      let overlap = 0;
      for (const w of a) {
        if (w.length > 3 && b.has(w)) overlap++;
      }
      const ratio = overlap / Math.min(a.size, b.size);
      if (ratio > 0.72) return true;
    }
    return false;
  });
}

export function mergeIncomingMemory(
  existing: AssistantMemoryNote[],
  incoming: {
    text: string;
    source?: AssistantMemoryNote["source"];
    category?: MemoryCategory;
    importance?: number;
  }[]
): { merged: AssistantMemoryNote[]; added: number } {
  let merged = [...existing];
  let added = 0;

  for (const item of incoming) {
    const text = item.text.trim();
    if (text.length < 10 || isDuplicateMemory(merged, text)) continue;
    merged.push({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      source: item.source ?? "extracted",
      createdAt: Date.now(),
      category: item.category ?? inferCategory(text),
      importance: item.importance ?? inferImportance(text),
    });
    added++;
  }

  return { merged: trimMemoryNotes(merged), added };
}

function inferCategory(text: string): MemoryCategory {
  const t = text.toLowerCase();
  if (/hold|own|portfolio|allocation|etf|stock|btc|crypto|nvda|aapl|\$/.test(t)) {
    return "holdings";
  }
  if (/goal|retire|fire|wealth|save for|pay off|buy a house/.test(t)) return "goal";
  if (/wife|husband|kid|child|parent|job|employer|live in|state|married/.test(t)) {
    return "life";
  }
  if (/worried|fear|comfort|drawdown|panic|sleep|aggressive|conservative/.test(t)) {
    return "constraint";
  }
  if (/like|prefer|interested|bullish|bearish|skeptic|theme|believe/.test(t)) {
    return "preference";
  }
  if (/fed|rate|inflation|tax|roth|ira|401|hsa|mortgage|loan|option/.test(t)) {
    return "topic";
  }
  return "other";
}

function inferImportance(text: string): number {
  const t = text.toLowerCase();
  if (/debt|emergency|retire|goal|max drawdown|tax bracket|employer stock/.test(t)) {
    return 5;
  }
  if (/planning|want to|saving for|concerned|allergic to/.test(t)) return 4;
  if (/interested|prefer|holding|allocated/.test(t)) return 3;
  return 2;
}

/** Rule-based extraction, runs on-device, no API, every user message. */
export function extractHeuristicMemory(userMessage: string): {
  text: string;
  category?: MemoryCategory;
  importance?: number;
}[] {
  const text = userMessage.trim();
  if (text.length < 16) return [];

  const out: { text: string; category?: MemoryCategory; importance?: number }[] = [];
  const push = (line: string, importance = 3) => {
    if (line.length >= 10 && line.length <= MAX_NOTE_LEN) {
      out.push({ text: line, importance, category: inferCategory(line) });
    }
  };

  const firstPerson =
    /\b(i'm|i am|i have|i own|we have|we're|my |our |i want|i plan|i need|i'm trying)\b/i.test(text);
  if (!firstPerson) return [];

  let matched = false;
  const patterns: { re: RegExp; fmt: (m: RegExpMatchArray) => string; imp?: number }[] = [
    {
      re: /(?:saving|investing|putting aside)\s+(?:about\s+)?\$?([\d,]+)\s*(?:\/?\s*month|monthly|per month)/i,
      fmt: (m) => `Monthly investing/savings amount mentioned: ~$${m[1]}.`,
      imp: 4,
    },
    {
      re: /(?:tax bracket|in the)\s+(\d{2,3})\s*%?\s*(?:bracket|tax)/i,
      fmt: (m) => `Tax bracket context: ~${m[1]}%.`,
      imp: 5,
    },
    {
      re: /(?:wife|husband|partner|spouse|fiancé|fiancée)/i,
      fmt: () => `Family: mentioned spouse/partner, joint planning may matter.`,
      imp: 4,
    },
    {
      re: /(?:kid|child|children|son|daughter|baby)/i,
      fmt: () => `Family: mentioned children, education/college framing may matter.`,
      imp: 4,
    },
    {
      re: /(?:work at|employer|company stock|rsu|espp|options from)\s+([^.!?]{3,40})/i,
      fmt: (m) => `Employment / employer equity context: ${m[1].trim()}.`,
      imp: 5,
    },
    {
      re: /(?:live in|based in|resident of)\s+([A-Za-z\s]{2,24})/i,
      fmt: (m) => `Location: ${m[1].trim()}.`,
      imp: 3,
    },
    {
      re: /(?:scared|worried|anxious|fear|can't stomach|panic)\s+(?:about\s+)?([^.!?]{8,80})/i,
      fmt: (m) => `Concern / anxiety: ${m[1].trim()}.`,
      imp: 5,
    },
    {
      re: /(?:bullish|bearish|skeptical|excited) (?:about|on)\s+([^.!?]{4,60})/i,
      fmt: (m) => `Market view: ${m[0].slice(0, 80)}.`,
      imp: 4,
    },
    {
      re: /(?:planning to|want to|goal is to|trying to)\s+([^.!?]{8,100})/i,
      fmt: (m) => `Stated goal/plan: ${m[1].trim()}.`,
      imp: 5,
    },
    {
      re: /(?:allergic to|hate|won't touch|avoid)\s+([^.!?]{4,50})/i,
      fmt: (m) => `Exclusion / constraint: avoids ${m[1].trim()}.`,
      imp: 5,
    },
  ];

  for (const { re, fmt, imp } of patterns) {
    const m = text.match(re);
    if (m) {
      matched = true;
      push(fmt(m), imp ?? 4);
    }
  }

  if (!matched && text.length > 48) {
    push(`User shared (chat): ${text.slice(0, 280)}${text.length > 280 ? "…" : ""}`, 3);
  }

  return out.slice(0, 4);
}

/** Seed notes from CFO profile so first chat is already personalized. */
export function seedMemoryFromProfile(profile: CfoProfile): AssistantMemoryNote[] {
  const notes: AssistantMemoryNote[] = [];
  const push = (text: string, category: MemoryCategory, importance: number) => {
    notes.push({
      id: `seed-${notes.length}`,
      text,
      source: "system",
      createdAt: Date.now(),
      category,
      importance,
    });
  };

  push(
    `Primary goal: ${profile.primaryGoal}; horizon: ${profile.horizon}; risk: ${profile.risk}.`,
    "goal",
    5
  );
  push(
    `Experience: ${profile.experience}; drawdown reaction: ${profile.reactionToDrawdown}.`,
    "constraint",
    4
  );

  if (profile.hasHighInterestDebt) {
    push("Has high-interest debt, prioritize debt payoff framing when relevant.", "constraint", 5);
  }
  if (!profile.hasEmergencyFund) {
    push("No emergency fund yet, liquidity and safety-first framing matter.", "constraint", 5);
  }
  if (profile.interests.length) {
    push(`Interests: ${profile.interests.slice(0, 8).join(", ")}.`, "preference", 3);
  }
  if (profile.concerns.length) {
    push(`Concerns: ${profile.concerns.join(", ")}.`, "constraint", 4);
  }
  if (profile.values.length) {
    push(`Values screens: ${profile.values.join(", ")}.`, "preference", 3);
  }

  const ex = profile.extended;
  if (ex.behavioral?.investmentPhilosophy) {
    push(`Philosophy leaning: ${ex.behavioral.investmentPhilosophy}.`, "preference", 4);
  }
  if (ex.risk?.maximumAcceptableDrawdown != null) {
    push(`Comfortable max drawdown ~${ex.risk.maximumAcceptableDrawdown}%.`, "constraint", 5);
  }
  if (ex.expenses?.savingsRate != null) {
    push(`Savings rate ~${ex.expenses.savingsRate}% of take-home.`, "goal", 4);
  }
  if (profile.monthlyContribution > 0) {
    push(`Investing ~$${profile.monthlyContribution.toLocaleString()}/month from cash flow.`, "goal", 4);
  }
  if (profile.incomeNeed && profile.incomeNeed !== "none") {
    push(`Portfolio income need: ${profile.incomeNeed}.`, "goal", 4);
  }

  return trimMemoryNotes(notes);
}

export function memorySnippetsFromChat(
  messages: { role: string; content: string }[],
  maxLines = 6
): string[] {
  const userLines = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter((t) => t.length > 12);
  const recent = userLines.slice(-maxLines);
  return recent.map((t) => (t.length > 200 ? `${t.slice(0, 197)}…` : t));
}

export function mergeMemory(
  existing: AssistantMemoryNote[],
  profile: CfoProfile
): AssistantMemoryNote[] {
  if (existing.length > 0) return trimMemoryNotes(existing);
  return seedMemoryFromProfile(profile);
}

const CATEGORY_ORDER: MemoryCategory[] = [
  "goal",
  "constraint",
  "life",
  "holdings",
  "preference",
  "topic",
  "other",
];

export function formatMemoryForPrompt(notes: AssistantMemoryNote[]): string {
  if (!notes.length) return "(No stored memory yet, will grow automatically as you chat.)";

  const sorted = [...notes].sort((a, b) => memoryScore(b) - memoryScore(a));
  const lines: string[] = [];

  for (const cat of CATEGORY_ORDER) {
    const group = sorted.filter((n) => (n.category ?? "other") === cat);
    if (!group.length) continue;
    lines.push(`[${cat}]`);
    for (const n of group.slice(0, 28)) {
      lines.push(`- ${n.text}`);
    }
  }

  const uncategorized = sorted.filter((n) => !n.category);
  if (uncategorized.length) {
    lines.push("[other]");
    for (const n of uncategorized.slice(0, 12)) {
      lines.push(`- ${n.text}`);
    }
  }

  if (sorted.length > 80) {
    lines.push(`(…${sorted.length - 80} more notes ranked lower, ask to recall a topic.)`);
  }

  return lines.join("\n");
}
