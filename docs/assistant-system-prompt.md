# Ask Thesis — system prompt

**Source of truth:** `THESIS_LENS_SYSTEM_PROMPT` in `src/lib/assistant-context.ts`

## Architecture (robust open Q&A)

Pro chat is **LLM-only** (DeepSeek V4 + PACE fallbacks on server). There is **no** intent router or ETF template layer in the hot path — only a hard **trade-refusal** guard.

See `docs/cfo-architecture.md`.

## Quality bar

- Answer the exact question with depth and specifics (tickers, frameworks, tradeoffs).
- Use profile, themes, memory, holdings when present.
- General knowledge allowed when app data does not cover the topic.
- Never “try rephrasing”; never dev/setup text in user bubbles.

## Model

`deepseek-v4-flash` via `POST /v1/chat`. Server auto-retries weak answers; client retries with compact context if the first request fails.

## Education-first in chat

CFO replies render **tappable links** for glossary terms (e.g. inflation hedge), **stocks**, and **ETFs** — opens Learn sheet or symbol actions (view, watchlist, duel). See `src/lib/message-entities.ts` and `InteractiveMessageText`.
