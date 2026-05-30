# thesis

> A "This or That" investing app. Deep-dive questionnaire → personalized themes → forced binary stock picks → ETF synthesis when you want both. Built with Expo + React Native, designed to ship to the iOS App Store.

## What it does (v1 prototype)

1. **Questionnaire** — situation, goals, temperament, interests, values, income needs.
2. **Theme generation** — rules-based engine maps your answers to 5 themes (Clean Energy, AI Infrastructure, Quality Compounders, etc.), with personalized "why this fits you" reasons.
3. **Theme browse** — each theme expands into a curated, profile-ranked list of stocks. Add to watchlist.
4. **Watchlist & ETF rollups** — once you have ≥2 names, we surface ETFs that cover your list.
5. **The Duel** — forced "This or That" between two of your watchlist names (preferring same-theme pairs). Tap to pick, then capture conviction.
6. **Conviction Journal** — every duel records *why* you chose what you chose. Over time, the journal screen shows your reasoning patterns.
7. **ETF Synthesis** — after each duel, surfaces 0–3 ETFs that hold both names, ranked by overlap + expense ratio + alignment to your profile.

Educational tool. Not investment advice. Disclaimers are baked throughout.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based navigation)
- **React Native 0.85** + **React 19**
- **TypeScript** (strict)
- **NativeWind v4** (Tailwind for React Native)
- **Zustand** with `persist` middleware → **AsyncStorage**
- **React Native Reanimated** + **Gesture Handler** for transitions
- **expo-haptics** for tactile feedback on picks

## Run it

```bash
npm install
npm run start
```

From the Metro terminal:

- Press **`i`** — iOS Simulator on your Mac (no phone network needed; best if Expo Go times out).
- Scan the QR code — physical device via **Expo Go** (phone and Mac must reach each other).

### Expo Go: "request timed out"

Usually the phone cannot reach Metro on your Mac (guest Wi‑Fi, university/corporate network, VPN, or firewall).

**Try in order:**

1. **Tunnel** (works when LAN is blocked) — stop Metro (`Ctrl+C`), then:
   ```bash
   npm run start:tunnel
   ```
   Wait until the terminal shows a `exp://…` URL, then scan the **new** QR code. First tunnel connect can take 30–60s.

2. **Same network, no VPN** — turn off VPN on Mac and phone. Use the same Wi‑Fi (not guest). Avoid public/campus Wi‑Fi if devices cannot talk to each other.

3. **Phone hotspot** — enable hotspot on your phone, connect the Mac to it, run `npm run start`, scan QR again.

4. **iOS Simulator** (fastest on Mac) — with Xcode installed:
   ```bash
   npm run ios
   ```
   Or `npm run start` then press **`i`**.

5. **Manual URL** — in Expo Go: enter URL manually → `exp://10.10.245.91:8081` (replace with your Mac’s IP from Metro; run `ipconfig getifaddr en0` on Mac).

## Xcode + CocoaPods (native iOS build)

`prebuild` created `ios/thesis.xcodeproj`, but **`ios/thesis.xcworkspace` only appears after `pod install`**, which requires **CocoaPods**.

If Expo says `brew ENOENT` or `gem install cocoapods` failed, you likely have **no Homebrew** and **macOS Ruby 2.6** (too old for current CocoaPods).

### One-time setup

1. **Install Homebrew** (if `brew` is not found):

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   Run the two `echo` lines Homebrew prints at the end (adds `brew` to your PATH).

2. **Install CocoaPods and pods**:

   ```bash
   brew install cocoapods
   cd /Users/jaidenrabatin/Projects/thesis/ios
   pod install
   ```

3. **Open Xcode** (use the **workspace**, not the project):

   ```bash
   open /Users/jaidenrabatin/Projects/thesis/ios/thesis.xcworkspace
   ```

   In Xcode: pick an iPhone simulator → **Run** (▶).

### Or one command from the repo

After Homebrew + `brew install cocoapods`:

```bash
cd /Users/jaidenrabatin/Projects/thesis
npm run ios
```

This runs `pod install` automatically and launches the Simulator.

**Do not** open `thesis.xcodeproj` alone — always use `thesis.xcworkspace` after pods are installed.

## Agent handoff (Cursor → Claude Code)

- **Active work:** [`docs/current-slice.md`](docs/current-slice.md) — goal, non-goals, files, acceptance checks.
- **Agent context:** [`AGENTS.md`](AGENTS.md) + [`.cursor/rules/`](.cursor/rules/).
- **New slice template:** [`docs/slice-template.md`](docs/slice-template.md).

Claude Code prompt: *Implement `docs/current-slice.md` only. Read `AGENTS.md`.*

