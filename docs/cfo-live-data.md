# CFO live data (macro tools)

Frozen models cannot know **today's** Fed funds rate, Treasury yields, or fresh Fed headlines. The server **fetches then answers** via tool calling and macro prefetch.

## Architecture

```text
User: "What is the Fed funds rate doing to my growth tilt?"
  → isMacroQuestion? → prefetch snapshot into system prompt
  → (if ASSISTANT_TOOLS ≠ 0) DeepSeek tool loop:
       get_fed_funds_rate / get_macro_snapshot / get_fed_headlines
  → Model answers with live figures + holdings context
```

## Tools (`server/src/tools/`)

| Tool | Source | Data |
|------|--------|------|
| `get_fed_funds_rate` | FRED `FEDFUNDS` | Effective Fed funds % |
| `get_treasury_yields` | Treasury.gov XML | 2y, 10y, 10y−2y spread |
| `get_fed_headlines` | Fed RSS `press_all.xml` | Recent press titles |
| `get_macro_snapshot` | All of the above | One-shot bundle |

Treasury yields work **without** an API key. FRED requires a free key for Fed funds + CPI index.

## Env (`server/.env`)

```bash
ASSISTANT_TOOLS=1          # default on; set 0 to disable tool loop
FRED_API_KEY=...           # https://fred.stlouisfed.org/docs/api/api_key.html
```

## HTTP

- `GET /v1/macro/snapshot` — JSON for Learn/Home **Macro & markets** card
- `GET /v1/health` — includes `macro.toolsEnabled` and `fredApiKey`

## Client

- `src/lib/macro-api.ts` — fetch snapshot
- `src/components/macro/MacroMarketsCard.tsx` — Learn + Home
- Ask prompt chips: **Fed & rates**, **Macro news**
- System prompt (`assistant-context.ts`) instructs model to cite live block

## Compliance

Live figures still end with: *Educational tool — not investment advice.* No "buy now because rate is X."
