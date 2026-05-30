#!/usr/bin/env bash
# One-time iOS native setup: CocoaPods → pod install → open Xcode workspace
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Checking CocoaPods (pod)..."
if ! command -v pod >/dev/null 2>&1; then
  # User-installed gems (macOS system Ruby)
  GEM_BIN="$HOME/.gem/ruby/2.6.0/bin"
  if [[ -x "$GEM_BIN/pod" ]]; then
    export PATH="$GEM_BIN:$PATH"
  fi
fi

if ! command -v pod >/dev/null 2>&1; then
  echo ""
  echo "CocoaPods is not installed. On your Mac, system Ruby (2.6) is too old for"
  echo "the latest CocoaPods, and Homebrew is not on PATH."
  echo ""
  echo "Recommended fix (copy/paste in Terminal):"
  echo ""
  echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  echo ""
  echo "Then follow Homebrew’s “Next steps” to add brew to your PATH, and run:"
  echo ""
  echo "  brew install cocoapods"
  echo "  cd $ROOT/ios && pod install"
  echo "  open $ROOT/ios/thesis.xcworkspace"
  echo ""
  echo "Or skip Xcode UI and run the app from the project root:"
  echo ""
  echo "  cd $ROOT && npm run ios"
  echo ""
  exit 1
fi

echo "→ pod install (first run can take several minutes)..."
cd ios
pod install

echo ""
echo "✓ Done. Open the workspace (not the .xcodeproj):"
echo "  open $ROOT/ios/thesis.xcworkspace"
echo ""
echo "Or run: npm run ios"
