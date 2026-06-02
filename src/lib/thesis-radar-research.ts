import { radarTemplateLabel } from "@/data/conviction-research-framework";
import {
  buildRadarUserMessage,
  type RadarSearchTemplateId,
} from "@/data/radar-search-templates";
import { themeById } from "@/data/themes";
import type { ModelThesis } from "@/store/index";
import type { ThemeId, UserProfile } from "@/store/types";
import { getThesisApiConfig, isBackendConfigured } from "@/lib/thesis-api";

export function pickCompetitorsFromModel(
  symbol: string,
  holdings: { symbol: string; kind: string }[]
): [string, string] {
  const sym = symbol.toUpperCase();
  const peers = holdings
    .map((h) => h.symbol.toUpperCase())
    .filter((s) => s !== sym && /^[A-Z]{1,5}$/.test(s));
  const unique = [...new Set(peers)];
  if (unique.length >= 2) return [unique[0], unique[1]];
  if (unique.length === 1) return [unique[0], "SPY"];
  return ["SPY", "QQQ"];
}

export function buildThesisContextBlock(
  profile: UserProfile,
  model: ModelThesis
): string {
  const themes = model.themeIds
    .map((id) => themeById(id as ThemeId))
    .filter(Boolean)
    .map((t) => `- ${t!.title}: ${t!.thesis}`)
    .join("\n");

  const holdings = model.holdings
    .map((h) => `- ${h.symbol} (${h.kind}) ${h.weightPct}%`)
    .join("\n");

  const scenarios = model.appliedLifeScenarios.length
    ? model.appliedLifeScenarios.map((s) => s.id).join(", ")
    : "none";

  return [
    `Thesis name: ${model.name}`,
    `Conviction: ${model.conviction}`,
    `Climate: ${model.climateId ?? "none"}`,
    `Active themes:\n${themes || "(none)"}`,
    `Model holdings:\n${holdings || "(none)"}`,
    `Life scenarios applied: ${scenarios}`,
    model.stressSummaries.length
      ? `Stress notes:\n${model.stressSummaries.map((s) => `- ${s}`).join("\n")}`
      : "",
    `Profile: goal ${profile.primaryGoal}, horizon ${profile.horizon}, risk ${profile.risk}, emergency fund ${profile.hasEmergencyFund ? "yes" : "no"}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export type ThesisRadarResearchResult = {
  content: string;
  title: string;
  competitors: string[];
};

export async function runThesisRadarResearch(input: {
  userId: string;
  templateId: RadarSearchTemplateId;
  symbol: string;
  model: ModelThesis;
  profile: UserProfile;
}): Promise<ThesisRadarResearchResult> {
  const sym = input.symbol.toUpperCase();
  const competitors =
    input.templateId === "relative-valuation"
      ? pickCompetitorsFromModel(sym, input.model.holdings)
      : [];

  const userMessage = buildRadarUserMessage(
    input.templateId,
    sym,
    [competitors[0] ?? sym, competitors[1] ?? sym]
  );

  const thesisContext = buildThesisContextBlock(input.profile, input.model);

  const { url, key } = getThesisApiConfig();
  if (!url && !isBackendConfigured()) {
    throw new Error("Thesis API not configured, start the server with npm run server:dev");
  }

  const apiUrl = url || "http://127.0.0.1:8787";
  const apiKey = key || (__DEV__ ? "dev-shared-secret-change-me" : "");

  const res = await fetch(`${apiUrl}/v1/research/thesis-radar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Thesis-App-Key": apiKey } : {}),
    },
    body: JSON.stringify({
      userId: input.userId.length >= 8 ? input.userId : `u_${input.userId}`.padEnd(8, "0"),
      templateId: input.templateId,
      symbol: sym,
      competitors,
      thesisContext,
      userMessage,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Research ${res.status}: ${err.slice(0, 240)}`);
  }

  const data = (await res.json()) as { content: string; competitors?: string[] };
  const title =
    input.templateId === "relative-valuation"
      ? `Valuation · ${sym} vs ${(data.competitors ?? competitors).join(" & ")}`
      : `${radarTemplateLabel(input.templateId)} · ${sym}`;

  return {
    content: data.content,
    title,
    competitors: data.competitors ?? competitors,
  };
}
