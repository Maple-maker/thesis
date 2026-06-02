#!/usr/bin/env bash
# Start Metro on :8081 if not already running (for Xcode / simulator launches).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/Users/jaidenrabatin/Documents/aegis_vault/.cursor/debug-2394be.log"
SESSION="2394be"
cd "$ROOT"

log_debug() {
  local hid="$1" loc="$2" msg="$3" data="$4"
  local ts
  ts="$(python3 -c 'import time; print(int(time.time()*1000))')"
  # #region agent log
  printf '{"sessionId":"%s","timestamp":%s,"hypothesisId":"%s","location":"%s","message":"%s","data":%s,"runId":"%s"}\n' \
    "$SESSION" "$ts" "$hid" "$loc" "$msg" "$data" "${RUN_ID:-pre-fix}" >> "$LOG"
  # #endregion
}

if lsof -ti :8081 >/dev/null 2>&1; then
  log_debug "H1" "ensure-metro.sh:already_running" "Metro already on 8081" "{\"running\":true}"
  echo "✓ Metro already running on :8081"
  exit 0
fi

log_debug "H1" "ensure-metro.sh:starting" "Metro not running — spawning expo start" "{\"running\":false}"
echo "→ Metro not running. Starting Expo on :8081 (LAN)…"

npx expo start --lan --clear > /tmp/thesis-metro.log 2>&1 &
METRO_PID=$!
echo "$METRO_PID" > /tmp/thesis-metro.pid

ready=0
for i in $(seq 1 45); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 1 http://127.0.0.1:8081/status 2>/dev/null || echo 000)"
  if [[ "$code" == "200" ]]; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  log_debug "H1" "ensure-metro.sh:failed" "Metro failed to become ready" "{\"ready\":false,\"pid\":$METRO_PID}"
  echo "✗ Metro did not start within 45s. Log: /tmp/thesis-metro.log"
  tail -20 /tmp/thesis-metro.log 2>/dev/null || true
  exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || echo 127.0.0.1)"
log_debug "H1" "ensure-metro.sh:ready" "Metro ready" "{\"ready\":true,\"pid\":$METRO_PID,\"lanIp\":\"$LAN_IP\"}"
echo "✓ Metro ready — http://127.0.0.1:8081 (LAN: http://${LAN_IP}:8081)"
echo "  Log: /tmp/thesis-metro.log  PID: $METRO_PID"
echo "  Stop: npm run metro:stop"
