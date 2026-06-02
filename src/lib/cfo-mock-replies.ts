import type { AssistantContextInput } from "./assistant-context";
import { buildStructuredCfoReply } from "./cfo-router";
import { sectorFromQuery } from "@/data/sector-etfs";
import { CFO_GENERIC_RETRY_USER, logCfoDevIssue } from "./cfo-user-message";

/** Offline fallback only, never expose dev setup text to users. */
export function buildCfoMockReply(userText: string, input: AssistantContextInput): string {
  const structured = buildStructuredCfoReply(userText, input);
  if (structured) return structured;

  const sector = sectorFromQuery(userText);
  if (sector) {
    const retry = buildStructuredCfoReply(
      `ETFs for ${sector.replace("_", " ")} exposure`,
      input
    );
    if (retry) return retry;
  }

  logCfoDevIssue(
    "Using offline fallback, run `npm run dev` from thesis folder for DeepSeek."
  );

  return `${CFO_GENERIC_RETRY_USER}\n\nEducational tool, not investment advice.`;
}
