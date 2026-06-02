export type ChatTurn = { role: "user" | "assistant"; content: string };

export type LlmProviderId = "deepseek" | "anthropic" | "openai" | "gemini";

export type LlmCompletion = {
  text: string;
  provider: LlmProviderId;
  model: string;
  /** Which step in the PACE chain succeeded (P, A, C, E) */
  paceStep: "P" | "A" | "C" | "E";
  usage?: { input_tokens: number; output_tokens: number };
  /** Providers tried before success */
  attempted?: LlmProviderId[];
};

type ProviderConfig = {
  id: LlmProviderId;
  paceStep: "P" | "A" | "C" | "E";
  model: string;
  hasKey: () => boolean;
  complete: (params: {
    system: string;
    messages: ChatTurn[];
    model: string;
    maxTokens: number;
  }) => Promise<LlmCompletion>;
};

const DEFAULT_PACE_CHAIN: LlmProviderId[] = [
  "deepseek",
  "anthropic",
  "openai",
  "gemini",
];

const DEFAULT_MODELS: Record<LlmProviderId, string> = {
  deepseek: "deepseek-v4-flash",
  anthropic: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash-lite",
};

function parsePaceChain(): LlmProviderId[] {
  const raw =
    process.env.ASSISTANT_PACE ??
    process.env.PACE_CHAIN ??
    "deepseek,anthropic,openai,gemini";
  const ids = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as LlmProviderId[];
  const valid = ids.filter((id) => id in DEFAULT_MODELS);
  return valid.length ? valid : DEFAULT_PACE_CHAIN;
}

function modelForProvider(id: LlmProviderId, pro: boolean): string {
  const envKey =
    id === "deepseek"
      ? pro
        ? process.env.ASSISTANT_MODEL_PRO
        : process.env.ASSISTANT_MODEL_FREE
      : id === "anthropic"
        ? pro
          ? process.env.PACE_ALTERNATE_MODEL_PRO ?? process.env.ANTHROPIC_MODEL_PRO
          : process.env.PACE_ALTERNATE_MODEL_FREE ?? process.env.ANTHROPIC_MODEL_FREE
        : id === "openai"
          ? process.env.PACE_CONTINGENCY_MODEL ?? process.env.OPENAI_MODEL
          : process.env.PACE_EMERGENCY_MODEL ?? process.env.GEMINI_MODEL;
  return envKey ?? DEFAULT_MODELS[id];
}

async function completeOpenAICompatible(params: {
  baseUrl: string;
  apiKey: string;
  provider: LlmProviderId;
  paceStep: "P" | "A" | "C" | "E";
  system: string;
  messages: ChatTurn[];
  model: string;
  maxTokens: number;
}): Promise<LlmCompletion> {
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
      temperature: 0.5,
      ...(params.model.includes("deepseek-v4")
        ? { thinking: { type: "disabled" } }
        : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${params.provider} error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`${params.provider} returned empty content`);

  return {
    text,
    provider: params.provider,
    model: params.model,
    paceStep: params.paceStep,
    usage: data.usage
      ? {
          input_tokens: data.usage.prompt_tokens ?? 0,
          output_tokens: data.usage.completion_tokens ?? 0,
        }
      : undefined,
  };
}

