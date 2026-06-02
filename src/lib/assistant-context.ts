import { computeNetWorth } from "@/data/demo-accounts";
import { themeById } from "@/data/themes";
import type { CfoProfile } from "@/types/cfo-profile";
import type { Holding, LinkedAccount, PlaidConnectionStatus } from "@/types/linked-accounts";
import type { ModelThesis } from "@/store/index";
import type { ThemeId } from "@/store/types";

import { demoDisplayFirstName } from "@/lib/display-name";
import { INVESTING_WIZARD_SCOPE } from "./cfo-knowledge-scope";
import { formatMemoryForPrompt, type AssistantMemoryNote } from "./assistant-memory";

export type RecentChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export const THESIS_LENS_SYSTEM_PROMPT = `You are Thesis CFO, an investing wizard: teacher, coach, and advisor in one thread. Users pay for answers that are as good as a strong ChatGPT session, but personalized to their profile and holdings.

Quality bar:
- Answer the exact question first, any topic (macro, crypto, tax, ETFs, single stocks, personal finance, niche instruments).
- Be specific: names, tickers, frameworks, tradeoffs, not vague platitudes.
- Use their context when you have it (holdings %, goals, themes, memory).
- When you lack live data, use solid general knowledge and say so, never refuse or ask them to rephrase.
- If a term is obscure, say what you'd verify, do not invent facts or prices.

${INVESTING_WIZARD_SCOPE}

Writing style:
- Use standard US tickers in ALL CAPS when naming securities (NVDA, VOO, SCHD).
- Write finance terms in plain English (inflation hedge, expense ratio, dry powder) so readers can tap to learn.
- Write in plain paragraphs with bullet lists where helpful. Never use markdown headers (##) or pipe tables (|---|---|). The chat renderer does not support them — they show as raw text.
- Use bold sparingly for the single most important idea per paragraph.

Macro and live markets:
When the server provides a "Live macro & markets data" block or you use macro tools, cite those figures for current Fed funds, Treasury yields, curve spread, and headlines. Never invent today's rates. Connect macro moves to the user's holdings and philosophy (growth vs income vs diversification).

Compliance:
Explain and educate, never buy/sell/hold orders or personalized allocation percentages. End with: Educational tool, not investment advice.`;

export type AssistantContextInput = {
  profile: CfoProfile;
  themeIds: ThemeId[];
  completedLessons: string[];
  watchlist: string[];
  memoryNotes: AssistantMemoryNote[];
  plaidStatus?: PlaidConnectionStatus;
  linkedAccounts?: LinkedAccount[];
  holdings?: Holding[];
  modelThesis?: ModelThesis | null;
};

