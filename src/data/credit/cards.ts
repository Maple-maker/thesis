import type { UserProfile } from "@/store/types";

export type CreditCardCategory =
  | "secured"
  | "cashback"
  | "travel"
  | "balance-transfer"
  | "student"
  | "no-annual-fee";

export type CreditTier = "limited" | "fair" | "good" | "excellent";

export type CreditCardProduct = {
  id: string;
  name: string;
  issuer: string;
  category: CreditCardCategory;
  annualFee: string;
  aprRange: string;
  rewardsSummary: string;
  welcomeOffer?: string;
  bestFor: string[];
  pros: string[];
  cons: string[];
  creditNeeded: CreditTier;
  affiliateOfferId?: string;
  /** Points Guy–style note */
  expertTake?: string;
};

export const CREDIT_CATEGORY_LABELS: Record<CreditCardCategory, string> = {
  secured: "Build credit",
  cashback: "Cash back",
  travel: "Travel & points",
  "balance-transfer": "Balance transfer",
  student: "Student",
  "no-annual-fee": "No annual fee",
};

export const CREDIT_CARDS: CreditCardProduct[] = [
  {
    id: "discover-secured",
    name: "Discover it Secured",
    issuer: "Discover",
    category: "secured",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "2% cash back at gas & restaurants (up to $1k/quarter), 1% elsewhere; match at end of year one",
    bestFor: ["First card", "Rebuilding credit", "Cash back while building"],
    pros: ["No annual fee", "Reports to all three bureaus", "Graduation path to unsecured"],
    cons: ["Requires refundable security deposit", "Not for carrying balances"],
    creditNeeded: "limited",
    affiliateOfferId: "cc-secured-discover",
    expertTake: "The default NerdWallet-style starter pick when you need to establish history.",
  },
  {
    id: "capital-one-platinum-secured",
    name: "Capital One Platinum Secured",
    issuer: "Capital One",
    category: "secured",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "No rewards, pure credit-building",
    bestFor: ["Thin file", "After denial on unsecured"],
    pros: ["Possible credit line increase after 6 on-time payments", "Low minimum deposit options"],
    cons: ["No rewards", "High APR if you carry a balance"],
    creditNeeded: "limited",
    affiliateOfferId: "cc-secured-capital-one",
  },
  {
    id: "chime-credit-builder",
    name: "Chime Credit Builder",
    issuer: "Chime",
    category: "secured",
    annualFee: "$0",
    aprRange: "N/A, pay in full from secured balance",
    rewardsSummary: "No traditional rewards; builds history via secured spending",
    bestFor: ["No credit check", "Already use Chime checking"],
    pros: ["No hard pull", "No interest if used as debit-style"],
    cons: ["Requires Chime account", "Not a classic credit card for travel perks"],
    creditNeeded: "limited",
    affiliateOfferId: "credit-builder-chime",
  },
  {
    id: "citi-double-cash",
    name: "Citi Double Cash",
    issuer: "Citi",
    category: "cashback",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "2% total, 1% on purchase + 1% when you pay",
    welcomeOffer: "Varies, check issuer site",
    bestFor: ["Pay in full monthly", "Simple cashback"],
    pros: ["Strong effective rate for pay-in-full users", "No annual fee"],
    cons: ["No bonus categories", "Foreign transaction fee on some versions"],
    creditNeeded: "good",
    affiliateOfferId: "cc-cashback-citi",
    expertTake: "The Points Guy crowd still respects it as a 'set and forget' 2% card.",
  },
  {
    id: "chase-freedom-unlimited",
    name: "Chase Freedom Unlimited",
    issuer: "Chase",
    category: "cashback",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "5% travel via Chase portal, 3% dining & drugstores, 1.5% everything else",
    bestFor: ["Chase ecosystem", "Flexible cashback"],
    pros: ["Pairs with Sapphire for transfer partners", "No annual fee"],
    cons: ["Must pay in full, APR hurts if you revolve", "Approval needs good credit"],
    creditNeeded: "good",
    affiliateOfferId: "cc-cashback-chase",
  },
  {
    id: "amex-blue-cash-preferred",
    name: "Blue Cash Preferred",
    issuer: "American Express",
    category: "cashback",
    annualFee: "$95 (see issuer for waivers)",
    aprRange: "Variable",
    rewardsSummary: "6% groceries (cap), 6% streaming, 3% gas & transit",
    bestFor: ["Households with high grocery spend"],
    pros: ["Category rates beat flat 2% if you hit caps"],
    cons: ["Annual fee, run the math", "Not accepted everywhere"],
    creditNeeded: "good",
  },
  {
    id: "capital-one-venture-x",
    name: "Venture X",
    issuer: "Capital One",
    category: "travel",
    annualFee: "$395",
    aprRange: "Variable",
    rewardsSummary: "2x miles everywhere; portal bonuses; $300 travel credit + lounge access",
    bestFor: ["Travel 4+ times/year", "Want lounge without Chase"],
    pros: ["Credits can offset fee", "Transfer partners"],
    cons: ["Only worth it if you use credits", "Premium approval bar"],
    creditNeeded: "excellent",
    expertTake: "TPG-style value play, fee math is everything.",
  },
  {
    id: "chase-sapphire-preferred",
    name: "Sapphire Preferred",
    issuer: "Chase",
    category: "travel",
    annualFee: "$95",
    aprRange: "Variable",
    rewardsSummary: "2x travel & dining; 25% portal boost; transfer to Hyatt/United/etc.",
    bestFor: ["First travel card", "Chase trifecta start"],
    pros: ["Strong welcome offers periodically", "Transfer partners"],
    cons: ["$95 fee if you don't travel", "5/24 rule for Chase"],
    creditNeeded: "good",
  },
  {
    id: "bilt-mastercard",
    name: "Bilt Mastercard",
    issuer: "Wells Fargo",
    category: "travel",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "1x on rent (no fee), 2x travel, 3x dining, points transfer to partners",
    bestFor: ["Renters", "No-fee travel points"],
    pros: ["Unique rent earning", "No annual fee"],
    cons: ["Must make 5 transactions/month for rent points", "Still need good credit"],
    creditNeeded: "good",
  },
  {
    id: "citi-diamond-preferred",
    name: "Citi Diamond Preferred",
    issuer: "Citi",
    category: "balance-transfer",
    annualFee: "$0",
    aprRange: "0% intro APR on BT, see issuer for length",
    rewardsSummary: "No rewards focus, long 0% BT window",
    bestFor: ["Paying down existing card debt"],
    pros: ["Intro APR for transfers", "No annual fee"],
    cons: ["BT fee usually applies", "Revert to high APR after promo"],
    creditNeeded: "good",
  },
  {
    id: "wells-active-cash",
    name: "Wells Fargo Active Cash",
    issuer: "Wells Fargo",
    category: "balance-transfer",
    annualFee: "$0",
    aprRange: "0% intro purchases & BT",
    rewardsSummary: "2% cash rewards on all purchases",
    bestFor: ["BT + ongoing 2% in one card"],
    pros: ["Simple structure", "Intro APR window"],
    cons: ["Check BT fee %", "Not a travel powerhouse"],
    creditNeeded: "good",
  },
  {
    id: "discover-it-student",
    name: "Discover it Student Chrome",
    issuer: "Discover",
    category: "student",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "2% gas & restaurants, 1% else; Good Grade reward",
    bestFor: ["College students", "First unsecured card"],
    pros: ["Forgiving for thin files", "Cashback match year one"],
    cons: ["Must be student", "Low limits at start"],
    creditNeeded: "fair",
  },
  {
    id: "capital-one-savor-student",
    name: "Savor Student",
    issuer: "Capital One",
    category: "student",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "3% dining, entertainment, streaming; 1% else",
    bestFor: ["Students who dine out"],
    pros: ["Category rewards without annual fee"],
    cons: ["Entertainment cap policies change, verify"],
    creditNeeded: "fair",
  },
  {
    id: "apple-card",
    name: "Apple Card",
    issuer: "Goldman Sachs",
    category: "no-annual-fee",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "3% Apple Pay at Apple & partners, 2% Apple Pay elsewhere, 1% physical card",
    bestFor: ["iPhone users", "Daily pay-in-full"],
    pros: ["Daily cash to Apple Cash", "Clean wallet UX"],
    cons: ["Best rewards require Apple Pay", "Limited travel perks"],
    creditNeeded: "good",
  },
  {
    id: "amex-everyday",
    name: "Amex EveryDay",
    issuer: "American Express",
    category: "no-annual-fee",
    annualFee: "$0",
    aprRange: "Variable",
    rewardsSummary: "2x at supermarkets; 20% bonus if 20+ purchases/month",
    bestFor: ["Membership Rewards starter", "Grocery spend"],
    pros: ["Points transfer with premium Amex cards later"],
    cons: ["Merchant acceptance", "Complex bonus rules"],
    creditNeeded: "good",
  },
];

