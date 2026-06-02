import type { ConceptId } from "./concepts";
import type { LessonImageKey } from "@/data/lesson-images";
import { TOPIC_PACK_COURSES } from "@/data/courses-topic-packs";
import type { UserProfile } from "@/store/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CourseId =
  | "money-foundations"
  | "credit-borrowing"
  | "retirement-accounts"
  | "investing-building-blocks"
  | "bonds-basics"
  | "fed-and-markets"
  | "bitcoin-101"
  | "international-markets"
  | "diversification-essentials"
  | "taxes-investing"
  | "risk-volatility"
  | "behavioral-investing"
  | "dividends-income"
  | "recession-resilience";

/** One screen in a lesson, either content or a quiz check. */
export type LessonStep =
  | {
      kind: "content";
      id: string;
      title: string;
      paragraphs: string[];
      didYouKnow?: string;
      conceptLinks?: ConceptId[];
      /** Optional slide illustration; auto-mapped from concepts/title when omitted. */
      imageKey?: LessonImageKey;
      profileAside?: (profile: UserProfile) => string | null;
    }
  | {
      kind: "quiz";
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      correctFeedback: string;
      incorrectFeedback: string;
    };

export type Lesson = {
  id: string;
  courseId: CourseId;
  order: number;
  title: string;
  estimatedMin: number;
  steps: LessonStep[];
  keyTakeaways: string[];
};

export type Course = {
  id: CourseId;
  title: string;
  description: string;
  /** Optional metaphor that runs through the course (e.g. smoothie → ETF). */
  courseMetaphor?: string;
  lessons: Lesson[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Profile-aside helpers (DRY profile checks reused across lessons)
// ─────────────────────────────────────────────────────────────────────────────

function hasDebt(p: UserProfile) {
  return p.hasHighInterestDebt;
}
function hasEF(p: UserProfile) {
  return p.hasEmergencyFund;
}
function isBeginner(p: UserProfile) {
  return p.experience === "none";
}
function longHorizon(p: UserProfile) {
  return p.horizon === "long" || p.horizon === "very-long";
}
function shortHorizon(p: UserProfile) {
  return p.horizon === "short";
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MONEY FOUNDATIONS
// ─────────────────────────────────────────────────────────────────────────────

const MF_L1: Lesson = {
  id: "mf-what-is-interest",
  courseId: "money-foundations",
  order: 1,
  title: "What is interest?",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "mf-l1-s1",
      title: "Two sides of the same coin",
      paragraphs: [
        "Interest is the cost of borrowing money, or the reward for saving it. It is expressed as a percentage of the amount borrowed or saved, usually calculated annually.",
        "If you borrow $1,000 at 5% interest, you will owe $1,050 after one year. If you put $1,000 in a savings account earning 2%, the bank pays you $20. In both cases, interest is the price of money over time.",
      ],
      conceptLinks: ["interest-rate"],
      didYouKnow:
        "Banks profit from the spread between what they pay savers (low) and what they charge borrowers (high).",
    },
    {
      kind: "content",
      id: "mf-l1-s2",
      title: "Borrowing: when interest works against you",
      paragraphs: [
        "When you carry a credit card balance, take out a car loan, or sign a mortgage, you pay interest to the lender. The higher the rate, the more expensive the loan.",
        "Credit cards often charge 20–30% APR. At 25%, a $5,000 balance costs $1,250 in interest per year, money that could have been saved or invested instead.",
      ],
      conceptLinks: ["interest-rate", "credit-score"],
      profileAside: (p) =>
        hasDebt(p)
          ? "Your questionnaire noted high-interest debt. This makes the borrowing side of interest especially relevant, every dollar of high-rate debt you pay down is like earning a guaranteed, tax-free return at that same high rate."
          : null,
    },
    {
      kind: "content",
      id: "mf-l1-s3",
      title: "Saving: when interest works for you",
      paragraphs: [
        "On the saving side, interest is your money earning more money. A high-yield savings account might pay 3–5% annually. A certificate of deposit (CD) locks in a rate for a set period.",
        "The catch: savings rates are almost always lower than inflation and far lower than what borrowers pay. Saving is safe, but over decades, earning 2–4% while inflation runs at 2–3% means your purchasing power barely grows.",
      ],
      conceptLinks: ["inflation"],
      profileAside: (p) =>
        hasEF(p)
          ? "Since you already have an emergency fund, any extra cash beyond that safety net could be working harder for you, savings interest alone rarely builds long-term wealth."
          : "An emergency fund in a high-yield savings account is a great first step, it earns modest interest while keeping cash accessible.",
    },
    {
      kind: "content",
      id: "mf-l1-s4",
      title: "APR vs APY",
      paragraphs: [
        "APR (Annual Percentage Rate) is what you pay on debt. APY (Annual Percentage Yield) is what you earn on savings. They sound similar but describe opposite directions of money.",
        "APY accounts for compounding, earning interest on your interest. A 5% APY savings account actually returns slightly more than 5% over a year because of compounding. APR on a credit card does the same in reverse: a 25% APR compounds daily, making your actual cost even higher.",
      ],
      conceptLinks: ["interest-rate"],
    },
    {
      kind: "quiz",
      id: "mf-l1-q1",
      question: "When you borrow money, interest is...",
      options: [
        "A fee you pay the lender for using their money",
        "A reward the lender pays you",
        "A tax collected by the government",
      ],
      correctIndex: 0,
      correctFeedback:
        "Exactly. Interest is the cost you pay to borrow, the lender's compensation for letting you use their money now.",
      incorrectFeedback:
        "When you borrow, you pay interest to the lender. When you save, the bank pays interest to you. Direction matters.",
    },
  ],
  keyTakeaways: [
    "Interest is the price of money, paid by borrowers, earned by savers",
    "Borrowing rates (credit cards, loans) are much higher than saving rates",
    "High-interest debt can cost far more than investments typically earn",
  ],
};

const MF_L2: Lesson = {
  id: "mf-compound-interest",
  courseId: "money-foundations",
  order: 2,
  title: "Compound interest",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "mf-l2-s1",
      title: "Interest earning interest",
      paragraphs: [
        "Compound interest means your returns generate their own returns. If you invest $1,000 and it grows 10% in year one, you have $1,100. If it grows another 10% in year two, you earn $110, not $100, because you are now earning on $1,100, not just the original $1,000.",
        'Albert Einstein reportedly called compound interest the "eighth wonder of the world." The math is simple, but the long-term effect is extraordinary.',
      ],
      conceptLinks: ["compound-interest", "time-value-money"],
      didYouKnow:
        "Warren Buffett's ~$84.5B net worth, about $81.5B came after age 65. Compounding's power shows up late.",
    },
    {
      kind: "content",
      id: "mf-l2-s1b",
      title: "Why compounding feels counterintuitive",
      paragraphs: [
        "Morgan Housel uses an ice-age metaphor: small, steady changes over a very long time create outcomes that look impossible in hindsight. Compounding works the same way, boring early years, dramatic late years.",
        "The counterintuitive part is that most of the dollar growth happens at the end. That is why starting early beats chasing the highest return for a single year.",
      ],
      conceptLinks: ["compound-interest"],
    },
    {
      kind: "content",
      id: "mf-l2-s2",
      title: "Time is the multiplier",
      paragraphs: [
        "The real power of compounding is not the rate, it is the time. Someone who invests $5,000 a year from age 25 to 35 (just 10 years) and then stops can end up with more money at 65 than someone who starts at 35 and invests $5,000 a year for the next 30 years.",
        "This happens because the early money has 40 years to compound, while the later money only has 30. The early investor put in only $50,000 total versus $150,000, and still comes out ahead.",
      ],
      conceptLinks: ["compound-interest", "time-value-money"],
      profileAside: (p) => {
        const yrs = longHorizon(p) ? "long" : "shorter";
        return `Your profile shows a ${yrs} time horizon. ${
          longHorizon(p)
            ? "This works in your favor, more years means more compounding cycles. Starting early, even with modest amounts, is the single biggest advantage you have."
            : "A shorter horizon doesn't mean compounding is irrelevant, it just means the dollars you do invest should be put to work as soon as possible."
        }`;
      },
    },
    {
      kind: "content",
      id: "mf-l2-s3",
      title: "The rule of 72",
      paragraphs: [
        "A quick way to estimate compounding: divide 72 by your annual return to find how many years it takes to double your money. At 7%: 72 ÷ 7 ≈ 10 years. At 4%: 72 ÷ 4 = 18 years.",
        "This rule works because of how compounding math behaves, small differences in return rates produce large differences in doubling time. A 2% difference (say 7% vs 5%) means roughly 4 extra years to double.",
      ],
    },
    {
      kind: "content",
      id: "mf-l2-s4",
      title: "Fees are reverse compounding",
      paragraphs: [
        "Just as returns compound in your favor, fees compound against you. A 1% annual fee does not just cost you 1%, it costs you that 1% plus all the compounding that 1% would have earned over decades.",
        'This is why low-cost index funds (expense ratios of 0.03–0.10%) have become so popular. The math of "reverse compounding" means every dollar you pay in fees stops working for you forever.',
      ],
      conceptLinks: ["expense-ratio", "expense-ratio-impact"],
      didYouKnow:
        "Over 30 years, a 1% fee can consume roughly 25–30% of your total returns compared to a 0.03% fee.",
    },
    {
      kind: "quiz",
      id: "mf-l2-q1",
      question: "What does compound interest mean?",
      options: [
        "Earning interest only on the original amount you invested",
        "Earning interest on both your original investment and the interest it has already earned",
        "A one-time bonus banks pay new customers",
      ],
      correctIndex: 1,
      correctFeedback:
        "Correct. You earn returns on your returns, that is the snowball effect that makes compounding so powerful over long periods.",
      incorrectFeedback:
        "Compound interest means earning interest on your interest, not just on the original amount. That is what makes it grow faster than simple interest.",
    },
  ],
  keyTakeaways: [
    "Compound interest means earning returns on your returns",
    "Time is more powerful than rate, start early, even with small amounts",
    "Fees compound against you the same way returns compound for you",
  ],
};

