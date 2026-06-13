# Thesis — complete agent relay system

**Architecture:** 6 parallel sub-agents → human review gate → Fable 5 final sprint → EAS submit
**Model philosophy:** Use the cheapest model that can reliably do the job. Only escalate when the task needs reasoning, not just execution.

---

## Model assignments and rationale

| Agent | Task type | Model | Why |
|-------|-----------|-------|-----|
| Agent 1 — Backend | Supabase schema, Edge Functions, RLS | Claude Sonnet 4.5 | Needs strong TypeScript + Deno reasoning; schema mistakes are hard to undo |
| Agent 2 — AI Advisor | System prompt engineering, context builder, chat UI | Claude Sonnet 4.5 | System prompt quality directly affects the product's core value prop |
| Agent 3 — Data layer | Polygon proxy, logo component, chart component | Claude Haiku 4.5 | Mechanical tasks: fetch → cache → display. Fast and cheap is fine |
| Agent 4 — Portfolio builder | Conviction gate, investor lenses, tension detection | Claude Sonnet 4.5 | Product logic is nuanced; conviction gate copy matters |
| Agent 5 — Onboarding | Quick Take survey, reveal screen, model portfolio | Claude Haiku 4.5 | Structural implementation of already-specced design; straightforward |
| Agent 6 — Visual polish | Type scale, spacing, animations, investor portraits | Claude Sonnet 4.5 | Design judgment required; can't be mechanical |
| Fable 5 — Final sprint | Security, debug, style hardening, TS strict | Claude Fable 5 | Best at comprehensive codebase review; treat as the QA layer |

**Groq (free US-based AI backend):**
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model for AI Advisor: `llama-3.3-70b-versatile` (14,400 req/day free)
- Sign up: console.groq.com — no credit card for free tier
- Data: US infrastructure, not routed outside US

---

## One-time human setup (before agents run)

```bash
# 1. Create Supabase project at supabase.com
# 2. Run the schema SQL from thesis-full-technical-spec.md
# 3. Add secrets to Supabase Edge Functions:
supabase secrets set GROQ_API_KEY=your_groq_key
supabase secrets set POLYGON_API_KEY=your_polygon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key

# 4. Add to .env.local (never commit this):
echo "EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co" >> .env.local
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local
echo "EXPO_PUBLIC_GROQ_API_KEY=sk-..." >> .env.local  # only needed locally, Edge Fn uses server key
```

---

## Agent 1 — Backend (Claude Sonnet 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 1 on the Thesis project — Backend infrastructure.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/

Your job is to implement the complete backend layer from thesis-full-technical-spec.md Part 4-6.
Do NOT implement any frontend UI. Do NOT touch src/app/ or src/components/.

SLICES (implement in order, stop and report after each):

B1 — Supabase client setup
  Files: src/lib/supabase.ts
  Task: Install @supabase/supabase-js, create typed client using EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
  Acceptance: Client exports, TypeScript strict passes

B2 — Auth screens (email only, Apple Sign-in is human setup)
  Files: src/app/auth/sign-in.tsx, src/app/auth/sign-up.tsx
  Task: Email + password auth using supabase.auth. On success, trigger sync endpoint.
  Acceptance: Sign in/up works in simulator, navigates to tabs on success

B3 — Price proxy Edge Function
  Files: supabase/functions/prices/index.ts
  Task: Fetch from Polygon.io /v2/aggs/ticker/{symbol}/prev, cache result in price_cache table with 15-min TTL. Return cached if fresh.
  Acceptance: curl test returns OHLCV JSON for NVDA

B4 — Context builder Edge Function
  Files: supabase/functions/context-builder/index.ts
  Task: Fetch users + decisions + chat_history for user_id, build UserContextBlob, upsert to context_cache.
  Acceptance: Calling with a user_id returns a populated context blob

B5 — Sync endpoint Edge Function
  Files: supabase/functions/sync/index.ts
  Task: Accept local Zustand store JSON, upsert to users + decisions tables, trigger context rebuild.
  Acceptance: Posting a mock store body upserts to DB

B6 — Row Level Security
  Files: supabase/migrations/001_rls.sql
  Task: Enable RLS on all user tables. CREATE POLICY so auth.uid() = user_id on every table.
  Acceptance: Querying as wrong user returns empty result set

