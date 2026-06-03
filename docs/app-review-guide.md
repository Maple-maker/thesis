# Thesis App — App Store Review Guide

**Developer:** JAIDEN DAVID RABATIN  
**Bundle ID:** com.makeyourthesis.app  
**Contact:** founder@makeyourthesis.com

---

## What Thesis Is

Thesis is an **investment education and portfolio analysis app**. It does NOT trade stocks, manage money, or provide financial advice. It helps investors understand their portfolios, learn investing frameworks, and research stocks/ETFs.

---

## Core Features

### 1. Portfolio X-Ray
Upload a linked brokerage account (via Plaid sandbox in TestFlight) or manually enter holdings. The X-Ray shows:
- Effective sector/stock exposure
- Overlap flags and concentration risks
- Gaps in coverage

### 2. Stock Duel
Compare any two stocks or ETFs side-by-side. See thesis fit, overlap percentage, and what each side is lacking.

### 3. Investor Lenses
4 model portfolios built by real investment strategists. Each shows targets, allocations, and an **alignment score** vs. the user's own book.

### 4. Event Briefs
Market events and news briefs tailored to the user's holdings, themes, and watchlist.

### 5. Ask Thesis (AI CFO)
An AI-powered research assistant. Ask questions about the Fed, rates, sector trends, or specific stocks. Responses include citations and conviction-ranked ideas.

### 6. Education Courses
Guided courses that teach investing frameworks — from basics to advanced thesis construction. Users progress through lessons and build a personal investment thesis.

---

## Demo / Testing Notes

- **TestFlight users can connect a Plaid sandbox account** to test portfolio features. Use Plaid sandbox credentials: `user_good` / `pass_good`.
- **Ask Thesis** requires an active backend (deployed at `thesis-server-beta.fly.dev`).
- **Education content** is available without any account setup — reviewers can explore courses immediately.
- **No real money is involved.** All portfolio data is for demonstration and education only.

---

## Compliance Notes

- This app does **not** provide financial advice. All content is educational.
- Market data is sourced from publicly available APIs and displayed for informational purposes.
- The app does not execute trades or hold user funds.
- Users must create an account to access portfolio features. No sensitive financial data is stored on-device.

---

## Age Rating Justification

- No gambling, violence, or adult content.
- Contains user-generated content (Ask Thesis chat) which is AI-moderated for financial topics only.
- No real-money transactions within the app (subscription via RevenueCat for Pro features).

---

## Test Credentials (if needed)

A demo account can be provided upon request. Contact founder@makeyourthesis.com.
