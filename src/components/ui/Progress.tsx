import { View } from "react-native";

type BarColor = "brand" | "pos" | "amber" | "neg" | "violet" | "white";

const colorClass: Record<BarColor, string> = {
  brand: "bg-brand",
  pos: "bg-pos",
  amber: "bg-amber",
  neg: "bg-neg",
  violet: "bg-violet",
  white: "bg-white",
};

export function Bar({
  pct,
  color = "brand",
  height = 8,
  trackClass = "bg-track",
}: {
  pct: number;
  color?: BarColor;
  height?: number;
  trackClass?: string;
}) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View
      className={`w-full rounded-full overflow-hidden ${trackClass}`}
      style={{ height }}
    >
      <View
        className={`h-full rounded-full ${colorClass[color]}`}
        style={{ width: `${clamped * 100}%` }}
      />
    </View>
  );
}

/** Health-bar that picks color based on value (0-100). */
export function ScoreBar({ value, height = 5 }: { value: number; height?: number }) {
  const color: BarColor = value >= 70 ? "pos" : value >= 45 ? "amber" : "neg";
  return <Bar pct={value / 100} color={color} height={height} />;
}
