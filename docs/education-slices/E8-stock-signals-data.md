# Current slice — E8 Stock signals data (mock)

**Goal:** Mock due-diligence notes (e.g. "4 CEO changes in 3 years") — educational facts, not buy/sell warnings.

**Non-goals:** UI, live APIs, push notifications.

**Files:** `src/store/types.ts`, `src/data/stock-signals.ts`

**Acceptance:** See `docs/education-roadmap.md` → E8.

**Claude Code:**

```text
Implement education phase E8 from docs/education-roadmap.md only.
Add StockSignal types and src/data/stock-signals.ts with 8-12 illustrative signals across 6+ symbols.
Include leadership-churn example. Factual tone only — no "sell" or "avoid" language.
No UI. npx tsc --noEmit. Do not implement E9+.
```
