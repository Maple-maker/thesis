import type { LensHolding } from "@/data/investor-lenses";

export type WatchlistPipelineState =
  | "exploring"
  | "shortlisted"
  | "in-model"
  | "passed";

export type ConvictionNoteSource = "duel" | "scenario" | "radar" | "manual";

export type ConvictionNote = {
  id: string;
  createdAt: number;
  source: ConvictionNoteSource;
  symbol?: string;
  /** What would change my mind? */
  mindChange: string;
  takeaway?: string;
};

export type ThesisChangelogTrigger =
  | "life-scenario"
  | "theme-change"
  | "portfolio-save"
  | "manual";

export type ThesisChangelogEntry = {
  id: string;
  createdAt: number;
  trigger: ThesisChangelogTrigger;
  summary: string;
  beforeHoldings?: LensHolding[];
  afterHoldings?: LensHolding[];
};
