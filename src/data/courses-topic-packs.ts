import type { ConceptId } from "@/data/concepts";
import type { Course, CourseId, Lesson, LessonStep } from "@/data/courses";
import type { LessonImageKey } from "@/data/lesson-images";
import type { UserProfile } from "@/store/types";

function longHorizon(p: UserProfile) {
  return p.horizon === "long" || p.horizon === "very-long";
}
function lowRisk(p: UserProfile) {
  return p.risk === "very-low" || p.risk === "low";
}

export type TopicCourseId = Extract<
  CourseId,
  | "bonds-basics"
  | "fed-and-markets"
  | "bitcoin-101"
  | "international-markets"
  | "diversification-essentials"
  | "taxes-investing"
  | "risk-volatility"
  | "behavioral-investing"
  | "dividends-income"
  | "recession-resilience"
>;

function c(
  id: string,
  title: string,
  paragraphs: string[],
  conceptLinks?: ConceptId[],
  didYouKnow?: string,
  imageKey?: LessonImageKey,
  profileAside?: (profile: UserProfile) => string | null
): LessonStep {
  return { kind: "content", id, title, paragraphs, conceptLinks, didYouKnow, imageKey, profileAside };
}

function q(
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  correctFeedback: string,
  incorrectFeedback: string
): LessonStep {
  return { kind: "quiz", id, question, options, correctIndex, correctFeedback, incorrectFeedback };
}

function lesson(
  id: string,
  courseId: TopicCourseId,
  order: number,
  title: string,
  steps: LessonStep[],
  keyTakeaways: string[],
  estimatedMin = 6
): Lesson {
  return { id, courseId, order, title, steps, keyTakeaways, estimatedMin };
}

// ── Bonds ────────────────────────────────────────────────────────────────────

const BD_L1 = lesson(
  "bd-what-are-bonds",
  "bonds-basics",
  1,
  "What are bonds?",
  [
    c(
      "bd-l1-s1",
      "Bonds in one minute",
      [
        "When you buy a bond, you lend money to a government or company. They pay you interest (the coupon) and promise to return your principal at maturity unless they default.",
        "Treasuries are backed by the US government. Investment-grade corporates pay more yield for more credit risk. High-yield ('junk') bonds pay even more, with higher default risk.",
      ],
      ["bonds", "interest-rate"]
    ),
    c(
      "bd-l1-s2",
      "Why prices move",
      [
        "Bond prices and interest rates usually move opposite directions. If rates jump from 4% to 6%, older bonds paying 4% are less attractive, their price falls so yields rise.",
        "Duration measures sensitivity: longer-dated bonds usually swing more when rates change.",
      ],
      ["bonds", "fed-rate"],
      "In 2022–2023, rapid Fed hikes hit long-term bond funds hard, a reminder that 'safe' does not mean 'unchanging.'"
    ),
    q(
      "bd-l1-q1",
      "When market interest rates rise, existing bond prices generally…",
      ["Fall", "Rise", "Stay flat", "Double"],
      0,
      "Correct, higher new yields make older coupons less attractive unless prices adjust down.",
      "It's the inverse relationship that confuses beginners, rates up, prices down."
    ),
  ],
  ["Bonds are loans you own", "Rate moves change bond prices", "Match bond type to your risk budget"]
);

const BD_L2 = lesson(
  "bd-bonds-in-portfolio",
  "bonds-basics",
  2,
  "Bonds in your portfolio",
  [
    c(
      "bd-l2-s1",
      "Role of bonds",
      [
        "Many investors use bonds for ballast, they often (not always) cushion stock drawdowns and provide income.",
        "ETFs like AGG or BND hold hundreds of bonds in one ticker. You get diversification without picking individual issuers.",
      ],
      ["bonds", "what-is-etf", "diversification"],
      undefined,
      "etf-diversify"
    ),
    q(
      "bd-l2-q1",
      "A broad bond ETF mainly helps with…",
      ["Instant diversification across many issuers", "Guaranteed stock-like returns", "Avoiding all interest-rate risk", "Replacing an emergency fund"],
      0,
      "Right, one fund, many bonds. You still have rate and credit risk, just spread out.",
      "Bond ETFs diversify issuers, they do not eliminate rate risk."
    ),
  ],
  ["Use bond ETFs for simple exposure", "Bonds complement stocks, they don't replace planning"]
);

// ── Fed ──────────────────────────────────────────────────────────────────────

