import { Modal, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import type { EntityKind } from "@/lib/message-entities";
import { useStore } from "@/store";

type Props = {
  symbol: string | null;
  kind: EntityKind | null;
  visible: boolean;
  onClose: () => void;
  onView: (symbol: string, kind: EntityKind) => void;
  onDuel: (symbol: string) => void;
};

export function SymbolActionSheet({
  symbol,
  kind,
  visible,
  onClose,
  onView,
  onDuel,
}: Props) {
  const watchlist = useStore((s) => s.watchlist);
  const toggleWatchlist = useStore((s) => s.toggleWatchlist);

  if (!symbol || !kind || kind === "concept") return null;

  const sym = symbol.toUpperCase();
  const stock = stockBySymbol(sym);
  const etf = etfBySymbol(sym);
  const name = stock?.name ?? etf?.name ?? sym;
  const onWatchlist = watchlist.includes(sym);
  const blurb =
    stock?.thesis ??
    etf?.description ??
    "Tap below to open the full profile, add to your watchlist, or start a duel.";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-[#142F22]/30" style={{ justifyContent: "flex-end" }}>
        <Pressable onPress={() => {}}>
          <View className="bg-bg-surface rounded-t-[20px] px-5 pt-3 pb-8">
            <View className="items-center mb-3">
              <View className="w-9 h-1 rounded-full bg-line-strong" />
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider">
                  {kind === "etf" ? "ETF" : "Stock"}
                </Text>
                <Text className="text-ink font-monoBold text-[22px]">{sym}</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd" numberOfLines={2}>
                  {name}
                </Text>
              </View>
              <Pressable onPress={onClose} className="w-9 h-9 rounded-full bg-bg-surface2 items-center justify-center">
                <Icon name="close" size={16} color="#4D5A54" sw={2} />
              </Pressable>
            </View>

            <Text className="text-ink-2 text-[14px] font-sansMd leading-[21px] mb-4">{blurb}</Text>

            {etf && (
              <Text className="text-ink-3 text-[12px] font-sansMd mb-4">
                Expense ratio: {etf.expense}% · {etf.holdings.length} illustrative holdings
              </Text>
            )}

            <View className="gap-y-2">
              <Button label="View profile" fullWidth onPress={() => onView(sym, kind)} />
              <Button
                label={onWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                fullWidth
                variant="secondary"
                onPress={() => toggleWatchlist(sym)}
              />
              <Button
                label={`Duel with ${sym}`}
                fullWidth
                variant="secondary"
                onPress={() => onDuel(sym)}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
