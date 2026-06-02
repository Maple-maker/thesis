import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { creditGuideById } from "@/data/credit/guides";

export default function CreditGuideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = id ? creditGuideById(id) : undefined;

  if (!guide) {
    return (
      <Screen padded>
        <Header back title="Guide not found" />
      </Screen>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-4">
          {guide.readMin} min read
        </Text>
        <Text className="text-ink font-displayX text-[28px] mt-1" style={{ letterSpacing: -0.5 }}>
          {guide.title}
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-3 leading-[22px]">{guide.summary}</Text>

        {guide.sections.map((s) => (
          <View key={s.heading} className="mt-6">
            <Text className="text-ink font-displayX text-[18px] mb-2">{s.heading}</Text>
            <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[22px]">{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
