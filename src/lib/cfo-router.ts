import { conceptById } from "@/data/concepts";
import {
  etfsForCommodityQuestion,
  sectorFromQuery,
  sectorLabel,
  SECTOR_ETF_MAP,
} from "@/data/sector-etfs";
import { themeById } from "@/data/themes";
import type { AssistantContextInput } from "./assistant-context";
import {
  conceptAnswerForQuestion,
  formatConceptAsCoachReply,
} from "./cfo-concept-answer";
import { etfsForThemes } from "./cfo-thesis-etfs";

export type CfoIntent =
  | "sector_etf"
  | "commodity_etf"
  | "inflation_hedge"
  | "dry_powder"
  | "thesis_etf"
  | "concept"
  | "holdings"
  | "risk"
  | "roth"
  | "trade_refusal"
  | "open";

function isThematicEtfAsk(q: string): boolean {
  const lower = q.toLowerCase();
  return (
    /etf|etfs|fund|exposure|recommend|suggest|which|best|pick|want to get|add/i.test(lower) &&
    (sectorFromQuery(q) !== null ||
      /commodit|copper|gold|iron|silver|metal|mining|rare.?earth|lithium|bottleneck/i.test(lower))
  );
}

function isRecommendationOrPick(q: string): boolean {
  return /recommend|suggest|which|best|pick|should i (buy|get|use)|give me|show me/i.test(
    q
  );
}

function isDefinitional(q: string): boolean {
  return /^(what is|what's|explain|define|meaning of|tell me about|how does)\b/i.test(
    q.trim()
  );
}

function themeTitles(input: AssistantContextInput): string {
  return (
    input.themeIds
      .slice(0, 3)
      .map((id) => themeById(id)?.title ?? id)
      .join(", ") || "your themes"
  );
}

function replyThematicEtf(userText: string, input: AssistantContextInput): string | null {
  const p = input.profile;
  const groups = etfsForCommodityQuestion(userText);
  const sector = sectorFromQuery(userText);

  if (groups.length) {
    const blocks = groups.map((g) => {
      const lines = g.etfs.map(
        (f) => `• ${f.symbol}, ${f.name} (${f.expense}% expense). ${f.blurb}`
      );
      return `${sectorLabel(g.sector)}:\n${lines.join("\n")}`;
    });

    const bottleneck = /bottleneck|rare.?earth|supply chain|china/i.test(userText)
      ? `\n\nOn the rare-earth bottleneck thesis: most refining capacity is concentrated outside the U.S., so miners (REMX) can rip on headlines but policy and permit risk are real. Pair that story with whether you want miners (equity volatility) vs. physical metal funds (different risk).`
      : "";

    const book = input.holdings?.length
      ? `\n\nYour current book (${input.holdings
          .slice(0, 4)
          .map((h) => h.symbol)
          .join(", ")}) is already equity-heavy in large-cap U.S. growth/quality. Commodity sleeves would be additive risk, size them small relative to VOO/SCHD.`
      : "";

    return `Here's how I'd map your question into ETF sleeves (education only, not orders):

${blocks.join("\n\n")}${bottleneck}

Framing for you: ${p.risk} risk, ${p.horizon} horizon, wealth goal. Commodity miners often move 2–3× the volatility of the S&P, treat as a satellite (often 5–10% of the equity sleeve mentally), not a second core.${book}

Open each fund's fact sheet for country and concentration risk before you research further.

Educational tool, not investment advice.`;
  }

  if (!sector) return null;
  const funds = SECTOR_ETF_MAP[sector];
  if (!funds?.length) return null;

  const lines = funds.map(
    (f) => `• ${f.symbol}, ${f.name} (${f.expense}% expense). ${f.blurb}`
  );
  const label = sectorLabel(sector);

  const book = input.holdings?.length
    ? `\n\nLinked holdings: ${input.holdings
        .slice(0, 3)
        .map((h) => h.symbol)
        .join(", ")}, this sleeve would sit alongside that core, not replace it.`
    : "";

  return `For ${label}, common ETF starting points:

${lines.join("\n")}

At ${p.risk} risk and a ${p.horizon} horizon, keep thematic sleeves smaller than your broad U.S. core.${book}

Educational tool, not investment advice.`;
}

