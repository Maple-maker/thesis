import type { ETF, ThemeId } from "@/store/types";
import { enrichEtfTags } from "@/lib/etf-tags";
import {
  ETF_CATALOG,
  ETF_CATALOG_COUNT,
  type EtfAssetClass,
  type EtfCatalogRow,
} from "@/data/etf-catalog.generated";

export type { EtfAssetClass, EtfCatalogRow };
export { ETF_CATALOG_COUNT };

export type EtfCatalogEntry = {
  symbol: string;
  name: string;
  expense: number | null;
  assetClass: EtfAssetClass;
  issuer?: string;
};

const CATALOG_BY_SYMBOL = new Map<string, EtfCatalogEntry>();

for (const row of ETF_CATALOG) {
  const [symbol, name, expense, assetClass, issuer] = row;
  CATALOG_BY_SYMBOL.set(symbol, { symbol, name, expense, assetClass, issuer });
}

export const ASSET_CLASS_LABELS: Record<EtfAssetClass, string> = {
  "us-equity": "US equity",
  "intl-equity": "International",
  "fixed-income": "Bonds",
  commodity: "Commodities",
  "real-estate": "Real estate",
  sector: "Sector",
  thematic: "Thematic",
  factor: "Dividend & factor",
  "leveraged-inverse": "Leveraged / inverse",
};

export function catalogEntryBySymbol(symbol: string): EtfCatalogEntry | undefined {
  return CATALOG_BY_SYMBOL.get(symbol.trim().toUpperCase());
}

export function classifyEtfAssetClass(name: string): EtfAssetClass {
  if (/bond|treasury|muni|tips|yield|loan|clo|aggregate|credit/i.test(name)) return "fixed-income";
  if (/international|emerging|eafe|world ex|global|europe|japan|china|india|brazil|mexico|canada|uk|hedged equity/i.test(name))
    return "intl-equity";
  if (/gold|silver|oil|gas|commodity|uranium|lithium|copper|metal|timber|water|infrastructure|reit|real estate|mlp/i.test(name))
    return /reit|real estate/i.test(name) ? "real-estate" : "commodity";
  if (/ultra|ultrapro|bear|bull 3x|short |inverse|vix/i.test(name)) return "leveraged-inverse";
  if (/sector|semiconductor|biotech|bank|energy|tech|health|financial|utility|material|industrial|aerospace|defense|cyber|software|retail/i.test(name))
    return "sector";
  if (/bitcoin|ethereum|crypto|blockchain|innovation|robot|ai |artificial|clean|solar|wind|esg|metaverse|gaming|space|cloud|fintech|genomic|ark /i.test(name))
    return "thematic";
  if (/dividend|momentum|quality|value factor|low vol|moat|factor|multifactor|equal weight garp/i.test(name))
    return "factor";
  return "us-equity";
}

const ASSET_CLASS_THEMES: Record<EtfAssetClass, ThemeId[]> = {
  "us-equity": ["compounders", "cash-flow-defensives"],
  "intl-equity": ["global-diversification"],
  "fixed-income": ["cash-flow-defensives"],
  commodity: ["cash-flow-defensives"],
  "real-estate": ["income"],
  sector: [],
  thematic: [],
  factor: [],
  "leveraged-inverse": [],
};

