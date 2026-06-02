# Thesis Business Documents

This is the single place to track business setup, operating accounts, vendor choices, and launch details for Thesis.

Do not store passwords, API secrets, recovery codes, private keys, bank login credentials, or full account numbers in this file. Store those in a password manager and put the vault item name here.

Last reviewed: 2026-05-31

---

## Quick Index

| Area | Status | Owner | Next review |
|------|--------|-------|-------------|
| Business entity | Not started | Jaiden | TBD |
| EIN / tax setup | Not started | Jaiden | TBD |
| Business bank account | Not started | Jaiden | TBD |
| Business credit card | Not started | Jaiden | TBD |
| Domain / DNS | Not started | Jaiden | TBD |
| Business email | Not started | Jaiden | TBD |
| Website / landing page | In progress | Jaiden | TBD |
| App Store / developer accounts | Not started | Jaiden | TBD |
| Payment processing | Not started | Jaiden | TBD |
| Legal docs | Not started | Jaiden | TBD |
| Analytics / monitoring | Not started | Jaiden | TBD |

---

## Business Identity

| Field | Details |
|-------|---------|
| Product name | Thesis |
| Legal business name | TBD |
| DBA / trade name | TBD |
| Entity type | TBD |
| State formed | TBD |
| Formation date | TBD |
| EIN | Do not paste full EIN here. Store in password manager / business records. |
| Business address | TBD |
| Registered agent | TBD |
| Primary business email | TBD |
| Support email | TBD |
| Founder / owner | Jaiden Rabatin |

### Core Business Notes

- Thesis is an investing education and portfolio thesis app.
- Current business model: affiliate revenue, subscriptions / Pro features, and possible future partnerships.
- Important compliance stance: education first, no fiduciary claims, no guaranteed returns, clear affiliate disclosures.

---

## Canonical Links

| Asset | URL / location | Notes |
|-------|----------------|-------|
| App repository | `/Users/jaidenrabatin/Projects/thesis` | Local repo |
| Product docs | `/Users/jaidenrabatin/Projects/thesis/docs` | Planning and operating docs |
| Landing page code | `/Users/jaidenrabatin/Projects/thesis/landing` | Static landing site |
| Production website | TBD | Add final URL |
| App Store listing | TBD | Add when created |
| Google Play listing | TBD | Add if created |
| Privacy policy | TBD | Required before launch |
| Terms of service | TBD | Required before launch |
| Affiliate disclosure | TBD | Required before affiliate links go live |

---

## Accounts And Access

Use this section to remember what exists and where the credentials live. Put password manager item names here, not secrets.

| Account / service | Purpose | Login email | Password manager item | 2FA method | Status | Notes |
|-------------------|---------|-------------|------------------------|------------|--------|-------|
| Apple Developer | iOS app distribution | TBD | TBD | TBD | Not started | Needed for App Store |
| Google Play Console | Android distribution | TBD | TBD | TBD | Optional | Needed only if Android launch |
| Expo | Mobile builds / deployment | TBD | TBD | TBD | TBD | Check current setup |
| GitHub | Source control | TBD | TBD | TBD | Active | Confirm repo owner / org |
| Netlify / hosting | Landing page hosting | TBD | TBD | TBD | TBD | Current landing folder exists |
| Domain registrar | Domain ownership | TBD | TBD | TBD | Not started | GoDaddy / Namecheap / Cloudflare |
| DNS provider | DNS records | TBD | TBD | TBD | Not started | Often same as registrar |
| Email provider | Business email | TBD | TBD | TBD | Not started | Google Workspace / Zoho / Proton |
| Stripe | Payments / subscriptions | TBD | TBD | TBD | Not started | Needs business bank |
| RevenueCat | Mobile subscriptions | TBD | TBD | TBD | TBD | Current app uses purchases typings |
| Plaid | Account linking | TBD | TBD | TBD | TBD | App has Plaid docs/code |
| Analytics | Product analytics | TBD | TBD | TBD | Not started | PostHog / Amplitude / Mixpanel |
| Error monitoring | Crash/error tracking | TBD | TBD | TBD | Not started | Sentry likely |
| LLM provider | AI features | TBD | TBD | TBD | TBD | Track model/API owners |

