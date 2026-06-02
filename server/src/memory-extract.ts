import type { Request, Response } from "express";
import { z } from "zod";

import { completeChat } from "./llm.js";

const Body = z.object({
  userId: z.string().min(8).max(128),
  userMessage: z.string().min(1).max(4000),
  assistantReply: z.string().min(1).max(4000),
  existingMemory: z.array(z.string().max(500)).max(60).optional(),
});

const EXTRACT_SYSTEM = `You maintain a durable memory bank for a personal CFO app.
Extract ONLY new, user-specific facts from the USER message (and only if the assistant reply confirms or restates them).
Return ONLY valid JSON, no markdown:
{"facts":[{"text":"one atomic line","category":"goal|holdings|preference|constraint|topic|life|other","importance":1-5}]}

Rules:
- 0 to 3 facts per turn; use [] if nothing durable and new
- Facts must be reusable later (goals, constraints, family, tax hints, employer equity, niche prefs, fears, plans, amounts they stated)
- No generic finance trivia, no advice, no tickers unless user mentioned them
- Do not duplicate lines already in existingMemory
- importance 5 = critical (debt, goals, tax, employer stock), 1 = minor color`;

type ExtractedFact = {
  text: string;
  category?: string;
  importance?: number;
};

function parseFactsJson(raw: string): ExtractedFact[] {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  try {
    const data = JSON.parse(jsonMatch[0]) as {
      facts?: { text?: string; category?: string; importance?: number }[];
    };
    if (!Array.isArray(data.facts)) return [];
    return data.facts
      .filter((f) => typeof f.text === "string" && f.text.trim().length >= 10)
      .map((f) => ({
        text: f.text!.trim().slice(0, 500),
        category: f.category,
        importance:
          typeof f.importance === "number"
            ? Math.min(5, Math.max(1, Math.round(f.importance)))
            : 3,
      }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function postMemoryExtract(req: Request, res: Response) {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { userMessage, assistantReply, existingMemory = [] } = parsed.data;

  const memoryBlock =
    existingMemory.length > 0
      ? `Existing memory (do not duplicate):\n${existingMemory.map((l) => `- ${l}`).join("\n")}`
      : "Existing memory: (empty)";

  try {
    const result = await completeChat({
      system: EXTRACT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${memoryBlock}\n\nUser message:\n${userMessage}\n\nAssistant reply (context only):\n${assistantReply.slice(0, 1500)}`,
        },
      ],
      maxTokens: 400,
      pro: false,
    });

    const facts = parseFactsJson(result.text);
    res.json({ facts, provider: result.provider });
  } catch (e) {
    res.status(502).json({ error: "Memory extract failed", message: String(e).slice(0, 300) });
  }
}
