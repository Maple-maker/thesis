import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/store";
import type { WatchlistAlert } from "@/store/types";

// ── Helpers ──────────────────────────────────────────────────

const TYPE_LABEL: Record<WatchlistAlert["type"], string> = {
  "price-above": "Price above",
  "price-below": "Price below",
  "conviction-change": "Conviction change",
};

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Props ────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  /** When set, opens with focus on adding an alert for this symbol */
  focusSymbol?: string;
};

// ── Component ────────────────────────────────────────────────

export function WatchlistAlertsSheet({ onClose, focusSymbol }: Props) {
  const watchlistAlerts = useStore((s) => s.watchlistAlerts);
  const removeAlert = useStore((s) => s.removeWatchlistAlert);
  const dismissTriggered = useStore((s) => s.dismissTriggeredAlert);
  const addAlert = useStore((s) => s.addWatchlistAlert);

  const [addingForSymbol, setAddingForSymbol] = useState<string | null>(
    focusSymbol ?? null
  );
  const [alertType, setAlertType] = useState<"price" | "conviction" | null>(null);
  const [priceDir, setPriceDir] = useState<"above" | "below">("above");
  const [priceTarget, setPriceTarget] = useState("");
  const [convDir, setConvDir] = useState<"up" | "down">("up");

  // ── Derived ───────────────────────────────────────────────

  const grouped = useMemo(() => {
    const map = new Map<string, WatchlistAlert[]>();
    for (const a of watchlistAlerts) {
      const key = a.symbol.toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [watchlistAlerts]);

  const hasTriggered = watchlistAlerts.some((a) => a.triggered);
  const triggeredCount = watchlistAlerts.filter((a) => a.triggered).length;

  // ── Actions ───────────────────────────────────────────────

  function handleAddPrice() {
    const val = parseFloat(priceTarget);
    if (isNaN(val) || val <= 0 || !addingForSymbol) return;
    addAlert({
      symbol: addingForSymbol,
      type: priceDir === "above" ? "price-above" : "price-below",
      threshold: val,
    });
    setPriceTarget("");
    setAlertType(null);
    setAddingForSymbol(null);
  }

  function handleAddConviction() {
    if (!addingForSymbol) return;
    addAlert({
      symbol: addingForSymbol,
      type: "conviction-change",
      convictionDirection: convDir,
    });
    setAlertType(null);
    setAddingForSymbol(null);
  }

  function clearTriggered() {
    for (const a of watchlistAlerts) {
      if (a.triggered) dismissTriggered(a.id);
    }
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-bg rounded-t-[28px]">
      {/* ── Handle ── */}
      <View className="items-center pt-3 pb-2">
        <View className="w-9 h-1 rounded-full bg-line-strong" />
      </View>

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 pb-2">
        <Text className="text-ink text-[20px] font-displayX">Alerts</Text>
        <View className="flex-row gap-2">
          {hasTriggered && (
            <Pressable
              onPress={clearTriggered}
              className="px-3 py-1.5 rounded-[10px] bg-amber-bg active:opacity-70"
            >
              <Text className="text-amber text-[12px] font-sansBold">
                Clear triggered ({triggeredCount})
              </Text>
            </Pressable>
          )}
          <Pressable onPress={onClose} hitSlop={8} className="p-1.5">
            <Icon name="close" size={20} color="#4D5A54" sw={1.8} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-5"
      >
        {/* ── Empty state ── */}
        {watchlistAlerts.length === 0 && !addingForSymbol && (
          <View className="items-center py-20">
            <View className="bg-line/50 w-14 h-14 rounded-[14px] items-center justify-center mb-4">
              <Icon name="bell" size={26} color="#8C988F" sw={1.5} />
            </View>
            <Text className="text-ink-2 text-[15px] font-sansMd text-center leading-[21px]">
              No alerts set.{"\n"}Tap the bell on any stock to create one.
            </Text>
          </View>
        )}

        {/* ── Inline add-form ── */}
        {addingForSymbol && (
          <Card pad={16} className="mb-4 border-brand">
            <Text className="text-ink text-[15px] font-sansBold mb-3">
              Set alert for {addingForSymbol}
            </Text>

            {/* Type picker */}
            <View className="flex-row gap-2 mb-3">
              <Pressable
                onPress={() => setAlertType("price")}
                className={`px-3 py-2 rounded-[10px] border active:opacity-70 ${
                  alertType === "price"
                    ? "bg-brand-bg border-brand"
                    : "bg-bg-surface border-line"
                }`}
              >
                <Text
                  className={`text-[12px] font-sansBold ${
                    alertType === "price" ? "text-brand" : "text-ink-2"
                  }`}
                >
                  Price alert
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setAlertType("conviction")}
                className={`px-3 py-2 rounded-[10px] border active:opacity-70 ${
                  alertType === "conviction"
                    ? "bg-brand-bg border-brand"
                    : "bg-bg-surface border-line"
                }`}
              >
                <Text
                  className={`text-[12px] font-sansBold ${
                    alertType === "conviction" ? "text-brand" : "text-ink-2"
                  }`}
                >
                  Conviction alert
                </Text>
              </Pressable>
            </View>

            {/* Price form */}
            {alertType === "price" && (
              <View>
                <View className="flex-row gap-2 mb-2">
                  <Pressable
                    onPress={() => setPriceDir("above")}
                    className={`px-3 py-1.5 rounded-[8px] border active:opacity-70 ${
                      priceDir === "above"
                        ? "bg-pos-bg border-pos"
                        : "bg-bg-surface border-line"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-sansBold ${
                        priceDir === "above" ? "text-pos" : "text-ink-2"
                      }`}
                    >
                      Above $
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPriceDir("below")}
                    className={`px-3 py-1.5 rounded-[8px] border active:opacity-70 ${
                      priceDir === "below"
                        ? "bg-neg-bg border-neg"
                        : "bg-bg-surface border-line"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-sansBold ${
                        priceDir === "below" ? "text-neg" : "text-ink-2"
                      }`}
                    >
                      Below $
                    </Text>
                  </Pressable>
                </View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-ink-2 text-[13px] font-monoBold">$</Text>
                  <View className="flex-1 bg-bg-subtle border border-line rounded-[10px] px-3 py-2">
                    <TextInput
                      value={priceTarget}
                      onChangeText={setPriceTarget}
                      placeholder="e.g. 200"
                      placeholderTextColor="#8C988F"
                      keyboardType="decimal-pad"
                      className="text-ink text-[15px] font-monoBold flex-1"
                    />
                  </View>
                </View>
                <Pressable
                  onPress={handleAddPrice}
                  disabled={!priceTarget || isNaN(parseFloat(priceTarget))}
                  className={`py-2.5 rounded-[10px] items-center active:opacity-70 ${
                    priceTarget && !isNaN(parseFloat(priceTarget))
                      ? "bg-brand"
                      : "bg-line"
                  }`}
                >
                  <Text className="text-white text-[13px] font-sansBold">
                    Set Price Alert
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Conviction form */}
            {alertType === "conviction" && (
              <View>
                <View className="flex-row gap-2 mb-3">
                  <Pressable
                    onPress={() => setConvDir("up")}
                    className={`flex-1 px-3 py-2 rounded-[10px] border items-center active:opacity-70 ${
                      convDir === "up"
                        ? "bg-pos-bg border-pos"
                        : "bg-bg-surface border-line"
                    }`}
                  >
                    <Icon
                      name="arrow"
                      size={16}
                      color={convDir === "up" ? "#149059" : "#4D5A54"}
                      sw={2}
                    />
                    <Text
                      className={`text-[11px] font-sansBold mt-0.5 ${
                        convDir === "up" ? "text-pos" : "text-ink-2"
                      }`}
                    >
                      Up
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConvDir("down")}
                    className={`flex-1 px-3 py-2 rounded-[10px] border items-center active:opacity-70 ${
                      convDir === "down"
                        ? "bg-neg-bg border-neg"
                        : "bg-bg-surface border-line"
                    }`}
                  >
                    <Icon
                      name="arrow"
                      size={16}
                      color={convDir === "down" ? "#D8472C" : "#4D5A54"}
                      sw={2}
                    />
                    <Text
                      className={`text-[11px] font-sansBold mt-0.5 ${
                        convDir === "down" ? "text-neg" : "text-ink-2"
                      }`}
                    >
                      Down
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={handleAddConviction}
                  className="bg-brand py-2.5 rounded-[10px] items-center active:opacity-70"
                >
                  <Text className="text-white text-[13px] font-sansBold">
                    Set Conviction Alert
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Cancel */}
            <Pressable
              onPress={() => {
                setAddingForSymbol(null);
                setAlertType(null);
                setPriceTarget("");
              }}
              className="mt-2 py-1.5 items-center"
            >
              <Text className="text-ink-3 text-[12px] font-sansMd">Cancel</Text>
            </Pressable>
          </Card>
        )}

        {/* ── Grouped alerts ── */}
        {grouped.map(([symbol, alerts]) => (
          <View key={symbol} className="mb-4">
            <Text className="text-ink-2 text-[11px] font-sansX uppercase tracking-widest mb-2">
              {symbol}
            </Text>
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                pad={12}
                className={`mb-1.5 ${alert.triggered ? "border-amber" : ""}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-ink text-[13px] font-sansSb">
                        {TYPE_LABEL[alert.type]}
                      </Text>
                      {alert.triggered && (
                        <View className="bg-amber-bg px-2 py-0.5 rounded-[6px]">
                          <Text className="text-amber text-[10px] font-sansBold">
                            Triggered
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5">
                      {alert.type === "price-above" || alert.type === "price-below"
                        ? `${alert.type === "price-above" ? "Above" : "Below"} $${alert.threshold?.toFixed(2) ?? "—"}`
                        : `Conviction moves ${alert.convictionDirection === "up" ? "up" : "down"}`}
                    </Text>
                    {alert.triggeredAt && (
                      <Text className="text-amber text-[11px] font-sansMd mt-0.5">
                        Triggered {formatTimestamp(alert.triggeredAt)}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => removeAlert(alert.id)}
                    hitSlop={10}
                    className="ml-2 p-2 active:opacity-60"
                  >
                    <Icon name="close" size={16} color="#8C988F" sw={1.8} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
