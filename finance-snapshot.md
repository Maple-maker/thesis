# Finance snapshot

> Fill this out honestly. The AI council uses only what's here — no guessing.
> Update the date each time you run a review.

**As of:** 2026-06-03

**Data sources parsed:** Roth IRA (Schwab), Fidelity taxable, M1 (3 pies), Coinbase, staked VVV — exports from 2026-06-03

---

## Net worth


| Category                     | Amount       | Notes                                     |
| ---------------------------- | ------------ | ----------------------------------------- |
| Cash (checking)              | $300         | try to keep this minimal                  |
| Cash (HYSA / money market)   | $0           |                                           |
| Taxable brokerage (Fidelity) | $11,886    | STRC/SATA pref + churn                    |
| 401(k) / employer plan       | $1,000     |                                           |
| Traditional IRA              | $0         |                                           |
| Roth IRA (Schwab)            | $11,000    | was index-heavy; now MSTR/ASST            |
| HSA                          | $0         |                                           |
| Crypto (Coinbase)            | $29,000    | BTC-heavy; cost basis ~$32,353            |
| VVV (Venice, staked)         | ~$2,180    | 123 tokens @ ~$17.72; **11.66% APR** stake |
| M1 taxable (3 pies)          | ~$11,759   | see M1 section; **$2k margin loan**       |
| Other investments            | $0         |                                           |
| **Total investments**        | **~$67,125** | est. Jun 3                               |
| **Total debt**               | **$73,000**  | see breakdown below                     |
| **Net worth**                | **~−$5,875** | assets − debt                           |


### Debt breakdown


| Creditor / type       | Balance     | APR               | ~$ interest/yr | Required $/mo | Secured?        |
| --------------------- | ----------- | ----------------- | -------------- | --------------- | --------------- |
| Amex (credit card)    | $15,000     | 12%               | $1,800         | **$505**        | No              |
| SoFi (personal loan)  | $15,000     | 9%                | $1,350         | **$478**        | No              |
| **Cow loan (USAA)**   | **$23,000** | **fill APR**      | fill           | **$619**        | fill            |
| TSP loan              | $8,000      | 4.35%             | $348           | payroll         | No (payroll)    |
| Coinbase margin (BTC) | $10,000     | 5%                | $500           | ~$42 int + prepay | Yes — BTC locked |
| M1 Finance margin     | $2,000      | 5.65%             | $113           | ~$9 int + prepay  | Yes — vs M1 pie |
| **Total**             | **$73,000** |                   |                | **~$1,602/mo** (Amex+SoFi+cow mins) | |


**Fixed consumer + cow payments:** Amex **$505/mo min** + SoFi **$478/mo min** = **$983/mo**. Autopay sends **$1,000/mo total** to cover both (SoFi $478 first → Amex **~$522/mo** from autopay, just above $505 min). Cow **$619/mo** separate.

**Debt priority (avalanche for *extra* dollars):** Amex 12% → SoFi 9% → margin 5–5.65% → TSP 4.35% → **cow loan last** (only if APR is truly low — **fill actual cow loan rate**)

**Leverage note:** ~$67k gross assets − **$73k debt = ~−$5.9k net worth**. BTC **−$6,117** unrealized, **$10k margin**, **collateral locked**.

---

## M1 Finance — 3 pies (from activity CSVs)

> CSVs are **activity only**. Values = net shares in each export window × last trade price. **Confirm balances in M1 app.**

### Combined M1 summary

| Metric | Value |
|--------|-------|
| **Est. total (3 pies)** | **~$11,759** |
| Est. equity (after $2k margin) | ~$9,759 |
| Deposits (May 2026) | $9,847 ($7k + $320 + $1k + $1k across pies) |
| Total trades (all pies) | ~452 buy/sell events |
| Open positions (all pies) | 36 tickers across 3 strategies |

### Pie 1 — AI / semis / uranium (`m1 activity.csv`)

| Metric | Value |
|--------|-------|
| Period | May 4 – Jun 3, 2026 |
| Est. value | **~$10,507** |
| Deposits | $7,320 |
| Trades | 128 buys / 60 sells |
| Theme | DRAM, SMH, quantum (IONQ, RGTI, QBTS), uranium (URA, CCJ), utilities (XLU) |

**Top holdings:** DRAM $1,555 · SMH $1,051 · GRID $636 · XLU $528 · IBM $515 · URA $415 · IREN $392

