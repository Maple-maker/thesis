# Cursor prompt — Vault-sourced education enrichment

Copy the block below, paste into Cursor.

---

```text
Repo: Maple-maker/thesis — git pull origin main.

Read in order:
1. CLAUDE.md
2. AGENTS.md
3. docs/education-slices/E10b-vault-source-enrichment.md ← THIS is your task spec
4. src/data/courses.ts
5. src/data/courses-topic-packs.ts
6. src/data/concepts.ts

Then read these 6 AEGIS vault files (paths: /Users/jaidenrabatin/Documents/aegis_vault/):
- wiki/sources/the-psychology-of-money.md
- wiki/sources/the-intelligent-investor.md
- wiki/sources/i-will-teach-you-to-be-rich.md
- wiki/sources/financial-literacy-foundations.md
- wiki/concepts/margin-of-safety.md
- wiki/concepts/psychology-of-money.md

Task: Enrich Thesis education courses using vault source material.

PART A (light) — In src/data/courses.ts, enrich 8 existing lessons with profileAside, didYouKnow, and new content steps drawing from Housel/Graham/Sethi. See E10b spec for exact lesson map.

PART B (medium) — In src/data/courses-topic-packs.ts, expand these 5 courses to 3–4 lessons each:
- behavioral-investing (add "Enough" + "Reasonable > Rational" lessons)
- risk-volatility (add "Volatility is the fee" + "Margin of safety in practice" lessons)
- recession-resilience (add "Mr. Market and panics" + "Seduction of pessimism" lessons)
- bitcoin-101 (add "What makes money sound" + "Bitcoin and modern portfolio" lessons)
- diversification-essentials (add "Graham's defensive portfolio" lesson)

Key vault insights to weave in (see E10b spec for full quote bank):
- Housel: freedom as highest wealth; compounding counterintuitive; room for error; wealth is what you don't see; "enough" as superpower
- Graham: Mr. Market; margin of safety; investor's worst enemy is themselves
- Sethi: conscious spending; 85% solution; automation beats willpower; invisible money scripts

Rules:
- Educational only — no buy/sell recommendations
- Quiz every lesson (≥1 quiz step)
- ProfileAside on ≥1 step per lesson
- Use conceptLinks from existing concepts.ts
- Add new ConceptId entries to concepts.ts if a vault concept is missing
- Reuse q() and c() and lesson() helpers from topic-packs file
- npx tsc --noEmit after each course
- Do not commit unless asked

Report: files changed, lessons added, concepts added, Simulator QA steps.
```
