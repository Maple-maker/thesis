# Subscription tiers, backend & credit hub

## Tiers

| Feature | Free | Pro |
|---------|------|-----|
| Thesis Builder + themes | ✓ | ✓ |
| ETF screener & analysis | ✓ | ✓ |
| Thesis Radar / briefings | ✓ | ✓ |
| Suggestions (prompt chips) | ✓ | ✓ |
| Affiliate tools (disclosed) | ✓ | ✓ |
| Credit hub (cards, guides, points) | ✓ | ✓ |
| Learn courses | ✓ | ✓ |
| **AI CFO chat** | — | ✓ |
| Deep CFO profile / research | — | ✓ |

Code: `src/data/subscription-tiers.ts`, `src/lib/feature-gate.ts`

## Backend (`server/`)

```bash
cd server && npm install && npm run dev
```

App:

```bash
EXPO_PUBLIC_THESIS_API_URL=http://localhost:8787
EXPO_PUBLIC_THESIS_APP_KEY=<same as THESIS_APP_SECRET>
```

Chat: `POST /v1/chat` — Pro users get Sonnet; free tier blocked from CFO chat in app UI.

RevenueCat webhook: `POST /v1/webhooks/revenuecat` — set `app_user_id` = `thesisUserId` from Zustand.

## Billing (RevenueCat)

```bash
npx expo install react-native-purchases
```

Env:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

Create entitlement **`pro`** and offering **`default`** with monthly package.

Paywall: `/pro` — dev fallback enables Pro when keys missing.

## Credit hub (NerdWallet / TPG)

Routes:

- `/credit` — hub
- `/credit/cards` — compare + filters
- `/credit/cards/[id]` — detail + affiliate CTA
- `/credit/guides/[id]` — long-form guides
- `/credit/score` — score education
- `/credit/points` — travel & points primer

Data: `src/data/credit/cards.ts`, `guides.ts` — expand card catalog and swap affiliate URLs when partners sign.

## Affiliate

All offer surfaces use `AFFILIATE_DISCLOSURE`. Credit cards link via `affiliateOfferId` → `affiliate-offers.ts`.
