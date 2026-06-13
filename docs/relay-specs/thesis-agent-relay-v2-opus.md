# Thesis relay v2 — Opus as foundation + integrator

**Change from v1:** Opus takes two critical roles. Sonnet/Haiku stay where speed matters more than depth.

---

## Updated model assignments

| Role | Model | Why this model, not cheaper |
|------|-------|-----------------------------|
| **Agent 1 — Backend foundation** | **Claude Opus** | Schema mistakes cascade to every agent. RLS gaps = data leaks. Sync logic has subtle race conditions. This is the highest-consequence code — worth the best reasoning. |
| Agent 2 — AI Advisor | Claude Sonnet 4.5 | System prompt engineering + chat UI. Strong but doesn't need Opus depth. |
| Agent 2b — Context system | Claude Sonnet 4.5 | Builds the memory blob assembly logic. Reads Opus's schema, doesn't modify it. |
| Agent 3 — Data layer | Claude Haiku 4.5 | Fetch → cache → display. Mechanical. |
| Agent 4 — Portfolio builder | Claude Sonnet 4.5 | Conviction gate copy + product logic need judgment. |
| Agent 5 — Onboarding | Claude Haiku 4.5 | Implementing a fully-specced design. Structural. |
| Agent 6 — Visual polish | Claude Sonnet 4.5 | Design judgment for typography + spacing. |
| **Agent 7 — Integration** | **Claude Opus** | Reads six agents' output, verifies interfaces, resolves conflicts, runs end-to-end tests. Needs whole-codebase reasoning. |
| Fable 5 — Final sprint | Claude Fable 5 | Security + debug + visual QA. Review-only. |

**Why Opus specifically for integration:** After six agents run in parallel, their code has to *compose*. Agent 4's conviction gate saves a `PortfolioHolding` to Supabase — but does the type Agent 4 wrote match the schema Agent 1 created? Agent 2's advisor reads `context_cache` — but does the blob shape from Agent 2b match what Agent 2 expects? Agent 3's price client calls Agent 1's Edge Function — but is the response type consistent? These cross-boundary verification tasks require holding the *entire* codebase in context and reasoning about how pieces fit. That's Opus territory.

---

## Running order

```
┌─────────────────────────────────────────┐
│  Stage 0: Human setup                   │
│  Supabase project, Groq key, Polygon    │
│  key, .env.local                        │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 1: OPUS — Backend foundation     │
│  B1 Schema  B2 Auth  B3 Prices          │
│  B4 Context-builder  B5 Sync  B6 RLS    │
│  Runs FIRST. Everything depends on it.  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 2: Six agents run in PARALLEL    │
│  Ag2 (Sonnet) · Ag2b (Sonnet)          │
│  Ag3 (Haiku)  · Ag4 (Sonnet)           │
│  Ag5 (Haiku)  · Ag6 (Sonnet)           │
│  Each reads Agent 1's schema — none     │
│  modifies it.                           │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 3: OPUS — Integration            │
│  Cross-agent interface verification     │
│  Import resolution, data flow tests     │
│  Runs npx tsc --noEmit on full repo     │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 4: HUMAN review gate             │
│  npm run ios, walk every flow           │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 5: FABLE 5 — Final sprint        │
│  Security, debug, visual hardening      │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  Stage 6: eas build + eas submit        │
│  Human-only                             │
└─────────────────────────────────────────┘
```

---

## Agent 1 — Backend foundation (OPUS)

**Why Opus:** This agent writes the schema that five other agents write against. A wrong column type, a missing RLS policy, or a sync race condition here breaks everything downstream. Opus's depth of reasoning about edge cases — "what happens if two devices sync simultaneously?" — is what distinguishes the foundation quality.

