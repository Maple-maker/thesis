import {
  extractHeuristicMemory,
  mergeIncomingMemory,
  type AssistantMemoryNote,
} from "./assistant-memory";
import { extractMemoryViaBackend, isBackendConfigured } from "./thesis-api";

export type LearnFromTurnResult = {
  added: number;
  merged: AssistantMemoryNote[];
};

/**
 * Auto-learn after each CFO exchange.
 * - Heuristics: always (on-device)
 * - LLM extract: when backend configured (DeepSeek, small side call)
 * You do NOT need to manually feed memory unless you want to correct/add facts.
 */
export async function learnFromAssistantTurn(params: {
  userMessage: string;
  assistantReply: string;
  existingNotes: AssistantMemoryNote[];
  userId?: string;
}): Promise<LearnFromTurnResult> {
  const heuristic = extractHeuristicMemory(params.userMessage);
  let { merged, added } = mergeIncomingMemory(params.existingNotes, heuristic);

  if (isBackendConfigured() && params.userId) {
    try {
      const { facts } = await extractMemoryViaBackend({
        userId: params.userId,
        userMessage: params.userMessage,
        assistantReply: params.assistantReply.slice(0, 2000),
        existingMemory: merged.map((n) => n.text).slice(-40),
      });
      const llmIncoming = facts.map((f) => ({
        text: f.text,
        source: "extracted" as const,
        category: f.category as AssistantMemoryNote["category"],
        importance: f.importance,
      }));
      const second = mergeIncomingMemory(merged, llmIncoming);
      merged = second.merged;
      added += second.added;
    } catch (e) {
      console.warn("[memory] LLM extract skipped:", e);
    }
  }

  return { merged, added };
}
