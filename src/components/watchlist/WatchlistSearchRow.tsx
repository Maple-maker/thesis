import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui/Tag";
import { APP_ROUTES, etfDetailRoute, stockDetailRoute } from "@/lib/app-route";
import type { WatchlistSearchRow as Row } from "@/lib/watchlist-search";
import { useStore } from "@/store";
import type { WatchlistPipelineState } from "@/types/conviction-loop";

type Props = {
  row: Row;
};

function fitTone(score: number): "pos" | "amber" | "default" {
  if (score >= 62) return "pos";
  if (score >= 40) return "amber";
  return "default";
}

export function WatchlistSearchRowCard({ row }: Props) {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const setWatchlistPipeline = useStore((s) => s.setWatchlistPipeline);
  const watching = watchlist.includes(row.symbol);

  const isEtf = row.kind === "etf";
  const accent = isEtf ? "#7C3AED" : "#0E7A66";
  const accentBg = isEtf ? "bg-violet-bg" : "bg-brand-bg";
  const strongFit = row.fit.score >= 62;

  const open = () => {
    router.push(
      (isEtf
        ? etfDetailRoute(row.symbol, APP_ROUTES.watchlist)
        : stockDetailRoute(row.symbol, APP_ROUTES.watchlist)) as never
    );
  };

  return (
    <View
      className={`rounded-[14px] border px-3.5 py-3.5 ${
        strongFit ? "bg-brand-bg/25 border-brand/30" : "bg-bg-surface border-line"
      }`}
    >
      <View className="flex-row items-start">
        <Pressable onPress={open} className="flex-row items-start flex-1 min-w-0 active:opacity-85">
        <View className={`w-[40px] h-[40px] rounded-[11px] items-center justify-center mr-3 ${accentBg}`}>
          <Icon name={isEtf ? "grid" : "trend"} size={17} color={accent} sw={2} />
        </View>
        <View className="flex-1 min-w-0 pr-2">
          <View className="flex-row items-center flex-wrap gap-x-2 mb-1">
            <Text className="text-ink font-monoBold text-[15px]">{row.symbol}</Text>
            <Tag label={row.fit.label} tone={fitTone(row.fit.score)} />
            {row.curated && <Tag label="Deep dive" tone="brand" />}
          </View>
          <Text
            className={`text-[13.5px] font-sansBold leading-[19px] ${
              strongFit ? "text-brand" : "text-ink"
            }`}
            numberOfLines={2}
          >
            {row.headline}
          </Text>
          <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]" numberOfLines={2}>
            {row.subline}
          </Text>
          <Text className="text-ink-3 text-[11px] font-sansMd mt-1" numberOfLines={1}>
            {row.name}
          </Text>
        </View>
        </Pressable>
        <View className="gap-1.5">
          {row.fit.score >= 62 && (
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
              className="px-2 py-1 rounded-[8px] bg-brand active:opacity-80"
            >
              <Text className="text-white text-[9px] font-sansBold">Radar</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (!watching) toggle(row.symbol);
              const next: WatchlistPipelineState = row.fit.score >= 62 ? "shortlisted" : "exploring";
              setWatchlistPipeline(row.symbol, next);
            }}
            hitSlop={8}
            className={`w-9 h-9 rounded-[10px] items-center justify-center ${
              watching ? "bg-brand" : "bg-bg-surface2 border border-line"
            }`}
          >
            <Icon
              name={watching ? "check" : "plus"}
              size={16}
              sw={2.2}
              color={watching ? "#FFFFFF" : "#0E7A66"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
