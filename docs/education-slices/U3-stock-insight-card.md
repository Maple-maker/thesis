# Claude Code — U3 Stock detail InsightCard

**Requires:** U1, U2 (and E5 if TermLinks in body).

```text
Implement phase U3 from docs/education-roadmap.md.

READ: docs/design-reference-insights-ui.md, docs/education-roadmap.md (U2, U3).

TASK:
- Add src/data/context-insights.ts if U2 not done (see U2 spec in roadmap)
- On src/app/stock/[symbol].tsx, render InsightCard below header when insightForSymbol exists
- Public/Coinbase pattern: headline, whyItMatters bullets, watch paragraph, optional MetricChip row
- Wire TermLink for conceptIds if E5 exists

Educational tone only. Disclaimer visible.

DO NOT: dark theme, live AI attribution, buy/sell copy, Autopilot-style returns.

npx tsc --noEmit when done.
```