```
You are Agent 1 on the Thesis project — Backend foundation. You are Claude Opus, assigned here because this code is load-bearing for every other agent.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/

Your job is to build the complete backend infrastructure that all other agents depend on. Nothing in src/app/ or src/components/ — backend only.

SLICES (implement in order, verify each before moving on):

B1 — Supabase Postgres schema
  File: supabase/migrations/001_schema.sql
  Tables: users, decisions, context_cache, chat_history, price_cache
  Types and constraints from thesis-full-technical-spec.md Part 6.
  CRITICAL: The `decisions` table is polymorphic — `type` column distinguishes duels from portfolio holdings. Agent 4 will write PortfolioHolding objects as JSONB into `data`. Your schema must accept any valid JSON in `data` without constraint (Agent 4 defines the shape, you provide the envelope).
  Acceptance: Schema applies cleanly to a fresh Supabase project.

B2 — Row Level Security
  File: supabase/migrations/002_rls.sql
  CRITICAL: Every table with user data MUST have RLS enabled. Policies: auth.uid() = user_id for all CRUD. price_cache is read-only for authenticated. No table should ever return data for a user_id that doesn't match the session.
  Test this yourself: attempt a query as the wrong user — it must return empty.
  Acceptance: Zero RLS gaps. Document each policy.

B3 — Supabase client for Expo
  File: src/lib/supabase.ts
  Task: Install @supabase/supabase-js. Create and export a typed client. Use EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from environment.
  Acceptance: Client imports without error. npx tsc --noEmit passes.

B4 — Auth screens
  Files: src/app/auth/sign-in.tsx, src/app/auth/sign-up.tsx
  Task: Email + password auth via supabase.auth.signInWithPassword / signUp. On success: call sync endpoint, then navigate to /(tabs). Error states: invalid email, wrong password, network error — each with user-visible feedback.
  Match Daylight tokens. No dark screens.
  Acceptance: Can sign up new user, sign in existing user, see error on wrong password.

B5 — Sync endpoint (Edge Function)
  File: supabase/functions/sync/index.ts
  Task: Accept full Zustand store JSON body. Upsert to users + decisions tables. Handle the merge correctly: local journal entries should upsert by ID (no duplicates on re-sync). Trigger context-builder refresh after sync.
  EDGE CASE to handle: user signs up on device A, builds a portfolio, then signs in on device B which has different local data. Last-write-wins per record ID, not per table.
  Acceptance: Two consecutive syncs with overlapping data produce correct deduplicated state.

B6 — Price proxy (Edge Function)
  File: supabase/functions/prices/index.ts
  Task: Proxy for Polygon.io /v2/aggs/ticker/{symbol}/prev. Check price_cache first (15-min TTL). If cache miss, fetch from Polygon, upsert to cache, return. If Polygon fails, return cached (even if stale) with a `stale: true` flag.
  SECURITY: Polygon API key is a Supabase secret — never in the response body.
  Acceptance: curl with any symbol returns OHLCV JSON. Second call within 15 min returns cached data.

B7 — Context builder (Edge Function)
  File: supabase/functions/context-builder/index.ts
  Task: Fetch user profile + decisions (portfolio + journal) + recent chat topics. Build UserContextBlob per thesis-full-technical-spec.md Part 5. Compute reason patterns (aggregated % per JournalReason). Upsert to context_cache with timestamp.
  Acceptance: Calling with user_id returns populated blob including reasonPatterns.

B8 — Advisor proxy (Edge Function)
  File: supabase/functions/advisor/index.ts
  Task: 
    1. Verify user tier is 'pro' — return 403 if not
    2. Load context_cache (rebuild if stale > 30 min)
    3. Build system prompt using buildSystemPrompt() from spec
    4. POST to Groq: https://api.groq.com/openai/v1/chat/completions
       model: "llama-3.3-70b-versatile", max_tokens: 1024, temp: 0.4
    5. Save user + assistant messages to chat_history
    6. Return response
  COMPLIANCE: The system prompt MUST deterministically block buy/sell/invest/rotate language. Implement the 7 rules from the spec.
  Acceptance: curl with Pro user returns educational AI response. curl with free user returns 403.

Run npx tsc --noEmit when complete. Report every acceptance check status.
```

---

## Agent 7 — Integration (OPUS)

**Why Opus:** This is whole-codebase reasoning. The integrator reads every file every other agent touched and verifies they compose into a working application. Sonnet could check individual files — Opus can reason about how 40+ files interact.