Stack: Supabase SDK, Deno/TypeScript for Edge Functions, Expo/React Native for auth screens.
Run npx tsc --noEmit when done. Report any acceptance checks that fail.
```

---

## Agent 2 — AI Advisor (Claude Sonnet 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 2 on the Thesis project — AI Advisor feature.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, docs/thesis-design-spec-ai-advisor.md

Your job is to implement the AI Advisor Pro feature. The backend Edge Function calls Groq (not DeepSeek). API keys are server-side — never in client code.

COMPLIANCE RULE: Every AI response must be educational only. System prompt must block any buy/sell/invest language deterministically. See docs/thesis-full-technical-spec.md Part 5 for the system prompt template.

SLICES:

A1 — Advisor Edge Function
  Files: supabase/functions/advisor/index.ts
  Task:
    1. Check user tier from users table — 403 if not Pro
    2. Load context_cache for user_id (call context-builder if stale > 30 min)
    3. Build system prompt using buildSystemPrompt(context) from the spec
    4. POST to Groq API: https://api.groq.com/openai/v1/chat/completions
       model: "llama-3.3-70b-versatile", max_tokens: 1024, temperature: 0.4
    5. Save user message + AI response to chat_history
    6. Return response
  Acceptance: curl with valid Pro user_id + message returns educational AI response

A2 — Chat UI
  Files: src/app/(tabs)/advisor.tsx, src/components/ui/ChatBubble.tsx, src/components/ui/PromptChip.tsx
  Task: Implement the advisor screen from docs/thesis-design-spec-ai-advisor.md
    - Message thread with AI/user bubble variants
    - Input row with send button
    - 3 profile-derived PromptChips
    - 2 InsightCards below ("From your profile" section)
    - Disclaimer footer: "Educational only · not financial advice"
  Acceptance: Screen renders, send button calls advisor Edge Function, response streams into thread

A3 — Pro gate
  Files: src/components/ProGateCard.tsx
  Task: If user.tier === 'free', show ProGateCard instead of chat interface. See spec for copy + layout.
  Acceptance: Free user sees gate; Pro user sees chat

A4 — Context integration
  Task: When user opens advisor tab, call context-builder Edge Function to refresh context_cache if stale.
  Acceptance: Advisor responses reference user's actual themes and recent journal entries

Daylight tokens only. No dark screens. Educational framing throughout.
Run npx tsc --noEmit when done.
```

---

## Agent 3 — Data layer (Claude Haiku 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 3 on the Thesis project — Data layer (prices, logos, charts).

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/

Your job is to implement live price data, company logos, and price charts. No user data — this is read-only public market data.

SLICES:

D1 — Price client
  Files: src/lib/prices.ts
  Task: Create fetchQuote(symbol) and fetchQuotes(symbols[]) that call the prices Edge Function (NOT Polygon directly). Fall back to null if unavailable. Types: LiveQuote { symbol, close, open, change, changePct, date }
  Acceptance: fetchQuote("NVDA") returns LiveQuote when Edge Function is running

D2 — LogoImage component
  Files: src/components/ui/LogoImage.tsx
  Task: <LogoImage domain="nvidia.com" symbol="NVDA" size={32} />
    - Image from https://cdn.brandfetch.io/{domain}/icon
    - Fallback: ticker monogram circle in brand-bg with brand-deep text
    - Never crashes on missing domain
  Acceptance: Renders logo for NVDA, renders monogram for unknown symbol

D3 — Domain map
  Files: src/data/stocks.ts (edit existing)
  Task: Add domain?: string field to each Stock. Populate for all 50 stocks. Use company's primary domain (apple.com, nvidia.com etc.)
  Acceptance: Every stock in STOCKS array has a domain value or undefined (never missing key)

D4 — PriceChart component
  Files: src/components/ui/PriceChart.tsx
  Task: WebView-based chart using Lightweight Charts (TradingView open source).
    Props: { candles: Candle[], height?: number, accentColor?: string }
    Use bg: #F3F5F1, match Daylight tokens. Area series only.
  Acceptance: Renders chart for mock OHLCV data without crashing

D5 — Wire prices into stock detail
  Files: src/app/(tabs)/stock/[symbol].tsx (or src/app/stock/[symbol].tsx)
  Task: On mount, call fetchQuote(symbol). Display price + daily change % with pos/neg color. Show "— " if unavailable. Add disclaimer: "Delayed ≥15 min · Educational only"
  Acceptance: NVDA stock screen shows live-ish price when Edge Function runs