const MF_L3: Lesson = {
  id: "mf-inflation",
  courseId: "money-foundations",
  order: 3,
  title: "Inflation & purchasing power",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "mf-l3-s1",
      title: "Why a dollar tomorrow buys less",
      paragraphs: [
        "Inflation is the gradual rise in the price of goods and services. When inflation is 3%, something that cost $100 last year costs $103 this year. Your dollar buys less than it did before.",
        "Central banks like the Federal Reserve aim to keep inflation around 2%, low enough to protect savers, but high enough to encourage spending and economic growth.",
      ],
      conceptLinks: ["inflation", "fed-rate"],
    },
    {
      kind: "content",
      id: "mf-l3-s2",
      title: "The silent wealth eroder",
      paragraphs: [
        "Inflation is often called the silent tax because you do not see it deducted from your account, you only notice it when your grocery bill goes up or your rent increases.",
        "If your money sits in a checking account earning 0%, and inflation runs at 3%, your purchasing power is shrinking by 3% every year. Over 20 years, $10,000 in cash loses nearly half its real value.",
      ],
      conceptLinks: ["inflation"],
      profileAside: (p) => {
        if (longHorizon(p))
          return "Benjamin Graham treated inflation as a permanent risk to savers, over decades, cash is not truly 'safe' even when the balance looks stable.";
        if (isBeginner(p))
          return "Since you are early in your investing journey, understanding inflation is key, it is the main reason keeping all your savings in cash is riskier than it seems.";
        return null;
      },
    },
    {
      kind: "content",
      id: "mf-l3-s3",
      title: "Inflation and your investments",
      paragraphs: [
        "Different investments respond to inflation differently. Stocks have historically outpaced inflation over long periods because companies can raise prices. Bonds and cash savings often struggle to keep up.",
        "Real return is what you earn after subtracting inflation. If your portfolio returns 7% and inflation is 3%, your real return is about 4%. That 4% is what actually improves your purchasing power.",
      ],
      conceptLinks: ["risk-vs-return"],
      didYouKnow:
        "Over the last century, US stocks have returned about 7% per year after inflation. Cash has returned roughly 0–1% after inflation.",
    },
    {
      kind: "content",
      id: "mf-l3-s4",
      title: "What rising inflation means for rates",
      paragraphs: [
        "When inflation runs too hot, the Federal Reserve raises interest rates to cool the economy. Higher rates make borrowing more expensive, which slows spending. This is why inflation and the Fed rate are so closely linked.",
        "For you personally: high inflation + rising rates can mean higher mortgage and credit card costs, but also higher yields on savings accounts and bonds.",
      ],
      conceptLinks: ["fed-rate"],
    },
    {
      kind: "quiz",
      id: "mf-l3-q1",
      question: "If inflation is 3% and your savings account earns 1%, what is happening to your purchasing power?",
      options: [
        "It is growing by 2% per year",
        "It is shrinking by about 2% per year",
        "It stays the same because 1% covers inflation",
      ],
      correctIndex: 1,
      correctFeedback:
        "Right. Your real return is 1% – 3% = –2%. Even though your account balance goes up, what that money can actually buy is shrinking.",
      incorrectFeedback:
        "With 1% earnings and 3% inflation, your purchasing power is falling. That is why investing, not just saving, matters for long-term goals.",
    },
  ],
  keyTakeaways: [
    "Inflation quietly erodes the value of cash over time",
    "Real return = your investment return minus inflation",
    "Stocks have historically protected against inflation better than cash or bonds over long periods",
  ],
};

