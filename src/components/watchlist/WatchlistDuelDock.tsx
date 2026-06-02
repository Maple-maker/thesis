import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";

type Props = {
  duelableSyms: string[];
  pick: string[];
  pickMode: boolean;
  onTogglePick: (sym: string) => void;
  onSetPickMode: (active: boolean) => void;
  onLaunch: (a: string, b: string) => void;
};

export function WatchlistDuelDock({
  duelableSyms,
  pick,
  pickMode,
  onTogglePick,
  onSetPickMode,
  onLaunch,
}: Props) {
  const ready = pick.length === 2;
  const active = pickMode || pick.length > 0 || duelableSyms.length <= 4;

  const slot = (label: string, sym: string | undefined) => (
    <Pressable
      onPress={() => {
        if (sym) onTogglePick(sym);
      }}
      className={`flex-1 rounded-[12px] border px-3 py-2.5 ${
        sym ? "bg-brand-bg border-brand" : "bg-bg-surface border-line border-dashed"
      }`}
    >
      <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">{label}</Text>
      <Text className={`font-monoBold text-[15px] mt-0.5 ${sym ? "text-brand" : "text-ink-3"}`}>
        {sym ?? "Pick below"}
      </Text>
    </Pressable>
  );

  return (
    <View
      className="absolute left-0 right-0 bottom-0 border-t border-line bg-bg-surface/98 px-4 pt-3"
      style={{
        shadowColor: "#142F22",
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
        paddingBottom: 12,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Icon name="compare" size={16} color="#0E7A66" sw={2.2} />
          <Text className="text-ink font-sansBold text-[13px] ml-2">Duel</Text>
        </View>
        {(pick.length > 0 || pickMode) && (
          <Pressable
            onPress={() => onSetPickMode(false)}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Text className="text-ink-3 text-[12px] font-sansBold">Clear</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row gap-2 mb-2.5">
        {slot("Side A", pick[0])}
        {slot("Side B", pick[1])}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        className="mb-2.5"
      >
        {duelableSyms.map((sym) => {
          const selected = pick.includes(sym);
          return (
            <Pressable
              key={sym}
              onPress={() => {
                Haptics.selectionAsync();
                if (!pickMode && pick.length === 0) onSetPickMode(true);
                onTogglePick(sym);
              }}
              className={`px-3.5 py-2 rounded-[10px] border ${
                selected ? "bg-brand border-brand" : "bg-bg-surface2 border-line"
              }`}
            >
              <Text
                className={`font-monoBold text-[14px] ${
                  selected ? "text-white" : "text-ink"
                }`}
              >
                {sym}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text className="text-ink-3 text-[10px] font-sansMd mb-2 leading-[14px]">
        {duelableSyms.length <= 2
          ? "Tap Duel, or pick from chips above."
          : active
            ? "Pick two tickers here, no need to scroll your list."
            : "Tap a chip or Duel on a row below."}
      </Text>

      <Button
        label={
          ready
            ? `Duel ${pick[0]} vs ${pick[1]}`
            : duelableSyms.length === 2
              ? `Duel ${duelableSyms[0]} vs ${duelableSyms[1]}`
              : `Select ${Math.max(0, 2 - pick.length)} more`
        }
        fullWidth
        size="lg"
        disabled={!ready && duelableSyms.length > 2}
        onPress={() => {
          if (ready) {
            onLaunch(pick[0], pick[1]);
            return;
          }
          if (duelableSyms.length === 2) {
            onLaunch(duelableSyms[0], duelableSyms[1]);
          }
        }}
      />
    </View>
  );
}
