/** Federal Reserve press releases RSS, headlines for macro context. */

export type MacroHeadline = {
  title: string;
  date: string;
  link: string;
};

let cache: { at: number; items: MacroHeadline[] } | null = null;
const TTL_MS = 30 * 60 * 1000;

const RSS_URL = "https://www.federalreserve.gov/feeds/press_all.xml";

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export async function fetchFedHeadlines(limit = 5): Promise<MacroHeadline[]> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return cache.items.slice(0, limit);
  }

  try {
    const res = await fetch(RSS_URL, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: MacroHeadline[] = [];
    const chunks = xml.split(/<item>/i).slice(1);
    for (const chunk of chunks.slice(0, limit + 2)) {
      const title = stripTags(
        chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""
      );
      const link = stripTags(chunk.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? "");
      const pub = stripTags(
        chunk.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ?? ""
      );
      if (title) items.push({ title, date: pub, link });
    }
    cache = { at: Date.now(), items };
    return items.slice(0, limit);
  } catch (e) {
    console.warn("[macro-news] RSS failed", e);
    return [];
  }
}