/** Keyword→theme mapping for catalog ETFs. More specific rules win. */
function inferThemesFromName(name: string, assetClass: EtfAssetClass): ThemeId[] {
  const themes = new Set(ASSET_CLASS_THEMES[assetClass] ?? []);
  const n = name.toLowerCase();

  if (/semiconductor|chip|nvidia/i.test(n)) themes.add("ai-infrastructure");
  if (/ai |artificial|robot|autonomous/i.test(n)) themes.add("ai-infrastructure").add("emerging-tech");
  if (/cyber|security|firewall/i.test(n)) themes.add("cybersecurity");
  if (/solar|wind|clean energy|renewable|green|low carbon/i.test(n)) themes.add("clean-energy");
  if (/biotech|genomic|pharma|drug/i.test(n)) themes.add("biotech");
  if (/health|medical|hospital/i.test(n)) themes.add("aging-demographics").add("cash-flow-defensives");
  if (/dividend|income|yield|covered call|preferred|bdc/i.test(n)) themes.add("income");
  if (/dividend growth|dividend apprec/i.test(n)) themes.add("income").add("compounders");
  if (/consumer staple|food|beverage/i.test(n)) themes.add("consumer-staples");
  if (/fintech|payment|digital wallet/i.test(n)) themes.add("fintech");
  if (/infrastructure|utility/i.test(n)) themes.add("cash-flow-defensives");
  if (/real estate|reit|property/i.test(n)) themes.add("income");
  if (/gold|silver|metal|miner|commodity|oil|gas|natural resource|uranium|lithium|copper/i.test(n)) themes.add("cash-flow-defensives");
  if (/emerging market|frontier|china|india|brazil|mexico|indonesia|thailand|philippines|malaysia|south africa|turkey|chile|peru|saudi|qatar|uae/i.test(n)) themes.add("global-diversification");
  if (/international|global|world|eafe|europe|japan|pacific|australia|canada|germany|france|spain|italy|sweden|switzerland|netherlands|norway/i.test(n)) themes.add("global-diversification");
  if (/innovation|disruptive|thematic|space|gaming|esport|cloud|blockchain|bitcoin|ethereum|crypto/i.test(n)) themes.add("emerging-tech");
  if (/bond|treasury|tips|muni|aggregate|corporate bond|high yield|junk|senior loan|clo|mortgage/i.test(n)) themes.add("cash-flow-defensives");
  if (/defense|aerospace/i.test(n)) themes.add("cash-flow-defensives");

  return [...themes];
}

/** Build a minimal ETF record for navigation, watchlist, and duel (no overlap holdings). */
export function catalogEntryToEtf(entry: EtfCatalogEntry): ETF {
  const fee =
    entry.expense != null
      ? `${entry.expense}% expense ratio`
      : "Verify expense ratio on the issuer prospectus";
  const themes = inferThemesFromName(entry.name, entry.assetClass);
  const themeNote = themes.length
    ? `Catalog entry — auto-matched to ${themes.length} theme${themes.length > 1 ? "s" : ""}.`
    : `Catalog entry — no curated themes yet.`;
  return enrichEtfTags(
    {
      symbol: entry.symbol,
      name: entry.name,
      expense: entry.expense ?? 0,
      themes,
      tags: [],
      description: `${entry.name} (${entry.symbol}), US-listed ETF. ${fee}. ${themeNote} Open the issuer fund page for holdings, risks, and official documents.`,
      holdings: [],
    },
    entry.assetClass
  );
}

export function searchCatalogEtfs(
  query: string,
  options?: {
    assetClass?: EtfAssetClass | "all";
    maxExpense?: number | null;
    limit?: number;
    excludeSymbols?: Set<string>;
  }
): EtfCatalogEntry[] {
  const q = query.trim().toLowerCase();
  const limit = options?.limit ?? 80;
  const exclude = options?.excludeSymbols ?? new Set<string>();
  let list = [...CATALOG_BY_SYMBOL.values()].filter((e) => !exclude.has(e.symbol));

  if (options?.assetClass && options.assetClass !== "all") {
    list = list.filter((e) => e.assetClass === options.assetClass);
  }

  if (options?.maxExpense != null) {
    list = list.filter((e) => e.expense != null && e.expense <= options.maxExpense!);
  }

  if (q) {
    list = list.filter(
      (e) =>
        e.symbol.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.issuer?.toLowerCase().includes(q) ?? false)
    );
  }

  list.sort((a, b) => {
    if (q) {
      const aExact = a.symbol.toLowerCase() === q ? 0 : 1;
      const bExact = b.symbol.toLowerCase() === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aStart = a.symbol.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.symbol.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
    }
    const ea = a.expense ?? 999;
    const eb = b.expense ?? 999;
    if (ea !== eb) return ea - eb;
    return a.symbol.localeCompare(b.symbol);
  });

  return list.slice(0, limit);
}

export function catalogSymbols(): string[] {
  return [...CATALOG_BY_SYMBOL.keys()];
}
