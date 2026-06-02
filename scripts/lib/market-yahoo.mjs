/**
 * Shared Yahoo Finance helpers for catalog generation and server search.
 */
import yahooFinance from "yahoo-finance2";

export { yahooFinance };
yahooFinance.suppressNotices?.(["yahooSurvey"]);

const US_EXCHANGES = new Set(["NMS", "NYQ", "NGM", "ASE", "PCX", "BTS", "NCM", "NYM"]);

/** @param {string} name */
export function classifyEtfAssetClass(name) {
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

/** @param {string|undefined} sector */
export function mapYahooSector(sector) {
  const s = (sector ?? "").toLowerCase();
  if (s.includes("technology")) return "Technology";
  if (s.includes("energy")) return "Energy";
  if (s.includes("health")) return "Healthcare";
  if (s.includes("financial")) return "Financials";
  if (s.includes("consumer")) return "Consumer";
  if (s.includes("industrial")) return "Industrials";
  if (s.includes("basic material") || s.includes("material")) return "Materials";
  if (s.includes("utilit")) return "Utilities";
  if (s.includes("real estate")) return "Real Estate";
  if (s.includes("communication")) return "Communication";
  return "Technology";
}

/** @param {import('yahoo-finance2').Quote} q */
export function quoteToEtfRow(q) {
  const name = q.shortName || q.longName || q.symbol;
  const expense =
    q.annualReportExpenseRatio != null
      ? Math.round(q.annualReportExpenseRatio * 10000) / 100
      : null;
  return [q.symbol, name, expense, classifyEtfAssetClass(name), "other"];
}

/** @param {import('yahoo-finance2').Quote} q */
export function quoteToStockRow(q) {
  const name = q.shortName || q.longName || q.symbol;
  const capB =
    q.marketCap != null ? Math.round((q.marketCap / 1e9) * 10) / 10 : null;
  return [q.symbol, name, mapYahooSector(q.sector), capB];
}

/** @param {import('yahoo-finance2').Quote} q */
export function isUsListed(q) {
  if (!q.symbol || !q.exchange) return false;
  if (!US_EXCHANGES.has(q.exchange)) return false;
  if (/[^A-Z0-9.-]/.test(q.symbol)) return false;
  if (q.symbol.includes(".") && !q.symbol.endsWith(".A") && !q.symbol.endsWith(".B")) return false;
  return true;
}

/**
 * @param {string[]} symbols
 * @param {{ delayMs?: number; retries?: number; chunkSize?: number; sequential?: boolean }} opts
 */
export async function quoteBatch(symbols, opts = {}) {
  const delayMs = opts.delayMs ?? 2500;
  const retries = opts.retries ?? 4;
  const chunkSize = Math.max(1, opts.chunkSize ?? 8);

  if (opts.sequential) {
    const out = [];
    for (const sym of symbols) {
      const part = await quoteBatch([sym], { delayMs, retries, chunkSize: 1 });
      out.push(...part);
    }
    return out;
  }

  const all = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    const part = await quoteChunk(chunk, { delayMs, retries });
    all.push(...part);
  }
  return all;
}

/**
 * @param {string[]} symbols
 * @param {{ delayMs?: number; retries?: number }} opts
 */
async function quoteChunk(symbols, opts = {}) {
  const delayMs = opts.delayMs ?? 2500;
  const retries = opts.retries ?? 4;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const results = await yahooFinance.quote(symbols);
      const list = Array.isArray(results) ? results : [results];
      if (delayMs > 0) await sleep(delayMs);
      return list.filter(Boolean);
    } catch (err) {
      const msg = String(err?.message ?? err);
      if (attempt < retries - 1 && /too many|429|rate|valid json/i.test(msg)) {
        const wait = Math.min(90_000, 4000 * (attempt + 1));
        await sleep(wait);
        continue;
      }
      if (/too many|429|rate|valid json/i.test(msg) && symbols.length > 1) {
        const out = [];
        for (const sym of symbols) {
          const part = await quoteChunk([sym], { delayMs, retries: 2 });
          out.push(...part);
          if (delayMs > 0) await sleep(delayMs);
        }
        return out;
      }
      throw err;
    }
  }
  return [];
}

/** @param {string} query @param {number} limit */
export async function searchYahoo(query, limit = 12) {
  const q = query.trim();
  if (!q) return [];
  const res = await yahooFinance.search(q, { quotesCount: limit, newsCount: 0 });
  return (res.quotes ?? []).filter((x) => x.symbol && x.quoteType);
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
