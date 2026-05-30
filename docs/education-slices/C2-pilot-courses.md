# Claude Code — C2 Pilot course content

```text
Repo: Maple-maker/thesis — git pull origin main first.

Read:
1. CLAUDE.md
2. docs/education-full-program.md (section C2)
3. docs/design-reference-robinhood-learn.md (steps + quiz pattern)
4. src/data/courses.ts (C1 skeleton — empty lessons[])
5. src/data/concepts.ts (reuse ConceptIds for conceptLinks)

Implement ONLY phase C2. No UI routes (C3/C4).

## Task

Populate all 4 courses with 4 lessons each (16 lessons total) in src/data/courses.ts.

### 1) Upgrade lesson model (if still using sections[])

Migrate to Robinhood-style steps per design-reference-robinhood-learn.md:

- LessonStep: kind "content" | "quiz"
- Lesson: steps[], estimatedMin, keyTakeaways[], optional courseMetaphor on Course
- Remove or migrate away from sections[] — C4 player expects steps

Each content step: 2–5 screens per lesson (short paragraphs, one idea per step).
Each lesson: include at least 1 quiz step at the end (2–3 options, correctFeedback / incorrectFeedback).
First step of each lesson can mirror intro (title + time estimate via estimatedMin on lesson).

### 2) Four courses — lesson titles

**money-foundations**
1. What is interest? (borrowing vs saving)
2. Compound interest
3. Inflation & purchasing power
4. Time value of money

**credit-borrowing**
1. What is a credit score?
2. How to build and protect your score (actionable bullets in steps)
3. Why interest rates on debt matter
4. Credit vs investing priorities (educational, not prescriptive)

**retirement-accounts**
1. What is a brokerage account?
2. Roth vs traditional IRA (mention 401k)
3. Dollar-cost averaging in practice
4. How this connects to your time horizon

**investing-building-blocks**
1. What is a stock? / What is an ETF? (smoothie-style metaphor OK for ETF steps — courseMetaphor)
2. Diversification & risk vs return
3. How Thesis themes relate to your questionnaire
4. What duels are for (decision clarity, not picks)

### 3) Personalization

- profileAside on ≥8 lessons total (functions using UserProfile: horizon, risk, primaryGoal, hasHighInterestDebt, hasEmergencyFund, experience)
- conceptLinks on steps where terms exist in concepts.ts (credit-score, compound-interest, roth-vs-traditional, what-is-etf, diversification, etc.)
- Add concept id "interest-rate" to concepts.ts ONLY if needed for links (borrower APR vs savings yield)

### 4) Copy rules

- Plain English, educational only — NOT investment advice
- No buy/sell/recommend specific securities
- No "fund your account" / Robinhood CTAs
- Bold terms in prose as plain text (no markdown renderer required)
- optional didYouKnow on some content steps

### 5) Quizzes

- ≥8 quiz steps total across 16 lessons (at least 1 per lesson)
- Example: "What does compound interest mean?" / credit score range / Roth vs Traditional difference

### 6) Do NOT

- Add src/app/courses/* screens
- Implement Ask assistant (A1+)
- Change theme-engine or onboarding

When done:
- npx tsc --noEmit
- List lesson counts per course
- List acceptance checks satisfied
```
