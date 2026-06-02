import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { formatForecastUsd, type ForecastPoint } from "@/lib/forecast-model";

type Props = {
  points: ForecastPoint[];
  baselinePoints?: ForecastPoint[];
  retirementYear?: number;
  eventYears?: number[];
  height?: number;
  revision?: string;
};

function buildPath(
  points: ForecastPoint[],
  chartW: number,
  height: number,
  yMax: number
): string {
  const min = 0;
  const xStep = chartW / Math.max(1, points.length - 1);
  return points
    .map((p, i) => {
      const x = i * xStep;
      const y = height - 16 - ((p.netWorth - min) / yMax) * (height - 32);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ForecastChart({
  points,
  baselinePoints,
  retirementYear,
  eventYears = [],
  height = 180,
  revision = "",
}: Props) {
  const { width: screenW } = useWindowDimensions();
  const chartW = Math.min(screenW - 56, 360);

  const { path, baselinePath, markers } = useMemo(() => {
    const values = [...points.map((p) => p.netWorth)];
    if (baselinePoints?.length) values.push(...baselinePoints.map((p) => p.netWorth));
    const yMax = Math.max(...values, 1) * 1.05;
    const xStep = chartW / Math.max(1, points.length - 1);

    const markers = points
      .filter((p) => p.year === retirementYear || eventYears.includes(p.year))
      .map((p) => {
        const i = points.findIndex((x) => x.year === p.year);
        const x = i * xStep;
        const y = height - 16 - (p.netWorth / yMax) * (height - 32);
        return { year: p.year, x, y };
      });

    return {
      path: buildPath(points, chartW, height, yMax),
      baselinePath: baselinePoints?.length
        ? buildPath(baselinePoints, chartW, height, yMax)
        : null,
      markers,
    };
  }, [points, baselinePoints, chartW, height, retirementYear, eventYears]);

  const first = points[0]?.year ?? 2026;
  const last = points[points.length - 1]?.year ?? 2050;

  return (
    <View>
      <View style={{ height }}>
        <Svg width={chartW} height={height}>
          <Line x1={0} y1={height - 8} x2={chartW} y2={height - 8} stroke="#E2E8E4" strokeWidth={1} />
          {baselinePath && (
            <Path
              d={baselinePath}
              fill="none"
              stroke="#8C988F"
              strokeWidth={1.5}
              strokeDasharray="4 6"
              strokeLinecap="round"
              opacity={0.7}
            />
          )}
          <Path
            key={revision}
            d={path}
            fill="none"
            stroke="#0E7A66"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {markers.map((m) => (
            <Line
              key={m.year}
              x1={m.x}
              y1={m.y}
              x2={m.x}
              y2={height - 8}
              stroke="#0E7A6644"
              strokeWidth={1}
            />
          ))}
          {markers.map((m) => (
            <Circle key={`c-${m.year}`} cx={m.x} cy={m.y} r={4} fill="#0E7A66" />
          ))}
        </Svg>
      </View>
      <View className="flex-row justify-between mt-1" style={{ width: chartW }}>
        <Text className="text-ink-3 text-[10px] font-sansMd">{first}</Text>
        <Text className="text-ink-3 text-[10px] font-sansMd">{last}</Text>
      </View>
      <View className="flex-row flex-wrap gap-x-3 mt-2">
        <Text className="text-ink-2 text-[12px] font-monoBold">
          Scenario {formatForecastUsd(Math.max(...points.map((p) => p.netWorth)))}
        </Text>
        {baselinePoints && (
          <Text className="text-ink-3 text-[12px] font-sansMd">Dashed = default assumptions</Text>
        )}
      </View>
    </View>
  );
}
