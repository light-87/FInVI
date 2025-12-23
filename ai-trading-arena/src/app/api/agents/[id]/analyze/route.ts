import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMarket, type ClaudeModel } from "@/lib/claude/client";
import {
  buildSystemPrompt,
  buildPortfolioContext,
  buildNewsContext,
  parseTradeDecision,
} from "@/lib/claude/prompts";
import { getMarketNews, getMockNews, getMockQuote, getQuote } from "@/lib/finnhub/client";
import type { Agent, Trade, RiskParams, TradeInsert, User } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/agents/[id]/analyze - Run trading analysis for an agent
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

    // Get user profile for credits check
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

    // Check credits
    if (userProfile.credits_remaining <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_CREDITS",
            message: "No credits remaining. Credits reset daily.",
            credits_reset_at: userProfile.credits_reset_at,
          },
        },
        { status: 402 }
      );
    }

    // Fetch agent (must belong to user and be active)
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

    if (agent.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AGENT_INACTIVE", message: "Agent is not active. Activate it first." },
        },
        { status: 400 }
      );
    }

    // Check daily trade limit
    const today = new Date().toISOString().split("T")[0];
    const { count: tradesToday } = await supabase
      .from("trades")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .gte("created_at", `${today}T00:00:00Z`);

    const riskParams = agent.risk_params as RiskParams;
    if ((tradesToday ?? 0) >= riskParams.max_trades_per_day) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TRADE_LIMIT_REACHED",
            message: `Daily trade limit of ${riskParams.max_trades_per_day} reached`,
          },
        },
        { status: 429 }
      );
    }

    // Fetch recent trades for context
    const { data: recentTrades } = (await supabase
      .from("trades")
      .select("action, ticker, timestamp")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(5)) as { data: Array<{ action: string; ticker: string; timestamp: string }> | null };

    // Fetch news (use mock if no API key)
    let news;
    let newsSource = "mock";
    if (process.env.FINNHUB_API_KEY) {
      news = await getMarketNews("general");
      if (news.length > 0) {
        newsSource = "finnhub";
        console.log(`[Analyze] Using Finnhub news: ${news.length} items`);
      } else {
        news = getMockNews();
        console.log("[Analyze] Finnhub returned no news, using mock data");
      }
    } else {
      news = getMockNews();
      console.log("[Analyze] No FINNHUB_API_KEY, using mock news");
    }

    // Build context for Claude
    const systemPrompt = buildSystemPrompt(agent.name, agent.system_prompt, riskParams);

    const portfolioContext = buildPortfolioContext(
      agent.current_value,
      agent.current_value, // Simplified: assume all cash for now
      [], // No positions tracked yet
      recentTrades || []
    );

    const newsContext = buildNewsContext(news);

    // Determine which model to use
    const claudeModel: ClaudeModel =
      agent.llm_model === "claude-sonnet" || agent.llm_model === "claude-opus"
        ? agent.llm_model
        : "claude-sonnet";

    // Call Claude API
    let claudeResponse;
    try {
      claudeResponse = await analyzeMarket(systemPrompt, newsContext, portfolioContext, claudeModel);
    } catch (claudeError) {
      console.error("Claude API error:", claudeError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "CLAUDE_API_ERROR", message: "Failed to get analysis from AI" },
        },
        { status: 502 }
      );
    }

    // Parse the trade decision
    const decision = parseTradeDecision(claudeResponse.content);

    if (!decision) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PARSE_ERROR",
            message: "Failed to parse AI response",
            raw_response: claudeResponse.content,
          },
        },
        { status: 500 }
      );
    }

    // Get current price for the ticker (use real quote if Finnhub available)
    let quote;
    if (process.env.FINNHUB_API_KEY) {
      quote = await getQuote(decision.ticker);
      if (quote) {
        console.log(`[Analyze] Got real quote for ${decision.ticker}: $${quote.currentPrice}`);
      } else {
        console.log(`[Analyze] No quote for ${decision.ticker}, using mock`);
        quote = getMockQuote(decision.ticker);
      }
    } else {
      quote = getMockQuote(decision.ticker);
    }

    // Calculate trade value (simplified: use 10% of portfolio for buys)
    let quantity: number | null = null;
    let totalValue: number | null = null;

    if (decision.action === "BUY") {
      const maxAllocation = agent.current_value * (riskParams.max_position_pct / 100);
      totalValue = Math.min(maxAllocation, agent.current_value * 0.1);
      quantity = Math.floor(totalValue / quote.currentPrice);
      totalValue = quantity * quote.currentPrice;
    } else if (decision.action === "SELL") {
      // For demo, simulate selling a position
      quantity = 10;
      totalValue = quantity * quote.currentPrice;
    }

    // Create trade record
    const tradeData: TradeInsert = {
      agent_id: agentId,
      action: decision.action,
      ticker: decision.ticker,
      quantity,
      price: quote.currentPrice,
      total_value: totalValue,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      news_summary: decision.news_summary,
      api_cost: claudeResponse.cost,
    };

    const { data: trade, error: tradeError } = (await supabase
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

    // Update agent stats
    const newTotalTrades = agent.total_trades + 1;
    const newApiCost = agent.total_api_cost + claudeResponse.cost;

    await supabase
      .from("agents")
      .update({
        total_trades: newTotalTrades,
        total_api_cost: newApiCost,
        last_analysis_at: new Date().toISOString(),
      } as never)
      .eq("id", agentId);

    // Deduct credit
    await supabase
      .from("users")
      .update({
        credits_remaining: userProfile.credits_remaining - 1,
        total_analyses: userProfile.total_analyses + 1,
      } as never)
      .eq("id", authUser.id);

    // Return the result
    return NextResponse.json({
      success: true,
      data: {
        trade,
        analysis: {
          action: decision.action,
          ticker: decision.ticker,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          news_summary: decision.news_summary,
          risk_assessment: decision.risk_assessment,
          current_price: quote.currentPrice,
        },
        cost: {
          api_cost: claudeResponse.cost,
          input_tokens: claudeResponse.inputTokens,
          output_tokens: claudeResponse.outputTokens,
        },
        credits_remaining: userProfile.credits_remaining - 1,
        news_source: newsSource,
        news_count: news.length,
      },
    });
  } catch (err) {
    console.error("Unexpected error in analyze:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
