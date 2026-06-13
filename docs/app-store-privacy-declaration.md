# App Store Privacy Declaration for Thesis

## Data Collection & Use

### Data NOT Collected
- ❌ Health & fitness
- ❌ Sensitive financial info (brokerage account numbers, SSNs)
- ❌ Payment info (handled by RevenueCat, not us)
- ❌ Precise location
- ❌ Contacts
- ❌ Photos/videos
- ❌ Audio/video data

### Data Collected (Required for App Function)

#### 1. **User Profile & Identity** (Required)
- **Name** — optional, for personalization
- **Email** — via Supabase OAuth (Google/Apple sign-in only)
- **Investor Profile** — questionnaire responses (risk tolerance, experience level)
- **Linked Accounts** — read-only portfolio data via Plaid (not stored by us)

**Purpose:** Onboarding, personalization, thesis building  
**Retention:** Until account deletion (or 90 days after last login)

#### 2. **App Activity** (Required)
- **Watchlist data** — securities user is researching
- **Thesis models** — user-created investment theses
- **Chat history** — "Ask Thesis" AI assistant conversations
- **Search queries** — market research searches
- **Quiz/lesson progress** — education course completion

**Purpose:** Core app functionality  
**Retention:** Until account deletion

#### 3. **Identifiers** (Required)
- **Device ID** — for crash reporting (Sentry)
- **User ID** — Supabase UUID for multi-device sync
- **IP address** — server logs (stored by Fly.io)

**Purpose:** Session management, error tracking, abuse prevention  
**Retention:** Server logs: 7-30 days; Device ID in Sentry: 90 days

#### 4. **Diagnostic Data** (Optional but Enabled)
- **Crash logs** — sent to Sentry for error monitoring
- **Performance metrics** — app responsiveness, latency

**Purpose:** Debugging, performance monitoring  
**Retention:** Sentry: 90 days default

#### 5. **Other Data** (if applicable)
- **Device model, OS version** — Sentry diagnostics
- **Referrer info** — affiliate link tracking (RevenueCat)

**Purpose:** Analytics, affiliate revenue  
**Retention:** 12 months

---

## Third-Party Services & Data Sharing

| Service | Data Shared | Purpose |
|---------|------------|---------|
| **Supabase** (Auth & DB) | Email, profile, thesis data | User identity, data storage |
| **Plaid** | Linked account (read-only) | Portfolio visibility |
| **RevenueCat** | User ID, subscription status | In-app billing |
| **DeepSeek/Anthropic API** | Research queries (NO PII) | AI-powered research |
| **Polygon/Massive** | Search terms, symbols | Market data |
| **Sentry** | Device ID, crash logs, IP | Error monitoring |
| **Fly.io** (server) | IP address, user agent | Server logs |

**None of these services use data for marketing or training (verified in their terms).**

---

## Data Security

- ✅ Encryption in transit (TLS/HTTPS only)
- ✅ Encryption at rest (Supabase default)
- ✅ Fail-closed auth (app key required)
- ✅ Rate limiting on API endpoints
- ✅ Session tokens auto-refresh
- ⏳ MFA for sensitive operations (optional, Phase 2)

---

## User Rights & Transparency

- **Data Access:** Users can export their thesis data via settings
- **Deletion:** Users can delete account + all associated data via settings
- **Opt-out:** Users can sign in optionally; full app access without auth
- **Privacy Policy:** https://makeyourthesis.com/privacy-policy
- **Terms of Service:** https://makeyourthesis.com/terms-of-service

---

## App Tracking Transparency (ATT)

**Does the app request IDFA (Apple advertising ID)?**  
❌ **No** — We do not request tracking permission or use IDFA.

---

## Age Rating

**Appropriate for:** 4+ (no gambling mechanics, no real money trading, educational content only)

---

## Compliance Notes

- ✅ Not a financial advisor; clearly disclosed in app
- ✅ Educational only; no real investment recommendations
- ✅ No real trading; no brokerage account access
- ✅ Complies with COPPA (children under 13 not targeted)
- ✅ Complies with GDPR (Supabase hosted, data deletion supported)
