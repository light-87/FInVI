import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AgentInsert, Agent } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * GET /api/agents - List all agents for the current user
 */
export async function GET() {
  try {
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

    // Fetch user's agents
    const { data: agents, error } = (await supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })) as {
      data: Agent[] | null;
      error: PostgrestError | null;
    };

    if (error) {
      console.error("Error fetching agents:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: agents || [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents - Create a new agent
 */
export async function POST(request: Request) {
  try {
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

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      llm_model,
      system_prompt,
      news_sources,
      risk_params,
      is_public,
      auto_execute,
      auto_interval,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Agent name is required" } },
        { status: 400 }
      );
    }

    if (!system_prompt || typeof system_prompt !== "string" || system_prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "System prompt is required" },
        },
        { status: 400 }
      );
    }

    const validModels = ["claude-sonnet", "claude-opus", "gpt-4", "gpt-4-turbo"];
    if (!validModels.includes(llm_model)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid LLM model" } },
        { status: 400 }
      );
    }

    // Validate auto_interval if provided
    const validIntervals = ["3h", "10h", "24h"];
    const agentAutoInterval = validIntervals.includes(auto_interval) ? auto_interval : "24h";

    // Prepare agent data
    const agentData: AgentInsert = {
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      llm_model,
      system_prompt: system_prompt.trim(),
      news_sources: news_sources || ["finnhub"],
      risk_params: risk_params || {
        stop_loss_pct: 5,
        max_position_pct: 25,
        max_trades_per_day: 3,
      },
      is_public: is_public ?? false,
      status: "active",
      starting_capital: 100000,
      current_value: 100000,
      cash_balance: 100000,
      auto_execute: auto_execute ?? false,
      auto_interval: agentAutoInterval,
    };

    // Insert agent
    const { data: agent, error } = (await supabase
      .from("agents")
      .insert(agentData as never)
      .select()
      .single()) as { data: Agent | null; error: PostgrestError | null };

    if (error) {
      console.error("Error creating agent:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: agent }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
