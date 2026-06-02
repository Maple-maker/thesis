/** Sector/thematic ETF examples for educational CFO answers, not buy lists. */
export type SectorEtf = {
  symbol: string;
  name: string;
  expense: number;
  blurb: string;
};

export const SECTOR_ETF_MAP: Record<string, SectorEtf[]> = {
  defense: [
    {
      symbol: "ITA",
      name: "iShares U.S. Aerospace & Defense",
      expense: 0.4,
      blurb: "U.S. defense primes and aerospace.",
    },
    {
      symbol: "XAR",
      name: "SPDR S&P Aerospace & Defense",
      expense: 0.35,
      blurb: "Equal-weight aerospace & defense.",
    },
    {
      symbol: "PPA",
      name: "Invesco Aerospace & Defense",
      expense: 0.58,
      blurb: "Cap-weighted defense basket, compare overlap vs ITA.",
    },
  ],
  cybersecurity: [
    {
      symbol: "CIBR",
      name: "First Trust Nasdaq Cybersecurity",
      expense: 0.6,
      blurb: "Cybersecurity tilt, pairs with a “Defense Layer” digital theme.",
    },
    {
      symbol: "HACK",
      name: "ETFMG Prime Cyber Security",
      expense: 0.6,
      blurb: "Alternative cyber basket, often volatile.",
    },
  ],
  commodities: [
    {
      symbol: "COPX",
      name: "Global X Copper Miners",
      expense: 0.65,
      blurb: "Copper miners, tied to electrification, grid build-out, and industrial demand.",
    },
    {
      symbol: "GLDM",
      name: "SPDR Gold MiniShares",
      expense: 0.1,
      blurb: "Physical gold exposure, often used as inflation/geopolitical hedge, not growth.",
    },
    {
      symbol: "PICK",
      name: "iShares MSCI Global Metals & Mining",
      expense: 0.39,
      blurb: "Broad miners (iron ore, diversified metals), iron/steel demand is embedded here.",
    },
    {
      symbol: "SLX",
      name: "VanEck Steel",
      expense: 0.56,
      blurb: "Steel producers, closer to iron/steel cycle than single-commodity funds.",
    },
  ],
  rare_earth: [
    {
      symbol: "REMX",
      name: "VanEck Rare Earth/Strategic Metals",
      expense: 0.58,
      blurb: "Miners/refiners tied to rare earths and strategic metals, high volatility, policy risk.",
    },
    {
      symbol: "COPX",
      name: "Global X Copper Miners",
      expense: 0.65,
      blurb: "Often grouped with “critical minerals” thesis, China refining bottleneck affects many chains.",
    },
  ],
  tech: [
    {
      symbol: "QQQ",
      name: "Invesco QQQ",
      expense: 0.2,
      blurb: "Nasdaq-100 growth tilt.",
    },
    {
      symbol: "XLK",
      name: "Technology Select Sector SPDR",
      expense: 0.09,
      blurb: "S&P 500 technology sector.",
    },
  ],
  dividend: [
    {
      symbol: "SCHD",
      name: "Schwab US Dividend Equity",
      expense: 0.06,
      blurb: "Quality dividend growers.",
    },
    {
      symbol: "VIG",
      name: "Vanguard Dividend Appreciation",
      expense: 0.06,
      blurb: "Rising-dividend companies.",
    },
  ],
};

const SECTOR_LABELS: Record<string, string> = {
  defense: "defense & aerospace",
  cybersecurity: "cybersecurity",
  commodities: "commodities & industrial metals",
  rare_earth: "rare earth / strategic metals",
  tech: "technology",
  dividend: "dividend equity",
};

export function sectorFromQuery(q: string): string | null {
  const lower = q.toLowerCase();
  if (/rare.?earth|strategic metal|\bree\b|neodymium|bottleneck/i.test(lower) && /metal|earth|mineral|etf|exposure|commodit/i.test(lower)) {
    return "rare_earth";
  }
  if (/defense|aerospace|military|weapon/i.test(lower)) return "defense";
  if (/cyber|security|hacking/i.test(lower)) return "cybersecurity";
  if (/copper|gold|iron|silver|commodit|metal|mining|steel|lithium|oil|gas|exposure to/i.test(lower)) {
    return "commodities";
  }
  if (/tech|semiconductor|ai\b|software/i.test(lower)) return "tech";
  if (/dividend|income|yield/i.test(lower) && /etf/i.test(lower)) return "dividend";
  return null;
}

/** Merge ETF picks for multi-theme commodity questions (deduped). */
export function etfsForCommodityQuestion(q: string): { sector: string; etfs: SectorEtf[] }[] {
  const lower = q.toLowerCase();
  const sectors: string[] = [];
  const rareEarth = /rare.?earth|bottleneck|strategic metal/i.test(lower);
  const namedCommodities = /copper|gold|iron|silver|commodit|steel|lithium|oil|gas/i.test(lower);

  if (rareEarth) sectors.push("rare_earth");
  if (namedCommodities || (/exposure|mining|metal/i.test(lower) && !rareEarth)) {
    if (!sectors.includes("commodities")) sectors.push("commodities");
  }
  if (!sectors.length) {
    const one = sectorFromQuery(q);
    if (one) sectors.push(one);
  }

  const seen = new Set<string>();
  const out: { sector: string; etfs: SectorEtf[] }[] = [];
  for (const s of sectors) {
    const list = SECTOR_ETF_MAP[s] ?? [];
    const picked: SectorEtf[] = [];
    for (const e of list) {
      if (seen.has(e.symbol)) continue;
      seen.add(e.symbol);
      picked.push(e);
      if (picked.length >= 4) break;
    }
    if (picked.length) out.push({ sector: s, etfs: picked });
  }
  return out.slice(0, 2);
}

export function sectorLabel(sector: string): string {
  return SECTOR_LABELS[sector] ?? sector;
}
