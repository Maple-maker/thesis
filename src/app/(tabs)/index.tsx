import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { AskThesisCard } from "@/components/home/AskThesisCard";
import { FearGreedIndex } from "@/components/home/FearGreedIndex";
import { InsightsFeed } from "@/components/home/InsightsFeed";
import { RadarFeed } from "@/components/home/RadarFeed";
import { TodayForThesisCard } from "@/components/home/TodayForThesisCard";
import { MacroMarketsCard } from "@/components/macro/MacroMarketsCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FeaturedCard } from "@/components/ui/FeaturedCard";
import { IconBtn } from "@/components/ui/IconBtn";
import { Bar } from "@/components/ui/Progress";
import { Screen } from "@/components/ui/Screen";
import { Kicker, SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { insightsForHome } from "@/data/insights-feed";
import { radarReportsForContext } from "@/data/radar-reports";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { askPromptsForProfile } from "@/lib/ask-prompts";
import { useStore } from "@/store";

export default function HomeScreen() {
  const router = useRouter();
  const themeIds = useStore((s) => s.themeIds);
  const watchlist = useStore((s) => s.watchlist);
  const journal = useStore((s) => s.journal);
  const profile = useStore((s) => s.profile);
  const hardReset = useStore((s) => s.hardReset);

  const themes = themeIds.map((id) => themeById(id)!).filter(Boolean);
  const featured = themes[0];
  const canDuel = watchlist.length >= 2;
  const modelThesis = useStore((s) => s.modelThesis);

  const askPrompts = useMemo(() => askPromptsForProfile(profile, themeIds, { modelThesis }), [profile, themeIds, modelThesis]);
  const radarReports = useMemo(() => radarReportsForContext(profile, themeIds, watchlist), [profile, themeIds, watchlist]);
  const insightItems = useMemo(() => insightsForHome(profile, themeIds, watchlist, [], 3), [profile, themeIds, watchlist]);

  const onLongPressLogo = () => {
    Alert.alert(
      "Reset thesis?",
      "Wipes your profile, themes, watchlist, and journal — useful for testing.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            hardReset();
            router.replace("/");
          },
        },
      ]
    );
  };

  // Profile fingerprint values (0-100)
  const fingerprint = computeFingerprint(profile);

  // Activity prompts (replacing "quests")
  const prompts: Prompt[] = [
    { id: "p1", label: "Pick a theme to explore", done: themeIds.length > 0, icon: "discover" },
    { id: "p2", label: "Add 3 stocks to your watchlist", done: watchlist.length >= 3, icon: "plus" },
    { id: "p3", label: "Run your first duel", done: journal.length >= 1, icon: "compare" },
    { id: "p4", label: "Reflect on 5 duels", done: journal.length >= 5, icon: "sparkle" },
    ...(profile.experience !== "experienced"
      ? [{ id: "p5", label: "Explore investing concepts", done: false, icon: "cap" as IconName }]
      : []),
  ];
  const doneCount = prompts.filter((p) => p.done).length;

  const handlePromptPress = (id: string) => {
    switch (id) {
      case "p1":
      case "p2":
        router.push("/(tabs)/themes");
        break;
      case "p3":
        router.push(canDuel ? "/duel" : "/(tabs)/themes");
        break;
      case "p4":
        router.push("/(tabs)/journal");
        break;
      case "p5":
        router.push("/learn");
        break;
    }
  };

  return (
    <Screen padded>
      {/* Greeting */}
      <View className="flex-row items-center justify-between pt-3 mb-4">
        <Pressable onLongPress={onLongPressLogo} delayLongPress={800}>
          <Text className="text-ink-3 text-[14px] font-sansSb">Welcome back</Text>
          <Text
            className="text-ink font-displayX text-[26px]"
            style={{ letterSpacing: -0.5, lineHeight: 30 }}
          >
            Investor
          </Text>
        </Pressable>
        <View className="flex-row items-center gap-x-2">
          {journal.length > 0 && (
            <View className="flex-row items-center bg-amber-bg px-2.5 py-1.5 rounded-[12px]">
              <Icon name="flame" size={15} color="#D98512" />
              <Text className="font-monoBold text-amber ml-1 text-[14px]">
                {journal.length}
              </Text>
            </View>
          )}
          <IconBtn name="bell" />
        </View>
      </View>

      {/* Learn card — prominent for brand-new users */}
      {profile.experience === "none" && (
        <Card pad={16} className="mb-4" onPress={() => router.push("/learn")}>
          <View className="flex-row items-start">
            <View className="bg-brand-bg w-[40px] h-[40px] rounded-[12px] items-center justify-center mr-3">
              <Icon name="cap" size={20} color="#0E7A66" sw={2} />
            </View>
            <View className="flex-1">
              <Text className="text-ink font-displayX text-[17px]" style={{ letterSpacing: -0.2 }}>
                New to investing?
              </Text>
              <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
                Learn the fundamentals — what stocks are, how interest rates work, and why diversification matters.
              </Text>
            </View>
          </View>
          <View className="mt-4">
            <Button label="Start learning" fullWidth size="md" variant="primary" />
          </View>
        </Card>
      )}

      {/* Featured theme card */}
      {featured && (
        <View className="mb-4">
          <FeaturedCard
            color={featured.color}
            onPress={() => router.push({ pathname: "/(tabs)/theme/[id]", params: { id: featured.id } })}
          >
            <View
              style={{ position: "absolute", right: -22, top: -22, opacity: 0.12 }}
            >
              <Icon name={featured.glyph as IconName} size={140} sw={1} color="#FFFFFF" />
            </View>
            <View className="relative">
              <View className="flex-row items-center self-start bg-white/20 px-2.5 py-1 rounded-[9px] mb-3">
                <Icon name="sparkle" size={13} color="#FFFFFF" />
                <Text className="text-white text-[11px] font-sansX uppercase tracking-wider ml-1.5">
                  Your thesis · Top match
                </Text>
              </View>
              <Text className="text-white text-[11px] font-sansX uppercase tracking-widest">
                {featured.kicker}
              </Text>
              <Text
                className="text-white text-[24px] font-displayX mt-1"
                style={{ letterSpacing: -0.6, lineHeight: 27 }}
              >
                {featured.title}
              </Text>
              <Text className="text-white/90 text-[13.5px] font-sansMd mt-2 leading-[20px]">
                {featured.thesis}
              </Text>
              <View className="flex-row items-center mt-4">
                <Text className="text-white text-[14px] font-sansBold mr-1.5">
                  Read
                </Text>
                <Icon name="arrow" size={16} color="#FFFFFF" sw={2.2} />
              </View>
            </View>
          </FeaturedCard>
        </View>
      )}

      {/* Profile fingerprint */}
      <Card pad={18} className="mb-4">
        <View className="flex-row items-center mb-3">
          <Kicker>Your investing fingerprint</Kicker>
        </View>
        <View className="gap-y-3">
          {fingerprint.map((f) => (
            <View key={f.label}>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-ink-2 text-[13px] font-sansSb">
                  {f.label}
                </Text>
                <Text className="text-ink text-[13px] font-monoBold">
                  {f.descriptor}
                </Text>
              </View>
              <Bar pct={f.value / 100} color={f.color as any} height={5} />
            </View>
          ))}
        </View>
      </Card>

      {/* Fear & Greed Index */}
      <FearGreedIndex />

      {/* AI CFO / Ask Thesis */}
      <AskThesisCard prompts={askPrompts} />

      {/* Today for Thesis */}
      <TodayForThesisCard
        profile={profile}
        themeIds={themeIds}
        watchlist={watchlist}
        modelThesis={modelThesis}
        completedLessons={[]}
        journalCount={journal.length}
      />

      {/* Macro markets / sentiment */}
      <View className="mb-4">
        <MacroMarketsCard />
      </View>

      {/* Quick tools */}
      <SectionTitle>Research & tools</SectionTitle>
      <View className="flex-row gap-2.5 mb-5">
        <ToolCard icon="compare" label="Duel" color="#0E7A66" onPress={() => router.push("/duel")} />
        <ToolCard icon="grid" label="X-Ray" color="#7C3AED" onPress={() => router.push("/xray")} />
        <ToolCard icon="search" label="Screener" color="#D98512" onPress={() => router.push("/screener")} />
        <ToolCard icon="sparkle" label="Stress test" color="#3B82F6" onPress={() => router.push("/thesis-model")} />
      </View>

      {/* Thesis Radar */}
      <RadarFeed reports={radarReports} />

      {/* Insights & briefs */}
      <InsightsFeed items={insightItems} />

      {/* Duel CTA */}
      <Card pad={16} className="mb-4">
        <View className="flex-row items-start">
          <View className="bg-brand-bg w-[40px] h-[40px] rounded-[12px] items-center justify-center mr-3">
            <Icon name="compare" size={20} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-ink font-displayX text-[17px]" style={{ letterSpacing: -0.2 }}>
              Run a duel
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
              {canDuel
                ? "Pick two from your watchlist. Force the choice."
                : "Add at least 2 stocks to your watchlist to unlock."}
            </Text>
          </View>
          <Tag label={canDuel ? "Ready" : "Locked"} tone={canDuel ? "brand" : "default"} />
        </View>
        <View className="mt-4">
          <Button
            label={canDuel ? "Start a duel" : "Browse themes"}
            fullWidth
            size="md"
            variant={canDuel ? "primary" : "secondary"}
            onPress={() => {
              if (canDuel) router.push("/duel");
              else router.push("/(tabs)/themes");
            }}
          />
        </View>
      </Card>

      {/* Activity prompts */}
      <SectionTitle>Get started</SectionTitle>
      <Card pad={6} className="mb-6">
        {prompts.map((p, i) => (
          <Pressable
            key={p.id}
            onPress={() => handlePromptPress(p.id)}
            className={`flex-row items-center px-3 py-3 active:opacity-60 ${
              i < prompts.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <View
              className={`w-6 h-6 rounded-[8px] items-center justify-center mr-3 ${
                p.done ? "bg-pos" : "border-2 border-line-strong"
              }`}
            >
              {p.done ? <Icon name="check" size={14} sw={2.6} color="#FFFFFF" /> : null}
            </View>
            <Text
              className={`flex-1 text-[14.5px] font-sansSb ${
                p.done ? "text-ink-3 line-through" : "text-ink"
              }`}
            >
              {p.label}
            </Text>
            <Icon
              name={p.icon}
              size={18}
              color={p.done ? "#8C988F" : "#0E7A66"}
              sw={1.8}
            />
          </Pressable>
        ))}
        <View className="px-3 py-2">
          <Text className="text-ink-3 text-[12.5px] font-sansSb text-center">
            {doneCount}/{prompts.length} done
          </Text>
        </View>
      </Card>

      {/* Your themes preview */}
      <SectionTitle action="See all →" onAction={() => router.push("/(tabs)/themes")}>
        Your themes
      </SectionTitle>
      <View className="gap-y-2.5">
        {themes.slice(0, 3).map((t) => (
          <Pressable
            key={t.id}
            onPress={() => router.push({ pathname: "/(tabs)/theme/[id]", params: { id: t.id } })}
            className="bg-bg-surface border border-line rounded-card p-4 flex-row items-center"
            style={{
              shadowColor: "#142F22",
              shadowOpacity: 0.05,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <View
              className="items-center justify-center mr-3"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${t.color}1F`,
              }}
            >
              <Icon name={t.glyph as IconName} size={22} color={t.color} />
            </View>
            <View className="flex-1">
              <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                {t.kicker}
              </Text>
              <Text
                className="text-ink font-displayX text-[16px] mt-0.5"
                style={{ letterSpacing: -0.2 }}
              >
                {t.title}
              </Text>
            </View>
            <Icon name="chev" size={18} color="#8C988F" />
          </Pressable>
        ))}
      </View>

      {/* Watchlist preview */}
      {watchlist.length > 0 && (
        <View className="mt-6">
          <SectionTitle action="View →" onAction={() => router.push("/(tabs)/watchlist")}>
            Watchlist
          </SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {watchlist.slice(0, 8).map((sym) => {
              const s = stockBySymbol(sym);
              if (!s) return null;
              return (
                <Pressable
                  key={sym}
                  onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: sym } })}
                  className="bg-bg-surface border border-line px-3 py-2 rounded-[12px]"
                >
                  <Text className="text-ink font-monoBold text-[13px]">{sym}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View className="mt-8">
        <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
          Educational tool. Not investment advice. Do your own research.
        </Text>
        <Text className="text-ink-3 text-[10px] text-center font-sansMd mt-1 opacity-60">
          Long-press the greeting to reset everything.
        </Text>
      </View>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
type Prompt = { id: string; label: string; done: boolean; icon: IconName };

type FingerprintRow = {
  label: string;
  value: number; // 0-100
  descriptor: string;
  color: "brand" | "pos" | "amber" | "violet" | "neg";
};

function computeFingerprint(profile: ReturnType<typeof useStore.getState>["profile"]): FingerprintRow[] {
  const riskMap: Record<string, number> = {
    "very-low": 15,
    low: 35,
    medium: 55,
    high: 75,
    "very-high": 92,
  };
  const horizonMap: Record<string, number> = {
    short: 20,
    medium: 45,
    long: 75,
    "very-long": 95,
  };
  const incomeMap: Record<string, number> = {
    none: 15,
    some: 55,
    primary: 92,
  };
  const targetMap: Record<string, number> = {
    conservative: 25,
    moderate: 55,
    aggressive: 85,
  };

  return [
    {
      label: "Risk tolerance",
      value: riskMap[profile.risk] ?? 50,
      descriptor: profile.risk.replace("-", " "),
      color: profile.risk === "very-low" || profile.risk === "low" ? "pos" : profile.risk === "medium" ? "brand" : "amber",
    },
    {
      label: "Time horizon",
      value: horizonMap[profile.horizon] ?? 50,
      descriptor: profile.horizon,
      color: "brand",
    },
    {
      label: "Return target",
      value: targetMap[profile.targetReturn] ?? 50,
      descriptor: profile.targetReturn,
      color: "violet",
    },
    {
      label: "Income need",
      value: incomeMap[profile.incomeNeed] ?? 50,
      descriptor: profile.incomeNeed,
      color: "amber",
    },
  ];
}

function ToolCard({ icon, label, color, onPress }: { icon: IconName; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-bg-surface border border-line rounded-[14px] py-3 items-center active:opacity-70"
      style={{ minWidth: 72 }}
    >
      <Icon name={icon} size={24} color={color} sw={2} />
      <Text className="text-ink-2 text-[10px] font-sansBold mt-1.5">{label}</Text>
    </Pressable>
  );
}