const FM_L1 = lesson(
  "fm-fed-basics",
  "fed-and-markets",
  1,
  "What is the Federal Reserve?",
  [
    c(
      "fm-l1-s1",
      "The Fed's job",
      [
        "The Federal Reserve is the US central bank. It sets short-term interest rates, supervises banks, and acts as lender of last resort in crises.",
        "Its dual mandate: maximum employment and stable prices (inflation near 2%).",
      ],
      ["fed-rate"]
    ),
    c(
      "fm-l1-s2",
      "How policy reaches you",
      [
        "Fed hikes flow into mortgage rates, car loans, credit cards, and savings yields, usually with a lag.",
        "Stocks often struggle when rates rise quickly because future profits are worth less when discounted at higher rates.",
      ],
      ["fed-rate", "inflation", "time-value-money"],
      "Markets sometimes fall on 'good news' (strong jobs) if traders fear the Fed will hike again."
    ),
    q(
      "fm-l1-q1",
      "When the Fed raises rates to fight inflation, borrowing usually becomes…",
      ["More expensive", "Free", "Unchanged overnight", "Illegal"],
      0,
      "Yes, tighter money is the point.",
      "Higher policy rates typically mean higher loan costs."
    ),
  ],
  ["The Fed sets short-term rates", "Hikes cool inflation but tighten financial conditions"]
);

const FM_L2 = lesson(
  "fm-markets-react",
  "fed-and-markets",
  2,
  "How markets react",
  [
    c(
      "fm-l2-s1",
      "Stocks, bonds, dollar",
      [
        "Growth stocks with profits far in the future are often rate-sensitive. Banks can benefit from wider lending spreads.",
        "Bonds usually sell off when rates rise. The dollar may strengthen, hurting US multinationals' overseas earnings.",
      ],
      ["fed-rate", "bull-bear-market"]
    ),
    q(
      "fm-l2-q1",
      "Why can high-growth tech stocks sell off when rates jump?",
      ["Higher rates discount future profits more heavily", "The Fed bans tech", "Dividends are mandatory", "EPS always falls"],
      0,
      "Exactly, it's a valuation / discount-rate story.",
      "Long-duration cash flows are most sensitive to rate changes."
    ),
  ],
  ["Read Fed news through the lens of rates and inflation", "Different sectors respond differently"]
);

// ── Bitcoin ──────────────────────────────────────────────────────────────────

const BTC_L1 = lesson(
  "btc-what-is-it",
  "bitcoin-101",
  1,
  "What is Bitcoin?",
  [
    c(
      "btc-l1-s1",
      "Digital scarcity",
      [
        "Bitcoin runs on a public blockchain, a ledger no single company controls. Supply is capped at 21 million coins; issuance slows over time.",
        "There are no earnings or cash flows. Value comes from belief others will accept it, plus liquidity and regulation.",
      ],
      ["bitcoin"],
      undefined,
      "bitcoin-coin"
    ),
    q(
      "btc-l1-q1",
      "Bitcoin differs from a stock because it…",
      ["Has no underlying business cash flows", "Always pays a 4% dividend", "Is only traded once a year", "Is insured by the FDIC"],
      0,
      "Right, it's an asset narrative, not a company.",
      "Stocks represent ownership in businesses; Bitcoin does not."
    ),
  ],
  ["Bitcoin is decentralized digital money", "No cash flows, pure sentiment + adoption"]
);

const BTC_L2 = lesson(
  "btc-portfolio-role",
  "bitcoin-101",
  2,
  "Bitcoin in a portfolio",
  [
    c(
      "btc-l2-s1",
      "Sizing and custody",
      [
        "Many advisors treat crypto as a small satellite (often low single digits) because drawdowns can exceed 50%.",
        "Custody matters: exchange risk vs hardware wallet. Lost passwords can mean lost coins forever.",
      ],
      ["bitcoin", "risk-vs-return", "volatility"],
      "Bitcoin fell roughly 65% in 2022, a stress test for anyone who overweighted it.",
      "bitcoin-coin"
    ),
    q(
      "btc-l2-q1",
      "A sensible way to think about Bitcoin for most learners is…",
      ["Small, optional sleeve you could afford to lose", "Replace all bonds", "Emergency fund", "Guaranteed inflation hedge"],
      0,
      "Yes, size to worst-case loss.",
      "Bitcoin is volatile, treat sizing seriously."
    ),
  ],
  ["Keep crypto small unless you have high conviction and stamina", "Understand custody before you buy"]
);

// ── International ────────────────────────────────────────────────────────────

const INT_L1 = lesson(
  "int-why-global",
  "international-markets",
  1,
  "Why invest internationally?",
  [
    c(
      "int-l1-s1",
      "Home bias",
      [
        "US investors often hold mostly US stocks, missing revenue from Europe, Asia, and emerging markets.",
        "International diversification can smooth returns when the US lags, though it also adds currency and political risk.",
      ],
      ["diversification", "what-is-etf"]
    ),
    q(
      "int-l1-q1",
      "International ETFs like VXUS or EFA mainly add…",
      ["Exposure outside your home market", "Guaranteed higher returns", "No currency effects", "US tax exemption"],
      0,
      "Correct, geographic diversification.",
      "International funds hold non-US companies."
    ),
  ],
  ["Don't assume US always leads", "International = different risks and opportunities"]
);

