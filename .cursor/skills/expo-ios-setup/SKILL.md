---
name: expo-ios-setup
description: >-
  Set up and run Thesis on iOS Simulator or Xcode native build. Use when CocoaPods,
  prebuild, pod install, xcworkspace, Expo Go timeout, or npm run ios fails.
---

# Expo iOS setup (Thesis)

## Quick path (preferred)

```bash
cd /Users/jaidenrabatin/Projects/thesis
npm install
npm run ios
```

Runs pod install when needed and opens the Simulator.

## Expo Go / Metro timeout

1. `npm run start:tunnel` if LAN is blocked (campus Wi‑Fi, VPN).
2. Or `npm run ios` — no phone network required.

## Native Xcode build

**Requires CocoaPods** → produces `ios/thesis.xcworkspace`.

```bash
# One-time if brew missing: install Homebrew from https://brew.sh
brew install cocoapods
cd /Users/jaidenrabatin/Projects/thesis
npm run ios:setup   # or: bash scripts/setup-ios.sh
open ios/thesis.xcworkspace
```

- Open **`thesis.xcworkspace`**, not `thesis.xcodeproj`.
- Build from **one** place at a time (Xcode OR CLI) to avoid `build.db: database is locked`.

## Common failures

| Symptom | Fix |
|---------|-----|
| `brew ENOENT` | Install Homebrew, add to PATH |
| No `.xcworkspace` | Run `cd ios && pod install` |
| Expo Go timeout | Tunnel or Simulator |
| `package.json` in home dir | `cd /Users/jaidenrabatin/Projects/thesis` before `npx expo` |

Full detail: `README.md` sections *Run it*, *Expo Go*, *Xcode + CocoaPods*.
