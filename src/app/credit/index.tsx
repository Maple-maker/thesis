import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AffiliateOfferCard } from "@/components/AffiliateOfferCard";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { AFFILIATE_DISCLOSURE, offersByCategory } from "@/data/affiliate-offers";
import { CREDIT_GUIDES } from "@/data/credit/guides";
import { matchCreditCards, CREDIT_CATEGORY_LABELS } from "@/data/credit/cards";
import { useStore } from "@/store";

const QUICK_SECTIONS: { id: string; title: string; subtitle: string; route: string; icon: "shield" | "book" | "gem" }[] = [
  { id: "cards", title: "Compare cards", subtitle: "Matched to your credit profile", route: "/credit/cards", icon: "shield" },
  { id: "score", title: "Credit score hub", subtitle: "Factors, fixes, freezes", route: "/credit/score", icon: "book" },
  { id: "points", title: "Points & miles", subtitle: "TPG-style primer, fee math first", route: "/credit/points", icon: "gem" },
];

export default function CreditHub() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const picks = useMemo(() => matchCreditCards(profile, 3), [profile]);
  const creditOffers = offersByCategory("credit-card").concat(offersByCategory("credit-builder")).slice(0, 3);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">Tools</Text>
          <Text className="text-ink font-displayX text-[28px]" style={{ letterSpacing: -0.6 }}>
            Credit
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 110 }}>
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] mb-5">
          NerdWallet-style comparisons and Points Guy–style travel primers, ranked for your situation,
          with disclosed partner links.
        </Text>

        {QUICK_SECTIONS.map((s) => (
          <ListRow
            key={s.id}
            leading={
              <View className="w-[40px] h-[40px] rounded-[12px] bg-amber-bg items-center justify-center">
                <Icon name={s.icon} size={20} color="#D98512" sw={2} />
              </View>
            }
            title={s.title}
            subtitle={s.subtitle}
            onPress={() => router.push(s.route as any)}
          />
        ))}

        <Text className="text-ink text-[16px] font-displayX mt-6 mb-3">Top picks for you</Text>
        <View className="gap-y-2 mb-2">
          {picks.map((card) => (
            <ListRow
              key={card.id}
              title={card.name}
              subtitle={`${CREDIT_CATEGORY_LABELS[card.category]} · ${card.rewardsSummary.slice(0, 60)}…`}
              onPress={() => router.push(`/credit/cards/${card.id}` as any)}
            />
          ))}
        </View>
        <Pressable onPress={() => router.push("/credit/cards" as any)} className="mb-6 active:opacity-70">
          <Text className="text-brand text-[13px] font-sansBold">Browse all cards →</Text>
        </Pressable>

        <Text className="text-ink text-[16px] font-displayX mb-3">Guides</Text>
        <View className="gap-y-2 mb-6">
          {CREDIT_GUIDES.slice(0, 4).map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/credit/guides/${g.id}` as any)}
              className="active:opacity-70"
            >
              <Card pad={14}>
                <Text className="text-ink font-sansBold text-[14.5px]">{g.title}</Text>
                <Text className="text-ink-2 text-[12.5px] font-sansMd mt-1">{g.summary}</Text>
                <Text className="text-ink-3 text-[11px] font-sansMd mt-2">{g.readMin} min read</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <Text className="text-ink text-[16px] font-displayX mb-3">Partner offers</Text>
        <Text className="text-ink-3 text-[11px] font-sansMd mb-3 leading-[16px]">{AFFILIATE_DISCLOSURE}</Text>
        <View className="gap-y-2.5">
          {creditOffers.map((o) => (
            <AffiliateOfferCard key={o.id} offer={o} compact />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
