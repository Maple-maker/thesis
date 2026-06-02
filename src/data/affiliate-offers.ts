import type { UserProfile } from "@/store/types";

export type AffiliateCategory =
  | "credit-card"
  | "brokerage"
  | "hysa"
  | "credit-builder";

export type AffiliateOffer = {
  id: string;
  category: AffiliateCategory;
  name: string;
  headline: string;
  why: string;
  partnerLabel: string;
  /** Partner landing page, opened in-app browser. null until partner link is wired. */
  url: string | null;
};

export const AFFILIATE_DISCLOSURE =
  "Thesis may earn a commission if you open an account through our links. Offers are educational comparisons, not endorsements. Terms change; verify on the provider's site.";

/** Real affiliate programs, educational framing only, no specific rates or promotional language. */
export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  // ── HYSA ──────────────────────────────────────────────────────────────────
  {
    id: "hysa-marcus",
    category: "hysa",
    name: "Marcus by Goldman Sachs",
    headline: "High-yield savings, no fees, no minimums",
    why: "A dedicated HYSA keeps your emergency fund liquid and earning while you build your investing plan. Marcus is a Goldman Sachs brand with no monthly fees.",
    partnerLabel: "Partner offer",
    url: "https://www.marcus.com/us/en/savings",
  },
  {
    id: "hysa-ally",
    category: "hysa",
    name: "Ally Bank Savings",
    headline: "Online savings with buckets to organize your goals",
    why: "Ally's savings buckets let you separate emergency fund, travel, and down payment savings, helpful for seeing your financial picture at a glance.",
    partnerLabel: "Partner offer",
    url: "https://www.ally.com/bank/online-savings-account/",
  },
  {
    id: "hysa-discover",
    category: "hysa",
    name: "Discover Online Savings",
    headline: "No monthly fees, no minimum balance",
    why: "Straightforward high-yield savings from a well-known issuer. Good first HYSA if you are moving cash out of a checking account.",
    partnerLabel: "Partner offer",
    url: "https://www.discover.com/online-banking/savings-account/",
  },
  // ── Brokerage ─────────────────────────────────────────────────────────────
  {
    id: "broker-fidelity",
    category: "brokerage",
    name: "Fidelity",
    headline: "Full-service brokerage with fractional shares and no account minimums",
    why: "Fidelity offers commission-free stock and ETF trades, fractional shares, and strong research tools, a solid first brokerage when you are ready to invest.",
    partnerLabel: "Partner offer",
    url: "https://www.fidelity.com/open-account/overview",
  },
  {
    id: "broker-schwab",
    category: "brokerage",
    name: "Charles Schwab",
    headline: "Investor-friendly platform with education and no-minimum ETFs",
    why: "Schwab's combination of low-cost index ETFs, fractional shares (Stock Slices), and 24/7 support makes it beginner-accessible without sacrificing depth.",
    partnerLabel: "Partner offer",
    url: "https://www.schwab.com/open-an-account",
  },
  {
    id: "broker-vanguard",
    category: "brokerage",
    name: "Vanguard",
    headline: "The original low-cost index investing pioneer",
    why: "Vanguard invented the low-cost index fund. If your thesis is buy-and-hold with broad diversification, Vanguard's ETF lineup is among the cheapest in the industry.",
    partnerLabel: "Partner offer",
    url: "https://investor.vanguard.com/corporate-portal",
  },
  // ── Credit cards ──────────────────────────────────────────────────────────
  {
    id: "cc-secured-discover",
    category: "credit-card",
    name: "Discover it Secured",
    headline: "Build credit with a secured card, no annual fee",
    why: "A secured card is one of the most accessible ways to establish or rebuild credit. You put down a refundable deposit and get a credit line. Discover reports to all three bureaus.",
    partnerLabel: "Partner offer",
    url: "https://www.discover.com/credit-cards/secured/",
  },
  {
    id: "cc-secured-capital-one",
    category: "credit-card",
    name: "Capital One Platinum Secured",
    headline: "Secured card with a path to a higher credit line",
    why: "Capital One may increase your credit line after six on-time monthly payments without requiring an additional deposit, helpful if you are building from scratch.",
    partnerLabel: "Partner offer",
    url: "https://www.capitalone.com/credit-cards/secured-mastercard/",
  },
  {
    id: "cc-cashback-chase",
    category: "credit-card",
    name: "Chase Freedom Unlimited",
    headline: "Flat cashback on every purchase, no annual fee",
    why: "Only relevant if you pay your balance in full each month. If you carry a balance, interest costs will outweigh any cashback rewards.",
    partnerLabel: "Partner offer",
    url: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
  },
  {
    id: "cc-cashback-citi",
    category: "credit-card",
    name: "Citi Double Cash",
    headline: "Earn cashback when you buy and again when you pay",
    why: "A straightforward cashback structure, 1% when you purchase and 1% when you pay it off. The pay-it-off incentive aligns with responsible credit habits.",
    partnerLabel: "Partner offer",
    url: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
  },
  // ── Credit builder ────────────────────────────────────────────────────────
  {
    id: "credit-builder-self",
    category: "credit-builder",
    name: "Self Credit Builder Loan",
    headline: "Build credit history through small, structured monthly payments",
    why: "Self holds your loan proceeds in a CD while you make payments. At the end of the term, you get the money back (minus interest and fees), and you have built a payment history.",
    partnerLabel: "Partner offer",
    url: "https://www.self.inc/",
  },
  {
    id: "credit-builder-chime",
    category: "credit-builder",
    name: "Chime Credit Builder",
    headline: "Secured card with no credit check and no annual fee",
    why: "Chime's Credit Builder card links to your Chime checking account. You move money onto the card, spend it, and Chime reports on-time payments, no interest charges.",
    partnerLabel: "Partner offer",
    url: "https://www.chime.com/credit-builder/",
  },
];

/** Filter offers by category. */
export function offersByCategory(category: AffiliateCategory): AffiliateOffer[] {
  return AFFILIATE_OFFERS.filter((o) => o.category === category);
}

/** Profile-aware offer ranking, education-first ordering, not commission-maximizing. */
export function offersForProfile(profile: UserProfile): AffiliateOffer[] {
  const out: AffiliateOffer[] = [];

  if (!profile.hasEmergencyFund) {
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "hysa"));
  }
  if (profile.hasHighInterestDebt) {
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "credit-card").slice(0, 1));
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "credit-builder").slice(0, 1));
  } else if (profile.experience === "none" || profile.experience === "some") {
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "credit-card"));
  }
  if (profile.hasEmergencyFund && !profile.hasHighInterestDebt) {
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "brokerage"));
  }
  if (!profile.hasEmergencyFund && profile.experience === "none") {
    out.push(...AFFILIATE_OFFERS.filter((o) => o.category === "credit-builder"));
  }

  const seen = new Set<string>();
  return out
    .filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    })
    .slice(0, 5);
}

/** Human-readable category labels for UI filter chips. */
export const CATEGORY_LABELS: Record<AffiliateCategory, string> = {
  hysa: "Savings",
  brokerage: "Brokerage",
  "credit-card": "Credit",
  "credit-builder": "Credit",
};