const MF_L4: Lesson = {
  id: "mf-time-value-money",
  courseId: "money-foundations",
  order: 4,
  title: "Time value of money",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "mf-l4-s1",
      title: "A dollar today beats a dollar tomorrow",
      paragraphs: [
        "The time value of money is the idea that money in your hand today is worth more than the same amount received in the future, because you can invest today's dollar and grow it.",
        "This is the foundation of nearly every financial decision: saving versus spending, valuing a company, choosing between a lump sum and monthly payments, or deciding whether to prepay a loan.",
      ],
      conceptLinks: ["time-value-money", "compound-interest"],
    },
    {
      kind: "content",
      id: "mf-l4-s2",
      title: "Why investors demand a return",
      paragraphs: [
        "When you invest, you are trading spending power now for more spending power later. The return you demand is compensation for waiting, and for taking risk. The longer you wait and the more risk you take, the higher return you should expect.",
        "This is why a 30-year bond pays more interest than a 2-year bond, and why stocks have historically returned more than bonds. You are being paid for time and uncertainty.",
      ],
      conceptLinks: ["risk-vs-return"],
      profileAside: (p) => {
        const horizonLabel = shortHorizon(p) ? "shorter" : "longer";
        return `Your ${horizonLabel} time horizon affects how the time value of money applies to you. ${
          longHorizon(p)
            ? "With a long runway, you can afford to let time work in your favor, even modest returns compound into significant sums."
            : "A shorter horizon means you are closer to needing the money, which changes how much risk you can reasonably take."
        }`;
      },
    },
    {
      kind: "content",
      id: "mf-l4-s3",
      title: "Discounting: the flip side",
      paragraphs: [
        "Discounting is valuing future money in today's terms. If you expect to earn 5% a year, receiving $1,050 next year is roughly the same as having $1,000 today. That $50 is the time value of one year.",
        "This concept (discounted cash flow, or DCF) is how professional investors value entire companies. They estimate all future cash flows and discount them back to what they are worth today. Small changes in assumptions can produce very different values.",
      ],
      conceptLinks: ["dcf"],
    },
    {
      kind: "content",
      id: "mf-l4-s4",
      title: "Applying it: save now or later?",
      paragraphs: [
        "The time value of money answers the question 'Should I save now or later?' definitively: now. Every year you delay investing is a year of compounding you cannot get back.",
        'But it also answers "Should I enjoy my life today or save everything for later?", the answer is a balance. Money is a tool for living, not just accumulating. The time value concept helps you weigh tradeoffs, not make rigid rules.',
        "Morgan Housel adds a useful frame: wealth is the money you do not spend. Your savings rate, how much you keep, often matters more than squeezing an extra percent of investment return.",
      ],
      conceptLinks: ["compound-interest"],
    },
    {
      kind: "quiz",
      id: "mf-l4-q1",
      question: "Why is a dollar today worth more than a dollar a year from now?",
      options: [
        "Because the government prints less money each year",
        "Because you can invest today's dollar and it will grow over the year",
        "It is not, they are worth the same",
      ],
      correctIndex: 1,
      correctFeedback:
        "Exactly. Today's dollar can be invested and earn returns, making it worth more than the same dollar received later.",
      incorrectFeedback:
        "A dollar today is worth more because you can invest it now and it grows. Waiting means missing out on that growth opportunity.",
    },
  ],
  keyTakeaways: [
    "Money today is worth more than the same amount later, because it can be invested",
    "The return you earn is compensation for waiting and taking risk",
    "Starting to save earlier means more years of compounding, time is your biggest advantage",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CREDIT & BORROWING
// ─────────────────────────────────────────────────────────────────────────────

const CB_L1: Lesson = {
  id: "cb-what-is-credit-score",
  courseId: "credit-borrowing",
  order: 1,
  title: "What is a credit score?",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "cb-l1-s1",
      title: "A number that represents your reliability",
      paragraphs: [
        "Your credit score is a three-digit number (usually 300–850) that summarizes how reliably you have repaid borrowed money. Lenders use it to decide whether to approve you for a credit card, car loan, or mortgage, and what interest rate to charge.",
        "The higher your score, the less risky you look to lenders, and the lower the interest rate you pay. A good score can save you tens of thousands of dollars over your lifetime.",
      ],
      conceptLinks: ["credit-score"],
      didYouKnow:
        "The most common credit score model (FICO) was introduced in 1989. Before that, lenders made judgment calls based on personal relationships and manual review.",
    },
    {
      kind: "content",
      id: "cb-l1-s2",
      title: "What goes into your score",
      paragraphs: [
        "Payment history (35%): Do you pay bills on time? This is the single biggest factor.",
        "Amounts owed (30%): How much of your available credit are you using? Lower utilization is better, ideally under 30%.",
        "Length of credit history (15%): How long have you had credit accounts? Longer is better.",
        "New credit (10%): Opening several new accounts in a short period can temporarily lower your score.",
        "Credit mix (10%): Having different types of credit (credit card, installment loan) can help slightly.",
      ],
      conceptLinks: ["credit-score"],
      profileAside: (p) =>
        isBeginner(p)
          ? "If you are new to credit, the most important habit is simple: pay every bill on time, every time. That alone drives over a third of your score."
          : null,
    },
    {
      kind: "content",
      id: "cb-l1-s3",
      title: "Why your score matters beyond loans",
      paragraphs: [
        "Landlords check credit scores before approving rental applications. Some employers run credit checks for certain roles. Insurance companies may use credit-based scores to set premiums. Even cell phone carriers check your credit before offering payment plans.",
        "Your credit score can affect your life in ways that have nothing to do with borrowing money. This is why protecting it matters even if you never plan to take out a loan.",
      ],
      conceptLinks: ["credit-score"],
    },
    {
      kind: "content",
      id: "cb-l1-s4",
      title: "Score ranges at a glance",
      paragraphs: [
        "Excellent: 750–850. You will qualify for the best rates on almost any loan.",
        "Good: 700–749. You will get competitive rates on most products.",
        "Fair: 650–699. You may be approved but will pay higher interest.",
        "Poor: 600–649. Approval is uncertain; rates will be significantly higher.",
        "Bad: below 600. Many lenders will decline your application.",
      ],
      conceptLinks: ["credit-score"],
    },
    {
      kind: "quiz",
      id: "cb-l1-q1",
      question: "What is the single biggest factor in your credit score?",
      options: [
        "How many credit cards you have",
        "Your payment history, whether you pay bills on time",
        "Your annual income",
      ],
      correctIndex: 1,
      correctFeedback:
        "Correct. Payment history is roughly 35% of your FICO score, paying on time is the most important habit you can build.",
      incorrectFeedback:
        "Payment history is the largest factor at ~35%. Your income is not directly part of your credit score at all.",
    },
  ],
  keyTakeaways: [
    "A credit score is a 300–850 number that lenders use to assess your reliability",
    "Payment history and credit utilization are the two biggest factors",
    "Your score affects more than loans, renting, insurance, and even job applications",
  ],
};

const CB_L2: Lesson = {
  id: "cb-build-protect-score",
  courseId: "credit-borrowing",
  order: 2,
  title: "How to build and protect your score",
  estimatedMin: 5,
  steps: [
    {
      kind: "content",
      id: "cb-l2-s1",
      title: "Start with the basics",
      paragraphs: [
        "Building credit does not require going into debt. You can start with a secured credit card, you put down a deposit (say $300), and that becomes your credit limit. Use it for small purchases, pay in full every month, and your score will start climbing.",
        "If you are a student or have no credit history, becoming an authorized user on a responsible family member's card can also help, their positive history may appear on your report.",
      ],
      conceptLinks: ["credit-score"],
      profileAside: (p) =>
        isBeginner(p)
          ? "Since you are new to credit, a secured card or authorized user status is the simplest path. You do not need to carry a balance, paying in full each month builds history without costing you interest."
          : null,
    },
    {
      kind: "content",
      id: "cb-l2-s2",
      title: "The habits that matter most",
      paragraphs: [
        "Pay every bill on time, every time. Set up autopay for at least the minimum payment so you never miss a due date.",
        "Keep your credit utilization under 30%, meaning if your total credit limit is $5,000, try not to carry more than $1,500 in balances at any time. Under 10% is even better.",
        "Do not close old credit cards unless they have an annual fee you cannot justify. The length of your credit history matters, and closing an old card shortens it.",
        "Limit new applications. Each hard inquiry (when a lender checks your credit for a new application) can temporarily lower your score by a few points.",
      ],
      conceptLinks: ["credit-score"],
    },
    {
      kind: "content",
      id: "cb-l2-s3",
      title: "Check your report (it is free)",
      paragraphs: [
        "You are entitled to a free credit report from each of the three major bureaus (Equifax, Experian, TransUnion) once per year at annualcreditreport.com. Many banks and credit card issuers now offer free score monitoring too.",
        "Review your report for errors, accounts you did not open, incorrect balances, or paid-off debts still showing as active. Disputing errors can raise your score quickly and costs nothing.",
      ],
      conceptLinks: ["credit-score"],
      didYouKnow:
        "Roughly 1 in 5 consumers has a confirmed error on at least one of their credit reports, according to FTC studies.",
    },
    {
      kind: "content",
      id: "cb-l2-s4",
      title: "What hurts your score",
      paragraphs: [
        "Missing payments is the fastest way to damage your score. A single 30-day late payment can drop a good score by 60–100 points.",
        "Maxing out credit cards (high utilization) signals risk even if you pay on time.",
        "Collections accounts, bankruptcies, and foreclosures stay on your report for 7–10 years, though their impact fades over time, especially if you rebuild with positive history.",
      ],
      conceptLinks: ["credit-score"],
    },
    {
      kind: "content",
      id: "cb-l2-s5",
      title: "Building credit from scratch or rebuilding after damage",
      paragraphs: [
        "If you are starting from zero: a secured card, credit-builder loan from a credit union, or services like Experian Boost (which counts utility and streaming payments) can establish your file within 6–12 months.",
        "If you are rebuilding: focus on on-time payments above all else. Negative items age off your report (most after 7 years), and recent positive history carries more weight than old mistakes. Patience and consistency win.",
      ],
      conceptLinks: ["credit-score"],
    },
    {
      kind: "quiz",
      id: "cb-l2-q1",
      question: "Which of these actions is most likely to improve your credit score?",
      options: [
        "Closing old credit cards you no longer use",
        "Paying every bill on time and keeping credit card balances low",
        "Applying for several new credit cards at once to increase your total limit",
      ],
      correctIndex: 1,
      correctFeedback:
        "Right. Consistent on-time payments and low utilization are the two most powerful levers for building a strong score.",
      incorrectFeedback:
        "Closing old cards can shorten your credit history, and multiple new applications can temporarily lower your score. Pay on time and keep balances low, those matter most.",
    },
  ],
  keyTakeaways: [
    "Pay on time, keep balances low (under 30% of limit), and avoid unnecessary new applications",
    "Check your credit report yearly for errors, it is free and can raise your score quickly",
    "Building credit from scratch takes 6–12 months with a secured card or credit-builder loan",
  ],
};

