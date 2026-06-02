import { Redirect } from "expo-router";

/** Thesis Radar lives on the Watchlist tab, passive suggestions embedded there. */
export default function RadarRedirect() {
  return <Redirect href="/(tabs)/watchlist" />;
}
