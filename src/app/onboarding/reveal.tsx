import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FeaturedCard } from "@/components/ui/FeaturedCard";
import { Screen } from "@/components/ui/Screen";
import { CfoScorecard } from "@/components/CfoScorecard";
import { HEAT_COLOR, themeById } from "@/data/themes";
import { generateThemes } from "@/lib/theme-engine";
import { MilitaryResourcesSection } from "@/components/MilitaryResourcesSection";
import { militaryStatusFromProfile } from "@/lib/military-profile";
import { useStore } from "@/store";

export default function RevealScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const setOnboarding = useStore((s) => s.setOnboarding);
  const themeIds = useStore((s) => s.themeIds);
  const setThemeIds = useStore((s) => s.setThemeIds);

  const result = useMemo(() => generateThemes(profile, 5), [profile]);
  const topThemes = result.themes.slice(0, 2);

  useEffect(() => {
    if (themeIds.length === 0) {
      setThemeIds(topThemes.map((t) => t.id));
    }
  }, [themeIds.length, topThemes, setThemeIds]);

  const reasons = result.reasons;

  const themes = (themeIds.length
    ? themeIds.map((id) => themeById(id)!).filter(Boolean)
    : topThemes
  ).slice(0, 2);

  const featured = themes[0];
  const rest = themes.slice(1);

  const militaryStatus = militaryStatusFromProfile(profile);
  const showMilitary =
    militaryStatus === "active" ||
    militaryStatus === "veteran" ||
    militaryStatus === "reserve";

  return (
    <Screen padded>
      <Animated.View entering={FadeIn.delay(80).duration(400)} className="mb-5">
        <CfoScorecard
          derived={profile.derived}
          completedSections={profile.meta.completedSections.length}
          compact
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(450)} className="pt-2 mb-6">
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
          Your thesis
        </Text>
        <Text
          className="text-ink text-[38px] font-displayX mt-2"
          style={{ letterSpacing: -0.9, lineHeight: 42 }}
        >
          Here's how the world{"\n"}looks from where you sit.
        </Text>
        <Text className="text-ink-2 text-[15px] font-sansMd mt-3 leading-[22px]">
          Two focused theses matched to your situation and horizon, swap
          them anytime in Builder.
        </Text>
      </Animated.View>

      {featured && (
        <Animated.View entering={FadeIn.delay(120).duration(400)}>
          <FeaturedCard color={featured.color}>
            <View
              style={{ position: "absolute", right: -20, top: -20, opacity: 0.12 }}
            >
              <Icon name={featured.glyph as IconName} size={140} sw={1} color="#FFFFFF" />
            </View>
            <View className="relative">
              <View className="flex-row items-center self-start bg-white/20 px-2.5 py-1 rounded-[9px] mb-3">
                <Icon name="flame" size={13} color="#FFFFFF" />
                <Text className="text-white text-[11px] font-sansX uppercase tracking-wider ml-1.5">
                  Your top match
                </Text>
              </View>
              <Text className="text-white text-[11px] font-sansX uppercase tracking-widest">
                {featured.kicker}
              </Text>
              <Text
                className="text-white text-[26px] font-displayX mt-1"
                style={{ letterSpacing: -0.6, lineHeight: 29 }}
              >
                {featured.title}
              </Text>
              <Text className="text-white/85 text-[13px] italic font-sansSb mt-0.5">
                {featured.author}
              </Text>
              <Text className="text-white/95 text-[14.5px] font-sansMd mt-3 leading-[21px]">
                {featured.thesis}
              </Text>
              <ReasonBullets
                items={reasons[featured.id] ?? []}
                max={3}
                tone="light"
              />
            </View>
          </FeaturedCard>
        </Animated.View>
      )}

      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-8 mb-3">
        Your other themes
      </Text>

      <View className="gap-y-2.5">
        {rest.map((t, i) => (
          <Animated.View
            key={t.id}
            entering={FadeInDown.delay(180 + i * 80).duration(350)}
          >
            <Card pad={15}>
              <View className="flex-row items-center">
                <View
                  className="items-center justify-center mr-3"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: `${t.color}1F`,
                  }}
                >
                  <Icon name={t.glyph as IconName} size={26} color={t.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-0.5">
                    <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                      {t.kicker}
                    </Text>
                    <View className="w-[3px] h-[3px] rounded-full bg-ink-3 mx-1.5" />
                    <Text
                      className="text-[10.5px] font-sansX uppercase tracking-wider"
                      style={{ color: HEAT_COLOR[t.heat] }}
                    >
                      {t.heat}
                    </Text>
                  </View>
                  <Text
                    className="text-ink font-displayX text-[17px]"
                    style={{ letterSpacing: -0.2 }}
                  >
                    {t.title}
                  </Text>
                  <Text className="text-ink-3 text-[12.5px] font-sansSb italic mt-0.5">
                    {t.author}
                  </Text>
                  <ReasonBullets
                    items={reasons[t.id] ?? []}
                    max={2}
                    tone="ink"
                  />
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>

      {showMilitary && (
        <Animated.View entering={FadeIn.delay(200).duration(400)} className="mt-4">
          <MilitaryResourcesSection status={militaryStatus} compact />
        </Animated.View>
      )}

      <View className="mt-10 mb-2">
        <Button
          label="Start exploring"
          fullWidth
          size="lg"
          onPress={() => {
            setOnboarding("complete");
            router.replace("/auth");
          }}
        />
        <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-4 px-6">
          Educational tool, not investment advice. Nothing here is a recommendation to buy or sell any security.
        </Text>
      </View>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ReasonBullets({
  items,
  max,
  tone,
}: {
  items: string[];
  max: number;
  tone: "light" | "ink";
}) {
  if (!items.length) return null;

  const shown = items.slice(0, max);
  const textColor = tone === "light" ? "text-white/90" : "text-ink-2";
  const dotColor = tone === "light" ? "#FFFFFF99" : "#8C988F99";

  return (
    <View className="mt-2.5">
      {shown.map((reason, i) => (
        <View key={i} className="flex-row items-start mb-1 last:mb-0">
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: dotColor,
              marginTop: 7,
              marginRight: 8,
            }}
          />
          <Text
            className={`${textColor} text-[13px] font-sansMd leading-[19px] flex-1`}
          >
            {reason}
          </Text>
        </View>
      ))}
    </View>
  );
}
