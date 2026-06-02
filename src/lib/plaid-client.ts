import { isBackendConfigured } from "./thesis-api";

const API_URL = process.env.EXPO_PUBLIC_THESIS_API_URL?.replace(/\/$/, "");
const APP_KEY = process.env.EXPO_PUBLIC_THESIS_APP_KEY ?? "";

async function apiPost<T>(path: string, body: object): Promise<T> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_THESIS_API_URL not configured");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(APP_KEY ? { "X-Thesis-App-Key": APP_KEY } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t.slice(0, 200));
  }
  return res.json() as Promise<T>;
}

export type LinkTokenResponse = { link_token: string; expiration: string };

/** Step 1, get Plaid Link token (server uses PLAID_SECRET). */
export async function createPlaidLinkToken(userId: string): Promise<LinkTokenResponse> {
  return apiPost("/v1/plaid/link-token", { userId });
}

/** Step 2, exchange public_token after Link success. */
export async function exchangePlaidToken(
  userId: string,
  publicToken: string
): Promise<{ item_id: string; accounts_synced: number }> {
  return apiPost("/v1/plaid/exchange", { userId, public_token: publicToken });
}

/** Trigger sync (holdings + balances). */
export async function syncPlaidAccounts(userId: string): Promise<{
  ok: boolean;
  accounts: any[];
  holdings: any[];
  item_id: string;
}> {
  return apiPost("/v1/plaid/sync", { userId });
}

export function isPlaidBackendReady(): boolean {
  return isBackendConfigured();
}
