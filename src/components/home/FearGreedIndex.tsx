import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle as SvgCircle, Line, Path } from "react-native-svg";

import { Card } from "@/components/ui/Card";
import type { SentimentSnapshot } from "@/lib/thesis-api";
import { getMarketSentiment } from "@/lib/thesis-api";

const RATING_COLORS: Record<string, string> = {
  "extreme fear": "#D8472C",
  fear: "#D98512",
  neutral: "#8C988F",
  greed: "#149059",
  "extreme greed": "#0E7A66",
};

const RATING_LABELS: Record<string, string> = {
  "extreme fear": "Extreme Fear",
  fear: "Fear",
  neutral: "Neutral",
  greed: "Greed",
  "extreme greed": "Extreme Greed",
};

function gaugeColor(score: number): string {
  if (score <= 25) return "#D8472C";
  if (score <= 45) return "#D98512";
  if (score <= 55) return "#8C988F";
  if (score <= 75) return "#149059";
  return "#0E7A66";
}

// ── Speedometer geometry ────────────────────────────────────────────

/**
 * Score 0–100 → angle π (left) … 0 (right).
 * The semicircle sweeps across the **top**.
 */
function scoreToAngle(score: number): number {
  return Math.PI * (1 - score / 100);
}

/** Polar → SVG cartesian (svg y-axis is inverted). */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad),
  };
}

/** Build an SVG arc path along the top semicircle between two angles. */
function arc(
  cx: number,
  cy: number,
  r: number,
  a1: number,
  a2: number,
): string {
  const s = polarToCartesian(cx, cy, r, a1);
  const e = polarToCartesian(cx, cy, r, a2);
  // sweep-flag=1 → arc drawn above the chord (top half)
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
}

// ── Constants ───────────────────────────────────────────────────────

const SVG_W = 320;
const SVG_H = 170;
const CX = SVG_W / 2; // 160
const CY = 140;
const ARC_R = 100;
const ARC_SW = 16;
const NEEDLE_LEN = 88;

/** How far tick marks poke through the arc. */
const TICK_INNER = ARC_R - ARC_SW / 2 - 4;
const TICK_OUTER = ARC_R + ARC_SW / 2 + 5;

const SEGMENTS = [
  { start: 0, end: 25, color: "#D8472C" },
  { start: 25, end: 45, color: "#D98512" },
  { start: 45, end: 55, color: "#8C988F" },
  { start: 55, end: 75, color: "#149059" },
  { start: 75, end: 100, color: "#0E7A66" },
] as const;

const TICKS = [0, 25, 50, 75, 100] as const;

// ── Component ───────────────────────────────────────────────────────

