# Thesis — Beta Launch Marketing Plan

**Product:** "Investopedia meets NerdWallet" — educational investing app.
**Audience:** Gen Z / Millennials curious about stocks but intimidated by traditional brokerages.
**Goal:** Get 50–100 beta testers, collect feedback via `docs/beta-feedback.md`, iterate before public launch.

---

## Positioning

**One-liner:** "Learn before you trade. Build a portfolio grounded in an investment thesis — not hot tips."

**Differentiators:**
- Education-first (courses, glossary, Ask Thesis AI)
- Thesis builder with conviction scoring
- Duels for comparing stocks/theses side-by-side
- No broker required — affiliate monetization keeps it free

---

## Content Marketing (4-week pre-launch)

### Week 1: Foundation
- Blog: "What Is an Investment Thesis? (And Why You Need One)"
- Blog: "Compound Interest Explained in 5 Minutes"
- TikTok/Reel: "ETF vs Stock — which should a beginner buy?"

### Week 2: Comparison & Tools
- Blog: "VOO vs SCHD — Which Core ETF Fits Your Strategy?"
- Blog: "How to Read a Stock Chart Without Getting Overwhelmed"
- TikTok/Reel: "I built an AI investment thesis in 60 seconds"

### Week 3: Community & Teasers
- Reddit: r/investing, r/personalfinance — "What's your investment thesis for 2026?"
- Twitter/X thread: "Why most beginners skip the most important step (building a thesis)"
- TikTok: App walkthrough teaser

### Week 4: Launch
- Announcement post (Substack + Twitter + Reddit)
- "My Thesis Portfolio" shareable template challenge
- Partner/influencer shoutouts if available

### Channels
- **Primary:** TikTok (educational short-form), Twitter/X (threads), Reddit (community)
- **Secondary:** Substack (blog), Instagram (shareable graphics)

---

## Email Campaign (5-email welcome sequence)

Tool: ConvertKit free tier or Mailchimp (free up to 500 contacts).

| # | Day | Subject | Content |
|---|-----|---------|---------|
| 1 | 0 | "Meet Thesis — investing education for the rest of us" | App intro, value prop, download link |
| 2 | 2 | "Your first investment thesis (5 minutes)" | Walkthrough of Builder, CTA to try |
| 3 | 5 | "Why I built Thesis (and what's coming)" | Founder story, roadmap teaser |
| 4 | 8 | "The Duel: SCHD vs VYM" | Feature showcase, educational content |
| 5 | 14 | "What beta testers are saying" | Social proof, feedback quotes, re-engagement |

**Lead capture:** Netlify form on `landing/index.html` → ConvertKit API or CSV export.

---

## UGC Strategy

### 1. "Share Your Thesis" 
- Users build a portfolio → tap Share → branded image card generated
- Image includes: portfolio name, top 3 holdings, conviction score, "Built with Thesis" watermark
- Post to Twitter/IG/TikTok with #MyThesisPortfolio

### 2. "Thesis Duel Challenge"
- Weekly duel prompt: "SCHD vs VYM — which wins for YOUR goals?"
- Users duel, screenshot the verdict, share
- Winner (most creative/shareable) gets featured

### 3. Pre-built Templates
- "AI Revolution" portfolio, "Dividend Snowball", "Boglehead Core"
- Users fork a template → customize → share as "I customized the AI Revolution thesis"

---

## Beta Tester Onboarding Flow

1. User fills Netlify form (email + "why interested")
2. Auto-reply with TestFlight/Expo link + quickstart guide
3. Day 3: Check-in email — "How's it going? Hit any snags?"
4. Day 7: Feedback request — link to `docs/beta-feedback.md` format
5. Day 14: "What feature would make you tell a friend?"

---

## Launch Metrics to Track

| Metric | Tool | Target |
|--------|------|--------|
| Beta signups | Netlify form count | 100+ |
| App installs | TestFlight / Expo | 60+ |
| Builder completions | In-app analytics (manual) | 30+ |
| Duels completed | In-app | 20+ |
| Feedback submissions | `beta-feedback.md` | 15+ |
| Affiliate link clicks | Bitly/UTM | — |

---

## Notes

- Hold on paid ads until PMF signals from beta
- RevenueCat for subscription analytics when Pro tier launches
- Content repurposed from app's education courses (credit score, Roth IRA, ETFs)
- Launch timing: align with TestFlight approval (pending Apple enrollment)
