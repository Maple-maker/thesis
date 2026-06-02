import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { creditCardsByCategory } from "@/data/credit/cards";
import { creditGuideById } from "@/data/credit/guides";

export default function PointsMilesHub() {
  const router = useRouter();
  const travelCards = creditCardsByCategory("travel");
  const primer = creditGuideById("points-vs-cashback");

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable onPress={() => router.back()} className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70">
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[24px]">Points & miles</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        <Text className="text-ink-2 text-[14px] font-sansMd leading-[21px] mb-4">
          The Points Guy playbook, simplified: earn rate × redemption value − annual fee. No hype
          without the math.
        </Text>

        {primer && (
          <Pressable onPress={() => router.push(`/credit/guides/${primer.id}` as any)} className="mb-5 active:opacity-70">
            <Card pad={16} className="border-brand/25">
              <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1">
                Start here
              </Text>
              <Text className="text-ink font-sansBold text-[16px]">{primer.title}</Text>
              <Text className="text-ink-2 text-[13px] font-sansMd mt-2">{primer.summary}</Text>
            </Card>
          </Pressable>
        )}

        <Text className="text-ink font-displayX text-[17px] mb-3">Travel cards in Thesis</Text>
        {travelCards.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/credit/cards/${c.id}` as any)}
            className="mb-2 active:opacity-70"
          >
            <Card pad={14}>
              <Text className="text-ink font-sansBold text-[14.5px]">{c.name}</Text>
              <Text className="text-ink-2 text-[12.5px] font-sansMd mt-1">{c.rewardsSummary}</Text>
              <Text className="text-ink-3 text-[11px] font-sansMd mt-2">Fee: {c.annualFee}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
