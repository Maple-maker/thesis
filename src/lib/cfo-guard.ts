import type { AssistantContextInput } from "./assistant-context";
import { themeById } from "@/data/themes";

/** Only hard rule handled without LLM, everything else goes to the model. */
export function buildTradeRefusalReply(input: AssistantContextInput): string {
  const themes =
    input.themeIds
      .slice(0, 3)
      .map((id) => themeById(id)?.title ?? id)
      .join(", ") || "your themes";
  const p = input.profile;
  return `I can't tell you to buy or sell a specific security. I can explain how a name fits your ${p.horizon} horizon, concentration in your linked book, and ${themes}, or what to research before you decide.`;
}

export function isTradeRefusalRequest(text: string): boolean {
  return /\b(should i|shall i)\s+(buy|sell|purchase|short)\b/i.test(text);
}
