# FABLE MEGA-PROMPT — Build + integrate + harden Thesis

You are the sole builder, integrator, and hardener for the Thesis iOS app — an educational investing app built with Expo / React Native.

Read first (in order):
1. AGENTS.md
2. CLAUDE.md
3. .cursor/rules/ (all files)
4. Every file in docs/relay-specs/ — these are your complete specs

## Your infrastructure

- Supabase: https://oeqjliuzppakcshbqxib.supabase.co
- DB schema: ALREADY DEPLOYED (users, decisions, context_cache, chat_history, price_cache tables exist with RLS)
- AI model: OpenRouter → nvidia/nemotron-3-ultra-550b-a55b:free
  - Endpoint: https://openrouter.ai/api/v1/chat/completions
  - Auth: Bearer ${OPENROUTER_API_KEY} (in Supabase Edge Function secrets)
  - Extra headers: HTTP-Referer: https://thesis-app.com, X-Title: Thesis Investing Education
- Prices: Polygon.io, key in secrets as POLYGON_API_KEY
- All API keys are in Supabase Edge Function secrets — access via Deno.env.get(). NEVER put keys in client code.

## What to build (execute in this order)

### PHASE 1 — Backend (build the foundation everything else sits on)

1. **src/lib/supabase.ts** — Install @supabase/supabase-js. Export typed client using EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY from env.

2. **supabase/functions/prices/index.ts** — Edge Function. Accept { symbol }. Check price_cache (15-min TTL). If miss → GET Polygon /v2/aggs/ticker/{symbol}/prev?adjusted=true&apiKey=${POLYGON_KEY}. Upsert cache. Return { symbol, close, open, change, changePct, date, stale }. CORS headers. Auth validation.

3. **supabase/functions/sync/index.ts** — Accept full Zustand store body. Upsert to users + decisions tables. Deduplicate journal entries by ID. Return { ok: true }.

4. **supabase/functions/context-builder/index.ts** — Fetch user profile + decisions + chat_history. Build context blob with reasonPatterns (aggregated % per reason). Upsert to context_cache.

5. **supabase/functions/advisor/index.ts** — Check user tier (403 if not 'pro'). Load context. Build system prompt (STRICTLY EDUCATIONAL — block buy/sell/invest/rotate language). Call OpenRouter with model nvidia/nemotron-3-ultra-550b-a55b:free, max_tokens 1024, temp 0.4. Save messages to chat_history. Return response.

6. **Auth screens** — src/app/auth/sign-in.tsx, sign-up.tsx. Email + password. On success → sync → navigate to /(tabs). Daylight tokens.

### PHASE 2 — Onboarding (the first thing users see)

7. **Ship current slice first** — src/app/onboarding/reveal.tsx doesn't render result.reasons yet. Fix it: render ReasonBullets from generateThemes() on FeaturedCard (max 3) and rest cards (max 2). See docs/current-slice.md for exact spec.

8. **Quick Take flow** — See docs/relay-specs/slice-quick-take-onboarding.md for full spec:
   - src/data/quick-take-questions.ts — 5 questions (horizon, drawdown, goal, interest, risk)
   - src/app/quick-take/index.tsx — entry screen
   - src/app/quick-take/step/[index].tsx — step renderer
   - src/app/quick-take/result.tsx — thesis preview + model portfolio (5 stocks)
   - Update src/app/index.tsx — route "not-started" to /quick-take
   - Add qtInterest?: string to UserProfile

### PHASE 3 — Data layer (prices, logos, charts)

9. **src/lib/prices.ts** — fetchQuote(symbol) + fetchQuotes(symbols[]) calling the prices Edge Function. Returns LiveQuote | null. Graceful fallback.

10. **src/components/ui/LogoImage.tsx** — Brandfetch CDN: https://cdn.brandfetch.io/{domain}/icon. Fallback: ticker monogram circle. Never crashes on missing domain.

11. **src/data/stocks.ts** — Add domain?: string to every Stock. Populate for all ~50 stocks.

