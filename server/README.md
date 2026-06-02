# Thesis API

Backend for **Pro AI CFO** chat (Anthropic proxy), entitlements, and RevenueCat webhooks.

## Run locally

**Does not launch the iOS Simulator** — only the Node API (default port 8787).

From repo root:

```bash
npm run server:install   # once
npm run server:dev
```

Or inside `server/`: `cp .env.example .env`, add `DEEPSEEK_API_KEY`, then `npm run dev`.

**Simulator / app** — use a **second terminal** at repo root:

```bash
npm run ios:sim    # Expo Metro + open iOS Simulator
# or after native deps change (slider, purchases, etc.):
npm run dev:ios    # expo run:ios — full native build
```

App env:

```bash
EXPO_PUBLIC_THESIS_API_URL=http://localhost:8787
EXPO_PUBLIC_THESIS_APP_KEY=dev-shared-secret-change-me
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/health` | Health check |
| POST | `/v1/chat` | AI CFO chat (Pro uses Sonnet; free uses Haiku + shorter) |
| POST | `/v1/webhooks/revenuecat` | Sync Pro entitlement |

## RevenueCat

1. Create entitlement `pro` in RevenueCat.
2. Point webhook to `https://your-api/v1/webhooks/revenuecat`.
3. Use the same `app_user_id` as the app's `thesisUserId` in Zustand.

## Deploy

Railway, Fly.io, or Render — set env vars from `.env.example`. Use Redis/DB for `entitlements.ts` before scale.