## Project layout

```
src/
  app/                 # Expo Router routes
    _layout.tsx        # Root: GestureHandler + StatusBar + Stack
    index.tsx          # Redirector → onboarding or tabs
    duel.tsx           # The Duel (modal)
    onboarding/        # Multi-step questionnaire flow
      index.tsx        # Intro screen
      step/[index].tsx # Generic step renderer
      reveal.tsx       # Theme reveal animation
    (tabs)/            # Bottom tabs after onboarding
      _layout.tsx
      index.tsx        # Home dashboard
      themes.tsx
      watchlist.tsx
      journal.tsx
    theme/[id].tsx     # Theme detail (picks + ETFs)
    stock/[symbol].tsx # Stock detail
  components/
    ui/                # Screen, Button, Card, Tag, Progress, Header
  data/
    stocks.ts          # ~50 curated stocks (mock data)
    etfs.ts            # ~30 ETFs with representative holdings
    themes.ts          # 12 investing themes
    questionnaire.ts   # Step + question definitions
  lib/
    theme-engine.ts    # Rules-based: profile → ranked themes
    etf-overlap.ts     # Finds ETFs that hold both stocks in a duel
  store/
    index.ts           # Zustand store w/ AsyncStorage persistence
    types.ts           # All TS types (Stock, ETF, UserProfile, ...)
  global.css           # Tailwind directives
```

### Where to make changes

- **Questionnaire** → `src/data/questionnaire.ts`
- **Theme catalog** → `src/data/themes.ts`
- **Stock/ETF mock data** → `src/data/stocks.ts`, `src/data/etfs.ts`
- **Recommendation logic** → `src/lib/theme-engine.ts`, `src/lib/etf-overlap.ts`
- **Colors / type scale** → `tailwind.config.js`

## Resetting state during testing

Long-press the "thesis" logo on the Home tab and confirm. This wipes the profile, themes, watchlist, and journal — useful for trying different questionnaire profiles.

## Shipping to the iOS App Store

The flow uses **EAS (Expo Application Services)** — no Xcode required for most of it.

### One-time setup

1. **Apple Developer Program** — sign up at [developer.apple.com](https://developer.apple.com) (\$99/yr). Needed before you can submit anything.
2. **Expo account** — `npx eas-cli login`
3. **Initialize EAS in this project:**
   ```bash
   npx eas-cli init
   ```
   Pick the iOS bundle identifier (`com.yourname.thesis`).
4. **Configure builds:**
   ```bash
   npx eas-cli build:configure
   ```
   Choose iOS, accept the defaults. This writes `eas.json`.

### Build + submit

```bash
# Build a production iOS binary in EAS Cloud
npx eas-cli build --platform ios --profile production

# When the build finishes (you'll get a link), submit it:
npx eas-cli submit --platform ios --latest
```

EAS handles signing certificates, provisioning profiles, and the App Store Connect upload for you. The first build pushes you through a short interactive setup for credentials — pick "Let EAS manage" unless you have a specific reason to bring your own.

After upload, finish the listing (screenshots, descriptions, privacy details) in App Store Connect, then submit for review.

### Notes

- `app.json` already has `name`, `slug`, `version`, and `scheme` set. Set `ios.bundleIdentifier` before your first build.
- App Store reviewers will flag personalized investment advice. The app deliberately frames everything as **educational** (`"Not investment advice"` disclaimers on every screen + onboarding) — keep that framing.
- For TestFlight beta testing (recommended before public submission), the same `eas submit` flow works.

## What's deliberately out of v1

- **Real-time market data, brokerage integration, trading.** All stock/ETF data is curated mock JSON. Wiring real data is a separate workstream (Polygon, Alpaca, IEX Cloud, Financial Modeling Prep, etc.).
- **Auth & cloud sync.** Everything persists locally via AsyncStorage. Add a backend (Supabase, Firebase, custom) when you're ready for cross-device.
- **LLM-driven recommendations.** Theme generation is deterministic rules in `theme-engine.ts`. Swapping in an LLM call is straightforward — same interface.
- **Push notifications, social features, real chart data.** Save for later.

## What to consider before scaling

- **Regulatory framing.** Personalized "buy this stock" recommendations cross into RIA territory (SEC / FINRA). The app is intentionally positioned as educational/decision-support, not advice. If you want to give explicit recommendations, you need to either partner with an RIA, register, or stay strictly on the education side. Don't drift.
- **Data licensing.** ETF holdings data is licensable — once you go beyond mock data, expect to pay for clean holdings feeds.
- **Backtesting & evidence.** A future build should show the user how their duel choices would have performed over time — that's the moat.

## License

MIT
