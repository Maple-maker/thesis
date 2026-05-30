import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { MetricChip } from "@/components/ui/MetricChip";

type Chip = {
  label: string;
  delta?: string;
  tone?: "pos" | "neg" | "neutral";
};

type Props = {
  kicker?: string;
  headline: string;
  attribution?: string;
  body?: string;
  whyItMatters?: string[];
  watch?: string;
  chips?: Chip[];
  /** Optional "Read more" action for InsightSheet expansion. */
  onPressReadMore?: () => void;
  /** Optional footer override — default is disclaimer. */
  footer?: string;
};

/**
 * Daylight insight card — Public/Coinbase-inspired narrative.
 * Headline + whyItMatters bullets + optional Watch block + metric chips.
 */
export function InsightCard({
  kicker,
  headline,
  attribution,
  body,
  whyItMatters,
  watch,
  chips,
  onPressReadMore,
  footer,
}: Props) {
  return (
    <Card pad={16}>
      {/* Kicker */}
      {kicker && (
        <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-widest mb-2">
          {kicker}
        </Text>
      )}

      {/* Headline */}
      <Text
        className="text-ink text-[17px] font-displayX leading-[22px]"
        style={{ letterSpacing: -0.3 }}
      >
        {headline}
      </Text>

      {/* Attribution */}
      {attribution && (
        <Text className="text-ink-3 text-[11px] font-sansMd mt-1.5">
          {attribution}
        </Text>
      )}

      {/* Body */}
      {body && (
        <Text className="text-ink-2 text-[14px] font-sansMd mt-3 leading-[20px]">
          {body}
        </Text>
      )}

      {/* Why it matters */}
      {whyItMatters && whyItMatters.length > 0 && (
        <View className="mt-4">
          <View className="flex-row items-center mb-2">
            <Icon name="sparkle" size={13} color="#0E7A66" sw={2} />
            <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-1.5">
              Why it matters
            </Text>
          </View>
          {whyItMatters.map((b, i) => (
            <View key={i} className="flex-row items-start mb-2 last:mb-0">
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: "#8C988F99",
                  marginTop: 7,
                  marginRight: 9,
                }}
              />
              <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] flex-1">
                {b}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Watch */}
      {watch && (
        <View className="mt-3.5 bg-amber-bg border border-amber/20 rounded-[11px] p-3">
          <View className="flex-row items-center mb-1.5">
            <Icon name="info" size={13} color="#D98512" sw={2} />
            <Text className="text-amber text-[12px] font-sansX uppercase tracking-wider ml-1.5">
              Watch
            </Text>
          </View>
          <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px]">
            {watch}
          </Text>
        </View>
      )}

      {/* Metric chips */}
      {chips && chips.length > 0 && (
        <View className="flex-row flex-wrap gap-x-1.5 gap-y-1.5 mt-3.5">
          {chips.map((c, i) => (
            <MetricChip key={i} label={c.label} delta={c.delta} tone={c.tone} />
          ))}
        </View>
      )}

      {/* Read more */}
      {onPressReadMore && (
        <Pressable
          onPress={onPressReadMore}
          className="flex-row items-center mt-3.5 active:opacity-60"
        >
          <Text className="text-brand text-[13px] font-sansBold mr-1">Read more</Text>
          <Icon name="arrow" size={14} color="#0E7A66" sw={2.2} />
        </Pressable>
      )}

      {/* Footer */}
      <Text className="text-ink-3 text-[9.5px] font-sansMd text-center mt-4 leading-[13px]">
        {footer ?? "Illustrative · not live data · not investment advice."}
      </Text>
    </Card>
  );
}
