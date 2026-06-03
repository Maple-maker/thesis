import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import {
  AFFILIATE_DISCLOSURE,
  offersByCategory,
  openAffiliateOffer,
  type AffiliateOffer,
} from "@/data/affiliate-offers";

type Props = {
  title?: string;
  subtitle?: string;
  limit?: number;
};

export function BrokerageOffersCard({
  title = "Open a brokerage to build it",
  subtitle = "Commission-free ETFs and fractional shares, compare partners, then implement your model weights.",
  limit = 3,
}: Props) {
  const offers = offersByCategory("brokerage").slice(0, limit);

  return (
    <View className="mb-6">
      <Text className="text-ink font-displayX text-[17px] mb-1" style={{ letterSpacing: -0.3 }}>
        {title}
      </Text>
      <Text className="text-ink-2 text-[12.5px] font-sansMd mb-4 leading-[18px]">
        {subtitle}
      </Text>
      <Card pad={0} className="overflow-hidden">
        {offers.map((offer, i) => (
          <OfferRow
            key={offer.id}
            offer={offer}
            isLast={i === offers.length - 1}
            onPress={() => openAffiliateOffer(offer)}
          />
        ))}
      </Card>
      <Text className="text-ink-3 text-[10px] font-sansMd mt-3 leading-[14px]">
        {AFFILIATE_DISCLOSURE}
      </Text>
    </View>
  );
}

function OfferRow({
  offer,
  onPress,
  isLast,
}: {
  offer: AffiliateOffer;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 active:opacity-70 ${
        !isLast ? "border-b border-line" : ""
      }`}
    >
      <View className="flex-1">
        <Text className="text-ink font-sansBold text-[14px]">{offer.name}</Text>
        <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5 leading-[17px]" numberOfLines={2}>
          {offer.headline}
        </Text>
      </View>
      <Text className="text-brand text-[12px] font-sansBold ml-3">Open →</Text>
    </Pressable>
  );
}
