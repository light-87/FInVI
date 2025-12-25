import type { RiskParams, PortfolioSummary, PositionWithPnL } from "@/types/database";

/**
 * Build the system prompt for a trading agent
 */
export function buildSystemPrompt(
  agentName: string,
  customPrompt: string,
  riskParams: RiskParams
): string {
  return `You are "${agentName}", an AI trading agent competing in Vivy.

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
  "quantity": 10,
  "confidence": 0.0-1.0,
  "reasoning": "Your detailed analysis explaining why you made this decision...",
  "news_summary": "Brief 1-2 sentence summary of the most relevant news...",
  "risk_assessment": "Low" | "Medium" | "High"
}
\`\`\`

## Rules
1. ONLY output the JSON block - no additional text before or after
2. "ticker" should be a valid US stock symbol (e.g., AAPL, MSFT, GOOGL)
3. "quantity" is the number of shares to buy or sell (must be a positive integer)
4. "confidence" should reflect how certain you are (0.5 = uncertain, 0.9 = very confident)
5. Consider your risk parameters AND your available cash when making decisions
6. For SELL actions, you can only sell shares you currently own
7. For BUY actions, ensure total cost (quantity * price) doesn't exceed available cash
8. Be specific in your reasoning - reference actual news and data

## IMPORTANT: HOLD vs BUY/SELL Decision
- Choose "HOLD" ONLY if you have open positions and want to keep them unchanged
- For HOLD: set ticker to your MOST IMPORTANT current position (the one you're actively monitoring)
- If you have NO positions and see no buying opportunity: still choose "HOLD" with ticker set to a stock you're watching
- DO NOT recommend HOLD for stocks you don't own - that wastes analysis credits
- If a position has dropped below your stop-loss (${riskParams.stop_loss_pct}%), you MUST recommend SELL

## Priority Check (in order):
1. SELL any position that has dropped ${riskParams.stop_loss_pct}% or more (stop-loss triggered)
2. SELL any position where fundamentals have deteriorated
3. BUY if there's a strong opportunity within your strategy and risk limits
4. HOLD if current positions are performing well and no better opportunities exist

## Important
- Your trades will be executed with REAL position tracking
- You have actual positions that need to be managed
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
 * Build comprehensive portfolio context with real positions and P&L
 * This is the main function for real trading mode
 */
export function buildRealPortfolioContext(
  portfolio: PortfolioSummary,
  startingCapital: number
): string {
  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const formatPnL = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + formatMoney(n);
  };

  const formatPct = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  };

  // Build positions string
  let positionsStr: string;
  if (portfolio.positions.length === 0) {
    positionsStr = "  No open positions";
  } else {
    positionsStr = portfolio.positions
      .map((p: PositionWithPnL, i: number) => {
        return `  ${i + 1}. ${p.ticker} - ${p.quantity} shares @ $${p.entry_price.toFixed(2)} (current: $${p.current_price.toFixed(2)})
     Value: ${formatMoney(p.current_value)}
     Unrealized P&L: ${formatPnL(p.unrealized_pnl)} (${formatPct(p.unrealized_pnl_pct)})`;
      })
      .join("\n\n");
  }

  // Calculate total unrealized P&L
  const totalUnrealizedPnL = portfolio.positions.reduce(
    (sum: number, p: PositionWithPnL) => sum + p.unrealized_pnl,
    0
  );

  return `=== PORTFOLIO STATUS ===

CASH AVAILABLE: ${formatMoney(portfolio.cash)}

CURRENT POSITIONS:
${positionsStr}

PORTFOLIO SUMMARY:
  Total Value: ${formatMoney(portfolio.total_value)}
  Starting Capital: ${formatMoney(startingCapital)}
  Total Return: ${formatPct(portfolio.total_return_pct)}
  Unrealized P&L: ${formatPnL(totalUnrealizedPnL)}

========================`;
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
 * Build context about a previous recommendation to help AI avoid duplicates
 */
export function buildPreviousRecommendationContext(
  prevRecommendation: {
    action: string;
    ticker: string;
    quantity: number;
    reasoning: string;
    created_at: string;
  }
): string {
  const timeAgo = Math.round(
    (Date.now() - new Date(prevRecommendation.created_at).getTime()) / 60000
  );

  return `
=== PREVIOUS RECOMMENDATION (${timeAgo} minutes ago) ===
You previously suggested: ${prevRecommendation.action} ${prevRecommendation.quantity} shares of ${prevRecommendation.ticker}
Reasoning: "${prevRecommendation.reasoning}"

The user is requesting a FRESH analysis. Consider:
1. Has anything changed in the news or market that warrants a different recommendation?
2. Are there other opportunities you may have overlooked?
3. If conditions truly haven't changed, you may suggest the same action, but provide updated reasoning.
==============================================
`;
}

/**
 * Parse Claude's response into a structured trade decision
 */
export interface TradeDecision {
  action: "BUY" | "SELL" | "HOLD";
  ticker: string;
  quantity: number;
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

    // Parse quantity - default to 1 if not provided or invalid
    let quantity = 1;
    if (typeof parsed.quantity === "number" && parsed.quantity > 0) {
      quantity = Math.floor(parsed.quantity);
    }

    return {
      action: parsed.action,
      ticker: parsed.ticker.toUpperCase(),
      quantity,
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
