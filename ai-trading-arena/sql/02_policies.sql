-- AI Trading Arena - Row Level Security Policies
-- File: 02_policies.sql
-- Run this AFTER 01_schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- Users can only access their own profile
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- AGENTS POLICIES
-- Users can CRUD their own agents
-- Anyone can read public agents
-- ============================================

-- Users can read their own agents
CREATE POLICY "Users can read own agents"
    ON public.agents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can read public agents
CREATE POLICY "Anyone can read public agents"
    ON public.agents
    FOR SELECT
    USING (is_public = true);

-- Users can create their own agents
CREATE POLICY "Users can create own agents"
    ON public.agents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own agents
CREATE POLICY "Users can update own agents"
    ON public.agents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own agents
CREATE POLICY "Users can delete own agents"
    ON public.agents
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRADES POLICIES
-- Users can read trades of their own agents
-- Anyone can read trades of public agents
-- ============================================

-- Users can read trades of their own agents
CREATE POLICY "Users can read own agent trades"
    ON public.trades
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = trades.agent_id
            AND agents.user_id = auth.uid()
        )
    );

-- Anyone can read trades of public agents
CREATE POLICY "Anyone can read public agent trades"
    ON public.trades
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = trades.agent_id
            AND agents.is_public = true
        )
    );

-- Users can create trades for their own agents (via API)
CREATE POLICY "Users can create trades for own agents"
    ON public.trades
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = trades.agent_id
            AND agents.user_id = auth.uid()
        )
    );

-- ============================================
-- PORTFOLIO_SNAPSHOTS POLICIES
-- Same pattern as trades
-- ============================================

-- Users can read snapshots of their own agents
CREATE POLICY "Users can read own agent snapshots"
    ON public.portfolio_snapshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = portfolio_snapshots.agent_id
            AND agents.user_id = auth.uid()
        )
    );

-- Anyone can read snapshots of public agents
CREATE POLICY "Anyone can read public agent snapshots"
    ON public.portfolio_snapshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = portfolio_snapshots.agent_id
            AND agents.is_public = true
        )
    );

-- Users can create snapshots for their own agents
CREATE POLICY "Users can create snapshots for own agents"
    ON public.portfolio_snapshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE agents.id = portfolio_snapshots.agent_id
            AND agents.user_id = auth.uid()
        )
    );

-- ============================================
-- LEADERBOARD POLICIES
-- Public read access (leaderboard is public)
-- ============================================

-- Anyone can read leaderboard
CREATE POLICY "Anyone can read leaderboard"
    ON public.leaderboard
    FOR SELECT
    USING (true);

-- Note: Leaderboard is updated via service key (bypasses RLS)
-- No insert/update policies needed for regular users

-- ============================================
-- SERVICE ROLE BYPASS
-- The service role key bypasses RLS by default
-- This is used for:
-- - Creating trades from API routes
-- - Updating leaderboard
-- - Admin operations
-- ============================================

-- Grant service role full access (this is default but explicit)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
