import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { scoreThesis } from "@/lib/thesis-score";
import type { PieAllocationRow, PieSleeveAdd } from "@/types/pie-customization";
import { CASH_SLICE_SYMBOL } from "@/types/pie-customization";

export type { PieSleeveAdd };
import type { ThemeId, UserProfile } from "@/store/types";

export type PieSleeveSuggestion = {
  intentId: string;
  intentLabel: string;
  symbol: string;
  kind: "stock" | "etf";
  name: string;
  reason: string;
  suggestedWeightPct: number;
  fitScore: number;
  alreadyInPie: boolean;
};

type SleeveIntent = {
  id: string;
  label: string;
  patterns: RegExp[];
  symbols: string[];
  defaultAddPct: number;
  role: string;
};

const SLEEVE_INTENTS: SleeveIntent[] = [
  {
    id: "dividend",
    label: "Dividend & income stability",
    patterns: [
      /dividend/,
      /income\s*stability/,
      /dividend\s*stability/,
      /steady\s*income/,
      /yield/,
      /schd/,
      /vym/,
      /dgro/,
      /jeqi/,
    ],
    symbols: ["SCHD", "VYM", "DGRO", "JEPI"],
    defaultAddPct: 10,
    role: "Dividend sleeve, quality income ETF",
  },
  {
    id: "international",
    label: "International exposure",
    patterns: [
      /international/,
      /global\s*(?:ex|stock|equity)?/,
      /foreign/,
      /ex-?us/,
      /overseas/,
      /vxus/,
      /vea/,
      /efa/,
      /iemg/,
      /vwo/,
      /developed\s*markets/,
      /emerging\s*markets/,
    ],
    symbols: ["VXUS", "VEA", "IEMG", "EFA"],
    defaultAddPct: 12,
    role: "International sleeve, ex-US diversification",
  },
  {
    id: "bonds",
    label: "Bond ballast",
    patterns: [
      /bond/,
      /fixed\s*income/,
      /bnd/,
      /agg/,
      /treasury/,
      /interest\s*rate/,
      /duration/,
    ],
    symbols: ["BND", "AGG", "VGIT", "IEF"],
    defaultAddPct: 10,
    role: "Bond sleeve, rate & credit ballast",
  },
  {
    id: "broad-us",
    label: "US core market",
    patterns: [/broad\s*market/, /s&p|sp500|spy|voo|vti/, /total\s*market/, /core\s*holding/],
    symbols: ["VOO", "VTI", "SPLG"],
    defaultAddPct: 15,
    role: "US core, market-cap weighted",
  },
  {
    id: "tech",
    label: "Tech / growth tilt",
    patterns: [
      /tech/,
      /semiconductor/,
      /ai\s|artificial/,
      /growth\s*tilt/,
      /qqq/,
      /xlk/,
      /smh/,
    ],
    symbols: ["QQQ", "SMH", "XLK", "VGT"],
    defaultAddPct: 10,
    role: "Growth sleeve, sector tilt",
  },
  {
    id: "value",
    label: "Value tilt",
    patterns: [/value\s*tilt/, /value\s*factor/, /vtv/, /schv/, /ive/],
    symbols: ["VTV", "SCHV", "IVE"],
    defaultAddPct: 8,
    role: "Value factor sleeve",
  },
  {
    id: "small-cap",
    label: "Small-cap exposure",
    patterns: [/small\s*cap/, /smaller\s*companies/, /vb\b/, /ijr/, /scha/],
    symbols: ["VB", "IJR", "SCHA"],
    defaultAddPct: 8,
    role: "Small-cap sleeve",
  },
];

function resolveSymbol(sym: string): {
  symbol: string;
  kind: "stock" | "etf";
  name: string;
} | null {
  const s = sym.toUpperCase();
  const etf = etfBySymbol(s);
  if (etf) return { symbol: s, kind: "etf", name: etf.name };
  const stock = stockBySymbol(s);
  if (stock) return { symbol: s, kind: "stock", name: stock.name };
  return { symbol: s, kind: "etf", name: s };
}

