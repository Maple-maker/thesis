# Thesis — full technical integration spec

**Covers:** investor portraits (Higgsfield), live prices + charts, company logos, backend architecture, AI advisor context system
**Status:** Planning spec — break into slices before handing to Hermes

---

## Part 1 — Investor portraits (Higgsfield)

### Goal
Each investor lens card should show a stylized illustrated portrait in the style of the reference images you uploaded — flat black-and-white line drawings (images 1, 3, 4) or the more detailed colored style (image 2). These are generated once, stored as static assets, and never regenerated.

### How to generate them
Use Higgsfield's image generation via the Higgsfield MCP tools already connected in this project. The workflow:

1. Find a high-quality reference photo of each investor (public domain / press photos)
2. Use `Higgsfield:generate_image` with a prompt like: `"Flat black-and-white line art portrait illustration of [name], simple bold outlines, white background, minimal detail, friendly expression, head and shoulders, no text"` — style matches images 1/3/4 from the uploaded references
3. Download the generated image, save to `assets/investor-portraits/[id].png` in the repo
4. Reference via `require()` in `investor-lenses.ts` — no runtime API calls needed

### Investor list to generate
| ID | Name | Reference style note |
|----|------|---------------------|
| `buffett` | Warren Buffett | Black-and-white line art, suits, warm smile |
| `wood` | Cathie Wood | Black-and-white line art, professional, confident |
| `dalio` | Ray Dalio | Black-and-white line art, thoughtful expression |
| `lynch` | Peter Lynch | Black-and-white line art, casual, approachable |
| `graham` | Benjamin Graham | Black-and-white line art, scholarly, glasses |
| `simons` | Jim Simons | Black-and-white line art, relaxed, beard |

### Prompt template for each
```
Flat minimalist portrait illustration. Black bold outlines on white background. 
Head and shoulders only. Simple features, no detailed shading. 
Friendly, calm expression. Style: clean vector illustration, similar to a 
modern app avatar. Subject: [name], [brief description].
```

### In-app usage
```ts
// src/data/investor-lenses.ts
import buffettPortrait from "@/assets/investor-portraits/buffett.png";

export const INVESTOR_LENSES: InvestorLens[] = [
  {
    id: "buffett",
    portrait: buffettPortrait,  // local require, no network call
    // ...
  }
];
```

---

## Part 2 — Company logos

### Goal
Show a recognizable logo icon next to each stock ticker. Should work offline, load fast, and degrade gracefully.

### Recommended approach: Brandfetch CDN
Brandfetch provides a free CDN-hosted logo API. Format:
```
https://logo.clearbit.com/{domain}   (Clearbit — deprecated but still works)
https://cdn.brandfetch.io/{domain}   (preferred, higher quality)
```

Example:
- Apple: `https://cdn.brandfetch.io/apple.com/icon`
- Nvidia: `https://cdn.brandfetch.io/nvidia.com/icon`
- Tesla: `https://cdn.brandfetch.io/tesla.com/icon`

### Domain map
Add a `domain` field to each `Stock` in `src/data/stocks.ts`:
```ts
// Example additions to existing stock objects:
{ symbol: "NVDA", domain: "nvidia.com", ... }
{ symbol: "AAPL", domain: "apple.com", ... }
{ symbol: "TSLA", domain: "tesla.com", ... }
{ symbol: "MSFT", domain: "microsoft.com", ... }
{ symbol: "GOOGL", domain: "google.com", ... }
{ symbol: "AMZN", domain: "amazon.com", ... }
{ symbol: "COST", domain: "costco.com", ... }
{ symbol: "MA", domain: "mastercard.com", ... }
{ symbol: "V", domain: "visa.com", ... }
{ symbol: "CRWD", domain: "crowdstrike.com", ... }
```

### `LogoImage` component
```tsx
// src/components/ui/LogoImage.tsx
import { Image, View } from "react-native";

type Props = {
  domain?: string;
  symbol: string;
  size?: number;
  style?: object;
};

export function LogoImage({ domain, symbol, size = 32, style }: Props) {
  if (!domain) {
    // Fallback: ticker monogram circle
    return (
      <View style={[{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#D5E4DF",
        alignItems: "center",
        justifyContent: "center",
      }, style]}>
        <Text style={{ color: "#06483C", fontWeight: "800", fontSize: size * 0.38 }}>
          {symbol.slice(0, 2)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `https://cdn.brandfetch.io/${domain}/icon` }}
      style={[{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: "#F3F5F1",
      }, style]}
      defaultSource={require("@/assets/logo-placeholder.png")}
    />
  );
}
```

---

## Part 3 — Live prices and charts

### Price data: Polygon.io (already specced in slice-live-data-polygon.md)

**Quick recap for charts:**
- Use `GET /v2/aggs/ticker/{symbol}/range/1/day/{from}/{to}` for OHLCV candles
- Free tier: daily bars going back 2 years, 5 API calls/minute
- Cache on the server (Supabase Edge Function) with 15-minute TTL — never call Polygon directly from the app

### Chart library: Lightweight Charts (TradingView)
Open-source, MIT licensed, zero cost. Renders professional financial charts.

```bash
npm install lightweight-charts
```

```tsx
// src/components/ui/PriceChart.tsx
import { useEffect, useRef } from "react";
import { WebView } from "react-native-webview";

