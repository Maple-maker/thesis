import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { US_STATE_OPTIONS } from "@/data/us-states";

type Props = {
  value: string | undefined;
  onChange: (code: string) => void;
};

export function UsStatePicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return US_STATE_OPTIONS;
    return US_STATE_OPTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase() === q
    );
  }, [query]);

  return (
    <View>
      <View className="bg-bg-surface border border-line rounded-[14px] px-3 py-2.5 mb-2">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search state…"
          placeholderTextColor="#8C988F"
          autoCapitalize="words"
          autoCorrect={false}
          className="text-ink text-[15px] font-sansMd"
        />
      </View>
      <ScrollView
        style={{ maxHeight: 220 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View className="gap-y-1.5">
          {filtered.map((s) => {
            const on = value === s.value;
            return (
              <Pressable
                key={s.value}
                onPress={() => onChange(s.value)}
                className={`flex-row items-center px-3.5 py-3 rounded-[12px] border ${
                  on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                }`}
              >
                <Text
                  className={`font-monoBold text-[13px] w-8 ${on ? "text-brand" : "text-ink-3"}`}
                >
                  {s.value}
                </Text>
                <Text
                  className={`flex-1 text-[15px] ${on ? "text-ink font-sansBold" : "text-ink font-sansSb"}`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
