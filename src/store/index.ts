import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_PROFILE } from "@/data/questionnaire";
import type {
  JournalEntry,
  JournalReason,
  ThemeId,
  UserProfile,
} from "./types";

type OnboardingState = "not-started" | "in-progress" | "complete";

type Store = {
  // ---- onboarding ----
  onboarding: OnboardingState;
  profile: UserProfile;
  setProfileField: <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => void;
  setOnboarding: (s: OnboardingState) => void;
  resetOnboarding: () => void;

  // ---- themes (cached after generation) ----
  themeIds: ThemeId[];
  setThemeIds: (ids: ThemeId[]) => void;
  toggleTheme: (id: ThemeId) => void;

  // ---- watchlist ----
  watchlist: string[]; // stock symbols
  toggleWatchlist: (symbol: string) => void;
  isWatched: (symbol: string) => boolean;

  // ---- duels & journal ----
  journal: JournalEntry[];
  recordDuel: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;

  // ---- dev / debug ----
  hardReset: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      onboarding: "not-started",
      profile: DEFAULT_PROFILE,
      setProfileField: (key, value) =>
        set((s) => ({ profile: { ...s.profile, [key]: value } })),
      setOnboarding: (onboarding) => set({ onboarding }),
      resetOnboarding: () =>
        set({ onboarding: "not-started", profile: DEFAULT_PROFILE, themeIds: [] }),

      themeIds: [],
      setThemeIds: (themeIds) => set({ themeIds }),
      toggleTheme: (id) =>
        set((s) => ({
          themeIds: s.themeIds.includes(id)
            ? s.themeIds.filter((x) => x !== id)
            : [...s.themeIds, id],
        })),

      watchlist: [],
      toggleWatchlist: (symbol) =>
        set((s) => ({
          watchlist: s.watchlist.includes(symbol)
            ? s.watchlist.filter((x) => x !== symbol)
            : [...s.watchlist, symbol],
        })),
      isWatched: (symbol) => get().watchlist.includes(symbol),

      journal: [],
      recordDuel: (entry) =>
        set((s) => ({
          journal: [
            {
              ...entry,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: Date.now(),
            },
            ...s.journal,
          ],
        })),

      hardReset: () =>
        set({
          onboarding: "not-started",
          profile: DEFAULT_PROFILE,
          themeIds: [],
          watchlist: [],
          journal: [],
        }),
    }),
    {
      name: "thesis-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Convenience selectors
export const selectProfile = (s: Store) => s.profile;
export const selectWatchlist = (s: Store) => s.watchlist;
export const selectJournal = (s: Store) => s.journal;

export type { JournalReason };