---

## Domains, Email, And DNS

### Domains

| Domain | Registrar | Renewal date | Auto-renew | DNS provider | Purpose | Notes |
|--------|-----------|--------------|------------|--------------|---------|-------|
| TBD | TBD | TBD | TBD | TBD | Primary website |  |

### Email Addresses

| Address | Provider | Purpose | Forwards to | Status | Notes |
|---------|----------|---------|-------------|--------|-------|
| hello@TBD | TBD | General inbound | TBD | Not started | Public website contact |
| support@TBD | TBD | Customer support | TBD | Not started | App Store support URL/email |
| legal@TBD | TBD | Legal/privacy requests | TBD | Not started | Optional but useful |
| admin@TBD | TBD | Vendor/admin accounts | TBD | Not started | Avoid using personal email long-term |

### DNS Records

| Type | Name | Value / target | Purpose | Status | Notes |
|------|------|----------------|---------|--------|-------|
| A / CNAME | TBD | TBD | Website hosting | Not started |  |
| MX | TBD | TBD | Business email | Not started |  |
| TXT | TBD | TBD | SPF | Not started | Email deliverability |
| TXT | TBD | TBD | DKIM | Not started | Email deliverability |
| TXT | TBD | TBD | DMARC | Not started | Email deliverability |
| TXT | TBD | TBD | Domain verification | Not started | Apple/Google/Stripe/etc. |

---

## Website And App Stack

### Current Local Stack

| Layer | Current choice | Location | Notes |
|-------|----------------|----------|-------|
| Mobile app | Expo / React Native | `src/` | Main Thesis app |
| Landing page | Static HTML | `landing/` | Website/marketing page |
| Backend | Node / TypeScript | `server/` | LLM, market, Plaid, webhook code |
| Package manager | npm | `package.json`, `server/package.json` | Keep lockfiles committed |
| Styling | NativeWind / Tailwind | `tailwind.config.js`, `src/global.css` | App styling |

### Production Stack Decisions

| Decision | Choice | Date decided | Why | Revisit when |
|----------|--------|--------------|-----|--------------|
| Website host | TBD | TBD | TBD | Before public launch |
| Backend host | TBD | TBD | TBD | Before API-dependent beta |
| Database | TBD | TBD | TBD | Before real user accounts |
| Auth | TBD | TBD | TBD | Before private user data |
| Analytics | TBD | TBD | TBD | Before TestFlight beta |
| Error monitoring | TBD | TBD | TBD | Before TestFlight beta |

---

## Banking, Money, And Taxes

Do not store full account numbers in this repo.

| Account | Institution | Purpose | Last 4 only | Login item | Status | Notes |
|---------|-------------|---------|-------------|------------|--------|-------|
| Business checking | TBD | Revenue, payouts, operating expenses | TBD | TBD | Not started | Needed for Stripe/payouts |
| Business savings | TBD | Tax reserve / runway | TBD | TBD | Optional |  |
| Business credit card | TBD | SaaS, hosting, App Store, APIs | TBD | TBD | Not started | Keeps expenses clean |
| Stripe balance | Stripe | Customer payments | N/A | TBD | Not started | Connect after EIN/bank |

### Recurring Expenses

| Vendor | Amount | Billing cycle | Card/account | Renewal date | Cancel link / notes |
|--------|--------|---------------|--------------|--------------|---------------------|
| Apple Developer Program | TBD | Annual | TBD | TBD | Required for iOS |
| Domain | TBD | Annual | TBD | TBD |  |
| Email hosting | TBD | Monthly | TBD | TBD |  |
| Hosting | TBD | Monthly | TBD | TBD |  |
| LLM APIs | Usage-based | Monthly | TBD | TBD | Set usage caps |
| Analytics / monitoring | TBD | Monthly | TBD | TBD |  |

### Tax And Bookkeeping

