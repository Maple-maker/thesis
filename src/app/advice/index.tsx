import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { adviceForUser, ADVICE_CATEGORIES, type AdviceCategory } from "@/lib/advice-engine";
import { useStore } from "@/store";

const PILLAR: Record<
  string,
  { color: string; bg: string; icon: IconName }
> = {
  Setup: { color: "#3B82F6", bg: "rgba(59,130,246,.10)", icon: "grid" },
  "Save up": { color: "#0E7A66", bg: "rgba(14,122,102,.10)", icon: "piggy" },
  Spend: { color: "#D98512", bg: "rgba(217,133,18,.10)", icon: "book" },
  "Pay down": { color: "#C43B3B", bg: "rgba(196,59,59,.10)", icon: "shield" },
  Invest: { color: "#7C3AED", bg: "rgba(124,58,237,.10)", icon: "trend" },
  Protect: { color: "#8C988F", bg: "rgba(140,152,143,.10)", icon: "lock" },
};

export default function GuidanceScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const plaidStatus = useStore((s) => s.plaidStatus);
  const accounts = useStore((s) => s.linkedAccounts);
  const [cat, setCat] = useState<AdviceCategory | "all">("all");

  const items = useMemo(
    () => adviceForUser(profile, plaidStatus, accounts),
    [profile, plaidStatus, accounts]
  );

  const filtered =
    cat === "all" ? items : items.filter((i) => i.category === cat);
  const prioritized = filtered.filter((i) => i.prioritized);
  const rest = filtered.filter((i) => !i.prioritized);
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#F3F5F1" }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            CFO toolkit
          </Text>
          <Text className="text-ink font-displayX text-[24px]">Guidance</Text>
        </View>
      </View>

      {/* Progress summary */}
      <View className="px-5 mb-4">
        <Card pad={14} className="border-brand/20 bg-brand-bg/15">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
                Your checklist
              </Text>
              <Text className="text-ink font-sansBold text-[15px] mt-1">
                {doneCount} of {items.length} done
              </Text>
            </View>
            <View
              className="w-[48px] h-[48px] rounded-full border-[3px] border-brand/20 items-center justify-center"
            >
              <Text className="text-brand font-monoBold text-[16px]">
                {items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0}%
              </Text>
            </View>
          </View>
          {/* Mini progress bar */}
          <View className="mt-3 h-[4px] rounded-full bg-line overflow-hidden">
            <View
              className="h-full rounded-full bg-brand"
              style={{
                width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%`,
              }}
            />
          </View>
        </Card>
      </View>

      {/* Category filter chips */}
      <View className="flex-row flex-wrap px-5 mb-3 gap-1.5">
        <Pressable
          onPress={() => setCat("all")}
          className={`px-3 py-1.5 rounded-lg border ${
            cat === "all"
              ? "bg-brand border-brand"
              : "border-line bg-bg-surface"
          }`}
        >
          <Text
            className={`text-[11px] font-sansBold ${
              cat === "all" ? "text-white" : "text-ink-2"
            }`}
          >
            All · {items.length}
          </Text>
        </Pressable>
        {ADVICE_CATEGORIES.map((c) => {
          const p = PILLAR[c.label] ?? PILLAR.Setup;
          const catCount = items.filter((i) => i.category === c.id).length;
          if (catCount === 0) return null;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCat(c.id)}
              className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
                cat === c.id
                  ? "border-brand bg-brand-bg"
                  : "border-line bg-bg-surface"
              }`}
            >
              <Icon
                name={p.icon}
                size={11}
                color={cat === c.id ? "#0E7A66" : p.color}
                sw={2}
              />
              <Text
                className={`text-[11px] font-sansBold ml-1 ${
                  cat === c.id ? "text-brand" : "text-ink-2"
                }`}
              >
                {c.label} · {catCount}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Guidance cards */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {prioritized.length > 0 && (
          <>
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
              Prioritized for you
            </Text>
            {prioritized.map((item) => (
              <GuidanceCard key={item.id} item={item} onLinkAccounts={() => router.push("/accounts" as any)} />
            ))}
          </>
        )}

        {rest.length > 0 && (
          <>
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-4 mb-2">
              {prioritized.length > 0 ? "Also on your list" : "Your checklist"}
            </Text>
            {rest.map((item) => (
              <GuidanceCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GuidanceCard({
  item,
  onLinkAccounts,
}: {
  item: ReturnType<typeof adviceForUser>[0];
  onLinkAccounts?: () => void;
}) {
  const p = PILLAR[item.pillar] ?? PILLAR.Setup;
  const statusDot =
    item.status === "done"
      ? "bg-brand"
      : item.status === "in-progress"
        ? "bg-amber"
        : "bg-ink-3";

  return (
    <Card pad={14} className="mb-2.5">
      <View className="flex-row">
        {/* Pillar icon */}
        <View
          className="w-[42px] h-[42px] rounded-[12px] items-center justify-center mr-3"
          style={{ backgroundColor: p.bg }}
        >
          <Icon name={p.icon} size={20} color={p.color} sw={2} />
        </View>

        <View className="flex-1 min-w-0">
          {/* Title row with status dot */}
          <View className="flex-row items-center">
            <View className={`w-[7px] h-[7px] rounded-full ${statusDot} mr-2`} />
            <Text className="text-ink font-sansBold text-[15px] flex-1">
              {item.title}
            </Text>
          </View>

          <Text className="text-ink-2 text-[13px] font-sansMd mt-1.5 leading-[19px]">
            {item.description}
          </Text>

          {/* Footer */}
          <View className="flex-row items-center mt-2.5">
            <Text className="text-ink-3 text-[11px] font-sansMd">
              {item.status === "done"
                ? "Complete"
                : item.status === "in-progress"
                  ? "In progress"
                  : "Not started"}{" "}
              · {item.tasksRemaining} step{item.tasksRemaining !== 1 ? "s" : ""}
            </Text>
            {item.id === "link-accounts" && onLinkAccounts && (
              <Pressable onPress={onLinkAccounts} className="ml-3 active:opacity-70">
                <Text className="text-brand text-[12px] font-sansBold">
                  Link accounts →
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}
