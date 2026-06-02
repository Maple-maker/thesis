# CFO plumbing vs “training”

Claude’s diagnosis for the rare-earth / commodities screenshots is **correct**: that was a **plumbing** bug, not a weak model.

## What went wrong (screenshots)

| Symptom | Cause |
|---------|--------|
| Identical “try rephrasing…” paragraph every time | **Hardcoded fallback** in `cfo-mock-replies.ts` when the API was not reached |
| Good answers only for holdings / in-app data | **Structured router** + mock path ran **before** DeepSeek |
| Rare earth / commodities failed | No template in `cfo-router.ts` → fell through to mock |

An LLM does not emit the same multi-sentence block verbatim on different questions. That pattern means **code short-circuited the model**.

## What we fixed (current behavior)

1. **Pro + `EXPO_PUBLIC_THESIS_API_URL` → DeepSeek first** (`assistant-chat.ts`) with full wizard prompt, memory, holdings, 16-turn history.
2. **Structured router = fallback only** when the server errors or is offline.
3. **Commodity / rare-earth templates** in `sector-etfs.ts` + `cfo-router.ts` for offline dev.
4. **Removed** the old “try rephrasing with more specificity” boilerplate.
5. **Auto memory** — see `docs/assistant-memory.md` (retrieval, not fine-tuning).

## This is not “training”

| Approach | What it does | Thesis |
|----------|----------------|--------|
| Fine-tuning | Changes model weights | **No** — stale facts, cost, legal noise |
| RAG / memory injection | Facts in every prompt | **Yes** — profile, holdings, durable memory |
| Tool calling | Live Fed rate, prices | **Planned** — see `docs/cfo-live-data.md` |

## Debug: was DeepSeek actually called?

**Simulator Metro logs** (dev):

```
[CFO] mode=api provider=deepseek model=deepseek-v4-flash chars=…
```

If you see `mode=structured` or `mode=mock`, the model was **not** used.

**Server** (optional):

```bash
ASSISTANT_DEBUG=1 npm run server:dev
```

Logs `[chat] … provider=deepseek …` per request.

## Model name

Default is now **`deepseek-v4-flash`** (`deepseek-chat` deprecates July 2026). Override in `server/.env`:

```env
ASSISTANT_MODEL_PRO=deepseek-v4-flash
ASSISTANT_MODEL_FREE=deepseek-v4-flash
```

## Product line (liability)

The CFO **explains** tradeoffs and frameworks and **declines** buy/sell orders — same as Claude’s recommendation. Moat = **context** (profile + book + memory), not a secret smarter brain.

## Related

- `docs/assistant-system-prompt.md`
- `docs/cfo-live-data.md` (Phase 3: live macro/prices)
