# Today's plan — Thesis

**North star:** TestFlight beta live + app passes review

## Accomplished yesterday (June 2)

| Done | What |
|------|------|
| ✅ | Server deployed to Fly.io — `thesis-server-beta.fly.dev` |
| ✅ | Dockerfile + fly.toml + secrets for production server |
| ✅ | EAS project configured (`@maplemaker/thesis`) |
| ✅ | Apple Developer: App ID + distribution cert + provisioning profile |
| ✅ | 2 iOS builds completed (build #1 submitted to App Store Connect) |
| ✅ | App secret rotated (no more `dev-shared-secret-change-me`) |
| ✅ | Fear & Greed Index redesigned as speedometer gauge |
| ✅ | App Review Guide + review notes written |

---

## Today (June 3)

### Priority 1 — Finish TestFlight submission

- [ ] Submit build #2 to App Store Connect (`eas submit --platform ios`, select latest build)
- [ ] Complete App Store Connect setup:
  - App description, keywords, category (Finance)
  - Privacy policy URL (need one live — can use a simple landing page)
  - Age rating questionnaire
  - App Review Information (paste notes already written)
  - Upload review guide (.doc or .rtf)
  - Screenshots (can use simulator screenshots for now)

### Priority 2 — Verify everything works

- [ ] Connect app to production server — test on device:
  - Fear & Greed Index loads
  - Ask CFO chat works
  - Market search/quote functional
  - Portfolio X-Ray
  - Event briefs
- [ ] Server health check — `curl https://thesis-server-beta.fly.dev/v1/health`
- [ ] Check server logs for errors: `fly logs -a thesis-server-beta`

### Priority 3 — Clean up

- [ ] Commit all changes: `git add -A && git commit -m "prod: Fly.io deploy, EAS/TestFlight setup, speedometer gauge"`
- [ ] Remove old `@maplemaker/thesis-api` EAS project (wrong one from server directory)
- [ ] Update `docs/today.md`

---

## Run commands

```bash
# Local dev (still works)
npm run dev

# Server logs
fly logs -a thesis-server-beta

# EAS builds
eas build --platform ios --profile production --non-interactive

# Submit to TestFlight
eas submit --platform ios
```

---

## Blockers

```text
1. Apple review — may take 24-48 hours for first submission
2. Privacy policy URL needed for App Store Connect
3. Server is fly.io free tier — watch for limits
```

---

## Server info

| Thing | Value |
|-------|-------|
| URL | `https://thesis-server-beta.fly.dev` |
| App | `thesis-server-beta` |
| IP | `66.241.124.229` |
| Health | `GET /v1/health` |

## EAS info

| Thing | Value |
|-------|-------|
| Project | `@maplemaker/thesis` |
| ID | `d25b92e4-cca0-4231-995e-827934fe51a6` |
| Bundle ID | `com.makeyourthesis.app` |
| Team | XYALA22765 (JAIDEN DAVID RABATIN) |
