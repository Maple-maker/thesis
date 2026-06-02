import { libraryIndex, type LibraryEntry, type LibraryEntryKind } from "@/data/library-index";

export type LibrarySearchResult = LibraryEntry & { score: number };

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

function scoreEntry(entry: LibraryEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = entry.keywords.join(" ");
  let score = 0;
  for (const t of tokens) {
    if (entry.title.toLowerCase().includes(t)) score += 8;
    if (entry.subtitle.toLowerCase().includes(t)) score += 4;
    if (hay.includes(t)) score += 2;
    if (entry.keywords.some((k) => k === t)) score += 6;
  }
  return score;
}

export function searchLibrary(query: string, limit = 40): LibrarySearchResult[] {
  const tokens = tokenize(query.trim());
  if (!tokens.length) return [];

  return libraryIndex()
    .map((e) => ({ ...e, score: scoreEntry(e, tokens) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchLibraryByKind(
  query: string,
  kind: LibraryEntryKind
): LibrarySearchResult[] {
  return searchLibrary(query, 60).filter((r) => r.kind === kind);
}
