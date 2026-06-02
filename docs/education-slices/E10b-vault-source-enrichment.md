# Cursor Prompt — Enrich Thesis Education with AEGIS Vault Sources

**Vault path:** `/Users/jaidenrabatin/Documents/aegis_vault`
**Thesis repo:** `Maple-maker/thesis`
**Task:** Read vault sources → enrich existing courses + flesh out stubbed topic-pack courses.

---

## Pre-flight (do this first)

```bash
git pull origin main
```

Read in order:
1. `CLAUDE.md`
2. `AGENTS.md`
3. `src/data/courses.ts` (4 core courses, fully built — 16 lessons)
4. `src/data/courses-topic-packs.ts` (10 topic-pack courses, lightly populated — ~2 lessons each)
5. `src/data/concepts.ts` (40+ concept definitions)

Then read these 6 vault source files (paths relative to `/Users/jaidenrabatin/Documents/aegis_vault/`):
1. `wiki/sources/the-psychology-of-money.md` — Housel: behavior > intelligence, luck/risk symmetry, "enough", freedom, compounding, room for error
2. `wiki/sources/the-intelligent-investor.md` — Graham: Mr. Market, margin of safety, investment vs speculation, defensive/enterprising, inflation
3. `wiki/sources/i-will-teach-you-to-be-rich.md` — Sethi: conscious spending, automation, invisible money scripts, 85% solution
4. `wiki/sources/financial-literacy-foundations.md` — ILO/AFG/OECD/Métis/CFEE: budgeting, 12 principles, financial literacy stack
5. `wiki/concepts/margin-of-safety.md` — Graham + Housel synthesis; applications to position-sizing and life
6. `wiki/concepts/psychology-of-money.md` — Behavioral finance synthesis; invisible scripts; "reasonable > rational"; freedom as wealth

---

## What to build

### PART A — Enrich existing pilot courses (light touch)

In `src/data/courses.ts`, add profileAside, didYouKnow, and conceptLinks drawing from vault sources. **Do not restructure lessons — just enrich existing step content.**

| Lesson | Vault Source | What to Add |
|--------|-------------|-------------|
| `mf-compound-interest` (L2) | Psychology of Money Ch.4 "Confounding Compounding" | Add didYouKnow: "Warren Buffett's $84.5B net worth — $81.5B came after age 65." Add step: "Why compounding feels counterintuitive" (ice age metaphor) |
| `mf-inflation` (L3) | Intelligent Investor Ch.2; margin-of-safety.md | Add profileAside for long-horizon users: "Inflation is Graham's permanent risk to savers — this is why cash is not truly 'safe' over decades." |
| `mf-time-value-money` (L4) | Psychology of Money Ch.10 "Save Money" | Add Housel insight: "Wealth is the money not spent. Savings rate matters more than investment returns." |
| `cb-credit-vs-investing` (L4) | IWTYTBR Ch.1 "The 85% Solution" | Add Sethi: "Getting started is more important than getting it perfect. 85% of the way is far better than 0%." |
| `ra-dollar-cost-averaging` (L3) | Psychology of Money Ch.13 "Room for Error" | Add Housel: margin of safety is the gap between what could happen and what you need to happen |
| `ra-time-horizon` (L4) | Psychology of Money Ch.7 "Freedom" | Add: "The highest form of wealth is control over your time. Retirement accounts are time-freedom machines." |
| `ib-diversification-risk` (L2) | Intelligent Investor — defensive investor | Add Graham: defensive investor default; broad diversification is the rational base case |
| `ib-what-are-duels` (L4) | Psychology of Money Ch.1 "No One's Crazy" | Add Housel: different investors play different games — duels reveal YOUR game |

### PART B — Flesh out stubbed topic-pack courses (medium effort)

The file `src/data/courses-topic-packs.ts` has 10 courses with ~2 lessons each. **Focus on these 5 that map directly to vault sources.** Bring each to 3–4 lessons.

#### 1. `behavioral-investing` (currently ~2 lessons → expand to 4)

Vault sources: Psychology of Money (Housel) + margin-of-safety + psychology-of-money concept

New lessons to add:
- **L3: "Enough" — the hardest financial skill** — Rajat Gupta/Madoff case studies from Housel Ch.3. Social comparison ceiling. "There is no reason to risk what you have and need for what you don't have and don't need." (use `q()` quiz: "What is the hardest financial skill?")
- **L4: Reasonable > Rational** — Housel Ch.11. The optimal portfolio on a spreadsheet means nothing if you panic-sell. "The best strategy is the one you can stick with." Connect to Sethi's 85% solution. ProfileAside: map to user's risk tolerance.

#### 2. `risk-volatility` (currently ~2 lessons → expand to 4)

Vault sources: Intelligent Investor (Graham) + margin-of-safety + Psychology of Money

New lessons to add:
- **L3: Volatility is the fee, not the fine** — Housel Ch.15 "Nothing's Free." Market declines are the admission ticket for long-term returns. If you view them as fines, you'll never pay and miss the returns. conceptLinks: ["volatility", "drawdown"]
- **L4: Margin of safety in practice** — Graham's central concept applied to position-sizing, cash reserves, career buffer. "The best investors plan on things not going according to plan." Portfolio application: conservative assumptions, flexible timeline, sleep-well allocations.

#### 3. `recession-resilience` (currently ~2 lessons → expand to 4)

