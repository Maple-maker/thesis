# Thesis — Privacy Policy

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
| Display affiliate offers | Profile data, account types (e.g., "you don't have an IRA → IRA offer") |

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

To exercise these rights, contact us at [email to be added] or use the in-app settings.

## 8. Children's Privacy

Thesis is not intended for users under 13 years of age. We do not knowingly collect data from children under 13.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be communicated through the App. Continued use after changes constitutes acceptance.

## 10. Contact

For privacy-related questions or requests:
- Email: [to be added]
- In-app: Settings → Privacy → Contact

## 11. Plaid End User Privacy Policy

As required by Plaid, users linking financial accounts are also subject to Plaid's End User Privacy Policy, available at: https://plaid.com/legal/#end-user-privacy-policy

---

*Last updated: June 2026*
