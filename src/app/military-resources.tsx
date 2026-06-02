import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { MilitaryResourcesSection } from "@/components/MilitaryResourcesSection";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { militaryStatusFromProfile, militaryStatusLabel } from "@/lib/military-profile";
import { useStore } from "@/store";

export default function MilitaryResourcesScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const status = militaryStatusFromProfile(profile);

  const isMilitary =
    status === "active" || status === "veteran" || status === "reserve";

  return (
    <Screen padded>
      <Header back onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest mt-2">
          Service member resources
        </Text>
        <Text
          className="text-ink font-displayX text-[28px] mt-1"
          style={{ letterSpacing: -0.5, lineHeight: 32 }}
        >
          Military money programs
        </Text>
        <Text className="text-ink-2 text-[14px] font-sansMd mt-3 leading-[21px]">
          Built for sharing with your unit during bootstrap, SCRA, TSP, SDP, combat-zone
          tax, and related official links.
        </Text>

        {isMilitary ? (
          <View className="mt-5">
            <MilitaryResourcesSection status={status} />
          </View>
        ) : (
          <View className="mt-6 rounded-[14px] border border-dashed border-line px-4 py-5">
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
              Set military status in the thesis builder (Your situation chapter) to unlock
              this list. Choose Active duty, Veteran, or Reserve / Guard.
            </Text>
          </View>
        )}

        {isMilitary && (
          <Text className="text-ink-3 text-[11px] font-sansMd mt-4 leading-[16px]">
            Showing resources for {militaryStatusLabel(status)}. Update status in Builder
            → Your investing profile if this changes.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
