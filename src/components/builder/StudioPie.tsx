import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { AllocationPieChart } from "@/components/builder/AllocationPieChart";
import type { LensHolding } from "@/data/investor-lenses";

const COLORS = ["#0E7A66", "#5B9BD5", "#7C3AED", "#D98512", "#D8472C", "#8C988F", "#3B82F6", "#C43B3B"];

export type StudioSlice = {
  symbol: string;
  name: string;
  weightPct: number;
  kind: "stock" | "etf" | "cash";
  color: string;
};

type Props = {
  slices: StudioSlice[];
  selectedSymbol: string | null;
  onSelect: (symbol: string | null) => void;
  size?: number;
};

export function StudioPie({ slices, selectedSymbol, onSelect, size = 200 }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
  }, [slices.length]);

  const selectedIndex = useMemo(
    () => (selectedSymbol ? slices.findIndex((s) => s.symbol === selectedSymbol) : -1),
    [selectedSymbol, slices]
  );

  const chartSlices = useMemo(
    () =>
      slices.map((s, i) => ({
        pct: s.weightPct,
        color: s.color,
        label: s.symbol,
      })),
    [slices]
  );

  const hasHoldings = slices.length > 0 && slices.some((s) => s.kind !== "cash");

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      {hasHoldings ? (
        <AllocationPieChart
          slices={chartSlices}
          size={size}
          innerRadiusRatio={0.58}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : undefined}
        />
      ) : (
        <EmptyPie size={size} />
      )}
    </Animated.View>
  );
}

function EmptyPie({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: "#E6DECF",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FCF9F2",
      }}
    >
      <Text className="text-ink-3 text-[13px] font-sansSb text-center px-6">
        Your portfolio will appear here
      </Text>
    </View>
  );
}

/** Convert LensHolding[] to StudioSlice[] with consistent colors */
export function holdingsToSlices(holdings: LensHolding[]): StudioSlice[] {
  return holdings.map((h, i) => ({
    symbol: h.symbol,
    name: h.symbol,
    weightPct: h.weightPct,
    kind: h.kind,
    color: COLORS[i % COLORS.length],
  }));
}

/** Normalize slices to sum to 100% */
export function normalizeSlices(slices: StudioSlice[]): StudioSlice[] {
  const total = slices.reduce((s, sl) => s + sl.weightPct, 0);
  if (total <= 0 || Math.abs(total - 100) < 0.1) return slices;
  return slices.map((sl) => ({
    ...sl,
    weightPct: Math.round((sl.weightPct / total) * 1000) / 10,
  }));
}

/** Create equal-weight slices from symbols */
export function equalWeightSlices(
  symbols: { symbol: string; name: string; kind: "stock" | "etf" }[]
): StudioSlice[] {
  if (symbols.length === 0) return [];
  const each = Math.floor(1000 / symbols.length) / 10;
  const remainder = Math.round((100 - each * symbols.length) * 10) / 10;
  return symbols.map((s, i) => ({
    ...s,
    weightPct: i === 0 ? each + remainder : each,
    color: COLORS[i % COLORS.length],
  }));
}
