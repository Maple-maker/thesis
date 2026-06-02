import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { decisionFrameworkChecks } from "@/lib/decision-framework";
import type { CfoProfile } from "@/types/cfo-profile";

export function DecisionFrameworkCard({ profile }: { profile: CfoProfile }) {
  const router = useRouter();
  const checks = decisionFrameworkChecks(profile);

  return (
    <Card pad={16} className="mb-4">
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
        Before you size anything
      </Text>
      {checks.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => c.route && router.push(c.route as never)}
          className="flex-row items-center py-2.5 border-b border-line last:border-b-0 active:opacity-70"
        >
          <View
            className={`w-6 h-6 rounded-full items-center justify-center mr-2.5 ${
              c.ok ? "bg-pos-bg" : "bg-amber-bg"
            }`}
          >
            <Icon name={c.ok ? "check" : "shield"} size={12} color={c.ok ? "#0E7A66" : "#D98512"} sw={2.5} />
          </View>
          <View className="flex-1">
            <Text className="text-ink text-[13px] font-sansBold">{c.label}</Text>
            <Text className="text-ink-3 text-[11px] font-sansMd">{c.hint}</Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}