const CB_L3: Lesson = {
  id: "cb-interest-rates-debt",
  courseId: "credit-borrowing",
  order: 3,
  title: "Why interest rates on debt matter",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "cb-l3-s1",
      title: "Not all debt is equal",
      paragraphs: [
        "A mortgage at 6% is very different from a credit card at 25%. The interest rate determines how fast your debt grows, and whether paying it off should be your top financial priority.",
        "High-interest debt (roughly above 8–10%) grows faster than most investments can reliably earn. Low-interest debt (mortgages, some student loans at 3–5%) grows slowly enough that you might reasonably invest while carrying it.",
      ],
      conceptLinks: ["interest-rate", "compound-interest"],
    },
    {
      kind: "content",
      id: "cb-l3-s2",
      title: "The math of high-interest debt",
      paragraphs: [
        "A $5,000 credit card balance at 25% APR costs $1,250 per year in interest alone. To put that in perspective: the stock market has historically returned about 7–10% per year on average. Paying off that card is like earning a guaranteed, tax-free 25% return.",
        "There is no investment in the world that reliably pays 25% a year. That is why paying off high-interest debt is almost always the best financial move, before investing beyond any employer 401(k) match.",
      ],
      conceptLinks: ["interest-rate", "compound-interest"],
      profileAside: (p) =>
        hasDebt(p)
          ? "Your profile notes high-interest debt. Mathematically, paying this down before investing aggressively is often the right call, a guaranteed 20%+ return from debt payoff beats even optimistic stock market returns."
          : null,
    },
    {
      kind: "content",
      id: "cb-l3-s3",
      title: "When low-interest debt can wait",
      paragraphs: [
        "A mortgage at 4% is different. If you can reasonably expect to earn 7% investing, paying extra on the mortgage means giving up 3% of potential return each year. This is a tradeoff, not an obvious win.",
        "That said, being debt-free has emotional value that does not show up in a spreadsheet. Some people sleep better with no mortgage, and that is a perfectly valid reason to pay it off faster. Just know the math leans toward investing when rates are low.",
      ],
      conceptLinks: ["interest-rate", "risk-vs-return"],
    },
    {
      kind: "content",
      id: "cb-l3-s4",
      title: "The Fed connection",
      paragraphs: [
        "When the Federal Reserve raises or lowers its benchmark rate, the interest rates on your debt can change too. Credit card rates (variable) move with the Fed. Fixed-rate mortgages do not, which is why locking in a low fixed rate can be valuable.",
        "Understanding where rates are in the cycle helps you make better borrowing decisions. When rates are high, it is an especially good time to pay down variable-rate debt.",
      ],
      conceptLinks: ["fed-rate"],
    },
    {
      kind: "quiz",
      id: "cb-l3-q1",
      question: "If you have a credit card at 22% APR and the stock market historically returns ~8%, which generally makes more mathematical sense?",
      options: [
        "Invest in the stock market first, 8% is still a good return",
        "Pay off the credit card first, a guaranteed 22% beats an uncertain 8%",
        "Split your money equally between both",
      ],
      correctIndex: 1,
      correctFeedback:
        "Correct. Paying off a 22% debt is mathematically equivalent to earning a guaranteed, tax-free 22% return, far better than what markets reliably offer.",
      incorrectFeedback:
        "A guaranteed 22% return from paying off debt beats even the best historical stock market returns. High-interest debt should usually be tackled before investing.",
    },
  ],
  keyTakeaways: [
    "High-interest debt (above ~8–10%) should usually be paid off before investing",
    "Low-interest debt (mortgages, some student loans) may reasonably coexist with investing",
    "The interest rate on your debt determines how urgent it is to pay off",
  ],
};

