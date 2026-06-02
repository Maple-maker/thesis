#!/usr/bin/env bash
# Debug: Metro connectivity diagnostics for thesis iOS dev builds
# Writes NDJSON to AEGIS debug log (session 2394be)
set -euo pipefail

LOG="/Users/jaidenrabatin/Documents/aegis_vault/.cursor/debug-2394be.log"
SESSION="2394be"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || echo "")"
TS="$(python3 -c 'import time; print(int(time.time()*1000))')"

log() {
  local hid="$1" loc="$2" msg="$3" data="$4"
  # #region agent log
  printf '{"sessionId":"%s","timestamp":%s,"hypothesisId":"%s","location":"%s","message":"%s","data":%s,"runId":"pre-fix"}\n' \
    "$SESSION" "$TS" "$hid" "$loc" "$msg" "$data" >> "$LOG"
  # #endregion
}

# H1: Metro not listening on 8081
METRO_PID="$(lsof -ti :8081 2>/dev/null | head -1 || true)"
if [[ -n "$METRO_PID" ]]; then
  log "H1" "check-metro-connectivity.sh:metro_pid" "Metro process on 8081" "{\"pid\":\"$METRO_PID\",\"running\":true}"
else
  log "H1" "check-metro-connectivity.sh:metro_pid" "No process on 8081" "{\"running\":false}"
fi

# H2: Bundle server not responding on LAN IP
LAN_STATUS="fail"
if [[ -n "$LAN_IP" ]]; then
  LAN_CODE="$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://${LAN_IP}:8081/status" 2>/dev/null || echo 000)"
  [[ "$LAN_CODE" == "200" ]] && LAN_STATUS="ok"
  log "H2" "check-metro-connectivity.sh:lan_status" "LAN Metro /status" "{\"ip\":\"$LAN_IP\",\"httpCode\":\"$LAN_CODE\",\"reachable\":$([ \"$LAN_STATUS\" = ok ] && echo true || echo false)}"
else
  log "H2" "check-metro-connectivity.sh:lan_status" "No en0 IP" "{\"reachable\":false}"
fi

# H3: Simulator localhost path
LOCAL_CODE="$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://127.0.0.1:8081/status" 2>/dev/null || echo 000)"
log "H3" "check-metro-connectivity.sh:localhost_status" "localhost Metro /status" "{\"httpCode\":\"$LOCAL_CODE\",\"reachable\":$([ \"$LOCAL_CODE\" = 200 ] && echo true || echo false)}"

# H4: Stale IP in error URL vs current IP
ERROR_IP="10.10.231.162"
log "H4" "check-metro-connectivity.sh:ip_match" "Error URL IP vs current en0" "{\"errorIp\":\"$ERROR_IP\",\"currentIp\":\"$LAN_IP\",\"match\":$([ \"$ERROR_IP\" = \"$LAN_IP\" ] && echo true || echo false)}"

# H5: API server (8787) — separate but dev.sh depends on it
API_CODE="$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://127.0.0.1:8787/v1/health" 2>/dev/null || echo 000)"
log "H5" "check-metro-connectivity.sh:api_health" "Thesis API health" "{\"httpCode\":\"$API_CODE\",\"running\":$([ \"$API_CODE\" = \"200\" ] && echo true || echo false)}"

# H6: iOS bundle build (500 = Metro up but bundler error — shows as "Could not connect")
BUNDLE_URL="http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=src%2Fapp&unstable_transformProfile=hermes-stable"
BUNDLE_CODE="$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 15 "$BUNDLE_URL" 2>/dev/null || echo 000)"
log "H6" "check-metro-connectivity.sh:bundle" "iOS bundle HTTP status" "{\"httpCode\":\"$BUNDLE_CODE\",\"ok\":$([ \"$BUNDLE_CODE\" = \"200\" ] && echo true || echo false)}"

echo "Diagnostics written to $LOG"
echo "Metro 8081: ${METRO_PID:-DOWN} | LAN $LAN_IP: $LAN_STATUS | localhost: $LOCAL_CODE | bundle: $BUNDLE_CODE | API 8787: $API_CODE"