const INT_L2 = lesson(
  "int-how-to-access",
  "international-markets",
  2,
  "How to get exposure",
  [
    c(
      "int-l2-s1",
      "ETF building blocks",
      [
        "Developed markets: VEA, EFA, VXUS (includes emerging). Emerging only: VWO, IEMG.",
        "Single-country funds (EWJ, FXI) are concentrated bets, use sparingly.",
      ],
      ["what-is-etf", "expense-ratio"]
    ),
    q(
      "int-l2-q1",
      "A total international ex-US fund helps avoid…",
      ["Picking one country incorrectly", "All volatility", "Currency forever", "Needing a brokerage"],
      0,
      "Yes, broad funds spread country risk.",
      "Single-country ETFs are higher-conviction bets."
    ),
  ],
  ["Start broad with ex-US total market funds", "Country ETFs are tactical tools"]
);

// ── Diversification ──────────────────────────────────────────────────────────

const DIV_L1 = lesson(
  "div-why",
  "diversification-essentials",
  1,
  "What is diversification?",
  [
    c(
      "div-l1-s1",
      "Don't put all eggs in one basket",
      [
        "Diversification means spreading money across assets that don't move in lockstep, stocks, bonds, regions, sectors.",
        "The goal is not maximizing return in one great year; it's surviving bad years without irreversible damage.",
      ],
      ["diversification", "risk-vs-return"]
    ),
    q(
      "div-l1-q1",
      "True diversification requires assets that…",
      ["Don't always move together", "Always go up", "Are all tech stocks", "Share one CEO"],
      0,
      "Right, low correlation is the magic (when it works).",
      "Owning ten similar stocks is not true diversification."
    ),
  ],
  ["Diversification reduces single-point failure", "Correlations spike in crises, still worth doing"]
);

const DIV_L2 = lesson(
  "div-practice",
  "diversification-essentials",
  2,
  "Diversification in practice",
  [
    c(
      "div-l2-s1",
      "Layers",
      [
        "Core: broad US + international stock ETFs. Ballast: bonds or cash. Satellites: themes, single stocks, crypto.",
        "Check overlap, owning NVDA, QQQ, and a tech-heavy growth fund triples the same bet.",
      ],
      ["what-is-etf", "diversification"]
    ),
    q(
      "div-l2-q1",
      "Owning VOO + QQQ + five mega-cap tech stocks mostly adds…",
      ["Overlap, not new diversification", "Bond exposure", "International revenue", "Lower volatility always"],
      0,
      "Exactly, use X-Ray thinking before you add another ticker.",
      "Many 'different' holdings can share the same underlying risk."
    ),
  ],
  ["Build core + satellites", "Watch overlap in tech-heavy books"]
);

// ── Taxes ────────────────────────────────────────────────────────────────────

const TAX_L1 = lesson(
  "tax-types",
  "taxes-investing",
  1,
  "Taxes on investments",
  [
    c(
      "tax-l1-s1",
      "Three buckets",
      [
        "Ordinary income tax on short-term gains and interest. Long-term capital gains rates for assets held over a year (US).",
        "Tax-advantaged accounts (Roth, Traditional IRA, 401k) change when you pay, not whether you eventually might.",
      ],
      ["roth-vs-traditional", "brokerage-account"]
    ),
    q(
      "tax-l1-q1",
      "Roth IRA withdrawals in retirement are generally…",
      ["Tax-free if qualified", "Taxed as ordinary income always", "Illegal after 50", "Only for bonds"],
      0,
      "Yes, you paid tax going in.",
      "Roth uses after-tax contributions for tax-free qualified withdrawals."
    ),
  ],
  ["Account type matters as much as what you buy", "Hold period affects capital gains rate"]
);

const TAX_L2 = lesson(
  "tax-drag",
  "taxes-investing",
  2,
  "Tax drag in projections",
  [
    c(
      "tax-l2-s1",
      "Illustrative planning",
      [
        "In our Scenario planning tool, 'effective tax drag' lowers after-tax compounding, a simple way to see why location and turnover matter.",
        "ETFs often distribute fewer capital gains than active mutual funds, but you still owe tax on dividends in taxable accounts.",
      ],
      ["expense-ratio", "what-is-etf"]
    ),
    q(
      "tax-l2-q1",
      "In a taxable brokerage, you generally owe tax on…",
      ["Dividends and realized gains", "Unrealized gains every day automatically", "Nothing ever", "Only losses"],
      0,
      "Right, realized events trigger tax (simplified).",
      "Unrealized gains aren't taxed until you sell (with exceptions)."
    ),
  ],
  ["Model after-tax returns for realism", "Use tax-advantaged space for long-term compounding"]
);

// ── Risk & volatility ──────────────────────────────────────────────────────────

const RV_L1 = lesson(
  "rv-volatility",
  "risk-volatility",
  1,
  "Volatility vs risk",
  [
    c(
      "rv-l1-s1",
      "Definitions",
      [
        "Volatility is how much prices swing. Risk is the chance you can't reach your goal, which might be running out of money, panic-selling, or concentration.",
        "A stock can be volatile but recover; you still need a plan you can stick with.",
      ],
      ["volatility", "drawdown", "risk-vs-return"]
    ),
    q(
      "rv-l1-q1",
      "For most personal investors, the biggest risk is often…",
      ["Behavior, selling at the bottom", "Daily headlines", "Expense ratios only", "International stocks existing"],
      0,
      "Yes, plan and temperament beat clever timing.",
      "Behavioral mistakes destroy more wealth than math errors."
    ),
  ],
  ["Volatility ≠ permanent loss until you sell", "Match holdings to sleep-at-night risk"]
);

