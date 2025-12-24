/**
 * Finnhub API Client
 * Provides access to market news and stock quotes
 */

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High of the day
  l: number; // Low of the day
  o: number; // Open price
  pc: number; // Previous close
  t: number; // Timestamp
}

interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  related: string;
  url: string;
  image: string;
}

/**
 * Fetch general market news
 */
export async function getMarketNews(category: string = "general"): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error("FINNHUB_API_KEY not set");
    return [];
  }

  try {
    const url = `${FINNHUB_BASE_URL}/news?category=${category}&token=${apiKey}`;
    // No caching - get fresh news each time
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data: FinnhubNewsItem[] = await response.json();
    console.log(`[Finnhub] Fetched ${data.length} news items for category: ${category}`);

    return data.map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      datetime: item.datetime,
      related: item.related,
      url: item.url,
      image: item.image,
    }));
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

/**
 * Fetch company-specific news
 */
export async function getCompanyNews(
  symbol: string,
  fromDate?: string,
  toDate?: string
): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error("FINNHUB_API_KEY not set");
    return [];
  }

  // Default to last 7 days
  const to = toDate || new Date().toISOString().split("T")[0];
  const from = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data: FinnhubNewsItem[] = await response.json();

    return data.slice(0, 20).map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      datetime: item.datetime,
      related: item.related || symbol,
      url: item.url,
      image: item.image,
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch stock quote
 */
export async function getQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error("FINNHUB_API_KEY not set");
    return null;
  }

  try {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data: FinnhubQuote = await response.json();

    // Check if we got valid data (c = 0 means no data)
    if (data.c === 0) {
      console.error(`No quote data for ${symbol}`);
      return null;
    }

    return {
      symbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple stock quotes
 */
export async function getQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
  const quotes = new Map<string, StockQuote>();

  // Fetch quotes in parallel (be mindful of rate limits)
  const results = await Promise.all(symbols.map((symbol) => getQuote(symbol)));

  results.forEach((quote) => {
    if (quote) {
      quotes.set(quote.symbol, quote);
    }
  });

  return quotes;
}

/**
 * Get mock news for testing (when API key not available)
 */
export function getMockNews(): NewsItem[] {
  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: 1,
      headline: "Apple Reports Record Q4 Earnings, Beats Expectations",
      summary:
        "Apple Inc. reported quarterly revenue of $89.5 billion, exceeding analyst expectations. iPhone sales remained strong despite global economic headwinds, with Services revenue reaching an all-time high.",
      source: "Reuters",
      datetime: now - 3600,
      related: "AAPL",
      url: "#",
      image: "",
    },
    {
      id: 2,
      headline: "Federal Reserve Signals Pause in Rate Hikes",
      summary:
        "The Federal Reserve indicated it may pause interest rate increases, citing cooling inflation. Markets rallied on the news, with tech stocks leading gains.",
      source: "Bloomberg",
      datetime: now - 7200,
      related: "SPY",
      url: "#",
      image: "",
    },
    {
      id: 3,
      headline: "Microsoft Azure Growth Accelerates, Cloud Competition Intensifies",
      summary:
        "Microsoft's cloud computing division reported 29% year-over-year growth, outpacing expectations. The company continues to invest heavily in AI infrastructure.",
      source: "CNBC",
      datetime: now - 10800,
      related: "MSFT",
      url: "#",
      image: "",
    },
    {
      id: 4,
      headline: "Tesla Announces New Gigafactory in Texas Expansion",
      summary:
        "Tesla plans to double production capacity at its Austin facility, investing $5 billion in the expansion. The move is expected to create 10,000 new jobs.",
      source: "Wall Street Journal",
      datetime: now - 14400,
      related: "TSLA",
      url: "#",
      image: "",
    },
    {
      id: 5,
      headline: "NVIDIA Dominates AI Chip Market, Stock Hits New High",
      summary:
        "NVIDIA's data center revenue surged 171% as demand for AI training chips continues to outstrip supply. The company raised full-year guidance.",
      source: "Financial Times",
      datetime: now - 18000,
      related: "NVDA",
      url: "#",
      image: "",
    },
  ];
}

/**
 * Get mock quote for testing
 */
export function getMockQuote(symbol: string): StockQuote {
  const mockPrices: Record<string, number> = {
    AAPL: 178.5,
    MSFT: 378.25,
    GOOGL: 141.8,
    TSLA: 248.5,
    NVDA: 495.0,
    META: 355.6,
    AMZN: 178.25,
  };

  const price = mockPrices[symbol] || 100 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;

  return {
    symbol,
    currentPrice: price,
    change,
    changePercent: (change / price) * 100,
    high: price * 1.02,
    low: price * 0.98,
    open: price - change / 2,
    previousClose: price - change,
    timestamp: new Date(),
  };
}
