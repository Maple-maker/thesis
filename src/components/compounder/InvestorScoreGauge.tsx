import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  score: number;      // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function InvestorScoreGauge({
  score,
  size = 120,
  strokeWidth = 10,
  label,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const color =
    score >= 70 ? "#0E7A66" : score >= 45 ? "#D98512" : "#D32F2F";

  const bgColor =
    score >= 70 ? "#0E7A661A" : score >= 45 ? "#D985121A" : "#D32F2F1A";

  const center = size / 2;

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>
        {/* Center text */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            className="font-monoBold"
            style={{
              fontSize: size * 0.28,
              color,
              letterSpacing: -1,
            }}
          >
            {score}
          </Text>
          {label && (
            <Text
              className="text-ink-3 font-sansMd"
              style={{ fontSize: size * 0.1, marginTop: 2 }}
            >
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