const RV_L2 = lesson(
  "rv-beta",
  "risk-volatility",
  2,
  "Beta and drawdowns",
  [
    c(
      "rv-l2-s1",
      "Measuring movement",
      [
        "Beta compares a stock's movement to the market. Beta > 1 means more swingy; beta < 1 means calmer (historically).",
        "Max drawdown asks: from the peak, how far did it fall before recovering?",
      ],
      ["beta", "drawdown"]
    ),
    q(
      "rv-l2-q1",
      "A stock with beta 1.5 historically tends to move…",
      ["More than the market", "Less than the market", "Opposite the market always", "Only on Mondays"],
      0,
      "Correct, higher beta, higher sensitivity.",
      "Beta 1.5 ≈ 50% more market sensitivity (simplified)."
    ),
  ],
  ["Use beta and drawdown as vocabulary", "Your duel and X-Ray tools surface concentration"]
);

const RV_L3 = lesson(
  "rv-volatility-fee",
  "risk-volatility",
  3,
  "Volatility is the fee, not the fine",
  [
    c(
      "rv-l3-s1",
      "Paying admission for long-term returns",
      [
        "Housel compares market declines to an admission ticket, not a penalty. If you treat volatility as a fine, you try to avoid paying it and miss the returns that require staying invested.",
        "Stocks have historically compensated patient owners for enduring swings. The fee is real; the alternative (avoiding all risk) has its own cost, usually inflation and missed growth.",
      ],
      ["volatility", "drawdown"],
      "Markets rise in roughly 70% of calendar years, but the 30% down years feel louder."
    ),
    c(
      "rv-l3-s2",
      "When the fee feels too high",
      [
        "If swings keep you awake, the answer is often less risk per position or more bonds/cash, not abandoning the market entirely.",
        "Volatility is not permanent loss unless you sell at the bottom or concentrate in one fragile story.",
      ],
      ["risk-vs-return"],
      undefined,
      undefined,
      (p) =>
        lowRisk(p)
          ? "Your lower risk preference may mean a higher bond/cash share, you still pay some volatility fee in equities, but at a level you can hold."
          : "If you chose higher risk, make sure the 'fee' of drawdowns fits your sleep, otherwise you'll pay the fine of selling low."
    ),
    q(
      "rv-l3-q1",
      "Housel's 'volatility is a fee' idea means…",
      ["Down years are the price of long-term equity returns", "You should never invest in stocks", "Volatility guarantees losses", "Fees only mean expense ratios"],
      0,
      "Right, enduring swings is part of earning historical equity returns.",
      "Treating volatility as a fine makes people avoid the market and miss compounding."
    ),
  ],
  ["Expect swings as normal, not as failure", "Size risk so you can pay the fee without panic"]
);

const RV_L4 = lesson(
  "rv-margin-safety",
  "risk-volatility",
  4,
  "Margin of safety in practice",
  [
    c(
      "rv-l4-s1",
      "Graham's gap",
      [
        "Margin of safety is the distance between what could happen and what you need to happen. Cash reserves, conservative return assumptions, and flexible timelines all widen that gap.",
        "Graham: the intelligent investor is a realist who buys from pessimists and sells to optimists, the practice starts with humility about forecasts.",
      ],
      ["risk-vs-return", "diversification"]
    ),
    c(
      "rv-l4-s2",
      "Sleep-well allocations",
      [
        "Position sizing is margin of safety: no single bet should decide your financial life. Career stability, emergency fund, and insurance are non-portfolio forms of the same idea.",
        "The best investors plan on plans not going according to plan, that is why diversification and dry powder matter.",
      ],
      ["diversification", "dry-powder"],
      undefined,
      undefined,
      (p) =>
        longHorizon(p)
          ? "Your long horizon helps you treat volatility as noise, but margin of safety still means not betting the whole plan on one narrative."
          : "Shorter horizons need thicker margin of safety in cash and bond sleeves, less time to recover from a mistimed bet."
    ),
    q(
      "rv-l4-q1",
      "Margin of safety in personal investing most directly means…",
      ["Building buffer between possible outcomes and what you need", "Maximizing leverage", "Avoiding all bonds", "Chasing highest beta"],
      0,
      "Correct, buffers let you survive surprises without forced selling.",
      "Margin of safety is about resilience, not maximizing headline returns."
    ),
  ],
  ["Conservative assumptions are a feature", "Cash and diversification are practical margin of safety"]
);

// ── Behavioral ───────────────────────────────────────────────────────────────

