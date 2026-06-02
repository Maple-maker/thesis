import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { DEMO_BENCHMARKS } from "@/data/demo-accounts";
import {
  DEMO_PERFORMANCE_SERIES,
  DEMO_PERFORMANCE_X_LABELS,
} from "@/data/demo-performance";
import { useStore, selectPlaidConnected } from "@/store";

function MiniSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (
    <View className="flex-row items-end h-[24px] gap-[2px]">
      {values.map((v, i) => {
        const h = 8 + ((v - min) / range) * 16;
        return (
          <View
            key={i}
            className="w-[3px] rounded-[1px] bg-brand/60"
            style={{ height: h }}
          />
        );
      })}
    </View>
  );
}

export default function InvestmentsScreen() {
  const router = useRouter();
  const connected = useStore(selectPlaidConnected);
  const holdings = useStore((s) => s.holdings);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable onPress={() => router.back()} className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70">
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[24px]">Investments</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 48 }}>
        <Text className="text-ink text-[16px] font-displayX mt-2 mb-3">Backtested performance</Text>
        <Text className="text-ink-3 text-[12px] font-sansMd mb-3">3 months · illustrative</Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {DEMO_BENCHMARKS.map((b) => (
            <Card key={b.id} pad={12} className="min-w-[46%] flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-[8px] h-[8px] rounded-full mr-2" style={{ backgroundColor: b.color }} />
                <Text className="text-ink-3 text-[10px] font-sansMd">{b.label}</Text>
              </View>
              <Text className={`font-monoBold text-[18px] ${b.changePct3m >= 0 ? "text-pos" : "text-neg"}`}>
                {b.changePct3m >= 0 ? "+" : ""}
                {b.changePct3m}%
              </Text>
              <Text className="text-ink-3 text-[10px] font-sansMd">Today {b.changePctToday >= 0 ? "+" : ""}{b.changePctToday}%</Text>
            </Card>
          ))}
        </View>

        <Card pad={16} className="mb-6 bg-brand-bg/20">
          <PerformanceChart
            series={DEMO_PERFORMANCE_SERIES}
            xLabels={DEMO_PERFORMANCE_X_LABELS}
          />
          {!connected ? (
            <Text className="text-ink-3 text-[11px] font-sansMd text-center mt-3">
              Illustrative backtest, connect accounts for holdings weights.
            </Text>
          ) : null}
        </Card>

        <Pressable onPress={() => router.push("/xray" as any)} className="mb-6 active:opacity-85">
          <Card pad={16} className="border-brand/30 bg-brand-bg/25">
            <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest">
              Portfolio X-Ray
            </Text>
            <Text className="text-ink font-sansBold text-[16px] mt-1">
              Overlap & thesis gaps
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
              See double-counted exposure (e.g. NVDA + SMH) and themes you matched but don't hold.
            </Text>
          </Card>
        </Pressable>

        <Text className="text-ink text-[16px] font-displayX mb-3">Holdings</Text>

        {!connected ? (
          <Card pad={16}>
            <Text className="text-ink-2 text-[13px] font-sansMd">
              Connect accounts to see holdings, weights, and sparklines.
            </Text>
            <Pressable onPress={() => router.push("/accounts" as any)} className="mt-3 active:opacity-70">
              <Text className="text-brand font-sansBold">Go to Accounts →</Text>
            </Pressable>
          </Card>
        ) : (
          <Card pad={0} className="overflow-hidden">
            <View className="flex-row px-4 py-2 border-b border-line bg-bg-surface2">
              <Text className="flex-[2] text-ink-3 text-[10px] font-sansX uppercase">Security</Text>
              <Text className="flex-1 text-ink-3 text-[10px] font-sansX uppercase text-right">Value</Text>
              <Text className="w-[56px] text-ink-3 text-[10px] font-sansX uppercase text-right">3mo</Text>
            </View>
            {holdings.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: h.symbol } } as any)}
                className="flex-row items-center px-4 py-3 border-b border-line active:opacity-70"
              >
                <View className="flex-[2]">
                  <Text className="text-ink font-monoBold text-[13px]">{h.symbol}</Text>
                  <Text className="text-ink-3 text-[11px] font-sansMd" numberOfLines={1}>
                    {h.name}
                  </Text>
                </View>
                <View className="flex-1 items-end">
                  <Text className="text-ink font-monoSb text-[13px]">${h.value.toLocaleString()}</Text>
                  <Text className="text-ink-3 text-[10px] font-sansMd">{h.weightPct}%</Text>
                </View>
                <View className="w-[56px] items-end">
                  <MiniSparkline values={h.sparkline} />
                </View>
              </Pressable>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