12. **src/components/ui/PriceChart.tsx** — WebView chart using Lightweight Charts (npm install lightweight-charts). Area series, Daylight colors (bg #F3F5F1, accent brand #0E7A66).

13. **Wire prices** into stock/[symbol].tsx — show price + daily change + "Delayed ≥15 min" disclaimer.

### PHASE 4 — Portfolio builder (the conviction loop)

See docs/relay-specs/feature-spec-portfolio-builder.md for full spec:

14. **Types + store** — Add PortfolioHolding, ConvictionReason to types.ts. Add portfolio slice to Zustand store. Equal-weight default allocation.

15. **src/app/(tabs)/portfolio.tsx** — Builder home. Stats row (holdings, reasons, themes). Holdings list with allocation bars. Tension flag card. CTAs: "Add holding" + "Copy a lens".

16. **src/components/ConvictionGate.tsx** — Bottom sheet on every stock add. Required reason picker (7 options). Optional note. Educational nudge per reason. Saves to store + Supabase.

17. **Investor lenses** — src/data/investor-lenses.ts (seed 6: Buffett, Wood, Dalio, Lynch, Graham, Simons). src/app/(tabs)/lenses.tsx + lenses/[id].tsx. Profile match card. "Add holdings" triggers conviction gate per stock.

18. **src/lib/portfolio-health.ts** — detectTensions() for volatility conflicts. Show on portfolio home.

### PHASE 5 — AI Advisor UI

See docs/relay-specs/thesis-design-spec-ai-advisor.md for full spec:

19. **src/app/(tabs)/advisor.tsx** — Chat interface. Message thread (AI/user bubbles). Input row + send button. Calls advisor Edge Function. "Learn: [concept]" pills in AI responses.

20. **src/components/ui/ChatBubble.tsx** — AI bubble (bg #F3F5F1, rounded 4/14/14/14) + user bubble (bg brand, rounded 14/4/14/14).

21. **src/components/ui/PromptChip.tsx** — Pre-fill suggestion pills derived from user profile.

22. **src/components/ProGateCard.tsx** — Shown to free users instead of chat. "Unlock with Pro" CTA.

23. **Update tab bar** — Add Advisor tab (lock icon for free, sparkle for Pro). Rearrange: Home, Duel, Portfolio, Journal, Advisor.

### PHASE 6 — Visual polish

24. **Typography pass** — Push reveal + result headlines to 38–44px displayX. Letter-spacing -0.8 to -1 on display text.

25. **Spacing pass** — Section gaps mt-8. Screen top padding pt-6. Consistent card padding px-4 py-3.5.

26. **Empty states** — Every list screen (portfolio, journal, themes, watchlist) gets a branded empty state: icon circle + headline + subtext.

27. **Disclaimer audit** — Every screen showing stock names, prices, or AI output must have: "Educational only · not investment advice" visible (ink-3, 11px, centered).

### PHASE 7 — Integration verification

28. **Type consistency** — Every type used across phases must match. PortfolioHolding shape must match decisions table JSONB. LiveQuote from prices.ts must match price proxy response. Run npx tsc --noEmit — fix ALL errors.

29. **Data flow check** — Trace these paths through actual code:
   - Conviction gate → addHolding() → sync to Supabase → context-builder picks it up → advisor references it
   - Stock screen → fetchQuote → price proxy → Polygon → cache → display
   - Advisor message → Edge Function → context load → OpenRouter → chat_history → ChatBubble

30. **Navigation check** — Every route reachable. Root redirector correct for all onboarding states. Tab bar shows correct tabs. Advisor shows ProGateCard for free users.

### PHASE 8 — Security hardening

31. **Zero API keys in client code** — grep -r for key patterns in src/. Remove any found.
32. **RLS verified** — No table accessible without auth.uid() check.
33. **Advisor 403s for free users** — Tested and confirmed.
34. **No advice language** — Search all system prompts and UI copy for "buy", "sell", "invest", "recommend" as action verbs. Remove or rephrase.
35. **No console.log** in production paths. Remove or guard with __DEV__.

### PHASE 9 — Pre-flight

36. **npx tsc --noEmit** — ZERO errors.
37. **npm run ios** — Launches in simulator without crash.
38. **Walk every flow** on simulator:
   - Fresh install → Quick Take → result → sign-up
   - Sign in → full onboarding → reveal with reasons → tabs
   - Portfolio → add holding → conviction gate → allocation updates
   - Duel → pick → reason → journal entry
   - Advisor (set tier to 'pro' in DB) → send message → educational response
   - Stock detail → price + chart + logo visible
   - Lenses → Buffett → framework → add holdings → conviction gate

## Absolute rules

- **Educational only.** Not investment advice. No buy/sell language anywhere.
- **Daylight tokens only.** bg #F3F5F1, bg-surface #FFFFFF, brand #0E7A66, ink #16201C. No dark backgrounds. No off-token colors.
- **Reuse existing components** (Button, Card, Screen, Header, Icon) before creating new ones.
- **Match existing patterns** in AGENTS.md and .cursor/rules/.
- **API keys are secrets** — Deno.env.get() in Edge Functions, process.env.EXPO_PUBLIC_ for public client values only.

## Output

When complete, produce FABLE_REPORT.md with:
1. Every file created or modified (with brief description)
2. Every acceptance check status (pass/fail)
3. Any issues that need human decision
4. Pre-submission checklist status
5. Go / no-go recommendation
