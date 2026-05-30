# Education full program — Courses + AI assistant

**North star:** No finance degree required. Users **learn** foundations in structured **courses**, look up terms in the **glossary**, and **ask** questions framed by their thesis — without receiving buy/sell advice.

**Repo:** `Maple-maker/thesis`  
**How to run:** One phase per Claude Code session → `docs/current-slice.md` (Cursor copies phase block below).

---

## What already exists (build on this)

| Asset | Location |
|-------|----------|
| Concept glossary (40+ terms incl. credit score, compound interest, Roth vs traditional) | `src/data/concepts.ts` |
| Learn modal (tiered expandable cards) | `src/app/learn.tsx` |
| ExplainSheet + hook | `src/components/ExplainSheet.tsx`, `useExplainSheet.ts` |
| Profile-aware concept filter | `src/lib/concept-filter.ts` |
| Stock insights | `InsightCard`, `context-insights.ts` |

**Gap:** Glossary ≠ **courses** (ordered lessons, progress, takeaways). No **Ask** / AI assistant yet.

**UI reference (Robinhood Educate):** `docs/design-reference-robinhood-learn.md` — paginated lessons, hub + progress, optional knowledge checks. **Do not** copy Learn-and-Earn rewards or trade CTAs.

---

## Architecture overview

```text
Learn hub (/learn)
├── Ask Thesis      → AI chat (profile + themes context)
├── Courses         → catalog → course → lesson player → progress
└── Glossary        → existing concept cards (rename section)

Data
├── concepts.ts     → atomic definitions (reuse in lessons)
├── courses.ts      → Course + Lesson + ordered curriculum
└── assistant/      → context builder + API/mock responder

Store
├── courseProgress: Record<lessonId, completedAt>
└── chatMessages: persisted thread (optional cap)
```

---

## Product rules (non-negotiable)

### Courses

- Plain English, actionable where relevant (e.g. **how to build credit** — not just “what is a score”).
- Lessons can embed `ConceptId`s → open ExplainSheet on tap.
- **No** performance promises or “you should buy X.”

### AI assistant (“Ask Thesis”)

- Answers **educational** questions; explains how ideas relate to **their** horizon, risk, goals, and matched themes.
- **Must not:** recommend specific securities, timing the market, or personalized advice that sounds like an RIA.
- **Must:** show disclaimer on every thread; cite when answer is general vs tied to profile (“Given your long horizon…”).
- **v1 API:** `EXPO_PUBLIC_ANTHROPIC_API_KEY` for prototype only — document move to backend proxy before App Store.

---

## Phase map (implementation order)

### Track 0 — Finish contextual education (if not done)

| Phase | Task |
|-------|------|
| E3 | Duel metric → ExplainSheet |
| E4 | Stock stat → ExplainSheet |
| E5–E6 | TermLink + rollout |
| E8–E9 | Stock signals |

Skip if already shipped on `main`.

---

### Track C — Courses

| Phase | Name | Deliverable |
|-------|------|-------------|
| **C1** | Course data model | `src/data/courses.ts` + types |
| **C2** | Pilot curricula (4 courses) | Lesson copy for topics below |
| **C3** | Learn hub shell | `/learn` → Courses \| Glossary \| Ask entry |
| **C4** | Course + lesson screens | Routes + player UI |
| **C5** | Progress persistence | Zustand + AsyncStorage |
| **C6** | Profile-aware recommendations | “Start here” on Learn + Home |

#### C2 — Required pilot courses (minimum lessons)

1. **Money foundations** (4 lessons)  
   - What is interest? (borrowing vs earning)  
   - Compound interest  
   - Inflation & purchasing power  
   - Time value of money  

2. **Credit & borrowing** (4 lessons)  
   - What is a credit score?  
   - **How to build and protect your score** (actionable checklist)  
   - Why interest rates on debt matter  
   - Credit vs investing priorities (when to pay debt first — educational framing)  

3. **Retirement & tax-advantaged accounts** (4 lessons)  
   - What is a brokerage account?  
   - Roth vs traditional IRA (401k mention)  
   - Dollar-cost averaging in practice  
   - How this connects to your time horizon  

4. **Investing building blocks** (4 lessons)  
   - What is a stock? / What is an ETF?  
   - Diversification & risk vs return  
   - How themes in Thesis relate to your questionnaire  
   - What duels are for (decision clarity, not picks)  

Each lesson structure:

```ts
type Lesson = {
  id: string;
  courseId: CourseId;
  order: number;
  title: string;
  estimatedMin: number;
  sections: { heading?: string; paragraphs: string[] }[];
  keyTakeaways: string[];
  conceptLinks?: ConceptId[];  // tap opens ExplainSheet
  profileAside?: (profile: UserProfile) => string | null;
};
```

Add to `concepts.ts` only if missing: `interest-rate` (borrower APR vs savings yield) — or cover in lesson 1 of Money foundations.

---

### Track A — AI assistant

| Phase | Name | Deliverable |
|-------|------|-------------|
| **A1** | Context builder | `src/lib/assistant-context.ts` |
| **A2** | Response layer (mock + API) | `src/lib/assistant-chat.ts` |
| **A3** | Ask UI | `src/app/ask.tsx` or section in `/learn` |
| **A4** | Suggested questions | Chips from profile + themes |
| **A5** | Guardrails + errors | Refusals, rate limits, empty key → mock mode |

#### A1 — Context payload (include in system prompt)

- `UserProfile` summary (age band, horizon, risk, goals, experience, income need, top interests/concerns).  
- Top 3 `themeIds` + theme titles + one-line thesis each.  
- Explicit instruction block from `docs/assistant-system-prompt.md` (create in A1).  
- **Never** include raw API keys in repo.

#### A2 — Modes

```text
EXPO_PUBLIC_ASSISTANT_MODE=mock|api
EXPO_PUBLIC_ANTHROPIC_API_KEY=...   # dev only
```

- **mock:** 5–8 canned Q&A patterns + template answers using profile fields.  
- **api:** `fetch` to Anthropic Messages API (Haiku for cost); stream optional stretch.

#### A3 — UX

- Chat bubbles, input, send, loading.  
- Header: “Ask Thesis” + disclaimer subtitle.  
- Link “Learn a concept” → glossary with optional pre-filled search.

---

## Acceptance — “education fully built” (v1)

- [ ] 4 courses, 16 lessons total, readable in Simulator  
- [ ] Lesson completion persists across app restart  
- [ ] Learn hub has clear entry to Courses, Glossary, Ask  
- [ ] Ask returns answers that reference user horizon/themes when relevant  
- [ ] Ask refuses “what stock should I buy” with educational redirect  
- [ ] Disclaimers on Learn, Ask, and course intro  
- [ ] `npx tsc --noEmit` passes  
- [ ] README notes API key + not investment advice  

---

## Cursor → Claude Code workflow

1. Copy **one phase section** into `docs/current-slice.md`.  
2. Paste **Session kickoff** from `docs/education-slices/MASTER-education-build.md`.  
3. After phase passes acceptance, commit + push.  
4. Next phase.

**Do not** ask Claude Code to “build all education” in one session — use phased map above.