Run npx tsc --noEmit when done. Report any acceptance checks that fail.
```

---

## Agent 4 — Portfolio builder (Claude Sonnet 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 4 on the Thesis project — Portfolio Builder + Investor Lenses.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, docs/feature-spec-portfolio-builder.md

This is the conviction-first portfolio feature. Every stock add requires a stated reason. The conviction gate is not optional — it is the product.

SLICES:

P1 — Types + store
  Files: src/store/types.ts, src/store/index.ts
  Task: Add PortfolioHolding type + ConvictionReason type. Add portfolio slice to Zustand store: portfolio[], addHolding(), removeHolding(), updateAllocation(). Equal-weight default allocation.
  Acceptance: npx tsc --noEmit passes; store exports new actions

P2 — Portfolio home screen
  Files: src/app/(tabs)/portfolio.tsx
  Task: "Build what you actually believe." header. Stats row (holdings count, reasons logged, themes covered). Holdings list with symbol, name, theme, allocation bar, allocation %. Amber "No reason" pill for holdings missing reason. Two CTAs: "Add a holding" + "Copy a lens".
  Acceptance: Renders empty state + populated state correctly

P3 — Conviction gate
  Files: src/components/ConvictionGate.tsx
  Task: Bottom sheet shown when adding any stock. Required reason picker (7 options from spec). Optional note text input. Educational nudge paragraph shown after reason selection (tailored per reason). "Add to portfolio" button disabled until reason selected. Saves to Zustand + syncs to Supabase decisions table.
  Acceptance: Can't add stock without selecting reason. Reason + note saved to store.

P4 — Investor lens browser + detail
  Files: src/data/investor-lenses.ts, src/app/(tabs)/lenses.tsx, src/app/(tabs)/lenses/[id].tsx
  Task: Seed 6 investor lenses (Buffett, Wood, Dalio, Lynch, Graham, Simons). Browser screen with lens cards. Detail screen with framework, criteria, model holdings, profile match card. "Add these holdings" triggers conviction gate per stock.
  Acceptance: All 6 lenses render. Adding from a lens triggers conviction gate.

P5 — Tension detection
  Files: src/lib/portfolio-health.ts
  Task: detectTensions(holdings, stocks): PortfolioTension[] — flag high+low volatility pairs. Show amber tension card on portfolio home. Max 2 tensions shown at once.
  Acceptance: Portfolio with NVDA (high vol) + KO (low vol) shows tension card.

Compliance: No "buy/sell/recommend" language anywhere. Model portfolios labeled "Illustrative · educational only".
Run npx tsc --noEmit when done.
```

---

## Agent 5 — Onboarding (Claude Haiku 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 5 on the Thesis project — Onboarding (Quick Take + Reveal improvements).

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, docs/slice-quick-take-onboarding.md, docs/current-slice.md

Your job is to implement the Quick Take pre-signup flow AND ship the current slice (reveal.tsx reasons). The full Thesis Builder (16 questions) is untouched.

SLICES:

O1 — Current slice: reveal.tsx reasons
  This is already specced in docs/current-slice.md. Implement it first — it's the prerequisite.
  Files: src/app/onboarding/reveal.tsx
  Task: Render result.reasons[theme.id] as ReasonBullets on FeaturedCard (max 3) and rest cards (max 2).
  Acceptance: All checks in docs/current-slice.md acceptance section pass.

O2 — Quick Take question set
  Files: src/data/quick-take-questions.ts
  Task: Create QUICK_TAKE_STEPS array (5 steps) from docs/slice-quick-take-onboarding.md. Add qtInterest?: string to UserProfile in src/store/types.ts and DEFAULT_PROFILE.
  Acceptance: npx tsc --noEmit passes

O3 — Quick Take entry screen
  Files: src/app/quick-take/index.tsx
  Task: "Your investing lens, in 2 minutes." entry screen. Logo + tagline + "Begin →" button. FadeInDown/FadeInUp animations matching onboarding/index.tsx pattern. Disclaimer footer.
  Acceptance: Screen renders, button navigates to step/0

