import type { ConceptId } from "@/data/concepts";
import type { ThemeId } from "@/store/types";

export type YoutubeVideo = {
  videoId: string;
  title: string;
  channel: string;
  duration?: string;
};

/** Default long-form picks when nothing more specific matches */
export const YOUTUBE_DEFAULT: YoutubeVideo[] = [
  {
    videoId: "d9Q5wc7tzr8",
    title: "Stock Market for Beginners, Ultimate Guide",
    channel: "Whiteboard Finance",
    duration: "~90 min",
  },
  {
    videoId: "ZCFkWDdmXG8",
    title: "Explained: The Stock Market (full episode)",
    channel: "Netflix",
    duration: "18 min",
  },
];

export const YOUTUBE_BY_CONCEPT: Partial<Record<ConceptId, YoutubeVideo[]>> = {
  "what-is-stock": [
    {
      videoId: "F3QpgXBtDeo",
      title: "How The Stock Exchange Works",
      channel: "Kurzgesagt",
      duration: "4 min",
    },
    {
      videoId: "d9Q5wc7tzr8",
      title: "Stock Market for Beginners",
      channel: "Whiteboard Finance",
      duration: "~90 min",
    },
  ],
  "compound-interest": [
    {
      videoId: "ztBHBYrBMFI",
      title: "Compound Interest",
      channel: "Khan Academy",
      duration: "7 min",
    },
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  "time-value-money": [
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  inflation: [
    {
      videoId: "ZCFkWDdmXG8",
      title: "Explained: The Stock Market",
      channel: "Netflix",
      duration: "18 min",
    },
  ],
  bonds: [
    {
      videoId: "Szzq26IuJSU",
      title: "Bonds Explained",
      channel: "The Plain Bagel",
      duration: "10 min",
    },
    {
      videoId: "ztBHBYrBMFI",
      title: "Introduction to Bonds",
      channel: "Khan Academy",
      duration: "8 min",
    },
  ],
  bitcoin: [
    {
      videoId: "bBCNDevn5K8",
      title: "But how does bitcoin actually work?",
      channel: "3Blue1Brown",
      duration: "26 min",
    },
  ],
  "fed-rate": [
    {
      videoId: "Szzq26IuJSU",
      title: "How the Federal Reserve Works",
      channel: "The Plain Bagel",
      duration: "11 min",
    },
    {
      videoId: "ZCFkWDdmXG8",
      title: "Explained: The Stock Market",
      channel: "Netflix",
      duration: "18 min",
    },
  ],
  diversification: [
    {
      videoId: "Szzq26IuJSU",
      title: "Diversification Explained",
      channel: "The Plain Bagel",
      duration: "8 min",
    },
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  "risk-vs-return": [
    {
      videoId: "Szzq26IuJSU",
      title: "Risk vs Return",
      channel: "The Plain Bagel",
      duration: "10 min",
    },
  ],
  "what-is-etf": [
    {
      videoId: "Szzq26IuJSU",
      title: "ETFs Explained",
      channel: "The Plain Bagel",
      duration: "9 min",
    },
    {
      videoId: "uIKVctGl0TA",
      title: "The Problem with ETFs",
      channel: "Ben Felix",
      duration: "12 min",
    },
  ],
  "credit-score": [
    {
      videoId: "d9Q5wc7tzr8",
      title: "Stock Market for Beginners (credit section)",
      channel: "Whiteboard Finance",
      duration: "~90 min",
    },
  ],
  "dollar-cost-averaging": [
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  "bull-bear-market": [
    {
      videoId: "ZCFkWDdmXG8",
      title: "Explained: The Stock Market",
      channel: "Netflix",
      duration: "18 min",
    },
  ],
  "pe-ratio": [
    {
      videoId: "d9Q5wc7tzr8",
      title: "Stock Market for Beginners (valuation ratios)",
      channel: "Whiteboard Finance",
      duration: "~90 min",
    },
  ],
  moat: [
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  "free-cash-flow": [
    {
      videoId: "d9Q5wc7tzr8",
      title: "Stock Market for Beginners (financial statements)",
      channel: "Whiteboard Finance",
      duration: "~90 min",
    },
  ],
  "active-vs-passive": [
    {
      videoId: "uIKVctGl0TA",
      title: "The Problem with ETFs",
      channel: "Ben Felix",
      duration: "12 min",
    },
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
  dcf: [
    {
      videoId: "d9Q5wc7tzr8",
      title: "Stock Market for Beginners (valuation)",
      channel: "Whiteboard Finance",
      duration: "~90 min",
    },
  ],
};

const YOUTUBE_BY_THEME: Partial<Record<ThemeId, YoutubeVideo[]>> = {
  "ai-infrastructure": [
    {
      videoId: "ZCFkWDdmXG8",
      title: "Explained: The Stock Market",
      channel: "Netflix",
      duration: "18 min",
    },
  ],
  "global-diversification": [
    {
      videoId: "Szzq26IuJSU",
      title: "Diversification Explained",
      channel: "The Plain Bagel",
      duration: "8 min",
    },
  ],
  income: [
    {
      videoId: "wNXq90nyh-M",
      title: "The Simple Path to Wealth (talk)",
      channel: "JL Collins",
      duration: "45 min",
    },
  ],
};

export function youtubeForConcept(conceptId: ConceptId): YoutubeVideo[] {
  const specific = YOUTUBE_BY_CONCEPT[conceptId];
  if (specific?.length) return specific;
  return YOUTUBE_DEFAULT.slice(0, 2);
}

export function youtubeForTheme(themeId: string): YoutubeVideo[] {
  return YOUTUBE_BY_THEME[themeId as ThemeId] ?? YOUTUBE_DEFAULT.slice(0, 2);
}

export function youtubeForNotFound(
  kind: "theme" | "stock" | "builder" | "generic",
  query?: string
): YoutubeVideo[] {
  if (kind === "stock") {
    return [
      {
        videoId: "F3QpgXBtDeo",
        title: "How The Stock Exchange Works",
        channel: "Kurzgesagt",
        duration: "4 min",
      },
      ...YOUTUBE_DEFAULT.slice(0, 1),
    ];
  }
  if (kind === "theme" || kind === "builder") {
    const themed = query ? youtubeForTheme(query) : [];
    return themed.length > 0 ? themed : YOUTUBE_DEFAULT;
  }
  return YOUTUBE_DEFAULT;
}
