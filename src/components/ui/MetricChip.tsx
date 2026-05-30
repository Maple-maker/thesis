import { Text, View } from "react-native";

type Tone = "pos" | "neg" | "neutral";

type Props = {
  label: string;
  delta?: string;
  tone?: Tone;
};

const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string }> = {
  pos: { bg: "bg-pos-bg", text: "text-pos-ink", border: "border-pos-line" },
  neg: { bg: "bg-neg-bg", text: "text-neg-ink", border: "border-neg-line" },
  neutral: { bg: "bg-bg-subtle", text: "text-ink-3", border: "border-line" },
};

/** Small metric pill used inside InsightCard footers. */
export function MetricChip({ label, delta, tone = "neutral" }: Props) {
  const s = TONE_STYLES[tone];
  return (
    <View className={`px-2.5 py-1.5 rounded-[9px] border ${s.bg} ${s.border}`}>
      <Text className={`text-[11px] font-monoSb ${s.text}`}>
        {label}
        {delta ? ` ${delta}` : ""}
      </Text>
    </View>
  );
}
