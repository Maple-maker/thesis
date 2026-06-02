import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Tag } from "@/components/ui/Tag";
import { type Theme } from "@/store/types";
import type { ThesisPersona } from "@/data/thesis-personas";

const RISK_TONE: Record<string, "pos" | "amber" | "neg"> = {
  low: "pos",
  moderate: "amber",
  high: "neg",
};

/** Compact persona card for grid views. */
export function PersonaCard({
  theme,
  persona,
  onPress,
  onLongPress,
  adopted = false,
}: {
  theme: Theme;
  persona: ThesisPersona;
  onPress: () => void;
  onLongPress?: () => void;
  adopted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={`bg-bg-surface border rounded-[16px] overflow-hidden active:opacity-80 flex-1 ${
        adopted ? "border-brand" : "border-line"
      }`}
      style={{
        shadowColor: theme.color,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* Color strip */}
      <LinearGradient
        colors={[theme.color, darken(theme.color, 0.35)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 6 }}
      />
      <View className="p-3.5">
        {/* Icon + title */}
        <View className="flex-row items-center mb-2">
          <View
            className="items-center justify-center mr-2.5"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${theme.color}1F`,
            }}
          >
            <Icon name={theme.glyph as IconName} size={18} color={theme.color} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-ink font-displayX text-[14px]" style={{ letterSpacing: -0.2 }} numberOfLines={2}>
              {theme.title}
            </Text>
            <Text className="text-ink-3 text-[10.5px] font-sansMd mt-0.5" numberOfLines={1}>
              {persona.personaName}
            </Text>
          </View>
        </View>

        {/* Tagline */}
        <Text className="text-ink-2 text-[12px] font-sansSb leading-[16px] mb-2.5" numberOfLines={2}>
          {persona.tagline}
        </Text>

        {/* Chips */}
        <View className="flex-row flex-wrap gap-1">
          {adopted && <Tag label="Active" tone="brand" />}
          <Tag label={persona.riskLevel} tone={RISK_TONE[persona.riskLevel]} />
          <Tag label={persona.timeHorizon} tone="amber" />
        </View>
      </View>
    </Pressable>
  );
}

/** Hero persona card, full-width, gradient background, philosophy quote. */
export function PersonaHero({
  theme,
  persona,
  onPress,
}: {
  theme: Theme;
  persona: ThesisPersona;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden active:opacity-90"
      style={{
        borderRadius: 22,
        shadowColor: theme.color,
        shadowOpacity: 0.25,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
      }}
    >
      <LinearGradient
        colors={[theme.color, darken(theme.color, 0.45)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 22 }}
      >
        {/* Watermark */}
        <View style={{ position: "absolute", right: -18, top: -18, opacity: 0.12 }}>
          <Icon name={theme.glyph as IconName} size={140} sw={1} color="#FFFFFF" />
        </View>

        <View className="relative">
          {/* Kicker + persona name */}
          <View className="flex-row items-center self-start bg-white/20 px-2.5 py-1 rounded-[9px] mb-3">
            <Icon name="sparkle" size={13} color="#FFFFFF" />
            <Text className="text-white text-[11px] font-sansX uppercase tracking-wider ml-1.5">
              {persona.personaName}
            </Text>
          </View>

          {/* Philosophy */}
          <Text
            className="text-white/95 text-[17px] font-displayX leading-[23px] mb-4"
            style={{ letterSpacing: -0.3 }}
          >
            "{persona.philosophy}"
          </Text>

          {/* Theme title + tagline */}
          <Text className="text-white text-[13px] font-sansBold opacity-90">
            {theme.title}
          </Text>
          <Text className="text-white/75 text-[12px] font-sansMd mt-0.5">
            {persona.tagline}
          </Text>

          {/* Allocation mini-bars */}
          <View className="flex-row mt-4 gap-x-1">
            {persona.modelAllocation.slice(0, 4).map((a, i) => (
              <View
                key={i}
                className="flex-1 bg-white/20 rounded-full overflow-hidden"
                style={{ height: 5 }}
              >
                <View
                  className="h-full bg-white rounded-full"
                  style={{ width: `${a.pct}%`, opacity: 1 - i * 0.12 }}
                />
              </View>
            ))}
          </View>
          {/* Allocation labels */}
          <View className="flex-row mt-1.5">
            {persona.modelAllocation.slice(0, 4).map((a, i) => (
              <Text key={i} className="text-white/60 text-[9px] font-sansSb flex-1" numberOfLines={1}>
                {a.label}
              </Text>
            ))}
          </View>

          {/* CTA */}
          <View className="flex-row items-center mt-4">
            <Text className="text-white text-[14px] font-sansBold mr-1.5">Explore this thesis</Text>
            <Icon name="arrow" size={16} color="#FFFFFF" sw={2.2} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function darken(hex: string, amount: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `#${[r, g, b]
    .map((n) => Math.round(n * (1 - amount)).toString(16).padStart(2, "0"))
    .join("")}`;
}