const CB_L4: Lesson = {
  id: "cb-credit-vs-investing",
  courseId: "credit-borrowing",
  order: 4,
  title: "Credit vs investing priorities",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "cb-l4-s1",
      title: "A framework, not a rule",
      paragraphs: [
        "There is no single correct answer for whether to pay debt or invest. But there is a framework that helps most people think clearly about it. The key question: what does your debt cost, and what can you reasonably expect to earn by investing instead?",
        "The answer also depends on you, your goals, your cash flow, and how debt makes you feel. Some people are comfortable carrying low-interest debt while investing. Others want it gone regardless of the math. Both are valid.",
        "Ramit Sethi's 85% solution applies here: getting started and following a good-enough plan beats waiting for a perfect spreadsheet. Progress at 85% beats paralysis at 0%.",
      ],
      conceptLinks: ["interest-rate", "risk-vs-return"],
      profileAside: (p) => {
        const parts: string[] = [];
        if (hasDebt(p))
          parts.push(
            "Since you have high-interest debt, paying it down is likely your highest-return financial move right now."
          );
        if (!hasEF(p))
          parts.push(
            "You do not yet have an emergency fund, building one (even a small one) before investing aggressively protects you from having to take on more debt when unexpected expenses hit."
          );
        return parts.length > 0 ? parts.join(" ") : null;
      },
    },
    {
      kind: "content",
      id: "cb-l4-s2",
      title: "A common-sense order of operations",
      paragraphs: [
        "1. Build a small emergency fund ($1,000–$2,000) so a surprise expense does not send you back to credit cards.",
        "2. If your employer offers a 401(k) match, contribute enough to get the full match, that is free money, an instant 50–100% return.",
        "3. Pay off high-interest debt (roughly above 8–10% APR).",
        "4. Build a larger emergency fund (3–6 months of expenses).",
        "5. Invest beyond the match (IRA, taxable brokerage, or additional 401(k) contributions).",
        "6. Pay off low-interest debt early if you want to, this is optional and personal.",
      ],
      conceptLinks: ["brokerage-account", "roth-vs-traditional"],
      didYouKnow:
        "The employer 401(k) match is one of the few truly free lunches in finance. Not taking it is leaving part of your compensation on the table.",
    },
    {
      kind: "content",
      id: "cb-l4-s3",
      title: "When investing wins (and when it does not)",
      paragraphs: [
        "Investing makes more mathematical sense when your debt is low-interest (under ~5%) and you have a long time horizon. Historically, money in the market grows faster than low-rate debt costs.",
        "Paying debt makes more sense when rates are high, your debt causes you stress, or your income is unstable. Peace of mind counts, personal finance is personal.",
      ],
      conceptLinks: ["interest-rate"],
    },
    {
      kind: "quiz",
      id: "cb-l4-q1",
      question: "According to the common-sense order of operations, what should most people do first?",
      options: [
        "Invest in individual stocks to try to beat the market",
        "Build a small emergency fund and capture any employer 401(k) match",
        "Pay off all debt including low-interest mortgages",
      ],
      correctIndex: 1,
      correctFeedback:
        "Right. A small emergency fund protects you from setbacks, and a 401(k) match is free money, those come first before paying down low-rate debt or investing beyond the match.",
      incorrectFeedback:
        "Build a safety net first (small emergency fund), then capture any free 401(k) match. These come before aggressive debt payoff or investing.",
    },
  ],
  keyTakeaways: [
    "There is a sensible order of operations: emergency fund → 401(k) match → high-interest debt → invest → low-interest debt",
    "High-interest debt nearly always beats investing mathematically",
    "Personal comfort with debt matters, the right answer fits your life, not just a spreadsheet",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. RETIREMENT & TAX-ADVANTAGED ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

const RA_L1: Lesson = {
  id: "ra-brokerage-account",
  courseId: "retirement-accounts",
  order: 1,
  title: "What is a brokerage account?",
  estimatedMin: 3,
  steps: [
    {
      kind: "content",
      id: "ra-l1-s1",
      title: "Your gateway to investing",
      paragraphs: [
        "A brokerage account is an account you open with a financial firm (Vanguard, Fidelity, Schwab, Robinhood, etc.) that lets you buy and sell stocks, ETFs, bonds, and other investments. It is like a bank account built for investments instead of cash.",
        "You transfer money in, then use it to place trades. When you sell an investment, the proceeds land back in your brokerage account. You can withdraw to your bank account at any time.",
      ],
      conceptLinks: ["brokerage-account"],
    },
    {
      kind: "content",
      id: "ra-l1-s2",
      title: "Taxable vs tax-advantaged",
      paragraphs: [
        "A standard (taxable) brokerage account has no special tax treatment. You pay taxes on dividends each year and capital gains tax when you sell at a profit. There are no contribution limits or withdrawal restrictions.",
        "Tax-advantaged accounts (IRAs, 401(k)s) offer tax benefits, either upfront (Traditional) or at withdrawal (Roth), but come with rules about how much you can contribute and when you can withdraw.",
      ],
      conceptLinks: ["brokerage-account", "roth-vs-traditional"],
      profileAside: (p) =>
        isBeginner(p)
          ? "Since you are getting started, opening a brokerage account (even with a small amount) is the first concrete step from learning about investing to actually doing it."
          : null,
    },
    {
      kind: "content",
      id: "ra-l1-s3",
      title: "Choosing a brokerage",
      paragraphs: [
        "Most major brokerages now offer commission-free stock and ETF trading and no account minimums. What differentiates them: user experience, research tools, customer support, and whether they also offer banking or retirement accounts.",
        "Look for: no account fees, no minimum balance, commission-free ETF/stock trades, and a user interface you find easy to navigate. The best brokerage is the one you will actually use.",
      ],
      conceptLinks: ["brokerage-account"],
      didYouKnow:
        "SIPC insurance protects your brokerage account up to $500,000 (including $250,000 cash) if the brokerage firm fails, but it does not protect against investment losses.",
    },
    {
      kind: "quiz",
      id: "ra-l1-q1",
      question: "What is the main difference between a taxable brokerage account and an IRA?",
      options: [
        "A taxable brokerage is for stocks; an IRA is only for bonds",
        "An IRA offers tax advantages but has contribution limits and withdrawal rules",
        "There is no difference, they are two names for the same thing",
      ],
      correctIndex: 1,
      correctFeedback:
        "Exactly. IRAs provide tax benefits (either now or later) in exchange for following rules about contributions and withdrawals. Taxable brokerages are more flexible but have no special tax treatment.",
      incorrectFeedback:
        "IRAs provide tax advantages that taxable brokerages do not, but they limit how much you can contribute each year and when you can access the money.",
    },
  ],
  keyTakeaways: [
    "A brokerage account is your gateway to buying and owning investments",
    "Taxable accounts are flexible; tax-advantaged accounts (IRA, 401k) offer tax benefits with rules",
    "Choosing a brokerage: look for no fees, no minimums, and an interface you like",
  ],
};

const RA_L2: Lesson = {
  id: "ra-roth-vs-traditional",
  courseId: "retirement-accounts",
  order: 2,
  title: "Roth vs Traditional IRA",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ra-l2-s1",
      title: "The core tradeoff: pay taxes now or later",
      paragraphs: [
        "Both Roth and Traditional IRAs are retirement accounts that shelter your investments from annual taxes. The difference is when you pay income tax.",
        "Traditional IRA: you contribute pre-tax dollars (you get a tax deduction now), the money grows tax-free, and you pay ordinary income tax when you withdraw in retirement.",
        "Roth IRA: you contribute after-tax dollars (no deduction now), the money grows tax-free, and you pay zero tax on withdrawals in retirement, including all the growth.",
      ],
      conceptLinks: ["roth-vs-traditional"],
    },
    {
      kind: "content",
      id: "ra-l2-s2",
      title: "Which one is better?",
      paragraphs: [
        "If you expect to be in a higher tax bracket in retirement than you are now, Roth wins, you pay taxes at today's lower rate. If you expect to be in a lower bracket later, Traditional wins, you get the deduction now when it is worth more.",
        "For many young earners and early-career professionals, Roth makes sense because their income (and tax rate) is likely lower now than it will be later. For high earners in their peak years, the Traditional deduction is more valuable.",
        "Many people use both, Traditional 401(k) at work plus a Roth IRA on the side. Diversifying your tax exposure is a reasonable strategy.",
      ],
      conceptLinks: ["roth-vs-traditional"],
      profileAside: (p) => {
        if (isBeginner(p))
          return "Since you are early in your investing journey, a Roth IRA is often a great starting point, you contribute after-tax money now and all the growth comes out tax-free later.";
        if (p.age < 40)
          return "At your age, you likely have decades of compounding ahead. Roth contributions grow tax-free the whole time, which can be extremely powerful over long periods.";
        return null;
      },
    },
    {
      kind: "content",
      id: "ra-l2-s3",
      title: "What about 401(k)s?",
      paragraphs: [
        "A 401(k) is an employer-sponsored retirement plan. Like IRAs, they come in Traditional (pre-tax) and Roth (after-tax) varieties. The big advantage: employers often match a percentage of your contributions, that is free money.",
        "Contribution limits are much higher than IRAs. For 2025, you can contribute up to $23,500 to a 401(k) (plus $7,500 catch-up if over 50) versus $7,000 to an IRA.",
        "If your employer offers a match, contribute enough to get the full match before funding an IRA, the match is an instant, guaranteed return you will not find anywhere else.",
      ],
      conceptLinks: ["roth-vs-traditional", "brokerage-account"],
    },
    {
      kind: "content",
      id: "ra-l2-s4",
      title: "Contribution limits and rules to know",
      paragraphs: [
        "Roth IRAs have income limits: if you earn above a certain threshold, you may not be able to contribute directly (though a 'backdoor Roth' conversion exists for those cases).",
        "Traditional IRA deductions phase out at certain incomes if you also have a workplace retirement plan.",
        "Withdrawing earnings from an IRA before age 59½ generally triggers a 10% penalty plus income tax (Roth contributions can be withdrawn penalty-free at any time).",
      ],
      conceptLinks: ["roth-vs-traditional"],
      didYouKnow:
        "Roth IRA contributions (not earnings) can be withdrawn at any time, tax-free and penalty-free. This makes a Roth a flexible backup emergency fund, though it is best to leave it invested.",
    },
    {
      kind: "quiz",
      id: "ra-l2-q1",
      question: "What is the key difference between a Roth and Traditional IRA?",
      options: [
        "A Roth IRA can only hold stocks; a Traditional IRA can hold anything",
        "Roth: pay taxes now, withdraw tax-free later. Traditional: tax deduction now, pay taxes on withdrawals",
        "There is no difference, both are taxed the same way",
      ],
      correctIndex: 1,
      correctFeedback:
        "Correct. The difference is timing of taxes, Roth is pay-now, tax-free-later. Traditional is deduction-now, taxed-later.",
      incorrectFeedback:
        "Roth IRAs are funded with after-tax money and grow tax-free. Traditional IRAs give you a deduction now but withdrawals are taxed.",
    },
  ],
  keyTakeaways: [
    "Roth: pay taxes now, tax-free withdrawals. Traditional: deduction now, taxed later",
    "If you expect to be in a higher tax bracket in retirement, Roth tends to win",
    "Always get your full 401(k) employer match, it is free money",
  ],
};

