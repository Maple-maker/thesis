/** FRED (Federal Reserve Economic Data), requires free API key: https://fred.stlouisfed.org/docs/api/api_key.html */

export type FredObservation = {
  seriesId: string;
  label: string;
  value: number;
  units: string;
  asOf: string;
  source: "fred";
};

const CACHE = new Map<string, { at: number; data: FredObservation }>();
const TTL_MS = 5 * 60 * 1000;

export function fredConfigured(): boolean {
  const k = process.env.FRED_API_KEY?.trim();
  return Boolean(k && k.length > 8);
}

export async function fetchFredLatest(
  seriesId: string,
  label: string,
  units: string
): Promise<FredObservation | null> {
  const key = process.env.FRED_API_KEY?.trim();
  if (!key) return null;

  const cacheKey = seriesId;
  const hit = CACHE.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", key);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "3");

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`[fred] ${seriesId} HTTP ${res.status}`);
    return null;
  }

  const data = (await res.json()) as {
    observations?: { date?: string; value?: string }[];
  };

  const obs = (data.observations ?? []).find(
    (o) => o.value != null && o.value !== "." && Number.isFinite(Number(o.value))
  );
  if (!obs?.date) return null;

  const result: FredObservation = {
    seriesId,
    label,
    value: Number(obs.value),
    units,
    asOf: obs.date,
    source: "fred",
  };
  CACHE.set(cacheKey, { at: Date.now(), data: result });
  return result;
}
