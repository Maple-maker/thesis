import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/Icon";
import { ConnectAccountsButton } from "@/components/plaid/ConnectAccountsButton";
import { Card } from "@/components/ui/Card";
import { computeNetWorth } from "@/data/demo-accounts";
import { assistantContextStatus } from "@/lib/assistant-context";
import { useStore, selectIsPro, selectPlaidConnected } from "@/store";

const MODULES: { route: string; title: string; subtitle: string; icon: IconName; pro?: boolean }[] = [
  { route: "/ask/chat", title: "AI CFO chat", subtitle: "Full reasoning with profile + accounts", icon: "sparkle", pro: true },
  { route: "/accounts", title: "Accounts", subtitle: "Cash, cards, investments in one place", icon: "grid" },
  { route: "/investments", title: "Investments", subtitle: "Holdings, weights, vs benchmarks", icon: "trend" },
  { route: "/advice", title: "Guidance", subtitle: "Profile-aware checklist and next steps", icon: "compass" },
  { route: "/forecast", title: "Forecast", subtitle: "Life events & net worth path", icon: "target", pro: true },
];

export default function CfoHub() {
  const router = useRouter();
  const isPro = useStore(selectIsPro);
  const connected = useStore(selectPlaidConnected);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const accounts = useStore((s) => s.linkedAccounts);
  const holdings = useStore((s) => s.holdings);
  const memory = useStore((s) => s.assistantMemory);
  const completedLessons = useStore((s) => s.completedLessons);
  const watchlist = useStore((s) => s.watchlist);
  const plaidStatus = useStore((s) => s.plaidStatus);

  const nw = connected ? computeNetWorth(accounts) : null;

  if (!isPro) {
    router.replace("/pro");
    return null;
  }

  const status = assistantContextStatus({
    profile,
    themeIds,
    completedLessons,
    watchlist,
    memoryNotes: memory,
    plaidStatus,
    linkedAccounts: accounts,
    holdings,
  });

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">Thesis Pro</Text>
          <Text className="text-ink font-displayX text-[26px]">CFO Dashboard</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        {connected && nw ? (
          <Card pad={16} className="mb-4 border-brand/25">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">Net worth</Text>
            <Text className="text-ink font-monoBold text-[28px] mt-1">
              ${nw.netWorth.toLocaleString()}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1">
              Assets ${nw.assets.toLocaleString()} · Liabilities ${nw.liabilities.toLocaleString()}
            </Text>
          </Card>
        ) : (
          <Card pad={16} className="mb-4">
            <Text className="text-ink font-sansBold text-[15px] mb-2">Connect your finances</Text>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-4">
              Link accounts via Plaid (production) or load demo data to preview Monarch-style accounts,
              holdings, and guidance.
            </Text>
            <ConnectAccountsButton label="Connect demo accounts" />
          </Card>
        )}

        <Text className="text-ink-3 text-[12px] font-sansMd mb-4">{status}</Text>

        <View className="gap-y-2">
          {MODULES.map((m) => (
            <Pressable
              key={m.route}
              onPress={() => router.push(m.route as any)}
              className="active:opacity-70"
            >
              <Card pad={14}>
                <View className="flex-row items-center">
                  <View className="w-[40px] h-[40px] rounded-[12px] bg-brand-bg items-center justify-center mr-3">
                    <Icon name={m.icon} size={20} color="#0E7A66" sw={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink font-sansBold text-[15px]">{m.title}</Text>
                    <Text className="text-ink-2 text-[12.5px] font-sansMd mt-0.5">{m.subtitle}</Text>
                  </View>
                  <Icon name="chev" size={16} color="#8C988F" sw={2} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
