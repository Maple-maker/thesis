# Thesis — agent guide

Educational investing app (Expo / React Native) — **Investopedia/NerdWallet-style**: Learn → thesis → watchlist; **affiliate** monetization (brokerage, HYSA, credit). See `docs/product-vision.md`. **Cursor** owns framing; implementers use `docs/current-slice.md`.

**Tabs:** Home · Education · **Builder** (center) · Accounts · Watchlist (no Journal tab).

## Agent optimization (Cursor)

- **Superpowers** — `.cursor/skills/` + `.cursor/rules/superpowers.mdc` ([obra/superpowers](https://github.com/obra/superpowers))
- **CodeGraph** — MCP in `.cursor/mcp.json`, index in `.codegraph/` ([colbymchenry/codegraph](https://github.com/colbymchenry/codegraph))

Setup: `cd /Users/jaidenrabatin/Projects/thesis && npm run setup:agent-tooling` then restart Cursor. Details: **`docs/agent-tooling.md`**.

Prefer **CodeGraph MCP** for symbol navigation; read relevant **Superpowers** `SKILL.md` before planning, debugging, or marking work complete.

## Before you write code

1. Read **`docs/current-slice.md`** — goal, non-goals, files, acceptance checks.
2. Do **not** re-derive product strategy (onboarding depth, thesis-first UX, no pitch deck) unless the slice says so.
3. Respect **`.cursor/rules/`** (product + stack + handoff + superpowers + codegraph).

## Stack (conventions)

| Area | Choice |
|------|--------|
| App | Expo SDK 56, Expo Router, React Native 0.85 |
| UI | NativeWind v4, Daylight tokens in `tailwind.config.js` |
| State | Zustand + AsyncStorage (`src/store/`) |
| Data | Mock JSON in `src/data/`; logic in `src/lib/` |
| Fonts | Plus Jakarta Sans, Spline Sans Mono (`src/app/_layout.tsx`) |

Match existing patterns in `src/components/ui/` before adding new primitives.

## Key paths

- Questionnaire: `src/data/questionnaire.ts`, `src/app/onboarding/`
- Theme logic: `src/lib/theme-engine.ts`
- Duel / journal: `src/app/duel.tsx`, `src/app/(tabs)/journal.tsx`

## Run / verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npm install
npm run ios          # Simulator (preferred)
npx tsc --noEmit     # Typecheck
```

iOS native: open `ios/thesis.xcworkspace` after `pod install` — see `.cursor/skills/expo-ios-setup/SKILL.md`.

## Handoff to Claude Code

```text
Implement docs/current-slice.md only. Read AGENTS.md and .cursor/rules/. Do not expand scope.
```

## Education program (courses + Ask Thesis)

- **Courses:** structured lessons (credit score, interest, compound interest, Roth IRA, etc.) — `docs/education-full-program.md` phases **C1–C6**
- **Ask Thesis:** profile + theme-aware Q&A — phases **A1–A5**, system rules in `docs/assistant-system-prompt.md`
- **Glossary:** existing `learn.tsx` + `concepts.ts` — becomes “Glossary” inside Learn hub
- Implement **one phase per session**; master prompts in `docs/education-slices/MASTER-education-build.md`
- Robinhood Educate–style lesson UX: `docs/design-reference-robinhood-learn.md`

## Design references (insights UI)

Public / Coinbase / Autopilot screenshots → adapted in **`docs/design-reference-insights-ui.md`** (InsightCard, ListRow, signals as “Watch”). Phases **U1–U5** in `docs/education-roadmap.md`. Do not clone dark brokerage UI or copy-trading portfolios.

## Out of v1 scope

Real quotes, brokerage, auth/cloud sync, LLM recommendations, pitch decks, live “Agents” market AI — see README "What's deliberately out of v1".
