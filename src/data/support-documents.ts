export interface SupportDocument {
  id: string;
  title: string;
  description: string;
  /** Full markdown content */
  content: string;
}

export const supportDocuments: SupportDocument[] = [
  {
    id: "01-business-details",
    title: "Business Details",
    description: "Company overview, business model, and corporate structure",
    content: `# Thesis — Business Details

## Company Overview

| Field | Detail |
|-------|--------|
| **Legal Name** | Thesis (operating name) |
| **Business Type** | Financial Technology Platform |
| **Jurisdiction** | United States |
| **Regulatory Status** | Unregulated (not an RIA, Broker-Dealer, or Bank) |
| **SEC Registration** | Not required — does not meet the definition of Investment Adviser under the Investment Advisers Act of 1940 |
| **State Registration** | Not required |
| **FINRA Membership** | Not applicable |
| **SIPC Membership** | Not applicable |
| **FDIC Insurance** | Not applicable |

## Business Model

Thesis is an **educational investing platform** — a mobile application that helps users learn investing fundamentals, build their own investment thesis (the "why" behind their buys), and compare their real brokerage holdings against their self-directed thesis model.

### Revenue

Revenue is generated exclusively through **affiliate partnerships** with brokerages, high-yield savings providers, and credit card issuers. Thesis earns a referral fee when a user opens an account through an affiliate link.

Thesis does **not**:
- Charge users fees
- Charge AUM-based fees
- Accept payment for investment recommendations
- Sell order flow
- Execute trades
- Hold client funds or securities

### Core Product

- Educational courses (investing basics, compound interest, ETFs, Roth IRA, credit)
- Investment thesis builder (user-driven theme selection, portfolio customization)
- Portfolio aggregation (read-only, via Plaid)
- Research tools (duel comparisons, catalyst sweeps, multi-analyst AI research)
- Affiliate marketplace (brokerage, HYSA, credit card offers)

### What Thesis Is Not

- A registered investment adviser
- A broker-dealer
- A bank or credit union
- A fiduciary
- A robo-advisor
- A trading platform

## Corporate Structure

- **Entity Type:** Sole Proprietorship (or LLC — update as formed)
- **Owner/Founder:** Jaiden Rabatin
- **Employees:** 0 (sole founder/developer)
- **Office:** Remote / United States

## Contact

- **Business Email:** [to be added]
- **Support Email:** [to be added]
- **Website:** makeyourthesis.com

---

*Last updated: June 2026*`,
  },
  {
    id: "02-use-case",
    title: "Use Case Description",
    description: "Primary use case, user journey, and Plaid product usage",
    content: `# Thesis — Use Case Description

## Primary Use Case

**Personal Financial Management (PFM) with Investment Thesis Builder**

Thesis is a mobile application in the Personal Financial Management category — similar to Monarch, Copilot, and Mint with an added educational investing layer. Users connect their existing financial accounts to view their complete financial picture and compare their real portfolio allocation against a self-built investment thesis model.

## User Journey

Learn (courses + glossary + Ask AI)
    ↓
Thesis Builder (pick themes, customize allocation, name conviction)
    ↓
Connect Accounts (Plaid — see real portfolio)
    ↓
Compare (real holdings vs thesis model)
    ↓
Research (duel comparisons, catalyst sweeps, AI analyst debates)
    ↓
Act (open brokerage account via affiliate link — execute thesis independently)

## Specific Plaid Product Usage

### Auth
**Purpose:** Authenticate users' bank and brokerage accounts so they can link them to Thesis.
**User benefit:** One-tap account linking instead of manual data entry.

### Balance
**Purpose:** Display real-time account balances across all linked accounts.
**User benefit:** Users see their total financial picture — cash, investments, debts — in one place.

### Transactions
**Purpose:** Import 24 months of transaction history for cash flow analysis.
**User benefit:** Users understand their monthly investable capacity before building a thesis.

### Investments
**Purpose:** Import brokerage holdings, securities data, cost basis, and portfolio composition.
**User benefit:** Users compare their *actual* portfolio (via Plaid) against their *thesis* portfolio (self-built in the app). This is the core value prop: "Your portfolio is 65% aligned with your AI Infrastructure thesis."

### Investments Refresh
**Purpose:** On-demand holdings updates when users open the app.
**User benefit:** Portfolio data is current, not stale.

### Liabilities
**Purpose:** Import loan data — student loans, credit cards, mortgage, auto loans.
**User benefit:** Full financial context. Users should understand their debt situation before allocating capital to investments.

## User Control

All investment decisions are made **by the user, not by Thesis**:
- The user selects investment themes (AI compute, dividend growth, value, etc.)
- The user customizes portfolio weights (slider-based, manual overrides)
- The user saves their thesis model
- The user decides whether to act on the model (by opening a brokerage account independently)
- Thesis never recommends specific buys, sells, or trades

## Comparison to Similar Platforms

| Feature | Thesis | Monarch | Copilot | Robinhood | Betterment |
|---------|--------|---------|---------|-----------|------------|
| Account aggregation | Yes | Yes | Yes | No | Yes |
| Investment thesis builder | Yes | No | No | No | No |
| Educational courses | Yes | No | No | Yes | No |
| AI research tools | Yes | No | No | No | No |
| Trade execution | No | No | No | Yes | Yes |
| Investment advice | No | No | No | No | Yes |
| AUM fees | No | No | No | No | Yes |

---

*Last updated: June 2026*`,
  },
  {
    id: "03-data-access",
    title: "Data Access & Privacy Practices",
    description: "What data we access via Plaid, storage, and data sharing",
    content: `# Thesis — Data Access & Privacy Practices

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
- **Plaid access tokens:** Stored in encrypted storage
- **User profile data:** Theme preferences, thesis models, watchlist — stored in Supabase
- **No PII from Plaid:** We do not store account numbers, routing numbers, full names, or addresses from Plaid

### Client-Side (Mobile App)
- **User thesis model:** Stored locally (AsyncStorage)
- **Derived portfolio data:** Holdings summaries cached client-side for performance
- **No raw Plaid data:** The mobile app never receives access tokens — only the server holds them

## Data Security

- All Plaid API communication is server-to-server (access tokens never exposed to client)
- API endpoints are authenticated
- Plaid Link token creation is server-side (client never sees Plaid secret)
- Data in transit uses HTTPS/TLS
- Production database encrypts access tokens at rest

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

*Last updated: June 2026*`,
  },
  {
    id: "04-compliance",
    title: "Regulatory Compliance",
    description: "Regulatory position, disclaimers, and risk mitigation",
    content: `# Thesis — Regulatory Compliance Position

## Regulatory Determination

### Investment Advisers Act of 1940 — NOT an Investment Adviser

Under Section 202(a)(11) of the Investment Advisers Act, an "investment adviser" is any person who, **for compensation**, engages in the business of **advising others** about the **value of securities** or the advisability of investing in securities.

Thesis does not meet this three-part test:

| Prong | Requirement | Thesis Position |
|-------|-------------|-----------------|
| **1. Advice about securities** | Must provide specific recommendations about securities | ❌ Thesis provides educational content, research tools, and a thesis builder. Users build their own thesis. No buy/sell/hold recommendations are made. All AI-generated content includes disclaimers. |
| **2. As part of a business** | Must be engaged in the business of providing advice | ⚠️ Thesis is a business, but does not hold itself out as an adviser. Marketing explicitly states: "Educational tool. Not investment advice." |
| **3. For compensation** | Must receive compensation for advisory services | ❌ Thesis revenue is exclusively affiliate referral fees from brokerages. No fees are charged for investment recommendations, portfolio construction, or any advisory service. Users pay nothing. |

**Conclusion:** Thesis satisfies at most 1 of 3 prongs. Thesis is NOT an Investment Adviser under federal law. SEC registration is not required.

### State Law

Most state investment adviser statutes mirror the federal definition. Thesis does not meet state-level RIA definitions for the same reasons. No state registration is required.

### Broker-Dealer Registration

Thesis does not:
- Execute securities transactions
- Accept customer orders
- Handle customer funds or securities
- Receive transaction-based compensation

Thesis is not required to register as a broker-dealer under Section 15 of the Securities Exchange Act of 1934.

## Disclaimers & User Protections

### In-App Disclaimers (Implemented)

All analysis screens include educational disclaimers:
- **Thesis Builder:** "Educational tool. Not investment advice. Past performance does not guarantee future results."
- **Duel:** "Educational comparisons. Not a buy/sell recommendation."
- **Alpha Research:** "Check Alpha's work before investing. Given the probabilistic nature of machine learning, Alpha's responses won't always be right. Do your own research. No investment recommendations. Alpha gives you information, not advice."
- **Conviction Dossier:** "Educational tool. Not investment advice. Verify fundamentals on issuer sites and SEC filings."
- **Financial Health:** "Financial data is illustrative. Verify on SEC filings and issuer investor relations."

### Product Design Safeguards

1. **No "Buy"/"Sell" buttons** — Thesis never prompts users to execute trades
2. **No trade execution** — Users must open their own brokerage account independently
3. **User-driven thesis** — The thesis model is built by the user, not generated as a recommendation
4. **Affiliate transparency** — All affiliate links are labeled with clear disclosure
5. **AI labeling** — All AI-generated content is labeled "Experimental" with disclaimers

## Regulatory Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Being perceived as an RIA | Clear disclaimers, no compensation for advice, user-driven thesis builder |
| AI-generated content being seen as advice | "No investment recommendations" label on every AI output, probabilistic disclaimer |
| Affiliate model resembling advice-for-compensation | Affiliate links are to brokerage *accounts*, not specific securities. Users choose what to buy independently. |
| State regulators | Standardized disclaimers, no AUM fees, no discretionary authority |

## If Contacted by Regulators

Thesis will:
1. Demonstrate the three-prong test analysis showing no RIA status
2. Provide copies of all in-app disclaimers
3. Show the user-driven nature of the thesis builder
4. Document the affiliate-only revenue model
5. Provide this compliance analysis

## Future Considerations

If Thesis ever:
- Charges subscription fees for portfolio recommendations → may require RIA registration
- Offers model portfolios as recommendations (not templates) → may blur the line
- Provides one-on-one investment advice → RIA registration likely required
- Manages client assets → RIA + potentially custody requirements

None of these are planned for v1 or the foreseeable roadmap.

---

*Last updated: June 2026*

**Disclaimer:** This document is an internal compliance analysis, not legal advice. Consult qualified securities counsel for a formal regulatory opinion before launch.`,
  },
  {
    id: "05-terms-of-service",
    title: "Terms of Service",
    description: "Terms governing use of the Thesis application",
    content: `# Thesis — Terms of Service

**Last Updated:** June 2026

## 1. Acceptance of Terms

By accessing or using the Thesis mobile application ("Thesis," "the App," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.

## 2. Description of Service

Thesis is an **educational investing platform**. We provide:

- Educational content about investing, personal finance, and related topics
- An investment thesis builder that allows users to construct their own portfolio models
- Portfolio aggregation tools that display your existing brokerage holdings (via Plaid)
- Research and comparison tools (duels, catalyst sweeps, AI-powered analysis)
- Affiliate referrals to third-party financial service providers (brokerages, banks, credit card issuers)

## 3. NOT Investment Advice

**IMPORTANT: THESIS IS NOT AN INVESTMENT ADVISER.**

- Thesis does **not** provide investment advice, recommendations, or solicitations.
- Thesis does **not** make buy, sell, or hold recommendations about any security.
- All content — including educational materials, AI-generated analysis, thesis models, duel comparisons, conviction scores, and market research — is provided for **educational and informational purposes only**.
- Any investment decisions you make are **your own**. You are solely responsible for evaluating the merits and risks of any investment.
- Past performance, backtested results, and AI-generated projections do not guarantee future results.
- You should consult a qualified financial professional before making investment decisions.

**Thesis is not a fiduciary.** We do not act in your best interest as a legal standard — we provide tools and information for you to make your own decisions.

## 4. NOT a Broker-Dealer

Thesis is not a broker-dealer, exchange, or trading platform. We do not:

- Execute securities transactions
- Accept, transmit, or route customer orders
- Handle customer funds or securities
- Provide custody of assets

To invest, you must open an account with a registered broker-dealer independently. Affiliate links to brokerages are provided for convenience and do not constitute a recommendation of any specific brokerage.

## 5. Account Linking (Plaid)

Thesis uses Plaid Technologies, Inc. ("Plaid") to enable you to connect your financial accounts. By linking accounts:

- You authorize Plaid to access your financial account data on your behalf
- You agree to Plaid's own Terms of Service and Privacy Policy
- Thesis receives read-only access to your account information (balances, holdings, transactions)
- Thesis **never** receives, stores, or has access to your online banking credentials
- You may disconnect accounts at any time through the App settings

Thesis is not responsible for the accuracy, completeness, or availability of data provided through Plaid.

## 6. AI-Generated Content (Alpha Research)

Thesis includes experimental AI-powered research features ("Alpha Research"). By using these features:

- You acknowledge that AI-generated content is **probabilistic, not deterministic** — it may contain errors, omissions, or inaccuracies
- AI-generated analysis does **not** constitute investment advice or recommendations
- You should independently verify any information before relying on it
- "Check Alpha's work before investing" is not just a disclaimer — it's how these tools are meant to be used

## 7. User Responsibilities

You agree that you will not:

- Use the App for any unlawful purpose
- Attempt to gain unauthorized access to the App or its systems
- Reverse engineer, decompile, or extract the App's source code
- Use the App to provide investment advice to others
- Misrepresent your identity or financial situation

## 8. Intellectual Property

The Thesis application, including its design, code, educational content, and branding, is the intellectual property of Thesis. You may not copy, modify, distribute, or create derivative works without permission.

User-generated content (thesis models, conviction notes) remains your intellectual property.

## 9. Third-Party Links & Affiliate Disclosure

Thesis contains links to third-party websites and services, including affiliate links to brokerages, banks, and credit card issuers.

- **Affiliate Disclosure:** Thesis may receive compensation when you open an account through an affiliate link. This does not affect the price you pay. Affiliate relationships do not influence the educational content or tools provided.
- Thesis is not responsible for the content, terms, or practices of third-party services.
- You should review the terms and privacy policies of any third-party service before use.

## 10. Disclaimer of Warranties

THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- Accuracy of financial data, market prices, or AI-generated analysis
- Uninterrupted or error-free operation
- Fitness for a particular purpose
- Merchantability

Financial data may be delayed, inaccurate, or unavailable. Thesis relies on third-party data providers and is not responsible for data quality.

## 11. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- Thesis shall not be liable for any investment losses, financial damages, or other damages arising from your use of the App
- Thesis's total liability for any claim shall not exceed the amount you paid Thesis for the service (which is $0 for the free tier)
- You acknowledge that investing involves risk of loss and that past performance does not guarantee future results

## 12. Indemnification

You agree to indemnify and hold harmless Thesis and its founder, employees, and affiliates from any claims, damages, or expenses arising from your use of the App or violation of these Terms.

## 13. Changes to Terms

We may update these Terms from time to time. Material changes will be communicated through the App. Continued use after changes constitutes acceptance.

## 14. Governing Law

These Terms are governed by the laws of the United States and the state of the user's residence, without regard to conflict of law principles.

## 15. Contact

For questions about these Terms:
- Email: founder@makeyourthesis.com
- In-app feedback: Settings → Report an issue

---

## Appendix: Summary of Key Disclaimers

This is a plain-English summary — the full Terms above govern:

1. **Not investment advice** — We educate; you decide.
2. **Not a broker** — We don't execute trades.
3. **AI is experimental** — Verify before acting.
4. **We earn from affiliate links** — Disclosed, not hidden.
5. **You are responsible** — For your own investment decisions.
6. **No warranties** — Data may be wrong, markets are risky.

---

*Last updated: June 2026*`,
  },
  {
    id: "06-privacy-policy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data",
    content: `# Thesis — Privacy Policy

**Last Updated:** June 2026

## 1. Introduction

Thesis ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.

## 2. Information We Collect

### 2.1 Information You Provide

- **Profile data:** Age range, investment goals, risk tolerance, experience level, investment interests (collected during onboarding questionnaire)
- **Investment thesis data:** Themes you select, portfolio allocations you create, conviction notes, watchlist items
- **Research data:** Duel comparisons you run, catalyst sweeps you request, AI debate queries
- **Account data:** Email address (if you create an account for cloud sync)

### 2.2 Financial Account Data (via Plaid)

When you link financial accounts through Plaid:

- **We receive:** Account names, types, balances, transaction history, investment holdings, securities data
- **We do NOT receive:** Online banking usernames or passwords (these are handled entirely by Plaid and never shared with Thesis)
- **We do NOT receive:** Full account numbers, routing numbers, Social Security numbers, or other identity documents

### 2.3 Automatically Collected Information

- **Usage data:** Features used, screens visited, actions taken (for product improvement)
- **Device data:** Device type, operating system version, app version
- **Performance data:** Crash logs, error reports, load times

### 2.4 Information We Do NOT Collect

- Government-issued identification (SSN, driver's license, passport)
- Credit reports or credit scores
- Biometric data
- Precise location data
- Contacts or address book data

## 3. How We Use Your Information

| Purpose | Data Used |
|---------|-----------|
| Build and display your investment thesis | Profile data, theme selections, portfolio allocations |
| Show your real financial picture | Plaid account data, balances, holdings |
| Provide AI-powered research | Profile data, thesis model, research queries |
| Improve the app and fix bugs | Usage data, crash logs |
| Recommend relevant educational content | Experience level, interests, thesis themes |
| Display affiliate offers | Profile data, account types |

## 4. Data Storage & Security

### Storage
- **Plaid access tokens:** Stored server-side in encrypted storage
- **User profile & thesis data:** Stored in Supabase (cloud database with encryption at rest and in transit)
- **App preferences:** Stored locally on your device (AsyncStorage)

### Security Measures
- All data in transit is encrypted using HTTPS/TLS
- Plaid API keys and access tokens are stored server-side only — never exposed to the mobile client
- Database access is authenticated and scoped
- Regular dependency updates to patch security vulnerabilities

### Data Retention
- Financial account data is retained while your accounts are linked
- When you disconnect accounts, Plaid access tokens are deleted immediately
- Cached financial data is cleared from your device
- Thesis model and profile data is retained until you delete it or request deletion

## 5. Data Sharing

### We Do NOT:
- Sell your personal data to third parties
- Share your financial data with advertisers
- Share your portfolio or transaction data with affiliate partners
- Use your data for purposes unrelated to the Thesis app

### Limited Sharing:
- **Plaid Technologies, Inc.:** Your financial data is accessed through Plaid. Plaid's use of your data is governed by their own Privacy Policy.
- **Service Providers:** We use Supabase (database) and AI API providers (DeepSeek, Anthropic). Data shared is limited to what is necessary for the service to function.
- **Legal Requirements:** We may disclose data if required by law, court order, or government regulation.

## 6. AI & Machine Learning

- AI research queries (debates, catalyst sweeps, sentiment analysis, conviction dossiers) are processed by third-party AI providers (DeepSeek API, Anthropic API)
- Query data is transmitted to these providers for processing only — it is not used to train their models (API terms prohibit this)
- No financial account data or personally identifiable information is included in AI queries

## 7. Your Rights

You have the right to:

- **Access:** Request a copy of your data
- **Correction:** Update or correct your profile and thesis data
- **Deletion:** Delete your account and associated data
- **Disconnect:** Revoke Plaid access at any time through the app
- **Export:** Export your thesis models and research

To exercise these rights, contact us at founder@makeyourthesis.com or use the in-app settings.

## 8. Children's Privacy

Thesis is not intended for users under 13 years of age. We do not knowingly collect data from children under 13.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be communicated through the App. Continued use after changes constitutes acceptance.

## 10. Contact

For privacy-related questions or requests:
- Email: founder@makeyourthesis.com
- In-app: Settings → Privacy → Contact

## 11. Plaid End User Privacy Policy

As required by Plaid, users linking financial accounts are also subject to Plaid's End User Privacy Policy, available at: https://plaid.com/legal/#end-user-privacy-policy

---

*Last updated: June 2026*`,
  },
  {
    id: "07-affiliate-model",
    title: "Affiliate Revenue Model",
    description: "How Thesis generates revenue through affiliate partnerships",
    content: `# Thesis — Affiliate Revenue Model

## Overview

Thesis generates revenue exclusively through **affiliate partnerships** with financial service providers. When a user opens an account through an affiliate link in the app, Thesis earns a one-time referral fee. This is the sole revenue model for v1.

## How It Works

1. **Education first:** Users learn investing fundamentals through courses, glossary, and Ask Thesis
2. **Thesis builder:** Users build their own investment thesis model
3. **Contextual offers:** At the right moment (e.g., user has a thesis but no brokerage), Thesis displays an affiliate offer
4. **User decides:** User reviews the offer, compares options, and chooses whether to open an account
5. **Referral:** If the user opens and funds an account, Thesis earns a referral fee

## Why This Is NOT Investment Advice Compensation

| Characteristic | Investment Adviser Fee | Thesis Affiliate Fee |
|----------------|----------------------|---------------------|
| What triggers payment | Providing advice about securities | User opening a brokerage account |
| Tied to specific securities? | Yes — advice about what to buy | No — user independently chooses investments |
| Ongoing vs one-time | Typically ongoing (AUM) | One-time per account |
| User pays? | Yes (directly or via fund fees) | No — brokerage pays the referral fee |
| Does fee vary by user action? | Typically % of AUM, flat fee, or hourly | Fixed referral amount regardless of user's investments |

The affiliate fee is a **customer acquisition cost** paid by the brokerage, not compensation for investment advice. The user pays nothing to Thesis.

## Affiliate Categories

### 1. Brokerage Accounts
- **Examples:** Robinhood, Public, Charles Schwab, Fidelity, Webull
- **When shown:** After user completes thesis builder and has a model portfolio
- **Disclosure:** "When you open and fund a brokerage account through this link, Thesis may receive a referral fee. This does not affect your cost."
- **Typical fee:** $50-$150 per funded account (varies by partner)

### 2. High-Yield Savings Accounts (HYSA)
- **Examples:** Marcus, Ally, Wealthfront Cash, Betterment Cash Reserve
- **When shown:** When user indicates they have no emergency fund or have excess cash
- **Disclosure:** Same format as brokerage disclosure
- **Typical fee:** $25-$100 per funded account

### 3. Credit Cards
- **Examples:** Issuer-specific cards (Chase, Amex, Citi)
- **When shown:** When user profile indicates credit-building goals or responsible credit use
- **Disclosure:** Same format
- **Typical fee:** $50-$200 per approved application

### 4. IRA Accounts
- **Examples:** Robinhood IRA, Fidelity IRA, Charles Schwab IRA
- **When shown:** When user indicates retirement as a primary goal
- **Disclosure:** Same format
- **Typical fee:** $50-$150 per funded account

## Affiliate Disclosure Requirements

### In-App Disclosure (Implemented)

Every affiliate offer card includes:
> "When you open and fund an account through this link, Thesis may receive a referral fee. This does not affect your cost. Offers ranked by user profile fit, not commission amount."

### Global Disclosure (Settings)

The Settings/About screen includes:
> "Thesis earns referral fees when users open accounts through affiliate links. We never accept payment to recommend specific securities. Investment decisions are yours alone."

## Offer Ranking

Affiliate offers are ranked by **user profile fit**, not by commission amount:
1. Relevance to user's goals (retirement → IRA, investing → brokerage)
2. User experience level (beginner-friendly platforms first)
3. Account minimums (no/low minimums preferred)
4. Educational resources provided by the partner
5. Commission amount (tiebreaker only)

## What Thesis Does NOT Do

- ❌ Accept payment for recommending specific stocks, ETFs, or securities
- ❌ Accept payment for favorable placement in research or analysis
- ❌ Accept payment for positive coverage in AI-generated content
- ❌ Sell user portfolio data to affiliate partners
- ❌ Share transaction data with affiliate partners for targeting
- ❌ Route trades or receive payment for order flow
- ❌ Offer different educational content or tools based on affiliate relationships

## Regulatory Position

The affiliate model is a key element of Thesis's regulatory analysis:

1. **Not compensation for investment advice:** The fee is triggered by account opening, not by securities transactions
2. **Not transaction-based compensation:** Thesis does not receive commissions on trades
3. **Consumer-friendly:** User pays nothing; brokerage pays a customer acquisition cost
4. **Fully disclosed:** Affiliate relationships are transparent and labeled
5. **Common model:** NerdWallet, Bankrate, Credit Karma, and Investopedia all use this model

## Revenue Projections (Illustrative)

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|------------|
| Monthly active users | 1,000 | 5,000 | 25,000 |
| Conversion rate (user → account) | 2% | 4% | 6% |
| Average fee per account | $75 | $100 | $125 |
| Monthly revenue | $1,500 | $20,000 | $187,500 |

## Future Monetization (v2+)

Potential future revenue streams, all of which will be re-evaluated for regulatory implications:

- **Premium tier (subscription):** Advanced research tools, unlimited AI queries, priority features
- **Data licensing:** Anonymized, aggregated investment behavior trends (no individual data)
- **Enterprise/API:** Embedding Thesis research tools in other platforms

Any subscription tier will include renewed regulatory analysis to ensure it does not cross into "compensation for investment advice."

---

*Last updated: June 2026*

**Note:** Actual affiliate partnerships, fee amounts, and terms are subject to individual agreements with each partner. The figures above are illustrative for business planning.`,
  },
  {
    id: "08-plaid-product-justifications",
    title: "Plaid Product Justifications",
    description: "Justification for each Plaid product used by Thesis",
    content: `# Thesis — Plaid Product Justifications

## Enrich

Thesis uses Enrich to automatically categorize bank transactions so users see their real monthly investable capacity without manual data entry. Income minus categorized expenses (housing, food, subscriptions, debt payments) = investable capacity. This powers the Investable Capacity Calculator ("You have ~$400/month to invest") and the Emergency Fund Check (compares essential spending against savings balances). No manual categorization required.

## Investments

Thesis imports brokerage holdings via Investments to power the core product: comparing a user's real portfolio against their self-built thesis model. A user builds an "AI Infrastructure" thesis with target weights (NVDA 25%, AMD 15%, SMH 10%), then connects their brokerage to see their Thesis Alignment Score ("Your portfolio is 62% aligned. You're overweight NVDA and missing semiconductor ETF exposure.") Also powers Portfolio X-Ray (ETF look-through overlap detection) and concentration risk flags. Read-only comparison — users make their own decisions.

## Liabilities

Thesis imports loan data to give users the full financial picture before they build an investment thesis. Credit card debt at 22% APR mathematically beats most stock returns — Thesis surfaces this: "Paying down this debt is your highest-return move right now." Student loans, mortgages, and auto loans calibrate thesis risk: a user with $80K in student debt gets different suggestions than someone debt-free. Also powers the net worth dashboard and contextual affiliate offers (balance transfer cards when high-interest debt is detected). Education-first: fix the foundation before building the portfolio.

## Transactions

Thesis imports 24 months of transaction history to calculate real monthly investable capacity from actual data rather than user estimates. Income minus spending minus debt obligations = investable capacity. Powers three features: (1) Investable Capacity Calculator, (2) Emergency Fund Check comparing essential spending to savings, (3) CFO/AI context so responses are grounded in real cash flow data. Educational tool — teaches good financial habits, not product recommendations.

---

*Last updated: June 2026*`,
  },
  {
    id: "09-information-security-policy",
    title: "Information Security Policy",
    description: "Security policy, access controls, encryption, and incident response",
    content: `# Thesis — Information Security Policy

**Last Updated:** June 2026
**Owner:** Jaiden Rabatin, Owner/CEO

## 1. Scope

This policy applies to all systems, data, and personnel involved in the Thesis application ("the App"), including the mobile client, backend API server, database, and third-party integrations (Plaid, Supabase, DeepSeek API).

## 2. Roles & Responsibilities

| Role | Name | Responsibility |
|------|------|----------------|
| Security Owner | Jaiden Rabatin | All security decisions, incident response, policy maintenance |
| Developer | Jaiden Rabatin | Secure coding, dependency management, deployment |

As a sole-founder operation, all security responsibilities are held by the owner. A group contact email is maintained for continuity: founder@makeyourthesis.com.

## 3. Asset Classification

| Asset | Classification | Location |
|-------|---------------|----------|
| Plaid access tokens | **Sensitive** — financial data access | Server (encrypted storage) |
| Plaid API keys | **Critical** — would allow unauthorized data access | Environment variables only, never in source code |
| User profile data | **Confidential** — PII-lite (email, investment preferences) | Supabase (encrypted at rest) |
| Source code | **Internal** | GitHub private repository |
| Mobile app | **Public** | Expo / TestFlight distribution |

## 4. Access Controls

### 4.1 Production Access

- Single developer (Jaiden Rabatin) has production access
- Server access: SSH key-based authentication only (no password login)
- Database access: Supabase dashboard with MFA, service-role key restricted to server-side API routes
- No third-party contractors or employees with production access

### 4.2 Sensitive Data Access

- Plaid API keys: Stored in environment variables (.env), never committed to version control
- Plaid access tokens: Server-side only, never exposed to mobile client
- User data: Accessed through Supabase Row-Level Security (RLS) policies, scoped to authenticated user

### 4.3 Client Access

- Users authenticate via Google OAuth (Supabase Auth) before accessing any features
- Plaid Link is only surfaced after authentication
- Mobile app never receives or stores Plaid access tokens

## 5. Encryption

### 5.1 Data in Transit

- All client-server communication uses HTTPS/TLS 1.2+
- Plaid API communication is server-to-server over HTTPS
- Supabase connections use TLS

### 5.2 Data at Rest

- Plaid access tokens: Stored on server in encrypted storage
- User data in Supabase: Encrypted at rest (AES-256) by Supabase
- Mobile device storage: AsyncStorage (local only, cleared on app deletion)

## 6. Authentication

### 6.1 Consumer Authentication

- Users authenticate via Google OAuth 2.0 (Supabase Auth)
- Google OAuth enforces Google's MFA policies on the consumer side
- Thesis does not store passwords — authentication is delegated to Google

### 6.2 Administrative Authentication

- Supabase dashboard: MFA enabled
- Plaid dashboard: MFA enabled
- GitHub: MFA enabled
- Server SSH: Key-based authentication

## 7. Vulnerability Management

### 7.1 Dependency Scanning

- npm audit run on each dependency installation
- Dependabot enabled on GitHub repository for automated vulnerability alerts
- Critical/High vulnerabilities patched within 7 days; Medium within 30 days

### 7.2 Code Review

- All code changes reviewed before merge
- TypeScript strict mode catches type-level issues at compile time
- Server-side input validation on all API endpoints (Zod schemas)

### 7.3 Production Monitoring

- Deployment logs monitored for anomalies
- Server health endpoint checked on deploy
- API error rates manually reviewed

## 8. Incident Response

### 8.1 Detection

- Server errors logged with context
- Plaid webhook endpoint ready for ITEM/HOLDINGS error notifications
- Supabase provides database error monitoring

### 8.2 Response Procedure

1. **Identify:** Determine scope and affected systems
2. **Contain:** Revoke affected credentials, rotate keys, disable compromised endpoints
3. **Investigate:** Review logs, determine root cause
4. **Notify:** Inform affected users within 72 hours; notify Plaid if Plaid data is involved
5. **Remediate:** Patch vulnerability, restore service
6. **Post-mortem:** Document findings, update policy

### 8.3 Contact

- Security contact: founder@makeyourthesis.com
- Alternate: jaiden@makeyourthesis.com

## 9. Data Retention & Deletion

- Plaid access tokens: Deleted immediately when user disconnects accounts
- User profile and thesis data: Retained until user requests deletion
- Cached financial data: Cleared from client on disconnect
- Users can request full data deletion by email or in-app settings

## 10. Third-Party Risk Management

| Provider | Service | Security Review |
|----------|---------|-----------------|
| Plaid | Financial data aggregation | SOC 2 Type II, ISO 27001 certified |
| Supabase | Database & authentication | SOC 2, encrypted at rest, RLS |
| Railway | Server hosting | SOC 2, isolated containers |
| DeepSeek | AI/LLM API | API key authentication, no financial data sent |
| Google OAuth | Consumer authentication | Industry-standard OAuth 2.0 |

## 11. Policy Review

This policy is reviewed every 6 months or after any significant system change, whichever comes first. Next review: December 2026.

---

**Acknowledged by:**

Jaiden Rabatin, Owner/CEO — June 2026`,
  },
  {
    id: "10-plaid-questionnaire",
    title: "Plaid Security Questionnaire",
    description: "Answers to Plaid's security questionnaire for application",
    content: `# Plaid Security Questionnaire — Answer Key

**Application:** Thesis (makeyourthesis.com)
**Contact:** Jaiden Rabatin, founder@makeyourthesis.com
**Date:** June 2026

---

## Q1: Security Contact

- Name: Jaiden Rabatin
- Title: Owner/CEO
- Email: founder@makeyourthesis.com
- Alternate: jaiden@makeyourthesis.com

---

## Q2: Documented Information Security Policy?

**Answer: Yes**

Refer to the Information Security Policy document.

---

## Q3: Access Controls?

- [x] Role-based access controls (single admin; Supabase RLS)
- [x] MFA for administrative access (all dashboards)
- [x] SSH key-based authentication (server, no passwords)
- [x] Environment variable-based secrets management
- [x] Principle of least privilege

---

## Q4: MFA for Consumers Before Plaid Link?

**Answer: Yes — Phishing-resistant MFA (TOTP/Google Authenticator)**

Implementation: POST /v1/mfa/setup → QR code → Google Authenticator → POST /v1/mfa/verify

Screenshot needed: MFA setup screen with QR code (tap "Link accounts" in Accounts tab)

---

## Q5: MFA for Critical Systems?

**Answer: Yes**

Supabase, Plaid, and GitHub dashboards all have MFA. Server access via SSH keys only.

---

## Q6: TLS 1.2+ in Transit?

**Answer: Yes**

HTTPS/TLS 1.2+ on all connections (Railway, Supabase, Plaid API).

---

## Q7: Encryption at Rest for Plaid Data?

**Answer: Yes**

Filesystem encryption on server. Supabase AES-256 at rest. Tokens never on mobile device.

---

## Q8: Vulnerability Scans?

- [x] Dependency scanning (npm audit, Dependabot)
- [x] Static analysis (TypeScript strict, Zod validation)
- [x] Manual code review

---

## Q9: Privacy Policy?

**Answer: Yes**

Document: Privacy Policy (see above)
URL: makeyourthesis.com/privacy

---

## Q10: Consumer Consent?

**Answer: Yes**

Plaid Link in-flow consent + Privacy Policy + Terms of Service acceptance.

---

## Q11: Data Deletion & Retention Policy?

**Answer: Yes**

Plaid tokens deleted on disconnect. User deletion by request. Policy reviewed every 6 months.

---

## Document Upload Checklist

| Question | File |
|----------|------|
| Q2 | Information Security Policy |
| Q4 | Screenshot of MFA setup screen (QR code) |
| Q9 | Privacy Policy (or link to makeyourthesis.com/privacy) |`,
  },
];
