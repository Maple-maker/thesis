import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { CREDIT_GUIDES } from "@/data/credit/guides";

const SCORE_GUIDES = CREDIT_GUIDES.filter((g) =>
  ["credit-score-101", "build-credit-fast", "utilization", "freeze-report"].includes(g.id)
);

export default function CreditScoreHub() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable onPress={() => router.back()} className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70">
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[24px]">Credit score</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        <Card pad={16} className="mb-4">
          <Text className="text-ink text-[15px] font-sansMd leading-[22px]">
            FICO-style scores range 300–850. Thesis does not pull your score, we teach the habits
            lenders reward and link to cards you may qualify for.
          </Text>
        </Card>

        {SCORE_GUIDES.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => router.push(`/credit/guides/${g.id}` as any)}
            className="mb-2 active:opacity-70"
          >
            <Card pad={14}>
              <Text className="text-ink font-sansBold text-[15px]">{g.title}</Text>
              <Text className="text-ink-2 text-[13px] font-sansMd mt-1">{g.summary}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
