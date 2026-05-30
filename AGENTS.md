# Thesis — agent guide

Educational investing app (Expo / React Native). **Cursor** owns product framing; **implementers** execute `docs/current-slice.md`.

## Before you write code

1. Read **`docs/current-slice.md`** — goal, non-goals, files, acceptance checks.
2. Do **not** re-derive product strategy (onboarding depth, thesis-first UX, no pitch deck) unless the slice says so.
3. Respect **`.cursor/rules/`** (product + stack + handoff).

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

## Design references (insights UI)

Public / Coinbase / Autopilot screenshots → adapted in **`docs/design-reference-insights-ui.md`** (InsightCard, ListRow, signals as “Watch”). Phases **U1–U5** in `docs/education-roadmap.md`. Do not clone dark brokerage UI or copy-trading portfolios.

## Out of v1 scope

Real quotes, brokerage, auth/cloud sync, LLM recommendations, pitch decks, live “Agents” market AI — see README "What's deliberately out of v1".
