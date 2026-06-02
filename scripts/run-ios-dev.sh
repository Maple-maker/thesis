#!/usr/bin/env bash
# Launch iOS dev: ensure Metro + API, then open Simulator via Expo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/ensure-metro.sh

echo "→ Launching iOS Simulator (Expo)…"
npx expo start --ios --lan