function replyThesisEtf(input: AssistantContextInput): string {
  const p = input.profile;
  const picks = etfsForThemes(input.themeIds, 4);
  const lines = picks.map(
    (e) => `• ${e.symbol} (${e.name}, ${e.expense}% expense), ${e.why}`
  );

  let bookNote = "";
  if (input.holdings?.length) {
    const syms = input.holdings.map((h) => `${h.symbol} (${h.weightPct}%)`).join(", ");
    bookNote = `\n\nYou're already holding ${syms}, check overlap before adding another fund with the same large-cap backbone.`;
  }

  return `Mapped to your matched themes (${themeTitles(input)}), these ETFs express that story in fund form:

${lines.join("\n")}

Core + satellite framing: one broad U.S. fund (VOO/VTI), one income/quality tilt if that matches Reliable Income, then thematic sleeves sized to your drawdown comfort (~${p.extended.risk?.maximumAcceptableDrawdown ?? 15}%).${bookNote}

Educational tool, not investment advice.`;
}

function replyConcept(userText: string, input: AssistantContextInput): string | null {
  if (isRecommendationOrPick(userText) && !isDefinitional(userText)) return null;

  const concept = conceptAnswerForQuestion(userText);
  if (!concept) return null;

  if (concept.id === "what-is-etf" && isRecommendationOrPick(userText)) return null;
  if (concept.id === "what-is-stock" && !/\bstock|share|equity\b/i.test(userText)) {
    return null;
  }

  let note = "";
  if (concept.id === "ebitda" && /ebita/i.test(userText)) {
    note = "(You wrote EBITA, meant EBITDA, earnings before interest, taxes, depreciation, and amortization.)";
  }
  if (
    (concept.id === "pe-ratio" || concept.id === "eps") &&
    (input.holdings?.length ?? 0) > 0
  ) {
    const h = input.holdings!.find((x) => x.symbol === "NVDA" || x.symbol === "AAPL");
    if (h) {
      note = `When you look at ${h.symbol} in your linked book, P/E is the debate about how much growth is already priced in.`;
    }
  }

  return formatConceptAsCoachReply(concept, note || undefined);
}

function replyHoldings(input: AssistantContextInput): string | null {
  const holdings = [...(input.holdings ?? [])].sort((a, b) => b.weightPct - a.weightPct);
  if (!holdings.length) return null;

  const top3 = holdings.slice(0, 3);
  const top3Weight = top3.reduce((s, h) => s + h.weightPct, 0);
  const list = top3
    .map((h) => `${h.symbol} at ${h.weightPct}% ($${h.value.toLocaleString()})`)
    .join("; ");

  return `Your linked book is led by ${list}. Top three weights sum to ${top3Weight.toFixed(1)}%, ${top3Weight > 45 ? "that's concentrated" : "reasonable for a learning portfolio"}.

Against ${input.profile.risk} risk and ~${input.profile.extended.risk?.maximumAcceptableDrawdown ?? "-"}% drawdown comfort, the question is whether you'd hold the largest name through a 20% dip.

Themes in play: ${themeTitles(input)}.

Educational tool, not investment advice.`;
}

function replyInflationHedge(input: AssistantContextInput): string {
  const p = input.profile;
  const book = input.holdings?.length
    ? `Your book (${input.holdings
        .slice(0, 4)
        .map((h) => `${h.symbol} ${h.weightPct}%`)
        .join(", ")}) is mostly equities, they can lag when real rates rise and inflation surprises.`
    : "With mostly equity exposure, inflation shocks often hit growth and long-duration assets first.";

  return `For inflation hedging (education, not a buy list), investors usually mix a few sleeves:

• TIPS / short-duration Treasuries (e.g. TIP, SHV, VGSH), direct inflation-link or less rate sensitivity
• Gold / commodities (e.g. GLDM, IAU, PDBC), imperfect but often used as inflation stress diversifiers
• Real assets / energy tilt (e.g. XLE, VNQ), can help when inflation is growth-driven, not always in recessions

${book}

At ${p.risk} risk and a ${p.horizon} horizon, hedges are typically a **small** satellite (often 5–15% combined), not a replacement for your core. Check overlap: adding gold miners is not the same as physical gold.

Educational tool, not investment advice.`;
}

