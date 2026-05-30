import { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  pct: number; // 0..1
  size?: number;
  sw?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
};

export function Ring({
  pct,
  size = 40,
  sw = 4,
  color = "#0E7A66",
  trackColor = "#EDF0EB",
  children,
}: Props) {
  const radius = size / 2 - sw / 2 - 1;
  const c = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(1, pct));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={sw}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${c * value} ${c}`}
        />
      </Svg>
      {children}
    </View>
  );
}
