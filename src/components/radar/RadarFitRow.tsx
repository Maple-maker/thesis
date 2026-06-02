import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Tag } from "@/components/ui/Tag";
import type { ConvictionRankRow } from "@/lib/conviction-rank";

type Props = {
  row: ConvictionRankRow;
  watched: boolean;
  inModel: boolean;
  onToggleWatch: () => void;
};

function toneForLabel(label: ConvictionRankRow["label"]): "brand" | "amber" | "meta" {
  if (label === "Strong") return "brand";
  if (label === "Moderate") return "amber";
  return "meta";
}

export function RadarFitRow({ row, watched, inModel, onToggleWatch }: Props) {
  const router = useRouter();
  const path =
    row.kind === "etf" ? `/(tabs)/etf/${row.symbol}` : `/(tabs)/stock/${row.symbol}`;

  return (
    <View className="rounded-[12px] bg-bg-surface border border-line px-3 py-3">
      <Pressable
        onPress={() => router.push(path as never)}
        className="active:opacity-80"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-ink font-monoBold text-[16px]">{row.symbol}</Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5" numberOfLines={1}>
              {row.name}
            </Text>
          </View>
          <Tag label={row.label} tone={toneForLabel(row.label)} />
        </View>
        <Text className="text-ink-3 text-[11px] font-sansMd mt-2 leading-[16px]">
          {row.blurb} · fit score {row.score}
        </Text>
      </Pressable>
      <View className="flex-row gap-2 mt-2.5">
        <Pressable
          onPress={onToggleWatch}
          className="flex-1 rounded-[9px] border border-line bg-bg-subtle py-2 items-center active:opacity-70"
        >
          <Text className="text-ink text-[11px] font-sansBold">
            {watched ? "On watchlist" : "Add to watchlist"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/thesis-model",
              params: {
                radarSymbol: row.symbol,
                radarTemplate: "conviction-dossier",
              },
            } as never)
          }
          className="flex-1 rounded-[9px] border border-brand/30 bg-brand/8 py-2 items-center active:opacity-70"
        >
          <Text className="text-brand text-[11px] font-sansBold">
            {inModel ? "Research" : "Dossier"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
