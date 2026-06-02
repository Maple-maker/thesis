import type { ResearchModule, ResearchModuleId } from "@/data/research-modules";
import type { ThemeId } from "@/store/types";

export type ResearchModuleContext = {
  themeIds: ThemeId[];
  hasHoldings: boolean;
};

/** Where each quick-action row navigates, must be a real screen, not a placeholder alert. */
export function hrefForResearchModule(
  id: ResearchModuleId,
  ctx: ResearchModuleContext
): string {
  switch (id) {
    case "simulations":
      return "/forecast";
    case "portfolio-analysis":
      return "/xray";
    case "risk-assessment":
      return "/advice";
    case "market-scenarios":
      return "/(tabs)/watchlist";
    case "spending-insights":
      return "/courses/credit-borrowing/cb-what-is-credit-score";
    case "buy-a-home":
      return "/courses/money-foundations/mf-time-value-money";
    case "thesis-backtest":
      return ctx.themeIds[0]
        ? `/(tabs)/builder/${ctx.themeIds[0]}`
        : "/(tabs)/themes";
    case "military-programs":
      return "/military-resources";
    default:
      return "/(tabs)/education";
  }
}

export function actionHintForModule(m: ResearchModule, ctx: ResearchModuleContext): string {
  switch (m.id) {
    case "simulations":
      return "Opens scenario planning";
    case "portfolio-analysis":
      return ctx.hasHoldings ? "Overlap & theme gaps" : "Load demo book first";
    case "risk-assessment":
      return "Prioritized checklist";
    case "market-scenarios":
      return "Stocks to add, passive thesis Radar";
    case "spending-insights":
      return "Credit & cash-flow lesson";
    case "buy-a-home":
      return "Time value of money lesson";
    case "thesis-backtest":
      return ctx.themeIds[0] ? "Illustrative theme returns" : "Pick a thesis in Library";
    case "military-programs":
      return "SCRA · TSP · SDP · CZTE";
    default:
      return "";
  }
}
