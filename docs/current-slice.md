# Current slice

**Owner:** Cursor (planning / framing)  
**Implementer:** Claude Code — implement this slice only; do not re-litigate product framing here.

**Last updated:** 2026-05-29  
**Status:** Not shipped — `reveal.tsx` does not render `result.reasons` yet.

---

## Goal

Close the onboarding feedback loop on **reveal**: after the comprehensive thesis-builder questionnaire, show *why* each theme matched the user using reasons from `generateThemes()` — so the payoff feels earned, not like a random quiz result.

## Non-goals (this slice)

- **Education layer** — concept library, jargon links, ExplainSheet (`docs/education-roadmap.md`) — next major push *after* this slice.
- Shortening questionnaire; pitch deck; real market data; auth; LLM themes.
- Home fingerprint, duel explain sheets, settings, profile name field.

## Product constraints

- Educational tool — **not investment advice**; no buy/sell language.
- Preserve Daylight tokens and existing UI primitives.
- Reasons are **fit explanations**, not recommendations.

## Implementation spec

### Data

```ts
const result = useMemo(() => generateThemes(profile, 5), [profile]);
// result.reasons: Record<ThemeId, string[]>
// e.g. reasons["compounders"] → ["Long horizon → quality compounders", ...]
```

Use `result.reasons[theme.id]` for each card. If empty, omit the reasons block (do not show placeholder fluff).

### UI

1. **Section label** under featured thesis blurb (optional): `Why these themes` in existing kicker style (`text-ink-3 font-sansX uppercase`).

2. **Featured card** (`FeaturedCard`): after `featured.thesis`, add **2–3 bullets** (max 3):
   - White/semi-transparent text on gradient (`text-white/90`, `text-[13px]`)
   - Prefix with `•` or small check icon
   - Light copy-edit allowed (e.g. drop internal `→` arrows for em dash or “because”)

3. **Other theme cards** (`Card`): below title/author row, add **1–2 bullets** (`text-ink-2 text-[12.5px]`), truncate with `numberOfLines={2}` per bullet if needed.

4. **Helper** (optional): local `MatchReasonsList` in `reveal.tsx` or `src/components/ui/MatchReasonsList.tsx` — props: `reasons: string[]`, `max: number`, `variant: 'on-dark' | 'on-light'`.

5. **Copy tweak** (subtitle under headline): reinforce thesis builder, e.g. “Matched to what you told us — situation, goals, temperament, and interests.”

### Do not change

- `setOnboarding("complete")` / `router.replace("/(tabs)")` behavior
- Theme ordering (store `themeIds` vs `result.themes` logic)
- `theme-engine.ts` scoring rules (read-only unless adding a tiny `formatMatchReason(s: string): string` helper)

## Files to touch

| File | Intent |
|------|--------|
| `src/app/onboarding/reveal.tsx` | **Primary** — render reasons on featured + other cards |
| `src/components/ui/MatchReasonsList.tsx` | Optional shared bullet list |

## Acceptance checks

- [ ] Featured theme shows 2–3 bullets from `result.reasons[featured.id]`
- [ ] Each other theme card shows 1–2 bullets from `result.reasons[t.id]`
- [ ] Subtitle/copy aligns with thesis-builder framing (`onboarding/index.tsx`)
- [ ] No recommendation language added
- [ ] `npx tsc --noEmit` passes
- [ ] Simulator: full onboarding → reveal shows bullets → Start exploring → tabs

## Verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npx tsc --noEmit
npm run ios   # optional manual QA
```

## After this slice (Cursor updates next)

1. **Education E1** — `docs/education-roadmap.md` phase E1 (concept data); step-by-step phases E1–E10
2. **Signals track** — E8–E10 (mock due-diligence alerts, e.g. CEO turnover) after E2
3. Home fingerprint — E7; settings — separate slice
