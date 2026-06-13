# How to actually run the Thesis relay

A practical guide. No theory — just the steps.

---

## Step 0 — Get the spec files into your project

Copy every .md file we produced into your `docs/` folder:

```bash
cd /Users/jaidenrabatin/Projects/thesis

# Create the docs folder if it doesn't exist
mkdir -p docs/relay-specs

# Then manually copy or drag these files into docs/relay-specs/:
#   - thesis-agent-relay-v2-opus.md
#   - thesis-full-technical-spec.md
#   - thesis-design-spec-ai-advisor.md
#   - feature-spec-portfolio-builder.md
#   - slice-quick-take-onboarding.md
#   - slice-live-data-polygon.md
```

You can download them from the chat (each file has a download button), then drop them into `docs/relay-specs/` in Finder. Or open each file in Claude's output and copy-paste the contents into new files in your code editor.

---

## Step 1 — Human setup (you do this, not an agent)

These are the accounts and keys the agents need. Budget: 10 minutes, $0.

### 1a. Supabase
1. Go to https://supabase.com → sign up (free)
2. Click "New Project" → name it "thesis" → pick a region → set a database password (save it)
3. Once created, go to Settings → API → copy:
   - `Project URL` (this is SUPABASE_URL)
   - `anon public` key (this is SUPABASE_ANON_KEY)
   - `service_role` key (this is SUPABASE_SERVICE_ROLE_KEY — never put this in app code)

### 1b. Groq (free AI model — US-based)
1. Go to https://console.groq.com → sign up (free, no credit card)
2. Go to API Keys → Create → copy the key (this is GROQ_API_KEY)

### 1c. Polygon.io (free stock prices)
1. Go to https://polygon.io → sign up (free tier)
2. Dashboard → API Keys → copy (this is POLYGON_API_KEY)

### 1d. Add keys to your project
```bash
cd /Users/jaidenrabatin/Projects/thesis

# Create .env.local (git-ignored, never committed)
cat > .env.local << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
EOF

# These go into Supabase Edge Function secrets (not in your app code):
# You'll run these later when you deploy Edge Functions:
# supabase secrets set GROQ_API_KEY=gsk_...
# supabase secrets set POLYGON_API_KEY=...
# supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 1e. Install Supabase CLI
```bash
brew install supabase/tap/supabase

# Link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# (The project ref is in your Supabase dashboard URL)
```

---

## Step 2 — Run Agent 1: Opus (backend foundation)

This runs FIRST. Everything else depends on it.

### How to start a Claude Code session:

**Option A: Claude Code in terminal** (if installed)
```bash
cd /Users/jaidenrabatin/Projects/thesis
claude
```
Then paste the Agent 1 prompt from thesis-agent-relay-v2-opus.md.

**Option B: Cursor (what you've been using)**
Open the project in Cursor. Open the AI chat panel. Set the model to Claude Opus. Paste the Agent 1 prompt.

**Option C: Claude Code in Claude Desktop app**
Open Claude Desktop → Code tab → open the thesis project folder → paste the prompt.

### What to paste:

Open `docs/relay-specs/thesis-agent-relay-v2-opus.md` and copy the entire Agent 1 prompt block (everything between the triple backticks under "Agent 1 — Backend foundation (OPUS)").

### What happens:
- Opus reads your codebase
- Creates the Supabase schema SQL
- Creates the Edge Functions
- Creates the auth screens
- Sets up RLS policies
- Runs npx tsc --noEmit

### When it's done:
1. Review what it built — look at the new files
2. Deploy the schema to Supabase:
   ```bash
   supabase db push
   ```
3. Deploy the Edge Functions:
   ```bash
   supabase functions deploy prices
   supabase functions deploy sync
   supabase functions deploy context-builder
   supabase functions deploy advisor
   ```
4. Set the secrets:
   ```bash
   supabase secrets set GROQ_API_KEY=gsk_your_key
   supabase secrets set POLYGON_API_KEY=your_key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ_your_key
   ```

**Checkpoint:** Test that the price proxy works:
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/prices \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "NVDA"}'
```
If you get back JSON with a close price, Agent 1 succeeded.

---

## Step 3 — Run Agents 2–6 (sequential, one at a time)

Now that the backend exists, run the remaining agents. The order between them doesn't matter — pick whichever feels most important to you first.

**Suggested order (highest impact first):**

### Agent 5 — Onboarding (Haiku — fast, cheap)
```
Switch model to Claude Haiku 4.5 (or Sonnet if Haiku isn't available in your tool)
Paste the Agent 5 prompt from thesis-agent-relay-v2-opus.md
Wait for completion
Run: npx tsc --noEmit
```
**Why first:** This is the first thing a new user sees. Get it working early.

