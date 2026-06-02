import { getThesisApiConfig } from "@/lib/thesis-api";

export type MacroSeries = {
  id: string;
  label: string;
  value: string;
  asOf: string;
  source: string;
  detail?: string;
};

export type MacroHeadline = {
  title: string;
  date: string;
  link: string;
};

export type MacroSnapshot = {
  fetchedAt: string;
  configured: { fred: boolean; treasury: boolean; news: boolean };
  series: MacroSeries[];
  headlines: MacroHeadline[];
  disclaimer: string;
  tools?: { enabled: boolean; fredApiKey: boolean };
};

export async function fetchMacroSnapshot(): Promise<MacroSnapshot | null> {
  const { url, key } = getThesisApiConfig();
  if (!url) return null;

  try {
    const res = await fetch(`${url}/v1/macro/snapshot`, {
      headers: key ? { "X-Thesis-App-Key": key } : {},
    });
    if (!res.ok) return null;
    return (await res.json()) as MacroSnapshot;
  } catch {
    return null;
  }
}
