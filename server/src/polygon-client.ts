/**
 * Market data REST client, Polygon.io rebranded as Massive.com (Oct 2025).
 * Same API keys and paths; default base is api.massive.com.
 * @see https://massive.com/blog/polygon-is-now-massive
 */

const DEFAULT_BASE = "https://api.massive.com";
const LEGACY_BASE = "https://api.polygon.io";

function marketApiBase(): string {
  const custom = process.env.MASSIVE_API_BASE?.trim() || process.env.POLYGON_API_BASE?.trim();
  if (custom) return custom.replace(/\/$/, "");
  const host = (process.env.MASSIVE_API_HOST ?? "massive").toLowerCase();
  return host === "polygon" ? LEGACY_BASE : DEFAULT_BASE;
}

/** Massive.com key (preferred) or legacy POLYGON_API_KEY, same credential. */
export function polygonApiKey(): string | null {
  const key =
    process.env.MASSIVE_API_KEY?.trim() || process.env.POLYGON_API_KEY?.trim();
  return key || null;
}

export function isPolygonConfigured(): boolean {
  return Boolean(polygonApiKey());
}

export function preferPolygonMarketData(): boolean {
  if (!isPolygonConfigured()) return false;
  const provider = (process.env.MARKET_DATA_PROVIDER ?? "polygon").toLowerCase();
  return provider !== "yahoo";
}

export class PolygonApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function polygonGet<T = Record<string, unknown>>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const key = polygonApiKey();
  if (!key) {
    throw new PolygonApiError(
      503,
      "MASSIVE_API_KEY (or POLYGON_API_KEY) not configured on server"
    );
  }

  const url = new URL(`${marketApiBase()}${path}`);
  url.searchParams.set("apiKey", key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new PolygonApiError(res.status, text.slice(0, 200) || "Invalid market API response");
  }

  if (!res.ok) {
    const errBody = data as { message?: string; error?: string };
    const msg =
      errBody.message || errBody.error || text.slice(0, 200) || `Market API ${res.status}`;
    throw new PolygonApiError(res.status, msg);
  }

  const status = (data as { status?: string }).status;
  if (status === "ERROR") {
    const errBody = data as { error?: string; message?: string };
    throw new PolygonApiError(502, errBody.error || errBody.message || "Market API error");
  }

  return data;
}

/** Class shares often use dots (BRK.B); keep user symbol for display. */
export function polygonTickerSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}
