import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Agent, User } from "@/types/database";

interface LeaderboardAgent extends Agent {
  users: Pick<User, "display_name"> | null;
}

interface LeaderboardEntry {
  rank: number;
  agent_id: string;
  agent_name: string;
  user_id: string;
  user_display_name: string;
  total_return_pct: number;
  win_rate: number;
  trade_count: number;
  total_api_cost: number;
  is_own: boolean;
}

/**
 * GET /api/leaderboard - Get public leaderboard of top performing agents
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user (optional - for highlighting own agents)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get URL params for sorting
    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sort") || "total_return_pct";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    // Valid sort columns
    const validSorts = ["total_return_pct", "win_rate", "total_trades", "total_api_cost"];
    const sortColumn = validSorts.includes(sortBy) ? sortBy : "total_return_pct";

    // Fetch public agents with user info, sorted by performance
    const { data: agents, error } = (await supabase
      .from("agents")
      .select("*, users(display_name)")
      .eq("is_public", true)
      .eq("status", "active")
      .gt("total_trades", 0)
      .order(sortColumn, { ascending: sortColumn === "total_api_cost" })
      .limit(limit)) as { data: LeaderboardAgent[] | null; error: Error | null };

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: "Failed to fetch leaderboard" } },
        { status: 500 }
      );
    }

    // Transform to leaderboard entries with rankings
    const leaderboard: LeaderboardEntry[] = (agents || []).map((agent, index) => ({
      rank: index + 1,
      agent_id: agent.id,
      agent_name: agent.name,
      user_id: agent.user_id,
      user_display_name: agent.users?.display_name || "Anonymous",
      total_return_pct: agent.total_return_pct,
      win_rate: agent.win_rate,
      trade_count: agent.total_trades,
      total_api_cost: agent.total_api_cost,
      is_own: user ? agent.user_id === user.id : false,
    }));

    // Get user's own rank if they have public agents
    let userRank: LeaderboardEntry | null = null;
    if (user) {
      const ownAgent = leaderboard.find((entry) => entry.is_own);
      if (ownAgent) {
        userRank = ownAgent;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        user_rank: userRank,
        total_agents: leaderboard.length,
        sort_by: sortColumn,
      },
    });
  } catch (err) {
    console.error("Unexpected error in leaderboard:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
