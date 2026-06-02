import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { isCuratedEtf } from "@/data/etfs";
import type { ETF } from "@/store/types";
import { etfDetailRoute } from "@/lib/app-route";
import { useStore } from "@/store";

type Props = {
  etf: ETF;
  showWatchlist?: boolean;
  returnTo?: string;
  /** When set, show a duel picker ring (watchlist compare flow). */
  duelSelect?: { selected: boolean; onToggle: () => void };
  /** Override main row press (e.g. toggle duel pick instead of navigate). */
  onRowPress?: () => void;
};

export function EtfListRow({
  etf,
  showWatchlist = true,
  returnTo,
  duelSelect,
  onRowPress,
}: Props) {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const watching = watchlist.includes(etf.symbol);
  const feeLabel =
    isCuratedEtf(etf.symbol) || etf.expense > 0
      ? `${etf.expense}% fee`
      : "US-listed";

  const openDetail = () =>
    router.push(
      (returnTo ? etfDetailRoute(etf.symbol, returnTo) : etfDetailRoute(etf.symbol)) as never
    );

  return (
    <Card pad={14}>
      <View className="flex-row items-center">
        {duelSelect ? (
          <Pressable
            onPress={duelSelect.onToggle}
            hitSlop={8}
            className={`w-9 h-9 rounded-full border-2 items-center justify-center mr-2 ${
              duelSelect.selected ? "bg-brand border-brand" : "border-line bg-bg-surface"
            }`}
          >
            {duelSelect.selected ? (
              <Icon name="check" size={16} color="#FFFFFF" sw={2.4} />
            ) : null}
          </Pressable>
        ) : null}
        <Pressable
          onPress={onRowPress ?? openDetail}
          className="flex-row items-center flex-1 active:opacity-70"
        >
          <View className="bg-violet-bg w-[40px] h-[40px] rounded-[11px] items-center justify-center mr-3">
            <Icon name="grid" size={19} color="#7C3AED" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-ink font-monoBold text-[14px]">{etf.symbol}</Text>
              <Text className="text-ink-3 text-[11px] font-sansMd ml-2">{feeLabel}</Text>
            </View>
            <Text className="text-ink-2 text-[13px] font-sansSb mt-0.5" numberOfLines={2}>
              {etf.name}
            </Text>
          </View>
          <Icon name="chev" size={16} color="#8C988F" />
        </Pressable>
        {showWatchlist && (
          <Pressable
            onPress={() => toggle(etf.symbol)}
            className={`ml-2 w-9 h-9 rounded-[10px] items-center justify-center ${
              watching ? "bg-brand" : "bg-bg-surface2 border border-line"
            }`}
          >
            <Icon
              name={watching ? "check" : "plus"}
              size={17}
              sw={2.2}
              color={watching ? "#FFFFFF" : "#0E7A66"}
            />
          </Pressable>
        )}
      </View>
    </Card>
  );
}