const RA_L3: Lesson = {
  id: "ra-dollar-cost-averaging",
  courseId: "retirement-accounts",
  order: 3,
  title: "Dollar-cost averaging in practice",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ra-l3-s1",
      title: "Investing on autopilot",
      paragraphs: [
        "Dollar-cost averaging (DCA) means investing a fixed amount of money at regular intervals, say $500 every month, regardless of what the market is doing. When prices are high, your $500 buys fewer shares. When prices drop, your $500 buys more shares.",
        "This is the default strategy for most retirement accounts. Every paycheck, a portion goes into your 401(k) or IRA and buys investments at whatever the current price is. No market timing required.",
      ],
      conceptLinks: ["dollar-cost-averaging"],
    },
    {
      kind: "content",
      id: "ra-l3-s2",
      title: "Why DCA works psychologically",
      paragraphs: [
        "The biggest benefit of DCA is not mathematical, it is emotional. By automating your investing, you remove the temptation to wait for 'the right time' to invest. Most people who try to time the market end up buying high and selling low.",
        "DCA also means you buy more shares when prices are down. A market drop, which feels terrible, actually benefits DCA investors, their next $500 buys shares at a discount.",
        "Housel calls this 'room for error', the gap between what could happen and what you need to happen. Regular contributions build that gap so a bad year does not force you to abandon the plan.",
      ],
      conceptLinks: ["dollar-cost-averaging", "volatility"],
      profileAside: (p) => {
        if (p.risk === "very-low" || p.risk === "low")
          return "Since you prefer lower risk, DCA may be especially comfortable for you, it smooths out the emotional ups and downs of investing by spreading your entries over time.";
        return null;
      },
    },
    {
      kind: "content",
      id: "ra-l3-s3",
      title: "Lump sum vs DCA: what the data says",
      paragraphs: [
        "Mathematically, investing a lump sum all at once beats DCA about two-thirds of the time. Markets go up more than they go down, so getting money in sooner usually wins.",
        "But DCA still makes sense if you are investing from each paycheck (you have no lump sum to deploy) or if the psychological comfort of spreading out a large windfall helps you actually follow through. The best strategy is the one you stick with.",
      ],
      conceptLinks: ["dollar-cost-averaging"],
      didYouKnow:
        "A 2021 Vanguard study found that lump-sum investing outperformed DCA about 68% of the time over 10-year periods, but DCA reduced the regret of investing right before a market drop.",
    },
    {
      kind: "content",
      id: "ra-l3-s4",
      title: "Setting up DCA in real life",
      paragraphs: [
        "Most brokerages let you set up automatic transfers from your bank account on a schedule (weekly, biweekly, monthly). You can also automate the actual purchase, for example, 'buy $500 of VOO on the 1st of every month.'",
        "Automation is the key. If investing requires a manual decision every month, life will get in the way. Set it once, let it run, and check in periodically.",
      ],
      conceptLinks: ["dollar-cost-averaging", "brokerage-account"],
    },
    {
      kind: "quiz",
      id: "ra-l3-q1",
      question: "What is the main benefit of dollar-cost averaging?",
      options: [
        "It guarantees you will buy at the lowest price each month",
        "It removes the need to time the market and smooths out the emotional ups and downs of investing",
        "It always produces higher returns than investing a lump sum",
      ],
      correctIndex: 1,
      correctFeedback:
        "Exactly. DCA automates your investing and reduces the pressure to pick the right moment, you buy at all prices over time, including dips.",
      incorrectFeedback:
        "DCA does not guarantee the lowest price or always beat lump sum. Its main value is removing emotion and market timing from the equation.",
    },
  ],
  keyTakeaways: [
    "DCA = investing a fixed amount on a regular schedule, regardless of price",
    "It removes the need to time the market and reduces emotional decision-making",
    "Lump sum beats DCA about 2/3 of the time, but DCA is how most people invest via paychecks",
  ],
};

