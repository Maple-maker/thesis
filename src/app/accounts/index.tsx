import { useRouter, useSegments } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { ConnectAccountsButton } from "@/components/plaid/ConnectAccountsButton";
import { Card } from "@/components/ui/Card";
import { Bar } from "@/components/ui/Progress";
import { computeNetWorth } from "@/data/demo-accounts";
import type { AccountType, LinkedAccount } from "@/types/linked-accounts";
import { useStore, selectPlaidConnected } from "@/store";

const GROUP_LABELS: Record<AccountType, string> = {
  depository: "Cash",
  credit: "Credit Cards",
  investment: "Investments",
  loan: "Loans",
  other: "Other",
};

function formatBalance(n: number) {
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${abs}` : `$${abs}`;
}

function AccountRow({ account }: { account: LinkedAccount }) {
  return (
    <View className="flex-row items-center py-3.5 border-b border-line">
      <View className="w-[36px] h-[36px] rounded-[10px] bg-bg-surface2 items-center justify-center mr-3">
        <Icon
          name={account.type === "investment" ? "trend" : account.type === "credit" ? "shield" : "seed"}
          size={18}
          color="#0E7A66"
          sw={2}
        />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-sansBold text-[14px]">{account.name}</Text>
        <Text className="text-ink-3 text-[11.5px] font-sansMd">
          {account.institution} ··· {account.mask} · {account.subtype}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-ink font-monoSb text-[14px]">{formatBalance(account.balance)}</Text>
        {account.changePct1m != null && (
          <Text
            className={`text-[11px] font-sansMd mt-0.5 ${
              account.changePct1m >= 0 ? "text-pos" : "text-neg"
            }`}
          >
            {account.changePct1m >= 0 ? "+" : ""}
            {account.changePct1m}% 1mo
          </Text>
        )}
      </View>
    </View>
  );
}

export default function AccountsScreen() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const isAccountsTab = segments[0] === "(tabs)" && segments[1] === "accounts";
  const connected = useStore(selectPlaidConnected);
  const accounts = useStore((s) => s.linkedAccounts);
  const disconnect = useStore((s) => s.disconnectAccounts);

  const grouped = useMemo(() => {
    const g: Partial<Record<AccountType, LinkedAccount[]>> = {};
    for (const a of accounts) {
      (g[a.type] ??= []).push(a);
    }
    return g;
  }, [accounts]);

  const nw = connected ? computeNetWorth(accounts) : null;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        {isAccountsTab ? (
          <View className="w-[36px]" />
        ) : (
          <Pressable onPress={() => router.back()} className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center active:opacity-70">
            <Icon name="back" size={16} color="#16201C" sw={2} />
          </Pressable>
        )}
        <Text className="text-ink font-displayX text-[24px]">Accounts</Text>
        <View className="w-[36px]" />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        {!connected ? (
          <Card pad={16} className="mt-2">
            <Text className="text-ink-2 text-[14px] font-sansMd mb-4">
              See all balances in one place, like Monarch's Accounts tab.
            </Text>
            <ConnectAccountsButton />
          </Card>
        ) : (
          <>
            {nw && (
              <Card pad={16} className="mb-4 mt-2">
                <Text className="text-ink font-sansBold text-[14px] mb-3">Assets vs liabilities</Text>
                <Text className="text-ink-3 text-[11px] font-sansMd mb-1">Assets ${nw.assets.toLocaleString()}</Text>
                <Bar pct={1} height={6} color="brand" />
                <Text className="text-ink-3 text-[11px] font-sansMd mt-3 mb-1">
                  Liabilities ${nw.liabilities.toLocaleString()}
                </Text>
                <Bar pct={nw.assets > 0 ? nw.liabilities / nw.assets : 0} height={6} color="neg" />
              </Card>
            )}

            {(Object.keys(grouped) as AccountType[]).map((type) => {
              const list = grouped[type];
              if (!list?.length) return null;
              const total = list.reduce((s, a) => s + a.balance, 0);
              return (
                <View key={type} className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-ink font-displayX text-[17px]">{GROUP_LABELS[type]}</Text>
                    <Text className="text-ink-2 font-monoSb text-[14px]">{formatBalance(total)}</Text>
                  </View>
                  <Card pad={0} className="px-4">
                    {list.map((a) => (
                      <AccountRow key={a.id} account={a} />
                    ))}
                  </Card>
                </View>
              );
            })}

            <Pressable onPress={disconnect} className="py-3 active:opacity-70">
              <Text className="text-neg text-[13px] font-sansBold text-center">Disconnect accounts</Text>
            </Pressable>
          </>
        )}
        <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-6 px-4">
          Educational tool, not investment advice. Nothing here is a recommendation to buy or sell any security.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
