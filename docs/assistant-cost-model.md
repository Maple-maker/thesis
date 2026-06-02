# Ask Thesis — cost model & monetization

**Goal:** Opus-class *reasoning quality* in product UX without Opus-class *burn* on every tap.

---

## Cost drivers

| Driver | Notes |
|--------|--------|
| **Context size** | Full CFO profile + themes + memory ≈ 2–6k tokens/system message. Keep stable via `assistant-context.ts`; avoid re-sending huge JSON. |
| **Model tier** | **DeepSeek** (`deepseek-chat`) default on server — strong profile-heavy chat at low $/token; Anthropic fallback optional. |
| **History window** | Last 6 turns only in API payload (see `assistant-chat.ts`). |
| **Client API keys** | `EXPO_PUBLIC_*` is **dev only** — ship production through your backend proxy + per-user quotas. |

Rough order-of-magnitude (Sonnet-class, 4k in / 800 out): **~$0.01–0.02 per message**.  
1k daily active users × 5 messages/day ≈ **$50–100/day** without caps.

---

## Recommended architecture (production)

```text
App → Thesis API (auth) → router
                          ├── quota check (free / pro)
                          ├── context builder (same as A1)
                          ├── model router (haiku | sonnet | opus-tier)
                          └── logging (tokens, cost, no PII in logs)
```

**Never** put Anthropic keys in the mobile binary for App Store builds.

---

## Model routing (quality vs cost)

| Tier | Model (example) | Use case |
|------|-----------------|----------|
| **Free** | Haiku / small fast | Quick definitions, glossary-style |
| **Pro** | DeepSeek chat / reasoner | Multi-step reasoning, holdings + profile citations |
| **Deep dive** (capped) | Opus-class | Scenario compare, long explainers — **5–10 / month** |

“Opus 4.8 level” in UX means: **strong system prompt + rich stored context + step-by-step instructions**, not necessarily Opus on every request.

---

## Monetization ideas (cover API + margin)

1. **Freemium quota** — 12 messages/day free (`assistant-chat.ts` default); Pro 40+.
2. **Thesis Pro subscription** — $6–12/mo: higher quota, Sonnet default, export CFO summary.
3. **Deep dive packs** — IAP: +20 scenario analyses / month.
4. **Affiliate (already aligned)** — ETF/stock education links; broker referral — **disclosed**, not conflated with advice.
5. **B2B / advisor white-label** — CFO profile export for RIAs (they give advice; you give education infra).

---

## Guardrails that also save money

- Refuse stock picks early (short template → fewer tokens).
- Suggest in-app courses instead of generating 2k-word essays.
- Cache answers for top FAQ chips (optional CDN).
- `mock` mode for demos, tests, and offline review.

---

## Env vars (dev)

```bash
EXPO_PUBLIC_ASSISTANT_MODE=mock|api
EXPO_PUBLIC_ANTHROPIC_API_KEY=...   # dev only
EXPO_PUBLIC_ASSISTANT_MODEL=claude-sonnet-4-20250514
```

---

## Next implementation (A2 → A3)

- [ ] Wire `sendAssistantMessage` in Ask chat UI
- [ ] Persist `chatMessages` + daily quota in store
- [ ] Backend proxy before public launch
- [ ] RevenueCat / StoreKit for Pro tier
