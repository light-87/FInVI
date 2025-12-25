import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractStrategyFromPaper } from "@/lib/paper/extract";
import type { ClaudeModel } from "@/lib/claude/client";

/**
 * POST /api/papers/extract-strategy
 * Extract trading strategy from uploaded paper text
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { paper_text, model = "claude-sonnet" } = body;

    // Validate paper text
    if (!paper_text || typeof paper_text !== "string") {
      return NextResponse.json(
        { error: { message: "Paper text is required" } },
        { status: 400 }
      );
    }

    if (paper_text.length < 100) {
      return NextResponse.json(
        { error: { message: "Paper text is too short. Please provide more content." } },
        { status: 400 }
      );
    }

    // Validate model
    const validModels: ClaudeModel[] = ["claude-sonnet", "claude-opus"];
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: { message: "Invalid model. Use claude-sonnet or claude-opus." } },
        { status: 400 }
      );
    }

    // Get user's credits to check if they have enough
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    const credits = profile?.credits ?? 10; // Default 10 credits for new users

    // Estimate cost (roughly $0.01-0.05 per extraction)
    const estimatedCost = model === "claude-opus" ? 0.05 : 0.02;
    if (credits < estimatedCost) {
      return NextResponse.json(
        { error: { message: "Insufficient credits for strategy extraction" } },
        { status: 402 }
      );
    }

    // Extract strategy from paper
    const { strategy, cost } = await extractStrategyFromPaper(paper_text, model);

    // Deduct credits
    await supabase
      .from("profiles")
      .update({ credits: credits - cost })
      .eq("id", user.id);

    return NextResponse.json({
      data: {
        strategy,
        cost,
      },
    });
  } catch (error) {
    console.error("Strategy extraction error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to extract strategy";

    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
