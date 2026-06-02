import * as WebBrowser from "expo-web-browser";
import { Alert, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { AFFILIATE_DISCLOSURE, type AffiliateOffer } from "@/data/affiliate-offers";

type Props = {
  offer: AffiliateOffer;
  compact?: boolean;
};

export async function openAffiliateOffer(offer: AffiliateOffer) {
  if (!offer.url) {
    Alert.alert(offer.name, `${AFFILIATE_DISCLOSURE}\n\nPartner link coming soon.`);
    return;
  }
  await WebBrowser.openBrowserAsync(offer.url, {
    toolbarColor: "#F3F5F1",
    controlsColor: "#0E7A66",
  });
}

export function AffiliateOfferCard({ offer, compact }: Props) {
  return (
    <Pressable onPress={() => openAffiliateOffer(offer)} className="active:opacity-70">
      <Card pad={compact ? 12 : 14}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-0.5">
              {offer.partnerLabel}
            </Text>
            <Text className="text-ink font-sansBold text-[14.5px]">{offer.name}</Text>
            <Text className="text-ink-2 text-[12.5px] font-sansMd mt-1 leading-[18px]">
              {offer.headline}
            </Text>
            {!compact && (
              <Text className="text-ink-3 text-[12px] font-sansMd mt-2 leading-[17px]">
                {offer.why}
              </Text>
            )}
          </View>
          <Icon name="arrow" size={16} color="#8C988F" sw={2} />
        </View>
        <Text className="text-brand text-[12px] font-sansBold mt-3">
          Compare offer →
        </Text>
      </Card>
    </Pressable>
  );
}