**Arc:** $7k deposit May 15 → AIS/HUT/QQQM → sold indexes (QQQM, IEMG) → exited AIS/AIPO at losses → now 25 thematic slices, no index core.

### Pie 2 — Defense / drones (`m1.2 activitiy.csv`)

| Metric | Value |
|--------|-------|
| Period | Mar 2025 – Jun 3, 2026 (long history) |
| Est. value | **~$652** |
| Deposits (in CSV) | $1,527 |
| Trades | 132 buys / 113 sells |
| Theme | Defense primes + drone plays |

**Current holdings:** RDW, KTOS, PLTR, ONDS, UMC, AIRO, RCAT (~$65–98 each)

**Jun 1 rotation:** Sold defense **ETFs** (FITE $163, XAR $157, ITA $158, SHLD $156) → bought individual names (RTX, NOC, GD, HII, AVAV, KTOS, PLTR, etc.). Same whipsaw pattern as Pie 1 — ETF out, stock in.

### Pie 3 — Space (`m1.3 activityy.csv`)

| Metric | Value |
|--------|-------|
| Period | May 27 – Jun 1, 2026 (new pie) |
| Est. value | **~$601** |
| Deposits | $1,000 (May 28) |
| Trades | 12 buys / 7 sells |
| Theme | Space economy |

**Current holdings:** UFO $240 · RKLB $150 · ASTS $120 · LUNR $90

**Arc:** $1k deposit → bought NASA, RDW, UFO, FLY, VELO, VOYG May 28 → sold most May 29 Jun 1 → holding space ETF + launch names.

### M1 patterns (all pies)

- Three **separate thematic pies**, all high turnover
- **$9.8k deposited in May** while carrying **$30k at 9–12%** consumer debt
- Exited broad ETFs (QQQM, IEMG, FITE, XAR) for narrow theme bets
- Pie 1 dominates (~89% of M1 value); Pies 2–3 are smaller experiments

---

## Staked crypto — VVV (Venice Token)

| Field | Value |
|-------|-------|
| Amount | **123 VVV** |
| Location | Staked (wallet `0x27c083…df15e` — from Coinbase sends) |
| Est. price (May 31 CB) | ~$17.72 |
| **Est. value** | **~$2,180** |
| Staking APR | **11.66%** |
| Est. yield | ~**$254/yr** (~$21/mo) in VVV — **still risky/illiquid** |

**Note:** VVV bought via Coinbase converts (BTC → VVV) then sent off-exchange to stake. Not included in Coinbase $29k balance. Coinbase CSV shows ~$985 fees on altcoin/VVV rotation — separate from this staked bag.

---

## Performance (last 12 months)


