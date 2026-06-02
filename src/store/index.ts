import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createDefaultCfoProfile } from "@/data/cfo-profile-defaults";
import { computeDerivedMetrics } from "@/lib/cfo-derived-metrics";
import { getProfileValue, setProfileValue } from "@/lib/cfo-profile-path";
import {
  mergeIncomingMemory,
  mergeMemory,
  trimMemoryNotes,
  type AssistantMemoryNote,
} from "@/lib/assistant-memory";
import { configureBilling, syncSubscriptionTier } from "@/lib/billing";
import { MAX_ACTIVE_THEMES } from "@/lib/thesis-limits";
import { buildThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import { DEMO_ACCOUNTS, DEMO_HOLDINGS } from "@/data/demo-accounts";
import type { ChatMessage } from "@/lib/assistant-chat";
import type { SubscriptionTier } from "@/data/subscription-tiers";
import type { Holding, LinkedAccount, PlaidConnectionStatus } from "@/types/linked-accounts";
import type { CfoProfile, CfoSectionId } from "@/types/cfo-profile";
import { lensById, type LensHolding } from "@/data/investor-lenses";
import {
  reformModelThesisFromScenarios,
  type AppliedLifeScenario,
} from "@/lib/thesis-life-scenario";
import type { RadarSearchTemplateId } from "@/data/radar-search-templates";
import type {
  ConvictionNote,
  ThesisChangelogEntry,
  WatchlistPipelineState,
} from "@/types/conviction-loop";
import {
  DEFAULT_PIE_CUSTOMIZATION,
  type PieCustomization,
} from "@/types/pie-customization";
import { lifeScenarioById } from "@/data/life-scenario-presets";
import type {
  JournalEntry,
  JournalReason,
  ThemeId,
  UserProfile,
} from "./types";

const RADAR_REVISIT_MS = 90 * 24 * 60 * 60 * 1000;

export type ThesisRadarReport = {
  id: string;
  templateId: RadarSearchTemplateId;
  symbol: string;
  competitors: string[];
  title: string;
  content: string;
  createdAt: number;
  revisitAt: number;
};

export type ModelThesis = {
  name: string;
  conviction: string;
  climateId: string | null;
  themeIds: ThemeId[];
  holdings: LensHolding[];
  appliedLifeScenarios: AppliedLifeScenario[];
  stressSummaries: string[];
  radarReports: ThesisRadarReport[];
  pieCustomization: PieCustomization;
  updatedAt: number;
  adoptedFromLensId?: string;
  adoptedFromLensName?: string;
};

export function normalizeModelThesis(raw: Partial<ModelThesis> | null | undefined): ModelThesis | null {
  if (!raw?.holdings?.length && !raw?.themeIds?.length) return null;
  return {
    name: raw.name ?? "My thesis portfolio",
    conviction: raw.conviction ?? "",
    climateId: raw.climateId ?? null,
    themeIds: raw.themeIds ?? [],
    holdings: raw.holdings ?? [],
    appliedLifeScenarios: raw.appliedLifeScenarios ?? [],
    stressSummaries: raw.stressSummaries ?? [],
    radarReports: (raw.radarReports ?? []).map((r) => ({
      ...r,
      revisitAt: r.revisitAt ?? r.createdAt + RADAR_REVISIT_MS,
    })),
    pieCustomization: {
      ...DEFAULT_PIE_CUSTOMIZATION,
      ...raw.pieCustomization,
      weightOverrides: raw.pieCustomization?.weightOverrides ?? {},
    },
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

type OnboardingState = "not-started" | "in-progress" | "complete";

function ensureCfoProfile(raw: unknown): CfoProfile {
  if (
    raw &&
    typeof raw === "object" &&
    "extended" in raw &&
    "meta" in raw &&
    "derived" in raw
  ) {
    const p = raw as CfoProfile;
    return { ...p, derived: computeDerivedMetrics(p) };
  }
  const legacy = (raw ?? {}) as Partial<UserProfile>;
  const base = createDefaultCfoProfile();
  const merged: CfoProfile = { ...base, ...legacy, extended: base.extended, meta: base.meta };
  merged.derived = computeDerivedMetrics(merged);
  return merged;
}

type Store = {
  onboarding: OnboardingState;
  profile: CfoProfile;
  setProfileField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  setProfilePath: (path: string, value: unknown) => void;
  markChapterComplete: (chapterId: string, sectionIds: CfoSectionId[]) => void;
  setOnboarding: (s: OnboardingState) => void;
  resetOnboarding: () => void;

  themeIds: ThemeId[];
  setThemeIds: (ids: ThemeId[]) => void;
  toggleTheme: (id: ThemeId) => boolean;

  customThesis: { name: string; note: string; updatedAt: number } | null;
  setCustomThesis: (name: string, note: string) => void;
  clearCustomThesis: () => void;

  duelMode: "portfolios" | "securities";
  setDuelMode: (mode: "portfolios" | "securities") => void;

  modelThesis: ModelThesis | null;
  setModelThesis: (payload: Omit<ModelThesis, "updatedAt">) => void;
  clearModelThesis: () => void;
  adoptLens: (lensId: string) => void;
  toggleLifeScenario: (id: AppliedLifeScenario["id"]) => void;
  addRadarReport: (report: Omit<ThesisRadarReport, "id" | "createdAt" | "revisitAt">) => void;
  removeRadarReport: (id: string) => void;
  snoozeRadarRevisit: (id: string) => void;

  convictionNotes: ConvictionNote[];
  addConvictionNote: (note: Omit<ConvictionNote, "id" | "createdAt">) => void;

  thesisChangelog: ThesisChangelogEntry[];
  appendThesisChangelog: (
    entry: Omit<ThesisChangelogEntry, "id" | "createdAt">
  ) => void;

  watchlist: string[];
  /** Free-text interests for Watchlist Thesis Radar (e.g. "biotech companies") */
  radarManualQuery: string;
  setRadarManualQuery: (query: string) => void;
  watchlistPipeline: Record<string, WatchlistPipelineState>;
  toggleWatchlist: (symbol: string) => void;
  setWatchlistPipeline: (symbol: string, state: WatchlistPipelineState) => void;
  isWatched: (symbol: string) => boolean;

  journal: JournalEntry[];
  recordDuel: (entry: Omit<JournalEntry, "id" | "createdAt" | "revisitAt" | "revisitSnoozed">) => void;
  snoozeDuelRevisit: (id: string) => void;

  completedLessons: string[];
  markLessonComplete: (lessonId: string) => void;
  isLessonComplete: (lessonId: string) => boolean;

  assistantMemory: AssistantMemoryNote[];
  addAssistantMemoryNote: (text: string, source?: AssistantMemoryNote["source"]) => void;
  setAssistantMemory: (notes: AssistantMemoryNote[]) => void;
  removeAssistantMemoryNote: (id: string) => void;
  chatMessages: ChatMessage[];
  appendChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  assistantUsageDate: string;
  assistantMessagesToday: number;
  recordAssistantMessage: () => boolean;

  thesisUserId: string;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  refreshSubscription: () => Promise<SubscriptionTier>;
  /** Dev/simulator only when RevenueCat not configured */
  setDevPro: (pro: boolean) => void;

  plaidStatus: PlaidConnectionStatus;
  linkedAccounts: LinkedAccount[];
  holdings: Holding[];
  connectDemoAccounts: () => void;
  disconnectAccounts: () => void;
  setPlaidAccounts: (accounts: LinkedAccount[]) => void;
  setPlaidHoldings: (holdings: Holding[]) => void;
  setPlaidStatus: (s: PlaidConnectionStatus) => void;

  hardReset: () => void;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function newThesisUserId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      onboarding: "not-started",
      profile: createDefaultCfoProfile(),
      setProfileField: (key, value) =>
        set((s) => {
          const profile = ensureCfoProfile({ ...s.profile, [key]: value });
          profile.derived = computeDerivedMetrics(profile);
          return { profile };
        }),
      setProfilePath: (path, value) =>
        set((s) => {
          const profile = setProfileValue(s.profile, path, value);
          profile.derived = computeDerivedMetrics(profile);
          return { profile };
        }),
      markChapterComplete: (chapterId, sectionIds) =>
        set((s) => {
          const chapters = new Set(s.profile.meta.completedChapters);
          chapters.add(chapterId);
          const sections = new Set(s.profile.meta.completedSections);
          sectionIds.forEach((id) => sections.add(id));
          const profile: CfoProfile = {
            ...s.profile,
            meta: {
              ...s.profile.meta,
              completedChapters: [...chapters],
              completedSections: [...sections],
              updatedAt: Date.now(),
            },
          };
          profile.derived = computeDerivedMetrics(profile);
          return { profile };
        }),
      setOnboarding: (onboarding) => set({ onboarding }),
      resetOnboarding: () =>
        set({
          onboarding: "not-started",
          profile: createDefaultCfoProfile(),
          themeIds: [],
        }),

      themeIds: [],
      setThemeIds: (themeIds) =>
        set({ themeIds: themeIds.slice(0, MAX_ACTIVE_THEMES) }),
      toggleTheme: (id) => {
        const s = get();
        if (s.themeIds.includes(id)) {
          set({ themeIds: s.themeIds.filter((x) => x !== id) });
          return true;
        }
        if (s.themeIds.length >= MAX_ACTIVE_THEMES) return false;
        set({ themeIds: [...s.themeIds, id] });
        return true;
      },

      customThesis: null,
      setCustomThesis: (name, note) =>
        set({
          customThesis: {
            name: name.trim(),
            note: note.trim(),
            updatedAt: Date.now(),
          },
        }),
      clearCustomThesis: () => set({ customThesis: null }),

      duelMode: "portfolios" as "portfolios" | "securities",
      setDuelMode: (duelMode) => set({ duelMode }),

      modelThesis: null,
      setModelThesis: (payload) =>
        set({
          modelThesis: normalizeModelThesis({
            ...payload,
            appliedLifeScenarios: payload.appliedLifeScenarios ?? [],
            stressSummaries: payload.stressSummaries ?? [],
            radarReports: payload.radarReports ?? [],
            pieCustomization: payload.pieCustomization ?? DEFAULT_PIE_CUSTOMIZATION,
            updatedAt: Date.now(),
          }),
        }),
      clearModelThesis: () => set({ modelThesis: null }),
      adoptLens: (lensId: string) => {
        const lens = lensById(lensId);
        if (!lens) return;
        const s = get();
        const themeIds = [...s.themeIds];
        for (const tid of lens.themeIds) {
          if (!themeIds.includes(tid) && themeIds.length < MAX_ACTIVE_THEMES) {
            themeIds.push(tid);
          }
        }
        const model = normalizeModelThesis({
          name: lens.name,
          conviction: `Inspired by ${lens.inspiredBy ?? lens.name}. ${lens.bio.slice(0, 200)}`,
          climateId: null,
          themeIds: lens.themeIds,
          holdings: lens.holdings,
          appliedLifeScenarios: [],
          stressSummaries: [],
          radarReports: [],
          pieCustomization: DEFAULT_PIE_CUSTOMIZATION,
          adoptedFromLensId: lens.id,
          adoptedFromLensName: lens.name,
        });
        set({ themeIds, modelThesis: model, customThesis: { name: lens.name, note: lens.bio.slice(0, 200), updatedAt: Date.now() } });
      },
      toggleLifeScenario: (id) => {
        const s = get();
        if (s.themeIds.length === 0) return;

        let base = s.modelThesis;
        if (!base) {
          const built = buildThesisPortfolio({
            name: s.customThesis?.name ?? "My thesis portfolio",
            conviction: s.customThesis?.note ?? "",
            profile: s.profile,
            themeIds: s.themeIds,
          });
          base = normalizeModelThesis(
            built
              ? {
                  name: built.name,
                  conviction: built.conviction,
                  climateId: built.climateId,
                  themeIds: built.themeIds,
                  holdings: built.holdings,
                  appliedLifeScenarios: [],
                  stressSummaries: [],
                  radarReports: [],
                  pieCustomization: DEFAULT_PIE_CUSTOMIZATION,
                }
              : null
          );
        }
        if (!base) return;

        const has = base.appliedLifeScenarios.some((a) => a.id === id);
        const applied = has
          ? base.appliedLifeScenarios.filter((a) => a.id !== id)
          : [...base.appliedLifeScenarios, { id, appliedAt: Date.now() }];

        const beforeHoldings = [...base.holdings];
        const { holdings, conviction, stressSummaries } = reformModelThesisFromScenarios({
          model: { ...base, appliedLifeScenarios: applied },
          profile: s.profile,
          applied,
        });

        const preset = lifeScenarioById(id);
        const changelogSummary = has
          ? `Removed life scenario: ${preset?.label ?? id}`
          : `Applied life scenario: ${preset?.label ?? id}`;

        const afterHoldings = holdings.length ? holdings : base.holdings;
        get().appendThesisChangelog({
          trigger: "life-scenario",
          summary: changelogSummary,
          beforeHoldings,
          afterHoldings,
        });

        set({
          modelThesis: {
            ...base,
            appliedLifeScenarios: applied,
            stressSummaries,
            holdings: afterHoldings,
            conviction,
            updatedAt: Date.now(),
          },
        });
      },

      convictionNotes: [],
      addConvictionNote: (note) =>
        set((s) => ({
          convictionNotes: [
            {
              ...note,
              id: `cn-${Date.now()}`,
              createdAt: Date.now(),
            },
            ...s.convictionNotes,
          ].slice(0, 40),
        })),

      thesisChangelog: [],
      appendThesisChangelog: (entry) =>
        set((s) => ({
          thesisChangelog: [
            {
              ...entry,
              id: `cl-${Date.now()}`,
              createdAt: Date.now(),
            },
            ...s.thesisChangelog,
          ].slice(0, 30),
        })),
      addRadarReport: (report) =>
        set((s) => {
          const base = s.modelThesis;
          if (!base) return s;
          const now = Date.now();
          const entry: ThesisRadarReport = {
            ...report,
            id: `radar-${now}`,
            createdAt: now,
            revisitAt: now + RADAR_REVISIT_MS,
          };
          return {
            modelThesis: {
              ...base,
              radarReports: [entry, ...base.radarReports].slice(0, 24),
              updatedAt: now,
            },
          };
        }),
      snoozeRadarRevisit: (id) =>
        set((s) => {
          const base = s.modelThesis;
          if (!base) return s;
          return {
            modelThesis: {
              ...base,
              radarReports: base.radarReports.map((r) =>
                r.id === id ? { ...r, revisitAt: Date.now() + RADAR_REVISIT_MS } : r
              ),
              updatedAt: Date.now(),
            },
          };
        }),
      removeRadarReport: (id) =>
        set((s) => {
          const base = s.modelThesis;
          if (!base) return s;
          return {
            modelThesis: {
              ...base,
              radarReports: base.radarReports.filter((r) => r.id !== id),
              updatedAt: Date.now(),
            },
          };
        }),

      watchlist: [],
      radarManualQuery: "",
      setRadarManualQuery: (radarManualQuery) => set({ radarManualQuery }),
      watchlistPipeline: {},
      toggleWatchlist: (symbol) =>
        set((s) => {
          const sym = symbol.toUpperCase();
          const removing = s.watchlist.includes(sym);
          const watchlist = removing
            ? s.watchlist.filter((x) => x !== sym)
            : [...s.watchlist, sym];
          const pipeline = { ...s.watchlistPipeline };
          if (removing) {
            delete pipeline[sym];
          } else if (!pipeline[sym]) {
            pipeline[sym] = "exploring";
          }
          return { watchlist, watchlistPipeline: pipeline };
        }),
      setWatchlistPipeline: (symbol, state) =>
        set((s) => ({
          watchlistPipeline: {
            ...s.watchlistPipeline,
            [symbol.toUpperCase()]: state,
          },
        })),
      isWatched: (symbol) => get().watchlist.includes(symbol.toUpperCase()),

      journal: [],
      recordDuel: (entry) =>
        set((s) => ({
          journal: [
            {
              ...entry,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: Date.now(),
              revisitAt: Date.now() + RADAR_REVISIT_MS,
            },
            ...s.journal,
          ],
        })),
      snoozeDuelRevisit: (id: string) =>
        set((s) => ({
          journal: s.journal.map((j) =>
            j.id === id
              ? { ...j, revisitAt: Date.now() + RADAR_REVISIT_MS, revisitSnoozed: true }
              : j
          ),
        })),

      completedLessons: [],
      markLessonComplete: (lessonId) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(lessonId)
            ? s.completedLessons
            : [...s.completedLessons, lessonId],
        })),
      isLessonComplete: (lessonId) => get().completedLessons.includes(lessonId),

      assistantMemory: [],
      addAssistantMemoryNote: (text, source = "user") =>
        set((s) => {
          const { merged } = mergeIncomingMemory(s.assistantMemory, [
            { text: text.trim(), source },
          ]);
          return { assistantMemory: merged };
        }),
      setAssistantMemory: (notes) => set({ assistantMemory: trimMemoryNotes(notes) }),
      removeAssistantMemoryNote: (id) =>
        set((s) => ({
          assistantMemory: s.assistantMemory.filter((n) => n.id !== id),
        })),
      chatMessages: [],
      appendChatMessage: (msg) =>
        set((s) => ({
          chatMessages: [...s.chatMessages, msg].slice(-40),
        })),
      clearChat: () => set({ chatMessages: [] }),
      assistantUsageDate: todayKey(),
      assistantMessagesToday: 0,
      recordAssistantMessage: () => {
        const key = todayKey();
        const s = get();
        const limit = s.subscriptionTier === "pro" ? 40 : 5;
        const count = s.assistantUsageDate === key ? s.assistantMessagesToday : 0;
        if (count >= limit) return false;
        set({ assistantUsageDate: key, assistantMessagesToday: count + 1 });
        return true;
      },

      thesisUserId: newThesisUserId(),
      subscriptionTier: "free",
      setSubscriptionTier: (subscriptionTier) => set({ subscriptionTier }),
      refreshSubscription: async () => {
        const id = get().thesisUserId;
        await configureBilling(id);
        const tier = await syncSubscriptionTier(id);
        set({ subscriptionTier: tier });
        return tier;
      },
      setDevPro: (pro) => set({ subscriptionTier: pro ? "pro" : "free" }),

      plaidStatus: "disconnected",
      linkedAccounts: [],
      holdings: [],
      connectDemoAccounts: () =>
        set({
          plaidStatus: "demo",
          linkedAccounts: DEMO_ACCOUNTS,
          holdings: DEMO_HOLDINGS,
        }),
      disconnectAccounts: () =>
        set({ plaidStatus: "disconnected", linkedAccounts: [], holdings: [] }),
      setPlaidStatus: (plaidStatus) => set({ plaidStatus }),
      setPlaidAccounts: (accounts) => set({ linkedAccounts: accounts }),
      setPlaidHoldings: (holdings) => set({ holdings }),

      hardReset: () =>
        set({
          onboarding: "not-started",
          profile: createDefaultCfoProfile(),
          themeIds: [],
          customThesis: null,
          modelThesis: null,
          watchlist: [],
          radarManualQuery: "",
          journal: [],
          convictionNotes: [],
          thesisChangelog: [],
          watchlistPipeline: {},
          completedLessons: [],
          assistantMemory: [],
          chatMessages: [],
          assistantUsageDate: todayKey(),
          assistantMessagesToday: 0,
          thesisUserId: newThesisUserId(),
          subscriptionTier: "free",
          plaidStatus: "disconnected",
          linkedAccounts: [],
          holdings: [],
        }),
    }),
    {
      name: "thesis-store-v2",
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<Store> | undefined;
        const profile = ensureCfoProfile(p?.profile ?? current.profile);
        const themeIds = (p?.themeIds ?? current.themeIds).slice(0, MAX_ACTIVE_THEMES);
        return {
          ...current,
          ...p,
          profile,
          themeIds,
          modelThesis: normalizeModelThesis(p?.modelThesis ?? current.modelThesis),
          convictionNotes: p?.convictionNotes ?? current.convictionNotes ?? [],
          thesisChangelog: p?.thesisChangelog ?? current.thesisChangelog ?? [],
          watchlistPipeline: p?.watchlistPipeline ?? current.watchlistPipeline ?? {},
          thesisUserId: p?.thesisUserId ?? current.thesisUserId ?? newThesisUserId(),
          subscriptionTier: p?.subscriptionTier ?? current.subscriptionTier ?? "free",
          assistantMemory: mergeMemory(p?.assistantMemory ?? [], profile),
        };
      },
    }
  )
);

export const selectProfile = (s: Store) => s.profile;
export const selectSubscriptionTier = (s: Store) => s.subscriptionTier;
export const selectIsPro = (s: Store) =>
  s.subscriptionTier === "pro" || (__DEV__ && process.env.EXPO_PUBLIC_DEV_PRO !== "0");
export const selectPlaidConnected = (s: Store) =>
  s.plaidStatus === "connected" || s.plaidStatus === "demo";
export const selectWatchlist = (s: Store) => s.watchlist;
export const selectJournal = (s: Store) => s.journal;

export type { JournalReason };
