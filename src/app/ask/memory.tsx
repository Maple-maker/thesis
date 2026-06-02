import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/store";

export default function CfoMemoryScreen() {
  const router = useRouter();
  const memory = useStore((s) => s.assistantMemory);
  const addNote = useStore((s) => s.addAssistantMemoryNote);
  const removeNote = useStore((s) => s.removeAssistantMemoryNote);
  const [draft, setDraft] = useState("");

  const sorted = [...memory].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-line bg-bg-surface">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1 ml-3">
          <Text className="text-ink font-displayX text-[20px]">CFO memory</Text>
          <Text className="text-ink-3 text-[11px] font-sansMd">
            {memory.length} facts · grows automatically when you chat
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Card pad={14} className="mb-4">
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[20px]">
            Memory is not model training, it is a personal fact bank injected into every answer.
            Thesis learns from what you say (and optional manual notes below). Duplicates are merged;
            oldest low-priority notes drop off after {160} entries.
          </Text>
        </Card>

        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Add a fact manually
        </Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="e.g. RSUs vest quarterly; max 15% in single stocks"
          placeholderTextColor="#8C988F"
          multiline
          className="bg-bg-surface border border-line rounded-[12px] px-3 py-3 text-ink text-[14px] font-sansMd min-h-[72px] mb-2"
        />
        <Pressable
          onPress={() => {
            const t = draft.trim();
            if (t.length < 8) return;
            addNote(t, "user");
            setDraft("");
          }}
          className="self-start px-4 py-2 rounded-full bg-brand mb-6 active:opacity-80"
        >
          <Text className="text-white text-[13px] font-sansSb">Save note</Text>
        </Pressable>

        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Stored facts
        </Text>
        {sorted.length === 0 ? (
          <Text className="text-ink-2 text-[13px] font-sansMd">Chat with the CFO to start building memory.</Text>
        ) : (
          sorted.map((n) => (
            <Pressable
              key={n.id}
              onLongPress={() =>
                Alert.alert("Remove this memory?", n.text.slice(0, 120), [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => removeNote(n.id) },
                ])
              }
              className="mb-2 active:opacity-80"
            >
              <Card pad={12}>
                <Text className="text-ink text-[13px] font-sansMd leading-[19px]">{n.text}</Text>
                <Text className="text-ink-3 text-[10px] font-sansMd mt-2">
                  {n.category ?? "other"} · {n.source} · importance {n.importance ?? "-"}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
        <Text className="text-ink-3 text-[11px] font-sansMd mt-4 text-center">
          Long-press a note to delete
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
