import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { ConnectAccountsButton } from "@/components/plaid/ConnectAccountsButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { computeNetWorth } from "@/data/demo-accounts";
import { useStore, selectIsPro, selectPlaidConnected } from "@/store";

/** Home entry to link accounts, primary path into Pro CFO. */
export function ConnectAccountsCard() {
  const router = useRouter();
  const isPro = useStore(selectIsPro);
  const connected = useStore(selectPlaidConnected);
  const accounts = useStore((s) => s.linkedAccounts);

  const nw = connected ? computeNetWorth(accounts) : null;

  if (connected && nw) {
    return (
      <Pressable onPress={() => router.push("/accounts" as any)} className="mb-4 active:opacity-70">
        <Card pad={16} className="border-brand/25 bg-brand-bg/25">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest">
                Accounts linked
              </Text>
              <Text className="text-ink font-monoBold text-[22px] mt-1">
                ${nw.netWorth.toLocaleString()}
              </Text>
              <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5">Net worth · tap to review</Text>
            </View>
            <Icon name="chev" size={18} color="#0E7A66" sw={2} />
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Card pad={16} className="mb-4 border-brand/30">
      <View className="flex-row items-start mb-3">
        <View className="w-[44px] h-[44px] rounded-[14px] bg-brand items-center justify-center mr-3">
          <Icon name="grid" size={22} color="#FFFFFF" sw={2} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-ink font-displayX text-[17px] mr-2">Connect accounts</Text>
            {!isPro && <Tag label="Pro" tone="violet" />}
          </View>
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
            Link cash, cards, and investments so your AI CFO answers from real balances, not
            generic templates.
          </Text>
        </View>
      </View>

      {isPro ? (
        <>
          <ConnectAccountsButton label="Connect demo accounts" />
          <Pressable onPress={() => router.push("/cfo" as any)} className="mt-3 active:opacity-70">
            <Text className="text-brand text-[13px] font-sansBold text-center">Open CFO dashboard →</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Button
            label="Unlock Pro + connect"
            fullWidth
            variant="primary"
            onPress={() => router.push("/pro" as any)}
          />
          <Pressable onPress={() => router.push("/accounts" as any)} className="mt-3 active:opacity-70">
            <Text className="text-ink-3 text-[12px] font-sansMd text-center">
              Preview accounts screen
            </Text>
          </Pressable>
        </>
      )}
    </Card>
  );
}