export function FearGreedIndex() {
  const [snap, setSnap] = useState<SentimentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMarketSentiment("overview");
        if (!cancelled) setSnap(data);
      } catch {
        // API unavailable — leave as null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card pad={16} className="mb-4">
        <View className="h-[100px] items-center justify-center">
          <Text className="text-ink-3 text-[13px] font-sansMd">
            Loading market sentiment…
          </Text>
        </View>
      </Card>
    );
  }

  if (!snap) return null;

  const score = snap.fearGreedScore;
  const color = gaugeColor(score);
  const ratingColor =
    RATING_COLORS[snap.fearGreedRating] ?? "#8C988F";

  // Clamp needle so it never sits exactly at the extremes (looks better)
  const needleAngle = scoreToAngle(
    Math.min(Math.max(score, 3), 97),
  );
  const needleTip = polarToCartesian(CX, CY, NEEDLE_LEN, needleAngle);

  return (
    <Card pad={16} className="mb-4">
      {/* ── Header ──────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-ink-2 text-[11px] font-sansX uppercase tracking-widest">
          Fear & Greed Index
        </Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">
          {snap.source === "cnn" ? "CNN" : "Synthesized"}
        </Text>
      </View>

      {/* ── Speedometer ─────────────────────────────────────────── */}
      <View
        style={{
          height: SVG_H,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        >
          {/* Background track – full semicircle */}
          <Path
            d={arc(CX, CY, ARC_R, Math.PI, 0)}
            fill="none"
            stroke="#EDF0EB"
            strokeWidth={ARC_SW}
            strokeLinecap="butt"
          />

          {/* Coloured segments */}
          {SEGMENTS.map((seg) => (
            <Path
              key={seg.start}
              d={arc(
                CX,
                CY,
                ARC_R,
                scoreToAngle(seg.start),
                scoreToAngle(seg.end),
              )}
              fill="none"
              stroke={seg.color}
              strokeWidth={ARC_SW}
              strokeLinecap="butt"
            />
          ))}

          {/* Tick marks */}
          {TICKS.map((tick) => {
            const a = scoreToAngle(tick);
            const inner = polarToCartesian(CX, CY, TICK_INNER, a);
            const outer = polarToCartesian(CX, CY, TICK_OUTER, a);
            const isExtreme = tick === 0 || tick === 100;
            return (
              <Line
                key={tick}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#C4C9BE"
                strokeWidth={isExtreme ? 2 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle shaft */}
          <Line
            x1={CX}
            y1={CY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#2D2D2D"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Needle tip dot */}
          <SvgCircle
            cx={needleTip.x}
            cy={needleTip.y}
            r={3.5}
            fill={color}
          />

          {/* Centre pivot */}
          <SvgCircle cx={CX} cy={CY} r={7} fill="#2D2D2D" />
          <SvgCircle cx={CX} cy={CY} r={3} fill="#FFFFFF" />
        </Svg>

        {/* Score + rating overlay */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignItems: "center",
          }}
        >
          <Text
            className="text-ink font-displayX"
            style={{
              fontSize: 36,
              letterSpacing: -1.5,
              color,
              lineHeight: 38,
            }}
          >
            {score}
          </Text>
          <Text
            className="font-sansBold"
            style={{ fontSize: 13, color: ratingColor, marginTop: 1 }}
          >
            {RATING_LABELS[snap.fearGreedRating] ??
              snap.fearGreedRating}
          </Text>
        </View>
      </View>

      {/* ── Extreme labels ──────────────────────────────────────── */}
      <View className="flex-row justify-between mt-0.5 px-0.5">
        <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">
          Extreme Fear
        </Text>
        <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">
          Extreme Greed
        </Text>
      </View>

      {/* ── Scale numbers ───────────────────────────────────────── */}
      <View className="flex-row justify-between px-3 mb-1">
        <Text className="text-ink-3 text-[9px] font-monoMd">0</Text>
        <Text className="text-ink-3 text-[9px] font-monoMd">50</Text>
        <Text className="text-ink-3 text-[9px] font-monoMd">100</Text>
      </View>

      {/* ── Historical ──────────────────────────────────────────── */}
      <View className="flex-row justify-between mt-2">
        <Text className="text-ink-3 text-[10px] font-monoMd">
          1w ago: {snap.previous1Week}
        </Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">
          1m ago: {snap.previous1Month}
        </Text>
        <Text className="text-ink-3 text-[10px] font-monoMd">
          1y ago: {snap.previous1Year}
        </Text>
      </View>

      {/* ── Summary ─────────────────────────────────────────────── */}
      {snap.summary ? (
        <Text className="text-ink-2 text-[12px] font-sansMd mt-3 leading-[17px]">
          {snap.summary}
        </Text>
      ) : null}

      {/* ── Macro tailwinds / headwinds ─────────────────────────── */}
      {(snap.macroTailwinds.length > 0 ||
        snap.macroHeadwinds.length > 0) && (
        <View className="flex-row gap-3 mt-3 pt-3 border-t border-line">
          {snap.macroTailwinds.length > 0 && (
            <View className="flex-1">
              <Text className="text-pos text-[10px] font-sansX uppercase tracking-wider mb-1">
                Tailwinds
              </Text>
              {snap.macroTailwinds.slice(0, 2).map((w, i) => (
                <Text
                  key={i}
                  className="text-ink-2 text-[11px] font-sansMd leading-[15px]"
                >
                  ↑ {w}
                </Text>
              ))}
            </View>
          )}
          {snap.macroHeadwinds.length > 0 && (
            <View className="flex-1">
              <Text className="text-neg text-[10px] font-sansX uppercase tracking-wider mb-1">
                Headwinds
              </Text>
              {snap.macroHeadwinds.slice(0, 2).map((w, i) => (
                <Text
                  key={i}
                  className="text-ink-2 text-[11px] font-sansMd leading-[15px]"
                >
                  ↓ {w}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
