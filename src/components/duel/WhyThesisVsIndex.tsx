import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/Icon";
import { WHY_NOT_JUST_SPY } from "@/lib/portfolio-backtest";

export function WhyThesisVsIndex({ compact = false }: { compact?: boolean }) {
  const items = compact ? WHY_NOT_JUST_SPY.slice(0, 2) : WHY_NOT_JUST_SPY;

  return (
    <Card pad={16} className="mb-4">
      <View className="flex-row items-start mb-3">
        <View className="w-9 h-9 rounded-[10px] bg-violet-bg items-center justify-center mr-3">
          <Icon name="sparkle" size={18} color="#7C3AED" sw={2} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-displayX text-[16px]" style={{ letterSpacing: -0.3 }}>
            Why Thesis, not just SPY?
          </Text>
          <Text className="text-ink-2 text-[12.5px] font-sansMd mt-1 leading-[18px]">
            Beating the index one year isn't a plan. Thesis shows whether a philosophy fits you, and if it beat the S&P 500 while doing it.
          </Text>
        </View>
      </View>
      <View className="gap-y-3">
        {items.map((item) => (
          <View key={item.title}>
            <Text className="text-ink text-[13px] font-sansBold">{item.title}</Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5 leading-[17px]">
              {item.body}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
