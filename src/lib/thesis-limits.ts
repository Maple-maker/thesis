import type { ThemeId } from "@/store/types";

/** Max active thesis themes, keeps the builder focused, not a grab-bag. */
export const MAX_ACTIVE_THEMES = 2;

export function canAdoptTheme(themeIds: ThemeId[], id: ThemeId): boolean {
  return themeIds.includes(id) || themeIds.length < MAX_ACTIVE_THEMES;
}

export function themesAtCapacity(themeIds: ThemeId[]): boolean {
  return themeIds.length >= MAX_ACTIVE_THEMES;
}

export function themeSlotsRemaining(themeIds: ThemeId[]): number {
  return Math.max(0, MAX_ACTIVE_THEMES - themeIds.length);
}

export const THESIS_LIMIT_COPY = {
  headline: `Pick up to ${MAX_ACTIVE_THEMES} theses`,
  body: "A sharp portfolio needs a clear point of view, not every theme in the library.",
  atCapacity: `You already have ${MAX_ACTIVE_THEMES} active theses. Remove one to adopt another.`,
};
