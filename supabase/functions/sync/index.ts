// Sync — upserts the client Zustand store into Supabase.
// users row: profile blob + theme ids + onboarding state.
// decisions rows: journal entries (type 'duel') and portfolio holdings
// (type 'portfolio_add'), deduplicated by their client-generated id.
// All DB access goes through a client bound to the caller's JWT, so RLS
// guarantees a user can only ever write their own rows.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

const ONBOARDING_STATES = new Set(["not-started", "in-progress", "complete"]);
const MAX_ROWS = 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    },
  );

  const { data: userData } = await db.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const profile =
    body.profile && typeof body.profile === "object" ? body.profile : {};
  const themeIds = Array.isArray(body.themeIds)
    ? body.themeIds.filter((t) => typeof t === "string").slice(0, 24)
    : [];
  const onboarding = ONBOARDING_STATES.has(String(body.onboarding))
    ? String(body.onboarding)
    : "not-started";

  const { error: userErr } = await db.from("users").upsert(
    {
      id: user.id,
      profile,
      theme_ids: themeIds,
      onboarding_state: onboarding,
    },
    { onConflict: "id" },
  );
  if (userErr) return json({ error: "User sync failed" }, 500);

  // Deduplicate decisions by the client-generated entry id stored in data.id.
  const { data: existing } = await db
    .from("decisions")
    .select("entry_id:data->>id")
    .eq("user_id", user.id)
    .limit(5000);
  const have = new Set(
    (existing ?? []).map((r: { entry_id: string | null }) => r.entry_id),
  );

  type IncomingEntry = { id?: unknown } & Record<string, unknown>;
  const journal = (Array.isArray(body.journal) ? body.journal : [])
    .slice(0, MAX_ROWS) as IncomingEntry[];
  const portfolio = (Array.isArray(body.portfolio) ? body.portfolio : [])
    .slice(0, MAX_ROWS) as IncomingEntry[];

  const rows = [
    ...journal
      .filter((j) => j && typeof j.id === "string" && !have.has(j.id))
      .map((j) => ({ user_id: user.id, type: "duel", data: j })),
    ...portfolio
      .filter((h) => h && typeof h.id === "string" && !have.has(h.id))
      .map((h) => ({ user_id: user.id, type: "portfolio_add", data: h })),
  ];

  if (rows.length > 0) {
    const { error: decErr } = await db.from("decisions").insert(rows);
    if (decErr) return json({ error: "Decision sync failed" }, 500);
  }

  return json({ ok: true, inserted: rows.length });
});
