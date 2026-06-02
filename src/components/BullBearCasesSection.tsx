import { Text, View } from "react-native";

import { BullBearCaseCard } from "@/components/BullBearCaseCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Props = {
  symbol: string;
  bull: string[];
  bear: string[];
};

/** Same bull/bear presentation as Duel, for stock & ETF detail screens. */
export function BullBearCasesSection({ symbol, bull, bear }: Props) {
  return (
    <View className="mb-6">
      <SectionTitle>Bull & bear</SectionTitle>
      <Text className="text-ink-3 text-[12px] font-sansMd mb-3 leading-[17px]">
        Educational scenarios from Thesis data and tags, not a buy/sell call. Compare both
        sides before conviction.
      </Text>
      <View className="gap-y-2.5">
        <BullBearCaseCard type="bull" ticker={symbol} items={bull} />
        <BullBearCaseCard type="bear" ticker={symbol} items={bear} />
      </View>
    </View>
  );
}