| Item | Tool / location | Status | Notes |
|------|-----------------|--------|-------|
| EIN confirmation letter | Password manager / business folder | Not started | Do not commit raw file here |
| Formation docs | Business records folder | Not started | Articles/registration |
| Bookkeeping system | TBD | Not started | QuickBooks / Wave / spreadsheet |
| Receipt storage | TBD | Not started | Keep every SaaS and filing receipt |
| Tax reserve rule | TBD | Not started | Example: set aside % of revenue |

---

## Legal, Compliance, And Store Requirements

| Document / requirement | Status | Location | Notes |
|------------------------|--------|----------|-------|
| Privacy policy | Not started | TBD | Required for app and website |
| Terms of service | Not started | TBD | Required before launch |
| Affiliate disclosure | Not started | TBD | Needed for affiliate surfaces |
| Investment disclaimer | Not started | TBD | Must be visible in app/website |
| App Store privacy labels | Not started | Apple Developer | Need data collection map |
| Data retention policy | Not started | TBD | Especially for linked accounts/chat |
| Support contact | Not started | TBD | Required for stores |
| Delete account flow | Not started | TBD | Required if user accounts exist |

### Compliance Guardrails

- Do not describe Thesis as a broker, registered investment adviser, fiduciary, or trade execution platform unless the business actually becomes one.
- Use educational language: "learn," "compare," "understand," "build a thesis."
- Avoid language like "guaranteed," "risk-free," "beat the market," or personalized investment advice.
- Always disclose affiliate relationships near monetized offers.
- Keep clear boundaries between educational content and paid partner links.

---

## Launch Checklist

### Before Private Testing

- [ ] Decide legal business name and entity path.
- [ ] Create or confirm domain.
- [ ] Create business email.
- [ ] Confirm repo and hosting ownership.
- [ ] Decide where secrets live.
- [ ] Add `.env.example` coverage for required environment variables.
- [ ] Set basic crash/error monitoring.
- [ ] Set analytics event naming rules.
- [ ] Create support inbox or contact form.

### Before TestFlight / Beta

- [ ] Apple Developer account active.
- [ ] Privacy policy exists and is linked.
- [ ] Terms of service exists and is linked.
- [ ] App Store privacy labels drafted.
- [ ] Support URL/email working.
- [ ] Backend production environment deployed.
- [ ] API usage caps configured.
- [ ] Test account flow and data deletion expectations documented.
- [ ] Legal disclaimers reviewed in onboarding, offer cards, and AI/chat surfaces.

### Before Public Launch

- [ ] Business bank account connected to Stripe / payment processor.
- [ ] Subscription products configured.
- [ ] Affiliate links replaced with real partner links.
- [ ] Affiliate disclosure visible anywhere offers appear.
- [ ] Domain, DNS, email, and website verified.
- [ ] Error monitoring alerts routed to the right inbox.
- [ ] Analytics dashboard created for activation, retention, conversion, and crashes.
- [ ] Receipts and recurring expenses tracked.
- [ ] Final launch decision recorded in Decision Log.

---

## Decision Log

Use this whenever you make a business or infrastructure choice. Future you should be able to understand what happened in 30 seconds.

| Date | Decision | Options considered | Why this choice | Follow-up |
|------|----------|--------------------|-----------------|-----------|
| 2026-05-31 | Created this business documents file | Scattered notes vs. source-of-truth doc | Prevent launch details from getting lost | Fill in active accounts and next actions |

---

## Change Log

| Date | Change | Notes |
|------|--------|-------|
| 2026-05-31 | Created initial business document | Added sections for identity, accounts, DNS, stack, banking, legal, and launch readiness |

---

## Parking Lot

Questions and loose ends that should not disappear:

- What should the legal entity be called?
- Which domain will be the canonical Thesis domain?
- Should business email live under Thesis branding or Softstack branding?
- Which expenses are already being paid personally and need to be moved to a business card later?
- Which services already exist under personal accounts and need ownership cleanup?
- What is the minimum legal/compliance review needed before app beta?
