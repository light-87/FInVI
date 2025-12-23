import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Agent, AgentUpdate } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/agents/[id] - Get a specific agent
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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

    // Fetch agent (must belong to user)
    const { data: agent, error } = (await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()) as { data: Agent | null; error: PostgrestError | null };

    if (error || !agent) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agents/[id] - Update an agent
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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

    // Check agent exists and belongs to user
    const { data: existingAgent } = (await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()) as { data: { id: string } | null };

    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, llm_model, system_prompt, news_sources, risk_params, is_public, status } =
      body;

    // Build update object (only include provided fields)
    const updateData: AgentUpdate = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid agent name" } },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (llm_model !== undefined) {
      const validModels = ["claude-sonnet", "claude-opus", "gpt-4", "gpt-4-turbo"];
      if (!validModels.includes(llm_model)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid LLM model" } },
          { status: 400 }
        );
      }
      updateData.llm_model = llm_model;
    }

    if (system_prompt !== undefined) {
      if (typeof system_prompt !== "string" || system_prompt.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "System prompt cannot be empty" } },
          { status: 400 }
        );
      }
      updateData.system_prompt = system_prompt.trim();
    }

    if (news_sources !== undefined) {
      updateData.news_sources = news_sources;
    }

    if (risk_params !== undefined) {
      updateData.risk_params = risk_params;
    }

    if (is_public !== undefined) {
      updateData.is_public = is_public;
    }

    if (status !== undefined) {
      const validStatuses = ["active", "paused", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status" } },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update agent
    const { data: agent, error } = (await supabase
      .from("agents")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()) as { data: Agent | null; error: PostgrestError | null };

    if (error) {
      console.error("Error updating agent:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id] - Delete an agent
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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

    // Check agent exists and belongs to user
    const { data: existingAgent } = (await supabase
      .from("agents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()) as { data: { id: string } | null };

    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Agent not found" } },
        { status: 404 }
      );
    }

    // Delete agent (trades and snapshots will cascade delete via FK)
    const { error } = await supabase.from("agents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting agent:", error);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
