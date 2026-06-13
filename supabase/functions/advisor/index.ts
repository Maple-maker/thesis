// Advisor — Pro-gated, strictly educational chat proxy.
// Flow: verify user → check tier (403 if not pro) → load context_cache
// (rebuild if > 30 min stale) → call OpenRouter (Nemotron) with a hard
// educational system prompt → guard the output for advice language →
// persist both messages to chat_history → return the reply.
// The OpenRouter key never leaves this function.
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

// Nemotron 3 Super (120B MoE, 12B active) — same NVIDIA family / free tier /
// US infra as the spec'd Ultra 550B, but the Ultra free tier generates at
// >2 min per reply, which is unusable for chat. Super answers in ~15–30 s.
// Nano 30B is the automatic fallback when Super errors or rate-limits.
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const FALLBACK_MODELS = [MODEL, "nvidia/nemotron-3-nano-30b-a3b:free"];
const CONTEXT_STALE_MS = 30 * 60 * 1000;
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 10;

type ContextBlob = {
  profile?: Record<string, unknown>;
  themeIds?: string[];
  portfolio?: Array<Record<string, unknown>>;
  recentJournal?: Array<Record<string, unknown>>;
  reasonPatterns?: Array<{ reason: string; count: number; pct: number }>;
  lastAdvisorTopics?: string[];
};

function systemPrompt(ctx: ContextBlob): string {
  const profile = ctx.profile ?? {};
  const holdings = (ctx.portfolio ?? [])
    .map((h) => `${h.symbol ?? "?"} (reason: ${h.reason ?? "none"})`)
    .slice(0, 20)
    .join(", ");
  const journal = (ctx.recentJournal ?? [])
    .slice(0, 8)
    .map((j) => `${j.winner ?? "?"} over ${j.loser ?? "?"} — ${j.reason ?? "?"}`)
    .join("; ");
  const patterns = (ctx.reasonPatterns ?? [])
    .map((p) => `${p.reason}: ${p.pct}%`)
    .join(", ");

  return `You are the Thesis Advisor, a strictly educational AI built into the Thesis investing app.

USER PROFILE:
- Investment horizon: ${profile.horizon ?? "unknown"}
- Risk tolerance: ${profile.risk ?? "unknown"}
- Primary goal: ${profile.primaryGoal ?? "unknown"}
- Drawdown reaction: ${profile.reactionToDrawdown ?? "unknown"}
- Top themes: ${(ctx.themeIds ?? []).join(", ") || "none yet"}
- Portfolio holdings with their stated reasons: ${holdings || "none yet"}
- Recent duel decisions: ${journal || "none yet"}
- Decision reason patterns: ${patterns || "none yet"}
- Recent advisor topics: ${(ctx.lastAdvisorTopics ?? []).join(", ") || "none"}

RULES (non-negotiable):
1. Never tell the user to buy, sell, invest in, rotate into, or exit any security or asset. Never use those verbs as instructions.
2. Never give price targets, entry or exit points, or timing language that creates urgency ("now is a good time to").
3. Always frame answers around the user's specific profile, themes, and journal — teach through their own data.
4. If asked for a recommendation or price target, decline warmly and redirect to the educational frame: explain how someone could research that question themselves.
5. Flag tensions between the user's stated profile and their question (e.g. panic-sell drawdown reaction + interest in high-volatility themes).
6. End every substantive answer with either a research question for the user or a concept suggestion formatted exactly as "Learn: [concept name]" on its own line.
7. You are an educational tool, not a licensed financial advisor — when a question approaches personal financial advice, say so plainly and reframe to education.

TONE: Calm, intellectually honest, like a knowledgeable friend who happens to understand markets — not a salesperson, not a Bloomberg terminal. Plain English; explain jargon when you use it.

DISCLAIMER: All output is educational. Nothing here constitutes financial advice.`;
}

// Output guard — if the model slips into directive advice anyway, replace the
// reply rather than ship it.
const ADVICE_PATTERNS = [
  /\byou (?:should|need to|ought to|must|have to) (?:buy|sell|invest|rotate|exit|enter|short|dump|load up)\b/i,
  /\b(?:buy|sell|short) (?:it|this|now|the stock|shares?|some|more)\b/i,
  /\bnow is (?:a good|the right|the perfect) time to\b/i,
  /\bprice target (?:of|is|at) \$?\d/i,
  /\bI (?:recommend|suggest) (?:buying|selling|investing in|shorting)\b/i,
];

function violatesAdviceRules(text: string): boolean {
  return ADVICE_PATTERNS.some((re) => re.test(text));
}

