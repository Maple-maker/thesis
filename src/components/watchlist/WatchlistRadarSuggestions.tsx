import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui/Tag";
import { APP_ROUTES, etfDetailRoute, stockDetailRoute } from "@/lib/app-route";
import type { WatchlistRadarSuggestionWithMarket } from "@/lib/radar-market-sync";
import { useStore } from "@/store";
import type { WatchlistPipelineState } from "@/types/conviction-loop";

type Props = {
  stocks: WatchlistRadarSuggestionWithMarket[];
  etfs: WatchlistRadarSuggestionWithMarket[];
  context: string;
  hasThemes: boolean;
  manualQuery: string;
  massiveLinked?: boolean;
  onManualQueryChange: (value: string) => void;
};

function fitTone(score: number): "pos" | "amber" | "default" {
  if (score >= 62) return "pos";
  if (score >= 40) return "amber";
  return "default";
}

function SuggestionCard({ item }: { item: WatchlistRadarSuggestionWithMarket }) {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const setWatchlistPipeline = useStore((s) => s.setWatchlistPipeline);
  const watching = watchlist.includes(item.symbol);
  const isEtf = item.kind === "etf";
  const strongFit = item.score >= 62;

  const openDetail = () => {
    router.push(
      (isEtf
        ? etfDetailRoute(item.symbol, APP_ROUTES.watchlist)
        : stockDetailRoute(item.symbol, APP_ROUTES.watchlist)) as never
    );
  };

  return (
    <View
      className={`rounded-[14px] border px-3.5 py-3.5 ${
        strongFit ? "bg-brand-bg/30 border-brand/35" : "bg-bg-surface border-line"
      }`}
    >
      <View className="flex-row items-start">
        <Pressable
          onPress={openDetail}
          className="flex-row items-start flex-1 min-w-0 active:opacity-85"
        >
          <View className="w-[40px] h-[40px] rounded-[11px] bg-brand/15 items-center justify-center mr-3">
            <Icon name="pulse" size={17} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1 min-w-0 pr-2">
            <View className="flex-row items-center flex-wrap gap-x-2 mb-1">
              <Text className="text-ink font-monoBold text-[15px]">{item.symbol}</Text>
              <Tag label={item.label} tone={fitTone(item.score)} />
            </View>
            <Text
              className={`text-[13.5px] font-sansBold leading-[19px] ${
                strongFit ? "text-brand" : "text-ink"
              }`}
              numberOfLines={2}
            >
              {item.headline}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]" numberOfLines={2}>
              {item.subline}
            </Text>
            <Text className="text-ink-3 text-[11px] font-sansMd mt-1" numberOfLines={1}>
              {item.name}
            </Text>
            {item.market ? (
              <Text className="text-ink-2 text-[11px] font-mono mt-1">
                ${item.market.price.toFixed(2)}
                <Text
                  className={
                    item.market.changePctDay >= 0 ? " text-pos font-mono" : " text-neg font-mono"
                  }
                >
                  {" "}
                  {item.market.changePctDay >= 0 ? "+" : ""}
                  {item.market.changePctDay.toFixed(2)}%
                </Text>
                <Text className="text-ink-3 font-sansMd"> · {item.market.sourceLabel}</Text>
              </Text>
            ) : null}
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!watching) toggle(item.symbol);
            const next: WatchlistPipelineState =
              item.score >= 62 ? "shortlisted" : "exploring";
            setWatchlistPipeline(item.symbol, next);
          }}
          hitSlop={8}
          className={`w-10 h-10 rounded-[11px] items-center justify-center ${
            watching ? "bg-brand" : "bg-bg-surface2 border border-brand"
          }`}
          accessibilityLabel={watching ? `${item.symbol} on watchlist` : `Add ${item.symbol} to watchlist`}
        >
          <Icon
            name={watching ? "check" : "plus"}
            size={18}
            sw={2.2}
            color={watching ? "#FFFFFF" : "#0E7A66"}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function WatchlistRadarSuggestions({
  stocks,
  etfs,
  context,
  hasThemes,
  manualQuery,
  massiveLinked = false,
  onManualQueryChange,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(manualQuery);

  useEffect(() => {
    setDraft(manualQuery);
  }, [manualQuery]);

  useEffect(() => {
    if (draft === manualQuery) return;
    const t = setTimeout(() => onManualQueryChange(draft), 150);
    return () => clearTimeout(t);
  }, [draft, manualQuery, onManualQueryChange]);

  const hasManual = draft.trim().length >= 3;
  const canRun = hasThemes || hasManual;

  if (!canRun) {
    return (
      <CardPlaceholder
        title="Thesis Radar needs your themes"
        body="Pick up to two themes in Builder, or type what you're looking for below (e.g. biotech companies)."
        actionLabel="Open Builder"
        onAction={() => router.push("/(tabs)/builder")}
        showInput
        draft={draft}
        onDraftChange={setDraft}
      />
    );
  }

  const empty = stocks.length === 0 && etfs.length === 0;
  const noteActive = draft.trim().length >= 3;

  return (
    <View className="mb-6">
      <SectionHeader
        context={context}
        draft={draft}
        onDraftChange={setDraft}
        massiveLinked={massiveLinked}
      />

      {noteActive && !empty && (
        <Text className="text-brand text-[11px] font-sansBold mb-2">
          Sorted for your note, passive theme list paused while this applies
        </Text>
      )}

      {empty ? (
        <View className="rounded-[14px] border border-dashed border-brand/30 bg-brand-bg/15 px-4 py-4 mb-4">
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
            No strong matches yet, try a more specific note (sector, ticker, or theme) or search
            above.
          </Text>
        </View>
      ) : (
        <>
          {stocks.length > 0 && (
            <>
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
                Stocks to add to watchlist
              </Text>
              <View className="gap-y-2.5 mb-4">
                {stocks.map((item) => (
                  <SuggestionCard key={item.symbol} item={item} />
                ))}
              </View>
            </>
          )}
          {etfs.length > 0 && (
            <>
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
                ETFs to consider
              </Text>
              <View className="gap-y-2.5">
                {etfs.map((item) => (
                  <SuggestionCard key={item.symbol} item={item} />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

function RadarNoteInput({
  draft,
  onDraftChange,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
}) {
  return (
    <View className="rounded-[12px] border border-brand/25 bg-bg-surface px-3 py-2.5 mb-3">
      <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1.5">
        What should Radar look for?
      </Text>
      <TextInput
        value={draft}
        onChangeText={onDraftChange}
        placeholder='e.g. "I am interested in biotech companies"'
        placeholderTextColor="#8C988F"
        multiline
        className="text-ink text-[14px] font-sansMd leading-[20px] min-h-[44px]"
        accessibilityLabel="Thesis Radar manual interest"
      />
      <Text className="text-ink-3 text-[10px] font-sansMd mt-1.5 leading-[14px]">
        Combines with your themes and goals, updates as you type.
      </Text>
    </View>
  );
}

function SectionHeader({
  context,
  draft,
  onDraftChange,
  massiveLinked,
}: {
  context: string;
  draft: string;
  onDraftChange: (v: string) => void;
  massiveLinked?: boolean;
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center mb-1">
        <Icon name="pulse" size={14} color="#0E7A66" sw={2} />
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest ml-1.5">
          Thesis Radar
        </Text>
      </View>
      <RadarNoteInput draft={draft} onDraftChange={onDraftChange} />
      <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px]">{context}</Text>
      <Text className="text-ink-3 text-[11px] font-sansMd mt-1 leading-[15px]">
        Passive pass on themes & goals, plus your note, educational only.
        {massiveLinked ? " Live tickers & prices via Massive when connected." : ""}
      </Text>
    </View>
  );
}

function CardPlaceholder({
  title,
  body,
  actionLabel,
  onAction,
  showInput,
  draft,
  onDraftChange,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  showInput?: boolean;
  draft?: string;
  onDraftChange?: (v: string) => void;
}) {
  return (
    <View className="mb-5 rounded-[14px] border border-brand/25 bg-brand-bg/20 px-4 py-4">
      <Text className="text-ink font-sansBold text-[15px]">{title}</Text>
      <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">{body}</Text>
      {showInput && draft != null && onDraftChange && (
        <View className="mt-3">
          <RadarNoteInput draft={draft} onDraftChange={onDraftChange} />
        </View>
      )}
      <Pressable onPress={onAction} className="mt-3 active:opacity-70">
        <Text className="text-brand text-[13px] font-sansBold">{actionLabel} →</Text>
      </Pressable>
    </View>
  );
}
