import type { ChatTurn, LlmCompletion, LlmProviderId } from "./llm.js";
import { MACRO_TOOL_DEFINITIONS, runMacroTool } from "./tools/registry.js";

export type ToolCallRequest = {
  id: string;
  name: string;
  arguments: string;
};

export type ApiChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCallRequest[] }
  | { role: "tool"; content: string; tool_call_id: string };

export type ToolCompletion = LlmCompletion & {
  tool_calls?: ToolCallRequest[];
};

function deepseekKeyOk(): boolean {
  const k = process.env.DEEPSEEK_API_KEY?.trim() ?? "";
  return k.startsWith("sk-") && k !== "PASTE_NEW_KEY_HERE";
}

async function openAIToolTurn(params: {
  baseUrl: string;
  apiKey: string;
  provider: LlmProviderId;
  model: string;
  maxTokens: number;
  system: string;
  messages: ApiChatMessage[];
}): Promise<ToolCompletion> {
  const res = await fetch(`${params.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: params.maxTokens,
      messages: [{ role: "system", content: params.system }, ...params.messages],
      tools: MACRO_TOOL_DEFINITIONS,
      tool_choice: "auto",
      temperature: 0.4,
      ...(params.model.includes("deepseek-v4") ? { thinking: { type: "disabled" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${params.provider} tools error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: {
          id: string;
          type: string;
          function: { name: string; arguments: string };
        }[];
      };
    }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const msg = data.choices?.[0]?.message;
  const tool_calls = msg?.tool_calls?.map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: tc.function.arguments ?? "{}",
  }));

  return {
    text: msg?.content?.trim() ?? "",
    provider: params.provider,
    model: params.model,
    paceStep: "P",
    tool_calls: tool_calls?.length ? tool_calls : undefined,
    usage: data.usage
      ? {
          input_tokens: data.usage.prompt_tokens ?? 0,
          output_tokens: data.usage.completion_tokens ?? 0,
        }
      : undefined,
  };
}

const MACRO_TOOL_SYSTEM_APPEND = `
Macro and markets tools:
You have tools to fetch LIVE US macro data (Fed funds, Treasury yields, yield curve spread, CPI index, Fed press headlines).
When the user asks about current rates, inflation, the Fed, yield curve, bond market conditions, or recent macro news:
1. Call the relevant tool(s) before stating any current level.
2. Never invent today's rates, CPI prints, or headlines.
3. Connect results to the user's holdings, horizon, and themes when context is provided.
4. Write results in plain English paragraphs and bullet lists. No markdown headers (##) or pipe tables.
5. End with: Educational tool, not investment advice.`;

/**
 * Tool loop for OpenAI-compatible providers (DeepSeek primary).
 */
export async function completeChatWithMacroTools(params: {
  system: string;
  messages: ChatTurn[];
  model: string;
  maxTokens: number;
}): Promise<LlmCompletion & { toolsUsed?: string[] }> {
  if (!deepseekKeyOk()) {
    throw new Error("Macro tools require DEEPSEEK_API_KEY (OpenAI-compatible tool calling)");
  }

  const base = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  const key = process.env.DEEPSEEK_API_KEY!.trim();
  const system = `${params.system}\n\n${MACRO_TOOL_SYSTEM_APPEND}`;

  const apiMessages: ApiChatMessage[] = params.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const toolsUsed: string[] = [];
  const MAX_ROUNDS = 4;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const result = await openAIToolTurn({
      baseUrl: base,
      apiKey: key,
      provider: "deepseek",
      model: params.model,
      maxTokens: params.maxTokens,
      system,
      messages: apiMessages,
    });

    if (!result.tool_calls?.length) {
      const text = result.text.trim();
      if (!text) throw new Error("deepseek tools returned empty content");
      return { ...result, toolsUsed };
    }

    apiMessages.push({
      role: "assistant",
      content: result.text || null,
      tool_calls: result.tool_calls,
    });

    for (const tc of result.tool_calls) {
      toolsUsed.push(tc.name);
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const out = await runMacroTool(tc.name, args);
      apiMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(out),
      });
    }
  }

  throw new Error("Macro tool loop exceeded max rounds");
}
