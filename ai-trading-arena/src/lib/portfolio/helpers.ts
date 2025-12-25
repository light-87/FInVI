/**
 * Portfolio Helper Functions
 * Handles position fetching, P&L calculation, and portfolio summaries
 */

import { createClient } from "@/lib/supabase/server";
import { getQuote, getQuotes, getMockQuote } from "@/lib/finnhub/client";
import type {
  Agent,
  PositionRow,
  PositionWithPnL,
  PortfolioSummary,
} from "@/types/database";

/**
 * Fetch all open positions for an agent
 */
export async function getAgentPositions(agentId: string): Promise<PositionRow[]> {
  const supabase = await createClient();

  const { data: positions, error } = await supabase
    .from("positions")
    .select("*")
    .eq("agent_id", agentId)
    .eq("status", "open")
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching positions:", error);
    return [];
  }

  return (positions as PositionRow[]) || [];
}

/**
 * Fetch current prices for a list of tickers
 * Returns a map of ticker -> current price
 */
export async function getCurrentPrices(
  tickers: string[]
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  if (tickers.length === 0) {
    return prices;
  }

  // Check if Finnhub API is available
  if (process.env.FINNHUB_API_KEY) {
    const quotes = await getQuotes(tickers);
    quotes.forEach((quote, symbol) => {
      prices.set(symbol, quote.currentPrice);
    });

    // Fill in any missing with mock data
    for (const ticker of tickers) {
      if (!prices.has(ticker)) {
        const mockQuote = getMockQuote(ticker);
        prices.set(ticker, mockQuote.currentPrice);
      }
    }
  } else {
    // Use mock prices
    for (const ticker of tickers) {
      const mockQuote = getMockQuote(ticker);
      prices.set(ticker, mockQuote.currentPrice);
    }
  }

  return prices;
}

/**
 * Calculate unrealized P&L for a position
 */
export function calculatePositionPnL(
  position: PositionRow,
  currentPrice: number
): PositionWithPnL {
  const currentValue = position.quantity * currentPrice;
  const costBasis = position.quantity * position.entry_price;
  const unrealizedPnl = currentValue - costBasis;
  const unrealizedPnlPct =
    costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    ...position,
    current_price: currentPrice,
    current_value: currentValue,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_pct: unrealizedPnlPct,
  };
}

/**
 * Get full portfolio summary for an agent
 * Includes cash balance, positions with P&L, and totals
 */
export async function getPortfolioSummary(
  agent: Agent
): Promise<PortfolioSummary> {
  // Fetch open positions
  const positions = await getAgentPositions(agent.id);

  // Get unique tickers
  const tickers = [...new Set(positions.map((p) => p.ticker))];

  // Fetch current prices
  const prices = await getCurrentPrices(tickers);

  // Calculate P&L for each position
  const positionsWithPnL: PositionWithPnL[] = positions.map((position) => {
    const currentPrice = prices.get(position.ticker) || position.entry_price;
    return calculatePositionPnL(position, currentPrice);
  });

  // Calculate total positions value
  const positionsValue = positionsWithPnL.reduce(
    (sum, p) => sum + p.current_value,
    0
  );

  // Total portfolio value = cash + positions
  const totalValue = agent.cash_balance + positionsValue;

  // Calculate total return percentage from starting capital
  const totalReturnPct =
    ((totalValue - agent.starting_capital) / agent.starting_capital) * 100;

  return {
    cash: agent.cash_balance,
    positions: positionsWithPnL,
    total_value: totalValue,
    total_return_pct: totalReturnPct,
  };
}

/**
 * Get current price for a single ticker
 */
export async function getTickerPrice(ticker: string): Promise<number> {
  if (process.env.FINNHUB_API_KEY) {
    const quote = await getQuote(ticker);
    if (quote) {
      return quote.currentPrice;
    }
  }
  return getMockQuote(ticker).currentPrice;
}

/**
 * Check if agent has enough cash for a buy order
 */
export function canAffordTrade(
  cashBalance: number,
  price: number,
  quantity: number
): boolean {
  return cashBalance >= price * quantity;
}

/**
 * Check if agent has enough shares to sell
 */
export async function canSellShares(
  agentId: string,
  ticker: string,
  quantity: number
): Promise<{ canSell: boolean; availableShares: number }> {
  const positions = await getAgentPositions(agentId);
  const position = positions.find((p) => p.ticker === ticker);

  if (!position) {
    return { canSell: false, availableShares: 0 };
  }

  return {
    canSell: position.quantity >= quantity,
    availableShares: position.quantity,
  };
}

/**
 * Calculate suggested quantity based on risk parameters
 */
export function calculateSuggestedQuantity(
  cashBalance: number,
  price: number,
  maxPositionPct: number
): number {
  const maxAllocation = cashBalance * (maxPositionPct / 100);
  const quantity = Math.floor(maxAllocation / price);
  return Math.max(1, quantity); // At least 1 share
}

/**
 * Check if any position has triggered stop-loss
 * Returns the worst position that should be sold, or null if none triggered
 */
export function checkStopLoss(
  positionsWithPnL: PositionWithPnL[],
  stopLossPct: number
): PositionWithPnL | null {
  // Find positions where unrealized loss exceeds stop-loss threshold
  const triggeredPositions = positionsWithPnL.filter(
    (p) => p.unrealized_pnl_pct <= -stopLossPct
  );

  if (triggeredPositions.length === 0) {
    return null;
  }

  // Return the worst performing position (most negative)
  return triggeredPositions.reduce((worst, current) =>
    current.unrealized_pnl_pct < worst.unrealized_pnl_pct ? current : worst
  );
}

/**
 * Validate if a BUY order respects max position size
 * Returns true if the order is within limits
 */
export function validateMaxPositionSize(
  currentPortfolioValue: number,
  orderValue: number,
  existingPositionValue: number,
  maxPositionPct: number
): { valid: boolean; maxAllowed: number; currentPct: number } {
  const maxAllocation = currentPortfolioValue * (maxPositionPct / 100);
  const totalPositionValue = existingPositionValue + orderValue;
  const currentPct = (totalPositionValue / currentPortfolioValue) * 100;

  return {
    valid: totalPositionValue <= maxAllocation,
    maxAllowed: maxAllocation - existingPositionValue,
    currentPct,
  };
}