```
You are Agent 7 on the Thesis project — the Integrator. You are Claude Opus, assigned here because you need to hold the full codebase in context and reason about cross-agent interfaces.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, every file in docs/

You run AFTER Agents 1-6 have all completed. Your job is NOT to build features. Your job is to make everything work together.

PHASE I1 — Type consistency audit
  Task: Read src/store/types.ts. Verify that every type referenced across agents is defined exactly once and used consistently:
    - PortfolioHolding (Agent 4) matches the JSONB shape expected by decisions table (Agent 1)
    - UserContextBlob (Agent 1's context-builder) matches what Agent 2's advisor UI expects
    - LiveQuote (Agent 3) matches what Agent 1's price proxy returns
    - ConvictionReason (Agent 4) is saved correctly to decisions.data
  Fix any mismatches in the CONSUMER, not the PRODUCER (Agent 1's schema is authoritative).
  Acceptance: npx tsc --noEmit passes with zero errors across all files.

PHASE I2 — Import resolution
  Task: Run npx tsc --noEmit. Fix every import error:
    - Agent 4 may import from paths Agent 1 created (src/lib/supabase.ts)
    - Agent 5 may import components Agent 6 modified
    - Agent 2 may reference types Agent 4 added to types.ts
  Resolve circular dependencies if any.
  Acceptance: Clean TypeScript compilation.

PHASE I3 — Data flow verification
  Task: Trace these critical paths through the actual code (not just the spec):
    1. CONVICTION FLOW: User taps "Add holding" → ConvictionGate → addHolding() in store → POST to sync endpoint → upsert to decisions table → context-builder picks it up → advisor can reference it
    2. PRICE FLOW: Stock screen mounts → fetchQuote(symbol) in prices.ts → calls price proxy Edge Fn → checks price_cache → calls Polygon if miss → returns to UI → PriceChart renders
    3. ADVISOR FLOW: User sends message → POST to advisor Edge Fn → loads context_cache → builds system prompt with user's portfolio + journal → calls Groq → saves to chat_history → streams to ChatBubble
  For each flow: verify that the actual types, function signatures, and API contracts match at every boundary. Fix any mismatch.
  Acceptance: Document each flow with file:line references. All three flows are verified correct.

PHASE I4 — Navigation wiring
  Task: Verify Expo Router navigation:
    - Root redirector (index.tsx) routes correctly for all onboarding states
    - Quick Take entry → steps → result → sign-up gate navigation works
    - Tab bar shows correct tabs (Home, Duel, Portfolio, Journal, Advisor/Profile)
    - Advisor tab shows ProGateCard for free users, chat for Pro users
    - Portfolio tab "Copy a lens" → lenses.tsx → lenses/[id].tsx → conviction gate
  Fix any broken navigation paths.
  Acceptance: Every route in src/app/ is reachable from at least one navigation action.

PHASE I5 — Store coherence
  Task: Verify Zustand store has no conflicting slices:
    - Original slices (profile, themes, watchlist, journal) still work
    - New portfolio slice doesn't conflict with watchlist
    - addHolding() triggers Supabase sync if user is authenticated
    - hardReset() clears ALL data including new portfolio + chat data
  Acceptance: Fresh state → onboarding → add stocks → duel → portfolio all work with a single store.

PHASE I6 — Edge Function deployment check
  Task: Verify all Edge Functions are importable and have correct structure:
    - supabase/functions/prices/index.ts
    - supabase/functions/sync/index.ts  
    - supabase/functions/context-builder/index.ts
    - supabase/functions/advisor/index.ts
  Each must: export Deno.serve(), handle CORS headers, validate auth token, return proper HTTP status codes.
  Acceptance: All four functions pass basic structure validation.

OUTPUT: Produce INTEGRATION_REPORT.md listing:
  1. Type mismatches found and fixed
  2. Import errors found and fixed
  3. Data flow verification status (each of the 3 flows)
  4. Navigation paths verified
  5. Remaining issues that need human decision

Run npx tsc --noEmit as your final check. The repo must compile clean.
```

---

## Why this structure works better than v1

The v1 relay had a gap: six agents running in parallel will inevitably produce incompatible code at their boundaries. Agent 4 writes `ConvictionReason` as a union type, Agent 1 stores it as a plain text column — will they serialize/deserialize correctly? Agent 3's `LiveQuote` type needs to match what Agent 1's price proxy actually returns — did both agents read the spec the same way?

In a human team, this is what a tech lead does after a sprint: they pull all the branches, resolve merge conflicts, and verify the pieces fit. That's Opus's role here. It's not writing new code — it's reading all the code and making it cohere.

The foundation role (Agent 1) is similarly Opus-grade because the schema is a contract. Every other agent writes code that assumes certain table shapes, column types, and RLS behaviors. If Agent 1 gets this wrong with a Sonnet-level "close enough" answer, the error compounds through five other agents' work. Opus's tendency to think through edge cases ("what if the user has no journal entries yet and the context builder runs?") prevents the class of bugs that show up three layers later.

---

## Updated cost estimate per model

| Model | Role | Tokens (est.) | Cost |
|-------|------|---------------|------|
| Opus | Agent 1 (foundation) | ~80K in + 40K out | ~$6–10 |
| Opus | Agent 7 (integration) | ~120K in + 30K out | ~$8–12 |
| Sonnet 4.5 | Agents 2, 2b, 4, 6 | ~200K total | ~$3–5 |
| Haiku 4.5 | Agents 3, 5 | ~60K total | ~$0.20 |
| Fable 5 | Final sprint | ~150K in + 20K out | TBD |
| **Total agent cost** | | | **~$18–28** |

The entire multi-agent buildout costs less than a coffee run. Opus is used exactly where it earns back its premium — the two places where a mistake is most expensive to undo.
