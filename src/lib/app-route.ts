import type { Href, Router } from "expo-router";

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
export function navigateBack(router: Router, returnTo?: string | string[]) {
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

/** Parse `/path?a=1&b=2` into expo-router push args. */
export function pushAppRoute(router: Router, route: string) {
  const qIndex = route.indexOf("?");
  if (qIndex === -1) {
    router.push(route as never);
    return;
  }
  const pathname = route.slice(0, qIndex);
  const query = route.slice(qIndex + 1);
  const params: Record<string, string> = {};
  for (const part of query.split("&")) {
    const [k, v] = part.split("=");
    if (k && v) params[k] = decodeURIComponent(v);
  }
  router.push({ pathname, params } as never);
}
