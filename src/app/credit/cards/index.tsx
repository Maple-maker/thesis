import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { ListRow } from "@/components/ui/ListRow";
import {
  CREDIT_CARDS,
  CREDIT_CATEGORY_LABELS,
  matchCreditCards,
  type CreditCardCategory,
} from "@/data/credit/cards";
import { useStore } from "@/store";

const CATS: (CreditCardCategory | "all" | "matched")[] = [
  "matched",
  "all",
  "secured",
  "cashback",
  "travel",
  "balance-transfer",
  "student",
  "no-annual-fee",
];

export default function CreditCardsBrowse() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const [filter, setFilter] = useState<(typeof CATS)[number]>("matched");

  const list = useMemo(() => {
    if (filter === "matched") return matchCreditCards(profile, 20);
    if (filter === "all") return CREDIT_CARDS;
    return CREDIT_CARDS.filter((c) => c.category === filter);
  }, [filter, profile]);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[24px]">Compare cards</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {CATS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setFilter(c)}
            className={`px-3 py-2 rounded-full border ${
              filter === c ? "bg-brand border-brand" : "bg-bg-surface border-line"
            }`}
          >
            <Text
              className={`text-[12px] font-sansBold ${filter === c ? "text-white" : "text-ink-2"}`}
            >
              {c === "matched"
                ? "For you"
                : c === "all"
                  ? "All"
                  : CREDIT_CATEGORY_LABELS[c]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 110 }}>
        <View className="gap-y-2">
          {list.map((card) => (
            <ListRow
              key={card.id}
              title={card.name}
              subtitle={`${card.issuer} · ${card.annualFee} annual fee · ${CREDIT_CATEGORY_LABELS[card.category]}`}
              onPress={() => router.push(`/credit/cards/${card.id}` as any)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
