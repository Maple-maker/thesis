# Plaid Integration — Thesis App

## Dashboard Configuration

**Plaid Dashboard:** https://dashboard.plaid.com

### Products to Enable (in order of priority)

| Priority | Product | Plan | Purpose in Thesis |
|----------|---------|------|-------------------|
| 🔴 P0 | **Auth** | Free (100 links/mo) | Link bank/brokerage accounts |
| 🔴 P0 | **Investments** | Growth ($0.30/request) | Pull portfolio holdings, securities, cost basis |
| 🔴 P0 | **Investments Refresh** | Add-on | On-demand holdings updates |
| 🟠 P1 | **Balance** | Free (100 requests/mo) | Real-time account balances |
| 🟠 P1 | **Identity** | Growth ($1.00/check) | Verify account ownership |
| 🟠 P1 | **Identity Match** | Add-on | Fuzzy name matching for verification |
| 🟠 P1 | **Transactions** | Growth ($0.30/request) | 24-month transaction history for cash flow |
| 🟡 P2 | **Liabilities** | Growth ($0.30/request) | Student loans, credit cards, mortgage |
| 🟡 P2 | **Assets** | Growth ($0.30/request) | Categorized asset data for net worth |
| 🟡 P2 | **Income** | Growth ($1.00/check) | Income verification for risk calibration |

### Products NOT Needed (v1)

- **Payment Initiation / Payments** — Thesis doesn't process trades or payments
- **Signal / Signal Transaction Scores** — No ACH payment processing
- **Transfer** — Not moving money
- **Credit Underwriting / Plaid Check** — Not a lender, no FCRA compliance needed
- **Identity Verification / Monitor** — Not doing KYC/AML
- **Enrich** — Not processing raw transaction data into insights
- **Statements** — Bank-branded PDFs not needed for v1
- **Investments Move (ACATS)** — Not transferring brokerage accounts

---

## Server Routes (`server/`)

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /v1/plaid/link-token` | Create Plaid Link token with configured products | ✅ Built |
| `POST /v1/plaid/exchange` | Exchange public_token → store access_token | ✅ Built, persists to `server/data/plaid-tokens.json` |
| `POST /v1/plaid/sync` | Pull balances, holdings, transactions | ✅ Built, maps to `LinkedAccount` types |
| `POST /v1/webhooks/plaid` | ITEM / TRANSACTIONS / HOLDINGS updates | 🔲 Stub |

### Env Configuration (`server/.env`)

```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret  
PLAID_ENV=sandbox  # sandbox → development → production
```

### Link Token Products

Update `server/src/plaid.ts` line 43 — the `products` array in `postPlaidLinkToken` should include:
```ts
products: ["auth", "transactions", "investments", "liabilities"],
```

---

## Mobile Client

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| `PlaidLinkModal` | `src/components/plaid/PlaidLinkModal.tsx` | WebView-based Plaid Link (works in Expo Go) | ✅ Built |
| `ConnectAccountsButton` | `src/components/plaid/ConnectAccountsButton.tsx` | Button + modal orchestrator | ✅ Built |
| `plaid-client.ts` | `src/lib/plaid-client.ts` | API callers (link token, exchange, sync) | ✅ Built |
| Store integration | `src/store/index.ts` | `setPlaidAccounts`, `setPlaidHoldings`, `setPlaidStatus` | ✅ Built |

### Next Steps for Production

1. Enable Plaid products in Dashboard (see table above)
2. Add `PLAID_CLIENT_ID` + `PLAID_SECRET` to `server/.env`
3. Test with sandbox credentials: `user_good` / `pass_good`
4. When ready for production: switch `PLAID_ENV=development` → apply for Production access
5. Consider native `react-native-plaid-link-sdk` for production (smoother UX than WebView)
6. Postgres persistence for access_tokens (currently JSON file)

---

## Thesis → Plaid Data Flow

```
User taps "Link Accounts" 
  → PlaidLinkModal opens (WebView)
    → Plaid Link authenticates with bank
      → public_token returned to app
        → POST /v1/plaid/exchange (public_token → access_token)
          → access_token persisted to server/data/plaid-tokens.json
            → POST /v1/plaid/sync (fetch accounts, holdings, balances)
              → Accounts displayed in Accounts tab
              → Holdings available for thesis alignment comparison
```

## Thesis Alignment Feature (Future)

When Plaid is connected:
1. Pull real portfolio holdings via Plaid Investments
2. Compare against thesis model portfolio
3. Show alignment score: "Your portfolio is 65% aligned with your AI Infrastructure thesis"
4. Highlight gaps: "You're missing semiconductor exposure — consider NVDA or SMH"
5. Flag concentration risk: "NVDA is 28% of your portfolio vs 15% in your thesis model"
