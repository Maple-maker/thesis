# CFO chat architecture (robust LLM-first)

## Product requirement

Users ask **arbitrary** investing questions. Target: **≥80%** of turns get a substantive, on-topic answer (not rephrase prompts, not dev errors, not template stubs).

## How we meet it

| Layer | Role |
|--------|------|
| **DeepSeek V4 Flash (PACE)** | Primary reasoning — general knowledge + user context |
| **PACE fallbacks** | Anthropic / OpenAI / Gemini if DeepSeek fails |
| **Quality retry (server)** | If answer &lt;140 chars or “rephrase”, one automatic regen |
| **Compact retry (client)** | If full context request fails, retry smaller context — still LLM |
| **Trade refusal (guard)** | Only non-LLM path — compliance |
| **Structured router** | **Not used in Pro chat** — was blocking the model on unmatched intents |

## What we removed from the hot path

- Intent classifier → canned ETF templates before LLM
- Mock “connect your server” bubbles in user chat
- Duplicate session text in system + history

## What still depends on ops

- API must be reachable from the app (production: hosted `thesis-api`, not localhost)
- At least one PACE API key on the server

Accuracy is **not** from fine-tuning; it is **model + prompt + context + failover**.

## Eval

`server/scripts/eval-cfo.mjs` — golden questions; run in CI or before release.
