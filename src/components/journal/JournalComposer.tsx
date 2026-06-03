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
import { useStore } from "@/store";
import type { EmotionalState, JournalEntryType } from "@/store/types";

// ── Constants ─────────────────────────────────────────────────────────────

const ENTRY_TYPES: { value: JournalEntryType; label: string }[] = [
  { value: "duel", label: "Duel" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "thesis-change", label: "Thesis" },
  { value: "general", label: "General" },
];

const EMOTIONAL_STATES: { value: EmotionalState; emoji: string; label: string }[] = [
  { value: "confident", emoji: "😎", label: "Confident" },
  { value: "uncertain", emoji: "🤔", label: "Uncertain" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "excited", emoji: "🤩", label: "Excited" },
];

const PLACEHOLDER = "What were you thinking? What did you learn?";

// ── Props ─────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────

export function JournalComposer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const addJournalEntry = useStore((s) => s.addJournalEntry);
  const watchlist = useStore((s) => s.watchlist);

  const [entryType, setEntryType] = useState<JournalEntryType>("general");
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [symbolQuery, setSymbolQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [freeformNote, setFreeformNote] = useState("");

  // Prefer watchlist symbols; fall back to catalog search
  const searchResults = useMemo(() => {
    if (!symbolQuery.trim()) return watchlist.slice(0, 20);
    return searchDuelSymbols(symbolQuery, 28);
  }, [symbolQuery, watchlist]);

  const canSave = entryType === "general" || selectedSymbol != null || freeformNote.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;

    addJournalEntry({
      type: entryType,
      winner: selectedSymbol ?? undefined,
      emotionalState: emotionalState ?? undefined,
      freeformNote: freeformNote.trim() || undefined,
    });

    // Reset state
    setEntryType("general");
    setEmotionalState(null);
    setSymbolQuery("");
    setSelectedSymbol(null);
    setFreeformNote("");
    onClose();
  };

  const handleClose = () => {
    setEntryType("general");
    setEmotionalState(null);
    setSymbolQuery("");
    setSelectedSymbol(null);
    setFreeformNote("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/40" onPress={handleClose} />
      <View
        className="bg-bg-surface rounded-t-[22px] border-t border-line max-h-[85%]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* ── Handle bar + header ── */}
        <View className="items-center pt-2 pb-1">
          <View className="w-[36px] h-[5px] rounded-full bg-line-strong mb-2" />
        </View>
        <View className="flex-row items-center justify-between px-5 pb-3">
          <Pressable onPress={handleClose} hitSlop={12} className="active:opacity-70">
            <Text className="text-ink-2 text-[14px] font-sansSb">Cancel</Text>
          </Pressable>
          <Text className="text-ink font-displayX text-[20px]">New entry</Text>
          <Pressable
            onPress={handleSave}
            hitSlop={12}
            className="active:opacity-70"
            disabled={!canSave}
          >
            <Text
              className={`text-[14px] font-sansBold ${
                canSave ? "text-brand" : "text-ink-3"
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="px-5"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* ── Entry type picker ── */}
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {ENTRY_TYPES.map((t) => {
              const active = entryType === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => setEntryType(t.value)}
                  className={`px-3.5 py-2 rounded-full border ${
                    active
                      ? "bg-brand-bg border-brand"
                      : "bg-bg-surface2 border-line"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-sansSb ${
                      active ? "text-brand" : "text-ink-2"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Symbol selector (hidden for general) ── */}
          {entryType !== "general" && (
            <>
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
                Symbol {entryType === "duel" ? "(optional)" : ""}
              </Text>
              <View className="bg-bg-surface2 border border-line rounded-[12px] px-3 py-2.5 mb-2">
                <TextInput
                  value={symbolQuery}
                  onChangeText={setSymbolQuery}
                  placeholder="Search ticker…"
                  placeholderTextColor="#8C988F"
                  autoCapitalize="characters"
                  className="text-ink text-[15px] font-monoBold"
                />
              </View>
              <View className="flex-row flex-wrap gap-1.5 mb-5 min-h-[44px]">
                {searchResults.slice(0, 16).map((sym) => {
                  const isSelected = selectedSymbol === sym;
                  return (
                    <Pressable
                      key={sym}
                      onPress={() => {
                        setSelectedSymbol(isSelected ? null : sym);
                        setSymbolQuery("");
                      }}
                      className={`px-2.5 py-1.5 rounded-[8px] border ${
                        isSelected
                          ? "bg-brand-bg border-brand"
                          : "bg-bg-surface border-line active:opacity-60"
                      }`}
                    >
                      <Text
                        className={`font-monoBold text-[12px] ${
                          isSelected ? "text-brand" : "text-ink"
                        }`}
                      >
                        {sym}
                      </Text>
                    </Pressable>
                  );
                })}
                {symbolQuery.trim() && searchResults.length === 0 && (
                  <Text className="text-ink-3 text-[12px] font-sansMd py-1">
                    No matches, try a different ticker.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ── Emotional state picker ── */}
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            How are you feeling?
          </Text>
          <View className="flex-row gap-2 mb-5">
            {EMOTIONAL_STATES.map((e) => {
              const active = emotionalState === e.value;
              return (
                <Pressable
                  key={e.value}
                  onPress={() =>
                    setEmotionalState(active ? null : e.value)
                  }
                  className={`flex-1 items-center py-2.5 rounded-[12px] border ${
                    active
                      ? "bg-brand-bg border-brand"
                      : "bg-bg-surface2 border-line"
                  }`}
                >
                  <Text className="text-[22px] mb-0.5">{e.emoji}</Text>
                  <Text
                    className={`text-[10px] font-sansSb ${
                      active ? "text-brand" : "text-ink-3"
                    }`}
                  >
                    {e.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Free-form note input ── */}
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Notes
          </Text>
          <View className="bg-bg-surface2 border border-line rounded-[14px] px-3.5 py-3 mb-3 min-h-[120px]">
            <TextInput
              value={freeformNote}
              onChangeText={setFreeformNote}
              placeholder={PLACEHOLDER}
              placeholderTextColor="#8C988F"
              multiline
              textAlignVertical="top"
              className="text-ink text-[14px] font-sansMd leading-[21px] min-h-[100px]"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
