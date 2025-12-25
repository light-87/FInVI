-- AI Trading Arena - Database Schema
-- File: 01_schema.sql
-- Run this first in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    credits_remaining INTEGER NOT NULL DEFAULT 50,
    credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day'),
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    total_analyses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_tier ON public.users(tier);

-- ============================================
-- 2. AGENTS TABLE
-- AI trading agents created by users
-- ============================================

CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    llm_model TEXT NOT NULL DEFAULT 'claude-sonnet' CHECK (llm_model IN ('claude-sonnet', 'claude-opus', 'gpt-4', 'gpt-4-turbo')),
    system_prompt TEXT NOT NULL,
    news_sources JSONB NOT NULL DEFAULT '["general", "forex", "crypto"]'::jsonb,
    risk_params JSONB NOT NULL DEFAULT '{
        "stop_loss_pct": 5,
        "max_position_pct": 20,
        "max_trades_per_day": 3
    }'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    starting_capital DECIMAL(12, 2) NOT NULL DEFAULT 100000.00,
    current_value DECIMAL(12, 2) NOT NULL DEFAULT 100000.00,
    total_return_pct DECIMAL(8, 4) NOT NULL DEFAULT 0.0000,
    win_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    total_trades INTEGER NOT NULL DEFAULT 0,
    winning_trades INTEGER NOT NULL DEFAULT 0,
    total_api_cost DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    last_analysis_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_is_public ON public.agents(is_public);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_total_return ON public.agents(total_return_pct DESC);

-- ============================================
-- 3. TRADES TABLE
-- Individual trades made by agents
-- ============================================

CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
    ticker TEXT NOT NULL,
    quantity INTEGER,
    price DECIMAL(12, 4),
    total_value DECIMAL(12, 2),
    reasoning TEXT NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    news_summary TEXT,
    api_cost DECIMAL(8, 6) NOT NULL DEFAULT 0.003000,
    is_profitable BOOLEAN,
    profit_loss DECIMAL(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_trades_agent_id ON public.trades(agent_id);
CREATE INDEX idx_trades_timestamp ON public.trades(timestamp DESC);
CREATE INDEX idx_trades_ticker ON public.trades(ticker);
CREATE INDEX idx_trades_action ON public.trades(action);

-- ============================================
-- 4. PORTFOLIO_SNAPSHOTS TABLE
-- Point-in-time snapshots of agent portfolios
-- ============================================

CREATE TABLE public.portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_value DECIMAL(12, 2) NOT NULL,
    cash DECIMAL(12, 2) NOT NULL,
    positions JSONB NOT NULL DEFAULT '{}'::jsonb,
    daily_return_pct DECIMAL(8, 4),
    cumulative_return_pct DECIMAL(8, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_snapshots_agent_id ON public.portfolio_snapshots(agent_id);
CREATE INDEX idx_portfolio_snapshots_timestamp ON public.portfolio_snapshots(timestamp DESC);

-- ============================================
-- 5. LEADERBOARD TABLE
-- Cached leaderboard data for fast access
-- ============================================

CREATE TABLE public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_display_name TEXT NOT NULL,
    total_return_pct DECIMAL(8, 4) NOT NULL DEFAULT 0.0000,
    sharpe_ratio DECIMAL(6, 4),
    win_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    trade_count INTEGER NOT NULL DEFAULT 0,
    total_api_cost DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    rank INTEGER,
    rank_change INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id)
);

-- Indexes
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);
CREATE INDEX idx_leaderboard_return ON public.leaderboard(total_return_pct DESC);
CREATE INDEX idx_leaderboard_user_id ON public.leaderboard(user_id);

-- ============================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- Automatically update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to agents table
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (for documentation)
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.agents IS 'AI trading agents created by users';
COMMENT ON TABLE public.trades IS 'Individual trades executed by agents';
COMMENT ON TABLE public.portfolio_snapshots IS 'Historical portfolio values for charting';
COMMENT ON TABLE public.leaderboard IS 'Cached leaderboard for fast access';

COMMENT ON COLUMN public.users.credits_remaining IS 'API credits remaining (resets daily for free tier)';
COMMENT ON COLUMN public.agents.risk_params IS 'JSON: stop_loss_pct, max_position_pct, max_trades_per_day';
COMMENT ON COLUMN public.agents.news_sources IS 'JSON array of news categories to monitor';
COMMENT ON COLUMN public.trades.confidence IS 'AI confidence score 0-1';
COMMENT ON COLUMN public.trades.api_cost IS 'Cost of this API call in USD';
