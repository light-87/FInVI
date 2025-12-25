import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMarket, type ClaudeModel } from "@/lib/claude/client";
import {
  buildSystemPrompt,
  buildRealPortfolioContext,
  buildNewsContext,
  buildPreviousRecommendationContext,
  parseTradeDecision,
} from "@/lib/claude/prompts";
import { getMarketNews, getMockNews } from "@/lib/finnhub/client";
import { getPerplexityMarketNews, getMockPerplexityNews } from "@/lib/perplexity/client";
import { getPortfolioSummary, getTickerPrice, checkStopLoss } from "@/lib/portfolio/helpers";
import type {
  Agent,
  RiskParams,
  User,
  TradeSuggestion,
  AnalysisResponse,
  PositionWithPnL,
  AgentRecommendation,
  AgentRecommendationInsert,
} from "@/types/database";

// Cache duration in hours (recommendations expire after this time)
const RECOMMENDATION_CACHE_HOURS = 1;

type NewsSource = "finnhub" | "perplexity";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/agents/[id]/analyze - Run trading analysis for an agent
 *
 * CHANGED: Now returns a suggestion only, does NOT execute the trade.
 * Use POST /api/agents/[id]/execute to confirm and execute the trade.
 *
 * Request body (optional):
 * - force_refresh: boolean - Skip cache and run fresh analysis (costs credits)
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

    // Parse request body for force_refresh option
    let forceRefresh = false;
    try {
      const body = await request.json();
      forceRefresh = body.force_refresh === true;
    } catch {
      // No body or invalid JSON - that's okay, use defaults
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

    // Check for cached recommendation (if not forcing refresh)
    if (!forceRefresh) {
      const { data: cachedRecommendation } = (await supabase
        .from("agent_recommendations")
        .select("*")
        .eq("agent_id", agentId)
        .eq("is_executed", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single()) as { data: AgentRecommendation | null };

      if (cachedRecommendation) {
        // Return cached recommendation without consuming credits
        const portfolio = await getPortfolioSummary(agent);

        const suggestion: TradeSuggestion = {
          action: cachedRecommendation.action,
          ticker: cachedRecommendation.ticker,
          quantity: cachedRecommendation.quantity,
          current_price: cachedRecommendation.current_price,
          total_cost: cachedRecommendation.total_cost,
          reasoning: cachedRecommendation.reasoning,
          confidence: cachedRecommendation.confidence,
        };

        const response: AnalysisResponse = {
          suggestion,
          portfolio,
        };

        const cacheAgeMinutes = Math.round(
          (Date.now() - new Date(cachedRecommendation.created_at).getTime()) / 60000
        );

        return NextResponse.json({
          success: true,
          data: response,
          meta: {
            news_summary: cachedRecommendation.news_summary,
            risk_assessment: cachedRecommendation.risk_assessment,
            api_cost: 0, // No API cost for cached recommendation
            input_tokens: 0,
            output_tokens: 0,
            credits_remaining: userProfile.credits_remaining, // Credits NOT deducted
            news_source: cachedRecommendation.news_source || "cached",
            news_count: 0,
            is_cached: true,
            cache_age_minutes: cacheAgeMinutes,
            cached_at: cachedRecommendation.created_at,
            expires_at: cachedRecommendation.expires_at,
            recommendation_id: cachedRecommendation.id,
          },
        });
      }
    }

    // No cache or force refresh - need to run fresh analysis
    // Check credits (only needed for fresh analysis)
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

    // Fetch portfolio with real positions and current prices
    const portfolio = await getPortfolioSummary(agent);

    // Check for stop-loss triggered positions BEFORE running AI analysis
    // This saves credits by returning forced SELL immediately
    const stopLossPosition = checkStopLoss(portfolio.positions, riskParams.stop_loss_pct);
    if (stopLossPosition) {
      // Stop-loss triggered! Force SELL without AI analysis (saves credits)
      const suggestion: TradeSuggestion = {
        action: "SELL",
        ticker: stopLossPosition.ticker,
        quantity: stopLossPosition.quantity,
        current_price: stopLossPosition.current_price,
        total_cost: stopLossPosition.current_value,
        reasoning: `STOP-LOSS TRIGGERED: ${stopLossPosition.ticker} has dropped ${Math.abs(stopLossPosition.unrealized_pnl_pct).toFixed(1)}%, exceeding your ${riskParams.stop_loss_pct}% stop-loss threshold. Automatic sell recommended to limit losses. Current loss: $${Math.abs(stopLossPosition.unrealized_pnl).toFixed(2)}.`,
        confidence: 1.0, // High confidence for stop-loss
      };

      const response: AnalysisResponse = {
        suggestion,
        portfolio,
      };

      // Note: We do NOT deduct credits for stop-loss triggered recommendations
      // as this is a risk management feature, not an AI analysis

      return NextResponse.json({
        success: true,
        data: response,
        meta: {
          news_summary: "Stop-loss triggered - automatic risk management",
          risk_assessment: "High",
          api_cost: 0,
          input_tokens: 0,
          output_tokens: 0,
          credits_remaining: userProfile.credits_remaining, // Credits NOT deducted
          news_source: "stop-loss",
          news_count: 0,
          is_cached: false,
          is_stop_loss: true,
          stop_loss_pct: riskParams.stop_loss_pct,
          position_loss_pct: stopLossPosition.unrealized_pnl_pct,
        },
      });
    }

    // Determine preferred news source from agent config
    const agentNewsSources = (agent.news_sources as string[]) || ["finnhub"];
    const preferredSource: NewsSource = agentNewsSources.includes("perplexity")
      ? "perplexity"
      : "finnhub";

    // Extract tickers from current positions for targeted news search
    const portfolioTickers = portfolio.positions.map((p: PositionWithPnL) => p.ticker);

    // Fetch news based on preferred source
    let news;
    let newsSource = "mock";

    if (preferredSource === "perplexity") {
      // Use Perplexity for AI-powered news search tailored to agent's focus
      if (process.env.PERPLEXITY_API_KEY) {
        news = await getPerplexityMarketNews({
          agentDescription: agent.description || undefined,
          tickers: portfolioTickers.length > 0 ? portfolioTickers : undefined,
        });
        if (news.length > 0) {
          newsSource = "perplexity";
          console.log(`[Analyze] Using Perplexity news: ${news.length} items (description: "${agent.description?.slice(0, 50)}...")`);
        } else {
          news = getMockPerplexityNews();
          console.log("[Analyze] Perplexity returned no news, using mock data");
        }
      } else {
        news = getMockPerplexityNews();
        console.log("[Analyze] No PERPLEXITY_API_KEY, using mock Perplexity news");
      }
    } else {
      // Use Finnhub for traditional news feed
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
    }

    // Build context for Claude
    const systemPrompt = buildSystemPrompt(agent.name, agent.system_prompt, riskParams);
    let portfolioContext = buildRealPortfolioContext(portfolio, agent.starting_capital);
    const newsContext = buildNewsContext(news);

    // If force refresh, fetch and add context about the previous recommendation
    if (forceRefresh) {
      const { data: prevRecommendation } = (await supabase
        .from("agent_recommendations")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()) as { data: AgentRecommendation | null };

      if (prevRecommendation) {
        const prevContext = buildPreviousRecommendationContext({
          action: prevRecommendation.action,
          ticker: prevRecommendation.ticker,
          quantity: prevRecommendation.quantity,
          reasoning: prevRecommendation.reasoning,
          created_at: prevRecommendation.created_at,
        });
        portfolioContext = portfolioContext + "\n" + prevContext;
      }
    }

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

    // Get current price for the suggested ticker
    const currentPrice = await getTickerPrice(decision.ticker);

    // Calculate total cost for the trade
    const totalCost = decision.quantity * currentPrice;

    // Build the suggestion response
    const suggestion: TradeSuggestion = {
      action: decision.action,
      ticker: decision.ticker,
      quantity: decision.quantity,
      current_price: currentPrice,
      total_cost: totalCost,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
    };

    // Calculate cache expiry time
    const expiresAt = new Date(
      Date.now() + RECOMMENDATION_CACHE_HOURS * 60 * 60 * 1000
    ).toISOString();

    // Save recommendation to database for caching
    const recommendationData: AgentRecommendationInsert = {
      agent_id: agentId,
      action: decision.action,
      ticker: decision.ticker,
      quantity: decision.quantity,
      current_price: currentPrice,
      total_cost: totalCost,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      news_summary: decision.news_summary || null,
      risk_assessment: decision.risk_assessment || null,
      api_cost: claudeResponse.cost,
      news_source: newsSource,
      expires_at: expiresAt,
    };

    const { data: savedRecommendation, error: recommendationError } = (await supabase
      .from("agent_recommendations")
      .insert(recommendationData as never)
      .select()
      .single()) as { data: AgentRecommendation | null; error: unknown };

    if (recommendationError) {
      console.error("Error saving recommendation:", recommendationError);
      // Don't fail the request if saving fails - continue with the response
    }

    // Deduct credit for the analysis
    await supabase
      .from("users")
      .update({
        credits_remaining: userProfile.credits_remaining - 1,
        total_analyses: userProfile.total_analyses + 1,
      } as never)
      .eq("id", authUser.id);

    // Update agent's last_analysis_at and API cost
    await supabase
      .from("agents")
      .update({
        last_analysis_at: new Date().toISOString(),
        total_api_cost: agent.total_api_cost + claudeResponse.cost,
      } as never)
      .eq("id", agentId);

    // Build the response
    const response: AnalysisResponse = {
      suggestion,
      portfolio,
    };

    // Return the suggestion (trade NOT executed yet)
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        news_summary: decision.news_summary,
        risk_assessment: decision.risk_assessment,
        api_cost: claudeResponse.cost,
        input_tokens: claudeResponse.inputTokens,
        output_tokens: claudeResponse.outputTokens,
        credits_remaining: userProfile.credits_remaining - 1,
        news_source: newsSource,
        news_count: news.length,
        is_cached: false,
        cache_age_minutes: 0,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt,
        recommendation_id: savedRecommendation?.id || null,
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
