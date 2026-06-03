import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { useStore } from "@/store";

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const subscriptionTier = useStore((s) => s.subscriptionTier);
  const hardReset = useStore((s) => s.hardReset);
  const fullName = profile.extended.identity?.fullName;

  const handleReset = () => {
    Alert.alert(
      "Reset everything?",
      "This will clear your profile, themes, watchlist, journal, and chat history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            hardReset();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2 border-b border-line bg-bg-surface">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface2 items-center justify-center active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[17px]">Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <View className="px-4 pt-6">
        {/* Profile */}
        <View className="mb-6">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Profile
          </Text>
          <View className="bg-bg-surface rounded-[14px] border border-line overflow-hidden">
            <View className="px-4 py-3.5 border-b border-line flex-row justify-between items-center">
              <Text className="text-ink font-sansSb text-[15px]">Name</Text>
              <Text className="text-ink-2 font-sansMd text-[15px]">
                {fullName || "Not set"}
              </Text>
            </View>
            <View className="px-4 py-3.5 flex-row justify-between items-center">
              <Text className="text-ink font-sansSb text-[15px]">Subscription</Text>
              <Text className="text-ink-2 font-sansMd text-[15px] capitalize">
                {subscriptionTier}
              </Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <View className="mb-6">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Account
          </Text>
          <View className="bg-bg-surface rounded-[14px] border border-line overflow-hidden">
            <Pressable
              onPress={() => router.push("/thesis-profile" as any)}
              className="px-4 py-3.5 border-b border-line flex-row justify-between items-center active:opacity-70"
            >
              <Text className="text-ink font-sansSb text-[15px]">Your CFO profile</Text>
              <Icon name="chev" size={14} color="#8C988F" sw={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/feedback" as any)}
              className="px-4 py-3.5 border-b border-line flex-row justify-between items-center active:opacity-70"
            >
              <Text className="text-ink font-sansSb text-[15px]">Send feedback</Text>
              <Icon name="chev" size={14} color="#8C988F" sw={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/support" as any)}
              className="px-4 py-3.5 flex-row justify-between items-center active:opacity-70"
            >
              <Text className="text-ink font-sansSb text-[15px]">Support & legal</Text>
              <Icon name="chev" size={14} color="#8C988F" sw={2} />
            </Pressable>
          </View>
        </View>

        {/* Danger zone */}
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
            Data
          </Text>
          <Pressable
            onPress={handleReset}
            className="bg-bg-surface rounded-[14px] border border-line px-4 py-3.5 active:opacity-70"
          >
            <Text className="text-neg font-sansSb text-[15px]">Reset all data & restart onboarding</Text>
            <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">
              Clears profile, themes, watchlist, journal, and chat
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
