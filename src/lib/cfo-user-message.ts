/** User-visible CFO errors, never npm/env instructions (those stay in __DEV__ console). */
export const CFO_UNAVAILABLE_USER =
  "I'm having trouble reaching the CFO service right now. Give it a moment and try again.";

export const CFO_GENERIC_RETRY_USER =
  "I couldn't finish that answer. Try sending your question again in one sentence.";

export function logCfoDevIssue(detail: string) {
  if (__DEV__) {
    console.warn(`[CFO dev] ${detail}`);
  }
}
