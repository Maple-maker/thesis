import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  score: number; // 0-100
  size?: number;
  label?: string;
};

/** 270° arc health gauge, score in the middle, label below. */
export function HealthGauge({ score, size = 150, label }: Props) {
  const sw = 11;
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const sweep = 0.75; // 270°
  const dashLen = circumference * sweep;
  const filled = dashLen * Math.max(0, Math.min(1, score / 100));

  const color = score >= 70 ? "#149059" : score >= 45 ? "#D98512" : "#D8472C";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* SVG rotated 135° so the gap is at the bottom */}
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "135deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDF0EB"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference - dashLen}`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
      </Svg>
      <View className="items-center">
        <Text
          className="text-ink font-displayX"
          style={{ fontSize: size * 0.3, letterSpacing: -1, lineHeight: size * 0.32 }}
        >
          {score}
        </Text>
        {label ? (
          <Text
            className="font-sansX uppercase tracking-widest mt-1"
            style={{ fontSize: 12, color }}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
