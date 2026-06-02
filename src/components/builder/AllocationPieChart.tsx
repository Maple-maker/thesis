import { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { G, Path } from "react-native-svg";

export type PieSliceInput = {
  pct: number;
  color: string;
  id?: string;
};

type Props = {
  slices: PieSliceInput[];
  size?: number;
  /** 0 = filled pie; ~0.58 = M1-style donut hole */
  innerRadiusRatio?: number;
  selectedIndex?: number | null;
  centerTopLabel?: string;
  centerBottomLabel?: string;
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number
): string {
  if (endDeg - startDeg >= 359.99) {
    // Full ring segment, draw as circle annulus workaround with two half arcs
    endDeg = startDeg + 359.99;
  }
  const outerStart = polar(cx, cy, rOuter, endDeg);
  const outerEnd = polar(cx, cy, rOuter, startDeg);
  const innerStart = polar(cx, cy, rInner, startDeg);
  const innerEnd = polar(cx, cy, rInner, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

export function AllocationPieChart({
  slices,
  size = 220,
  innerRadiusRatio = 0.58,
  selectedIndex = null,
  centerTopLabel,
  centerBottomLabel,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * innerRadiusRatio;

  const segments = useMemo(() => {
    let angle = -90;
    return slices.map((s, index) => {
      const sweep = (s.pct / 100) * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      const path =
        innerRadiusRatio <= 0.02
          ? (() => {
              const oStart = polar(cx, cy, outerR, end);
              const oEnd = polar(cx, cy, outerR, start);
              const large = sweep > 180 ? 1 : 0;
              return `M ${cx} ${cy} L ${oStart.x} ${oStart.y} A ${outerR} ${outerR} 0 ${large} 0 ${oEnd.x} ${oEnd.y} Z`;
            })()
          : donutSlicePath(cx, cy, outerR, innerR, start, end);
      return { ...s, index, path, start, end };
    });
  }, [slices, cx, cy, outerR, innerR, innerRadiusRatio]);

  const totalPct = slices.reduce((s, x) => s + x.pct, 0);

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G>
            {segments.map((seg) => {
              const dim =
                selectedIndex != null && selectedIndex !== seg.index;
              return (
                <Path
                  key={seg.id ?? seg.index}
                  d={seg.path}
                  fill={seg.color}
                  opacity={dim ? 0.28 : 1}
                />
              );
            })}
          </G>
        </Svg>
        {(centerTopLabel || centerBottomLabel) && (
          <View
            className="absolute inset-0 items-center justify-center px-6"
            pointerEvents="none"
          >
            {centerTopLabel ? (
              <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest text-center">
                {centerTopLabel}
              </Text>
            ) : null}
            {centerBottomLabel ? (
              <Text
                className="text-ink font-monoBold text-[20px] text-center mt-0.5"
                style={{ letterSpacing: -0.4 }}
              >
                {centerBottomLabel}
              </Text>
            ) : null}
          </View>
        )}
      </View>
      {Math.abs(totalPct - 100) > 0.5 && slices.length > 0 ? (
        <Text className="text-amber text-[10px] font-sansMd mt-1">
          Weights sum to {totalPct.toFixed(1)}%
        </Text>
      ) : null}
    </View>
  );
}
