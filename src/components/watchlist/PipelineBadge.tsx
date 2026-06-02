import { Text, View } from "react-native";

import type { WatchlistPipelineState } from "@/types/conviction-loop";

const LABELS: Record<WatchlistPipelineState, string> = {
  exploring: "Exploring",
  shortlisted: "Shortlisted",
  "in-model": "In model",
  passed: "Passed",
};

export function PipelineBadge({ state }: { state: WatchlistPipelineState }) {
  const bg =
    state === "in-model"
      ? "bg-pos-bg"
      : state === "shortlisted"
        ? "bg-brand-bg"
        : "bg-bg-surface2";
  const text =
    state === "in-model"
      ? "text-pos-ink"
      : state === "shortlisted"
        ? "text-brand"
        : "text-ink-3";

  return (
    <View className={`px-2 py-0.5 rounded-[6px] ${bg}`}>
      <Text className={`text-[9px] font-sansX uppercase tracking-wider ${text}`}>
        {LABELS[state]}
      </Text>
    </View>
  );
}
