import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import type { SecurityResult } from "@/lib/security-screener";
import { symbolHistoricalReturns } from "@/data/symbol-historical-returns";
import { SPY_BENCHMARK } from "@/data/spy-benchmark";
import { useStore } from "@/store";

type Props = {
  item: SecurityResult;
};

function SpyDelta({ symbol }: { symbol: string }) {
  const data = symbolHistoricalReturns(symbol);
  if (!data) return null;
  const alpha = data.trailing1y - SPY_BENCHMARK.trailing1y;
  if (Math.abs(alpha) < 0.1) return null;
  const beat = alpha > 0;
  return (
    <View
      className={`px-1.5 py-0.5 rounded-[5px] ${beat ? "bg-pos-bg" : "bg-neg-bg"}`}
    >
      <Text className={`text-[9px] font-monoBold ${beat ? "text-pos" : "text-neg"}`}>
        {beat ? "+" : ""}{alpha.toFixed(1)} pts
      </Text>
    </View>
  );
}

export function SecurityRow({ item }: Props) {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const watching = watchlist.includes(item.symbol);

  const isEtf = item.kind === "etf";
  const accent = isEtf ? "#7C3AED" : "#0E7A66";
  const accentBg = isEtf ? "bg-violet-bg" : "bg-brand-bg";

  const open = () => {
    const path = isEtf ? "/(tabs)/etf/[symbol]" : "/(tabs)/stock/[symbol]";
    router.push({ pathname: path as never, params: { symbol: item.symbol } });
  };

  const meta =
    item.kind === "stock"
      ? item.curated
        ? `${item.sector} · ${item.marketCap >= 1000 ? `$${(item.marketCap / 1000).toFixed(1)}T` : `$${item.marketCap}B`}`
        : `${item.sector} · ${item.marketCap > 0 ? (item.marketCap >= 1000 ? `$${(item.marketCap / 1000).toFixed(1)}T` : `$${item.marketCap}B`) : "catalog"}`
      : item.curated
        ? `${item.expense}% · deep dive`
        : `${item.expense}% · catalog`;

  return (
    <View className="flex-row items-center bg-bg-surface border border-line rounded-[14px] px-3.5 py-3">
      <Pressable onPress={open} className="flex-row items-center flex-1 min-w-0 active:opacity-70">
        <View className={`w-[42px] h-[42px] rounded-[12px] items-center justify-center mr-3 ${accentBg}`}>
          <Icon name={isEtf ? "grid" : "trend"} size={18} color={accent} sw={2} />
        </View>
        <View className="flex-1 min-w-0 pr-2">
          <View className="flex-row items-center flex-wrap gap-x-2">
            <Text className="text-ink font-monoBold text-[15px]">{item.symbol}</Text>
            <SpyDelta symbol={item.symbol} />
            <View className="px-1.5 py-0.5 rounded-[6px] bg-bg-surface2">
              <Text className="text-ink-3 text-[9px] font-sansX uppercase">
                {isEtf ? "ETF" : "Stock"}
              </Text>
            </View>
            {item.curated && (
              <View className="px-1.5 py-0.5 rounded-[6px] bg-brand-bg">
                <Text className="text-brand text-[9px] font-sansX uppercase">Deep dive</Text>
              </View>
            )}
          </View>
          <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-ink-3 text-[11px] font-sansMd mt-0.5">{meta}</Text>
        </View>
        <Icon name="chev" size={16} color="#8C988F" sw={2} />
      </Pressable>
      <Pressable
        onPress={() => toggle(item.symbol)}
        hitSlop={8}
        className={`w-9 h-9 rounded-[10px] items-center justify-center ${
          watching ? "bg-brand" : "bg-bg-surface2 border border-line"
        }`}
      >
        <Icon
          name={watching ? "check" : "plus"}
          size={16}
          sw={2.2}
          color={watching ? "#FFFFFF" : "#0E7A66"}
        />
      </Pressable>
    </View>
  );
}
