# Today’s plan — Thesis

**North star:** **Pie you trust → conviction loop → device beta** (TestFlight when Apple enrolls)

Education and TestFlight setup are **paused**.

---

## Build focus now (Phase 2)

**Golden path** — one pass on Simulator:

```text
Home “Today for your thesis” → right next step
→ Watchlist (thesis-fit search) → add name
→ Builder → portfolio → customize pie → Save
→ Thesis model → life scenario → conviction dossier on one stock
→ Duel → mind-change note → back to Thesis model (conviction at top)
```

### Shipped this session

- **Home Today card** — prioritizes: save book → customize pie → first conviction dossier → duel → thesis model
- **Thesis model hub** — latest conviction + changelog up top; quick **Edit pie / Watchlist / Duel**

### Still to verify (10 min)

| Check | Pass? |
|-------|-------|
| Today card after save points to “customize pie” if never edited | ☐ |
| After pie save, Today → conviction dossier on first stock | ☐ |
| Thesis model shows duel note after duel | ☐ |
| `npm run dev` + stock price (Massive EOD) on Simulator | ☐ |

---

## Phase 1 pie (mostly done)

| Item | Status |
|------|--------|
| `finalizePieRows` → 100% | ✓ |
| Reset to thesis weights | ✓ |
| Save alert + dry powder | ✓ |
| Sleeve suggestions (SCHD, VXUS, …) | ✓ |
| API pie-rebalance endpoint | Skip until needed |

---

## Run locally

```bash
cd /Users/jaidenrabatin/Projects/thesis
npm run dev
```

- **server/.env** — `MASSIVE_API_KEY`, LLM keys
- **Simulator** — API URL defaults to `127.0.0.1:8787`
- **Phone (later)** — LAN IP in root `.env`

---

## Parked

- Apple TestFlight (waiting enrollment)
- Education content
- `tsc` cleanup unless it blocks run

---

## Blockers log

```text
1.
2.
3.
```

---

## Next session

Fix blocker #1 from log, or stretch: pie-rebalance API, sector-book radar.
