import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchDuelSymbols } from "@/lib/duel-asset";

type Props = {
  visible: boolean;
  side: "a" | "b" | null;
  currentSymbol?: string;
  otherSymbol?: string;
  onClose: () => void;
  onSelect: (symbol: string) => void;
};

export function DuelSymbolSwapSheet({
  visible,
  side,
  currentSymbol,
  otherSymbol,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => searchDuelSymbols(query, 28), [query]);

  const title = side === "a" ? "Replace left symbol" : side === "b" ? "Replace right symbol" : "Pick symbol";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="bg-bg-surface rounded-t-[22px] border-t border-line max-h-[78%]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Text className="text-ink font-displayX text-[20px]">{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} className="active:opacity-70">
            <Text className="text-brand text-[14px] font-sansBold">Done</Text>
          </Pressable>
        </View>
        <Text className="text-ink-2 text-[13px] font-sansMd px-5 mb-3">
          Search any stock or ETF in our catalog. Tap a ticker to swap it in.
        </Text>
        <View className="mx-5 mb-3 bg-bg-surface2 border border-line rounded-[12px] px-3 py-2.5">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="VOO, NVDA, SMH…"
            placeholderTextColor="#8C988F"
            autoCapitalize="characters"
            autoFocus
            className="text-ink text-[16px] font-monoBold"
          />
        </View>
        <ScrollView
          className="px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          <View className="flex-row flex-wrap gap-2">
            {filtered.map((sym) => {
              const isCurrent = sym === currentSymbol;
              const isOther = sym === otherSymbol;
              const disabled = isOther;
              return (
                <Pressable
                  key={sym}
                  disabled={disabled}
                  onPress={() => {
                    if (!disabled) onSelect(sym);
                  }}
                  className={`px-3 py-2 rounded-full border ${
                    isCurrent
                      ? "bg-brand-bg border-brand"
                      : disabled
                        ? "bg-bg-surface2 border-line opacity-40"
                        : "bg-bg-surface border-line active:opacity-70"
                  }`}
                >
                  <Text
                    className={`font-monoBold text-[13px] ${
                      isCurrent ? "text-brand" : disabled ? "text-ink-3" : "text-ink"
                    }`}
                  >
                    {sym}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {filtered.length === 0 && (
            <Text className="text-ink-3 text-[13px] font-sansMd py-4 text-center">
              No matches, try a US ticker or ETF symbol.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
