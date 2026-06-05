# Today's plan — Thesis

**North star:** App Store Approved + TestFlight Beta Live by July 1

---

## Today (June 5)

### Done

| # | Task | Status |
|---|------|--------|
| ✅ | Fixed 3 TypeScript errors — `tsc --noEmit` now passes clean | A1 |
| ✅ | Fixed `NavigationTutorial` overlay — moved outside `<Screen>` so absolute positioning covers full viewport | A2 |
| ✅ | Verified Builder crash fix — imports coherent, `finalizePieRows` loose mode correct | A3 |
| ✅ | Wired thesis-health → model conviction view deep link (`?mode=model` query param + `ThesisHealthCard` deep link) | A4 |
| ✅ | Created centralized `pushRoute` / `pushRouteObject` helpers in `app-route.ts` — replaces 31 `as any` casts across builder, thesis-health, home, ask/chat, xray, watchlist, thesis-model, learn, and home components | A5 |
| ✅ | All changes committed | A6 |

### Remaining (June 6+)

- [ ] 51 remaining `as any` casts on router calls in peripheral files — pattern established, adopt over time
- [ ] Rotate committed secrets + `.gitignore` `server/.env` (B8)
- [ ] Set Fly.io production secrets (B1)
- [ ] Add `express-rate-limit` + `helmet` to server (B3, B7)
- [ ] Add Sentry error monitoring (B2)
- [ ] Add structured logging with `morgan` (B4)
- [ ] Fly.io health check config (B5)
- [ ] Tighten CORS origins (B6)
- [ ] Register `makeyourthesis.com` domain (C1)
- [ ] Deploy landing page (C2)
- [ ] Privacy Policy + Terms of Service (C4)
- [ ] Complete App Store Connect (C6)

---

## Run commands

```bash
# Local dev
npm run dev

# Typecheck
npx tsc --noEmit

# Server logs
fly logs -a thesis-server-beta

# EAS builds
eas build --platform ios --profile production --non-interactive
```
