import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AffiliateOfferCard, openAffiliateOffer } from "@/components/AffiliateOfferCard";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AFFILIATE_OFFERS } from "@/data/affiliate-offers";
import { creditCardById, CREDIT_CATEGORY_LABELS } from "@/data/credit/cards";

export default function CreditCardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const card = id ? creditCardById(id) : undefined;

  if (!card) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F5F1", padding: 20 }}>
        <Text className="text-ink-2 font-sansMd">Card not found.</Text>
      </SafeAreaView>
    );
  }

  const affiliate = card.affiliateOfferId
    ? AFFILIATE_OFFERS.find((o) => o.id === card.affiliateOfferId)
    : undefined;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-3">
          {CREDIT_CATEGORY_LABELS[card.category]}
        </Text>
        <Text className="text-ink font-displayX text-[28px] mt-1" style={{ letterSpacing: -0.5 }}>
          {card.name}
        </Text>
        <Text className="text-ink-2 text-[14px] font-sansMd mt-1">{card.issuer}</Text>

        <Card pad={16} className="mt-5">
          <Text className="text-ink font-sansBold text-[14px] mb-2">Rewards & fees</Text>
          <Text className="text-ink-2 text-[13.5px] font-sansMd leading-[20px]">{card.rewardsSummary}</Text>
          <Text className="text-ink-3 text-[12px] font-sansMd mt-3">
            Annual fee: {card.annualFee} · APR: {card.aprRange}
          </Text>
          {card.welcomeOffer && (
            <Text className="text-brand text-[12px] font-sansMd mt-2">{card.welcomeOffer}</Text>
          )}
        </Card>

        {card.expertTake && (
          <Card pad={14} className="mt-3 bg-amber-bg/50">
            <Text className="text-amber text-[10px] font-sansX uppercase tracking-wider mb-1">
              Expert take
            </Text>
            <Text className="text-ink text-[13.5px] font-sansMd italic leading-[20px]">
              {card.expertTake}
            </Text>
          </Card>
        )}

        <Text className="text-ink font-displayX text-[17px] mt-5 mb-2">Best for</Text>
        {card.bestFor.map((b) => (
          <View key={b} className="flex-row mb-1.5">
            <Icon name="check" size={12} color="#0E7A66" sw={2} />
            <Text className="text-ink-2 text-[13px] font-sansMd ml-2">{b}</Text>
          </View>
        ))}

        <Text className="text-ink font-displayX text-[17px] mt-4 mb-2">Pros</Text>
        {card.pros.map((p) => (
          <Text key={p} className="text-ink-2 text-[13px] font-sansMd mb-1">
            + {p}
          </Text>
        ))}

        <Text className="text-ink font-displayX text-[17px] mt-4 mb-2">Cons</Text>
        {card.cons.map((c) => (
          <Text key={c} className="text-ink-2 text-[13px] font-sansMd mb-1">
            − {c}
          </Text>
        ))}

        <Text className="text-ink-3 text-[12px] font-sansMd mt-4">
          Credit needed: {card.creditNeeded}
        </Text>

        {affiliate ? (
          <View className="mt-6">
            <AffiliateOfferCard offer={affiliate} />
          </View>
        ) : (
          <View className="mt-6">
            <Button label="Go back" fullWidth onPress={() => router.back()} />
          </View>
        )}

        {affiliate && (
          <View className="mt-3">
            <Button
              label="Compare partner offer"
              fullWidth
              variant="primary"
              onPress={() => openAffiliateOffer(affiliate)}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
