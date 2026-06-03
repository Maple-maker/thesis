import type { WatchlistAlert } from "@/store/types";

// ── Mock price data ──────────────────────────────────────────
// Simple fallback prices when no real market-data feed exists.

const MOCK_PRICES: Record<string, number> = {
  AAPL: 192.5,
  NVDA: 148.2,
  MSFT: 425.3,
  GOOGL: 172.8,
  AMZN: 198.4,
  META: 512.6,
  TSLA: 215.7,
  JPM: 198.3,
  V: 285.1,
  SPY: 545.2,
  QQQ: 475.8,
  VTI: 268.4,
  IWM: 210.5,
  BND: 72.3,
  GLD: 215.8,
};

/** Look up a mock price for a symbol. Falls back to 0 if unknown. */
export function mockPriceForSymbol(symbol: string): number {
  return MOCK_PRICES[symbol.toUpperCase()] ?? 0;
}

// ── Alert checkers ───────────────────────────────────────────

type CheckResult = { triggered: WatchlistAlert[] };

/**
 * Check price-based alerts against a current price.
 * Returns alerts whose threshold is now met.
 */
export function checkPriceAlerts(
  symbol: string,
  currentPrice: number,
  alerts: WatchlistAlert[]
): CheckResult {
  const triggered: WatchlistAlert[] = [];
  const sym = symbol.toUpperCase();

  for (const alert of alerts) {
    if (alert.triggered) continue;
    if (alert.symbol.toUpperCase() !== sym) continue;

    if (alert.type === "price-above" && alert.threshold != null) {
      if (currentPrice >= alert.threshold) {
        triggered.push(alert);
      }
    } else if (alert.type === "price-below" && alert.threshold != null) {
      if (currentPrice <= alert.threshold) {
        triggered.push(alert);
      }
    }
  }

  return { triggered };
}

/**
 * Check conviction-change alerts against a current vs previous score.
 * Returns alerts where the direction matches.
 */
export function checkConvictionAlerts(
  symbol: string,
  currentScore: number,
  previousScore: number,
  alerts: WatchlistAlert[]
): CheckResult {
  const triggered: WatchlistAlert[] = [];
  const sym = symbol.toUpperCase();
  const delta = currentScore - previousScore;

  for (const alert of alerts) {
    if (alert.triggered) continue;
    if (alert.symbol.toUpperCase() !== sym) continue;
    if (alert.type !== "conviction-change") continue;

    if (alert.convictionDirection === "up" && delta > 5) {
      triggered.push(alert);
    } else if (alert.convictionDirection === "down" && delta < -5) {
      triggered.push(alert);
    }
  }

  return { triggered };
}

// ── Formatting ───────────────────────────────────────────────

const TYPE_LABELS: Record<WatchlistAlert["type"], string> = {
  "price-above": "Price above",
  "price-below": "Price below",
  "conviction-change": "Conviction change",
};

const DIR_LABEL: Record<string, string> = {
  up: "up",
  down: "down",
};

/** Produce a human-readable notification string for an alert. */
export function formatAlertMessage(alert: WatchlistAlert): string {
  const prefix = `${alert.symbol}`;
  if (alert.type === "price-above" || alert.type === "price-below") {
    const dir = alert.type === "price-above" ? "above" : "below";
    return `${prefix} is now $${alert.threshold?.toFixed(2) ?? "—"} (${dir})`;
  }
  if (alert.type === "conviction-change") {
    return `${prefix} conviction moved ${DIR_LABEL[alert.convictionDirection ?? ""] ?? ""}`;
  }
  return `${prefix} alert triggered`;
}
