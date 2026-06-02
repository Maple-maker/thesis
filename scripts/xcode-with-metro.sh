#!/usr/bin/env bash
# For Xcode ▶ Run: start Metro first, then open workspace.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/ensure-metro.sh

echo ""
echo "→ Opening Xcode workspace…"
open "$ROOT/ios/thesis.xcworkspace"
echo ""
echo "Press ▶ Run in Xcode. Metro is on :8081."
echo "If the app still fails: Simulator menu → Device → Restart, then Run again."
