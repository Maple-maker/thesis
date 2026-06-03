import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { AffiliateOfferCard } from "@/components/AffiliateOfferCard";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_OFFERS,
  CATEGORY_LABELS,
  offersForProfile,
  type AffiliateCategory,
} from "@/data/affiliate-offers";
import { useStore } from "@/store";

const CATEGORIES: AffiliateCategory[] = ["hysa", "brokerage", "credit-card", "credit-builder"];

const CATEGORY_ICONS: Record<AffiliateCategory, IconName> = {
  hysa: "piggy",
  brokerage: "trend",
  "credit-card": "compass",
  "credit-builder": "compass",
};

export default function OffersScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const [filter, setFilter] = useState<AffiliateCategory | null>(null);

  const profileOffers = useMemo(() => offersForProfile(profile), [profile]);

  const displayed = filter
    ? AFFILIATE_OFFERS.filter((o) => o.category === filter)
    : profileOffers.length > 0
      ? profileOffers
      : AFFILIATE_OFFERS;

  return (
    <Screen padded>
      <Header title="Offers" back onBack={() => router.back()} />

      <Text className="text-ink-2 text-[13.5px] font-sansMd mb-5 leading-[19px]">
        Financial tools matched to your profile. Thesis earns a commission if you open an account through these links — we only recommend what fits your situation.
      </Text>

      {/* Category filter chips */}
      <View className="flex-row flex-wrap gap-2 mb-5">
        <Pressable
          onPress={() => setFilter(null)}
          className={`px-3.5 py-2 rounded-[10px] ${filter === null ? "bg-brand" : "bg-bg-surface border border-line"}`}
        >
          <Text className={`text-[12px] font-sansBold ${filter === null ? "text-white" : "text-ink-2"}`}>
            For you
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setFilter(filter === cat ? null : cat)}
            className={`flex-row items-center px-3 py-2 rounded-[10px] ${filter === cat ? "bg-brand" : "bg-bg-surface border border-line"}`}
          >
            <Icon name={CATEGORY_ICONS[cat]} size={13} color={filter === cat ? "#FFFFFF" : "#8C988F"} sw={2} />
            <Text className={`text-[12px] font-sansBold ml-1.5 ${filter === cat ? "text-white" : "text-ink-2"}`}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Offer list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {displayed.length === 0 ? (
          <Card pad={20}>
            <Text className="text-ink-2 text-[14px] font-sansMd text-center leading-[20px]">
              No offers match this filter yet. Check back as we add more partners.
            </Text>
          </Card>
        ) : (
          <View className="gap-y-3">
            {displayed.map((offer) => (
              <AffiliateOfferCard key={offer.id} offer={offer} compact />
            ))}
          </View>
        )}

        <Text className="text-ink-3 text-[10px] font-sansMd text-center mt-6 leading-[14px]">
          {AFFILIATE_DISCLOSURE}
        </Text>

        <Text className="text-ink-3 text-[9.5px] font-sansMd text-center mt-3 leading-[13px]">
          Offers are ranked by your profile — not by commission. We never recommend products you don't need.
        </Text>
      </ScrollView>
    </Screen>
  );
}