const RA_L4: Lesson = {
  id: "ra-time-horizon",
  courseId: "retirement-accounts",
  order: 4,
  title: "How this connects to your time horizon",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ra-l4-s1",
      title: "Time horizon defines your strategy",
      paragraphs: [
        "Your time horizon, how many years until you need the money, is the single most important factor in choosing accounts, investments, and risk levels. A 25-year-old saving for retirement has a 40-year horizon. A 55-year-old eyeing retirement in 10 years has a very different calculus.",
        "Longer horizons can tolerate more volatility because there is time to recover from downturns. Shorter horizons need more stability because the money will be needed soon.",
      ],
      conceptLinks: ["time-value-money", "risk-vs-return"],
      profileAside: (p) =>
        longHorizon(p)
          ? "Your long time horizon is an advantage, it means you can ride out market cycles and let compounding do its work over decades."
          : shortHorizon(p)
            ? "Your shorter time horizon means capital preservation is more important. Investments with less volatility may make more sense for money you will need soon."
            : "Your moderate time horizon gives you flexibility, enough time for growth, but also reason to start building stability as you get closer to needing the money.",
    },
    {
      kind: "content",
      id: "ra-l4-s2",
      title: "Matching accounts to your horizon",
      paragraphs: [
        "Retirement accounts (IRAs, 401(k)s) are designed for long horizons, the tax benefits are optimized for money you will not touch until your 60s. These are ideal for long-term stock and ETF holdings.",
        "Housel frames the highest form of wealth as control over your time. In that sense, retirement accounts are time-freedom machines: money working while you are not forced to trade hours for dollars.",
        "Taxable brokerage accounts are more flexible for medium-term goals (5–15 years): a house down payment, starting a business, or early retirement before 59½.",
        "For short-term goals (under 5 years), savings accounts, money market funds, or short-term Treasury bills keep your money safe and accessible, the goal is preservation, not growth.",
      ],
      conceptLinks: ["brokerage-account", "roth-vs-traditional"],
    },
    {
      kind: "content",
      id: "ra-l4-s3",
      title: "Glide path: adjusting as you get closer",
      paragraphs: [
        "As you approach the time you will need your money, it is common to gradually shift from growth-oriented investments (stocks) toward more stable ones (bonds, cash). This is called a glide path.",
        "Target-date retirement funds do this automatically, a 2055 fund starts aggressive and slowly becomes more conservative as 2055 approaches. You can also manage this yourself by rebalancing periodically.",
        "The goal is not to time the market, but to ensure a sudden downturn right before retirement does not force you to sell at the worst moment.",
      ],
      conceptLinks: ["risk-vs-return", "volatility"],
    },
    {
      kind: "quiz",
      id: "ra-l4-q1",
      question: "Why does a longer time horizon allow for more investment risk?",
      options: [
        "Because the government guarantees stock returns over long periods",
        "Because there is more time to recover from market downturns before the money is needed",
        "Longer horizons do not affect risk, all investors should take the same approach",
      ],
      correctIndex: 1,
      correctFeedback:
        "Right. Time is the great healer in investing, the longer your horizon, the more downturns you can ride out without being forced to sell at a loss.",
      incorrectFeedback:
        "A longer horizon means more time to recover from losses. A 30-year-old can afford to watch the market drop 30% without panic; a 60-year-old may not have that luxury.",
    },
  ],
  keyTakeaways: [
    "Your time horizon determines your account choice, investment mix, and risk level",
    "Retirement accounts are for long horizons; taxable accounts for medium-term goals; savings for short-term needs",
    "A glide path shifts from growth to stability as you approach needing the money",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. INVESTING BUILDING BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

const IB_L1: Lesson = {
  id: "ib-stock-etf",
  courseId: "investing-building-blocks",
  order: 1,
  title: "What is a stock? What is an ETF?",
  estimatedMin: 5,
  steps: [
    {
      kind: "content",
      id: "ib-l1-s1",
      title: "A stock is a slice of a company",
      paragraphs: [
        "A stock represents a small piece of ownership in a company. When you buy one share of Apple, you own a tiny fraction of Apple, including a claim on its future profits.",
        'Companies issue stock to raise money. Investors buy it hoping the company will become more valuable. Stocks trade on exchanges (like the New York Stock Exchange or Nasdaq), where buyers and sellers meet, just like a marketplace, but for ownership slices.',
      ],
      conceptLinks: ["what-is-stock"],
      didYouKnow:
        "The first modern stock exchange was founded in Amsterdam in 1602 by the Dutch East India Company. Investors bought shares to fund voyages and shared in the profits.",
    },
    {
      kind: "content",
      id: "ib-l1-s2",
      title: "An ETF is a basket, like a smoothie",
      paragraphs: [
        "An ETF (exchange-traded fund) is a collection of stocks, bonds, or other assets bundled into a single investment. Think of it like a smoothie: instead of buying each fruit individually, you buy one blended drink that contains them all.",
        "When you buy one share of an S&P 500 ETF (like VOO), you instantly own tiny pieces of 500 companies, Apple, Microsoft, Johnson & Johnson, and 497 others, in a single purchase. That is instant diversification.",
      ],
      conceptLinks: ["what-is-etf", "etf", "diversification"],
    },
    {
      kind: "content",
      id: "ib-l1-s3",
      title: "Different ETFs for different goals",
      paragraphs: [
        "Just like smoothies come in different flavors, ETFs come in different varieties. Some track broad indexes (S&P 500, total US market). Others focus on specific sectors (technology, healthcare), geographies (international, emerging markets), or strategies (dividend, growth, value).",
        "The key difference between ETFs and individual stocks: with a stock, you are betting on one company. With an ETF, you are betting on a whole category, which spreads your risk across many companies at once.",
      ],
      conceptLinks: ["etf", "diversification", "expense-ratio"],
    },
    {
      kind: "content",
      id: "ib-l1-s4",
      title: "How ETFs trade (and why it matters)",
      paragraphs: [
        "ETFs trade throughout the day on exchanges, just like stocks. Unlike mutual funds, which only price once at the end of the trading day, ETF prices update in real time. You can buy or sell whenever the market is open.",
        "Most ETFs are passively managed, they simply track an index rather than trying to beat it. This keeps costs extremely low, with expense ratios often between 0.03% and 0.10% per year.",
      ],
      conceptLinks: ["expense-ratio", "active-vs-passive"],
      didYouKnow:
        "The first ETF (SPDR S&P 500, ticker SPY) launched in 1993. Today there are over 3,000 ETFs in the US alone, holding trillions of dollars in assets.",
    },
    {
      kind: "content",
      id: "ib-l1-s5",
      title: "Stock or ETF, which one?",
      paragraphs: [
        "Neither is universally better, they serve different purposes. Individual stocks let you invest deeply in companies you believe in. ETFs give you broad exposure with less research and lower single-company risk.",
        "Many investors use both: a core portfolio of broad ETFs for steady diversification, plus a few individual stocks in areas they find interesting or have conviction about.",
      ],
      conceptLinks: ["what-is-stock", "what-is-etf", "diversification"],
      profileAside: (p) =>
        isBeginner(p)
          ? "If you are just starting out, broad ETFs are often the simplest way to begin, instant diversification means one company's bad day does not sink your whole portfolio."
          : null,
    },
    {
      kind: "quiz",
      id: "ib-l1-q1",
      question: "What is the main advantage of an ETF over buying a single stock?",
      options: [
        "ETFs are guaranteed to go up in value",
        "An ETF gives you instant diversification across many companies in one purchase",
        "ETFs have no fees",
      ],
      correctIndex: 1,
      correctFeedback:
        "Exactly. An ETF bundles many companies into one investment, one purchase gives you exposure to all of them, spreading your risk.",
      incorrectFeedback:
        "ETFs provide instant diversification across many companies. They do have fees (expense ratios), and no investment is guaranteed to go up.",
    },
  ],
  keyTakeaways: [
    "A stock = partial ownership in one company. An ETF = a basket of many companies in one purchase",
    "ETFs provide instant diversification and typically have very low fees",
    "Many investors use both: core ETFs for stability, individual stocks for conviction bets",
  ],
};

const IB_L2: Lesson = {
  id: "ib-diversification-risk",
  courseId: "investing-building-blocks",
  order: 2,
  title: "Diversification & risk vs return",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ib-l2-s1",
      title: "Don't put all your eggs in one basket",
      paragraphs: [
        "Diversification means spreading your money across different investments, companies, industries, countries, and asset types, so that no single failure can wipe you out. If you own 30 stocks and one goes to zero, you lose about 3%. If you own one stock and it goes to zero, you lose everything.",
        "Diversification is often called the only free lunch in investing because it reduces risk without necessarily reducing expected returns.",
      ],
      conceptLinks: ["diversification", "risk-vs-return"],
    },
    {
      kind: "content",
      id: "ib-l2-s2",
      title: "The risk-return tradeoff",
      paragraphs: [
        "Risk and return are two sides of the same coin. Investments that can produce bigger gains are also the ones that can produce bigger losses. Cash in a savings account is safe but earns very little. Government bonds are safer but pay modest interest. Stocks can rise or fall dramatically but have returned 7–10% per year historically.",
        "There is no escape from this tradeoff. Any investment that promises high returns with no risk is either misleading or a scam. Your job as an investor is to find the right balance for your situation and temperament.",
      ],
      conceptLinks: ["risk-vs-return", "volatility"],
      profileAside: (p) => {
        const riskLevel =
          p.risk === "very-low" || p.risk === "low"
            ? "lower"
            : p.risk === "very-high" || p.risk === "high"
              ? "higher"
              : "moderate";
        return `Your risk tolerance is ${riskLevel}. This affects where you land on the risk-return spectrum, ${riskLevel === "lower" ? "you may prefer a portfolio weighted toward stability, with a smaller allocation to volatile growth assets" : riskLevel === "higher" ? "you may be comfortable with more growth-oriented investments that come with bigger short-term swings" : "a balanced mix of growth and stability may feel right to you"}.`;
      },
    },
    {
      kind: "content",
      id: "ib-l2-s3",
      title: "How diversification actually works",
      paragraphs: [
        "True diversification is not just owning many stocks, it is owning stocks that do not all move together. If you own 50 tech stocks, a tech selloff hurts all of them. But if you also own healthcare, utilities, and international stocks, those may hold up differently.",
        "This is where ETFs shine: a total-market ETF diversifies you across thousands of companies, sectors, and market caps. A total international ETF adds geographic diversification. Together, they reduce the impact of any single company, sector, or country having a bad stretch.",
        "Benjamin Graham's defensive investor starts here: broad diversification is the rational default, not a bet that you can pick the one winning story.",
      ],
      conceptLinks: ["diversification", "etf", "sector-industry", "correlation"],
    },
    {
      kind: "content",
      id: "ib-l2-s4",
      title: "Volatility is not the same as risk",
      paragraphs: [
        "Volatility, how much a stock's price swings, feels like risk, but they are not identical. A volatile stock can be an excellent long-term investment if the underlying business keeps growing. The real risk is needing to sell during a downswing.",
        "This is why time horizon matters so much. If you have 20 years, short-term volatility is noise. If you need the money next year, volatility is real risk.",
      ],
      conceptLinks: ["volatility", "risk-vs-return", "drawdown"],
    },
    {
      kind: "quiz",
      id: "ib-l2-q1",
      question: "What makes diversification effective at reducing risk?",
      options: [
        "Owning many stocks that tend to move in different directions at different times",
        "Owning as many stocks as possible in the same industry",
        "Diversification does not reduce risk, it only increases returns",
      ],
      correctIndex: 0,
      correctFeedback:
        "Correct. Real diversification means owning assets that do not all move together, across companies, sectors, and geographies.",
      incorrectFeedback:
        "Diversification works when you own assets that behave differently from each other. Owning 50 tech stocks is not truly diversified if they all drop together during a tech selloff.",
    },
  ],
  keyTakeaways: [
    "Diversification reduces risk without proportionally reducing expected returns",
    "Higher returns always come with higher risk, there is no free lunch",
    "Volatility (price swings) is not the same as permanent loss risk",
  ],
};

