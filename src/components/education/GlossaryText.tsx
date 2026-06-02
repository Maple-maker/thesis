import { Alert, Text } from "react-native";

import {
  FINANCIAL_TERM_DEFINITIONS,
  type FinancialTermDef,
} from "@/data/financial-term-definitions";

type Props = {
  content: string;
  textSize?: number;
  lineHeight?: number;
};

/** Ordered patterns — longer / multi-word first to avoid partial matches. */
const PATTERNS: Array<{ re: RegExp; id: string }> = [
  { re: /\bcapital preservation\b/i, id: "capital-preservation" },
  { re: /\bburn rate\b/i, id: "burn-rate" },
  { re: /\btarget net worth\b/i, id: "target-net-worth" },
  { re: /\b(?:4×|four times|4x) (?:annual )?burn\b/i, id: "four-times-burn" },
  { re: /\b(?:25×|25x|4% rule|four percent)\b/i, id: "four-percent-rule" },
  { re: /\bstate (?:of |tax )?residence\b/i, id: "state-tax-residency" },
  { re: /\b(?:max(?:imum)? |peak[- ]to[- ]trough )?drawdown\b/i, id: "drawdown" },
  { re: /\bvolatil(?:e|ity)\b/i, id: "volatility" },
  { re: /\bemergency (?:fund|savings)\b/i, id: "emergency-fund" },
  { re: /\bhigh[- ]interest (?:debt|credit)\b/i, id: "high-interest-debt" },
  { re: /\binvestable assets?\b/i, id: "investable-assets" },
  { re: /\btime horizon\b/i, id: "time-horizon" },
  { re: /\brisk tolerance\b/i, id: "risk-tolerance" },
  { re: /\bleverage\b/i, id: "leverage" },
  { re: /\bFOMO\b|\bfear of missing out\b/i, id: "fomo" },
  { re: /\bcompounders?\b|\bblue[- ]chip\b/i, id: "compounders" },
  { re: /\bESG\b/i, id: "esg" },
  { re: /\bemerging markets?\b/i, id: "emerging-markets" },
  { re: /\bREITs?\b/i, id: "reit" },
  { re: /\bindex funds?\b|\bS&P 500\b|\btotal (?:stock )?market\b/i, id: "index-funds" },
  { re: /\btax[- ]efficien(?:t|cy)\b/i, id: "tax-efficiency" },
  { re: /\bsavings? rate\b/i, id: "savings-rate" },
  { re: /\bincome focus\b/i, id: "income-focus" },
  { re: /\bgrowth focus\b/i, id: "growth-focus" },
  { re: /\bsleep[- ]at[- ]night\b/i, id: "sleep-at-night" },
  { re: /\b(?:foreign|international) exposure\b/i, id: "foreign-exposure" },
  { re: /\bSharpe ratio\b/i, id: "sharpe-ratio" },
  { re: /\bbeta\b/i, id: "beta" },
  { re: /\bmax(?:imum)? drawdown\b/i, id: "max-drawdown" },
];

const DEF_BY_ID = new Map(FINANCIAL_TERM_DEFINITIONS.map((d) => [d.id, d]));

function parseSpans(content: string): Array<{ text: string; termId?: string }> {
  const spans: Array<{ text: string; termId?: string }> = [];
  let pos = 0;

  while (pos < content.length) {
    let bestMatch: { text: string; id: string } | null = null;
    let bestIdx = Infinity;

    for (const { re, id } of PATTERNS) {
      re.lastIndex = 0;
      const m = re.exec(content.slice(pos));
      if (m && m.index < bestIdx) {
        bestIdx = m.index;
        bestMatch = { text: m[0], id };
      }
    }

    if (bestMatch && bestIdx < content.length - pos) {
      if (bestIdx > 0) spans.push({ text: content.slice(pos, pos + bestIdx) });
      spans.push({ text: bestMatch.text, termId: bestMatch.id });
      pos += bestIdx + bestMatch.text.length;
    } else {
      spans.push({ text: content.slice(pos) });
      break;
    }
  }

  return spans;
}

export function GlossaryText({ content, textSize = 14, lineHeight = 20 }: Props) {
  if (!content) return null;

  const spans = parseSpans(content);

  return (
    <Text style={{ fontSize: textSize, lineHeight }}>
      {spans.map((span, i) => {
        const def = span.termId ? DEF_BY_ID.get(span.termId) : undefined;
        if (def) {
          return (
            <Text
              key={i}
              className="text-brand underline decoration-brand/30"
              style={{ fontSize: textSize, lineHeight }}
              onPress={() => {
                Alert.alert(
                  def.term,
                  [def.definition, def.example ? `\n\nExample: ${def.example}` : ""].join(""),
                  [{ text: "Got it", style: "default" }]
                );
              }}
              accessibilityRole="link"
            >
              {span.text}
            </Text>
          );
        }
        return (
          <Text key={i} style={{ fontSize: textSize, lineHeight }}>
            {span.text}
          </Text>
        );
      })}
    </Text>
  );
}
