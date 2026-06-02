import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import type { PerformanceSeries } from "@/data/demo-performance";

type Props = {
  series: PerformanceSeries[];
  xLabels?: string[];
  height?: number;
};

function buildPath(
  values: number[],
  width: number,
  height: number,
  yMin: number,
  yMax: number
): string {
  const yRange = yMax - yMin || 1;
  const xStep = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * xStep;
      const y = height - 12 - ((v - yMin) / yRange) * (height - 28);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function PerformanceChart({ series, xLabels, height = 160 }: Props) {
  const { width: screenW } = useWindowDimensions();
  const chartW = Math.min(screenW - 72, 340);
  const padLeft = 36;

  const { yMin, yMax, paths } = useMemo(() => {
    const all = series.flatMap((s) => s.values);
    const min = Math.min(...all, -2);
    const max = Math.max(...all, 2);
    const pad = (max - min) * 0.08 || 1;
    const yMin = Math.floor((min - pad) * 2) / 2;
    const yMax = Math.ceil((max + pad) * 2) / 2;
    const paths = series.map((s) => ({
      id: s.id,
      color: s.color,
      d: buildPath(s.values, chartW, height, yMin, yMax),
      last: s.values[s.values.length - 1],
    }));
    return { yMin, yMax, paths };
  }, [series, chartW, height]);

  const yTicks = useMemo(() => {
    const step = yMax - yMin <= 20 ? 5 : 10;
    const ticks: number[] = [];
    for (let v = yMin; v <= yMax + 0.01; v += step) ticks.push(v);
    return ticks;
  }, [yMin, yMax]);

  const labels = xLabels ?? [];

  return (
    <View>
      <View className="flex-row" style={{ height }}>
        <View className="w-[32px] justify-between py-1">
          {[...yTicks].reverse().map((t) => (
            <Text key={t} className="text-ink-3 text-[9px] font-mono text-right">
              {t >= 0 ? `${t}%` : `${t}%`}
            </Text>
          ))}
        </View>
        <Svg width={chartW} height={height}>
          {yTicks.map((t) => {
            const y =
              height - 12 - ((t - yMin) / (yMax - yMin || 1)) * (height - 28);
            return (
              <Line
                key={t}
                x1={0}
                y1={y}
                x2={chartW}
                y2={y}
                stroke="#E2E8E4"
                strokeWidth={1}
              />
            );
          })}
          {paths.map((p) => (
            <Path
              key={p.id}
              d={p.d}
              fill="none"
              stroke={series.find((s) => s.id === p.id)?.color ?? "#0E7A66"}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {paths
            .filter((p) => p.id === "portfolio" || p.id === "sp500")
            .map((p) => {
              const s = series.find((x) => x.id === p.id)!;
              const lastY =
                height -
                12 -
                ((p.last - yMin) / (yMax - yMin || 1)) * (height - 28);
              return (
                <Circle
                  key={`dot-${p.id}`}
                  cx={chartW}
                  cy={lastY}
                  r={3.5}
                  fill={s.color}
                />
              );
            })}
        </Svg>
      </View>

      {labels.length > 0 && (
        <View
          className="flex-row justify-between mt-1"
          style={{ marginLeft: padLeft, width: chartW }}
        >
          {labels.map((l) => (
            <Text key={l} className="text-ink-3 text-[9px] font-sansMd">
              {l}
            </Text>
          ))}
        </View>
      )}

      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-3 ml-1">
        {series.map((s) => (
          <View key={s.id} className="flex-row items-center">
            <View
              className="w-[8px] h-[8px] rounded-full mr-1.5"
              style={{ backgroundColor: s.color }}
            />
            <Text className="text-ink-2 text-[11px] font-sansMd">{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
