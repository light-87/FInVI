/**
 * Perplexity Sonar API Client
 * Provides AI-powered real-time news search with citations
 */

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

interface PerplexityNewsResult {
  news: NewsItem[];
  rawContent: string;
  citations: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Search for financial news using Perplexity Sonar API
 */
export async function searchFinancialNews(
  query: string,
  options?: {
    model?: "sonar" | "sonar-pro";
    maxResults?: number;
  }
): Promise<PerplexityNewsResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.error("PERPLEXITY_API_KEY not set");
    return {
      news: [],
      rawContent: "",
      citations: [],
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  const model = options?.model || "sonar";
  const maxResults = options?.maxResults || 10;

  // System prompt focused on NEWS ONLY - no analysis or recommendations
  const systemPrompt = `You are a financial news aggregator. Your ONLY job is to find and report the latest relevant news articles.

IMPORTANT RULES:
1. ONLY return factual news items - headlines and brief summaries
2. DO NOT provide investment advice, buy/sell recommendations, or analysis
3. DO NOT suggest whether stocks are good investments
4. DO NOT include your opinions about market direction
5. Focus on finding the most recent and relevant news matching the search criteria

FORMAT: Return each news item as:
- A clear headline
- A 2-3 sentence factual summary of what happened
- The source name

Return up to ${maxResults} of the most relevant and recent news items.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.1,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const citations = data.citations || [];

    // Parse the content into structured news items
    const news = parsePerplexityNewsResponse(content, citations);

    console.log(`[Perplexity] Fetched ${news.length} news items using ${model}`);

    return {
      news,
      rawContent: content,
      citations,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  } catch (error) {
    console.error("Error fetching news from Perplexity:", error);
    return {
      news: [],
      rawContent: "",
      citations: [],
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}

/**
 * Parse Perplexity's text response into structured news items
 */
function parsePerplexityNewsResponse(content: string, citations: string[]): NewsItem[] {
  const news: NewsItem[] = [];
  const now = Math.floor(Date.now() / 1000);

  // Split content into potential news items
  // Look for patterns like numbered items, bullet points, or headline-summary pairs
  const lines = content.split("\n").filter((line) => line.trim());

  let currentItem: Partial<NewsItem> | null = null;
  let itemIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this looks like a headline (starts with number, bullet, or is bold/strong)
    const isHeadline =
      /^(?:\d+[\.\)]|\*|-|•)/.test(trimmedLine) ||
      /^\*\*/.test(trimmedLine) ||
      /^#{1,3}\s/.test(trimmedLine);

    if (isHeadline && trimmedLine.length > 20) {
      // Save previous item if exists
      if (currentItem?.headline) {
        news.push(finalizeNewsItem(currentItem, itemIndex, now, citations));
        itemIndex++;
      }

      // Start new item
      const headline = trimmedLine
        .replace(/^(?:\d+[\.\)]\s*)?/, "") // Remove numbering
        .replace(/^\*\*|\*\*$/g, "") // Remove bold markers
        .replace(/^#{1,3}\s*/, "") // Remove markdown headers
        .replace(/^[-•*]\s*/, "") // Remove bullet points
        .trim();

      currentItem = {
        headline,
        summary: "",
        source: extractSourceFromLine(trimmedLine) || "Perplexity",
      };
    } else if (currentItem) {
      // This is likely summary content
      const summaryLine = trimmedLine
        .replace(/^(?:Summary|Description|Details):\s*/i, "")
        .replace(/^\*\*Source\*\*:.*$/i, "")
        .trim();

      if (summaryLine && !summaryLine.toLowerCase().startsWith("source:")) {
        currentItem.summary = currentItem.summary
          ? `${currentItem.summary} ${summaryLine}`
          : summaryLine;
      }

      // Extract source if mentioned
      const sourceMatch = trimmedLine.match(/(?:Source|From|Via):\s*([^\n,]+)/i);
      if (sourceMatch) {
        currentItem.source = sourceMatch[1].trim();
      }
    }
  }

  // Don't forget the last item
  if (currentItem?.headline) {
    news.push(finalizeNewsItem(currentItem, itemIndex, now, citations));
  }

  // If parsing failed, create a single news item from the raw content
  if (news.length === 0 && content.length > 50) {
    news.push({
      id: 1,
      headline: "Latest Market News Summary",
      summary: content.slice(0, 500),
      source: "Perplexity AI",
      datetime: now,
      related: "",
      url: citations[0] || "",
      image: "",
    });
  }

  return news;
}

/**
 * Finalize a news item with all required fields
 */
function finalizeNewsItem(
  item: Partial<NewsItem>,
  index: number,
  timestamp: number,
  citations: string[]
): NewsItem {
  // Try to extract ticker symbols from headline/summary
  const combinedText = `${item.headline || ""} ${item.summary || ""}`;
  const tickerMatch = combinedText.match(
    /\b([A-Z]{1,5})\b(?:\s+(?:stock|shares|Corp|Inc|Ltd))?/g
  );
  const relatedTickers = tickerMatch
    ? [...new Set(tickerMatch.map((t) => t.split(/\s/)[0]))]
        .filter((t) => t.length >= 2 && t.length <= 5)
        .slice(0, 3)
        .join(",")
    : "";

  return {
    id: index + 1,
    headline: item.headline || "Market Update",
    summary: item.summary || item.headline || "",
    source: item.source || "Perplexity",
    datetime: timestamp - index * 600, // Stagger timestamps slightly
    related: relatedTickers,
    url: citations[index] || citations[0] || "",
    image: "",
  };
}

/**
 * Extract source name from a line of text
 */
function extractSourceFromLine(line: string): string | null {
  const sourcePatterns = [
    /\(([^)]+)\)\s*$/,
    /—\s*([^—]+)\s*$/,
    /-\s*([^-]+)\s*$/,
  ];

  for (const pattern of sourcePatterns) {
    const match = line.match(pattern);
    if (match && match[1].length < 50) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Build a search query for stock market news based on agent's investment focus
 */
export function buildStockNewsQuery(options: {
  agentDescription?: string;
  tickers?: string[];
}): string {
  const { agentDescription, tickers } = options;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let query = `Find the latest financial news as of ${today}. `;

  // Use agent description as the primary search focus
  if (agentDescription && agentDescription.trim()) {
    query += `

SEARCH FOCUS: ${agentDescription}

Find news articles that are most relevant to this investment focus. `;
  }

  // Add portfolio tickers as secondary context
  if (tickers && tickers.length > 0) {
    query += `Also include any recent news about these stocks I currently hold: ${tickers.join(", ")}. `;
  }

  query += `

Return only factual news headlines and summaries. Do not recommend whether to buy or sell anything.`;

  return query;
}

/**
 * Get market news using Perplexity, tailored to agent's investment focus
 */
export async function getPerplexityMarketNews(options: {
  agentDescription?: string;
  tickers?: string[];
}): Promise<NewsItem[]> {
  const query = buildStockNewsQuery(options);

  console.log(`[Perplexity] Search query: ${query.slice(0, 200)}...`);

  const result = await searchFinancialNews(query, {
    model: "sonar",
    maxResults: 10,
  });
  return result.news;
}

/**
 * Get mock Perplexity news for testing (when API key not available)
 */
export function getMockPerplexityNews(): NewsItem[] {
  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: 1,
      headline: "Fed Signals Potential Rate Cuts in 2025 Amid Cooling Inflation",
      summary:
        "Federal Reserve officials indicated they may begin cutting interest rates in early 2025 as inflation continues to moderate toward the 2% target. Markets rallied on the dovish signals, with tech stocks leading gains.",
      source: "Reuters",
      datetime: now - 1800,
      related: "SPY,QQQ",
      url: "https://reuters.com",
      image: "",
    },
    {
      id: 2,
      headline: "NVIDIA Announces Next-Gen AI Chips, Stock Surges 5%",
      summary:
        "NVIDIA unveiled its latest Blackwell Ultra GPU architecture, promising 3x performance gains for AI training workloads. Analysts raised price targets citing continued AI infrastructure demand.",
      source: "Bloomberg",
      datetime: now - 3600,
      related: "NVDA,AMD",
      url: "https://bloomberg.com",
      image: "",
    },
    {
      id: 3,
      headline: "Apple Vision Pro Sales Exceed Expectations in Holiday Quarter",
      summary:
        "Apple reported stronger-than-expected Vision Pro sales during the holiday season, with the spatial computing device gaining traction in enterprise markets. Services revenue also hit record highs.",
      source: "CNBC",
      datetime: now - 5400,
      related: "AAPL",
      url: "https://cnbc.com",
      image: "",
    },
    {
      id: 4,
      headline: "Tesla Cybertruck Production Ramps Up, Delivery Backlog Clears",
      summary:
        "Tesla announced it has cleared its Cybertruck reservation backlog and is now accepting new orders with immediate delivery. Production at Gigafactory Texas has reached 2,500 units per week.",
      source: "MarketWatch",
      datetime: now - 7200,
      related: "TSLA",
      url: "https://marketwatch.com",
      image: "",
    },
    {
      id: 5,
      headline: "Microsoft Azure Revenue Growth Beats Estimates, Cloud Wars Intensify",
      summary:
        "Microsoft's cloud computing division reported 32% revenue growth, outpacing both AWS and Google Cloud. The company credited AI workloads and Copilot adoption for the acceleration.",
      source: "Wall Street Journal",
      datetime: now - 9000,
      related: "MSFT,AMZN,GOOGL",
      url: "https://wsj.com",
      image: "",
    },
  ];
}
