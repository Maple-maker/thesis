#!/usr/bin/env bash
# Install CodeGraph + refresh Superpowers skills for Cursor agent optimization.
# Run from anywhere:
#   cd /Users/jaidenrabatin/Projects/thesis && npm run setup:agent-tooling
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SUPERPOWERS_REPO="${SUPERPOWERS_REPO:-https://github.com/obra/superpowers.git}"
SUPERPOWERS_REF="${SUPERPOWERS_REF:-main}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "→ Installing @colbymchenry/codegraph (global)…"
npm install -g @colbymchenry/codegraph

echo "→ Configuring CodeGraph for Cursor (project-local MCP)…"
codegraph install --target=cursor --location=local --yes

# Portable workspace path (installer may write absolute paths)
if [[ -f .cursor/mcp.json ]]; then
  node -e "
    const fs = require('fs');
    const p = '.cursor/mcp.json';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const srv = j.mcpServers?.codegraph;
    if (srv?.args) {
      const i = srv.args.indexOf('--path');
      if (i >= 0 && srv.args[i + 1]) srv.args[i + 1] = '\${workspaceFolder}';
      fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
    }
  "
fi

echo "→ Indexing codebase (CodeGraph)…"
codegraph index "$ROOT" || codegraph init "$ROOT"

echo "→ Refreshing Superpowers skills from $SUPERPOWERS_REPO …"
git clone --depth 1 --branch "$SUPERPOWERS_REF" "$SUPERPOWERS_REPO" "$TMP_DIR/superpowers"

mkdir -p .cursor/skills
for skill_dir in "$TMP_DIR/superpowers/skills"/*/; do
  name="$(basename "$skill_dir")"
  rm -rf ".cursor/skills/$name"
  cp -R "$skill_dir" ".cursor/skills/$name"
done

# Keep project-specific skills (e.g. expo-ios-setup)
echo "→ Skills in .cursor/skills/:"
ls -1 .cursor/skills

echo ""
echo "Done."
echo "  • CodeGraph MCP: .cursor/mcp.json (restart Cursor)"
echo "  • Superpowers:   .cursor/skills/* + .cursor/rules/superpowers.mdc"
echo "  • Re-sync index: codegraph sync"