function buildProviders(pro: boolean): ProviderConfig[] {
  const chain = parsePaceChain();
  const paceSteps: ("P" | "A" | "C" | "E")[] = ["P", "A", "C", "E"];

  return chain.map((id, i) => {
    const paceStep = paceSteps[i] ?? "E";
    const model = modelForProvider(id, pro);

    if (id === "deepseek") {
      return {
        id,
        paceStep,
        model,
        hasKey: () => {
          const k = process.env.DEEPSEEK_API_KEY?.trim() ?? "";
          return k.startsWith("sk-") && k !== "PASTE_NEW_KEY_HERE";
        },
        complete: (p) => {
          const key = process.env.DEEPSEEK_API_KEY!.trim();
          const base = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
          return completeOpenAICompatible({
            baseUrl: base,
            apiKey: key,
            provider: "deepseek",
            paceStep,
            ...p,
            model: p.model ?? model,
          });
        },
      };
    }

    if (id === "anthropic") {
      return {
        id,
        paceStep,
        model,
        hasKey: () => Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
        complete: async (p) => {
          const key = process.env.ANTHROPIC_API_KEY!.trim();
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": key,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: p.model ?? model,
              max_tokens: p.maxTokens,
              system: p.system,
              messages: p.messages,
            }),
          });
          if (!res.ok) {
            const err = await res.text();
            throw new Error(`anthropic error ${res.status}: ${err.slice(0, 300)}`);
          }
          const data = (await res.json()) as {
            content?: { type: string; text?: string }[];
            usage?: { input_tokens?: number; output_tokens?: number };
          };
          const text =
            data.content?.find((c) => c.type === "text")?.text?.trim() ??
            "I could not generate a response.";
          return {
            text,
            provider: "anthropic",
            model: p.model ?? model,
            paceStep,
            usage: data.usage
              ? {
                  input_tokens: data.usage.input_tokens ?? 0,
                  output_tokens: data.usage.output_tokens ?? 0,
                }
              : undefined,
          };
        },
      };
    }

    if (id === "openai") {
      return {
        id,
        paceStep,
        model,
        hasKey: () => Boolean(process.env.OPENAI_API_KEY?.trim()),
        complete: (p) =>
          completeOpenAICompatible({
            baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
            apiKey: process.env.OPENAI_API_KEY!.trim(),
            provider: "openai",
            paceStep,
            ...p,
            model: p.model ?? model,
          }),
      };
    }

    // gemini, OpenAI-compatible surface
    return {
      id: "gemini",
      paceStep,
      model,
      hasKey: () => Boolean(process.env.GEMINI_API_KEY?.trim() ?? process.env.GOOGLE_API_KEY?.trim()),
      complete: (p) => {
        const key = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)!.trim();
        const base =
          process.env.GEMINI_BASE_URL ??
          "https://generativelanguage.googleapis.com/v1beta/openai";
        return completeOpenAICompatible({
          baseUrl: base,
          apiKey: key,
          provider: "gemini",
          paceStep,
          ...p,
          model: p.model ?? model,
        });
      },
    };
  });
}

/** Which providers have API keys configured (for health / ops). */
export function paceStatus(): {
  chain: LlmProviderId[];
  configured: { id: LlmProviderId; step: string; model: string }[];
} {
  const chain = parsePaceChain();
  const providers = buildProviders(true);
  const configured = providers
    .filter((p) => p.hasKey())
    .map((p) => ({
      id: p.id,
      step: p.paceStep,
      model: p.model,
    }));
  return { chain, configured };
}

/**
 * PACE completion: Primary → Alternate → Contingency → Emergency.
 * Tries each configured provider in ASSISTANT_PACE order until one succeeds.
 */
export async function completeChat(params: {
  system: string;
  messages: ChatTurn[];
  model?: string;
  maxTokens: number;
  pro?: boolean;
}): Promise<LlmCompletion> {
  const providers = buildProviders(params.pro ?? true).filter((p) => p.hasKey());
  if (!providers.length) {
    throw new Error(
      "No LLM API keys configured. Set at least one: DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY"
    );
  }

  const attempted: LlmProviderId[] = [];
  const errors: string[] = [];

  for (const p of providers) {
    attempted.push(p.id);
    try {
      const result = await p.complete({
        system: params.system,
        messages: params.messages,
        model: params.model ?? p.model,
        maxTokens: params.maxTokens,
      });
      return { ...result, attempted };
    } catch (e) {
      const msg = String(e);
      errors.push(`${p.id}(${p.paceStep}): ${msg.slice(0, 120)}`);
      console.warn(`[llm] PACE ${p.paceStep} ${p.id} failed:`, msg.slice(0, 200));
    }
  }

  throw new Error(`All PACE providers failed: ${errors.join(" | ")}`);
}

export function defaultModels(pro: boolean): { model: string; maxTokens: number; provider: LlmProviderId } {
  const first = buildProviders(pro).find((p) => p.hasKey());
  if (!first) {
    return { model: "deepseek-v4-flash", maxTokens: pro ? 4096 : 1200, provider: "deepseek" };
  }
  return {
    model: modelForProvider(first.id, pro),
    maxTokens: pro ? 4096 : 1200,
    provider: first.id,
  };
}
