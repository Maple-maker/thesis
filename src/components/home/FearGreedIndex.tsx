import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import type { SentimentSnapshot } from "@/lib/thesis-api";
import { getMarketSentiment } from "@/lib/thesis-api";

const RATING_COLORS: Record<string, string> = {
  "extreme fear": "#D8472C",
  fear: "#D98512",
  neutral: "#8C988F",
  greed: "#149059",
  "extreme greed": "#0E7A66",
};

const RATING_LABELS: Record<string, string> = {
  "extreme fear": "Extreme Fear",
  fear: "Fear",
  neutral: "Neutral",
  greed: "Greed",
  "extreme greed": "Extreme Greed",
};

function gaugeColor(score: number): string {
  if (score <= 25) return "#D8472C";
  if (score <= 45) return "#D98512";
  if (score <= 55) return "#8C988F";
  if (score <= 75) return "#149059";
  return "#0E7A66";
}

export function FearGreedIndex() {
  const [snap, setSnap] = useState<SentimentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMarketSentiment("overview");
        if (!cancelled) setSnap(data);
      } catch {
        // API unavailable — leave as null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Card pad={16} className="mb-4">
        <View className="h-[100px] items-center justify-center">
          <Text className="text-ink-3 text-[13px] font-sansMd">Loading market sentiment…</Text>
        </View>
      </Card>
    );
  }

  if (!snap) return null;

  const score = snap.fearGreedScore;
  const color = gaugeColor(score);
  const ratingColor = RATING_COLORS[snap.fearGreedRating] ?? "#8C988F";

  return (
    <Card pad={16} className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-ink-2 text-[11px] font-sansX uppercase tracking-widest">
          Fear & Greed Index
        </Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">{snap.source === "cnn" ? "CNN" : "Synthesized"}</Text>
      </View>

      {/* Gauge bar */}
      <View className="mb-2">
        <View className="h-[8px] rounded-full bg-track overflow-hidden flex-row">
          {[
            { pct: 25, color: "#D8472C" },
            { pct: 20, color: "#D98512" },
            { pct: 10, color: "#8C988F" },
            { pct: 20, color: "#149059" },
            { pct: 25, color: "#0E7A66" },
          ].map((seg, i) => (
            <View key={i} style={{ width: `${seg.pct}%`, height: "100%", backgroundColor: seg.color }} />
          ))}
        </View>
        {/* Needle */}
        <View style={{ marginLeft: `${Math.min(Math.max(score, 2), 98)}%`, marginTop: -5, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color }}>▼</Text>
        </View>
      </View>

      {/* Score and rating */}
      <View className="flex-row items-baseline justify-between mt-1">
        <Text className="text-ink font-displayX text-[28px]" style={{ color, letterSpacing: -1 }}>
          {score}
        </Text>
        <Text className="text-ink text-[16px] font-sansBold" style={{ color: ratingColor }}>
          {RATING_LABELS[snap.fearGreedRating] ?? snap.fearGreedRating}
        </Text>
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-ink-3 text-[10px] font-monoMd">1w ago: {snap.previous1Week}</Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">1m ago: {snap.previous1Month}</Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">1y ago: {snap.previous1Year}</Text>
      </View>

      {/* Summary */}
      {snap.summary ? (
        <Text className="text-ink-2 text-[12px] font-sansMd mt-3 leading-[17px]">
          {snap.summary}
        </Text>
      ) : null}

      {/* Macro tailwinds / headwinds */}
      {(snap.macroTailwinds.length > 0 || snap.macroHeadwinds.length > 0) && (
        <View className="flex-row gap-3 mt-3 pt-3 border-t border-line">
          {snap.macroTailwinds.length > 0 && (
            <View className="flex-1">
              <Text className="text-pos text-[10px] font-sansX uppercase tracking-wider mb-1">Tailwinds</Text>
              {snap.macroTailwinds.slice(0, 2).map((w, i) => (
                <Text key={i} className="text-ink-2 text-[11px] font-sansMd leading-[15px]">↑ {w}</Text>
              ))}
            </View>
          )}
          {snap.macroHeadwinds.length > 0 && (
            <View className="flex-1">
              <Text className="text-neg text-[10px] font-sansX uppercase tracking-wider mb-1">Headwinds</Text>
              {snap.macroHeadwinds.slice(0, 2).map((w, i) => (
                <Text key={i} className="text-ink-2 text-[11px] font-sansMd leading-[15px]">↓ {w}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
