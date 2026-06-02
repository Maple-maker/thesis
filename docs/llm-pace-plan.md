# LLM PACE plan (Primary → Alternate → Contingency → Emergency)

The Thesis API tries providers **in order** until one succeeds. Keys live only in `server/.env` — never in the mobile app.

## Default chain

| Step | Role | Provider | Default model | Typical cost |
|------|------|----------|---------------|--------------|
| **P** | Primary | DeepSeek | `deepseek-v4-flash` | 1M context, tools; `deepseek-chat` deprecated Jul 2026 |
| **A** | Alternate | Anthropic | `claude-3-5-haiku-20241022` | Cheap Claude fallback |
| **C** | Contingency | OpenAI | `gpt-4o-mini` | Widely available backup |
| **E** | Emergency | Google Gemini | `gemini-2.0-flash-lite` | Very cheap last resort |

## Configure `server/.env`

```env
ASSISTANT_PACE=deepseek,anthropic,openai,gemini

DEEPSEEK_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

You only need **one** key minimum. Add more for automatic failover.

### Reorder or skip steps

```env
# Primary + emergency only
ASSISTANT_PACE=deepseek,gemini

# Anthropic-only stack
ASSISTANT_PACE=anthropic,openai
```

### Per-step models

```env
ASSISTANT_MODEL_PRO=deepseek-v4-flash
ASSISTANT_MODEL_FREE=deepseek-v4-flash
PACE_ALTERNATE_MODEL_PRO=claude-3-5-haiku-20241022
PACE_CONTINGENCY_MODEL=gpt-4o-mini
PACE_EMERGENCY_MODEL=gemini-2.0-flash-lite
```

## Verify

```bash
npm run server:dev
curl -s http://localhost:8787/v1/health | python3 -m json.tool
```

Look for `pace.configured` — lists which steps have keys.

```bash
npm run server:test-chat
```

Response JSON includes `provider`, `paceStep` (`P`|`A`|`C`|`E`), and `attempted` if a fallback was used.

## What is NOT in PACE

| Service | Why |
|---------|-----|
| **Cursor (IDE + Agent SDK)** | `CURSOR_API_KEY` powers **repo agents** (`Agent.prompt`, cloud/local runs) — not a drop-in Messages API for mobile chat. Use Cursor to **build** Thesis; use **DeepSeek** (or OpenAI/Gemini) on the server for **in-app** CFO chat. See [Cursor SDK](https://cursor.com/docs/sdk/typescript). |
| **ChatGPT app** | Consumer UI — use **OpenAI API** key instead |
| **Claude.ai web** | Use **Anthropic API** key instead |

### DeepSeek only (no Anthropic)

```env
ASSISTANT_PACE=deepseek
DEEPSEEK_API_KEY=sk-...
```

Anthropic is optional failover — remove it from `ASSISTANT_PACE` if you do not have `ANTHROPIC_API_KEY`.

For a single key that routes many models, consider [OpenRouter](https://openrouter.ai) as **Contingency** by setting:

```env
OPENAI_API_KEY=sk-or-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
PACE_CONTINGENCY_MODEL=anthropic/claude-3.5-haiku
```

## App behavior

1. **Pro + backend configured:** **DeepSeek first** with full wizard prompt, memory, themes, holdings, and ~16-turn session history (~2.8k max output tokens).
2. **Fallback:** structured router (`cfo-router.ts`) if the server is down — instant ETF/holdings templates.
3. **Offline dev:** mock / structured only without `EXPO_PUBLIC_THESIS_API_URL`.

## Cost tips

- Keep **Haiku** on Alternate, not Sonnet, unless you need harder reasoning.
- Pro free tier can share `ASSISTANT_MODEL_FREE=deepseek-chat` for both tiers.
- Log `paceStep` in analytics to see how often you fall through to C/E.

## Related

- `server/src/llm.ts` — implementation
- `docs/assistant-cost-model.md` — product economics
