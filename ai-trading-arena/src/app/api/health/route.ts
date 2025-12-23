import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Health check endpoint to verify database connection
 * GET /api/health
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Test database connection by querying leaderboard (public table)
    const { data, error } = await supabase
      .from("leaderboard")
      .select("count")
      .limit(1);

    if (error) {
      // If table doesn't exist yet, that's ok - just check connection
      if (error.code === "42P01") {
        return NextResponse.json({
          status: "ok",
          message: "Database connected, but tables not created yet. Run SQL migrations.",
          database: "connected",
          tables: "pending",
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }

    return NextResponse.json({
      status: "ok",
      message: "Database connected and tables exist",
      database: "connected",
      tables: "ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