function replyDryPowder(input: AssistantContextInput): string {
  const book = input.holdings?.length
    ? `You're holding ${input.holdings
        .slice(0, 5)
        .map((h) => `${h.symbol} (${h.weightPct}%)`)
        .join(", ")}, mostly risk assets. Dry powder should be boring and liquid so you can buy dips without selling at the wrong time.`
    : "Dry powder is cash-like exposure you can deploy when risk assets sell off, keep it separate from your equity/crypto core.";

  return `For a cash cushion / dry powder sleeve (education only):

• SGOV, 0–3 month Treasuries, monthly income, minimal duration risk
• BIL, 1–3 month T-bills, very tight spreads
• SHV, short Treasury basket, slightly more duration than SGOV/BIL
• VMFXX / SPAXX, money market (mutual fund) if you want settlement fund mechanics in a brokerage

${book}

How to use it mentally: when VOO or NVDA draw down 15–20% and your plan still fits your horizon, you'd shift from this sleeve into names you already know, not because a headline said "buy."

Keep dry powder modest (often 5–15% of portfolio) so you still participate in uptrends.

Educational tool, not investment advice.`;
}

export function detectCfoIntent(userText: string, input: AssistantContextInput): CfoIntent {
  const q = userText.trim();
  const lower = q.toLowerCase();

  if (
    /dry powder|cash cushion|dry-powder|stash|when things go down|buy the dip|deploy cash/i.test(lower) ||
    (/cash|treasury|t-bill|money market/i.test(lower) && /etf|fund|cushion|reserve|parking/i.test(lower))
  ) {
    return "dry_powder";
  }
  if (/inflation|purchasing power|cpi|real rates/i.test(lower) && /hedge|protect|worry|concern/i.test(lower)) {
    return "inflation_hedge";
  }
  if (/buy|sell|should i (get|own)|pick a stock/i.test(q)) return "trade_refusal";
  if (isThematicEtfAsk(q)) return "commodity_etf";
  if (/etf/i.test(lower) && sectorFromQuery(q)) return "sector_etf";
  if (/recommend|suggest|which etf|best etf|etf for/i.test(lower) && sectorFromQuery(q)) {
    return "sector_etf";
  }
  if (/etf|fit my thesis|theme|what funds/i.test(lower) && isRecommendationOrPick(q)) {
    return "thesis_etf";
  }
  if (/holding|portfolio|allocation|concentrat|overlap|weight/i.test(lower)) return "holdings";
  if (/risk|too aggressive|drawdown/i.test(lower)) return "risk";
  if (/roth|ira|401/i.test(lower)) return "roth";
  if (replyConcept(q, input)) return "concept";
  return "open";
}

/** High-confidence answers without calling the LLM, core Pro value. */
export function buildStructuredCfoReply(
  userText: string,
  input: AssistantContextInput
): string | null {
  const intent = detectCfoIntent(userText, input);

  switch (intent) {
    case "sector_etf":
    case "commodity_etf":
      return replyThematicEtf(userText, input);
    case "inflation_hedge":
      return replyInflationHedge(input);
    case "dry_powder":
      return replyDryPowder(input);
    case "thesis_etf":
      return replyThesisEtf(input);
    case "concept":
      return replyConcept(userText, input);
    case "holdings":
      return replyHoldings(input);
    case "trade_refusal": {
      const p = input.profile;
      return `I can't tell you to buy or sell a specific security. I can map how a name fits your ${p.horizon} horizon and ${themeTitles(input)} themes, or compare ETFs in the screener.`;
    }
    case "risk": {
      const p = input.profile;
      return `You're marked ${p.risk} risk with ${p.horizon} horizon. The live test is behavior: would you sell after a ${p.extended.risk?.maximumAcceptableDrawdown ?? 15}% drop (${p.reactionToDrawdown})? Behavioral score ${p.derived.behavioralScore}/100. Emergency fund flagged: ${p.hasEmergencyFund ? "yes" : "no"}.

Educational tool, not investment advice.`;
    }
    case "roth": {
      const c = conceptById("roth-vs-traditional");
      return c ? formatConceptAsCoachReply(c) : null;
    }
    default:
      return null;
  }
}