function fitScoreForSymbol(
  symbol: string,
  kind: "stock" | "etf",
  profile: UserProfile,
  themeIds: ThemeId[]
): number {
  if (kind === "stock") {
    const stock = stockBySymbol(symbol);
    if (!stock) return 50;
    return scoreThesis(stock, profile, themeIds).overall;
  }
  const etf = etfBySymbol(symbol);
  if (!etf) return 55;
  const overlap = etf.themes.filter((t) => themeIds.includes(t)).length;
  return Math.min(95, 45 + overlap * 18 + (etf.expense < 0.2 ? 8 : 0));
}

export function detectSleeveIntents(input: string): SleeveIntent[] {
  const t = input.trim().toLowerCase();
  if (!t) return [];
  return SLEEVE_INTENTS.filter((intent) =>
    intent.patterns.some((p) => p.test(t))
  );
}

function wantsToAddSleeve(input: string): boolean {
  return /(?:want|need|add|get|give\s*me|looking\s*for|seeking|some\s*more|more\s*of|tilt\s*toward|tilt\s*to|include|bring\s*in)/i.test(
    input
  );
}

function explicitSymbolInPrompt(input: string, symbol: string): boolean {
  return new RegExp(`\\b${symbol}\\b`, "i").test(input);
}

export function buildPieSleeveSuggestions(
  input: string,
  rows: PieAllocationRow[],
  profile: UserProfile,
  themeIds: ThemeId[]
): PieSleeveSuggestion[] {
  const intents = detectSleeveIntents(input);
  if (intents.length === 0) return [];

  const inPie = new Set(
    rows.filter((r) => r.symbol !== CASH_SLICE_SYMBOL).map((r) => r.symbol)
  );
  const out: PieSleeveSuggestion[] = [];
  const seen = new Set<string>();

  for (const intent of intents) {
    const ranked = intent.symbols
      .map((sym) => {
        const resolved = resolveSymbol(sym);
        if (!resolved) return null;
        return {
          ...resolved,
          fitScore: fitScoreForSymbol(resolved.symbol, resolved.kind, profile, themeIds),
        };
      })
      .filter(Boolean) as {
      symbol: string;
      kind: "stock" | "etf";
      name: string;
      fitScore: number;
    }[];

    ranked.sort((a, b) => b.fitScore - a.fitScore);

    for (const pick of ranked.slice(0, 3)) {
      if (seen.has(pick.symbol)) continue;
      seen.add(pick.symbol);
      const row = rows.find((r) => r.symbol === pick.symbol);
      out.push({
        intentId: intent.id,
        intentLabel: intent.label,
        symbol: pick.symbol,
        kind: pick.kind,
        name: pick.name,
        reason: intent.role,
        suggestedWeightPct: intent.defaultAddPct,
        fitScore: pick.fitScore,
        alreadyInPie: inPie.has(pick.symbol),
      });
      if (out.filter((s) => s.intentId === intent.id).length >= 2) break;
    }
  }

  return out;
}

/** Pick sleeves to auto-add when the user clearly asks to add exposure. */
export function autoAddsFromSuggestions(
  input: string,
  suggestions: PieSleeveSuggestion[]
): PieSleeveAdd[] {
  if (!wantsToAddSleeve(input) && !/(?:add|include)\s+[a-z]{2,5}/i.test(input)) return [];

  const t = input.toUpperCase();
  const adds: PieSleeveAdd[] = [];
  const usedIntents = new Set<string>();

  for (const s of suggestions) {
    if (usedIntents.has(s.intentId)) continue;
    if (explicitSymbolInPrompt(input, s.symbol)) {
      adds.push({
        symbol: s.symbol,
        kind: s.kind,
        name: s.name,
        weightPct: s.suggestedWeightPct,
        role: s.reason,
      });
      usedIntents.add(s.intentId);
      continue;
    }
  }

  if (adds.length === 0 && wantsToAddSleeve(input)) {
    for (const s of suggestions) {
      if (usedIntents.has(s.intentId)) continue;
      if (s.alreadyInPie) continue;
      adds.push({
        symbol: s.symbol,
        kind: s.kind,
        name: s.name,
        weightPct: s.suggestedWeightPct,
        role: s.reason,
      });
      usedIntents.add(s.intentId);
      if (adds.length >= 2) break;
    }
  }

  return adds;
}

export function formatSuggestionHeadline(s: PieSleeveSuggestion): string {
  if (s.alreadyInPie) {
    return `${s.symbol} is already in your pie, boost its weight?`;
  }
  return `Suggested: ${s.symbol}, ${s.intentLabel.toLowerCase()}`;
}
