import type { UserProfile } from "@/store/types";
import type { ThemeId } from "@/store/types";
import { themeById } from "@/data/themes";
import type { ModelThesis } from "@/store/index";

export type AskPromptChip = {
  id: string;
  label: string;
  question: string;
};

export function askPromptsForProfile(
  profile: UserProfile,
  themeIds: ThemeId[],
  options?: { accountsConnected?: boolean; modelThesis?: ModelThesis | null }
): AskPromptChip[] {
  const top = themeIds[0] ? themeById(themeIds[0]) : undefined;
  const model = options?.modelThesis;
  const chips: AskPromptChip[] = [];

  if (model?.holdings.length) {
    const names = model.holdings.map((h) => h.symbol).join(", ");
    chips.push({
      id: "stress-model",
      label: "Stress-test book",
      question: `My model book (${names}), what are the biggest risks and overlaps vs my profile?`,
    });
  }

  chips.push(
    {
      id: "fed-macro",
      label: "Fed & rates",
      question:
        "Use live macro data: how do current Fed and Treasury levels affect someone with my risk profile and holdings?",
    },
    {
      id: "macro-news",
      label: "Macro news",
      question:
        "Summarize what recent Fed headlines mean for long-term investors, and how it might touch my themes.",
    },
    {
      id: "risk",
      label: "Portfolio risk",
      question: "Am I taking on too much risk for my stated horizon and temperament?",
    },
    {
      id: "concentration",
      label: "Concentration",
      question: "How concentrated is my watchlist, and what would diversification mean for me?",
    }
  );

  if (profile.primaryGoal === "house") {
    chips.push({
      id: "house",
      label: "Buy a home",
      question: "How should I think about investing vs saving for a down payment?",
    });
  }

  if (top) {
    chips.push({
      id: "thesis",
      label: "My top thesis",
      question: `What should I understand about the "${top.title}" thesis before adding names?`,
    });
  }

  chips.push({
    id: "roth",
    label: "Roth IRA",
    question: "What is a Roth IRA, and when might it fit someone with my profile?",
  });

  if (profile.experience === "none") {
    chips.push({
      id: "basics",
      label: "Start here",
      question: "What are the first five concepts I should learn before picking stocks?",
    });
  } else {
    chips.push({
      id: "stress",
      label: "Stress test",
      question: "How would a broad market drawdown affect someone with my risk tolerance?",
    });
  }

  if (options?.accountsConnected) {
    chips.unshift({
      id: "commodity-etf",
      label: "Commodities",
      question:
        "I want exposure to copper, gold, and iron, what ETFs fit, and how do rare earth bottlenecks matter?",
    });
    chips.unshift({
      id: "defense-etf",
      label: "Defense ETFs",
      question: "Recommend me an ETF for defense stocks",
    });
    chips.unshift({
      id: "allocation",
      label: "My allocation",
      question:
        "Given my linked holdings and weights, what concentration or overlap should I understand?",
    });
    chips.push({
      id: "retire",
      label: "Retirement path",
      question: "Based on my linked balances, how should I think about retirement savings pace?",
    });
  }

  return chips.slice(0, 6);
}
