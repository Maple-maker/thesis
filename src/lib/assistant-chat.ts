import {
  buildAssistantContext,
  buildCompactAssistantContext,
  type AssistantContextInput,
} from "./assistant-context";
import { buildTradeRefusalReply, isTradeRefusalRequest } from "./cfo-guard";
import { polishCfoResponse } from "./cfo-response-polish";
import { CFO_UNAVAILABLE_USER, logCfoDevIssue } from "./cfo-user-message";
import {
  getThesisApiUrl,
  isBackendConfigured,
  sanitizeHistoryForApi,
  sendChatViaBackend,
} from "./thesis-api";

export type AssistantMode = "api" | "guard" | "unavailable";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type AssistantSendResult = {
  message: ChatMessage;
  mode: AssistantMode;
  llmProvider?: string;
  llmModel?: string;
};

export function dailyMessageLimit(isPro = false): number {
  return isPro ? 40 : 12;
}

export function canSendMessage(todayCount: number, isPro = false): boolean {
  return todayCount < dailyMessageLimit(isPro);
}

function wrapAssistantContent(content: string): string {
  return polishCfoResponse(content);
}

function apiSuccess(
  content: string,
  meta?: { provider?: string; model?: string }
): AssistantSendResult {
  return {
    message: {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: wrapAssistantContent(content),
      createdAt: Date.now(),
    },
    mode: "api",
    llmProvider: meta?.provider,
    llmModel: meta?.model,
  };
}

async function callLlm(
  trimmed: string,
  input: AssistantContextInput,
  history: ChatMessage[],
  userId: string,
  contextMode: "full" | "compact"
): Promise<AssistantSendResult> {
  const apiHistory = sanitizeHistoryForApi(history.filter((m) => m.id !== "welcome"));
  const { system } =
    contextMode === "compact"
      ? buildCompactAssistantContext(input)
      : buildAssistantContext(input);

  const data = await sendChatViaBackend({
    userId,
    userMessage: trimmed,
    system,
    history: apiHistory,
  });

  return apiSuccess(data.content, { provider: data.provider, model: data.model });
}

/**
 * Pro CFO: every open-ended question goes to the LLM (PACE on server).
 * No intent router, no mock templates, model generalization is the product.
 */
export async function sendAssistantMessage(
  userText: string,
  input: AssistantContextInput,
  history: ChatMessage[] = [],
  options?: { userId?: string; isPro?: boolean }
): Promise<AssistantSendResult> {
  const trimmed = userText.trim();
  if (!trimmed) throw new Error("Empty message");

  if (isTradeRefusalRequest(trimmed)) {
    return {
      message: {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: wrapAssistantContent(buildTradeRefusalReply(input)),
        createdAt: Date.now(),
      },
      mode: "guard",
    };
  }

  const isPro = Boolean(options?.isPro);
  if (!isPro) {
    return {
      message: {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: wrapAssistantContent(CFO_UNAVAILABLE_USER),
        createdAt: Date.now(),
      },
      mode: "unavailable",
    };
  }

  if (!isBackendConfigured()) {
    logCfoDevIssue("API URL missing in production build");
    return {
      message: {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: wrapAssistantContent(CFO_UNAVAILABLE_USER),
        createdAt: Date.now(),
      },
      mode: "unavailable",
    };
  }

  const userId = options?.userId ?? "dev-simulator-user";

  try {
    return await callLlm(trimmed, input, history, userId, "full");
  } catch (first) {
    logCfoDevIssue(`LLM full context failed: ${String(first)}`);
    try {
      return await callLlm(trimmed, input, history, userId, "compact");
    } catch (second) {
      logCfoDevIssue(`LLM compact retry failed: ${String(second)}`);
    }
  }

  return {
    message: {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: wrapAssistantContent(CFO_UNAVAILABLE_USER),
      createdAt: Date.now(),
    },
    mode: "unavailable",
  };
}
