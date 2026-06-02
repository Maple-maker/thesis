export type CreditGuideId =
  | "credit-score-101"
  | "build-credit-fast"
  | "utilization"
  | "points-vs-cashback"
  | "balance-transfer-playbook"
  | "authorized-user"
  | "freeze-report";

export type CreditGuide = {
  id: CreditGuideId;
  title: string;
  readMin: number;
  summary: string;
  sections: { heading: string; body: string }[];
};

export const CREDIT_GUIDES: CreditGuide[] = [
  {
    id: "credit-score-101",
    title: "Credit scores 101",
    readMin: 6,
    summary: "What FICO tracks, what doesn't, and why on-time payment dominates.",
    sections: [
      {
        heading: "What a score is",
        body: "A credit score is a statistical snapshot of how you've handled borrowed money. Lenders use it to estimate default risk, not your net worth or investing skill.",
      },
      {
        heading: "The big five factors",
        body: "Payment history (~35%), amounts owed / utilization (~30%), length of history (~15%), new credit (~10%), mix (~10%). Missing a payment hurts more than skipping a rewards category.",
      },
      {
        heading: "What to do this week",
        body: "Pull your free reports at AnnualCreditReport.com, set autopay for at least the minimum on every open tradeline, and aim for utilization under 30%, under 10% if you're optimizing before a mortgage.",
      },
    ],
  },
  {
    id: "build-credit-fast",
    title: "Build credit from scratch",
    readMin: 8,
    summary: "Secured cards, credit-builder loans, and the 6-month habit stack.",
    sections: [
      {
        heading: "Start with reporting",
        body: "You need an account that reports to Equifax, Experian, and TransUnion. Secured cards and some credit-builder products exist specifically for thin files.",
      },
      {
        heading: "The habit stack",
        body: "One small recurring charge (phone bill sized), autopay in full, never exceed 30% of limit. Six on-time months beat optimizing rewards.",
      },
      {
        heading: "When to upgrade",
        body: "After 6–12 months of clean history, graduate to a no-annual-fee cashback card, still pay in full. Closing your oldest card can hurt average age; keep it open with a small recurring charge.",
      },
    ],
  },
  {
    id: "utilization",
    title: "Utilization without panic",
    readMin: 5,
    summary: "Why your score swings before payday, and how statement dates matter.",
    sections: [
      {
        heading: "Statement balance vs due date",
        body: "Issuers often report your balance on the statement closing date. Paying down before that date lowers reported utilization even if you pay in full on the due date.",
      },
      {
        heading: "Per-card vs overall",
        body: "Both matter. One maxed card can drag scores even if total utilization looks fine across all cards.",
      },
    ],
  },
  {
    id: "points-vs-cashback",
    title: "Points vs cash back (TPG primer)",
    readMin: 7,
    summary: "When 2% cash beats 'free' travel, and the fee math you must run.",
    sections: [
      {
        heading: "Cash back is a rebate",
        body: "You know the value: 2% back is two cents per dollar. Points currencies float, 1 point might be worth 1¢ or 2¢+ depending on redemptions.",
      },
      {
        heading: "Travel cards need volume",
        body: "Premium travel cards make sense when you'll use credits (lounge, travel credit) and hit welcome offer minimum spend without carrying a balance.",
      },
      {
        heading: "Thesis rule",
        body: "If you have high-interest debt or no emergency fund, ignore points games. Build liquidity and pay down APR first.",
      },
    ],
  },
  {
    id: "balance-transfer-playbook",
    title: "Balance transfer playbook",
    readMin: 6,
    summary: "0% promos, fees, and the payoff schedule that actually works.",
    sections: [
      {
        heading: "Fee math",
        body: "A 3% transfer fee on $5,000 costs $150 upfront. Compare that to interest saved over the promo window vs your current APR.",
      },
      {
        heading: "Don't spend on the BT card",
        body: "Many cards allocate payments to promo balances last. New purchases can accrue interest at the go-to rate.",
      },
      {
        heading: "Divide and autopay",
        body: "Divide remaining balance by months in promo; set autopay above that minimum. Mark calendar 30 days before promo ends.",
      },
    ],
  },
  {
    id: "authorized-user",
    title: "Authorized users & piggybacking",
    readMin: 4,
    summary: "Family strategies, and risks when the primary user misses payments.",
    sections: [
      {
        heading: "How it helps",
        body: "Being added to a long, clean account can add history to your file. Not all issuers report AU data the same way.",
      },
      {
        heading: "Risk",
        body: "If the primary cardholder maxes out or pays late, your score can suffer. Trust matters more than perks.",
      },
    ],
  },
  {
    id: "freeze-report",
    title: "Freezes & fraud alerts",
    readMin: 4,
    summary: "When to freeze credit vs use a fraud alert before major applications.",
    sections: [
      {
        heading: "Security freeze",
        body: "Freezes block new accounts unless you thaw. Thaw before mortgage or card applications you initiate.",
      },
      {
        heading: "Fraud alert",
        body: "One-year alert tells lenders to verify identity, less restrictive than a freeze.",
      },
    ],
  },
];

export function creditGuideById(id: string): CreditGuide | undefined {
  return CREDIT_GUIDES.find((g) => g.id === id);
}
