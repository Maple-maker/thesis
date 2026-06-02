# CFO durable memory

## Do you have to feed it?

**No.** Memory grows automatically when you chat:

1. **Onboarding + profile** — seeded facts (goals, risk, debt, themes) on first launch.
2. **Heuristics (every message)** — on-device patterns catch first-person facts (goals, family, employer equity, amounts, fears, exclusions).
3. **LLM extract (Pro + server)** — after each reply, a small DeepSeek call pulls 0–3 atomic facts without duplicating existing notes.

Optional: **manual notes** in **Ask → Memory** (book icon in chat header) or long-press to delete a bad fact.

## Does it “train itself”?

**Not in the ML sense.** DeepSeek is not fine-tuned on your chats. What we do is **retrieval memory**:

- Facts are stored on device (AsyncStorage via Zustand persist).
- Every CFO turn injects the ranked memory bank into the system prompt.
- The model reads those facts like a briefing packet — that is how it “remembers” you across sessions.

This is the right pattern for privacy, cost, and App Store compliance (no hidden training on user PII without consent).

## Limits

| Setting | Value |
|---------|--------|
| Max notes | 160 |
| Max length / note | 500 chars |
| Dedup | Fuzzy overlap + substring merge |
| Eviction | Lowest score (importance + recency + source) when over cap |

## API

`POST /v1/memory/extract` — sidecar call; chat UI does not block on it.

## Future (not built yet)

- Server-side encrypted memory per `userId` (sync across devices)
- Vector search over notes for very large banks
- User toggle: “pause learning”