| Metric                    | Your number | Benchmark                                                             |
| ------------------------- | ----------- | --------------------------------------------------------------------- |
| Portfolio return ($)      | -$9,000     |                                                                       |
| Portfolio return (%)      | ~-12%?      | **fill exact %** — est. on ~$74k peak                                 |
| S&P 500 same period (SPY) |             | ~+15–18% YTD 2026 — [verify SPY](https://finance.yahoo.com/quote/SPY) |
| **Gap vs benchmark**      | ~25–30 pts? | **fill after SPY lookup**                                             |


**Starting balance (~12 mo ago):** $ — fill

**Ending balance (today):** ~$67,125

**Contributions / withdrawals (net):** M1 deposits $9,847 (May); Roth contrib ~$2,385 + ~$5,115 transfers in

---

## Holdings (top 10 by value)


| Ticker / account          | Value $ | % of portfolio | Cost basis | Unrealized                 |
| ------------------------- | ------- | -------------- | ---------- | -------------------------- |
| BTC (Coinbase)            | $26,236 | ~39%           | $32,353    | **-$6,117**                |
| Fidelity (SATA pref)      | ~$11,886 | ~18%           | ~123 shares | **~$133/mo pref payouts** → Amex avalanche |
| M1 (3 pies)               | ~$11,759| ~18%           |            | $2k margin; Pie 1 = 89%    |
| Roth IRA                  | ~$11,000 | ~16%           | 84 MSTR, 8 ASST | **Cannot pay Amex** — rebalance inside Roth later |
| VVV (staked)              | ~$2,180 | ~3%            |            | 123 @ 11.66% APR           |
| 401(k)                    | $1,000  | ~1%            |            |                            |
| Checking                  | $300    | <1%            |            |                            |


**Cash as % of total portfolio:** ~0.5% (checking only — verify SPAXX in Fidelity)

**Largest single position as %:** ~39% of gross assets (BTC) — **$10k margined on Coinbase**

**Debt-to-assets ratio:** ~109% ($73k / $67k)

**Sector concentration:**

- Crypto (BTC + VVV staked + crypto-adjacent equities): **~45%+**
- M1 Pie 1: AI, quantum, semis, uranium, utilities (25 tickers)
- M1 Pie 2: Defense / drones (KTOS, PLTR, RDW, ONDS, etc.)
- M1 Pie 3: Space (RKLB, ASTS, UFO, LUNR)
- Fidelity/Roth: MSTR, STRC, SATA, ASST bitcoin-proxy stack
- Index funds (SWPPX, QQQM, IEMG): **sold down** Apr–May 2026

---

## Cash flow (per paycheck + monthly)

### Per paycheck (biweekly)

| Line | Amount | Notes |
|------|--------|-------|
| **Total take-home** | **$4,200** | $2,700 to you + $1,500 auto-routed |
| Auto-routed (before you see it) | $1,500/pay (~$3,250/mo) | |
| → Amex / SoFi autopay | **$1,000/mo** (~**$462/pay**) | Covers **both minimums** ($983/mo): SoFi $478 + Amex ~$522 |
| → Margin loans (Coinbase + M1) | **$500/pay** (~$1,083/mo) | redirect to avalanche per your plan |
| **Lands in checking** | **$2,700** | every 2 weeks |
| **Cow loan (USAA $23k)** | **$619/mo** | fixed — confirm if debited from checking or separate |
| Living expenses | ≤ ~$230/pay | ≤ **$500/mo** total |

### Monthly cash flow (all mandatory outflows)

| Line | $/mo |
|------|------|
| Total take-home | **~$9,100** |
| Auto → Amex + SoFi | − **$1,000** (SoFi $478 + Amex ~$522 — **minimums only**) |
| Auto → margin ($500/pay) *or redirected* | − **$1,083** |
| **Cow loan payment** | − **$619** |
| Living expenses | − **$500** |
| **Total committed** | **~$3,202/mo** |
| **Left in checking (before trading/M1/etc.)** | **~$5,898/mo** |

```
Checking in:     ~$5,850/mo  ($2,700 × 26 ÷ 12)
− Cow loan:        $619/mo
− Expenses:        $500/mo
= ~$4,731/mo       (must also fund avalanche $500/pay if redirected from margin — see below)
```

**If you redirect $500/pay margin → avalanche:** that $1,083/mo leaves autopay and goes to Amex instead — margin gets interest-only until Phase 3. **Real surplus for avalanche is tight** unless it comes from the redirected margin autopay, not “extra” checking.

**Per paycheck after cow + expenses:** ~$2,700 − $286 (cow) − $230 (expenses) ≈ **~$2,184/pay** in checking before any avalanche redirect.

### Where money goes today (full picture)

| Bucket | $/mo | You control? |
|--------|------|--------------|
| Amex + SoFi autopay | **$1,000** (mins only: SoFi **$478** + Amex **~$522**) | SoFi min fixed; Amex gets ~$17 above $505 min |
| Margin autopay | ~$1,083 | **Redirecting** to avalanche |
| Cow loan | **$619** | **No — fixed** |
| Expenses | $500 | Yes |
| **Avalanche ($500/pay + SATA ~$133)** | ~$1,216 | Yes — Amex → SoFi → margin |
| **Checking (before avalanche)** | ~$4,731 | Yes — but May’s $9.8k M1 deposit shows this doesn’t always stay idle |

### Autopay constraints (your corrections)

| Constraint | Implication |
|------------|-------------|
| **$1,000/mo autopay** | Covers **both** Amex ($505 min) + SoFi ($478 min) — **not** $1,000/pay |
| **SoFi $478/mo fixed** | Comes out of the $1,000/mo bucket first; Amex gets the **~$522** remainder |
| **BTC is margin collateral** | Cannot sell BTC until Coinbase margin (~$10k) is paid — **locked** until Phase 3 |
| **$500/pay + prefs avalanche** | Redirect from margin prepay → Amex first, then extra SoFi, then margin |

### Cash streams (exact)

| Stream | $/mo | $/pay | Goes to |
|--------|------|-------|---------|
| SoFi (from $1k autopay) | **$478** | — | SoFi minimum |
| Amex (from $1k autopay) | **~$522** | — | Amex minimum + ~$17 |
| Avalanche (margin redirect + SATA) | **~$1,216** | **$500 + ~$133 prefs** | Amex → SoFi → margin |
| Cow loan (fixed) | **$619** | **~$286** | USAA — parallel, not avalanche |
| Margin (Phase 1–2) | $0 principal | $0 | Interest accrues unless lender requires $500/pay |

**Phase 1 — Amex ($15,000):**  
~$522 (autopay after SoFi) + ~$1,216 (avalanche) ≈ **~$1,738/mo** → **~9 months**

**Phase 2 — SoFi extra ($15,000):**  
SoFi **$478/mo** keeps running from autopay. Full **$1,000/mo** can shift to SoFi after Amex zero + avalanche ~$1,216 ≈ **~$2,216/mo total to SoFi** → **~7 months** after Amex zero

**Phase 3 — Margin ($12,000):**  
~$1,216/mo → **~10 months**. **Then BTC collateral releases.**

**Cow loan ($23k @ $619/mo):** Parallel schedule (~**37 months**) — not in avalanche.

**Total avalanche path ~26 months** (9 + 7 + 10) — slower than when we wrongly assumed $1,000/**pay** to consumer debt.

### BTC / margin note

- **Do not plan on selling BTC** to fix margin — it’s collateral; sale requires paying margin or triggers liquidation.
- **Do not convert/churn** on Coinbase while margin is open.
- Margin interest (~$42/mo on $10k @ 5%) still accrues during Phase 1–2 unless your old $500/pay must keep covering it — **confirm whether redirecting that $500 pauses principal paydown only or misses required payments.**

---

## Behavior log (from CSV analysis — last 90 days)

### Trade volume (Mar 5 – Jun 3, 2026)


| Account  | Buy/sell trades                      | Notes                                   |
| -------- | ------------------------------------ | --------------------------------------- |
| M1 (3 pies)  | ~452            | $9.8k deposited May; 3 thematic pies, ETF→stock rotations |
| Fidelity | ~78                                  | MSTR/STRC/SATA pref swapping            |
| Roth IRA | 43                                   | Index liquidation → MSTR/crypto Apr–May |
| Coinbase | 156 converts + 11 sends + buys/sells | Altcoin roulette, NEAR exit             |


**Total equity buy/sell events (90d):** ~309  
**Coinbase fee/spread drag (90d):** ~**$985**  
**Stock commission fees (90d):** ~$1.24 (low — spread/slippage not counted)

### Largest / most telling trades


| Date       | Account       | Action   | Ticker              | $ amount           | Pattern                                     |
| ---------- | ------------- | -------- | ------------------- | ------------------ | ------------------------------------------- |
| 2026-05-13 | Roth IRA      | sell→buy | MSTR                | ~$15,260 ↔ $15,210 | Same-day round-trip                         |
| 2026-05-13 | Roth IRA      | sell→buy | HUT, AIS            | ~$7.6k each        | Crypto miner / AI ETF churn                 |
| 2026-04-20 | Roth IRA      | sell     | SWPPX, SWISX, SFENX | ~$14k              | **Sold diversified index**                  |
| 2026-04-20 | Roth IRA      | buy      | MSTR, FBTC          | ~$14.7k            | Into BTC proxy + MSTR                       |
| 2026-05-27 | Coinbase      | sell     | NEAR                | ~$7,600            | Exited to bank ($7,654 withdrawn May 27–30) |
| 2026-05-28 | Fidelity      | buy      | SATA                | $7,399             | Strive pref stack                           |
| 2026-05-29 | M1            | sell     | AIS                 | $2,551             | AI supercycle ETF exit                      |
| 2026-06-01 | M1            | sell     | AIPO                | $2,359             | AI ETF exit                                 |
| 2026-05-27 | Roth/Fidelity | buy      | ASST                | small              | Strive common — micro position              |


### Narrative themes traded (M1, 90d)

- **AI / quantum:** AIS, IONQ, RGTI, QBTS, INFQ, DRAM, AIPO (Pie 1)
- **Uranium / power:** URA, CCJ, CEG, GEV, GRID (Pie 1)
- **Semis / infra:** SMH, ANET, LITE, COHR, FN, VRT, SNOW (Pie 1)
- **Defense / drones:** KTOS, PLTR, RDW, ONDS, AVAV, RTX, NOC (Pie 2)
- **Space:** RKLB, ASTS, UFO, LUNR, NASA (Pie 3)
- **Crypto-adjacent:** BTC, VVV, IREN, APLD, MSTR, STRC, SATA

### Emotional moments (fill / confirm)

- **Last FOMO buy:** 2026-05-13 — MSTR $15k + HUT/AIS churn in Roth; 2026-05-28 SATA $7.4k Fidelity
- **Last panic sell:** 2026-04-20 — liquidated Roth index funds (SWPPX/SWISX/SFENX) into MSTR/FBTC
- **Times you checked portfolio daily this month:** fill
- **Biggest narrative chased:** AI supercycle (AIS, AIPO, DRAM) + bitcoin proxy (MSTR/STRC/SATA/FBTC) + uranium rotation

### Rules you say you follow vs. what you actually do


| Rule                                             | Follow it?                                    |
| ------------------------------------------------ | --------------------------------------------- |
| "Only index funds"                               | **No** — sold indexes Apr 2026                |
| "Rebalance quarterly"                            | **No** — 309+ equity events in 90 days        |
| "No single stock > 5%"                           | **No** — BTC ~40% of net worth                |
| "Don't chase themes"                             | **No** — AI, uranium, semis, crypto prefs     |
| "Minimize fees"                                  | **No** — ~$985 Coinbase fees/spread in 90d    |
| "No high-interest consumer debt while investing" | **No** — $30k at 9–12% while actively trading |


---

## Goals & constraints

**Primary goal (1–3 years):** fill — e.g. stop bleeding vs market, rebuild discipline

**Time horizon for investments:** fill

**Risk tolerance (stated):** fill

**Risk tolerance (actual — from holdings):** **Very high** — 40% BTC, theme ETFs, pref stacks, altcoin converts

**Non-negotiables:**

- TSP loan: $8k at 4.35% (payroll deduction — fill terms)
- Coinbase margin: $10k against BTC — liquidation risk if BTC drops further
- M1 margin: $2k — fill maintenance requirement

**Tax situation:** fill — Roth contributions ~$2,385 YTD (CSV); taxable accounts active (M1, Fidelity, CB)

---

## Open questions for the council

- Why am I underperforming the market?
- Am I too concentrated / too much cash?
- Should I change allocation for this bull market?
- Am I over-trading?
- Cash flow / spending is the real problem — **$73k debt, ~$344/mo interest burn, negative net worth**
- Other: **Pay off Amex/SoFi before any more trading? Margin on losing BTC?**

**Anything else they should know:**

- Apr 2026 pivot: systematic index investor → sold SWPPX/SWISX/SFENX/SCHD in Roth for MSTR/FBTC, then May churn into HUT/AIS/ASST
- Coinbase: heavy convert activity (156 in 90d), NEAR sold ~$7.6k, USDT sent to external wallets, BTC cost basis $32,353 vs $26,236 value
- Fidelity: rotating STRC/SATA/ASST — **SATA targets ~13% yield but has had issues holding PAR** (price risk offsets yield vs guaranteed 12% Amex payoff)
- M1: **3 pies** (~$11.8k total) — AI/semis ($10.5k), defense ($652), space ($601); $9.8k deposited May while carrying 12% Amex debt
- VVV: **123 tokens staked at 11.66% APR** (~$2.2k) — off Coinbase; bought by converting BTC/altcoins, sent to external wallet
- **-$9k vs bull market** likely driven by: BTC drawdown, selling indexes to buy volatile proxies, crypto fees, theme rotation losses (AIS, AIPO, DRAM sells)
- **Hidden drag:** ~$4,128/yr interest — but **Amex + SoFi = ~$2,750/yr (67% of all interest)**. USAA $23k at 0.075% costs only ~$17/yr — keep minimum payments, don't accelerate
- **Structural mismatch:** Borrowing at 5% against BTC that's down 19% from cost basis, while carrying 12% credit card debt — council should address debt payoff vs invest tradeoff first
- **Net worth:** ~**−$5.9k** — still underwater; VVV yield (~$254/yr) doesn't offset Amex interest (~$1,800/yr)

---

## Optional: account links (for your eyes only — delete before sharing)

- Roth: `Roth_Contributory_IRA_XXX515_Transactions_20260603-130903.csv`
- Fidelity: `fidelity activity.csv`
- M1 Pie 1: `m1 activity.csv`
- M1 Pie 2 (defense): `m1.2 activitiy.csv`
- M1 Pie 3 (space): `m1.3 activityy.csv`
- Coinbase: `cb activity.csv`
- Last CSV export: 2026-06-03

