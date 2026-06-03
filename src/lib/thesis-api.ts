import Constants from "expo-constants";
import { Platform } from "react-native";

import type { ChatMessage } from "./assistant-chat";

const DEV_DEFAULT_URL = "http://127.0.0.1:8787";
const DEV_DEFAULT_KEY = "dev-shared-secret-change-me";
const CHAT_TIMEOUT_MS = 120_000;

function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/$/, "").replace(/\/\/localhost\b/i, "//127.0.0.1");
}

export function getThesisApiConfig(): { url: string; key: string } {
  const fromEnv = process.env.EXPO_PUBLIC_THESIS_API_URL?.trim();
  const fromExtra = Constants.expoConfig?.extra?.thesisApiUrl as string | undefined;
  const keyEnv = process.env.EXPO_PUBLIC_THESIS_APP_KEY?.trim();
  const keyExtra = Constants.expoConfig?.extra?.thesisAppKey as string | undefined;

  let url = fromEnv || fromExtra || "";
  let key = keyEnv || keyExtra || "";

  if (__DEV__ && Platform.OS !== "web") {
    if (!url) url = DEV_DEFAULT_URL;
    if (!key) key = DEV_DEFAULT_KEY;
  }

  return { url: url ? normalizeApiUrl(url) : "", key };
}

export function getThesisApiUrl(): string {
  return getThesisApiConfig().url;
}

export function isBackendConfigured(): boolean {
  const { url } = getThesisApiConfig();
  if (url) return true;
  return __DEV__ && Platform.OS !== "web";
}

/** Drop polluted turns from old dev error bubbles. */
export function sanitizeHistoryForApi(history: ChatMessage[]): ChatMessage[] {
  const bad =
    /npm run|EXPO_PUBLIC|API terminal|server did not return|CFO brain runs on|not connected from this build/i;
  return history
    .filter((m) => m.role === "user" || !bad.test(m.content))
    .slice(-14);
}

export type BackendStatus = {
  configured: boolean;
  url: string;
  reachable: boolean;
  pacePrimary?: string;
};

export async function fetchBackendStatus(): Promise<BackendStatus> {
  const { url, key } = getThesisApiConfig();
  const base: BackendStatus = {
    configured: Boolean(url) || (__DEV__ && Platform.OS !== "web"),
    url: url || (__DEV__ ? DEV_DEFAULT_URL : ""),
    reachable: false,
  };
  if (!url) return base;

  try {
    const res = await fetch(`${url}/v1/health`, {
      method: "GET",
      headers: key ? { "X-Thesis-App-Key": key } : {},
    });
    if (!res.ok) return base;
    const data = (await res.json()) as { pace?: { primary?: string } };
    return { ...base, reachable: true, pacePrimary: data.pace?.primary };
  } catch {
    return base;
  }
}

export type BackendChatResponse = {
  role: "assistant";
  content: string;
  tier: "free" | "pro";
  model: string;
  provider?: string;
  paceStep?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
};

async function fetchChatOnce(
  apiUrl: string,
  apiKey: string,
  body: object
): Promise<BackendChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiUrl}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Backend ${res.status}: ${err.slice(0, 280)}`);
    }

    return res.json() as Promise<BackendChatResponse>;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendChatViaBackend(params: {
  userId: string;
  userMessage: string;
  system: string;
  history: ChatMessage[];
}): Promise<BackendChatResponse> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  if (!apiUrl) {
    throw new Error("Thesis API URL not configured");
  }

  const userId =
    params.userId.length >= 8 ? params.userId : `u_${params.userId}`.padEnd(8, "0");

  const payload = {
    userId,
    userMessage: params.userMessage,
    system: params.system,
    history: sanitizeHistoryForApi(params.history).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  try {
    return await fetchChatOnce(apiUrl, apiKey, payload);
  } catch (first) {
    await new Promise((r) => setTimeout(r, 800));
    return fetchChatOnce(apiUrl, apiKey, payload);
  }
}

export type MemoryExtractFact = {
  text: string;
  category?: string;
  importance?: number;
};

export async function extractMemoryViaBackend(params: {
  userId: string;
  userMessage: string;
  assistantReply: string;
  existingMemory?: string[];
}): Promise<{ facts: MemoryExtractFact[] }> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  if (!apiUrl) throw new Error("Thesis API URL not configured");

  const res = await fetch(`${apiUrl}/v1/memory/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Memory extract ${res.status}: ${err.slice(0, 200)}`);
  }

  return res.json() as Promise<{ facts: MemoryExtractFact[] }>;
}

// ── Asymmetry: Multi-LLM Debate ────────────────────────────────────────

export type DebateRoundEntry = {
  role: string;
  stanceLabel: string;
  content: string;
  score: number;
};

export type DebateResult = {
  ticker: string;
  rounds: DebateRoundEntry[];
  consensus: {
    verdict: "Bullish" | "Bearish" | "Neutral" | "Split";
    convictionScore: number;
    keyDisagreements: string[];
    mergedRisks: string[];
    mergedUpsides: string[];
    summary: string;
  };
};

export type DebateJobResponse = {
  jobId: string;
  status: "running" | "done" | "error";
  ticker: string;
  result?: DebateResult;
  error?: string;
  createdAt: number;
};

export async function runDebateAsync(params: {
  ticker: string;
  thesisContext?: string;
  profile?: { timeHorizon?: string; riskTolerance?: string; experienceLevel?: string; topGoal?: string };
}): Promise<DebateJobResponse> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/research/debate?async=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}) },
    body: JSON.stringify(params),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Debate ${res.status}: ${err.slice(0, 200)}`); }
  return res.json() as Promise<DebateJobResponse>;
}

