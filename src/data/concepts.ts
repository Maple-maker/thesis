export type ConceptId =
  // foundational
  | "what-is-stock"
  | "compound-interest"
  | "time-value-money"
  | "inflation"
  | "diversification"
  | "risk-vs-return"
  | "what-is-etf"
  | "brokerage-account"
  | "roth-vs-traditional"
  | "fed-rate"
  | "credit-score"
  | "dollar-cost-averaging"
  | "what-is-dividend"
  | "bull-bear-market"
  | "market-index"
  // intermediate
  | "pe-ratio"
  | "market-cap"
  | "dividend-yield"
  | "beta"
  | "moat"
  | "expense-ratio"
  | "volatility"
  | "drawdown"
  | "ebitda"
  | "yoy"
  | "run-rate"
  | "etf"
  | "sector-industry"
  | "eps"
  | "price-to-book"
  | "free-cash-flow"
  | "revenue-vs-profit"
  | "active-vs-passive"
  | "limit-vs-market-order"
  | "expense-ratio-impact"
  // advanced
  | "dcf"
  | "correlation"
  | "sharpe-ratio"
  | "enterprise-value"
  | "convexity"
  | "options-basics"
  | "wacc"
  | "technical-vs-fundamental";

export type ConceptTier = "foundational" | "intermediate" | "advanced";

export type ResourceKind = "book" | "video" | "podcast" | "course";

export type LearningResource = {
  kind: ResourceKind;
  title: string;
  creator?: string;
};

export type Concept = {
  id: ConceptId;
  tier: ConceptTier;
  term: string;
  short: string;
  body: string;
  whyItMatters?: string;
  related?: ConceptId[];
  resources?: LearningResource[];
  nextConcept?: ConceptId;
};

// ─────────────────────────────────────────────────────────────────────────────
// Foundational (15)
// ─────────────────────────────────────────────────────────────────────────────

