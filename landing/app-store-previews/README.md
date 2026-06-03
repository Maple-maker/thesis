# Thesis — App Store screenshots

Portrait marketing frames for **iPhone 6.7"** (1290×2796) — aligned with [makeyourthesis.com](https://makeyourthesis.com/).

## Preview order (upload in this sequence)

| # | File | Headline | App feature |
|---|------|----------|-------------|
| 1 | `01-hero-why-behind-your-buys.png` | Know what you own and *why* | Matched thesis card |
| 2 | `02-investing-fingerprint.png` | A thesis that fits how you think | Fingerprint + suggested research |
| 3 | `03-ask-your-cfo.png` | Ask your CFO — not stock picks | Scorecard, net worth, Ask CFO |
| 4 | `04-forecast-scenarios.png` | Pressure-test your future | Forecast + life milestones |
| 5 | `05-learn-jargon-decoded.png` | Jargon decoded | Lessons + term sheets |
| 6 | `06-one-calm-place.png` | One calm place | X-Ray, lenses, founding CTA |

## Regenerate PNGs

```bash
# From repo root (requires puppeteer in package.json)
node landing/app-store-previews/capture.mjs
```

Preview in browser: open `landing/app-store-previews/previews.html` via the capture server, or:

```bash
npx serve landing -p 3456
# → http://localhost:3456/app-store-previews/previews.html
```

## Replace screenshots

Drop new simulator PNGs into `screenshots/` and keep filenames:

- `01-thesis-match.png`
- `02-fingerprint-research.png`
- `03-cfo-accounts.png`
- `04-forecast.png`
- `05-learn-basics.png`
- `06-net-worth-home.png`

## App Store Connect copy

**Subtitle (30 chars):** `The why behind your buys`

**Promotional text:** `Build your investing fingerprint, match a thesis, link accounts, and ask your CFO — education first, not stock picks. Free beta on iOS.`

**Keywords:** `investing,education,thesis,portfolio,ETF,stocks,financial literacy,CFO,forecast,conviction`

**Description (first paragraph):** Use site copy from makeyourthesis.com — “Knowing why you own something changes everything…”

## Other display sizes

Apple also accepts 6.5" (1242×2688) and 6.1" (1170×2532). Scale exports in Preview or Figma, or duplicate `previews.html` canvas sizes.
