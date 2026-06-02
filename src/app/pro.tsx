import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FREE_HIGHLIGHTS,
  PRO_HIGHLIGHTS,
  TIER_COPY,
} from "@/data/subscription-tiers";
import { isRevenueCatConfigured, purchaseProPackage, restorePurchases } from "@/lib/billing";
import { useStore } from "@/store";

export default function ProPaywall() {
  const router = useRouter();
  const tier = useStore((s) => s.subscriptionTier);
  const refreshSubscription = useStore((s) => s.refreshSubscription);
  const setDevPro = useStore((s) => s.setDevPro);
  const thesisUserId = useStore((s) => s.thesisUserId);
  const [loading, setLoading] = useState(false);

  const isPro = tier === "pro";

  const onPurchase = async () => {
    setLoading(true);
    try {
      if (!isRevenueCatConfigured()) {
        setDevPro(true);
        Alert.alert("Dev Pro enabled", "CFO dashboard, chat, and forecast are unlocked.");
        router.replace("/cfo" as any);
        return;
      }
      const t = await purchaseProPackage();
      useStore.setState({ subscriptionTier: t });
      Alert.alert("Welcome to Thesis Pro", "Your AI CFO is ready.");
      router.back();
    } catch (e) {
      Alert.alert("Purchase failed", String(e));
    } finally {
      setLoading(false);
    }
  };

  const onRestore = async () => {
    setLoading(true);
    try {
      const t = await restorePurchases();
      await refreshSubscription();
      Alert.alert(t === "pro" ? "Pro restored" : "No subscription found", "");
    } catch (e) {
      Alert.alert("Restore failed", String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="px-2.5 py-1 rounded-full bg-brand-bg">
          <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest">Pro</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-ink font-displayX text-[30px] mt-2" style={{ letterSpacing: -0.6 }}>
          {TIER_COPY.pro.name}
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-2 leading-[22px]">
          {TIER_COPY.pro.tagline}
        </Text>
        <Text className="text-brand font-sansBold text-[15px] mt-3">
          {TIER_COPY.pro.priceLabel} · {TIER_COPY.pro.trialLabel}
        </Text>

        {isPro ? (
          <Card pad={16} className="mt-6 border-brand/30 bg-brand-bg/30">
            <Text className="text-brand font-sansBold text-[14px]">You're on Thesis Pro</Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-2">
              AI CFO chat, deep profile, and advanced research are unlocked.
            </Text>
          </Card>
        ) : (
          <>
            <Text className="text-ink text-[16px] font-displayX mt-6 mb-3">Included with Pro</Text>
            {PRO_HIGHLIGHTS.map((h) => (
              <View key={h} className="flex-row mb-2.5">
                <Icon name="check" size={14} color="#0E7A66" sw={2.5} />
                <Text className="flex-1 text-ink text-[14px] font-sansMd ml-2 leading-[20px]">{h}</Text>
              </View>
            ))}
            <View className="mt-6">
              <Button
                label={loading ? "…" : "Start free trial"}
                fullWidth
                onPress={onPurchase}
                disabled={loading}
              />
            </View>
            <Pressable onPress={onRestore} className="mt-4 py-2 active:opacity-70">
              <Text className="text-ink-3 text-[13px] font-sansMd text-center">Restore purchases</Text>
            </Pressable>
          </>
        )}

        <Text className="text-ink text-[16px] font-displayX mt-8 mb-3">Always free</Text>
        {FREE_HIGHLIGHTS.map((h) => (
          <View key={h} className="flex-row mb-2">
            <Text className="text-ink-3 mr-2">·</Text>
            <Text className="flex-1 text-ink-2 text-[13px] font-sansMd leading-[19px]">{h}</Text>
          </View>
        ))}

        {!isRevenueCatConfigured() && (
          <Card pad={12} className="mt-6 bg-bg-surface2">
            <Text className="text-ink-3 text-[11px] font-sansMd leading-[16px]">
              Dev: RevenueCat not configured. "Start free trial" enables Pro locally. User ID for
              webhook testing: {thesisUserId}
            </Text>
          </Card>
        )}

        <Text className="text-ink-3 text-[11px] font-sansMd mt-6 text-center leading-[16px]">
          Subscriptions renew automatically. Cancel in App Store settings. Educational tool, not
          investment advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
