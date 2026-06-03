import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { MetricChip } from "@/components/ui/MetricChip";
import type { ConceptId } from "@/data/concepts";
import type { ContextInsight } from "@/data/context-insights";

type Props = {
  insight: ContextInsight | null;
  visible: boolean;
  onClose: () => void;
  onConceptPress?: (id: ConceptId) => void;
};

export function InsightSheet({ insight, visible, onClose, onConceptPress }: Props) {
  const insets = useSafeAreaInsets();
  if (!insight) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-bg-surface rounded-t-[24px] max-h-[85%]"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {/* Handle + close */}
          <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
            <View className="w-8 h-1 rounded-full bg-line mx-auto -ml-8 flex-1" />
            <Pressable onPress={onClose} className="w-[32px] h-[32px] rounded-full bg-bg-surface2 items-center justify-center active:opacity-70">
              <Icon name="close" size={16} color="#8C988F" sw={2} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          >
            {/* Kicker */}
            {insight.kicker && (
              <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-widest mb-2">
                {insight.kicker}
              </Text>
            )}

            {/* Headline */}
            <Text
              className="text-ink text-[22px] font-displayX leading-[26px]"
              style={{ letterSpacing: -0.4 }}
            >
              {insight.headline}
            </Text>

            {/* Attribution */}
            {insight.attribution && (
              <Text className="text-ink-3 text-[12px] font-sansMd mt-2">
                {insight.attribution}
              </Text>
            )}

            {/* Body */}
            {insight.body && (
              <Text className="text-ink-2 text-[15px] font-sansMd leading-[22px] mt-4">
                {insight.body}
              </Text>
            )}

            {/* Why it matters */}
            {insight.whyItMatters.length > 0 && (
              <View className="mt-5">
                <View className="flex-row items-center mb-3">
                  <Icon name="sparkle" size={14} color="#0E7A66" sw={2} />
                  <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                    Why it matters
                  </Text>
                </View>
                {insight.whyItMatters.map((b, i) => (
                  <View key={i} className="flex-row items-start mb-2.5 last:mb-0">
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: "#8C988F99",
                        marginTop: 7,
                        marginRight: 10,
                      }}
                    />
                    <Text className="text-ink-2 text-[14px] font-sansMd leading-[20px] flex-1">
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Watch */}
            {insight.watch && (
              <View className="mt-4 bg-amber-bg border border-amber/20 rounded-[12px] p-3.5">
                <View className="flex-row items-center mb-1.5">
                  <Icon name="info" size={14} color="#D98512" sw={2} />
                  <Text className="text-amber text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                    Watch
                  </Text>
                </View>
                <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
                  {insight.watch}
                </Text>
              </View>
            )}

            {/* Metric chips */}
            {insight.chips && insight.chips.length > 0 && (
              <View className="flex-row flex-wrap gap-x-2 gap-y-2 mt-4">
                {insight.chips.map((c, i) => (
                  <MetricChip key={i} label={c.label} delta={c.delta} tone={c.tone} />
                ))}
              </View>
            )}

            {/* Concept links */}
            {insight.conceptIds && insight.conceptIds.length > 0 && onConceptPress && (
              <View className="mt-5">
                <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
                  Learn the terms
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {insight.conceptIds.map((cid) => (
                    <Pressable
                      key={cid}
                      onPress={() => onConceptPress(cid)}
                      className="px-3 py-1.5 rounded-full bg-brand-bg border border-brand/25 active:opacity-70"
                    >
                      <Text className="text-brand text-[12px] font-sansBold">
                        {cid.replace("-", " ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Footer */}
            <Text className="text-ink-3 text-[10px] font-sansMd text-center mt-6 leading-[14px]">
              Illustrative · not live data · not investment advice.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
