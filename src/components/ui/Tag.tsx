import { Text, View } from "react-native";

type Tone =
  | "default"
  | "brand"
  | "pos"
  | "neg"
  | "amber"
  | "violet"
  | "meta"
  | "ghost";

const tones: Record<Tone, { bg: string; text: string; border?: string }> = {
  default: { bg: "bg-track", text: "text-ink-2" },
  brand: { bg: "bg-brand-bg", text: "text-brand" },
  pos: { bg: "bg-pos-bg", text: "text-pos-ink", border: "border border-pos-line" },
  neg: { bg: "bg-neg-bg", text: "text-neg-ink", border: "border border-neg-line" },
  amber: { bg: "bg-amber-bg", text: "text-amber" },
  violet: { bg: "bg-violet-bg", text: "text-violet" },
  meta: { bg: "bg-track", text: "text-ink-2" },
  ghost: { bg: "bg-white/20", text: "text-white" },
};

export function Tag({ label, tone = "default" }: { label: string; tone?: Tone }) {
  const c = tones[tone];
  return (
    <View className={`px-[10px] py-[5px] rounded-[9px] ${c.bg} ${c.border ?? ""}`}>
      <Text className={`text-[11px] font-sansX uppercase tracking-wider ${c.text}`}>
        {label}
      </Text>
    </View>
  );
}

export function MetaChip({ label }: { label: string }) {
  return (
    <View className="px-[11px] py-[6px] rounded-[9px] bg-track">
      <Text className="text-[12px] font-sansBold text-ink-2">{label}</Text>
    </View>
  );
}

/** Pros / Cons chip with +/- prefix */
export function ProConChip({ type, children }: { type: "pro" | "con"; children: string }) {
  const pro = type === "pro";
  return (
    <View
      className={`flex-row items-center self-start px-[11px] py-[7px] rounded-chip border ${
        pro ? "bg-pos-bg border-pos-line" : "bg-neg-bg border-neg-line"
      }`}
    >
      <Text
        className={`mr-[7px] font-sansX text-[15px] ${pro ? "text-pos" : "text-neg"}`}
      >
        {pro ? "+" : "–"}
      </Text>
      <Text
        className={`text-[13.5px] font-sansSb leading-[18px] ${
          pro ? "text-pos-ink" : "text-neg-ink"
        }`}
      >
        {children}
      </Text>
    </View>
  );
}
