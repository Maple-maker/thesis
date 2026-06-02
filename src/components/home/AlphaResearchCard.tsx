import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";

export function ThesisResearchCard() {
  const router = useRouter();

  return (
    <Card pad={0} className="mb-4 overflow-hidden">
      {/* Header gradient bar */}
      <View
        className="px-4 py-3"
        style={{ backgroundColor: "rgba(124,58,237,0.08)" }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-[9px] items-center justify-center"
              style={{ backgroundColor: "rgba(124,58,237,0.2)" }}
            >
              <Icon name="sparkle" size={17} color="#7C3AED" sw={2} />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-ink font-sansBold text-[15px]">
                  Thesis Research
                </Text>
                <View
                  className="px-1.5 py-0.5 rounded-[5px]"
                  style={{ backgroundColor: "rgba(124,58,237,0.15)" }}
                >
                  <Text className="text-[8px] font-sansX uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                    Free Preview
                  </Text>
                </View>
              </View>
              <Text className="text-ink-3 text-[11px] font-sansMd">
                Experimental · Multi-analyst · AI-powered
              </Text>
            </View>
          </View>
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <Icon name="back" size={14} color="#7C3AED" sw={2} />
          </View>
        </View>
      </View>

      {/* Body */}
      <View className="px-4 py-3">
        <Text className="text-ink text-[13px] font-sansMd leading-[19px] mb-3">
          4 specialized LLM analysts — Value, Growth, Macro, and Bear — debate any stock.
          Each produces an independent thesis, challenges the others, and a committee
          chair synthesizes the verdict.
        </Text>

        {/* Features */}
        <View className="gap-y-2 mb-3">
          <FeatureRow icon="compare" label="Multi-analyst debates with conviction scoring" />
          <FeatureRow icon="trend" label="Catalyst research across 7 layers (L1–L7)" />
          <FeatureRow icon="discover" label="Market sentiment & dip-buying signals" />
        </View>

        {/* Disclaimers — Public Thesis Research-style */}
        <View
          className="rounded-[10px] px-3 py-2.5 mb-3"
          style={{ backgroundColor: "rgba(124,58,237,0.04)" }}
        >
          <Text className="text-[11px] font-sansBold mb-1.5" style={{ color: "#7C3AED" }}>
            Check Thesis Research's work before investing
          </Text>
          <Text className="text-ink-3 text-[10px] font-sansMd leading-[16px]">
            Given the probabilistic nature of machine learning, Thesis Research's responses won't always be
            right. Do your own research.
          </Text>
          <View className="h-[1px] my-2" style={{ backgroundColor: "rgba(124,58,237,0.1)" }} />
          <Text className="text-[11px] font-sansBold mb-1.5" style={{ color: "#7C3AED" }}>
            No investment recommendations
          </Text>
          <Text className="text-ink-3 text-[10px] font-sansMd leading-[16px]">
            Thesis Research gives you information, not advice. Thesis Research won't make investment recommendations
            or tell you what to buy or sell.
          </Text>
          <View className="h-[1px] my-2" style={{ backgroundColor: "rgba(124,58,237,0.1)" }} />
          <Text className="text-[11px] font-sansBold mb-1.5" style={{ color: "#7C3AED" }}>
            We want your feedback
          </Text>
          <Text className="text-ink-3 text-[10px] font-sansMd leading-[16px]">
            As part of the Thesis Research free preview, and one of its first beta testers, your feedback
            is important. Report issues in the feedback log.
          </Text>
        </View>

        {/* Actions */}
        <Pressable
          onPress={() => router.push("/debate" as never)}
          className="bg-brand-bg rounded-[12px] py-3 items-center active:opacity-80 mb-2"
        >
          <Text className="text-brand text-[14px] font-sansBold">Open Thesis Research</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/debate" as never)}
          className="py-2 items-center active:opacity-60"
        >
          <Text className="text-ink-3 text-[12px] font-sansMd">Pick a ticker to analyze →</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function FeatureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="w-[18px] h-[18px] rounded-[5px] items-center justify-center"
        style={{ backgroundColor: "rgba(124,58,237,0.1)" }}
      >
        <Icon name={icon as any} size={10} color="#7C3AED" sw={1.8} />
      </View>
      <Text className="text-ink-2 text-[12px] font-sansMd">{label}</Text>
    </View>
  );
}
