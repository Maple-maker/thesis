import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";

/** Shown to free users in place of the Advisor chat. */
export function ProGateCard() {
  const router = useRouter();
  return (
    <View className="bg-bg-surface rounded-[20px] border border-line p-5 mx-4 mt-10">
      <View className="bg-brand-bg w-10 h-10 rounded-[12px] items-center justify-center mb-4">
        <Icon name="sparkle" size={20} color="#0E7A66" sw={2} />
      </View>
      <Text
        className="text-ink font-displayX text-[24px]"
        style={{ letterSpacing: -0.5, lineHeight: 28 }}
      >
        Ask anything about your thesis
      </Text>
      <Text className="text-ink-2 font-sansMd text-[14px] mt-2 leading-[20px]">
        The Thesis Advisor is profile-aware — it knows your themes, your
        journal, and your portfolio reasons. It teaches; it never tells you
        what to trade.
      </Text>
      <View className="mt-5">
        <Button
          label="Unlock with Pro"
          size="lg"
          fullWidth
          onPress={() => router.push("/pro" as never)}
        />
      </View>
      <Text className="text-ink-3 text-[12px] text-center mt-3">
        Educational only · not investment advice
      </Text>
    </View>
  );
}