O4 — Quick Take step renderer
  Files: src/app/quick-take/step/[index].tsx
  Task: Thin wrapper using QUICK_TAKE_STEPS instead of STEPS. Reuse StepScreen logic pattern from onboarding/step/[index].tsx. Last step navigates to result.tsx.
  Acceptance: All 5 questions render, progress bar shows 1/5 → 5/5

O5 — Quick Take result screen
  Files: src/app/quick-take/result.tsx
  Task: "YOUR THESIS PREVIEW" kicker. Featured theme card (FeaturedCard component reuse). Model portfolio: 5 stocks from rankStocksForTheme(). Stock rows: symbol (mono), name, sector tag. Sign-up gate CTA. Disclaimer. No live prices (Agent 3 adds those later).
  Acceptance: Answering all 5 questions and tapping "See my thesis" shows result screen with theme card + 5 stocks.

O6 — Root redirector update
  Files: src/app/index.tsx
  Task: onboarding === "not-started" → /quick-take (not /onboarding). Other states unchanged.
  Acceptance: Fresh install lands on Quick Take entry screen.

Daylight tokens only. No dark screens. Reuse existing components before adding new ones.
Run npx tsc --noEmit when done.
```

---

## Agent 6 — Visual polish (Claude Sonnet 4.5)

**Paste this prompt into Claude Code:**

```
You are Agent 6 on the Thesis project — Visual style polish.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, docs/thesis-design-spec-ai-advisor.md, docs/design-reference-insights-ui.md

Your job is visual polish only — no new features, no new routes, no new data. Fix, refine, and elevate what exists.

SLICES:

V1 — Typography contrast pass
  Files: src/app/onboarding/reveal.tsx, src/app/quick-take/result.tsx (when it exists)
  Task: Push headline sizes to 38–44px on reveal and result screens. Use font-displayX throughout headline hierarchy. Increase letter-spacing: -0.8 to -1 on large display text.
  Acceptance: Reveal screen headline feels like a magazine cover, not a form result.

V2 — Spacing rhythm pass
  Files: All tab screens and onboarding screens
  Task: Ensure section-to-section gaps use mt-8 (32px). Card internal padding px-4 py-3.5 throughout. No cramped screens. Screen top padding pt-6.
  Acceptance: Every screen has consistent breathing room — no element touches the edge of its container.

V3 — Investor portrait integration
  Task: Once portraits are generated (human task via Higgsfield), integrate portrait images into investor lens cards. See docs/thesis-full-technical-spec.md Part 1 for LogoImage integration pattern. Placeholder: colored initial circle (already in spec).
  Acceptance: Lens cards show portrait or fallback gracefully. No broken images.

V4 — Animation consistency pass
  Files: src/app/onboarding/reveal.tsx, src/app/quick-take/result.tsx
  Task: Ensure FadeInDown + stagger delays on reveal cards match the pattern in onboarding/reveal.tsx. Featured card: FadeIn.delay(120). Other cards: FadeInDown.delay(180 + i*80).
  Acceptance: Reveal feels choreographed, not all-at-once.

V5 — Empty states
  Files: src/app/(tabs)/portfolio.tsx, src/app/(tabs)/journal.tsx, src/app/(tabs)/themes.tsx
  Task: Every screen with a list needs a branded empty state. Pattern: brand-bg rounded icon + headline + subtext. No placeholder text like "No items yet."
  Acceptance: Fresh install shows meaningful empty states on all tab screens.

V6 — Disclaimer consistency
  Task: Audit every screen that shows stock names, prices, or AI output. Ensure disclaimer "Educational only · not investment advice" is present and visible (ink-3, 11px, centered). Add where missing. Do not add to screens that don't need it (profile, settings).
  Acceptance: Every screen showing financial data has a visible disclaimer.

Daylight tokens only. Never introduce dark backgrounds or off-token colors. Match existing component patterns.
Run npx tsc --noEmit when done.
```

---

## Fable 5 — Final sprint brief

**This runs LAST, after all agents have shipped and you've approved on device.**

**Paste this prompt to Fable 5:**

```
You are the final reviewer on the Thesis iOS app — an educational investing app built with Expo / React Native.

Read first: AGENTS.md, CLAUDE.md, .cursor/rules/, all docs/ files.

