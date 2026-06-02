import type { PortfolioBacktestResult } from "@/lib/portfolio-backtest";

export function backtestPlainEnglish(backtest: PortfolioBacktestResult): string {
  const alpha = backtest.alpha.trailing1y;
  const port = backtest.portfolio.trailing1y;
  const spy = backtest.benchmark.trailing1y;
  const { risk } = backtest;
  const imputed =
    backtest.imputedSymbols.length > 0
      ? ` (${backtest.imputedSymbols.slice(0, 3).join(", ")}${backtest.imputedSymbols.length > 3 ? ` +${backtest.imputedSymbols.length - 3} more` : ""} used SPY returns.)`
      : "";

  const riskLine =
    risk.coverageTier !== "low"
      ? ` Est. volatility ${risk.volatility}%, max drawdown ${risk.maxDrawdown}%, Sharpe ${risk.sharpe}, beta ${risk.beta}.`
      : "";

  if (alpha > 2) {
    return `2025: ${port.toFixed(1)}% vs SPY ${spy.toFixed(1)}% (+${alpha.toFixed(1)} pts).${riskLine}${imputed} One good year is not a forecast — check the thesis, not the score.`;
  }
  if (alpha < -2) {
    return `2025: ${port.toFixed(1)}% vs SPY ${spy.toFixed(1)}% (${alpha.toFixed(1)} pts).${riskLine}${imputed} Ask whether your thesis is early, mismatched to the cycle, or just more volatile than the index.`;
  }
  return `2025: ${port.toFixed(1)}%, close to SPY ${spy.toFixed(1)}%.${riskLine}${imputed} The question is whether the thesis still matches your goals, not one-year relative performance.`;
}
