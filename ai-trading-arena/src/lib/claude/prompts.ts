import type { RiskParams } from "@/types/database";

/**
 * Build the system prompt for a trading agent
 */
export function buildSystemPrompt(
  agentName: string,
  customPrompt: string,
  riskParams: RiskParams
): string {
  return `You are "${agentName}", an AI trading agent competing in the AI Trading Arena.

## Your Core Strategy
${customPrompt}

## Risk Parameters (MUST FOLLOW)
- Stop Loss: ${riskParams.stop_loss_pct}% - Exit any position that drops by this amount
- Max Position Size: ${riskParams.max_position_pct}% - Never allocate more than this to a single stock
- Max Trades Per Day: ${riskParams.max_trades_per_day} - Limit daily trading activity

## Response Format
You MUST respond with valid JSON in exactly this format:
\`\`\`json
{
  "action": "BUY" | "SELL" | "HOLD",
  "ticker": "SYMBOL",
  "confidence": 0.0-1.0,
  "reasoning": "Your detailed analysis explaining why you made this decision...",
  "news_summary": "Brief 1-2 sentence summary of the most relevant news...",
  "risk_assessment": "Low" | "Medium" | "High"
}
\`\`\`

## Rules
1. ONLY output the JSON block - no additional text before or after
2. "ticker" should be a valid US stock symbol (e.g., AAPL, MSFT, GOOGL)
3. "confidence" should reflect how certain you are (0.5 = uncertain, 0.9 = very confident)
4. If no clear opportunity exists, choose "HOLD" with appropriate reasoning
5. Consider your risk parameters when making decisions
6. Be specific in your reasoning - reference actual news and data

## Important
- You are paper trading with $100,000 starting capital
- Your performance is tracked on a public leaderboard
- Other AI agents are competing against you
- Make decisions that maximize risk-adjusted returns`;
}

/**
 * Build the portfolio context string
 */
export function buildPortfolioContext(
  currentValue: number,
  cashAvailable: number,
  positions: Array<{
    ticker: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
  }>,
  recentTrades: Array<{
    action: string;
    ticker: string;
    timestamp: string;
  }>
): string {
  const positionsStr =
    positions.length > 0
      ? positions
          .map(
            (p) =>
              `- ${p.ticker}: ${p.quantity} shares @ $${p.avgPrice.toFixed(2)} avg (current: $${p.currentPrice.toFixed(2)})`
          )
          .join("\n")
      : "No current positions";

  const recentTradesStr =
    recentTrades.length > 0
      ? recentTrades
          .slice(0, 5)
          .map((t) => `- ${t.action} ${t.ticker} on ${new Date(t.timestamp).toLocaleDateString()}`)
          .join("\n")
      : "No recent trades";

  return `**Portfolio Value:** $${currentValue.toLocaleString()}
**Cash Available:** $${cashAvailable.toLocaleString()}

**Current Positions:**
${positionsStr}

**Recent Trades:**
${recentTradesStr}`;
}

/**
 * Build the news context string from Finnhub news items
 */
export function buildNewsContext(
  news: Array<{
    headline: string;
    summary: string;
    source: string;
    datetime: number;
    related?: string;
  }>
): string {
  if (news.length === 0) {
    return "No recent news available.";
  }

  return news
    .slice(0, 10) // Limit to 10 most recent
    .map((item, i) => {
      const date = new Date(item.datetime * 1000).toLocaleString();
      const related = item.related ? ` [${item.related}]` : "";
      return `### News ${i + 1}${related}
**${item.headline}**
Source: ${item.source} | ${date}
${item.summary}`;
    })
    .join("\n\n");
}

/**
 * Parse Claude's response into a structured trade decision
 */
export interface TradeDecision {
  action: "BUY" | "SELL" | "HOLD";
  ticker: string;
  confidence: number;
  reasoning: string;
  news_summary: string;
  risk_assessment: "Low" | "Medium" | "High";
}

export function parseTradeDecision(response: string): TradeDecision | null {
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    const parsed = JSON.parse(jsonStr.trim());

    // Validate required fields
    if (!parsed.action || !["BUY", "SELL", "HOLD"].includes(parsed.action)) {
      console.error("Invalid action in response:", parsed.action);
      return null;
    }

    if (!parsed.ticker || typeof parsed.ticker !== "string") {
      console.error("Invalid ticker in response:", parsed.ticker);
      return null;
    }

    if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 1) {
      console.error("Invalid confidence in response:", parsed.confidence);
      return null;
    }

    return {
      action: parsed.action,
      ticker: parsed.ticker.toUpperCase(),
      confidence: parsed.confidence,
      reasoning: parsed.reasoning || "No reasoning provided",
      news_summary: parsed.news_summary || "No summary provided",
      risk_assessment: parsed.risk_assessment || "Medium",
    };
  } catch (err) {
    console.error("Failed to parse trade decision:", err);
    console.error("Raw response:", response);
    return null;
  }
}
