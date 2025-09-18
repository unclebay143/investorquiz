import { Author, Topic } from "@/types";

// Example authors who created these exams
export const MOCK_AUTHORS: { [key: string]: Author } = {
  "sarah-chen": {
    id: "sarah-chen",
    name: "Dr. Sarah Chen",
    title: "CFA, Former Goldman Sachs VP",
    bio: "15+ years in investment banking and portfolio management. Expert in equity analysis and market strategies.",
    profileImage: "https://github.com/unclebay143.png",
    socialLinks: {
      linkedin: "https://linkedin.com/in/sarah-chen-cfa",
      twitter: "https://twitter.com/sarahchen_cfa",
    },
    books: [
      { title: "Modern Portfolio Theory in Practice", year: 2022 },
      { title: "Equity Analysis Fundamentals", year: 2020 },
    ],
    quote: "Understanding the fundamentals is key to successful investing.",
  },
  "michael-rodriguez": {
    id: "michael-rodriguez",
    name: "Michael Rodriguez",
    title: "Senior Bond Trader, JP Morgan",
    bio: "Specialized in fixed income securities and credit risk analysis with over 12 years of trading experience.",
    profileImage: "https://github.com/unclebay143.png",
    socialLinks: {
      linkedin: "https://linkedin.com/in/michael-rodriguez-trader",
      website: "https://www.bondinsights.com",
    },
    books: [{ title: "Bond Market Dynamics", year: 2021 }],
    quote: "Bonds are the foundation of any well-diversified portfolio.",
  },
  "jennifer-kim": {
    id: "jennifer-kim",
    name: "Jennifer Kim",
    title: "ETF Specialist, Vanguard",
    bio: "Leading expert in exchange-traded funds and passive investing strategies. Former BlackRock portfolio manager.",
    profileImage: "https://github.com/unclebay143.png",
    socialLinks: {
      linkedin: "https://linkedin.com/in/jennifer-kim-etf",
      twitter: "https://twitter.com/jkim_etf",
    },
    books: [
      { title: "The ETF Revolution", year: 2023 },
      { title: "Passive Investing Made Simple", year: 2021 },
    ],
    quote: "ETFs democratize access to sophisticated investment strategies.",
  },
};

export const MOCK_TOPICS: Topic[] = [
  {
    id: "stocks",
    title: "Stocks",
    description: "Equities, tickers, dividends, market caps.",
    isNew: true,
    exams: [
      {
        id: "buying-stocks",
        title: "Buying Stocks",
        description:
          "Test your knowledge of purchasing stocks, market orders, and timing strategies.",
        totalPoints: 100,
        reviewMode: "post",
        isNew: true,
        author: MOCK_AUTHORS["sarah-chen"],
        questions: [
          {
            id: 1,
            prompt: "What is the primary purpose of a stock market?",
            options: {
              A: "To provide loans to companies",
              B: "To enable buying and selling of company shares",
              C: "To regulate company operations",
              D: "To provide insurance for investments",
            },
            correctKey: "B",
            explanation:
              "Stock markets provide a venue for investors to buy and sell ownership shares of companies, facilitating price discovery and liquidity.",
          },
          {
            id: 2,
            prompt: "Which of the following represents ownership in a company?",
            options: {
              A: "Bond",
              B: "Stock",
              C: "Certificate of Deposit",
              D: "Savings Account",
            },
            correctKey: "B",
            explanation:
              "Stocks (equities) represent partial ownership in a company; bonds are debt instruments.",
          },
        ],
      },
      {
        id: "selling-stocks",
        title: "Selling Stocks",
        description:
          "Assess your understanding of when and how to sell stock positions.",
        totalPoints: 50,
        reviewMode: "post",
        questions: [
          {
            id: 1,
            prompt: "What is a stop-loss order?",
            options: {
              A: "An order to buy at a specific price",
              B: "An order to sell when price drops below a threshold",
              C: "An order to hold stocks indefinitely",
              D: "An order to buy more shares",
            },
            correctKey: "B",
            explanation:
              "A stop-loss converts to a market (or limit) sell order once price crosses your specified stop, helping limit downside risk.",
          },
        ],
      },
      {
        id: "financial-analysis",
        title: "Financial Analysis",
        description:
          "Test your ability to analyze company fundamentals and financial statements.",
        totalPoints: 80,
        reviewMode: "post",
        author: MOCK_AUTHORS["sarah-chen"],
        retakeSettings: {
          enabled: true,
          maxAttempts: 2,
          cooldownDays: 0.0001, // ~5 seconds for testing
        },
        questions: [
          {
            id: 1,
            prompt: "What does P/E ratio measure?",
            options: {
              A: "Company's debt level",
              B: "Price relative to earnings per share",
              C: "Company's revenue growth",
              D: "Number of employees",
            },
            correctKey: "B",
            explanation:
              "P/E shows how much investors pay for each dollar of earnings, often used to compare valuation across companies.",
          },
        ],
      },
    ],
  },
  {
    id: "bonds",
    title: "Bonds",
    description: "Coupons, yields, duration, credit risk.",
    exams: [
      {
        id: "bond-basics",
        title: "Bond Basics",
        description:
          "Test your knowledge of bond fundamentals and terminology.",
        totalPoints: 60,
        reviewMode: "post",
        author: MOCK_AUTHORS["michael-rodriguez"],
        retakeSettings: {
          enabled: true,
          maxAttempts: 2,
          cooldownDays: 0.0001, // ~5 seconds for testing
        },
        questions: [
          {
            id: 1,
            prompt: "What is a bond coupon?",
            options: {
              A: "The bond's market price",
              B: "The interest payment on the bond",
              C: "The bond's maturity date",
              D: "The bond's credit rating",
            },
            correctKey: "B",
            explanation:
              "The coupon is the periodic interest payment, typically a fixed percentage of the bond's face value.",
          },
        ],
      },
    ],
  },
  {
    id: "funds",
    title: "Funds",
    description: "ETFs, mutual funds, index vs active.",
    exams: [
      {
        id: "etf-fundamentals",
        title: "ETF Fundamentals",
        description:
          "Test your understanding of exchange-traded funds and their characteristics.",
        totalPoints: 40,
        reviewMode: "post",
        author: MOCK_AUTHORS["jennifer-kim"],
        retakeSettings: {
          enabled: true,
          maxAttempts: 2,
          cooldownDays: 0.0001, // ~5 seconds for testing
        },
        questions: [
          {
            id: 1,
            prompt: "What does ETF stand for?",
            options: {
              A: "Exchange-Traded Fund",
              B: "Electronic Trading Fund",
              C: "Equity Trading Fund",
              D: "Exchange Transfer Fund",
            },
            correctKey: "A",
            explanation:
              "ETFs trade on exchanges like stocks and hold baskets of assets, offering diversification and intraday liquidity.",
          },
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Order Types",
    description: "Market, limit, stop, stop-limit.",
    exams: [],
  },
  {
    id: "risk",
    title: "Risk",
    description: "Volatility, beta, diversification, drawdowns.",
    exams: [],
  },
  {
    id: "statements",
    title: "Financial Statements",
    description: "Income, balance sheet, cash flow.",
    exams: [],
  },
];