### Agent 4 — Portfolio builder (Sonnet)
```
Switch model to Claude Sonnet 4.5
Paste the Agent 4 prompt
Wait for completion
Run: npx tsc --noEmit
```

### Agent 3 — Data layer (Haiku)
```
Switch model to Haiku 4.5
Paste the Agent 3 prompt
Wait for completion
Run: npx tsc --noEmit
```

### Agent 2 — AI Advisor (Sonnet)
```
Switch model to Sonnet 4.5
Paste the Agent 2 prompt
Wait for completion
Run: npx tsc --noEmit
```

### Agent 6 — Visual polish (Sonnet)
```
Switch model to Sonnet 4.5
Paste the Agent 6 prompt
Wait for completion
Run: npx tsc --noEmit
```

**After each agent:**
- Glance at the files it created/modified
- Run `npx tsc --noEmit` — if it fails, tell the agent to fix the errors before moving on
- You don't need to test in the simulator yet — save that for after integration

---

## Step 4 — Run Agent 7: Opus (integration)

This is the critical wiring step. Switch back to Opus.

```
Switch model to Claude Opus
Paste the Agent 7 prompt from thesis-agent-relay-v2-opus.md
Wait for completion
```

Opus will:
- Read every file the other agents touched
- Verify type consistency across agents
- Fix import errors
- Trace the three critical data flows
- Produce INTEGRATION_REPORT.md

**When it finishes, check:**
```bash
npx tsc --noEmit    # Must be zero errors
npm run ios          # Launch in simulator
```

---

## Step 5 — Human review (you, on your phone/simulator)

Walk every flow:

| Flow | What to test |
|------|-------------|
| Quick Take | Fresh install → 5 questions → thesis reveal → model portfolio → sign-up gate |
| Full onboarding | Sign up → 16 questions → reveal with reasons → tabs |
| Portfolio | Add holding → conviction gate (must select reason) → holding appears in list |
| Investor lens | Browse lenses → tap Buffett → see framework → add holdings → conviction gate fires per stock |
| Duel | Watchlist with 2+ stocks → duel → pick → reason → journal entry |
| AI Advisor | Pro user → send message → get educational response → "Learn: P/E" pill visible |
| Prices | Stock detail screen → live price visible → "15-min delay" disclaimer visible |
| Tension | Portfolio with NVDA + KO → tension card appears on portfolio home |

If something is broken, go back to the relevant agent prompt, describe the bug, and ask it to fix it. You don't need to re-run the entire agent — just the specific fix.

---

## Step 6 — Fable 5 (final sprint)

Switch to Fable 5 (if available) or Claude Opus.

```
Paste the Fable 5 prompt from the original thesis-agent-relay-system.md
Wait for FABLE_REPORT.md output
```

Review the report. Fix anything flagged. Then:

---

## Step 7 — Ship

```bash
# Build production iOS binary
npx eas-cli build --platform ios --profile production

# When build finishes, submit to App Store
npx eas-cli submit --platform ios --latest
```

---

## FAQ

### "Can I run multiple agents at the same time?"
If you have Cursor open AND Claude Code terminal AND Claude Desktop, technically yes — you could run three agents simultaneously in three different tools, all pointed at the same project folder. But be careful: if two agents modify the same file at the same time, you'll get conflicts. The safer approach is sequential.

### "What if an agent's output breaks TypeScript?"
Tell it: "npx tsc --noEmit shows these errors: [paste errors]. Fix them." The agent will read the errors and fix them. This is normal — most agents will need 1-2 fix passes.

### "What if I want to skip an agent?"
You can. The agents are modular. Skip Agent 6 (visual polish) if you want to ship fast and polish later. Skip Agent 2 (AI advisor) if you want to launch without the Pro feature. The only non-skippable agent is Agent 1 (backend).

### "How long does the whole thing take?"
Realistic estimate:
- Human setup: 15 min
- Agent 1 (Opus): 20-30 min
- Deploy + test backend: 10 min
- Agents 2-6 (sequential): 15-20 min each = 75-100 min total
- Agent 7 (Opus integration): 15-20 min
- Human review: 30 min
- Fable 5: 15-20 min
- **Total: roughly one full working day**

### "What if I run out of Claude usage on one model?"
Switch models for the next agent. The prompts are written to work with Sonnet if Opus isn't available — Opus is better but Sonnet will still produce working code. The exception is Agent 7 (integration) which really benefits from Opus's context window.

### "Do I need to understand the code the agents write?"
Not to get it running. But you should read the INTEGRATION_REPORT.md and FABLE_REPORT.md — they'll tell you what was built and what to watch. Over time, as you work with the codebase, you'll learn the patterns. The agents match the existing code conventions in AGENTS.md and .cursor/rules/, so the new code should look like the existing code.
