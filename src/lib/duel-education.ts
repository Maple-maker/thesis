import { themeById } from "@/data/themes";
import type { DuelAsset } from "@/lib/duel-asset";
import type { CategoryBreakdown } from "@/lib/thesis-score";
import type { ThemeId, UserProfile } from "@/store/types";
import { thesisFitForAsset } from "@/lib/thesis-fit";

export function duelPrimerLines(
  a: DuelAsset,
  b: DuelAsset,
  themeIds: ThemeId[],
  profile: UserProfile
): string[] {
  const themes = themeIds
    .map((id) => themeById(id)?.title)
    .filter(Boolean)
    .join(" & ");
  return [
    `You're comparing ${a.symbol} vs ${b.symbol}, not picking a winner for life, but sharpening conviction.`,
    themes
      ? `Your active theses: ${themes}. The side with stronger alignment isn't always the higher-risk name.`
      : "Pick themes in Builder so we can score alignment.",
    `Ask: which name better matches your horizon (${profile.horizon}) and how you'd react to a 20% drop?`,
  ];
}

export function duelDebriefLines(
  winner: DuelAsset,
  loser: DuelAsset,
  profile: UserProfile,
  themeIds: ThemeId[]
): { headline: string; dimensions: { label: string; detail: string }[] } {
  const fitW = thesisFitForAsset(
    { kind: winner.kind, themes: winner.themes, stock: winner.stock, etf: winner.etf },
    profile,
    themeIds
  );
  const fitL = thesisFitForAsset(
    { kind: loser.kind, themes: loser.themes, stock: loser.stock, etf: loser.etf },
    profile,
    themeIds
  );

  const dimensions: { label: string; detail: string }[] = [
    {
      label: "Thesis alignment",
      detail: `${winner.symbol} ${fitW.score}/100 (${fitW.label}) vs ${loser.symbol} ${fitL.score}/100 (${fitL.label})`,
    },
  ];

  const breakdown = fitW.breakdown as CategoryBreakdown[] | undefined;
  if (breakdown?.length) {
    const top = [...breakdown].sort((x, y) => y.score - x.score)[0];
    const weak = [...breakdown].sort((x, y) => x.score - y.score)[0];
    dimensions.push({
      label: `Strongest: ${top.label}`,
      detail: top.reason,
    });
    if (weak.score < 50) {
      dimensions.push({
        label: `Watch: ${weak.label}`,
        detail: weak.reason,
      });
    }
  } else {
    dimensions.push({
      label: "Next step",
      detail: fitW.reasons[0] ?? "Add both to watchlist and run radar research from your model.",
    });
  }

  return {
    headline: `You leaned toward ${winner.symbol}, the duel is about process, not a permanent call.`,
    dimensions,
  };
}
