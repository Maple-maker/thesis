import { View, Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/Icon";
import { SPY_BENCHMARK, SPY_BENCHMARK_AS_OF } from "@/data/spy-benchmark";
import type { PortfolioBacktestResult } from "@/lib/portfolio-backtest";
import {
  formatAlpha,
  type PortfolioBacktestPeriod,
} from "@/lib/portfolio-backtest";

type Props = {
  nameA: string;
  nameB: string;
  backtestA: PortfolioBacktestResult;
  backtestB: PortfolioBacktestResult;
};

const PERIODS: PortfolioBacktestPeriod[] = ["trailing1y", "ann3y", "ann5y", "ann10y"];

function SideColumn({
  name,
  backtest,
  isWinner,
}: {
  name: string;
  backtest: PortfolioBacktestResult;
  isWinner: boolean | null;
}) {
  const maxReturn = Math.max(
    backtest.portfolio.trailing1y,
    SPY_BENCHMARK.trailing1y
  );
  const barWidth = Math.max(4, (backtest.portfolio.trailing1y / Math.max(maxReturn * 1.2, 1)) * 100);

  return (
    <View className="flex-1">
      <Text className="text-ink font-sansBold text-[13px] mb-1" numberOfLines={2}>
        {name}
      </Text>
      <Text className="text-ink font-monoBold text-[26px]" style={{ letterSpacing: -0.5 }}>
        {backtest.portfolio.trailing1y.toFixed(1)}%
      </Text>
      <Text className="text-ink-3 text-[10px] font-sansMd mb-2">2025 return</Text>

      {/* Bar vs SPY reference line */}
      <View className="mb-3">
        <View className="h-[7px] bg-track rounded-full overflow-hidden mb-1">
          <View
            className={`h-full rounded-full ${backtest.alpha.trailing1y > 0 ? "bg-brand" : "bg-neg"}`}
            style={{ width: `${Math.min(barWidth, 100)}%` }}
          />
        </View>
        <View className="relative" style={{ marginLeft: `${Math.min(Math.max(4, (SPY_BENCHMARK.trailing1y / Math.max(maxReturn * 1.2, 1)) * 100), 96)}%` }}>
          <Text className="text-ink-3 text-[8px] font-monoBold absolute -translate-x-1/2 -mt-0.5">
            SPY {SPY_BENCHMARK.trailing1y}%
          </Text>
        </View>
      </View>

      <View
        className={`px-2 py-1 rounded-[7px] self-start mb-3 ${
          backtest.alpha.trailing1y > 0 ? "bg-pos-bg" : "bg-neg-bg"
        }`}
      >
        <Text
          className={`text-[11px] font-monoBold ${
            backtest.alpha.trailing1y > 0 ? "text-pos" : "text-neg"
          }`}
        >
          {formatAlpha(backtest.alpha.trailing1y)}
        </Text>
      </View>

      {PERIODS.filter((p) => p !== "trailing1y").map((p) => (
        <View key={p} className="flex-row items-center justify-between mb-1.5">
          <Text className="text-ink-3 text-[10px] font-sansMd">
            {p === "ann3y" ? "3Y ann." : p === "ann5y" ? "5Y ann." : "10Y ann."}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-ink font-monoBold text-[12px]">
              {backtest.portfolio[p].toFixed(1)}%
            </Text>
            <Text
              className={`text-[10px] font-monoBold ${
                backtest.alpha[p] > 0 ? "text-pos" : backtest.alpha[p] < 0 ? "text-neg" : "text-ink-3"
              }`}
            >
              {formatAlpha(backtest.alpha[p])}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function PortfolioBacktestCompare({ nameA, nameB, backtestA, backtestB }: Props) {
  const winner =
    backtestA.alpha.trailing1y > backtestB.alpha.trailing1y
      ? "a"
      : backtestB.alpha.trailing1y > backtestA.alpha.trailing1y
        ? "b"
        : null;

  return (
    <Card pad={16} className="mb-5 border-brand/25 bg-brand-bg/10">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Icon name="compare" size={15} color="#0E7A66" sw={2} />
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider ml-1.5">
            Backtest vs S&P 500
          </Text>
        </View>
        <Text className="text-ink-3 text-[10px] font-sansMd">As of {SPY_BENCHMARK_AS_OF}</Text>
      </View>

      <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px] mb-4">
        Weighted total returns of each model book vs the S&P 500 — the only benchmark that matters.
      </Text>

      {/* S&P 500 benchmark bar at top */}
      <View className="flex-row items-center mb-4 px-3 py-2 rounded-[10px] bg-bg-surface">
        <Text className="text-ink-2 text-[11px] font-sansBold flex-1">
          S&P 500 (SPY) 2025 return
        </Text>
        <Text className="text-ink font-monoBold text-[15px]">
          {SPY_BENCHMARK.trailing1y}%
        </Text>
      </View>

      <View className="flex-row gap-4">
        <SideColumn name={nameA} backtest={backtestA} isWinner={winner === "a"} />
        <View className="w-px bg-line" />
        <SideColumn name={nameB} backtest={backtestB} isWinner={winner === "b"} />
      </View>

      {winner && (
        <View className="mt-4 pt-3 border-t border-line">
          <Text className="text-ink-2 text-[12px] font-sansMd leading-[18px]">
            <Text className="font-sansBold">
              {winner === "a" ? nameA : nameB}
            </Text>{" "}
            had the stronger 2025 vs SPY. But one year proves nothing — the S&P 500 beats ~85% of
            active managers over 10-year stretches. Ask whether this thesis makes sense for{" "}
            <Text className="font-sansBold">your</Text> goals, not just one backtest window.
          </Text>
        </View>
      )}

      <Text className="text-ink-3 text-[9px] font-sansMd mt-3 leading-[13px]">
        {backtestA.disclaimer}
      </Text>
    </Card>
  );
}
