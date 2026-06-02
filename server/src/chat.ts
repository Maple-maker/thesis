import type { Request, Response } from "express";
import { z } from "zod";

import { cfoIntentHint } from "./cfo-intent-hint.js";
import { isUserPro } from "./entitlements.js";
import { completeChatWithMacroTools } from "./llm-tools.js";
import { completeChat, defaultModels } from "./llm.js";
import { buildMacroSnapshot, isMacroQuestion } from "./tools/macro-snapshot.js";
import { macroToolsEnabled } from "./tools/registry.js";

const ChatBody = z.object({
  userId: z.string().min(8).max(128),
  userMessage: z.string().min(1).max(4000),
  system: z.string().min(1).max(32000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })
    )
    .max(20)
    .optional(),
});

const UNIVERSAL_HINT =
  "[Answer the user's exact question with depth. Name tickers/ETFs when relevant. Use profile and holdings from context. General knowledge is allowed when data is missing. Never ask to rephrase.]";

const QUALITY_RETRY_APPEND =
  "\n\n[Your last draft was too thin or off-topic. Give a substantive, specific answer now.]";

function isWeakAnswer(text: string): boolean {
  const t = text.trim();
  if (t.length < 140) return true;
  if (/try rephrasing|could you (be more specific|clarify)|I am an AI (financial )?assistant designed/i.test(t)) {
    return true;
  }
  return false;
}

async function enrichSystemForMacro(
  system: string,
  userMessage: string
): Promise<{ system: string; macroInjected: boolean }> {
  if (!isMacroQuestion(userMessage)) {
    return { system, macroInjected: false };
  }
  try {
    const snap = await buildMacroSnapshot();
    return {
      system: `${system}\n\n${snap.contextBlock}`,
      macroInjected: snap.series.length > 0 || snap.headlines.length > 0,
    };
  } catch (e) {
    console.warn("[chat] macro prefetch failed", e);
    return { system, macroInjected: false };
  }
}

export async function postChat(req: Request, res: Response) {
  const parsed = ChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { userId, userMessage, system, history = [] } = parsed.data;
  const pro = isUserPro(userId);

  try {
    const { model, maxTokens } = defaultModels(pro);
    const hint = cfoIntentHint(userMessage) || UNIVERSAL_HINT;

    const { system: macroSystem, macroInjected } = await enrichSystemForMacro(system, userMessage);
    const systemPrompt = `${macroSystem}\n\n${hint}`;

    const messages = [...history.slice(-14), { role: "user" as const, content: userMessage }];

    const useToolLoop =
      macroToolsEnabled() && isMacroQuestion(userMessage) && process.env.DEEPSEEK_API_KEY?.trim();

    let result;
    let toolsUsed: string[] | undefined;

    if (useToolLoop) {
      try {
        const toolResult = await completeChatWithMacroTools({
          system: systemPrompt,
          messages,
          model,
          maxTokens,
        });
        result = toolResult;
        toolsUsed = toolResult.toolsUsed;
      } catch (toolErr) {
        console.warn("[chat] macro tool loop failed, falling back:", toolErr);
        result = await completeChat({
          system: systemPrompt,
          messages,
          model,
          maxTokens,
          pro,
        });
      }
    } else {
      result = await completeChat({
        system: systemPrompt,
        messages,
        model,
        maxTokens,
        pro,
      });
    }

    if (isWeakAnswer(result.text)) {
      result = await completeChat({
        system: `${systemPrompt}${QUALITY_RETRY_APPEND}`,
        messages,
        model,
        maxTokens,
        pro,
      });
    }

    if (process.env.ASSISTANT_DEBUG === "1") {
      console.log(
        `[chat] provider=${result.provider} model=${result.model} tools=${toolsUsed?.join(",") ?? "none"} macroPrefetch=${macroInjected} len=${result.text.length}`
      );
    }

    res.json({
      role: "assistant",
      content: result.text,
      tier: pro ? "pro" : "free",
      model: result.model,
      provider: result.provider,
      paceStep: result.paceStep,
      attempted: result.attempted,
      usage: result.usage,
      macro: {
        prefetch: macroInjected,
        toolsUsed: toolsUsed ?? [],
      },
    });
  } catch (e) {
    const msg = String(e);
    if (msg.includes("No LLM API key")) {
      res.status(503).json({ error: "Assistant unavailable", message: "No LLM keys configured" });
      return;
    }
    res.status(502).json({ error: "Chat failed", message: msg.slice(0, 400) });
  }
}
