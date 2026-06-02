# Agent tooling (Cursor optimization)

Two upstream tools improve how AI agents work in this repo:

| Tool | Repo | What it does here |
|------|------|-------------------|
| **Superpowers** | [obra/superpowers](https://github.com/obra/superpowers) | Skills for brainstorming, plans, TDD, systematic debugging, verification before completion |
| **CodeGraph** | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | Pre-indexed symbol graph via MCP — fewer blind searches, local only |

## One-time setup (new machine)

```bash
cd /Users/jaidenrabatin/Projects/thesis
npm run setup:agent-tooling
```

Then **restart Cursor** so MCP loads (`.cursor/mcp.json`).

### Alternative: Cursor marketplace (Superpowers only)

In Agent chat: `/plugin-add superpowers` — installs the official plugin globally. This project still vendors skills in `.cursor/skills/` for reproducible handoffs.

## Daily use

| Task | Command |
|------|---------|
| Re-index after big refactor | `cd /Users/jaidenrabatin/Projects/thesis && npm run codegraph:sync` |
| Check index stats | `cd /Users/jaidenrabatin/Projects/thesis && npm run codegraph:status` |
| Refresh Superpowers skills | `cd /Users/jaidenrabatin/Projects/thesis && npm run setup:agent-tooling` |

## What gets committed

- `.cursor/mcp.json` — CodeGraph MCP (uses `${workspaceFolder}`)
- `.cursor/rules/superpowers.mdc`, `codegraph.mdc`
- `.cursor/skills/*` — vendored Superpowers + `expo-ios-setup`

**Not committed:** `.codegraph/` database (gitignored; built per machine).

## Agent behavior

- **AGENTS.md** + **docs/current-slice.md** still win over Superpowers when they conflict.
- Agents should read relevant `.cursor/skills/{name}/SKILL.md` before large changes.
- Agents should use **CodeGraph MCP** for symbol lookup when the index exists.

## Attribution

Superpowers: Jesse Vincent ([@obra](https://github.com/obra/superpowers)) — see upstream license.  
CodeGraph: Colby McHenry ([@colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)) — MIT.
