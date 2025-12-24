import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortfolioSummary } from "@/lib/portfolio/helpers";
import type { Agent, PortfolioSnapshotInsert } from "@/types/database";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/agents/[id]/refresh - Refresh prices and recalculate P&L
 *
 * This endpoint fetches current prices for all positions,
 * calculates unrealized P&L, and updates the agent's portfolio value.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

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

    // Fetch agent (must belong to user or be public)
    const { data: agent } = (await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single()) as { data: Agent | null };

    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: "AGENT_NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    // Check ownership or public visibility
    if (agent.user_id !== authUser.id && !agent.is_public) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized to view this agent" } },
        { status: 403 }
      );
    }

    // Fetch portfolio with current prices
    const portfolio = await getPortfolioSummary(agent);

    // Calculate total unrealized P&L
    const totalUnrealizedPnL = portfolio.positions.reduce(
      (sum, p) => sum + p.unrealized_pnl,
      0
    );

    // Update agent's current value and return percentage
    const newCurrentValue = portfolio.total_value;
    const newReturnPct = ((newCurrentValue - agent.starting_capital) / agent.starting_capital) * 100;

    // Only update if this is the owner
    if (agent.user_id === authUser.id) {
      await supabase
        .from("agents")
        .update({
          current_value: newCurrentValue,
          total_return_pct: newReturnPct,
        } as never)
        .eq("id", agentId);

      // Create portfolio snapshot for tracking history
      const snapshotData: PortfolioSnapshotInsert = {
        agent_id: agentId,
        total_value: newCurrentValue,
        cash: portfolio.cash,
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
    }

    return NextResponse.json({
      success: true,
      data: {
        portfolio,
        summary: {
          cash: portfolio.cash,
          positions_value: portfolio.total_value - portfolio.cash,
          total_value: portfolio.total_value,
          total_return_pct: portfolio.total_return_pct,
          unrealized_pnl: totalUnrealizedPnL,
          position_count: portfolio.positions.length,
        },
      },
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Unexpected error in refresh:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/[id]/refresh - Get current portfolio without creating snapshot
 *
 * Lighter-weight version for quick portfolio checks.
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

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

    // Fetch agent (must belong to user or be public)
    const { data: agent } = (await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single()) as { data: Agent | null };

    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: "AGENT_NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    // Check ownership or public visibility
    if (agent.user_id !== authUser.id && !agent.is_public) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized to view this agent" } },
        { status: 403 }
      );
    }

    // Fetch portfolio with current prices (no snapshot created)
    const portfolio = await getPortfolioSummary(agent);

    return NextResponse.json({
      success: true,
      data: { portfolio },
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Unexpected error in refresh GET:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