// Lightweight Charts runs in a WebView on React Native
// The chart HTML is injected as a string

type Candle = { time: string; open: number; high: number; low: number; close: number };

type Props = {
  symbol: string;
  candles: Candle[];
  height?: number;
  accentColor?: string;
};

export function PriceChart({ symbol, candles, height = 160, accentColor = "#0E7A66" }: Props) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
<style>body{margin:0;background:#F3F5F1}#chart{width:100%;height:${height}px}</style>
</head>
<body>
<div id="chart"></div>
<script>
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  width: window.innerWidth,
  height: ${height},
  layout: { background: { color: '#F3F5F1' }, textColor: '#8C988F' },
  grid: { vertLines: { visible: false }, horzLines: { color: '#EAEDE8' } },
  rightPriceScale: { borderVisible: false },
  timeScale: { borderVisible: false },
});
const series = chart.addAreaSeries({
  lineColor: '${accentColor}',
  topColor: '${accentColor}33',
  bottomColor: '${accentColor}05',
  lineWidth: 2,
});
series.setData(${JSON.stringify(candles)});
chart.timeScale().fitContent();
</script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={{ height, backgroundColor: "#F3F5F1" }}
      scrollEnabled={false}
      scalesPageToFit={false}
    />
  );
}
```

---

## Part 4 — Backend architecture

### Why Supabase (not a custom FastAPI)

The current backend is `127.0.0.1:8787` — a local proxy. For production you need:
1. A database that persists user data across devices
2. Auth (sign in / sign out)
3. API keys hidden server-side (Polygon, AI model)
4. Row-level security so User A can never see User B's data

Supabase gives you all four in one service, with a free tier that covers beta scale, and it integrates with Expo via the official `@supabase/supabase-js` SDK. It replaces the local proxy entirely.

### Stack decision
```
Database:    Supabase Postgres (free tier: 500MB, unlimited API calls)
Auth:        Supabase Auth (email + Apple Sign-in)
Backend:     Supabase Edge Functions (Deno/TypeScript, serverless)
AI model:    Groq (free tier, fast) — llama-3.3-70b or mixtral-8x7b
             Fallback: DeepSeek API (existing, cheap)