const BEH_L1 = lesson(
  "beh-panic-fomo",
  "behavioral-investing",
  1,
  "Panic and FOMO",
  [
    c(
      "beh-l1-s1",
      "Two enemies",
      [
        "Panic-selling locks in losses after a drop. FOMO-buying chases last year's winner at peak prices.",
        "Write rules in calm markets: rebalance bands, max position sizes, when you'll add cash.",
      ],
      ["risk-vs-return", "dollar-cost-averaging"]
    ),
    q(
      "beh-l1-q1",
      "Dollar-cost averaging mainly helps by…",
      ["Removing timing decisions", "Guaranteeing profits", "Avoiding all down years", "Beating every hedge fund"],
      0,
      "Yes, process over prediction.",
      "DCA is about consistency, not guaranteed returns."
    ),
  ],
  ["Pre-commit to process", "Journal duels to learn what you value"]
);

const BEH_L2 = lesson(
  "beh-rules",
  "behavioral-investing",
  2,
  "Rules that stick",
  [
    c(
      "beh-l2-s1",
      "Checklist investing",
      [
        "Before you buy: thesis in one sentence, max % of portfolio, what would make you sell.",
        "Thesis grows with life, marriage, kids, and job changes should update risk, not just headlines.",
      ],
      ["diversification"]
    ),
    q(
      "beh-l2-q1",
      "A written sell rule helps because…",
      ["You decide in advance, not in panic", "It eliminates taxes", "It guarantees alpha", "SEC requires it"],
      0,
      "Exactly, decide when you're calm.",
      "Rules reduce emotion-driven mistakes."
    ),
  ],
  ["Investing is a long series of decisions", "Update thesis when life changes"]
);

const BEH_L3 = lesson(
  "beh-enough",
  "behavioral-investing",
  3,
  '"Enough", the hardest financial skill',
  [
    c(
      "beh-l3-s1",
      "When the goalpost won't stop",
      [
        "Rajat Gupta was worth hundreds of millions and still risked everything for more, insider trading sent him to prison. Bernie Madoff had a legitimate fortune and still ran a Ponzi scheme.",
        "Morgan Housel's lesson: there is no reason to risk what you have and need for what you don't have and don't need. Social comparison has an infinite ceiling, the only way to win is to stop playing.",
      ],
      ["risk-vs-return"],
      "Gupta and Madoff are extreme, but the pattern (never enough) shows up in everyday overspending and over-leveraging too.",
      undefined,
      (p) =>
        p.risk === "very-high" || p.risk === "high"
          ? "Higher risk appetite makes 'enough' even more important, the next levered bet is optional, not required."
          : "Defining enough early protects the progress you've already made from lifestyle creep and comparison traps."
    ),
    c(
      "beh-l3-s2",
      "Define enough for you",
      [
        "Enough is not a number on a spreadsheet, it is a ceiling on lifestyle inflation and risk-taking. Writing down what 'enough' means for you makes it easier to say no to the next shiny bet.",
        "Wealth is what you don't see: savings, flexibility, sleep. Chasing visible status often trades away the hidden part.",
      ],
      ["compound-interest"]
    ),
    q(
      "beh-l3-q1",
      "According to Housel, the hardest financial skill is often…",
      ["Getting the goalpost to stop moving", "Picking the highest-fee fund", "Timing the Fed", "Beating the S&P every year"],
      0,
      "Right, knowing when you have enough protects you from unnecessary risk.",
      "Social comparison has no finish line, 'enough' is a deliberate choice."
    ),
  ],
  ["Enough is a ceiling, not a minimum target", "Case studies show smart people still overreach"]
);

const BEH_L4 = lesson(
  "beh-reasonable",
  "behavioral-investing",
  4,
  "Reasonable > rational",
  [
    c(
      "beh-l4-s1",
      "The plan you will actually follow",
      [
        "A portfolio that is mathematically perfect but abandoned after the first 20% drop is worse than a good-enough plan you hold for decades.",
        "Housel: being reasonable with money beats being coldly rational. Investing is a behavioral practice, not a spreadsheet optimization problem.",
      ],
      ["dollar-cost-averaging", "risk-vs-return"]
    ),
    c(
      "beh-l4-s2",
      "Connect to the 85% solution",
      [
        "Ramit Sethi argues that getting started beats waiting for perfection. The same logic applies to asset allocation: a simple two-fund portfolio you rebalance beats a complex model you ignore.",
        "The best strategy is the one that matches your temperament, not the one that looked best in a backtest.",
      ],
      ["diversification"],
      undefined,
      undefined,
      (p) =>
        lowRisk(p)
          ? "Your lower risk preference suggests favoring simpler, steadier portfolios you can hold through downturns, reasonable beats optimal if optimal makes you sell."
          : p.risk === "very-high" || p.risk === "high"
            ? "Higher risk tolerance still needs a plan you won't abandon in a crash, reasonable sizing beats heroic concentration."
            : "Match portfolio complexity to what you will maintain when headlines turn scary."
    ),
    q(
      "beh-l4-q1",
      "Housel argues the best financial plan is usually…",
      ["The one you can stick with for years", "The one with the highest backtested return", "The one with zero volatility", "The one experts pick for you"],
      0,
      "Yes, durability of behavior beats theoretical optimality.",
      "Reasonable and repeatable beats perfect and abandoned."
    ),
  ],
  ["Stick with strategies you can hold in bad years", "Simple beats clever if clever won't survive stress"]
);

