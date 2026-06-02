import { eventBriefById, eventBriefsForContext, type EventBrief } from "@/data/event-briefs";
import { radarReportsForContext, type RadarReport } from "@/data/radar-reports";
import type { ThemeId, UserProfile } from "@/store/types";
import type { Holding } from "@/types/linked-accounts";

export type InsightKind = "event" | "radar";

export type InsightItem =
  | { kind: "event"; brief: EventBrief }
  | { kind: "radar"; report: RadarReport };

export function insightsForHome(
  profile: UserProfile,
  themeIds: ThemeId[],
  watchlist: string[],
  holdings: Holding[],
  limit = 3
): InsightItem[] {
  const events = eventBriefsForContext(profile, themeIds, holdings, watchlist).map(
    (brief): InsightItem => ({ kind: "event", brief })
  );
  const radar = radarReportsForContext(profile, themeIds, watchlist)
    .slice(0, 2)
    .map((report): InsightItem => ({ kind: "radar", report }));
  return [...events, ...radar].slice(0, limit);
}

export function getEventBriefById(
  id: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  holdings: Holding[],
  watchlist: string[] = []
): EventBrief | undefined {
  return eventBriefById(id, profile, themeIds, holdings, watchlist);
}
