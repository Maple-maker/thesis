/** US Treasury daily yield curve XML, no API key required. */

export type TreasuryYield = {
  asOf: string;
  year2: number | null;
  year10: number | null;
  spread10y2y: number | null;
  source: "treasury";
};

let cache: { at: number; data: TreasuryYield } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000;

const XML_URL =
  "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value=all";

function parseRate(raw: string | undefined): number | null {
  if (!raw || raw === "N/A") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseEntry(xml: string): { date: Date; year2: number | null; year10: number | null } | null {
  const dateRaw =
    xml.match(/<d:NEW_DATE[^>]*>([^<]+)</i)?.[1] ??
    xml.match(/<NEW_DATE>([^<]+)</i)?.[1];
  if (!dateRaw) return null;

  const date = new Date(dateRaw.trim());
  if (Number.isNaN(date.getTime())) return null;

  const y2 = parseRate(
    xml.match(/<d:BC_2YEAR[^>]*>([^<]+)</i)?.[1] ?? xml.match(/<BC_2YEAR>([^<]+)</i)?.[1]
  );
  const y10 = parseRate(
    xml.match(/<d:BC_10YEAR[^>]*>([^<]+)</i)?.[1] ?? xml.match(/<BC_10YEAR>([^<]+)</i)?.[1]
  );

  return { date, year2: y2, year10: y10 };
}

export async function fetchTreasuryYields(): Promise<TreasuryYield | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  try {
    const res = await fetch(XML_URL, {
      headers: { Accept: "application/xml,text/xml" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`[treasury] HTTP ${res.status}`);
      return null;
    }
    const text = await res.text();
    const entries = text.split(/<entry>/i).slice(1);
    if (!entries.length) return null;

    let best: { date: Date; year2: number | null; year10: number | null } | null = null;
    for (const chunk of entries) {
      const parsed = parseEntry(chunk);
      if (!parsed) continue;
      if (!best || parsed.date > best.date) best = parsed;
    }
    if (!best) return null;

    const asOf = best.date.toISOString().slice(0, 10);
    const spread10y2y =
      best.year2 != null && best.year10 != null
        ? Math.round((best.year10 - best.year2) * 100) / 100
        : null;

    const latest: TreasuryYield = {
      asOf,
      year2: best.year2,
      year10: best.year10,
      spread10y2y,
      source: "treasury",
    };
    cache = { at: Date.now(), data: latest };
    return latest;
  } catch (e) {
    console.warn("[treasury] fetch failed", e);
    return null;
  }
}