// ── Dividends ────────────────────────────────────────────────────────────────

const DIVI_L1 = lesson(
  "divi-yield",
  "dividends-income",
  1,
  "Dividends explained",
  [
    c(
      "divi-l1-s1",
      "Cash to shareholders",
      [
        "Dividends are cash payments from profits (or policy) to shareholders. Yield = annual dividend / price.",
        "High yield can signal value, or a troubled company about to cut the payout.",
      ],
      ["what-is-dividend", "dividend-yield"]
    ),
    q(
      "divi-l1-q1",
      "Dividend yield is…",
      ["Annual dividend per share ÷ price", "Stock price ÷ earnings", "Revenue growth", "Fed funds rate"],
      0,
      "Yes, income relative to price.",
      "Yield = dividends / price (simplified)."
    ),
  ],
  ["Dividends provide cash flow", "Very high yield warrants skepticism"]
);

const DIVI_L2 = lesson(
  "divi-etfs",
  "dividends-income",
  2,
  "Income ETFs",
  [
    c(
      "divi-l2-s1",
      "Funds for income",
      [
        "SCHD, VYM, JEPI are popular income-oriented ETFs, read what they own and how they select names.",
        "In taxable accounts, dividends are usually taxed, location in IRA/Roth can matter.",
      ],
      ["what-is-etf", "dividend-yield"]
    ),
    q(
      "divi-l2-q1",
      "A dividend ETF mainly offers…",
      ["Diversified dividend exposure in one ticker", "No market risk", "Fixed 10% guaranteed return", "Only tech stocks"],
      0,
      "Right, basket of dividend payers.",
      "ETFs diversify, they don't remove market risk."
    ),
  ],
  ["Use ETFs for diversified income", "Match income need to account type"]
);

// ── Recession resilience ───────────────────────────────────────────────────────

const REC_L1 = lesson(
  "rec-what-happens",
  "recession-resilience",
  1,
  "Recessions & bear markets",
  [
    c(
      "rec-l1-s1",
      "Definitions",
      [
        "Recession = broad economic contraction (often two quarters of shrinking GDP). Bear market = stocks down ~20%+ from a peak.",
        "They overlap but aren't identical, stocks can fall before a recession is official.",
      ],
      ["bull-bear-market", "fed-rate"]
    ),
    q(
      "rec-l1-q1",
      "A bear market in stocks is commonly defined as…",
      ["~20% drop from recent peak", "One bad week", "Any red day", "Bond default"],
      0,
      "Correct, 20% is the rule-of-thumb.",
      "Bear markets are sustained declines, not single days."
    ),
  ],
  ["Bear markets are normal over decades", "Recessions test jobs and cash flow first"]
);

const REC_L2 = lesson(
  "rec-prepare",
  "recession-resilience",
  2,
  "Building resilience",
  [
    c(
      "rec-l2-s1",
      "Layers of defense",
      [
        "Emergency fund before aggressive investing. Mix stocks/bonds aligned to horizon. Avoid margin and concentrated bets you can't hold through a 30% drop.",
        "Dry powder (cash) lets you rebalance into weakness, if you have the discipline to act.",
      ],
      ["dry-powder", "diversification"]
    ),
    q(
      "rec-l2-q1",
      "Before maxing risk assets, most beginners should prioritize…",
      ["Emergency fund and high-interest debt", "Leveraged ETFs", "Single-stock concentration", "Timing the bottom"],
      0,
      "Yes, foundation first.",
      "Cash buffer and debt payoff come before max risk."
    ),
  ],
  ["Resilience is structural, not one heroic trade", "Scenario planning stress-tests burn rate"]
);

const REC_L3 = lesson(
  "rec-mr-market",
  "recession-resilience",
  3,
  "Mr. Market and market panics",
  [
    c(
      "rec-l3-s1",
      "Your business partner at the door",
      [
        "Benjamin Graham's Mr. Market metaphor: imagine a partner who offers to buy or sell your share of a business every day at a different price. Some days he is euphoric; some days he is terrified.",
        "You are free to ignore him. During recessions, Mr. Market is often depressed, that can be opportunity for patient owners, not an emergency mandate to sell.",
      ],
      ["volatility", "drawdown", "market-cap"],
      "Graham taught that the market is a voting machine short-term, a weighing machine long-term."
    ),
    c(
      "rec-l3-s2",
      "Panics vs your plan",
      [
        "Headlines scream because pessimism sounds smart. Your written plan, emergency fund, allocation, rebalance rules, exists for days when Mr. Market is shouting.",
        "Selling because prices fell is handing the business to Mr. Market on his worst day. Buying more than you can afford to hold is the mirror mistake.",
      ],
      ["bull-bear-market", "diversification"],
      undefined,
      undefined,
      (p) =>
        longHorizon(p)
          ? "Your long horizon is built for ignoring Mr. Market's daily mood, recessions are tests of patience, not deadlines to exit."
          : "With a shorter horizon, keep Mr. Market's offers small, rebalance rules matter more than heroic buying during panics."
    ),
    q(
      "rec-l3-q1",
      "In Graham's Mr. Market story, the intelligent owner should…",
      ["Use manic prices only when they serve your long-term plan", "Always accept his daily offer", "Never own stocks", "Only buy when CNBC is bullish"],
      0,
      "Right, you are not obligated to trade just because prices moved.",
      "Mr. Market offers prices; you offer discipline."
    ),
  ],
  ["Recessions test behavior more than math", "Depressed prices ≠ broken businesses automatically"]
);