const FOUNDATIONAL: Concept[] = [
  {
    id: "what-is-stock",
    tier: "foundational",
    term: "What is a stock?",
    short: "A tiny slice of ownership in a company.",
    body: "A stock is a share of ownership in a company. When you buy one share of Apple, you own a very small piece of Apple — including a claim on its future profits and growth. Companies sell stock to raise money, and investors buy it hoping the company will become more valuable over time. Stocks are also called equities. They trade on exchanges (like the New York Stock Exchange) where buyers and sellers meet.",
    whyItMatters: "Stocks have historically been one of the best ways to grow wealth over long periods. But they also go up and down in the short term — that volatility is the price you pay for higher potential returns.",
    related: ["market-cap", "what-is-etf", "diversification"],
    resources: [
      { kind: "book", title: "The Little Book of Common Sense Investing", creator: "John C. Bogle" },
      { kind: "video", title: "Investing for Beginners — How a Stock Works" },
      { kind: "book", title: "The Only Investment Guide You'll Ever Need", creator: "Andrew Tobias" },
    ],
    nextConcept: "market-cap",
  },
  {
    id: "compound-interest",
    tier: "foundational",
    term: "Compound interest",
    short: "Interest on your interest — your money earning money on itself.",
    body: 'Compound interest means you earn returns not just on what you put in, but on the returns you already earned. If you invest $1,000 and it grows 10% in year one, you have $1,100. If it grows another 10% in year two, you earn $110 — not $100 — because you are earning on the $1,100. Over decades, this snowball effect is extremely powerful. Albert Einstein reportedly called it the "eighth wonder of the world."',
    whyItMatters: "Compound interest is why starting early matters so much in investing. A person who invests $5,000 a year from age 25 can end up with far more than someone who invests $10,000 a year starting at 40 — because the early money has more time to compound.",
    related: ["time-value-money", "dollar-cost-averaging"],
    resources: [
      { kind: "book", title: "The Psychology of Money", creator: "Morgan Housel" },
    ],
    nextConcept: "time-value-money",
  },
  {
    id: "time-value-money",
    tier: "foundational",
    term: "Time value of money",
    short: "A dollar today is worth more than a dollar tomorrow.",
    body: "The time value of money is the idea that a dollar in your hand today is worth more than a dollar you will get in the future — because you can invest today's dollar and grow it. This is why investors demand a return: they are trading spending power now for more spending power later. It is also why inflation matters: if prices rise 3% a year, a dollar today buys more than a dollar next year, even without investing.",
    whyItMatters: "This concept is the foundation for almost every investing decision — choosing between spending versus saving, valuing a stock, or deciding how much to put in a retirement account.",
    related: ["compound-interest", "inflation", "dcf"],
    nextConcept: "inflation",
  },
  {
    id: "inflation",
    tier: "foundational",
    term: "Inflation",
    short: "Prices rise over time — your dollar buys less next year.",
    body: "Inflation is the gradual increase in the price of goods and services. When inflation is 3%, something that cost $100 last year costs $103 this year. Your money loses purchasing power if it just sits in cash. Central banks like the Federal Reserve aim to keep inflation at a moderate level (around 2%) — low enough to protect savers, but high enough to encourage spending and investing.",
    whyItMatters: "Inflation is the biggest hidden risk to your money. If your investments earn 4% a year but inflation is 3%, your real return is only 1%. That is why keeping all your money in cash or a checking account loses you purchasing power over time.",
    related: ["fed-rate", "time-value-money"],
    resources: [
      { kind: "book", title: "The Price of Time", creator: "Edward Chancellor" },
      { kind: "podcast", title: "Macro Voices", creator: "Erik Townsend" },
    ],
    nextConcept: "fed-rate",
  },
  {
    id: "diversification",
    tier: "foundational",
    term: "Diversification",
    short: "Don't put all your eggs in one basket.",
    body: "Diversification means spreading your money across different investments — different companies, industries, and types of assets — so that a single failure does not wipe you out. If you own 30 stocks and one goes to zero, you lose about 3% of your portfolio. If you own one stock and it goes to zero, you lose everything.",
    whyItMatters: "Diversification is the closest thing to a free lunch in investing. It reduces your risk without reducing your expected returns as much as you might think. Index funds and ETFs are popular ways to diversify instantly.",
    related: ["what-is-etf", "risk-vs-return", "market-index"],
    resources: [
      { kind: "book", title: "A Random Walk Down Wall Street", creator: "Burton G. Malkiel" },
    ],
    nextConcept: "what-is-etf",
  },
  {
    id: "risk-vs-return",
    tier: "foundational",
    term: "Risk versus return",
    short: "Higher potential returns come with bigger potential losses.",
    body: "Risk and return are two sides of the same coin. Investments that can produce big gains are also the ones that can produce big losses. Cash is safe but earns almost nothing. Government bonds are very safe but pay low interest. Stocks can double or halve in a year but have historically returned about 7-10% per year over the long run.",
    whyItMatters: "There is no escape from this tradeoff. Any investment that promises high returns with no risk is either a lie or a scam. Your job as an investor is to find the right balance for your situation and stomach.",
    related: ["diversification", "volatility", "drawdown"],
    resources: [
      { kind: "book", title: "Against the Gods: The Remarkable Story of Risk", creator: "Peter L. Bernstein" },
    ],
    nextConcept: "volatility",
  },
  {
    id: "what-is-etf",
    tier: "foundational",
    term: "What is an ETF?",
    short: "A basket of stocks you buy as one ticker — instant diversification.",
    body: "An ETF (exchange-traded fund) is a collection of stocks, bonds, or other assets bundled together into a single investment that trades on an exchange, just like a regular stock. When you buy one share of an ETF, you own tiny pieces of every company inside it. Most ETFs track an index (like the S&P 500), which means they automatically own all the companies in that index.",
    whyItMatters: "ETFs are one of the best tools for beginner investors. A single ETF can give you exposure to 500 companies (like VOO, which tracks the S&P 500) for a very low fee. This gives you instant diversification without having to research individual stocks.",
    related: ["diversification", "expense-ratio", "market-index"],
    resources: [
      { kind: "book", title: "The Bogleheads' Guide to Investing" },
    ],
    nextConcept: "expense-ratio",
  },
  {
    id: "brokerage-account",
    tier: "foundational",
    term: "Brokerage accounts",
    short: "An account that lets you buy and sell investments.",
    body: "A brokerage account is a special account you open with a brokerage firm (like Vanguard, Fidelity, Schwab, or Robinhood) that allows you to buy and sell stocks, ETFs, bonds, and other investments. Unlike a bank account that just holds cash, a brokerage account holds your investment assets. You put money in, then use it to place trades. Some accounts are taxable (standard brokerage), while others offer tax benefits (IRAs, 401(k)s).",
    whyItMatters: "You cannot invest in stocks or ETFs without a brokerage account. Choosing the right one matters for fees, features, and account type — especially whether it is tax-advantaged or not.",
    related: ["roth-vs-traditional", "what-is-etf", "expense-ratio"],
  },
  {
    id: "roth-vs-traditional",
    tier: "foundational",
    term: "Roth vs Traditional IRA",
    short: "Pay taxes now (Roth) or later (Traditional) — your call.",
    body: "Both are tax-advantaged retirement accounts, but they handle taxes differently. With a Traditional IRA, you contribute pre-tax money (you get a tax break today) and pay income tax when you withdraw in retirement. With a Roth IRA, you contribute after-tax money (no tax break today) and withdraw tax-free in retirement, including all the growth.",
    whyItMatters: "The choice depends on your tax situation now versus where you expect to be in retirement. If you think you will be in a higher tax bracket later, Roth is usually better. If you want a tax break now, Traditional wins. Many people use both.",
    related: ["brokerage-account", "compound-interest", "dollar-cost-averaging"],
  },
  {
    id: "fed-rate",
    tier: "foundational",
    term: "Federal Reserve interest rate",
    short: "The US central bank's main lever for controlling the economy.",
    body: "The Federal Reserve (the Fed) is the US central bank. Its main tool is setting the federal funds rate — the interest rate banks charge each other for overnight loans. When the Fed raises this rate, borrowing becomes more expensive (mortgages, credit cards, business loans), which slows the economy and fights inflation. When it lowers rates, borrowing gets cheaper, which stimulates spending and growth.",
    whyItMatters: "The Fed rate affects almost everything in your financial life — mortgage rates, credit card APR, savings account yields, and stock market performance. Rate cuts tend to boost stock prices; rate hikes tend to cool them. This is why investors watch Fed announcements closely.",
    related: ["inflation", "time-value-money"],
  },
  {
    id: "credit-score",
    tier: "foundational",
    term: "Credit scores",
    short: "A number that tells lenders how reliable you are at paying debts.",
    body: "Your credit score is a three-digit number (usually 300-850) that summarizes your history of borrowing and repaying money. Lenders use it to decide whether to give you a credit card, car loan, or mortgage — and what interest rate to charge. A higher score means cheaper borrowing. The score is based on factors like paying bills on time, how much debt you carry, and how long you have had credit.",
    whyItMatters: "A good credit score can save you tens of thousands of dollars over your lifetime through lower interest rates. It can also affect your ability to rent an apartment, get a cell phone plan, or even land certain jobs.",
    related: ["fed-rate"],
    resources: [
      { kind: "video", title: "Graham Stephan — Credit Card Basics" },
    ],
  },
  {
    id: "dollar-cost-averaging",
    tier: "foundational",
    term: "Dollar-cost averaging",
    short: "Investing the same amount regularly, regardless of price.",
    body: "Dollar-cost averaging (DCA) means investing a fixed amount of money at regular intervals — say $500 every month — instead of trying to time the market by investing a lump sum all at once. When prices are high, your $500 buys fewer shares. When prices drop, your $500 buys more shares. Over time, this means you buy more shares at low prices and fewer at high prices, automatically.",
    whyItMatters: "DCA removes emotion from investing. Instead of trying to predict whether the market will go up or down (which experts get wrong regularly), you just keep investing. It is the default strategy for most retirement accounts and works especially well for long-term investors.",
    related: ["compound-interest", "time-value-money", "risk-vs-return"],
    resources: [
      { kind: "book", title: "The Automatic Millionaire", creator: "David Bach" },
    ],
  },
  {
    id: "what-is-dividend",
    tier: "foundational",
    term: "What is a dividend?",
    short: "A company sharing a piece of its profit with you as cash.",
    body: "A dividend is a cash payment a company makes to its shareholders, usually every three months. It is your share of the company's profits. Not all companies pay dividends — younger, faster-growing companies often reinvest all their profits into the business instead. More established companies (think Coca-Cola, Procter & Gamble) tend to pay regular dividends.",
    whyItMatters: "Dividends provide income even when stock prices are flat or falling. Over long periods, dividends have accounted for a significant portion of total stock market returns. They are especially valuable for retirees or anyone who needs their portfolio to produce cash.",
    related: ["dividend-yield", "what-is-stock", "compound-interest"],
  },
  {
    id: "bull-bear-market",
    tier: "foundational",
    term: "Bull versus bear markets",
    short: "Bull = rising markets. Bear = falling markets.",
    body: "A bull market is a prolonged period when stock prices are rising, typically by 20% or more from a recent low. A bear market is a prolonged period when prices are falling, typically 20% or more from a recent high. The names come from how each animal attacks: a bull thrusts upward with its horns, while a bear swipes downward with its paws.",
    whyItMatters: "Bear markets are scary but normal — they happen roughly every 5-7 years. The key is that bull markets have historically lasted longer and gone higher than bear markets have lost. Investors who sell in a panic during a bear market often miss the recovery that follows.",
    related: ["drawdown", "risk-vs-return", "volatility"],
    resources: [
      { kind: "book", title: "Reminiscences of a Stock Operator", creator: "Edwin Lefèvre" },
    ],
  },
  {
    id: "market-index",
    tier: "foundational",
    term: "What is a market index?",
    short: "A scoreboard showing how a group of stocks is performing.",
    body: "A market index tracks the performance of a specific group of stocks. The S&P 500 tracks 500 large US companies. The Nasdaq-100 tracks 100 of the largest tech-oriented companies. The Dow Jones Industrial Average tracks 30 major companies. When you hear \"the market is up today,\" people are usually talking about the S&P 500.",
    whyItMatters: "Indexes are the benchmarks that investors measure themselves against. If your portfolio returned 8% but the S&P 500 returned 12%, you underperformed the market. Many investors simply buy index funds or ETFs that track these indexes, which is a low-cost way to match the market's return.",
    related: ["what-is-etf", "diversification", "active-vs-passive"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Intermediate (20)
// ─────────────────────────────────────────────────────────────────────────────

const INTERMEDIATE: Concept[] = [
  {
    id: "pe-ratio",
    tier: "intermediate",
    term: "P/E ratio",
    short: "Price divided by earnings — how much you pay for each dollar of profit.",
    body: "The price-to-earnings ratio (P/E) compares a company's stock price to its earnings per share. If a stock trades at $100 and earned $5 per share last year, its P/E is 20. A high P/E (say 50+) often means investors expect strong future growth. A low P/E (say under 10) can mean a stock is undervalued or that the company is struggling.",
    whyItMatters: "P/E is the most widely used valuation metric in investing. Comparing a company's P/E to its industry average or its own history gives you a quick sense of whether the stock looks expensive or cheap. But P/E alone does not tell the full story — it works best alongside other metrics.",
    related: ["market-cap", "eps", "price-to-book"],
    resources: [
      { kind: "book", title: "One Up On Wall Street", creator: "Peter Lynch" },
    ],
    nextConcept: "eps",
  },
  {
    id: "market-cap",
    tier: "intermediate",
    term: "Market cap",
    short: "Total dollar value of a company — share price × shares outstanding.",
    body: "Market capitalization (market cap) is the total value of a company's outstanding shares. If a company has 1 billion shares and each trades at $50, its market cap is $50 billion. Companies are grouped by size: large-cap ($10B+), mid-cap ($2B-$10B), and small-cap (under $2B).",
    whyItMatters: "Market cap tells you how big a company is and how much weight it carries in the market. Large-caps are generally more stable; small-caps can grow faster but are riskier. Most index funds weight holdings by market cap, meaning bigger companies make up a larger percentage of the fund.",
    related: ["pe-ratio", "enterprise-value", "market-index"],
    nextConcept: "pe-ratio",
  },
  {
    id: "dividend-yield",
    tier: "intermediate",
    term: "Dividend yield",
    short: "Annual dividend divided by stock price — your cash return per dollar invested.",
    body: "Dividend yield is the annual dividend payment expressed as a percentage of the stock price. If a stock pays $2 per year in dividends and trades at $50, its dividend yield is 4%. A higher yield means more cash income for the same investment, but yields can be high because the stock price has fallen (a potential warning sign).",
    whyItMatters: "Dividend yield is the key metric for income-focused investors. A 3-4% yield from a stable company can provide significant cash flow. However, a yield above 6-8% sometimes signals that the market expects a dividend cut, so it pays to look deeper.",
    related: ["what-is-dividend", "pe-ratio", "expense-ratio"],
  },
  {
    id: "beta",
    tier: "intermediate",
    term: "Beta",
    short: "How much a stock moves compared to the overall market.",
    body: "Beta measures a stock's volatility relative to the broad market (usually the S&P 500). The market has a beta of 1.0. A stock with beta 1.5 tends to move 50% more than the market — up more in rallies, down more in selloffs. A stock with beta 0.5 moves half as much. A beta below 0 means the stock tends to move opposite the market (rare).",
    whyItMatters: "Beta helps you understand a stock's risk profile. High-beta stocks can supercharge your returns in a bull market but will hurt more in a downturn. Low-beta stocks (utilities, consumer staples) are steadier and often used as portfolio stabilizers.",
    related: ["volatility", "risk-vs-return", "diversification"],
  },
  {
    id: "moat",
    tier: "intermediate",
    term: "Economic moat",
    short: "A durable advantage that protects a company from competitors.",
    body: "An economic moat — a term popularized by Warren Buffett — is a company's ability to keep competitors at bay over long periods. Moats come in different forms: brand power (Apple, Coca-Cola), network effects (Meta, Visa), cost advantages (Walmart), switching costs (Adobe, Salesforce), or intangible assets like patents (Pfizer). A wide moat means the company is hard to disrupt.",
    whyItMatters: "Companies with wide moats tend to be more predictable and profitable over long periods. They can raise prices, retain customers, and earn returns on capital that exceed their cost of capital. When building a long-term portfolio, moat is one of the most important qualities to look for.",
    related: ["free-cash-flow", "pe-ratio", "revenue-vs-profit"],
    resources: [
      { kind: "podcast", title: "Invest Like the Best", creator: "Patrick O'Shaughnessy" },
      { kind: "book", title: "Berkshire Hathaway Shareholder Letters", creator: "Warren Buffett" },
    ],
  },
  {
    id: "expense-ratio",
    tier: "intermediate",
    term: "Expense ratio",
    short: "The annual fee a fund charges, shown as a percentage of your investment.",
    body: "An expense ratio is the yearly fee an ETF or mutual fund charges to cover operating costs — management, administration, marketing. It is expressed as a percentage of your invested amount. If you invest $10,000 in a fund with a 0.03% expense ratio, you pay $3 per year. If the ratio is 1%, you pay $100 per year.",
    whyItMatters: "Expense ratios may sound small, but they compound over time. A 1% fee eats into your returns significantly over 30 years compared to a 0.03% fee. This is why low-cost index funds and ETFs have become so popular — less money lost to fees means more money working for you.",
    related: ["expense-ratio-impact", "what-is-etf", "compound-interest"],
    nextConcept: "expense-ratio-impact",
  },
  {
    id: "volatility",
    tier: "intermediate",
    term: "Volatility",
    short: "How much and how quickly a stock's price swings.",
    body: "Volatility measures the size and frequency of a stock's price movements. High-volatility stocks can swing 5-10% in a single week. Low-volatility stocks move more slowly and predictably. Volatility is often measured by standard deviation — the wider the price swings, the higher the number. It is also what beta tries to capture relative to the market.",
    whyItMatters: "Volatility is not the same as risk, though they overlap. A volatile stock can be a great long-term investment if the underlying business is sound. The real risk is selling in a panic during a volatile period. Understanding your tolerance for volatility is key to building a portfolio you can stick with.",
    related: ["beta", "drawdown", "risk-vs-return"],
    nextConcept: "beta",
  },
  {
    id: "drawdown",
    tier: "intermediate",
    term: "Drawdown",
    short: "How far your portfolio falls from its peak before recovering.",
    body: "A drawdown is the decline from a portfolio's peak value to its lowest point before recovering. If your account hits $100,000, then drops to $75,000 before climbing back, that is a 25% drawdown. Every investment goes through drawdowns — even the best ones. The key question is how deep and how long they last.",
    whyItMatters: "Drawdowns test your emotional resilience. A 50% drop requires a 100% gain to get back to even. Understanding that drawdowns are normal — and that markets have always recovered from every drawdown in history — is what separates investors who succeed from those who panic-sell at the bottom.",
    related: ["volatility", "bull-bear-market", "risk-vs-return"],
    nextConcept: "bull-bear-market",
  },
  {
    id: "ebitda",
    tier: "intermediate",
    term: "EBITDA",
    short: "Earnings before interest, taxes, depreciation, and amortization.",
    body: "EBITDA is a measure of a company's operating performance. It strips out costs that can vary based on financing decisions (interest), government policy (taxes), and accounting choices (depreciation). The idea is to show how much cash the business generates from its core operations before these outside factors. It is not a GAAP (official accounting) metric, but it is widely used.",
    whyItMatters: "EBITDA is useful for comparing companies in the same industry because it removes differences in capital structure and tax situations. However, it can be misleading — companies with heavy debt or equipment costs can look healthier on an EBITDA basis than they really are. It works best alongside free cash flow.",
    related: ["free-cash-flow", "enterprise-value", "revenue-vs-profit"],
  },
  {
    id: "yoy",
    tier: "intermediate",
    term: "Year over year (YoY)",
    short: "Comparing the same period across different years to see real trends.",
    body: "Year-over-year (YoY) compares a metric (revenue, earnings, users) for one period against the same period one year earlier. If a company reports $1.1 billion in revenue this quarter and $1 billion in the same quarter last year, that is 10% YoY growth. Comparing against the previous quarter (quarter-over-quarter, or QoQ) can be misleading due to seasonal patterns — retailers always do more business in Q4, for example.",
    whyItMatters: "YoY is the standard way to measure growth because it removes seasonal distortions. When analysts ask \"How fast is the company growing?\" they almost always mean YoY. Run rates based on a single quarter can overstate or understate the real trajectory.",
    related: ["run-rate", "revenue-vs-profit"],
  },
  {
    id: "run-rate",
    tier: "intermediate",
    term: "Run rate",
    short: "Taking a short period's results and projecting it to a full year.",
    body: "Run rate takes a company's revenue from one month or quarter and multiplies it to estimate annual revenue. If a company made $50 million in January, its run rate would be $600 million ($50M × 12). It is a rough approximation, not a forecast — it assumes the business keeps performing exactly the same way, which rarely happens.",
    whyItMatters: "Run rate is useful for fast-growing or newly public companies that do not have a full year of data. But it can be misleading if the period is unusual (a holiday month, a product launch quarter). It is best treated as a starting point, not a reliable prediction.",
    related: ["yoy", "revenue-vs-profit"],
  },
  {
    id: "etf",
    tier: "intermediate",
    term: "ETF",
    short: "A basket of investments you buy and sell like a single stock.",
    body: "An exchange-traded fund (ETF) holds a collection of stocks, bonds, or other assets and trades on a stock exchange throughout the day. Unlike mutual funds, which price once at market close, ETF prices change in real time as they are bought and sold. Most ETFs passively track an index (like the S&P 500), which keeps costs very low.",
    whyItMatters: "ETFs have revolutionized investing by making diversification cheap and easy. You can buy a single ETF and instantly own hundreds of companies across multiple countries and sectors. Combined with low expense ratios (often 0.03-0.10%), ETFs are the default building block for most modern portfolios.",
    related: ["expense-ratio", "diversification", "market-index"],
  },
  {
    id: "sector-industry",
    tier: "intermediate",
    term: "Sector vs industry",
    short: "Sector is broad; industry is specific.",
    body: "In investing, a sector is a broad category of the economy (Technology, Healthcare, Energy, Financials, etc.). An industry is a more specific group within a sector. For example, Apple is in the Technology sector but the Consumer Electronics industry. Tesla is in the Consumer Cyclical sector but the Auto Manufacturers industry. The Global Industry Classification Standard (GICS) divides the market into 11 sectors and 69 industries.",
    whyItMatters: "A diversified portfolio spreads across multiple sectors — not just within one. If you only own technology stocks and the tech sector drops, your whole portfolio suffers. Knowing which sectors you own helps you spot concentration risk.",
    related: ["diversification", "market-index"],
  },
  {
    id: "eps",
    tier: "intermediate",
    term: "Earnings per share (EPS)",
    short: "Company profit divided by total shares — profit per share.",
    body: "Earnings per share (EPS) is a company's net profit divided by the number of outstanding shares. If a company earns $10 billion and has 5 billion shares, its EPS is $2.00. EPS is the \"E\" in P/E ratio. Companies that grow their EPS year after year tend to see their stock prices rise over time.",
    whyItMatters: "EPS is the single most watched measure of profitability. Rising EPS suggests the business is growing and becoming more profitable. Falling EPS can signal trouble. Investors often compare a company's actual EPS to analyst expectations — big misses or beats can move the stock sharply.",
    related: ["pe-ratio", "revenue-vs-profit"],
  },
  {
    id: "price-to-book",
    tier: "intermediate",
    term: "Price to book (P/B)",
    short: "Stock price divided by the company's accounting value per share.",
    body: "The price-to-book (P/B) ratio compares a company's market value to its book value (assets minus liabilities, as recorded on the balance sheet). A P/B of 1 means the stock trades for exactly what the company's net assets are worth on paper. A P/B below 1 can mean the stock is undervalued — or that the market thinks the assets are worth less than stated. A high P/B often indicates a company with lots of intangible value (brand, technology) not captured on the balance sheet.",
    whyItMatters: "P/B is most useful for valuing financial companies (banks, insurers) and asset-heavy businesses. For technology or service companies with mostly intangible assets, P/B is less meaningful. It works best alongside P/E and other valuation metrics.",
    related: ["pe-ratio", "enterprise-value", "moat"],
  },
  {
    id: "free-cash-flow",
    tier: "intermediate",
    term: "Free cash flow",
    short: "Cash a company generates after paying for operations and investments.",
    body: "Free cash flow (FCF) is the cash a business produces after covering its operating expenses and capital expenditures (money spent on equipment, buildings, or upgrades). It is the cash available to pay dividends, buy back stock, pay down debt, or reinvest. Unlike earnings, which can be affected by accounting rules, free cash flow is harder to manipulate.",
    whyItMatters: "Free cash flow is a strong indicator of a company's financial health. A company that consistently generates growing free cash flow has options — it can reward shareholders, make acquisitions, or weather downturns. Negative free cash flow is not always bad (fast-growing companies often reinvest everything), but it needs a good explanation.",
    related: ["ebitda", "dcf", "moat"],
    resources: [
      { kind: "book", title: "Warren Buffett and the Interpretation of Financial Statements", creator: "Mary Buffett" },
    ],
  },
  {
    id: "revenue-vs-profit",
    tier: "intermediate",
    term: "Revenue vs profit",
    short: "Revenue is what comes in. Profit is what you keep.",
    body: "Revenue (or sales) is the total money a company brings in from selling its products or services. Profit (or net income) is what remains after subtracting all costs — cost of goods sold, salaries, rent, marketing, interest, taxes. A company can have billions in revenue and still lose money (many startups do this intentionally while growing). Conversely, a company can have modest revenue and strong profits if its margins are high.",
    whyItMatters: "Revenue shows scale and growth. Profit shows efficiency and sustainability. Healthy companies grow both. A company growing revenue but losing more money each quarter has a different risk profile than one growing revenue profitably. Understanding the difference helps you evaluate what a company's financials are actually saying.",
    related: ["eps", "free-cash-flow", "yoy"],
  },
  {
    id: "active-vs-passive",
    tier: "intermediate",
    term: "Active vs passive investing",
    short: "Picking stocks yourself versus buying the whole market.",
    body: "Active investing means trying to beat the market by picking individual stocks, timing entries and exits, and making frequent trades. Passive investing means buying and holding broad market index funds or ETFs, accepting whatever return the market delivers. For decades, the evidence has shown that most active investors — including most professional fund managers — fail to beat their benchmark index over long periods.",
    whyItMatters: "The decision between active and passive is one of the most fundamental investing choices. Passive is simpler, cheaper, and historically more reliable for most people. Active can be rewarding if you have the time, temperament, and skill — but it requires research, discipline, and accepting that you will frequently be wrong.",
    related: ["what-is-etf", "expense-ratio", "market-index"],
    resources: [
      { kind: "book", title: "The Simple Path to Wealth", creator: "JL Collins" },
    ],
  },
  {
    id: "limit-vs-market-order",
    tier: "intermediate",
    term: "Market vs limit orders",
    short: "Market = buy now at any price. Limit = buy only at your price.",
    body: "A market order tells your broker to buy or sell a stock immediately at the best available price. It executes quickly but the price may be slightly different from what you last saw (especially for volatile or low-volume stocks). A limit order tells your broker to buy or sell only at a specific price (or better). It may take days or weeks to fill, or never fill if the price never reaches your limit.",
    whyItMatters: "For large, liquid stocks like Apple or Microsoft, market orders are usually fine. For smaller stocks or volatile moments, limit orders protect you from getting a bad price (slippage). Most brokers default to market orders, but knowing when to use a limit order can save you money.",
    related: ["volatility", "brokerage-account"],
  },
  {
    id: "expense-ratio-impact",
    tier: "intermediate",
    term: "How fees compound",
    short: "A small fee difference can cost you tens of thousands over decades.",
    body: "Investment fees are deceptive because they are small percentages that sound trivial — until you see what they cost over 30 years. If you invest $10,000 and add $500/month with a 7% return, a 1% expense ratio costs you about $100,000 over 30 years compared to a 0.03% fee. That $100,000 would have been your money, compounding in your account.",
    whyItMatters: "This is why the expense ratio is often the single most important number to look at when choosing an ETF or mutual fund. A difference of 0.5% that sounds tiny can mean the difference between a comfortable retirement and a strained one. Every dollar you pay in fees is a dollar that stops compounding for you.",
    related: ["expense-ratio", "compound-interest", "what-is-etf"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Advanced (8)
// ─────────────────────────────────────────────────────────────────────────────

const ADVANCED: Concept[] = [
  {
    id: "dcf",
    tier: "advanced",
    term: "Discounted cash flow (DCF)",
    short: "Estimating a company's value based on its future cash flows.",
    body: "A discounted cash flow (DCF) model estimates what a company is worth today by projecting its future cash flows and then discounting them back to present value using an expected rate of return. The idea is that $1 of cash next year is worth less than $1 today (the time value of money), so future cash flows are discounted accordingly. DCF is the most theoretically sound valuation method — and also the most sensitive to assumptions.",
    whyItMatters: "DCF is the gold standard for intrinsic valuation. It forces you to think about what a business actually produces, not just what its stock price is doing. But small changes in assumptions (growth rate, discount rate) can produce wildly different values, so it is best used as a range rather than a precise number.",
    related: ["free-cash-flow", "time-value-money", "wacc"],
    resources: [
      { kind: "book", title: "Investment Valuation", creator: "Aswath Damodaran" },
      { kind: "course", title: "Damodaran's Valuation Course (online)", creator: "Aswath Damodaran" },
    ],
  },
  {
    id: "correlation",
    tier: "advanced",
    term: "Correlation",
    short: "How two investments move relative to each other — from -1 to +1.",
    body: "Correlation measures whether two assets tend to move together. A correlation of +1 means they move in perfect lockstep. -1 means they move in opposite directions. 0 means no relationship. For example, two large-cap US tech stocks might have a correlation of 0.85 (they usually move together). Gold and stocks might have a correlation near 0 (no consistent relationship).",
    whyItMatters: "Correlation is the mathematical foundation of diversification. By combining assets with low or negative correlations, you can build a portfolio that has less overall volatility than any single holding. The catch: correlations change during crises, often moving toward 1 when you need diversification the most.",
    related: ["diversification", "beta", "risk-vs-return"],
  },
  {
    id: "sharpe-ratio",
    tier: "advanced",
    term: "Sharpe ratio",
    short: "Return per unit of risk — measures how efficiently you are being compensated.",
    body: "The Sharpe ratio divides an investment's excess return (return above a risk-free rate, like Treasury bills) by its volatility (standard deviation). A Sharpe ratio of 1 means you are getting one unit of return for each unit of risk. Above 1 is good; above 2 is very good. Below 0.5 means you are taking on risk without proportional reward.",
    whyItMatters: "The Sharpe ratio lets you compare investments on a risk-adjusted basis. A stock that returned 15% with high volatility might have a lower Sharpe ratio than a bond that returned 8% with very low volatility. For portfolio construction, maximizing the Sharpe ratio is a common goal — it means you are getting the most return for the least risk.",
    related: ["risk-vs-return", "volatility", "diversification"],
  },
  {
    id: "enterprise-value",
    tier: "advanced",
    term: "Enterprise value (EV)",
    short: "What it would cost to buy the entire company — debt and all.",
    body: "Enterprise value (EV) is the total value of a company, including what equity holders own (market cap) plus what debt holders are owed (total debt minus cash). If you bought a company for its market cap, you would also inherit its debt — so EV gives the full picture. EV = market cap + total debt - cash.",
    whyItMatters: "EV is a more complete valuation measure than market cap because it accounts for capital structure. Two companies can have the same market cap, but the one with more debt is riskier and effectively more expensive to acquire. EV/EBITDA is a common valuation multiple that uses enterprise value instead of market cap.",
    related: ["market-cap", "ebitda", "dcf"],
  },
  {
    id: "convexity",
    tier: "advanced",
    term: "Convexity",
    short: "An investment that benefits more from upside than it gets hurt by downside.",
    body: "Convexity describes an asymmetric payoff structure — when an investment gains more from favorable moves than it loses from unfavorable ones. The term comes from bond math but applies broadly. A venture capital portfolio is convex: most investments go to zero, but the winners can return 100x. An out-of-the-money call option is convex: limited downside (the premium paid), unlimited upside.",
    whyItMatters: "Convexity is a powerful concept for risk management and portfolio design. Nassim Taleb popularized the idea of building portfolios with positive convexity — owning things that benefit from volatility and tail events. These positions can lose small amounts regularly but deliver outsized gains during crises, acting as portfolio insurance.",
    related: ["options-basics", "risk-vs-return", "correlation"],
  },
  {
    id: "options-basics",
    tier: "advanced",
    term: "Options basics",
    short: "Contracts that give you the right, but not the obligation, to buy or sell a stock.",
    body: "Options are contracts that let you buy (call) or sell (put) a stock at a specific price (strike price) by a specific date (expiration). A call option profits if the stock rises above the strike price. A put option profits if the stock falls below it. You pay a premium upfront for the option. Unlike stocks, options expire — if the stock does not move in your direction before expiration, the option becomes worthless and you lose the premium.",
    whyItMatters: "Options are versatile tools for hedging (protecting against downside), generating income (selling covered calls), or speculating with leverage. But they are complex and risky — most retail traders lose money on options. They should only be used after you have a solid grasp of stocks and basic investing.",
    related: ["convexity", "volatility", "risk-vs-return"],
  },
  {
    id: "wacc",
    tier: "advanced",
    term: "Weighted average cost of capital (WACC)",
    short: "The blended rate a company pays to borrow money from all sources.",
    body: "WACC is the average rate a company must pay to all its capital providers — both debt holders (interest on loans) and equity holders (expected return on stock). If a company's WACC is 8%, any investment it makes needs to earn more than 8% to create value. WACC is used as the discount rate in DCF models because it represents the company's cost of money.",
    whyItMatters: "WACC is a critical benchmark for capital allocation. A company that consistently earns returns above its WACC is creating value. One that earns below WACC is destroying it. For investors, comparing a company's return on invested capital (ROIC) to its WACC tells you whether the business model actually works.",
    related: ["dcf", "enterprise-value", "free-cash-flow"],
  },
  {
    id: "technical-vs-fundamental",
    tier: "advanced",
    term: "Technical vs fundamental analysis",
    short: "Fundamental looks at the business. Technical looks at the chart.",
    body: "Fundamental analysis evaluates a stock by studying the underlying business — revenue, earnings, competitive advantage, management, industry trends. The goal is to estimate what the company is really worth and buy when the stock trades below that value. Technical analysis ignores the business entirely and studies price patterns, volume, and chart formations to predict where the stock is heading next.",
    whyItMatters: "Most long-term investors use fundamental analysis to decide what to buy. Technical analysis is more common among traders and shorter time horizons. Neither is inherently superior — Warren Buffett is a pure fundamentalist; many successful traders use only technicals. Understanding both helps you evaluate different approaches and find what fits your personality.",
    related: ["moat", "pe-ratio", "dcf"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

const ALL: Concept[] = [...FOUNDATIONAL, ...INTERMEDIATE, ...ADVANCED];

const BY_ID: Record<string, Concept> = {};
for (const c of ALL) BY_ID[c.id] = c;

export function conceptById(id: ConceptId): Concept | undefined {
  return BY_ID[id];
}

export function allConcepts(): Concept[] {
  return ALL;
}

export function conceptsByTier(tier: ConceptTier): Concept[] {
  return ALL.filter((c) => c.tier === tier);
}

export function conceptsByIds(ids: ConceptId[]): Concept[] {
  return ids.map((id) => BY_ID[id]).filter(Boolean);
}
