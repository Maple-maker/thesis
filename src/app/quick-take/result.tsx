import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { FeaturedCard } from "@/components/ui/FeaturedCard";
import { Screen } from "@/components/ui/Screen";
import { DEFAULT_PROFILE } from "@/data/questionnaire";
import { QUICK_TAKE_INTEREST_MAP } from "@/data/quick-take-questions";
import { fetchQuotes, type LiveQuote } from "@/lib/prices";
import { generateThemes, rankStocksForTheme } from "@/lib/theme-engine";
import type { Stock } from "@/store/types";
import { useStore } from "@/store";

/** Quick Take result — thesis preview + model portfolio, then the sign-up gate. */
export default function QuickTakeResult() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);

  const result = useMemo(() => {
    const augmented = {
      ...DEFAULT_PROFILE,
      ...profile,
      interests: QUICK_TAKE_INTEREST_MAP[profile.qtInterest ?? "none"] ?? [],
    };
    return { ...generateThemes(augmented, 3), augmented };
  }, [profile]);

  const featured = result.themes[0];
  const reasons = featured ? (result.reasons[featured.id] ?? []).slice(0, 2) : [];
  const stocks = useMemo(
    () =>
      featured ? rankStocksForTheme(featured.id, result.augmented, 5) : [],
    [featured, result.augmented]
  );

  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  useEffect(() => {
    if (stocks.length === 0) return;
    let cancelled = false;
    void fetchQuotes(stocks.map((s) => s.symbol)).then((q) => {
      if (!cancelled) setQuotes(q);
    });
    return () => {
      cancelled = true;
    };
  }, [stocks]);

  if (!featured) {
    return (
      <Screen padded>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-10 text-center">
          Answer the five questions first to see your thesis preview.
        </Text>
        <View className="mt-6">
          <Button
            label="Start Quick Take"
            fullWidth
            onPress={() => router.replace("/quick-take")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Animated.View entering={FadeInUp.duration(450)} className="pt-2 mb-6">
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
          Your thesis preview
        </Text>
        <Text
          className="text-ink text-[38px] font-displayX mt-2"
          style={{ letterSpacing: -1, lineHeight: 42 }}
        >
          {featured.title}
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-2 leading-[22px]">
          Based on what you told us.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(120).duration(400)}>
        <FeaturedCard color={featured.color}>
          <View
            style={{ position: "absolute", right: -20, top: -20, opacity: 0.12 }}
          >
            <Icon
              name={featured.glyph as IconName}
              size={140}
              sw={1}
              color="#FFFFFF"
            />
          </View>
          <View className="relative">
            <Text className="text-white text-[11px] font-sansX uppercase tracking-widest">
              {featured.kicker}
            </Text>
            <Text className="text-white/85 text-[13px] italic font-sansSb mt-1">
              {featured.author}
            </Text>
            <Text className="text-white/95 text-[14.5px] font-sansMd mt-3 leading-[21px]">
              {featured.thesis}
            </Text>
            {reasons.length > 0 && (
              <View className="mt-3">
                {reasons.map((reason, i) => (
                  <View key={i} className="flex-row items-start mb-1">
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: "#FFFFFF99",
                        marginTop: 7,
                        marginRight: 8,
                      }}
                    />
                    <Text className="text-white/90 text-[13px] font-sansMd leading-[19px] flex-1">
                      {reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </FeaturedCard>
      </Animated.View>

      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-8 mb-3">
        Your starting point
      </Text>
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="bg-bg-surface border border-line rounded-card overflow-hidden"
      >
        {stocks.map((stock, i) => (
          <StockRow
            key={stock.symbol}
            stock={stock}
            quote={quotes[stock.symbol]}
            last={i === stocks.length - 1}
          />
        ))}
      </Animated.View>
      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-3">
        Illustrative · not a recommendation · educational only
      </Text>
      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-1">
        Prices delayed ≥15 min when shown
      </Text>

      <View className="mt-10">
        <Button
          label="Build your full thesis"
          fullWidth
          size="lg"
          onPress={() => router.push("/auth/sign-up")}
        />
        <Pressable
          onPress={() => router.push("/auth/sign-in")}
          className="items-center mt-4 active:opacity-70"
        >
          <Text className="text-ink-3 text-[13px] font-sansMd">
            Already have an account?{" "}
            <Text className="text-brand font-sansBold">Sign in</Text>
          </Text>
        </Pressable>
      </View>

      <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-6 mb-2 px-6">
        Nothing here is financial advice. Educational tool only.
      </Text>
    </Screen>
  );
}

function StockRow({
  stock,
  quote,
  last,
}: {
  stock: Stock;
  quote?: LiveQuote;
  last: boolean;
}) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 ${
        last ? "" : "border-b border-line"
      }`}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-x-2">
          <Text className="text-ink font-monoBold text-[14px]">
            {stock.symbol}
          </Text>
          <View className="bg-bg-subtle px-2 py-0.5 rounded-[6px]">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase">
              {stock.sector}
            </Text>
          </View>
        </View>
        <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5">
          {stock.name}
        </Text>
      </View>
      {quote ? (
        <View className="items-end pl-2">
          <Text className="text-ink font-monoBold text-[14px]">
            ${quote.close.toFixed(2)}
          </Text>
          <Text
            className={`font-monoSb text-[11.5px] mt-0.5 ${
              quote.changePct >= 0 ? "text-pos" : "text-neg"
            }`}
          >
            {quote.changePct >= 0 ? "+" : ""}
            {(quote.changePct * 100).toFixed(1)}%
          </Text>
        </View>
      ) : (
        <Text className="text-ink-3 font-monoSb text-[14px] pl-2">—</Text>
      )}
    </View>
  );
}
