import type { Href } from "expo-router";
import type { ImperativeRouter } from "expo-router";

/** Tab and stack paths used for reliable back navigation. */
export const APP_ROUTES = {
  home: "/(tabs)",
  watchlist: "/(tabs)/watchlist",
  builder: "/(tabs)/builder",
  education: "/(tabs)/education",
  screener: "/screener",
  thesisModel: "/thesis-model",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES] | Href;

export function stockDetailRoute(
  symbol: string,
  returnTo?: string
): { pathname: "/(tabs)/stock/[symbol]"; params: { symbol: string; returnTo?: string } } {
  const sym = symbol.toUpperCase();
  return {
    pathname: "/(tabs)/stock/[symbol]",
    params: returnTo ? { symbol: sym, returnTo } : { symbol: sym },
  };
}

export function etfDetailRoute(
  symbol: string,
  returnTo?: string
): { pathname: "/(tabs)/etf/[symbol]"; params: { symbol: string; returnTo?: string } } {
  const sym = symbol.toUpperCase();
  return {
    pathname: "/(tabs)/etf/[symbol]",
    params: returnTo ? { symbol: sym, returnTo } : { symbol: sym },
  };
}

function normalizeReturnTo(returnTo?: string | string[]): string | undefined {
  const raw = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  const dest = raw?.trim();
  if (!dest || !dest.startsWith("/")) return undefined;
  return dest;
}

/**
 * Prefer an explicit return path (tab-safe). Falls back to router.back(), then watchlist.
 */
export function navigateBack(router: ImperativeRouter, returnTo?: string | string[]) {
  const dest = normalizeReturnTo(returnTo);
  if (dest) {
    router.navigate(dest as Href);
    return;
  }
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.navigate(APP_ROUTES.watchlist as Href);
}

/**
 * Push a string route (with optional query params) via the imperative router.
 * Centralises the type assertion needed for Expo Router's strict Href type
 * so it doesn't litter every call site.
 *
 * @example pushRoute(router, "/settings")
 * @example pushRoute(router, "/stock/NVDA?returnTo=/(tabs)")
 */
export function pushRoute(router: ImperativeRouter, route: string) {
  const qIndex = route.indexOf("?");
  if (qIndex === -1) {
    router.push(route as Href);
    return;
  }
  const pathname = route.slice(0, qIndex);
  const query = route.slice(qIndex + 1);
  const params: Record<string, string> = {};
  for (const part of query.split("&")) {
    const [k, v] = part.split("=");
    if (k && v) params[k] = decodeURIComponent(v);
  }
  router.push({ pathname, params } as Href);
}

/**
 * Push a route object (pathname + params) via the imperative router.
 * Centralises the type assertion for Expo Router's strict typed routes.
 *
 * @example pushRouteObject(router, { pathname: "/duel", params: { a: "NVDA" } })
 */
export function pushRouteObject(
  router: ImperativeRouter,
  obj: { pathname: string; params?: Record<string, string | undefined> }
) {
  router.push(obj as Href);
}

/**
 * @deprecated Use {@link pushRoute} instead — same behaviour, clearer name.
 */
export const pushAppRoute = pushRoute;