const REC_L4 = lesson(
  "rec-pessimism",
  "recession-resilience",
  4,
  "The seduction of pessimism",
  [
    c(
      "rec-l4-s1",
      "Why bad news sounds smarter",
      [
        "Housel: pessimism sounds like someone took the risks seriously; optimism sounds like a sales pitch. That is why bearish takes go viral in downturns.",
        "Yet US stocks have risen in most calendar years. Long-term optimism has been the historically correct bias, while still requiring margin of safety because surprises happen.",
      ],
      ["bull-bear-market", "risk-vs-return"]
    ),
    c(
      "rec-l4-s2",
      "Staying invested without being naive",
      [
        "Optimism does not mean ignoring risk, it means maintaining a plan through scary headlines. Emergency funds and diversification exist because pessimists are sometimes right in the short run.",
        "The goal is neither blind faith nor permanent fear, it is a structure you can hold when Mr. Market is miserable.",
      ],
      ["dry-powder", "diversification"],
      undefined,
      undefined,
      (p) =>
        lowRisk(p)
          ? "When pessimism dominates headlines, your steadier allocation is a feature, you are less likely to need heroic timing."
          : "Aggressive investors feel pessimism loudest, written rules (rebalance, cash floor) beat hot takes when fear spikes."
    ),
    q(
      "rec-l4-q1",
      "Housel's 'seduction of pessimism' warns that…",
      ["Bearish narratives feel more credible even when long-term growth persists", "Optimism is always wrong", "You should never hold cash", "Recessions are avoidable with timing"],
      0,
      "Correct, pessimism is persuasive in the moment; patience is harder.",
      "Long-term data favors sustained participation with safety buffers, not market timing."
    ),
  ],
  ["Pessimism is loud; discipline is quiet", "Combine optimism with margin of safety"]
);

const BTC_L3 = lesson(
  "btc-sound-money",
  "bitcoin-101",
  3,
  "What makes money sound",
  [
    c(
      "btc-l3-s1",
      "Properties of money",
      [
        "Sound money is easy to divide, portable, durable, fungible, verifiable, and scarce. Societies that preserved these traits tended to store value more reliably.",
        "History moved from commodity monies (gold) to fiat currencies backed by policy. Bitcoin's design aims at digital scarcity, capped supply enforced by software rules.",
      ],
      ["inflation", "diversification"],
      "The Byzantine gold bezant held stable purchasing power for centuries, an example of monetary quality shaping behavior.",
      "bitcoin-coin"
    ),
    c(
      "btc-l3-s2",
      "Why the debate exists",
      [
        "Supporters frame Bitcoin as neutral, global, verification-based money. Skeptics point to volatility, regulation, and energy use.",
        "This lesson explains monetary concepts, not whether you should buy or sell any asset.",
      ],
      ["bitcoin"],
      undefined,
      undefined,
      (p) =>
        p.horizon === "short" || p.horizon === "medium"
          ? "Near-term goals usually favor familiar fiat savings and diversified paper assets, treat digital scarcity as context before sizing."
          : "Longer horizons give more room to study monetary history, still separate education from allocation decisions."
    ),
    q(
      "btc-l3-q1",
      "A core idea behind 'sound money' is…",
      ["Money should hold value traits like scarcity and verifiability", "Money must pay dividends", "Money must be issued by one bank", "Money cannot be digital"],
      0,
      "Right, quality of money affects saving and investing behavior over time.",
      "Sound money is about properties, not brand marketing."
    ),
  ],
  ["Monetary quality shapes incentives", "Education first, decisions second"]
);

const BTC_L4 = lesson(
  "btc-portfolio-context",
  "bitcoin-101",
  4,
  "Bitcoin and the modern portfolio",
  [
    c(
      "btc-l4-s1",
      "Volatility vs permanent loss",
      [
        "Large drawdowns are common in Bitcoin's history. That is volatility, price movement, not the same as a company going to zero.",
        "Longer horizons and smaller position sizes are how investors translate 'interesting technology' into a plan they can survive.",
      ],
      ["bitcoin", "volatility", "risk-vs-return"],
      undefined,
      "bitcoin-coin"
    ),
    c(
      "btc-l4-s2",
      "Sovereignty and sizing",
      [
        "Some holders value self-custody and fixed supply as financial sovereignty, control and optionality Housel would group under freedom.",
        "Margin of safety here means sizing: a sleeve small enough that a 50%+ drawdown does not derail the rest of your goals.",
      ],
      ["diversification"],
      undefined,
      undefined,
      (p) =>
        longHorizon(p)
          ? "Long horizons may absorb volatility better, but sizing still matters; technology risk is separate from time risk."
          : "Shorter horizons argue for treating Bitcoin as optional education, not a core holding, volatility arrives faster than goals allow."
    ),
    c(
      "btc-l4-s3",
      "Educational disclaimer",
      [
        "Bitcoin is a volatile emerging asset class. This course explains monetary technology and portfolio thinking, it is not a recommendation to buy, sell, or hold any cryptocurrency.",
        "Always verify custody, regulation, and tax treatment in your jurisdiction before acting.",
      ],
      ["bitcoin"]
    ),
    q(
      "btc-l4-q1",
      "A sensible educational frame for Bitcoin is…",
      ["Understand technology and risks before any sizing decision", "Replace emergency fund with crypto", "Ignore volatility", "Assume fixed supply guarantees returns"],
      0,
      "Yes, learn first; size only if your plan can tolerate worst-case loss.",
      "Volatility and regulatory risk remain real, education is not an endorsement."
    ),
  ],
  ["Treat crypto as optional satellite", "Disclaimer: educational only"]
);

