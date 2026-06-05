import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { AllocationPieChart } from "@/components/builder/AllocationPieChart";
import { Tick } from "@/components/ui/Tick";
import { sliceColorForIndex } from "@/lib/allocation-pie-colors";
import { CASH_SLICE_SYMBOL } from "@/types/pie-customization";
import type { PieAllocationRow } from "@/types/pie-customization";

export type BuilderAllocationRow = PieAllocationRow;

type Props = {
  rows: BuilderAllocationRow[];
  /** Compact pie for Builder home preview */
  compact?: boolean;
  title?: string;
  editable?: boolean;
  selectedSymbol?: string | null;
  onSelectSymbol?: (symbol: string | null) => void;
  onWeightChange?: (symbol: string, weightPct: number) => void;
  onRemove?: (symbol: string) => void;
};

export function BuilderAllocationPie({
  rows,
  compact = false,
  title,
  editable = false,
  selectedSymbol: selectedProp,
  onSelectSymbol,
  onWeightChange,
  onRemove,
}: Props) {
  const router = useRouter();
  const [selectedLocal, setSelectedLocal] = useState<string | null>(null);
  const selected = editable && onSelectSymbol ? selectedProp ?? null : selectedLocal;
  const setSelected = editable && onSelectSymbol ? onSelectSymbol : setSelectedLocal;

  // Inline weight editing — tap a % number to type a new value directly
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<TextInput>(null);

  const commitEdit = (symbol: string) => {
    const v = parseFloat(editValue);
    if (!isNaN(v) && onWeightChange) {
      onWeightChange(symbol, Math.max(0, Math.min(100, v)));
    }
    setEditingSymbol(null);
    setEditValue("");
  };

  const slices = useMemo(
    () =>
      rows.map((r, i) => ({
        pct: r.weightPct,
        color:
          r.symbol === CASH_SLICE_SYMBOL
            ? "#8C988F"
            : sliceColorForIndex(i),
        id: r.symbol,
      })),
    [rows]
  );

  const selectedIndex =
    selected != null ? rows.findIndex((r) => r.symbol === selected) : null;

  const pieSize = compact ? 148 : 232;
  const selectedRow = selectedIndex != null && selectedIndex >= 0 ? rows[selectedIndex] : null;

  if (rows.length === 0) return null;

  return (
    <View>
      {title && !compact ? (
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-3">
          {title}
        </Text>
      ) : null}

      <View className={compact ? "flex-row items-center gap-3" : ""}>
        <AllocationPieChart
          slices={slices}
          size={pieSize}
          innerRadiusRatio={0.58}
          selectedIndex={selectedIndex != null && selectedIndex >= 0 ? selectedIndex : null}
          centerTopLabel={selectedRow ? selectedRow.symbol : "Target"}
          centerBottomLabel={
            selectedRow ? `${selectedRow.weightPct}%` : "100%"
          }
        />

        <View className={compact ? "flex-1" : "mt-2"}>
          {rows.map((r, i) => {
            const active = selected === r.symbol;
            const color = sliceColorForIndex(i);
            return (
              <Pressable
                key={r.symbol}
                onPress={() => {
                  // In compact mode (builder landing), tap opens the detail view
                  if (compact && r.symbol !== CASH_SLICE_SYMBOL) {
                    const path =
                      r.kind === "etf"
                        ? "/(tabs)/etf/[symbol]"
                        : "/(tabs)/stock/[symbol]";
                    router.push({ pathname: path as never, params: { symbol: r.symbol } });
                    return;
                  }
                  // In full mode, tap selects the slice for weight editing
                  setSelected(selected === r.symbol ? null : r.symbol);
                }}
                onLongPress={() => {
                  // In full/editable mode, long press opens detail
                  if (compact || r.symbol === CASH_SLICE_SYMBOL || editable) return;
                  const path =
                    r.kind === "etf"
                      ? "/(tabs)/etf/[symbol]"
                      : "/(tabs)/stock/[symbol]";
                  router.push({ pathname: path as never, params: { symbol: r.symbol } });
                }}
                className={`flex-row items-center py-2.5 rounded-[10px] px-1 active:opacity-80 ${
                  active ? "bg-brand-bg/60" : ""
                } ${i < rows.length - 1 && !compact ? "border-b border-line" : ""}`}
              >
                <View
                  className="w-1 h-9 rounded-full mr-2.5"
                  style={{ backgroundColor: color }}
                />
                {!compact && r.symbol !== CASH_SLICE_SYMBOL ? (
                  <Tick ticker={r.symbol} size={34} color={color} />
                ) : !compact ? (
                  <View
                    className="w-[34px] h-[34px] rounded-[10px] items-center justify-center mr-0"
                    style={{ backgroundColor: "#EAEDE8" }}
                  >
                    <Text className="text-ink-3 text-[10px] font-sansX">$</Text>
                  </View>
                ) : null}
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-ink font-monoBold text-[14px]">{r.symbol}</Text>
                    {compact ? (
                      <Text className="text-ink-2 text-[11px] font-sansMd" numberOfLines={1}>
                        {r.name}
                      </Text>
                    ) : null}
                  </View>
                  {!compact && (
                    <Text className="text-ink-2 text-[12px] font-sansMd" numberOfLines={1}>
                      {r.name}
                    </Text>
                  )}
                  {r.role && !compact ? (
                    <Text className="text-ink-3 text-[11px] font-sansMd mt-0.5" numberOfLines={1}>
                      {r.role}
                    </Text>
                  ) : null}
                </View>
                {/* Inline weight editor — tap % to type a new value */}
                {editable && editingSymbol === r.symbol ? (
                  <TextInput
                    ref={editInputRef}
                    value={editValue}
                    onChangeText={setEditValue}
                    onSubmitEditing={() => commitEdit(r.symbol)}
                    onBlur={() => commitEdit(r.symbol)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    autoFocus
                    className="bg-brand-bg border border-brand rounded-[7px] px-2 py-0.5 text-ink font-monoBold text-[14px] text-center ml-2"
                    style={{ minWidth: 48 }}
                  />
                ) : (
                  <Pressable
                    onPress={() => {
                      if (!editable) return;
                      setEditingSymbol(r.symbol);
                      setEditValue(String(r.weightPct));
                    }}
                    className="ml-2 px-1.5 py-0.5 rounded-[6px] active:bg-brand-bg/60"
                    hitSlop={8}
                  >
                    <Text className="text-ink font-monoBold text-[16px]">
                      {r.weightPct}%
                    </Text>
                  </Pressable>
                )}
                {editable && onRemove && r.symbol !== CASH_SLICE_SYMBOL && (
                  <Pressable
                    onPress={() => onRemove(r.symbol)}
                    hitSlop={8}
                    className="ml-2 w-[24px] h-[24px] rounded-[6px] bg-neg-bg items-center justify-center active:opacity-70"
                  >
                    <Icon name="close" size={11} color="#D8472C" sw={2.5} />
                  </Pressable>
                )}
                {compact && r.symbol !== CASH_SLICE_SYMBOL && (
                  <Icon name="chev" size={12} color="#8C988F" sw={2} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {!compact ? (
        <Text className="text-ink-3 text-[10px] font-sansMd text-center mt-2 leading-[14px]">
          {editable
            ? "Tap a slice to adjust weight · long-press a ticker for details"
            : "Tap a slice to highlight · long-press a row for details"}
        </Text>
      ) : null}
    </View>
  );
}