export function buildModelThesisSummary(model: ModelThesis): string {
  const holdings = model.holdings.map((h) => `${h.symbol} ${h.weightPct}%`).join(", ");
  const scenarios =
    model.appliedLifeScenarios.map((s) => s.id).join(", ") || "none";
  const radar = model.radarReports
    .slice(0, 3)
    .map((r) => `- ${r.title}: ${r.content.slice(0, 400)}…`)
    .join("\n");
  return [
    `Model book: ${model.name}`,
    `Conviction: ${model.conviction.slice(0, 800)}`,
    `Holdings: ${holdings || "none"}`,
    `Life scenarios: ${scenarios}`,
    model.radarReports.length ? `Recent radar research:\n${radar}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export type AssistantContextPayload = {
  system: string;
  contextBlock: string;
  estimatedTokens: number;
};

function labelHorizon(h: string) {
  const map: Record<string, string> = {
    short: "Short (≤3y)",
    medium: "Medium (3–7y)",
    long: "Long (7–15y)",
    "very-long": "Very long (15y+)",
  };
  return map[h] ?? h;
}

function labelRisk(r: string) {
  return r.replace("-", " ");
}

export function buildProfileSummary(profile: CfoProfile): string {
  const d = profile.derived;
  const ex = profile.extended;
  const lines: string[] = [
    `Name: ${demoDisplayFirstName()}.`,
    `Age band: ~${profile.age}; primary goal: ${profile.primaryGoal}.`,
    `Horizon: ${labelHorizon(profile.horizon)}; risk tolerance: ${labelRisk(profile.risk)}.`,
    `Experience: ${profile.experience}; reaction to drawdown: ${profile.reactionToDrawdown}.`,
    `Emergency fund: ${profile.hasEmergencyFund ? "yes" : "no"}; high-interest debt: ${profile.hasHighInterestDebt ? "yes" : "no"}.`,
    `Net investable (approx): $${profile.netInvestable.toLocaleString()}; monthly contribution: $${profile.monthlyContribution.toLocaleString()}.`,
    `Income need from portfolio: ${profile.incomeNeed}.`,
    `Interests: ${profile.interests.join(", ") || "none"}.`,
    `Concerns: ${profile.concerns.join(", ") || "none"}.`,
  ];

  if (ex.risk?.maximumAcceptableDrawdown != null) {
    lines.push(`Max comfortable drawdown: ${ex.risk.maximumAcceptableDrawdown}%.`);
  }
  if (ex.behavioral?.investmentPhilosophy) {
    lines.push(`Investment philosophy: ${ex.behavioral.investmentPhilosophy}.`);
  }

  lines.push(
    `Derived, wealth stage: ${d.wealthStage}; CFO readiness: ${d.overallCfoReadiness}/100; behavioral: ${d.behavioralScore}/100.`
  );

  return lines.join("\n");
}

export function buildThemesSummary(themeIds: ThemeId[]): string {
  if (!themeIds.length) return "No matched themes yet.";
  return themeIds
    .slice(0, 6)
    .map((id, i) => {
      const t = themeById(id);
      if (!t) return `${i + 1}. ${id}`;
      return `${i + 1}. ${t.title}, ${t.thesis}`;
    })
    .join("\n");
}

export function buildLinkedAccountsSummary(
  accounts: LinkedAccount[],
  holdings: Holding[],
  status: PlaidConnectionStatus
): string {
  if (status === "disconnected") {
    return "No linked accounts, use questionnaire data only.";
  }
  const nw = computeNetWorth(accounts);
  const sorted = [...holdings].sort((a, b) => b.weightPct - a.weightPct);
  const holdLines = sorted
    .slice(0, 16)
    .map((h) => `- ${h.symbol}: ${h.weightPct}% ($${h.value.toLocaleString()})`)
    .join("\n");
  return [
    `Net worth: $${nw.netWorth.toLocaleString()}.`,
    "Holdings:",
    holdLines || "(none)",
  ].join("\n");
}

export type BuildAssistantContextOptions = {
  /** compact = retry path with smaller prompt */
  mode?: "full" | "compact";
};

/** Compact context when full request fails, keeps LLM path alive. */
export function buildCompactAssistantContext(input: AssistantContextInput): AssistantContextPayload {
  const block = [
    "Profile:",
    buildProfileSummary(input.profile),
    "Themes:",
    buildThemesSummary(input.themeIds),
    "Holdings:",
    buildLinkedAccountsSummary(
      input.linkedAccounts ?? [],
      input.holdings ?? [],
      input.plaidStatus ?? "disconnected"
    ),
    "Top memory:",
    formatMemoryForPrompt(input.memoryNotes.slice(-12)),
  ].join("\n\n");

  const system = `${THESIS_LENS_SYSTEM_PROMPT}\n\n\n${block}`;
  return { system, contextBlock: block, estimatedTokens: Math.ceil(system.length / 4) };
}

export function buildAssistantContext(
  input: AssistantContextInput,
  options?: BuildAssistantContextOptions
): AssistantContextPayload {
  if (options?.mode === "compact") {
    return buildCompactAssistantContext(input);
  }

  const {
    profile,
    themeIds,
    memoryNotes,
    plaidStatus = "disconnected",
    linkedAccounts = [],
    holdings = [],
  } = input;

  const contextBlock = [
    "Profile:",
    buildProfileSummary(profile),
    "Themes:",
    buildThemesSummary(themeIds),
    "Memory:",
    formatMemoryForPrompt(memoryNotes),
    "Holdings:",
    buildLinkedAccountsSummary(linkedAccounts, holdings, plaidStatus),
    input.modelThesis ? ["Thesis model:", buildModelThesisSummary(input.modelThesis)] : [],
  ]
    .flat()
    .filter(Boolean)
    .join("\n\n");

  const system = `${THESIS_LENS_SYSTEM_PROMPT}\n\n\nUser context:\n\n${contextBlock}`;
  return { system, contextBlock, estimatedTokens: Math.ceil(system.length / 4) };
}

export function assistantContextStatus(input: AssistantContextInput): string {
  const { estimatedTokens } = buildAssistantContext(input);
  const memory = input.memoryNotes.length;
  const accts = input.linkedAccounts?.length ?? 0;
  const acctBit = accts > 0 ? ` · ${accts} linked accounts` : "";
  return `${memory} memory${memory === 1 ? "" : " notes"}${acctBit} · ~${estimatedTokens} context tokens`;
}
