# Thesis — Regulatory Compliance Position

## Regulatory Determination

### Investment Advisers Act of 1940 — NOT an Investment Adviser

Under Section 202(a)(11) of the Investment Advisers Act, an "investment adviser" is any person who, **for compensation**, engages in the business of **advising others** about the **value of securities** or the advisability of investing in securities.

Thesis does not meet this three-part test:

| Prong | Requirement | Thesis Position |
|-------|-------------|-----------------|
| **1. Advice about securities** | Must provide specific recommendations about securities | ❌ Thesis provides educational content, research tools, and a thesis builder. Users build their own thesis. No buy/sell/hold recommendations are made. All AI-generated content includes disclaimers: "No investment recommendations. Alpha gives you information, not advice." |
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

**Disclaimer:** This document is an internal compliance analysis, not legal advice. Consult qualified securities counsel for a formal regulatory opinion before launch.
