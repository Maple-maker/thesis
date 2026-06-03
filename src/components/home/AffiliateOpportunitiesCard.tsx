import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { offersForProfile, AFFILIATE_DISCLOSURE, openAffiliateOffer, type AffiliateOffer } from "@/data/affiliate-offers";
import type { UserProfile } from "@/store/types";

const CATEGORY_ICON: Record<string, IconName> = {
  hysa: "piggy",
  brokerage: "trend",
  "credit-card": "compass",
  "credit-builder": "compass",
};

function contextForProfile(profile: UserProfile): { heading: string; color: string } {
  if (!profile.hasEmergencyFund) {
    return { heading: "Start with savings", color: "#0E7A66" };
  }
  if (profile.hasHighInterestDebt) {
    return { heading: "Manage debt first", color: "#7C3AED" };
  }
  if (profile.experience === "none" || profile.experience === "some") {
    return { heading: "Ready for a brokerage?", color: "#0E7A66" };
  }
  return { heading: "Explore financial tools", color: "#0E7A66" };
}

function AffiliateOfferRow({ offer, isLast }: { offer: AffiliateOffer; isLast: boolean }) {
  return (
    <Pressable
      onPress={() => openAffiliateOffer(offer)}
      className={`flex-row items-center px-0 py-3 active:opacity-60 ${isLast ? "" : "border-b border-line"}`}
    >
      <View className="w-8 h-8 rounded-[10px] bg-brand-bg items-center justify-center mr-3">
        <Icon name={CATEGORY_ICON[offer.category] ?? "sparkle"} size={16} color="#0E7A66" sw={2} />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-sansBold text-[14px]">{offer.name}</Text>
        <Text
          className="text-ink-2 text-[12px] font-sansMd mt-0.5 leading-[16px]"
          numberOfLines={1}
        >
          {offer.headline}
        </Text>
      </View>
      <Icon name="arrow" size={15} color="#8C988F" sw={2} />
    </Pressable>
  );
}

export function AffiliateOpportunitiesCard({
  profile,
  onSeeAll,
}: {
  profile: UserProfile;
  onSeeAll?: () => void;
}) {
  const offers = offersForProfile(profile);
  if (offers.length === 0) return null;

  const display = offers.slice(0, 2);
  const { heading, color } = contextForProfile(profile);
  const totalMore = offers.length - display.length;

  return (
    <Card pad={16} className="mb-4">
      <View className="flex-row items-center mb-3">
        <View className="w-[22px] h-[22px] rounded-[7px] items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
          <Icon name="sparkle" size={13} color={color} sw={2.2} />
        </View>
        <Text className="text-ink text-[13px] font-sansX uppercase tracking-wider ml-2" style={{ color }}>
          {heading}
        </Text>
      </View>
      {display.map((offer, i) => (
        <AffiliateOfferRow key={offer.id} offer={offer} isLast={i === display.length - 1 && totalMore === 0} />
      ))}
      {onSeeAll && (
        <Pressable onPress={onSeeAll} className="flex-row items-center justify-center pt-2 active:opacity-60">
          <Text className="text-brand text-[12.5px] font-sansBold">
            {totalMore > 0 ? `See all ${offers.length} offers →` : "All offers →"}
          </Text>
        </Pressable>
      )}
      <Text className="text-ink-3 text-[9px] font-sansMd text-center mt-2 leading-[13px]">
        {AFFILIATE_DISCLOSURE}
      </Text>
    </Card>
  );
}
