import { View, Text } from "react-native";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/Icon";
import { TermHelpBubble } from "@/components/education/TermHelpBubble";
import { SPY_BENCHMARK_AS_OF } from "@/data/spy-benchmark";
import type { PortfolioBacktestResult } from "@/lib/portfolio-backtest";
import {
  formatAlpha,
  type PortfolioBacktestPeriod,
} from "@/lib/portfolio-backtest";

const PERIODS: PortfolioBacktestPeriod[] = ["trailing1y", "ann3y", "ann5y", "ann10y"];

type Props = {
  name: string;
  backtest: PortfolioBacktestResult;
};

export function ThesisPerformancePreview({ name, backtest }: Props) {
  const beat = backtest.alpha.trailing1y > 0;
  const margin = Math.abs(backtest.alpha.trailing1y);
  const verdict =
    margin < 0.5
      ? "Essentially tied with the S&P 500. Your thesis didn't hurt — but it didn't add much either. Ask whether the extra complexity is earning its keep."
      : beat
        ? `Outperformed the S&P 500 by ${margin.toFixed(1)} percentage points in 2025. Good year — but one year is not a track record. The S&P wins most 10-year comparisons against active managers.`
        : `Trailed the S&P 500 by ${margin.toFixed(1)} percentage points in 2025. Underperformance happens — even to good theses. The question is whether your conviction holds or the thesis needs adjustment.`;

  const maxReturn = Math.max(
    backtest.portfolio.trailing1y,
    backtest.benchmark.trailing1y
  );
  const portfolioBarWidth = Math.max(4, (backtest.portfolio.trailing1y / Math.max(maxReturn * 1.15, 1)) * 100);
  const spyBarWidth = Math.max(4, (backtest.benchmark.trailing1y / Math.max(maxReturn * 1.15, 1)) * 100);

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

      {/* Hero: Portfolio vs SPY side-by-side */}
      <View className="mb-4">
        <View className="flex-row items-end justify-between mb-3">
          <View className="flex-1 pr-2">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1">
              {name}
            </Text>
            <Text className="text-ink font-monoBold text-[28px]" style={{ letterSpacing: -0.5 }}>
              {backtest.portfolio.trailing1y.toFixed(1)}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1">
              S&P 500 (SPY)
            </Text>
            <Text className="text-ink-2 font-monoBold text-[28px]" style={{ letterSpacing: -0.5 }}>
              {backtest.benchmark.trailing1y.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Visual bars */}
        <View className="mb-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-ink-3 text-[9px] font-sansMd w-[72px]">Your book</Text>
            <View className="flex-1 h-[8px] bg-track rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${beat ? "bg-brand" : "bg-neg"}`}
                style={{ width: `${Math.min(portfolioBarWidth, 100)}%` }}
              />
            </View>
            <Text className="text-ink font-monoBold text-[11px] ml-2 w-[52px] text-right">
              {backtest.portfolio.trailing1y.toFixed(1)}%
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-ink-3 text-[9px] font-sansMd w-[72px]">S&P 500</Text>
            <View className="flex-1 h-[8px] bg-track rounded-full overflow-hidden">
              <View
                className="h-full bg-ink-3 rounded-full"
                style={{ width: `${Math.min(spyBarWidth, 100)}%` }}
              />
            </View>
            <Text className="text-ink-2 font-monoBold text-[11px] ml-2 w-[52px] text-right">
              {backtest.benchmark.trailing1y.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Alpha verdict */}
        <View
          className={`mt-3 px-3 py-2 rounded-[10px] ${
            beat ? "bg-pos-bg border border-pos/20" : "bg-neg-bg border border-neg/20"
          }`}
        >
          <Text className={`text-[12px] font-sansBold ${beat ? "text-pos" : "text-neg"}`}>
            {beat ? "+" : ""}
            {backtest.alpha.trailing1y.toFixed(1)} pts vs SPY in 2025
          </Text>
        </View>
      </View>

      {/* Multi-period table */}
      <View className="border-t border-line pt-3 mb-3">
        <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
          Longer horizon
        </Text>
        {PERIODS.filter((p) => p !== "trailing1y").map((p) => (
          <View key={p} className="flex-row items-center justify-between mb-2">
            <Text className="text-ink-2 text-[12px] font-sansMd flex-1">
              {p === "ann3y" ? "3 year (annualized)" : p === "ann5y" ? "5 year (annualized)" : "10 year (annualized)"}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-ink font-monoBold text-[13px]">
                {backtest.portfolio[p].toFixed(1)}%
              </Text>
              <Text
                className={`text-[12px] font-monoBold ${
                  backtest.alpha[p] > 0 ? "text-pos" : backtest.alpha[p] < 0 ? "text-neg" : "text-ink-2"
                }`}
              >
                {formatAlpha(backtest.alpha[p])}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Risk snapshot */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-bg-surface rounded-[10px] px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">Volatility</Text>
            <TermHelpBubble termId="volatility" />
          </View>
          <Text className="text-ink font-monoBold text-[14px] mt-0.5">{backtest.risk.volatility}%</Text>
        </View>
        <View className="flex-1 bg-bg-surface rounded-[10px] px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">Max DD</Text>
            <TermHelpBubble termId="max-drawdown" />
          </View>
          <Text className="text-ink font-monoBold text-[14px] mt-0.5">{backtest.risk.maxDrawdown}%</Text>
        </View>
        <View className="flex-1 bg-bg-surface rounded-[10px] px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">Sharpe</Text>
            <TermHelpBubble termId="sharpe-ratio" />
          </View>
          <Text className="text-ink font-monoBold text-[14px] mt-0.5">{backtest.risk.sharpe}</Text>
        </View>
        <View className="flex-1 bg-bg-surface rounded-[10px] px-3 py-2">
          <View className="flex-row items-center gap-1">
            <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">Beta</Text>
            <TermHelpBubble termId="beta" />
          </View>
          <Text className="text-ink font-monoBold text-[14px] mt-0.5">{backtest.risk.beta}</Text>
        </View>
      </View>

      {/* Plain-English verdict */}
      <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px] mb-3">
        {verdict}
      </Text>

      {backtest.imputedSymbols.length > 0 && (
        <Text className="text-ink-3 text-[10px] font-sansMd mb-2 leading-[14px]">
          {backtest.imputedSymbols.length} holding{backtest.imputedSymbols.length > 1 ? "s" : ""} use SPY returns where we lack specific data ({backtest.imputedSymbols.slice(0, 3).join(", ")}
          {backtest.imputedSymbols.length > 3 ? ` +${backtest.imputedSymbols.length - 3} more` : ""}). {backtest.coveragePct}% of book weight has real return data.
        </Text>
      )}

      <Text className="text-ink-3 text-[9px] font-sansMd leading-[13px]">
        {backtest.disclaimer}
      </Text>
    </Card>
  );
}