export async function getDebateJob(jobId: string): Promise<DebateJobResponse> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/research/debate/${jobId}`, {
    headers: { ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}) },
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Job ${res.status}: ${err.slice(0, 200)}`); }
  return res.json() as Promise<DebateJobResponse>;
}

export async function runDebate(params: {
  ticker: string;
  thesisContext?: string;
  profile?: { timeHorizon?: string; riskTolerance?: string; experienceLevel?: string; topGoal?: string };
}): Promise<DebateResult> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/research/debate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Debate ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json() as Promise<DebateResult>;
}

// ── Asymmetry: Market Sentiment ────────────────────────────────────────

export type SentimentSnapshot = {
  fearGreedScore: number;
  fearGreedRating: "extreme fear" | "fear" | "neutral" | "greed" | "extreme greed";
  previousClose: number;
  previous1Week: number;
  previous1Month: number;
  previous1Year: number;
  dipOpportunities: { ticker: string; drawdownPct: number; reason: string; thesisScore: number }[];
  sectorRotation: { sector: string; direction: "inflow" | "outflow"; strength: number }[];
  macroTailwinds: string[];
  macroHeadwinds: string[];
  summary: string;
  source: "cnn" | "synthesized";
};

export type DipScanResult = {
  opportunities: DipOpportunity[];
  topPick: DipOpportunity | null;
  marketContext: string;
  fearGreedAlignment: string;
  fearGreed: { score: number; rating: string };
  source: string;
};

export type DipOpportunity = {
  ticker: string;
  company: string;
  sector: string;
  whyDown: string;
  whyMarketWrong: string;
  bullThesis: string;
  bearThesis: string;
  catalysts: string;
  estimatedUpside: number;
  estimatedDownside: number;
  rewardRiskRatio: number;
  convictionScore: number;
  finalGrade: string;
  aiDefenseExposure: string[];
};

export async function getMarketSentiment(
  type: "overview" | "dip-scan" | "sector-heatmap" = "overview"
): Promise<SentimentSnapshot> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/market/sentiment?type=${encodeURIComponent(type)}`, {
    method: "GET",
    headers: {
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sentiment ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json() as Promise<SentimentSnapshot>;
}

// ── Asymmetry: Catalyst Research ───────────────────────────────────────

export type CatalystLayer = {
  layer: string;
  label: string;
  events: {
    date: string;
    title: string;
    impact: "High" | "Medium" | "Low";
    direction: "Bullish" | "Bearish" | "Neutral";
    detail: string;
  }[];
  summary: string;
};

export type CatalystResult = {
  ticker: string;
  layers: CatalystLayer[];
  topCatalysts: { layer: string; title: string; impact: string; date: string }[];
  aggregateScore: number;
  summary: string;
};

export async function getCatalysts(
  ticker: string,
  layers?: string[]
): Promise<CatalystResult> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/research/catalysts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
    body: JSON.stringify({ ticker, layers }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Catalysts ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json() as Promise<CatalystResult>;
}

// ── Asymmetry: Professional Dip Scan ───────────────────────────────────

export async function runDipScan(): Promise<DipScanResult> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  const res = await fetch(`${apiUrl}/v1/market/sentiment?type=dip-scan`, {
    method: "GET",
    headers: {
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dip scan ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json() as Promise<DipScanResult>;
}

// ── Feedback ─────────────────────────────────────────────────────────────

export interface FeedbackPayload {
  category: "bug" | "ux" | "feature" | "general";
  description: string;
  steps?: string;
  deviceInfo?: string;
  appVersion?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<boolean> {
  const { url, key } = getThesisApiConfig();
  const apiUrl = url || (__DEV__ ? DEV_DEFAULT_URL : "");
  const apiKey = key || (__DEV__ ? DEV_DEFAULT_KEY : "");

  if (!apiUrl) {
    console.warn("[feedback] No API URL configured");
    return false;
  }

  try {
    const res = await fetch(`${apiUrl}/v1/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[feedback] Server returned ${res.status}: ${err.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[feedback] Submit failed:", err);
    return false;
  }
}
