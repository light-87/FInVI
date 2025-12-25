import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortfolioSummary, getTickerPrice, canSellShares, validateMaxPositionSize } from "@/lib/portfolio/helpers";
import type {
  Agent,
  User,
  ExecuteTradeRequest,
  ExecuteTradeResponse,
  TradeInsert,
  PositionInsert,
  PositionRow,
  Trade,
  PortfolioSnapshotInsert,
  RiskParams,
} from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/agents/[id]/execute - Execute a confirmed trade
 *
 * This endpoint is called after the user confirms a trade suggestion.
 * It creates real positions and updates cash balances.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

    // Parse request body
    let body: ExecuteTradeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Invalid JSON in request body" } },
        { status: 400 }
      );
    }

    const { action, ticker, quantity, price, enable_auto, auto_interval } = body;

    // Validate required fields
    if (!action || !["BUY", "SELL"].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ACTION", message: "Action must be BUY or SELL" } },
        { status: 400 }
      );
    }

    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TICKER", message: "Ticker is required" } },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_QUANTITY", message: "Quantity must be positive" } },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PRICE", message: "Price must be positive" } },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile } = (await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single()) as { data: User | null };

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User profile not found" } },
        { status: 404 }
      );
    }

    // Fetch agent (must belong to user)
    const { data: agent } = (await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", authUser.id)
      .single()) as { data: Agent | null };

    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: "AGENT_NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    const totalCost = quantity * price;
    let trade: Trade;
    let position: PositionRow | undefined;
    let newCashBalance = agent.cash_balance;
    let realizedPnL: number | null = null;
    let isProfitable: boolean | null = null;

    if (action === "BUY") {
      // Check if agent has enough cash
      if (agent.cash_balance < totalCost) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_FUNDS",
              message: `Insufficient cash. Need $${totalCost.toFixed(2)}, have $${agent.cash_balance.toFixed(2)}`,
            },
          },
          { status: 400 }
        );
      }

      // Check max position size limit
      const riskParams = agent.risk_params as RiskParams;
      const portfolio = await getPortfolioSummary(agent);

      // Find existing position value for this ticker
      const existingPosition = portfolio.positions.find(
        (p) => p.ticker === ticker.toUpperCase()
      );
      const existingPositionValue = existingPosition?.current_value || 0;

      const positionCheck = validateMaxPositionSize(
        portfolio.total_value,
        totalCost,
        existingPositionValue,
        riskParams.max_position_pct
      );

      if (!positionCheck.valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MAX_POSITION_EXCEEDED",
              message: `This order would exceed your max position size of ${riskParams.max_position_pct}%. Current: ${positionCheck.currentPct.toFixed(1)}%. Max additional: $${positionCheck.maxAllowed.toFixed(2)}`,
            },
          },
          { status: 400 }
        );
      }

      // Deduct cash
      newCashBalance = agent.cash_balance - totalCost;

      // Create position
      const positionData: PositionInsert = {
        agent_id: agentId,
        ticker: ticker.toUpperCase(),
        quantity,
        entry_price: price,
        status: "open",
      };

      const { data: newPosition, error: positionError } = (await supabase
        .from("positions")
        .insert(positionData as never)
        .select()
        .single()) as { data: PositionRow | null; error: PostgrestError | null };

      if (positionError) {
        console.error("Error creating position:", positionError);
        return NextResponse.json(
          { success: false, error: { code: "DATABASE_ERROR", message: positionError.message } },
          { status: 500 }
        );
      }

      position = newPosition ?? undefined;
    } else if (action === "SELL") {
      // Check if agent owns the shares
      const { canSell, availableShares } = await canSellShares(agentId, ticker.toUpperCase(), quantity);

      if (!canSell) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_SHARES",
              message: `Cannot sell ${quantity} shares of ${ticker}. Available: ${availableShares}`,
            },
          },
          { status: 400 }
        );
      }

      // Find the position to close/reduce
      const { data: existingPosition } = (await supabase
        .from("positions")
        .select("*")
        .eq("agent_id", agentId)
        .eq("ticker", ticker.toUpperCase())
        .eq("status", "open")
        .single()) as { data: PositionRow | null };

      if (!existingPosition) {
        return NextResponse.json(
          { success: false, error: { code: "POSITION_NOT_FOUND", message: "Position not found" } },
          { status: 404 }
        );
      }

      // Calculate realized P&L
      realizedPnL = (price - existingPosition.entry_price) * quantity;
      isProfitable = realizedPnL > 0;

      // Add cash from sale
      newCashBalance = agent.cash_balance + totalCost;

      if (quantity === existingPosition.quantity) {
        // Close the entire position
        const { error: updateError } = await supabase
          .from("positions")
          .update({
            status: "closed",
            exit_price: price,
            exit_date: new Date().toISOString(),
            realized_pnl: realizedPnL,
          } as never)
          .eq("id", existingPosition.id);

        if (updateError) {
          console.error("Error closing position:", updateError);
          return NextResponse.json(
            { success: false, error: { code: "DATABASE_ERROR", message: updateError.message } },
            { status: 500 }
          );
        }

        position = {
          ...existingPosition,
          status: "closed",
          exit_price: price,
          exit_date: new Date().toISOString(),
          realized_pnl: realizedPnL,
        };
      } else {
        // Partial sell - reduce quantity
        const { error: updateError } = await supabase
          .from("positions")
          .update({
            quantity: existingPosition.quantity - quantity,
          } as never)
          .eq("id", existingPosition.id);

        if (updateError) {
          console.error("Error updating position:", updateError);
          return NextResponse.json(
            { success: false, error: { code: "DATABASE_ERROR", message: updateError.message } },
            { status: 500 }
          );
        }

        position = {
          ...existingPosition,
          quantity: existingPosition.quantity - quantity,
        };
      }
    }

    // Update agent's cash balance and stats
    const newTotalTrades = agent.total_trades + 1;
    const newWinningTrades = isProfitable ? agent.winning_trades + 1 : agent.winning_trades;
    const newWinRate = newWinningTrades / newTotalTrades;

    // Update auto-execute settings if provided
    const autoExecute = enable_auto !== undefined ? enable_auto : agent.auto_execute;
    const autoIntervalValue = auto_interval || agent.auto_interval;

    // Calculate next auto analysis time if auto-execute is enabled
    let nextAutoAnalysisAt: string | null = null;
    if (autoExecute) {
      const intervalHours = autoIntervalValue === "3h" ? 3 : autoIntervalValue === "10h" ? 10 : 24;
      nextAutoAnalysisAt = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();
    }

    await supabase
      .from("agents")
      .update({
        cash_balance: newCashBalance,
        total_trades: newTotalTrades,
        winning_trades: newWinningTrades,
        win_rate: newWinRate,
        auto_execute: autoExecute,
        auto_interval: autoIntervalValue,
        next_auto_analysis_at: nextAutoAnalysisAt,
        last_analysis_at: new Date().toISOString(),
      } as never)
      .eq("id", agentId);

    // Create trade record
    const tradeData: TradeInsert = {
      agent_id: agentId,
      action,
      ticker: ticker.toUpperCase(),
      quantity,
      price,
      total_value: totalCost,
      reasoning: `Trade executed: ${action} ${quantity} shares of ${ticker} at $${price.toFixed(2)}`,
      confidence: 1.0, // User-confirmed trade
      is_profitable: isProfitable,
      profit_loss: realizedPnL,
      api_cost: 0, // No API cost for execution
    };

    const { data: tradeResult, error: tradeError } = (await supabase
      .from("trades")
      .insert(tradeData as never)
      .select()
      .single()) as { data: Trade | null; error: PostgrestError | null };

    if (tradeError) {
      console.error("Error creating trade:", tradeError);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: tradeError.message } },
        { status: 500 }
      );
    }

    trade = tradeResult!;

    // Mark any pending recommendations for this agent as executed
    await supabase
      .from("agent_recommendations")
      .update({
        is_executed: true,
        executed_at: new Date().toISOString(),
      } as never)
      .eq("agent_id", agentId)
      .eq("is_executed", false);

    // Get updated portfolio
    const updatedAgent = { ...agent, cash_balance: newCashBalance };
    const portfolio = await getPortfolioSummary(updatedAgent);

    // Update agent's current value and return percentage
    const newCurrentValue = portfolio.total_value;
    const newReturnPct = ((newCurrentValue - agent.starting_capital) / agent.starting_capital) * 100;

    await supabase
      .from("agents")
      .update({
        current_value: newCurrentValue,
        total_return_pct: newReturnPct,
      } as never)
      .eq("id", agentId);

    // Create portfolio snapshot
    const snapshotData: PortfolioSnapshotInsert = {
      agent_id: agentId,
      total_value: newCurrentValue,
      cash: newCashBalance,
      positions: portfolio.positions.map((p) => ({
        ticker: p.ticker,
        quantity: p.quantity,
        entry_price: p.entry_price,
        current_price: p.current_price,
        value: p.current_value,
        unrealized_pnl: p.unrealized_pnl,
      })),
      daily_return_pct: ((newCurrentValue - agent.current_value) / agent.current_value) * 100,
      cumulative_return_pct: newReturnPct,
    };

    await supabase.from("portfolio_snapshots").insert(snapshotData as never);

    // Build response
    const response: ExecuteTradeResponse = {
      success: true,
      trade,
      position,
      portfolio,
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        realized_pnl: realizedPnL,
        is_profitable: isProfitable,
        auto_execute: autoExecute,
        next_auto_analysis_at: nextAutoAnalysisAt,
      },
    });
  } catch (err) {
    console.error("Unexpected error in execute:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