Prices:      Polygon.io (existing plan)
Logos:       Brandfetch CDN (free, no API key needed)
Charts:      Lightweight Charts (open source)
Portraits:   Static assets generated once via Higgsfield
```

### Why Groq for the AI advisor (free tier option)
Groq's free tier gives 14,400 requests/day at 6,000 tokens/min — enough for a beta. It's significantly faster than DeepSeek (tokens/second) which matters for chat UX. Models: `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`. Both are strong enough for educational financial Q&A.

API call is identical to OpenAI format:
```ts
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [...contextMessages, { role: "user", content: userMessage }],
    max_tokens: 1024,
    temperature: 0.4,
  }),
});
```

---

## Part 5 — The context system (the hard part)

This is what makes the Pro tier worth paying for. The AI advisor needs to know who it's talking to — not just the current session, but the user's entire decision history.

### What "context" means for Thesis

Every meaningful action a user takes becomes part of their context blob:

```ts
type UserContextBlob = {
  profile: UserProfile;           // questionnaire answers
  themeIds: string[];             // their thesis themes
  portfolio: PortfolioHolding[];  // holdings + their stated reasons
  recentJournal: JournalEntry[];  // last 20 duel decisions
  reasonPatterns: {               // aggregated: how often they pick each reason
    reason: JournalReason;
    count: number;
    pct: number;
  }[];
  tensionsActive: PortfolioTension[];  // current portfolio tensions
  lastAdvisorTopics: string[];    // last 5 conversation topics
};
```

### How context is built (Edge Function: `context-builder`)

```ts
// supabase/functions/context-builder/index.ts
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  const { user_id } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch all user data in parallel
  const [profile, portfolio, journal, chatTopics] = await Promise.all([
    supabase.from("users").select("profile").eq("id", user_id).single(),
    supabase.from("decisions").select("*").eq("user_id", user_id).eq("type", "portfolio"),
    supabase.from("decisions").select("*").eq("user_id", user_id).eq("type", "duel").order("created_at", { ascending: false }).limit(20),
    supabase.from("chat_history").select("topic").eq("user_id", user_id).order("created_at", { ascending: false }).limit(5),
  ]);

  // Build the context blob
  const context = buildContextBlob({
    profile: profile.data?.profile,
    portfolio: portfolio.data,
    journal: journal.data,
    chatTopics: chatTopics.data?.map(r => r.topic) ?? [],
  });

  // Cache it so the AI call doesn't need to rebuild every time
  await supabase.from("context_cache").upsert({
    user_id,
    context_blob: context,
    updated_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify(context), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### How context becomes the AI system prompt

```ts
function buildSystemPrompt(context: UserContextBlob): string {
  const { profile, portfolio, recentJournal, reasonPatterns, tensionsActive } = context;

  const holdingsText = portfolio.length > 0
    ? portfolio.map(h => `- ${h.symbol}: "${h.note || h.reason}"`).join("\n")
    : "No holdings yet.";

  const topReason = reasonPatterns[0];
  const gutPct = reasonPatterns.find(r => r.reason === "gut-feeling")?.pct ?? 0;

  const tensionText = tensionsActive.length > 0
    ? tensionsActive.map(t => `- ${t.symbolA} vs ${t.symbolB}: ${t.description}`).join("\n")
    : "No tensions detected.";

  return `You are the Thesis Advisor — a strictly educational AI built into the Thesis investing app.

CRITICAL RULES:
1. Never say: buy, sell, invest, rotate, enter a position, or take profit.
2. Always connect your answers to this user's specific profile and holdings.
3. End every answer with either a research question or a "Learn: [concept]" prompt.
4. If asked for a price target or recommendation, decline warmly and redirect to education.
5. Flag tensions between what the user says and what they do.
6. All output is educational only. Nothing constitutes financial advice.

USER PROFILE:
- Age: ${profile.age}, Horizon: ${profile.horizon}, Risk: ${profile.risk}
- Primary goal: ${profile.primaryGoal}
- Drawdown reaction: ${profile.reactionToDrawdown}
- Experience: ${profile.experience}
- Themes: ${context.themeIds.join(", ")}

THEIR PORTFOLIO (with stated reasons):
${holdingsText}

THEIR DECISION PATTERNS:
- Most common reason for picks: ${topReason?.reason ?? "none yet"} (${topReason?.pct ?? 0}% of duels)
${gutPct > 30 ? `- WARNING: ${gutPct}% of their picks are "gut feeling" — worth exploring why` : ""}

ACTIVE TENSIONS:
${tensionText}

TONE: Calm, intellectually honest. Like a knowledgeable friend — not a Bloomberg terminal, not a salesperson.`;
}
```

### How the advisor call flows end-to-end

```
User types message in app
         ↓
POST /advisor (Supabase Edge Function)
  body: { user_id, message, conversation_history[] }
         ↓
  1. Check user tier (Pro gate)
  2. Load context_cache for user_id
     (rebuild if stale > 30 min)
  3. Build system prompt from context
  4. Call Groq API with:
     - system prompt (context)
     - conversation_history (last 10 turns)
     - new user message
  5. Save [user msg + AI response] to chat_history
  6. Extract topic from response → save to chat_history.topic
  7. Return streamed response to app
         ↓
App renders streaming text in chat bubble
```

### Free model costs at beta scale

| Model | Provider | Free tier | Cost after |
|-------|----------|-----------|-----------|
| llama-3.3-70b | Groq | 14,400 req/day | ~$0.59/1M tokens |
| llama-3.1-8b | Groq | 14,400 req/day | ~$0.05/1M tokens |
| deepseek-chat | DeepSeek | None | ~$0.14/1M tokens |
| gemini-1.5-flash | Google | 1,500 req/day | ~$0.075/1M tokens |

**Recommendation:** Groq free tier for beta (fast, free, no credit card). Switch to DeepSeek or Gemini Flash when you need to pay — both are cheaper than GPT-4o-mini.

---

## Part 6 — Supabase database schema

### Tables

```sql
-- Users (created automatically by Supabase Auth, extended here)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tier TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  profile JSONB NOT NULL DEFAULT '{}', -- UserProfile object
  theme_ids TEXT[] DEFAULT '{}',
  onboarding_state TEXT DEFAULT 'not-started'
);

-- All user decisions: duels + portfolio holdings in one table
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,          -- 'duel' | 'portfolio_add' | 'portfolio_remove'
  data JSONB NOT NULL          -- JournalEntry | PortfolioHolding depending on type
);

-- AI context cache (rebuilt every 30 min or on significant user action)
CREATE TABLE context_cache (
  user_id UUID REFERENCES users PRIMARY KEY,
  context_blob JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat history (Pro only)
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL,           -- 'user' | 'assistant'
  content TEXT NOT NULL,
  topic TEXT                   -- extracted by AI, used for context summary
);

-- Price cache (server-side, not per-user)
CREATE TABLE price_cache (
  symbol TEXT PRIMARY KEY,
  data JSONB NOT NULL,         -- LiveQuote object
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security policies

```sql
-- Users can only see/edit their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decisions_own" ON decisions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE context_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "context_own" ON context_cache FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_own" ON chat_history FOR ALL USING (auth.uid() = user_id);

-- price_cache is read-only for all authenticated users (no user data)
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_read" ON price_cache FOR SELECT USING (auth.role() = 'authenticated');
```

---

## Part 7 — Local-to-cloud sync

The current app stores everything in `AsyncStorage`. When a user signs up, all their local data should merge into the cloud. This is the "sync endpoint" Edge Function.

```ts
// supabase/functions/sync/index.ts
Deno.serve(async (req) => {
  const { user_id, local_store } = await req.json();
  // local_store = the full Zustand state from AsyncStorage

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Upsert profile
  await supabase.from("users").upsert({
    id: user_id,
    profile: local_store.profile,
    theme_ids: local_store.themeIds,
    onboarding_state: local_store.onboarding,
  });

  // Insert journal entries (decisions of type 'duel')
  if (local_store.journal.length > 0) {
    await supabase.from("decisions").upsert(
      local_store.journal.map(entry => ({
        id: entry.id,
        user_id,
        type: "duel",
        data: entry,
        created_at: new Date(entry.createdAt).toISOString(),
      })),
      { onConflict: "id" }  // Don't duplicate if already synced
    );
  }

  // Trigger context rebuild
  await fetch(`${SUPABASE_URL}/functions/v1/context-builder`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    body: JSON.stringify({ user_id }),
  });

  return new Response(JSON.stringify({ ok: true }));
});
```

---

## Part 8 — Implementation sequence (slices)

### Backend setup (human-only steps first)
1. Create Supabase project at supabase.com (free)
2. Run the SQL schema above in the SQL editor
3. Get `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Sign up for Groq at console.groq.com — get `GROQ_API_KEY` (free)
5. Sign up for Polygon.io — get `POLYGON_API_KEY` (free tier)
6. Add all keys to Supabase Edge Function secrets (not in app code)

### Hermes slices (in order)

| Slice | What | Files |
|-------|------|-------|
| B1 | Supabase client setup + auth (email + Apple) | `src/lib/supabase.ts`, auth screens |
| B2 | Sync endpoint + local-to-cloud merge on sign-in | Edge Function `sync/` |
| B3 | Price proxy Edge Function + Polygon integration | Edge Function `prices/`, `src/lib/prices.ts` |
| B4 | Context builder Edge Function | Edge Function `context-builder/` |
| B5 | AI advisor Edge Function (Groq proxy) | Edge Function `advisor/` |
| B6 | Chat UI wired to advisor endpoint | `src/app/(tabs)/advisor.tsx` |
| B7 | Company logos (`LogoImage` component + domain map) | `src/components/ui/LogoImage.tsx`, `src/data/stocks.ts` |
| B8 | Price charts (`PriceChart` WebView component) | `src/components/ui/PriceChart.tsx` |
| A1 | Generate investor portraits via Higgsfield | One-time task, static assets |
| A2 | Wire portraits into investor lenses | `src/data/investor-lenses.ts` |

### What the AI advisor gets better at over time

Month 1 (beta): knows questionnaire profile + last 20 duels
Month 3: knows portfolio reasoning patterns, tension history, conversation topics
Month 6: knows which concepts the user has learned, what questions they keep asking, which stocks they keep returning to

This is the compounding value of Pro — the advisor doesn't just know the user today, it knows the arc of how their thinking has evolved. That's not achievable with a stateless API call.

---

## Compliance note on AI model choice

DeepSeek is the existing model. Key risk: DeepSeek data is processed on servers in China — user conversation content (including their financial reasoning) goes there. For a US military/government user base this is a hard stop.

Groq runs on US-based infrastructure (Cloudflare network). Llama 3.3 (Meta) is open-weights, runs on Groq's hardware, not sent to Meta. For a user base that includes active-duty personnel, Groq + Llama is significantly safer. This should be flagged to legal/ethics counsel before beta launch.

Alternative: self-host Llama 3.3 on a Fly.io or Railway instance (~$20/month for a small GPU) — user data never leaves your own infrastructure.
