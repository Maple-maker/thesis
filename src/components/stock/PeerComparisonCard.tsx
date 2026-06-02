import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { STOCKS, stockBySymbol } from "@/data/stocks";

type Props = {
  ticker: string;
};

export function PeerComparisonCard({ ticker }: Props) {
  const router = useRouter();
  const sym = ticker.trim().toUpperCase();
  const stock = stockBySymbol(sym);
  if (!stock) return null;

  const themeId = stock.themes[0];
  const peers = STOCKS.filter(
    (s) =>
      s.symbol !== sym &&
      (themeId ? s.themes.includes(themeId) : s.sector === stock.sector)
  ).slice(0, 4);

  if (peers.length === 0) return null;

  return (
    <View className="mb-6">
      <SectionTitle>Compare peers</SectionTitle>
      <Card pad={0} className="overflow-hidden">
        {peers.map((peer, idx) => (
          <Pressable
            key={peer.symbol}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/stock/[symbol]",
                params: { symbol: peer.symbol },
              })
            }
            className={`flex-row items-center px-4 py-3 active:opacity-70 ${
              idx < peers.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <View className="flex-1">
              <Text className="text-ink text-[15px] font-sansBold">{peer.symbol}</Text>
              <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5" numberOfLines={1}>
                {peer.name}
              </Text>
            </View>
            {peer.peRatio != null && (
              <Text className="text-ink-3 text-[12px] font-monoBold mr-2">
                P/E {peer.peRatio}
              </Text>
            )}
            <Text className="text-brand text-[13px] font-sansBold">View</Text>
          </Pressable>
        ))}
      </Card>
      <Text className="text-ink-3 text-[10px] font-sansMd mt-2">
        Same theme or sector · educational comparison, not a recommendation
      </Text>
    </View>
  );
}
