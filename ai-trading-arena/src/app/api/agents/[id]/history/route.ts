import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PortfolioSnapshot } from "@/types/database";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/agents/[id]/history - Get portfolio history for an agent
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Get URL params
    const url = new URL(request.url);
    const daysBack = parseInt(url.searchParams.get("days") || "30", 10);

    // Verify agent belongs to user
    const { data: agent } = (await supabase
      .from("agents")
      .select("id, user_id, starting_capital")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single()) as { data: { id: string; user_id: string; starting_capital: number } | null };

    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: "AGENT_NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch portfolio snapshots
    const { data: snapshots, error: snapshotsError } = (await supabase
      .from("portfolio_snapshots")
      .select("*")
      .eq("agent_id", agentId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })) as { data: PortfolioSnapshot[] | null; error: Error | null };

    if (snapshotsError) {
      console.error("Error fetching snapshots:", snapshotsError);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch history" } },
        { status: 500 }
      );
    }

    // Format data for charting
    const chartData = (snapshots || []).map((snapshot) => ({
      timestamp: snapshot.created_at,
      value: snapshot.total_value,
      returnPct: snapshot.cumulative_return_pct,
      dailyReturn: snapshot.daily_return_pct,
    }));

    // Add starting point if no snapshots
    if (chartData.length === 0) {
      chartData.push({
        timestamp: new Date().toISOString(),
        value: agent.starting_capital,
        returnPct: 0,
        dailyReturn: 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        snapshots: chartData,
        summary: {
          startValue: agent.starting_capital,
          endValue: chartData[chartData.length - 1]?.value || agent.starting_capital,
          totalReturnPct: chartData[chartData.length - 1]?.returnPct || 0,
          snapshotCount: chartData.length,
        },
      },
    });
  } catch (err) {
    console.error("Unexpected error in history:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
