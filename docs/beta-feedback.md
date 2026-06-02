# Thesis Beta — Bug & Feedback Log

> **How to report:** Add entries below. Include device (Simulator/iPhone/Android), steps to reproduce, and expected vs actual behavior.
> **Priority:** 🔴 Blocker · 🟠 High · 🟡 Medium · ⚪ Low

---

## Bugs

| # | Priority | Date | Reporter | Summary | Repro steps | Status |
|---|----------|------|----------|---------|-------------|--------|
| 1 | — | — | — | — | — | — |

---

## UX / Flow Issues

| # | Date | Reporter | Screen | Issue | Suggested fix | Status |
|---|------|----------|--------|-------|---------------|--------|
| 1 | — | — | — | — | — | — |

---

## Feature Requests

| # | Date | Reporter | Feature | Why | Priority |
|---|------|----------|---------|-----|----------|
| 1 | — | — | — | — | — |

---

## Golden Path Smoke Tests

Run through this flow on each build and tick off:

- [ ] Home loads → "Today for your thesis" shows correct next step
- [ ] Watchlist → search → add name
- [ ] Builder → themes select → portfolio builds
- [ ] Portfolio → customize pie → save → changelog updated
- [ ] Thesis model → life scenario → conviction dossier runs
- [ ] Duel → pick two assets → compare → verdict
- [ ] Duel → mind-change note saved
- [ ] X-Ray → load demo → overlap flags → duel from flag
- [ ] Accounts → Plaid connect (if Pro) / demo accounts
- [ ] Ask Thesis → prompt chip → response renders
- [ ] Forecast → preset select → scenario displays

---

## Beta Tester Onboarding

1. Install Expo Go or dev client
2. Connect to same WiFi as dev machine
3. Open `exp://<LAN-IP>:8081` or scan QR from `npm run dev`
4. Walk through onboarding questionnaire
5. Try golden path above
6. Log anything that breaks, confuses, or feels missing

---

## Notes

- Last updated: 2026-06-02
- Current build target: iOS Simulator (TestFlight pending Apple enrollment)
- Server: `localhost:8787` (local dev) — ensure `server/.env` has API keys
