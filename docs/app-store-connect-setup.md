# App Store Connect Setup for Thesis

## Checklist (Before Submission)

### 1. App Information
**Path:** App Store Connect → Thesis → App Information

- [ ] **General Information**
  - [ ] App Name: "Thesis" or "Thesis: Investment Research"
  - [ ] Subtitle: "Learn investing. Build your thesis." *(optional)*
  - [ ] Category: **Finance**
  - [ ] Subcategory: Stock market apps / Investment apps
  - [ ] Content Rights: ✅ **Yes** — "Third-party content (market data, affiliate, AI)"

- [ ] **Ratings**
  - [ ] **Age Rating:** 4+ (no mature content, no gambling)
  - [ ] Fill questionnaire: No violence, no adult content, no gambling mechanics

### 2. Pricing
**Path:** App Store Connect → Pricing and Availability

- [ ] **Tier:** Free
- [ ] **In-app Purchases:** Enabled
  - [ ] Thesis Pro (subscription or one-time)
  - [ ] Managed by RevenueCat (auto-configured)

### 3. App Privacy (MOST IMPORTANT)
**Path:** App Store Connect → App Privacy

#### A. Data Collection Questions
Answer: **Yes, we collect data**

1. **User ID**
   - [ ] Tracking: ❌ Not used for tracking
   - [ ] Linking: ✅ Linked to user identity
   - [ ] Purpose: Core functionality
   - [ ] Category: **User ID** or **Identifiers**

2. **User Profile**
   - [ ] Name: Optional
   - [ ] Email: Sign-in (OAuth)
   - [ ] Investor profile: Questionnaire
   - [ ] Category: **User ID** → **Name, Email, Investor Profile**

3. **App Activity**
   - [ ] Watchlist
   - [ ] Thesis models
   - [ ] Chat history
   - [ ] Category: **App Activity** → **App Interactions, Search History**

4. **Crash Data**
   - [ ] Crash logs via Sentry
   - [ ] Category: **Diagnostics** → **Crash Data**

5. **Device ID**
   - [ ] For error reporting
   - [ ] Category: **Identifiers** → **Device ID**

#### B. Data Tracking
- [ ] **Does this app track user across apps/websites?** → **No**
- [ ] **Link to Privacy Policy:** https://makeyourthesis.com/privacy-policy

#### C. Data Security
- [ ] Encryption in transit: ✅ Yes
- [ ] Can users request deletion: ✅ Yes (in Settings)
- [ ] Can users access their data: ✅ Yes (export option)
- [ ] Data retention policy: 90 days after last login, or account deletion

### 4. Version Release Information
**Path:** App Store Connect → Thesis → Version Release

- [ ] **Version:** 1.0.0
- [ ] **Build:** v1.0.0 #7 (select from dropdown)
- [ ] **Copyright Year:** 2026
- [ ] **Copyright Name:** Thesis Inc. (or your legal entity)

### 5. Description & Metadata
**Path:** App Store Connect → General Information

- [ ] **Description:** *(copy below)*
  ```
  Thesis is an educational tool for learning about investing, building a personal 
  investment thesis, and researching securities. Learn core investing concepts, 
  build a thesis that reflects your values and risk tolerance, and research 
  securities with AI-powered analysis.

  NOT INVESTMENT ADVICE. Nothing in this app is a recommendation to buy or sell 
  any security. Consult a qualified financial advisor before making investment 
  decisions.

  FEATURES:
  • Learn investing fundamentals (free courses, glossary)
  • Build a personal investment thesis
  • Research stocks and ETFs
  • AI-powered market research & analysis
  • Portfolio X-Ray (read-only via Plaid)
  • Watchlist with custom alerts
  • Ask Thesis: AI research assistant

  DATA & PRIVACY:
  • Sign in with Google or Apple (optional)
  • No real trading or brokerage access
  • All data encrypted and secure
  • View our privacy policy: https://makeyourthesis.com/privacy-policy
  ```

- [ ] **Keywords:** investing, finance education, stock research, financial literacy, personal finance

- [ ] **Support URL:** https://makeyourthesis.com/support (or support email)

- [ ] **Marketing URL:** https://makeyourthesis.com (landing page with app overview)

- [ ] **Privacy Policy URL:** https://makeyourthesis.com/privacy-policy

### 6. Screenshots
**Path:** App Store Connect → Screenshots

Required sizes:
- [ ] **iPhone 6.7"** (1284×2778 px) — e.g., iPhone 16 Pro Max
- [ ] **iPhone 5.5"** (1242×2208 px) — e.g., iPhone 8 Plus
- [ ] **iPad 12.9"** (optional, 2048×2732 px)

**Screenshot order (5-8 screens recommended):**
1. Onboarding reveal (hero screen)
2. Builder thesis creation
3. Watchlist with researching
4. AI chat "Ask Thesis"
5. Home feed insights
6. Education courses
7. Settings / data privacy

**Tip:** Use Xcode or a device recorder to capture screenshots, then crop to exact sizes.

### 7. Rating Icon (Artwork)
**Path:** App Store Connect → App Preview & Screenshots

- [ ] **App Icon:** 1024×1024 px (already in `assets/images/icon.png`)

### 8. Review Information
**Path:** App Store Connect → General Information → App Review Information

- [ ] **Contact Email:** founder@makeyourthesis.com
- [ ] **First Name / Last Name:** Your name
- [ ] **Phone:** Your contact number
- [ ] **Demo Account (if needed):**
  - [ ] Email: (test account credentials)
  - [ ] Password: (test account credentials)
  - Note: "App works without sign-in; optional demo account: ..."
- [ ] **Notes for Review:** 
  ```
  Thesis is an educational investing app. It does NOT execute trades or 
  access real brokerage accounts. All AI research is educational only and 
  not personalized investment advice. Users can test all features without 
  signing in. If they do sign in (optional), they can link read-only 
  Plaid access to see portfolio data.
  
  Disclaimer: "Not investment advice" is clearly shown on first launch 
  and in the app settings.
  ```

---

## Submission Checklist

- [ ] All sections above completed
- [ ] Build v1.0.0 #7 selected
- [ ] Price tier set (Free)
- [ ] Privacy policy approved by admin
- [ ] Screenshots uploaded
- [ ] Review notes filled in
- [ ] **Submit for Review** button visible

---

## After Submission

1. **First Review:** 24–48 hours (usually)
2. **Common Rejection Reasons:**
   - Missing privacy policy link → Add to settings ✅ (done)
   - Unclear "not investment advice" → Disclaimer in onboarding ✅ (check reveal.tsx)
   - Misleading app description → Avoid "investing signals" or "buy/sell recommendations"
3. **Approval:** Get notified, app appears on App Store
4. **TestFlight:** Parallel track for beta testing (separate from App Store submission)

---

## Important Notes

- **Privacy & GDPR:** Supabase handles GDPR compliance (data deletion, exports)
- **Sentry Data:** Ensure privacy policy mentions crash/error reporting
- **Plaid:** If users enable account linking, make clear it's read-only
- **Affiliate Disclosure:** Credit card recommendations → Mark as affiliate content (done in landing page)
- **Age Rating:** Currently 4+ (safe for all ages); no mature/gambling content

---

## Template URLs (Update as Needed)

- Landing: `https://makeyourthesis.com` (deploy to landing/ on Netlify)
- Privacy: `https://makeyourthesis.com/privacy-policy` ✅
- ToS: `https://makeyourthesis.com/terms-of-service` ✅
- Support: `https://makeyourthesis.com/support` (or `mailto:founder@makeyourthesis.com`)