const DIV_L3 = lesson(
  "div-graham-defensive",
  "diversification-essentials",
  3,
  "Graham's defensive portfolio",
  [
    c(
      "div-l3-s1",
      "The default intelligent investor",
      [
        "Graham's defensive investor splits between high-grade bonds and diversified common stocks, not chasing hot tips. Today, broad stock and bond ETFs implement that idea in one purchase.",
        "Dollar-cost averaging and periodic rebalancing turn philosophy into process, you do not need to forecast next year's winner.",
      ],
      ["diversification", "etf", "dollar-cost-averaging"]
    ),
    c(
      "div-l3-s2",
      "AFG-style checklist",
      [
        "Canadian financial literacy frameworks echo the same sequence: define your requirement, set a target allocation, choose a horizon, diversify, save regularly.",
        "Thesis themes and duels sit on top of that base, they help you explore ideas, not replace the defensive core.",
      ],
      ["expense-ratio", "what-is-etf"],
      "ETFs made Graham's defensive portfolio accessible to everyday investors without picking hundreds of stocks.",
      undefined,
      (p) =>
        lowRisk(p)
          ? "Your risk profile aligns with Graham's defensive default, broad ETFs plus bonds before thematic tilts."
          : "Even with higher risk tolerance, a defensive core (broad stock + bond mix) carries most outcomes, themes are the satellite."
    ),
    q(
      "div-l3-q1",
      "Graham's defensive approach emphasizes…",
      ["Broad diversification and disciplined process", "Concentrating in one sector", "Market timing every quarter", "Avoiding all bonds forever"],
      0,
      "Right, diversified base + patience is the default.",
      "Defensive does not mean timid, it means structured."
    ),
  ],
  ["Core portfolio before satellite bets", "ETFs are modern tools for defensive diversification"]
);

export const TOPIC_PACK_COURSES: Course[] = [
  {
    id: "bonds-basics",
    title: "What are bonds?",
    description: "How bonds work, why prices move when rates change, and how to use bond ETFs.",
    lessons: [BD_L1, BD_L2],
  },
  {
    id: "fed-and-markets",
    title: "Fed & markets",
    description: "How Federal Reserve policy flows into stocks, bonds, and your wallet.",
    lessons: [FM_L1, FM_L2],
  },
  {
    id: "bitcoin-101",
    title: "What is Bitcoin?",
    description: "Blockchain basics, volatility, and how to think about sizing crypto.",
    lessons: [BTC_L1, BTC_L2, BTC_L3, BTC_L4],
  },
  {
    id: "international-markets",
    title: "Foreign markets",
    description: "Why global exposure matters and which ETF sleeves get you there.",
    lessons: [INT_L1, INT_L2],
  },
  {
    id: "diversification-essentials",
    title: "Diversification",
    description: "Correlation, overlap, and building a portfolio that doesn't bet on one story.",
    lessons: [DIV_L1, DIV_L2, DIV_L3],
  },
  {
    id: "taxes-investing",
    title: "Taxes & investing",
    description: "Account types, capital gains, and after-tax thinking for projections.",
    lessons: [TAX_L1, TAX_L2],
  },
  {
    id: "risk-volatility",
    title: "Risk & volatility",
    description: "Beta, drawdowns, and the difference between price swings and real risk.",
    lessons: [RV_L1, RV_L2, RV_L3, RV_L4],
  },
  {
    id: "behavioral-investing",
    title: "Behavioral investing",
    description: "Panic, FOMO, and rules that keep your thesis intact when markets move.",
    lessons: [BEH_L1, BEH_L2, BEH_L3, BEH_L4],
  },
  {
    id: "dividends-income",
    title: "Dividends & income",
    description: "Yield, payout safety, and income ETFs for cash-flow investors.",
    lessons: [DIVI_L1, DIVI_L2],
  },
  {
    id: "recession-resilience",
    title: "Recession resilience",
    description: "Bear markets, emergency funds, and staying invested when headlines scream.",
    lessons: [REC_L1, REC_L2, REC_L3, REC_L4],
  },
];
