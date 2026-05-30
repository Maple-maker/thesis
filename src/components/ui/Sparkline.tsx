import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  data: number[];
  color?: string;
  height?: number;
  showDot?: boolean;
  fill?: boolean;
};

/** Minimal SVG sparkline — no axes, no grid, just the line + optional fill. */
export function Sparkline({
  data,
  color = "#0E7A66",
  height = 48,
  showDot = true,
  fill = false,
}: Props) {
  if (data.length < 2) return null;

  const width = data.length * 12; // scale based on point count
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xStep = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * xStep,
    y: height - ((v - min) / range) * (height - 8) - 4,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const fillPath =
    fill && points.length > 1
      ? `${linePath} L${points[points.length - 1].x} ${height} L${points[0].x} ${height} Z`
      : undefined;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {fill && fillPath && (
          <>
            <Defs>
              <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.2} />
                <Stop offset="1" stopColor={color} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#sparkFill)" />
          </>
        )}
        <Path d={linePath} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        {showDot && (
          <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} />
        )}
      </Svg>
    </View>
  );
}