const IB_L3: Lesson = {
  id: "ib-themes-questionnaire",
  courseId: "investing-building-blocks",
  order: 3,
  title: "How Thesis themes relate to your questionnaire",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ib-l3-s1",
      title: "Your answers shape your themes",
      paragraphs: [
        "When you completed the Thesis questionnaire, you answered questions about your goals, risk tolerance, time horizon, and what matters to you. The app uses those answers to match you with investing themes, narrative frames that align with your worldview and priorities.",
        "Themes are not stock recommendations. They are lenses: a way to explore the investing world through ideas that already make sense to you. If you care about AI and technology, the 'AI infrastructure' theme helps you understand that space, not tell you what to buy.",
      ],
      profileAside: (p) => {
        const goalLabels: Record<string, string> = {
          retirement: "building long-term wealth for retirement",
          wealth: "growing your assets over time",
          house: "saving toward a home purchase",
          income: "generating cash flow from your investments",
          exploration: "learning and exploring the investing landscape",
        };
        return `Your primary goal, ${goalLabels[p.primaryGoal] ?? p.primaryGoal}, influences which themes are most relevant to you. Themes are designed to connect your personal goals to the investing ideas worth understanding.`;
      },
    },
    {
      kind: "content",
      id: "ib-l3-s2",
      title: "Themes as a learning tool",
      paragraphs: [
        "Think of themes as curated starting points. Instead of facing thousands of stocks with no filter, themes group companies and ETFs around coherent ideas, clean energy, cybersecurity, aging demographics, compounder businesses.",
        "Each theme includes: what it is (a plain-English thesis), why it exists (drivers), and how it connects to the broader economy. The point is understanding, not picking winners.",
      ],
    },
    {
      kind: "content",
      id: "ib-l3-s3",
      title: "Risk, horizon, and your theme matches",
      paragraphs: [
        "Your risk tolerance and time horizon affect which themes surface. A long horizon with high risk tolerance might surface emerging-tech themes. A shorter horizon with lower risk tolerance might surface cash-flow defensives or income-oriented themes.",
        "This is not a judgment about what is 'better', it is about finding ideas that fit your situation. A conservative investor and an aggressive investor can both be right for their own circumstances.",
      ],
      conceptLinks: ["risk-vs-return", "diversification"],
      profileAside: (p) =>
        longHorizon(p)
          ? "Your long time horizon opens up themes that may take years to play out, structural trends like aging demographics or AI infrastructure are multi-decade stories."
          : "Your shorter horizon means themes with nearer-term relevance may be more practical, income-oriented or defensive themes that align with capital preservation.",
    },
    {
      kind: "content",
      id: "ib-l3-s4",
      title: "Themes evolve with you",
      paragraphs: [
        "As your knowledge grows and your circumstances change, your theme matches can shift. You can retake the questionnaire at any time. The goal is not to find the 'right' theme once, it is to have a framework that grows with you.",
        "The real value of themes is not the stocks inside them, it is the mental model they give you for understanding why certain parts of the market behave the way they do.",
      ],
    },
    {
      kind: "quiz",
      id: "ib-l3-q1",
      question: "What is the purpose of Thesis themes?",
      options: [
        "To tell you exactly which stocks to buy",
        "To provide narrative frames that help you explore investing ideas aligned with your goals and worldview",
        "To predict which sectors will perform best next year",
      ],
      correctIndex: 1,
      correctFeedback:
        "Right. Themes are educational lenses, they help you understand the investing world through ideas that connect to your goals, not tell you what to buy.",
      incorrectFeedback:
        "Themes are not stock recommendations or predictions. They are frameworks for understanding, connecting your goals to investing ideas in a way that makes sense to you.",
    },
  ],
  keyTakeaways: [
    "Themes are educational lenses, not stock picks or predictions",
    "Your questionnaire answers (goals, risk, horizon) determine which themes are most relevant",
    "Themes are a starting point for learning, and they evolve as your knowledge and circumstances change",
  ],
};

const IB_L4: Lesson = {
  id: "ib-what-are-duels",
  courseId: "investing-building-blocks",
  order: 4,
  title: "What duels are for",
  estimatedMin: 4,
  steps: [
    {
      kind: "content",
      id: "ib-l4-s1",
      title: "THIS or THAT, a thinking tool",
      paragraphs: [
        "Duels are the Thesis version of comparing two investment ideas side by side. You pick two stocks (or a stock and an ETF) and see their key metrics, themes, and narratives next to each other.",
        "The point is not to crown a winner and buy it. The point is to clarify your own thinking by forcing a comparison. When you have to choose between two things, you learn what you actually value.",
        "Morgan Housel's opening lesson applies: no one is crazy, different investors are playing different games. Duels help you discover which game you are actually playing.",
      ],
      conceptLinks: ["risk-vs-return"],
    },
    {
      kind: "content",
      id: "ib-l4-s2",
      title: "How duels help you think",
      paragraphs: [
        "Comparing a high-growth tech stock against a steady dividend payer makes both ideas clearer. You might realize you actually care more about stability than growth, or the opposite. The duel reveals your preferences, not market truths.",
        "Duels also surface metrics you might not have considered. Seeing P/E ratio, market cap, and dividend yield side by side makes the tradeoffs concrete. A stock with a P/E of 80 looks very different next to one with a P/E of 15.",
      ],
      conceptLinks: ["pe-ratio", "market-cap", "dividend-yield"],
      profileAside: (p) =>
        isBeginner(p)
          ? "If the metrics look unfamiliar, that is exactly the point, tap any label to open the ExplainSheet and learn what it means. Duels are designed to teach you as you compare."
          : null,
    },
    {
      kind: "content",
      id: "ib-l4-s3",
      title: "Duels are not trade tickets",
      paragraphs: [
        "A common mistake is treating a duel like a buy decision: 'I compared Apple and Microsoft, so now I have to pick one to invest in.' That is not what duels are for.",
        "You can duel two stocks you never plan to buy, just to understand how different types of companies operate. You can duel a stock against an ETF to clarify whether individual stock picking even makes sense for you. The duel is a learning exercise, the outcome is insight, not a transaction.",
      ],
    },
    {
      kind: "content",
      id: "ib-l4-s4",
      title: "What duels teach over time",
      paragraphs: [
        "Regularly dueling ideas builds pattern recognition. You start to notice that high-growth companies tend to have high P/E ratios, that dividend payers cluster in certain sectors, and that market cap says a lot about stability.",
        "Over time, you develop your own framework for evaluating ideas, not because anyone told you what matters, but because you have seen enough comparisons to know what stands out to you.",
      ],
    },
    {
      kind: "quiz",
      id: "ib-l4-q1",
      question: "What is the main purpose of a Thesis duel?",
      options: [
        "To decide which stock to buy and how much to invest",
        "To clarify your own thinking by comparing two ideas side by side",
        "To get a recommendation from the app about which is better",
      ],
      correctIndex: 1,
      correctFeedback:
        "Exactly. Duels are thinking tools, they help you understand what you value by forcing a comparison. The outcome is insight, not a purchase.",
      incorrectFeedback:
        "Duels are not buy/sell recommendations. They are educational exercises, comparing ideas to learn what matters to you, not to pick winners.",
    },
  ],
  keyTakeaways: [
    "Duels are comparison tools for learning, not trade recommendations",
    "Comparing ideas side by side reveals what you actually value as an investor",
    "Repeated dueling builds pattern recognition and your own investing framework over time",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Assemble courses
// ─────────────────────────────────────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: "money-foundations",
    title: "Money foundations",
    description:
      "Interest, compound growth, inflation, and the time value of money, the core ideas every investor needs before anything else.",
    lessons: [MF_L1, MF_L2, MF_L3, MF_L4],
  },
  {
    id: "credit-borrowing",
    title: "Credit & borrowing",
    description:
      "How credit scores work, how to build and protect yours, and when to prioritize paying down debt versus investing.",
    lessons: [CB_L1, CB_L2, CB_L3, CB_L4],
  },
  {
    id: "retirement-accounts",
    title: "Retirement & tax-advantaged accounts",
    description:
      "Brokerage accounts, Roth vs Traditional IRAs, dollar-cost averaging, and how your time horizon shapes your account choices.",
    lessons: [RA_L1, RA_L2, RA_L3, RA_L4],
  },
  {
    id: "investing-building-blocks",
    title: "Investing building blocks",
    description:
      "Stocks, ETFs, diversification, risk, and how your Thesis themes connect to your questionnaire.",
    courseMetaphor:
      "Think of ETFs like a smoothie, one blended drink that contains many ingredients, instead of buying each fruit (stock) individually.",
    lessons: [IB_L1, IB_L2, IB_L3, IB_L4],
  },
  ...TOPIC_PACK_COURSES,
];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup maps
// ─────────────────────────────────────────────────────────────────────────────

const BY_ID: Record<string, Course> = {};
for (const c of COURSES) BY_ID[c.id] = c;

const LESSONS_BY_ID: Record<string, Lesson> = {};
const LESSONS_BY_COURSE: Record<string, Lesson[]> = {};

function rebuildLessonIndexes() {
  for (const c of COURSES) {
    const sorted = [...c.lessons].sort((a, b) => a.order - b.order);
    LESSONS_BY_COURSE[c.id] = sorted;
    for (const l of sorted) {
      LESSONS_BY_ID[l.id] = l;
    }
  }
}
rebuildLessonIndexes();

// ─────────────────────────────────────────────────────────────────────────────
// Public exports
// ─────────────────────────────────────────────────────────────────────────────

export function courses(): Course[] {
  return COURSES;
}

export function courseById(id: CourseId): Course | undefined {
  return BY_ID[id];
}

export function lessonsForCourse(courseId: CourseId): Lesson[] {
  return LESSONS_BY_COURSE[courseId] ?? [];
}

export function lessonById(lessonId: string): Lesson | undefined {
  return LESSONS_BY_ID[lessonId];
}

/** Call after mutating a course's lessons array to refresh internal indexes. */
export function _rebuildLessonIndexes() {
  rebuildLessonIndexes();
}
