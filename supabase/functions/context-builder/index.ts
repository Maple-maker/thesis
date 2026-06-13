// Context builder — assembles the advisor's per-user memory blob:
// profile + themes + portfolio + recent journal + aggregated reason patterns
// + recent advisor topics. Upserts to context_cache so the advisor function
// can load one row instead of re-querying everything per message.
// RLS-bound client: each user can only build their own context.
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

type DecisionRow = {
  type: string;
  created_at: string;
  data: Record<string, unknown>;
};

function buildReasonPatterns(decisions: DecisionRow[]) {
  const counts = new Map<string, number>();
  let total = 0;
  for (const d of decisions) {
    const reason = d.data?.reason;
    if (typeof reason !== "string" || !reason) continue;
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
    total += 1;
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

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

  const [{ data: profileRow }, { data: decisions }, { data: chats }] =
    await Promise.all([
      db
        .from("users")
        .select("profile, theme_ids, onboarding_state, tier")
        .eq("id", user.id)
        .maybeSingle(),
      db
        .from("decisions")
        .select("type, created_at, data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
      db
        .from("chat_history")
        .select("topic, created_at")
        .eq("user_id", user.id)
        .not("topic", "is", null)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const allDecisions = (decisions ?? []) as DecisionRow[];
  const portfolio = allDecisions
    .filter((d) => d.type === "portfolio_add")
    .map((d) => d.data)
    .slice(0, 50);
  const recentJournal = allDecisions
    .filter((d) => d.type === "duel")
    .map((d) => d.data)
    .slice(0, 20);

  const lastAdvisorTopics = [
    ...new Set((chats ?? []).map((c) => String(c.topic))),
  ].slice(0, 5);

  const blob = {
    profile: profileRow?.profile ?? {},
    themeIds: profileRow?.theme_ids ?? [],
    tier: profileRow?.tier ?? "free",
    portfolio,
    recentJournal,
    reasonPatterns: buildReasonPatterns(allDecisions),
    // Volatility-tension detection needs the stock catalog, which lives on the
    // client (src/lib/portfolio-health.ts). The client may sync flags later.
    tensionsActive: [],
    lastAdvisorTopics,
    builtAt: new Date().toISOString(),
  };

  const { error: upsertErr } = await db.from("context_cache").upsert(
    {
      user_id: user.id,
      context_blob: blob,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upsertErr) return json({ error: "Context cache write failed" }, 500);

  return json(blob);
});
