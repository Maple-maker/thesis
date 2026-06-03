import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { getWeeklyReview, computeInvestorScore } from "@/lib/conviction-compounder";
import {
  computeHoldingHealth,
} from "@/lib/thesis-health";
import { useStore } from "@/store";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Weekly review card shown on the home screen.
 * Only renders when there are journal entries in the past 7 days.
 */
export function WeeklyReviewCard() {
  const router = useRouter();
  const journal = useStore((s) => s.journal);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const modelThesis = useStore((s) => s.modelThesis);
  const convictionNotes = useStore((s) => s.convictionNotes);

  const hasRecentActivity = useMemo(
    () => journal.some((j) => Date.now() - j.createdAt < SEVEN_DAYS_MS),
    [journal],
  );

  const review = useMemo(() => {
    // Compute health data for the review
    const health = holdings.map((h) =>
      computeHoldingHealth(h, profile, themeIds, modelThesis),
    );
    return getWeeklyReview(journal, health, []);
  }, [journal, holdings, profile, themeIds, modelThesis]);

  const score = useMemo(
    () => computeInvestorScore(modelThesis, journal, convictionNotes),
    [modelThesis, journal, convictionNotes],
  );

  if (!hasRecentActivity) return null;

  return (
    <View className="mb-4">
      <Card pad={18}>
        {/* ── Header ── */}
        <View className="flex-row items-start mb-3">
          <View className="bg-brand-bg w-[40px] h-[40px] rounded-[12px] items-center justify-center mr-3">
            <Icon name="sparkle" size={20} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text
              className="text-ink font-displayX text-[18px]"
              style={{ letterSpacing: -0.2 }}
            >
              Weekly review
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
              {score.overall >= 50
                ? "Your decision quality is tracking well."
                : "Early days — every decision helps."}
            </Text>
          </View>
        </View>

        {/* ── Summary text ── */}
        <View className="bg-bg-surface2 rounded-[12px] px-4 py-3 mb-3">
          <Text className="text-ink text-[13px] font-sansMd leading-[19px]">
            {review.summaryText}
          </Text>
        </View>

        {/* ── Highlights ── */}
        {review.highlights.length > 0 && (
          <View className="mb-3 gap-y-1.5">
            {review.highlights.map((h, i) => (
              <View key={i} className="flex-row items-start gap-2">
                <Text className="text-pos text-[14px] mt-0.5">✓</Text>
                <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[17px] flex-1">
                  {h}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Action items ── */}
        {review.actionItems.length > 0 && (
          <View className="mb-2">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
              Suggested actions
            </Text>
            <View className="gap-y-1.5">
              {review.actionItems.map((a, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-amber text-[14px] mt-0.5">→</Text>
                  <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[17px] flex-1">
                    {a}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Streak counter ── */}
        {score.streakDays > 0 && (
          <View className="flex-row items-center gap-1.5 mb-3 bg-amber-bg rounded-[10px] px-3 py-2 self-start">
            <Icon name="flame" size={15} color="#D98512" />
            <Text className="text-amber text-[12px] font-sansBold">
              {score.streakDays}-day decision streak
            </Text>
          </View>
        )}

        {/* ── CTA ── */}
        <Pressable
          onPress={() => router.push("/compounder" as any)}
          className="flex-row items-center justify-center mt-3 pt-3 border-t border-line active:opacity-70"
        >
          <Text className="text-brand text-[14px] font-sansBold mr-1.5">
            View full dashboard
          </Text>
          <Icon name="arrow" size={15} color="#0E7A66" sw={2.2} />
        </Pressable>
      </Card>
    </View>
  );
}
