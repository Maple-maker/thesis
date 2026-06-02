import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { fetchMacroSnapshot, type MacroSnapshot } from "@/lib/macro-api";

const MACRO_ASK_SEEDS = [
  "How do today's Fed and Treasury levels affect a growth-heavy portfolio?",
  "Explain the yield curve spread and what it means for my bond allocation.",
  "What should I watch in macro headlines before rebalancing?",
];

export function MacroMarketsCard() {
  const router = useRouter();
  const [snap, setSnap] = useState<MacroSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchMacroSnapshot();
      if (!cancelled) {
        setSnap(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const askMacro = (question: string) => {
    router.push({
      pathname: "/ask/chat",
      params: { seed: question },
    } as never);
  };

  return (
    <Card pad={16} className="mb-5">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-[10px] bg-brand-bg items-center justify-center">
            <Icon name="trend" size={18} color="#0E7A66" sw={2} />
          </View>
          <View>
            <Text className="text-ink font-sansBold text-[15px]">Macro & markets</Text>
            <Text className="text-ink-3 text-[11px] font-sansMd">Live rates · Fed headlines</Text>
          </View>
        </View>
        {!loading && snap && (
          <View className="px-2 py-0.5 rounded-[6px] bg-pos-bg">
            <Text className="text-pos text-[9px] font-sansX uppercase">Live</Text>
          </View>
        )}
      </View>

      {loading && (
        <View className="py-6 items-center">
          <ActivityIndicator color="#0E7A66" />
          <Text className="text-ink-3 text-[12px] font-sansMd mt-2">Fetching macro data…</Text>
        </View>
      )}

      {!loading && snap && snap.series.length > 0 && (
        <View className="gap-2 mb-3">
          {snap.series.slice(0, 4).map((s) => (
            <View
              key={s.id}
              className="flex-row items-center justify-between py-2 border-b border-line last:border-b-0"
            >
              <View className="flex-1 pr-2">
                <Text className="text-ink text-[13px] font-sansSb">{s.label}</Text>
                <Text className="text-ink-3 text-[10px] font-sansMd">
                  {s.asOf} · {s.source}
                </Text>
              </View>
              <Text className="text-ink font-monoBold text-[14px]">{s.value}</Text>
            </View>
          ))}
        </View>
      )}

      {!loading && (!snap || snap.series.length === 0) && (
        <Text className="text-ink-3 text-[12px] font-sansMd mb-3 leading-[18px]">
          Start the API server to load live Treasury yields and Fed headlines. Add FRED_API_KEY
          for Fed funds and CPI.
        </Text>
      )}

      {snap?.headlines?.[0] && (
        <View className="bg-bg-surface2 rounded-[10px] px-3 py-2 mb-3">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase mb-1">Fed headline</Text>
          <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px]" numberOfLines={2}>
            {snap.headlines[0].title}
          </Text>
        </View>
      )}

      <Text className="text-ink-3 text-[10px] font-sansMd mb-2">
        {snap?.disclaimer ?? "Educational tool, not investment advice."}
      </Text>

      <View className="gap-2">
        {MACRO_ASK_SEEDS.map((q) => (
          <Pressable
            key={q}
            onPress={() => askMacro(q)}
            className="px-3 py-2.5 rounded-[12px] bg-brand-bg border border-brand/20 active:opacity-80"
          >
            <Text className="text-brand text-[12px] font-sansSb leading-[17px]">{q}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
