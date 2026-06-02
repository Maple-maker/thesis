import type { MilitaryStatus } from "@/lib/military-profile";

export type MilitaryResourceId =
  | "scra"
  | "tsp"
  | "roth-tsp"
  | "sdp"
  | "czte"
  | "brs"
  | "onesource"
  | "va-home-loan";

export type MilitaryResource = {
  id: MilitaryResourceId;
  acronym: string;
  title: string;
  summary: string;
  /** Plain-language why it matters for investing / cash flow */
  thesisAngle: string;
  url: string;
  source: string;
  /** Shown for these statuses; omit = all military */
  statuses?: MilitaryStatus[];
  /** Highlight for deploying active / reserve */
  deploymentRelevant?: boolean;
};

/**
 * Official and educational links for U.S. service members.
 * Educational only, verify eligibility and rules on official sites.
 */
export const MILITARY_FINANCIAL_RESOURCES: MilitaryResource[] = [
  {
    id: "scra",
    acronym: "SCRA",
    title: "Servicemembers Civil Relief Act",
    summary:
      "Federal protections while on active duty, capped interest on pre-service debt, lease termination rights, and court delays in some civil cases.",
    thesisAngle:
      "Before stressing about card APR, check if SCRA caps apply, freed-up cash flow can change how much you can invest.",
    url: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-servicemembers-civil-relief-act-scra-en-1873/",
    source: "CFPB",
  },
  {
    id: "tsp",
    acronym: "TSP",
    title: "Thrift Savings Plan",
    summary:
      "The federal 401(k)-style plan for uniformed service and federal employees, traditional and Roth buckets, low fees, lifecycle (L) funds.",
    thesisAngle:
      "Your TSP is often the core long-term sleeve, know your fund (G/F/C/S/I or L fund) before chasing individual stocks.",
    url: "https://www.tsp.gov/",
    source: "TSP.gov",
  },
  {
    id: "roth-tsp",
    acronym: "Roth TSP",
    title: "Roth TSP contributions",
    summary:
      "After-tax contributions inside TSP, tax-free qualified withdrawals later. Separate from Roth IRA limits but coordinated with your overall retirement picture.",
    thesisAngle:
      "Tax-free growth in Roth TSP pairs well with taxable brokerage/thesis picks, think asset location, not just picking hot tickers.",
    url: "https://www.tsp.gov/making-contributions/types-of-contributions/",
    source: "TSP.gov",
  },
  {
    id: "sdp",
    acronym: "SDP",
    title: "Savings Deposit Program",
    summary:
      "During qualifying combat-zone deployments, save up to $10,000 per deployment at 10% annual return (guaranteed by DoD), must leave funds in until deployment ends.",
    thesisAngle:
      "SDP can beat most ‘safe’ yields while deployed, often worth maxing before speculative bets with deployment cash.",
    url: "https://www.dfas.mil/militarymembers/pay/sdp/",
    source: "DFAS",
    statuses: ["active", "reserve"],
    deploymentRelevant: true,
  },
  {
    id: "czte",
    acronym: "CZTE",
    title: "Combat Zone Tax Exclusion",
    summary:
      "Income earned in designated combat zones can be excluded from federal taxable income for the period you qualify, changes take-home pay and savings capacity.",
    thesisAngle:
      "Higher take-home during CZTE months can fund emergency cash, SDP, TSP catch-up, or brokerage, plan before spending ramps up.",
    url: "https://www.irs.gov/newsroom/combat-zone-tax-exclusions",
    source: "IRS",
    statuses: ["active", "reserve"],
    deploymentRelevant: true,
  },
  {
    id: "brs",
    acronym: "BRS",
    title: "Blended Retirement System",
    summary:
      "Pension + TSP match for most who entered service after 2018, understand your years of service, multiplier, and whether you’re vested.",
    thesisAngle:
      "BRS means the government match is part of your comp, missing TSP match is leaving money on the table before any stock thesis.",
    url: "https://www.militaryonesource.mil/financial-legal/personal-finance/blended-retirement-system/",
    source: "Military OneSource",
    statuses: ["active", "reserve"],
  },
  {
    id: "onesource",
    acronym: "MOS",
    title: "Military OneSource · financial counseling",
    summary:
      "Free, confidential financial counseling for service members and families, budgeting, credit, PCS moves, and deployment planning.",
    thesisAngle:
      "Useful sanity check before big moves (car loan, house, leaving TSP default fund), complements Thesis education, not a substitute for advice.",
    url: "https://www.militaryonesource.mil/financial-legal/personal-finance/",
    source: "Military OneSource",
  },
  {
    id: "va-home-loan",
    acronym: "VA loan",
    title: "VA home loan benefit",
    summary:
      "Veterans and eligible active members may qualify for $0-down VA loans with no PMI, funding fee and occupancy rules apply.",
    thesisAngle:
      "Major purchase goal? VA loan math vs investing down-payment dollars belongs in your thesis horizon, not just stock picks.",
    url: "https://www.va.gov/housing-assistance/home-loans/",
    source: "VA.gov",
    statuses: ["veteran", "active", "reserve"],
  },
];

export function militaryResourcesForStatus(
  status: MilitaryStatus,
  options?: { deploymentFocus?: boolean }
): MilitaryResource[] {
  return MILITARY_FINANCIAL_RESOURCES.filter((r) => {
    if (r.statuses && !r.statuses.includes(status)) return false;
    if (options?.deploymentFocus && !r.deploymentRelevant) return false;
    return true;
  });
}
