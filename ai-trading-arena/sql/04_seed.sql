-- AI Trading Arena - Seed Data
-- File: 04_seed.sql
-- Run this AFTER 03_functions.sql (OPTIONAL - for demo data)
-- ============================================

-- NOTE: This file creates demo data for testing
-- In production, users will create their own data via the app

-- ============================================
-- DEMO USERS
-- These are fake users for demonstration
-- In reality, users are created via Supabase Auth
-- ============================================

-- First, we need to create auth users via Supabase Dashboard or API
-- These inserts assume you've created demo auth users with these IDs
-- Replace these UUIDs with actual auth user IDs from your Supabase project

-- Example: After creating demo users in Supabase Auth, get their IDs and update below

-- Demo User 1: High Performer
-- INSERT INTO public.users (id, display_name, credits_remaining, tier, total_analyses)
-- VALUES (
--     'YOUR-AUTH-USER-UUID-1',
--     'AlphaTrader',
--     10,
--     'pro',
--     47
-- );

-- Demo User 2: Average Performer
-- INSERT INTO public.users (id, display_name, credits_remaining, tier, total_analyses)
-- VALUES (
--     'YOUR-AUTH-USER-UUID-2',
--     'MarketMaven',
--     8,
--     'free',
--     23
-- );

-- Demo User 3: New User
-- INSERT INTO public.users (id, display_name, credits_remaining, tier, total_analyses)
-- VALUES (
--     'YOUR-AUTH-USER-UUID-3',
--     'NewInvestor',
--     10,
--     'free',
--     3
-- );

-- ============================================
-- DEMO AGENTS
-- Example agents with different strategies
-- ============================================

-- Uncomment and update user_id after creating auth users:

-- Agent 1: Conservative Value Investor
-- INSERT INTO public.agents (
--     user_id, name, description, llm_model, system_prompt,
--     news_sources, risk_params, is_public, status,
--     starting_capital, current_value, total_return_pct,
--     win_rate, total_trades, winning_trades
-- ) VALUES (
--     'YOUR-AUTH-USER-UUID-1',
--     'Value Hunter',
--     'Conservative value investing strategy focusing on undervalued stocks with strong fundamentals',
--     'claude-sonnet',
--     'You are a conservative value investor following Warren Buffett principles. Focus on companies with strong moats, consistent earnings, and prices below intrinsic value. Avoid speculation and prioritize long-term wealth preservation.',
--     '["general", "earnings"]'::jsonb,
--     '{"stop_loss_pct": 10, "max_position_pct": 15, "max_trades_per_day": 2}'::jsonb,
--     true,
--     'active',
--     100000.00,
--     108250.00,
--     8.25,
--     0.68,
--     25,
--     17
-- );

-- Agent 2: Momentum Trader
-- INSERT INTO public.agents (
--     user_id, name, description, llm_model, system_prompt,
--     news_sources, risk_params, is_public, status,
--     starting_capital, current_value, total_return_pct,
--     win_rate, total_trades, winning_trades
-- ) VALUES (
--     'YOUR-AUTH-USER-UUID-1',
--     'Momentum Alpha',
--     'Aggressive momentum trading strategy riding market trends',
--     'claude-sonnet',
--     'You are an aggressive momentum trader. Look for stocks showing strong upward price momentum with increasing volume. Be quick to cut losses and let winners run. Focus on technical breakouts and trend following.',
--     '["general", "forex", "crypto"]'::jsonb,
--     '{"stop_loss_pct": 5, "max_position_pct": 25, "max_trades_per_day": 5}'::jsonb,
--     true,
--     'active',
--     100000.00,
--     115750.00,
--     15.75,
--     0.52,
--     42,
--     22
-- );

-- Agent 3: News Sentiment Analyzer
-- INSERT INTO public.agents (
--     user_id, name, description, llm_model, system_prompt,
--     news_sources, risk_params, is_public, status,
--     starting_capital, current_value, total_return_pct,
--     win_rate, total_trades, winning_trades
-- ) VALUES (
--     'YOUR-AUTH-USER-UUID-2',
--     'Sentiment Sage',
--     'News-driven trading based on sentiment analysis',
--     'claude-sonnet',
--     'You are a sentiment-focused trader. Analyze news headlines and articles for market sentiment. Buy on extremely negative sentiment (contrarian) and sell on euphoria. Weight recent news more heavily than older news.',
--     '["general", "earnings", "merger"]'::jsonb,
--     '{"stop_loss_pct": 7, "max_position_pct": 20, "max_trades_per_day": 3}'::jsonb,
--     true,
--     'active',
--     100000.00,
--     103420.00,
--     3.42,
--     0.58,
--     19,
--     11
-- );

-- ============================================
-- DEMO TRADES
-- Example trades showing reasoning
-- ============================================

-- Uncomment after creating agents:

-- Trade 1: Successful Buy
-- INSERT INTO public.trades (
--     agent_id, timestamp, action, ticker, quantity, price, total_value,
--     reasoning, confidence, news_summary, api_cost, is_profitable, profit_loss
-- ) VALUES (
--     'AGENT-UUID-1',
--     NOW() - INTERVAL '5 days',
--     'BUY',
--     'AAPL',
--     50,
--     178.50,
--     8925.00,
--     'Apple shows strong fundamentals with robust services revenue growth. Recent pullback provides attractive entry point. P/E ratio below 5-year average suggests undervaluation. Strong cash position and consistent buybacks support share price.',
--     0.85,
--     'Apple reported Q4 earnings beating estimates. Services revenue up 16% YoY.',
--     0.003200,
--     true,
--     425.00
-- );

-- Trade 2: HOLD decision
-- INSERT INTO public.trades (
--     agent_id, timestamp, action, ticker, quantity, price, total_value,
--     reasoning, confidence, news_summary, api_cost, is_profitable, profit_loss
-- ) VALUES (
--     'AGENT-UUID-1',
--     NOW() - INTERVAL '3 days',
--     'HOLD',
--     'AAPL',
--     NULL,
--     NULL,
--     NULL,
--     'No significant news to warrant position change. Current AAPL position performing within expectations. Market conditions stable. Will continue monitoring for earnings guidance updates.',
--     0.72,
--     'Mixed market signals. Fed minutes released with no surprises.',
--     0.002800,
--     NULL,
--     NULL
-- );

-- ============================================
-- INITIALIZE LEADERBOARD
-- Refresh leaderboard with seeded data
-- ============================================

-- Run after inserting agents:
-- SELECT public.refresh_leaderboard();

-- ============================================
-- INSTRUCTIONS FOR DEMO SETUP
-- ============================================

/*
TO SET UP DEMO DATA:

1. Go to Supabase Dashboard → Authentication → Users
2. Create 3 demo users:
   - demo1@aitradingarena.com (password: demo123!)
   - demo2@aitradingarena.com (password: demo123!)
   - demo3@aitradingarena.com (password: demo123!)

3. Copy the UUID for each user

4. Uncomment the INSERT statements above and replace 'YOUR-AUTH-USER-UUID-X' with actual UUIDs

5. Run the modified INSERT statements

6. Run: SELECT public.refresh_leaderboard();

7. Test by logging in with demo accounts
*/