Your job is to REVIEW, DEBUG, HARDEN, and POLISH — not to add features or change product direction. If you identify something missing that should be built, flag it in a report but DO NOT build it. Stay in your lane.

MISSION: This codebase ships to the App Store. Make it worthy.

PHASE F1 — TypeScript audit
  Run: npx tsc --noEmit
  Task: Fix every type error. No `any` in new code. Ensure all new types from Agents 1-6 are correctly typed.
  Acceptance: Zero TypeScript errors.

PHASE F2 — Security hardening
  Task:
    1. Audit every file for API keys, secrets, or tokens hardcoded in client code. Flag and remove any found.
    2. Verify Supabase RLS policies cover all tables — no table should be accessible without auth.uid() check.
    3. Verify AI advisor Edge Function 403s correctly for non-Pro users.
    4. Verify no user data from User A is ever returned in User B's session.
    5. Verify financial advice compliance: search all AI system prompts and response handlers for "buy", "sell", "invest", "recommend" as action verbs. Flag any found.
  Acceptance: Zero API keys in client code. Zero RLS gaps. Zero advice-language leaks.

PHASE F3 — Debug pass
  Task:
    1. Run npm run ios in simulator. Navigate every screen. Log any crashes, blank screens, or console errors.
    2. Test the Quick Take flow end-to-end: entry → 5 questions → result → sign-up gate.
    3. Test the Duel flow: watchlist → duel → reason → journal entry.
    4. Test the AI Advisor: send a message, verify response contains educational framing, verify "Learn:" pill appears.
    5. Test portfolio: add holding → conviction gate → allocation bar updates.
  Acceptance: No crashes. No blank screens. Every user-facing flow completes without error.

PHASE F4 — Visual style pass
  Task:
    1. Check every screen against the Daylight design tokens (tailwind.config.js). Flag any hardcoded hex colors not in the token system.
    2. Verify every disclaimer is present on screens showing financial data.
    3. Check font usage: headlines use font-displayX, body uses font-sansMd, tickers use font-monoBold.
    4. Check that no screen has a pure black (#000) background.
    5. Fix any spacing inconsistencies: cards should not touch screen edges (min px-4 horizontal padding).
  Acceptance: No off-token colors. No missing disclaimers. Consistent typography.

PHASE F5 — Pre-submission checklist
  Verify and report status on each:
    [ ] app.json has correct bundleIdentifier, version, and buildNumber
    [ ] All assets in assets/ are correct dimensions (icon 1024x1024, splash correct)
    [ ] No console.log() calls in production code (search and remove)
    [ ] No TODO comments that indicate incomplete features
    [ ] eas.json exists and has production profile configured
    [ ] Privacy policy URL is set in app.json (required by App Store)
    [ ] NSCameraUsageDescription / NSPhotoLibraryUsageDescription set if applicable

OUTPUT: Produce a report — FABLE_REPORT.md — listing:
  1. Issues fixed (with file + line)
  2. Issues flagged (need human decision)
  3. Pre-submission checklist status
  4. Go/no-go recommendation

Do NOT start a new agent session or expand scope. Fix and report only.
```

---

## Running order and dependencies

```
Human setup (Supabase, Groq, Polygon keys)
        ↓
Agents 1-6 run in PARALLEL (no dependencies between them except Agent 3 uses Agent 1's Edge Functions)
        ↓
Dependency note: Agent 3 (D5 wire prices) needs Agent 1 (B3 price proxy) to be deployed first.
Run Agent 1 first, then Agents 2-6 can run concurrently.
        ↓
Human review: test on device, approve each agent's work
        ↓
Fable 5 final sprint
        ↓
Human: eas build + eas submit
```

## Cost estimate at beta scale

| Service | Monthly cost | Notes |
|---------|-------------|-------|
| Supabase | $0 | Free tier covers 500MB + 50k MAU |
| Groq | $0 | 14,400 req/day free forever |
| Polygon | $0 | Free tier, 15-min delay |
| Brandfetch | $0 | CDN, no API key |
| Lightweight Charts | $0 | MIT open source |
| **Total** | **$0** | Until you hit ~1,000 active Pro users |

At ~1,000 Pro users (~10 AI messages/day each): Groq free tier handles ~14k req/day = covered. At scale, switch to DeepSeek (~$0.14/1M tokens) or keep Groq paid (~$0.59/1M tokens for 70B).
