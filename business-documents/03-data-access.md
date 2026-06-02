# Thesis — Data Access & Privacy Practices

## Data We Access (via Plaid)

| Data Category | Plaid Product | What We Access | Purpose |
|---------------|---------------|----------------|---------|
| Account identity | Auth | Account holder name, institution, account type, mask | Identify linked accounts for display |
| Balances | Balance | Current and available balances | Show financial overview |
| Transactions | Transactions | 24-month transaction history, amounts, dates, merchant names | Cash flow analysis, monthly investable capacity |
| Investments | Investments | Holdings, securities, quantities, cost basis, account allocation | Portfolio comparison against thesis model |
| Liabilities | Liabilities | Loan types, balances, interest rates, payment schedules | Debt context for thesis risk calibration |

## Data We Do NOT Access

- We do not access or store online banking credentials (handled entirely by Plaid)
- We do not initiate transfers, payments, or trades
- We do not access credit reports
- We do not access identity documents (SSN, driver's license, passport)
- We do not access income or employment verification data (v1)
- We do not access Plaid Check or FCRA-regulated data

## Data Storage

### Server-Side
- **Plaid access tokens:** Stored in `server/data/plaid-tokens.json` (to be migrated to encrypted database)
- **User profile data:** Theme preferences, thesis models, watchlist — stored in Supabase
- **No PII from Plaid:** We do not store account numbers, routing numbers, full names, or addresses from Plaid

### Client-Side (Mobile App)
- **User thesis model:** Stored locally (AsyncStorage)
- **Derived portfolio data:** Holdings summaries cached client-side for performance
- **No raw Plaid data:** The mobile app never receives access tokens — only the server holds them

## Data Security

- All Plaid API communication is server-to-server (access tokens never exposed to client)
- API endpoints are authenticated via `X-Thesis-App-Key` header
- Plaid Link token creation is server-side (client never sees Plaid secret)
- Data in transit uses HTTPS/TLS
- Production database will encrypt access tokens at rest

## Data Sharing

Thesis does not:
- Sell user data to third parties
- Share Plaid-derived data with affiliates or partners
- Use transaction data for advertising
- Share portfolio data with brokerages (affiliate relationships are link-based, not data-based)

## Data Deletion

Users can disconnect accounts at any time:
1. User taps "Disconnect" in the Accounts tab
2. Client sends disconnect request to server
3. Server deletes stored Plaid access token
4. Local account data is cleared from device storage
5. Users can also revoke access directly through Plaid's portal

## Plaid Compliance

- Thesis uses Plaid in accordance with Plaid's Developer Agreement
- All Plaid data is used exclusively for the services described in our Privacy Policy
- Users provide explicit consent via Plaid Link before any data access
- Users can revoke access at any time
- Thesis does not request or store online banking credentials

---

*Last updated: June 2026*