const GUARDED_REPLY =
  "I can't point you toward a specific trade — Thesis is an educational tool, " +
  "not a financial advisor. What I can do is help you understand the forces " +
  "behind the question: the business model, the risks, how it fits the themes " +
  "you've chosen, and what would have to be true for your thesis to hold. " +
  "What part of the underlying story would you like to dig into?\n\nLearn: How to evaluate a thesis";

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

  // Pro gate — hard 403 for free users.
  const { data: userRow } = await db
    .from("users")
    .select("tier")
    .eq("id", user.id)
    .maybeSingle();
  if (userRow?.tier !== "pro") {
    return json({ error: "Advisor is a Pro feature" }, 403);
  }

  let message = "";
  let history: Array<{ role: string; content: string }> = [];
  try {
    const body = await req.json();
    message = String(body?.message ?? "").trim();
    if (Array.isArray(body?.conversation_history)) {
      history = body.conversation_history
        .filter(
          (m: { role?: unknown; content?: unknown }) =>
            (m?.role === "user" || m?.role === "assistant") &&
            typeof m?.content === "string",
        )
        .slice(-MAX_HISTORY)
        .map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content.slice(0, MAX_MESSAGE_CHARS),
        }));
    }
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!message) return json({ error: "Message required" }, 400);
  if (message.length > MAX_MESSAGE_CHARS) {
    return json({ error: "Message too long" }, 400);
  }

  // Load context, rebuilding inline when stale or missing.
  const { data: cacheRow } = await db
    .from("context_cache")
    .select("context_blob, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  let ctx = (cacheRow?.context_blob ?? null) as ContextBlob | null;
  const stale =
    !cacheRow ||
    Date.now() - new Date(cacheRow.updated_at).getTime() > CONTEXT_STALE_MS;

  if (stale) {
    const [{ data: profileRow }, { data: decisions }] = await Promise.all([
      db
        .from("users")
        .select("profile, theme_ids")
        .eq("id", user.id)
        .maybeSingle(),
      db
        .from("decisions")
        .select("type, data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    const all = decisions ?? [];
    const counts = new Map<string, number>();
    let total = 0;
    for (const d of all) {
      const reason = (d.data as Record<string, unknown>)?.reason;
      if (typeof reason !== "string" || !reason) continue;
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
      total += 1;
    }
    ctx = {
      profile: (profileRow?.profile ?? {}) as Record<string, unknown>,
      themeIds: profileRow?.theme_ids ?? [],
      portfolio: all
        .filter((d) => d.type === "portfolio_add")
        .map((d) => d.data as Record<string, unknown>)
        .slice(0, 50),
      recentJournal: all
        .filter((d) => d.type === "duel")
        .map((d) => d.data as Record<string, unknown>)
        .slice(0, 20),
      reasonPatterns: [...counts.entries()].map(([reason, count]) => ({
        reason,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      })),
      lastAdvisorTopics: [],
    };
    await db.from("context_cache").upsert(
      {
        user_id: user.id,
        context_blob: ctx,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY") ?? "";
  if (!openRouterKey) return json({ error: "Advisor not configured" }, 503);

  let reply = "";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://thesis-app.com",
        "X-Title": "Thesis Investing Education",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        models: FALLBACK_MODELS,
        // Nemotron 3 is a reasoning family; without this the reasoning trace
        // consumes most of max_tokens and replies arrive truncated and slow.
        reasoning: { enabled: false },
        messages: [
          { role: "system", content: systemPrompt(ctx ?? {}) },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 1024,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(50_000),
    });
    if (!res.ok) {
      return json({ error: "Advisor model unavailable" }, 502);
    }
    // OpenRouter prepends keep-alive padding before the JSON body on slow
    // generations — res.json() would throw, so strip to the first brace.
    const raw = await res.text();
    const braceAt = raw.indexOf("{");
    if (braceAt < 0) return json({ error: "Malformed model response" }, 502);
    const payload = JSON.parse(raw.slice(braceAt));
    reply = String(payload?.choices?.[0]?.message?.content ?? "").trim();
  } catch {
    return json({ error: "Advisor request timed out" }, 504);
  }

  if (!reply) return json({ error: "Empty advisor response" }, 502);
  if (violatesAdviceRules(reply)) reply = GUARDED_REPLY;

  // Persist the exchange. Topic = first ~6 words of the question.
  const topic = message.split(/\s+/).slice(0, 6).join(" ").slice(0, 80);
  await db.from("chat_history").insert([
    { user_id: user.id, role: "user", content: message, topic },
    { user_id: user.id, role: "assistant", content: reply, topic },
  ]);

  return json({ reply });
});