const BY_ID = Object.fromEntries(CREDIT_CARDS.map((c) => [c.id, c])) as Record<
  string,
  CreditCardProduct
>;

export function creditCardById(id: string): CreditCardProduct | undefined {
  return BY_ID[id];
}

export function creditCardsByCategory(cat: CreditCardCategory): CreditCardProduct[] {
  return CREDIT_CARDS.filter((c) => c.category === cat);
}

const TIER_ORDER: CreditTier[] = ["limited", "fair", "good", "excellent"];

function tierIndex(t: CreditTier) {
  return TIER_ORDER.indexOf(t);
}

/** NerdWallet-style: rank cards user is likely to qualify for + fit goals */
export function matchCreditCards(profile: UserProfile, limit = 8): CreditCardProduct[] {
  const maxTier: CreditTier = profile.hasHighInterestDebt
    ? "fair"
    : profile.experience === "none"
      ? "limited"
      : profile.experience === "some"
        ? "good"
        : "excellent";

  const maxIdx = tierIndex(maxTier);

  let pool = CREDIT_CARDS.filter((c) => tierIndex(c.creditNeeded) <= maxIdx);

  if (!profile.hasEmergencyFund || profile.experience === "none") {
    pool = [
      ...pool.filter((c) => c.category === "secured" || c.category === "student"),
      ...pool.filter((c) => c.category !== "secured" && c.category !== "student"),
    ];
  }

  if (profile.hasHighInterestDebt) {
    pool = [
      ...pool.filter((c) => c.category === "balance-transfer"),
      ...pool.filter((c) => c.category !== "balance-transfer"),
    ];
  }

  if (profile.primaryGoal === "house" || profile.horizon === "short") {
    pool = pool.sort((a, b) => {
      const score = (c: CreditCardProduct) =>
        (c.category === "secured" ? 2 : 0) + (c.annualFee === "$0" ? 1 : 0);
      return score(b) - score(a);
    });
  }

  const seen = new Set<string>();
  return pool
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .slice(0, limit);
}
