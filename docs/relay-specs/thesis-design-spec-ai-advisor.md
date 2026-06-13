# Thesis design language + AI Advisor Pro spec

**Purpose:** Visual direction for the app redesign + specification for the AI Advisor Pro feature.
**Status:** Design reference — not a Hermes implementation slice. Use as input to Track 3 (visual pass) and M3 (AI CFO feature).

---

## Design language: what Thesis should feel like

### Tone in one sentence
**Daylight editorial** — calm, trusted, built for a thinking investor, not a trader. Closer to a quality financial journal than a fintech dashboard.

### Reference synthesis (from the 7 images)

| Ref | What to steal | What to skip |
|-----|--------------|--------------|
| Image 2 (spending velocity) | Editorial serif kicker + headline above chart; warm chart with data points, not just a line; "Deep Dive" pill CTA style | Spending/budget framing |
| Image 3 (health dashboard) | Warm neutral surface, large greeting with data count, bottom nav weight | Blurry orb art, wellness framing |
| Image 4 (macro tracker) | Big display number as hero, ring donut sub-metrics, minimal section headers | Green/red returns as primary hook |
| Image 5 (Dear Me) | Large italic display headline as emotional anchor, minimal screen with one strong CTA, gradient-soft backgrounds | Gradients (Thesis = flat Daylight) |
| Image 6 (health tips) | AI suggestion card at top, profile-aware insight rows, "Ask anything" CTA card, explore grid | Dark bottom nav |
| Image 1 (crypto learning) | Lesson card rows with time + metadata, locked/unlocked state, progress bar style | XP gamification, "Great job!" copy, rainbow cards |
| Image 7 (learning app) | Score/progress list with rank pills, course card stacking | Bright pastel backgrounds, playful fonts |

---

## Daylight token cheatsheet

```
Backgrounds:  bg (#F3F5F1) · bg-surface (#FFFFFF) · bg-surface2 (#F7F9F5) · bg-subtle (#EDF0EB)
Text:         ink (#16201C) · ink-2 (#4D5A54) · ink-3 (#8C988F)
Lines:        line (#EAEDE8) · line-strong (#D6DBD4)
Brand:        brand (#0E7A66) · brand-bg (#D5E4DF) · brand-deep (#06483C)
Amber:        #D98512 (notice/signal) · amber-bg (#FCF1E0)
Positive:     pos (#149059) · pos-bg (#E5F5EC)
Negative:     neg (#D8472C) · neg-bg (#FBEAE5)
Type:         font-displayX (ExtraBold 800) · font-sansSb (SemiBold 600) · font-sansMd (Medium 500)
Mono:         font-monoBold (SplineSansMono 700) — tickers and numbers
```

---

## Key style rules (Track 3 pass)

### Typography hierarchy
| Use | Class | Size | Weight |
|-----|-------|------|--------|
| Screen headline | `font-displayX` | 34–40px | 800 |
| Section title | `font-displayX` | 24–28px | 800 |
| Card title | `font-sansBold` | 17–18px | 700 |
| Body | `font-sansMd` | 14–15px | 500 |
| Kicker / label | `font-sansX uppercase tracking-widest` | 10–11px | 800 |
| Ticker / number | `font-monoBold` | 14–16px | 700 |

**Current issue:** most headlines are 27–32px. Push the reveal headline and Quick Take result headline to 38–44px to create a stronger visual anchor. Everything else can stay.

### Spacing rhythm
- Screen top padding: `pt-6` (24px)
- Between section label and first card: `mb-3` (12px)
- Card internal padding: `px-4 py-3.5` — already good
- Card gap: `gap-y-2.5` — already good
- Section-to-section gap: `mt-8` (32px) — increase from current `mt-6`

