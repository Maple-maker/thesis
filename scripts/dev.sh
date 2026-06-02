#!/usr/bin/env bash
# One command: API + Metro + iOS Simulator. Run from anywhere:
#   cd /Users/jaidenrabatin/Projects/thesis && npm run dev
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

if [[ ! -f server/.env ]]; then
  echo "Missing server/.env — run: cp server/.env.example server/.env"
  echo "Then add DEEPSEEK_API_KEY"
  exit 1
fi

echo "→ Stopping stale Metro (8081) and API (8787)…"
npm run metro:stop 2>/dev/null || true
npm run server:stop 2>/dev/null || true
sleep 1

echo "→ Starting Thesis API…"
(cd server && npm run dev) &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "→ Waiting for http://127.0.0.1:8787/v1/health …"
ready=0
for _ in $(seq 1 40); do
  if curl -sf http://127.0.0.1:8787/v1/health >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.25
done

if [[ "$ready" -ne 1 ]]; then
  echo "API did not start. Check server/.env and DEEPSEEK_API_KEY."
  exit 1
fi

curl -sf http://127.0.0.1:8787/v1/health | head -c 200
echo ""
echo "→ Starting Expo + iOS Simulator (Ctrl+C stops both)…"
npx expo start --ios --lan --clear