Vault sources: Intelligent Investor (Mr. Market) + Psychology of Money (Surprise! + Seduction of Pessimism)

New lessons to add:
- **L3: Mr. Market and market panics** — Graham's metaphor. "The market is a voting machine in the short run, weighing machine in the long run." During recessions, Mr. Market is depressed — that's opportunity, not emergency. ConceptLinks: ["market-cap", "volatility", "drawdown"]
- **L4: The seduction of pessimism** — Housel Ch.17. Pessimism sounds smarter; optimism has a better track record. Markets rise ~70% of years and fall ~30%. The historically correct bet is sustained optimism — but that's also why margin of safety matters.

#### 4. `bitcoin-101` (currently ~2 lessons → expand to 4)

Vault sources: all existing Bitcoin concept pages (`sound-money.md`, `stock-to-flow.md`, `bitcoin.md`) + margin-of-safety + psychology-of-money

**Important:** Educational only, no buy/sell recommendations. Frame as monetary technology education.

New lessons to add:
- **L3: What makes money sound** — Sound money concept. The six properties (divisible, portable, durable, fungible, verifiable, scarce). History: bezant → gold standard → fiat → digital scarcity. Why money quality shapes time-preference and society. conceptLinks: ["inflation", "diversification"]
- **L4: Bitcoin and the modern portfolio** — Volatility ≠ permanent loss risk when time horizon is long. Housel's "freedom as highest wealth" maps to financial sovereignty. Margin of safety via position sizing. "The cheapest way to buy the future" — Ammous. **Must include disclaimer:** "Bitcoin is a volatile emerging asset. This lesson explains the technology and monetary theory — it is not a recommendation to buy or sell."

#### 5. `diversification-essentials` (currently ~2 lessons → expand to 3)

Vault sources: Intelligent Investor (defensive investor) + AFG 12 Principles

New lesson to add:
- **L3: Graham's defensive portfolio** — The intelligent investor's default: broad diversification, dollar-cost averaging, rebalancing. "The defensive investor splits between high-grade bonds and diversified common stocks." How ETFs made this trivial. AFG principles: define your requirement → set target → define horizon → diversify → save regularly. conceptLinks: ["diversification", "etf", "expense-ratio"]

---

## Key vault insights to weave throughout

These are reusable quote/insight blocks. Pull them in wherever they fit naturally:

```
Housel: "Compounding is the most powerful force in the universe. The counterintuitive nature of compounding leads even the smartest to overlook its power."

Housel: "The highest form of wealth is the ability to wake up every morning and say, 'I can do whatever I want today.'"

Housel: "Wealth is what you don't see. It's the cars not purchased, the watches not worn."

Housel: "Room for error — often called margin of safety — is the most underrated force in finance."

Graham: "The investor's chief problem — and even his worst enemy — is likely to be himself."

Graham: "The intelligent investor is a realist who sells to optimists and buys from pessimists."

Sethi: "Spend extravagantly on the things you love and cut costs mercilessly on the things you don't."

Sethi: "The single most important factor to getting rich is getting started, not being the smartest person in the room."

AFG: "Time is your ally."
```

---

## Rules (non-negotiable)

- **Educational only** — not investment advice. No "you should buy X."
- **Daylight UI** — reuse `src/components/ui/*` patterns
- **No trade CTAs** in lessons
- **Use existing conceptLinks** — pull from `src/data/concepts.ts` ConceptId union where possible. If a vault concept is missing, add it to concepts.ts first.
- **Quiz every lesson** — at least 1 quiz step per lesson (use `q()` helper)
- **ProfileAside on ≥1 step per lesson** — personalize from UserProfile (horizon, risk, experience, goals, etc.)
- `npx tsc --noEmit` before done
- **Do not commit** unless explicitly asked

---

## Order of execution

1. **PART A first** — enrich existing 4 core courses (8 lesson touchpoints, light)
2. **PART B second** — flesh out the 5 target topic-pack courses (behavioral-investing, risk-volatility, recession-resilience, bitcoin-101, diversification-essentials)
3. `npx tsc --noEmit` after each course is complete

Report: files changed, new lessons added, concepts added (if any), manual QA steps in Simulator.

---

## Vault source quick-reference (for lesson writing)

| If you need... | Open this vault file |
|---|---|
| Behavioral stories (Gupta, Madoff, Read, Fuscone) | `wiki/sources/the-psychology-of-money.md` |
| Mr. Market, margin of safety definition | `wiki/sources/the-intelligent-investor.md` |
| Conscious spending, invisible scripts, automation | `wiki/sources/i-will-teach-you-to-be-rich.md` |
| Budgeting, 12 principles, financial literacy stack | `wiki/sources/financial-literacy-foundations.md` |
| Margin of safety applied to Bitcoin/life | `wiki/concepts/margin-of-safety.md` |
| Behavioral finance synthesis | `wiki/concepts/psychology-of-money.md` |
| Sound money, stock-to-flow, Austrian economics | `wiki/concepts/sound-money.md`, `wiki/concepts/stock-to-flow.md` |
| Bitcoin 101 content | `wiki/concepts/bitcoin.md`, `wiki/sources/the-bitcoin-standard.md` |
| Time preference | `wiki/concepts/time-preference.md` |
| Monetary inflation | `wiki/concepts/monetary-inflation.md` |