### Card surface
- Use `bg-surface` (#FFFFFF) on cards that sit on `bg` (#F3F5F1) — the 2pt contrast creates the layer
- For "surface within surface" (a card inside a card), use `bg-surface2` (#F7F9F5)
- Never `bg-subtle` on the main screen background — too flat against cards

### Featured card (FeaturedCard)
The gradient card already works. The one upgrade: increase the gradient overlay to a 3-stop gradient:
```
[theme.color] at 0% → [theme.color at 90% opacity] at 60% → [brand-deep #06483C] at 100%
```
This gives it more depth and makes white text more readable at the bottom.

### What NOT to do
- No dark (#000 or near-black) screens — Thesis = Daylight
- No bright rainbow card colors (the theme glyphs are already colored; don't color card backgrounds)
- No XP or gamification language
- No "Great job!" affirmations — the tone is "you're thinking, not being praised"
- No gradients on backgrounds — flat surfaces only

---

## AI Advisor — Pro feature spec

### Concept
A chat interface that is **profile-aware** and **strictly educational**. The advisor knows the user's thesis, their themes, their conviction journal entries, and their watchlist. It uses this to give answers that are **tailored** but never directive.

### The financial advice line (hard constraint)
The system prompt must deterministically block:
- Any sentence starting with "you should buy / sell / invest in / rotate"
- Any explicit price targets or entry/exit points
- Any language that creates urgency ("now is a good time to")

All responses end with a research question or an educational framing, never a call to action.

### What it CAN do
- Explain any investing concept in plain English, referenced to the user's specific themes
- Surface tensions in the user's thesis ("your drawdown profile said panic-sell but your chosen themes include biotech — these don't align")
- Teach via the Conviction Journal ("you said NVDA because of AI compute. Here's what the bear case on that thesis looks like")
- Answer "what does X mean" questions with theme-linked explanations
- Run a soft Stress Test ("let me ask you why you believe that — is it thesis or feeling?")

### UI structure (per mockup)

```
Screen: /advisor (tab)
├── Header: "Ask Thesis" + Pro badge
├── Chat thread (scrollable)
│   ├── AI bubble: profile-aware greeting
│   ├── User bubble: question
│   └── AI bubble: answer + TermLink pill → concept sheet
├── Disclaimer: "Educational only · not financial advice"
├── Input: text field + send button
├── "Try asking" chips (3 scrollable, profile-derived)
└── "From your profile" section
    ├── InsightCard: theme-linked observation
    └── InsightCard: concept to know
```

### Chat bubble style (React Native)

**AI bubble:**
```tsx
<View style={{
  backgroundColor: '#F3F5F1',  // bg token
  borderRadius: [4, 14, 14, 14],
  padding: '10px 12px',
  maxWidth: '90%',
}}/>
```

**User bubble:**
```tsx
<View style={{
  backgroundColor: '#0E7A66',  // brand token
  borderRadius: [14, 4, 14, 14],
  padding: '10px 12px',
  maxWidth: '85%',
  alignSelf: 'flex-end',
}}/>
```

**"Learn: [concept]" pill** (inside AI response):
```tsx
<View className="bg-brand-bg px-2.5 py-1 rounded-[20px] self-start mt-1.5 flex-row items-center gap-x-1">
  <Icon name="book-2" size={12} color="#06483C"/>
  <Text className="text-brand-deep text-[11px] font-sansX">Learn: P/E ratio</Text>
</View>
```

### Prompt chips (pre-fill suggestions)

Generated from user profile at render time. Examples:
```ts
const CHIPS = (profile: UserProfile) => [
  { label: "What's a moat?",          icon: "trending-up",     kind: "concept" },
  { label: "Challenge my thesis",     icon: "alert-triangle",  kind: "stress-test", color: "amber" },
  { label: `${topTheme} risks`,        icon: "scale",           kind: "risk" },
  { label: "Why did I pick NVDA?",    icon: "message-circle",  kind: "journal" },  // if in watchlist
];
```

### System prompt template

```
You are the Thesis Advisor, a strictly educational AI built into the Thesis investing app.

USER PROFILE:
- Investment horizon: {{profile.horizon}}
- Risk tolerance: {{profile.risk}}
- Primary goal: {{profile.primaryGoal}}
- Top themes: {{themeIds.join(', ')}}
- Drawdown reaction: {{profile.reactionToDrawdown}}
- Watchlist: {{watchlist.join(', ')}}

RULES:
1. Never say buy, sell, invest, rotate, or enter a position.
2. Always frame answers around the user's specific profile and themes.
3. End every substantive answer with a research question or a concept link.
4. If asked for a specific price target or investment recommendation, decline warmly and redirect to the educational frame.
5. Flag any tension between the user's stated profile and their questions (e.g. panic-sell tendency + speculative theme).
6. Every response ends with: a TermLink concept pill (e.g. "Learn: P/E ratio") OR a research question.

TONE: Calm, intellectually honest, like a knowledgeable friend who happens to understand markets — not a salesperson, not a Bloomberg terminal.

DISCLAIMER: All output is educational. Nothing here constitutes financial advice.
```

### Token settings
```
max_tokens: 1500  (not 512 — truncation is the current bug)
model: deepseek-reasoner (non-thinking mode for speed)
temperature: 0.4  (consistent, not creative)
```

---

## Pro paywall design

### What's free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Quick Take (5Q) | ✓ | ✓ |
| Thesis Builder (16Q) | ✓ | ✓ |
| Theme browsing | ✓ | ✓ |
| Duel (5/week) | ✓ | unlimited |
| Conviction Journal | ✓ | ✓ |
| AI Advisor | — | ✓ |
| Stress Test | — | ✓ |
| Live prices | — | ✓ |

### Lock screen component

When a free user taps the Advisor tab:
```tsx
// ProGateCard — shown over blurred Advisor screen
<View className="bg-white rounded-[20px] border border-line p-5 mx-4 mt-10">
  <View className="bg-brand-bg w-10 h-10 rounded-[12px] items-center justify-center mb-4">
    <Icon name="sparkles" size={20} color="#0E7A66" />
  </View>
  <Text className="text-ink font-displayX text-[24px]">Ask anything about your thesis</Text>
  <Text className="text-ink-2 font-sansMd text-[14px] mt-2 leading-[20px]">
    The Thesis Advisor is profile-aware — it knows your themes, your journal, and your watchlist.
  </Text>
  <Button label="Unlock with Pro" size="lg" fullWidth className="mt-5" />
  <Text className="text-ink-3 text-[12px] text-center mt-3">Educational only · not investment advice</Text>
</View>
```

---

## Files this spec informs

| File | What changes |
|------|-------------|
| `src/app/(tabs)/_layout.tsx` | Add Advisor tab (lock icon for free, sparkle for Pro) |
| `src/app/(tabs)/advisor.tsx` | New screen — chat interface |
| `src/components/ui/ChatBubble.tsx` | New — AI/user bubble variants |
| `src/components/ui/PromptChip.tsx` | New — pre-fill suggestion pill |
| `src/components/ProGateCard.tsx` | New — paywall card |
| `tailwind.config.js` | No changes needed — tokens already correct |
| Backend proxy | Raise timeout to 30s, raise max_tokens to 1500 |
