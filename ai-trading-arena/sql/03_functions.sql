-- AI Trading Arena - Database Functions
-- File: 03_functions.sql
-- Run this AFTER 02_policies.sql
-- ============================================

-- ============================================
-- 1. CREATE USER PROFILE ON SIGNUP
-- Automatically create a user profile when a new auth user signs up
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. RESET DAILY CREDITS
-- Reset credits for free tier users
-- ============================================

CREATE OR REPLACE FUNCTION public.reset_user_credits(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET
        credits_remaining = CASE
            WHEN tier = 'free' THEN 50
            WHEN tier = 'pro' THEN 200
            WHEN tier = 'enterprise' THEN 1000
            ELSE 50
        END,
        credits_reset_at = NOW() + INTERVAL '1 day'
    WHERE id = user_uuid
    AND credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. DEDUCT USER CREDIT
-- Deduct a credit and increment total analyses
-- ============================================

CREATE OR REPLACE FUNCTION public.deduct_credit(user_uuid UUID)
RETURNS boolean AS $$
DECLARE
    remaining INTEGER;
BEGIN
    -- First check if credits need reset
    PERFORM public.reset_user_credits(user_uuid);

    -- Get current credits
    SELECT credits_remaining INTO remaining
    FROM public.users
    WHERE id = user_uuid;

    -- If no credits, return false
    IF remaining <= 0 THEN
        RETURN false;
    END IF;

    -- Deduct credit and increment analyses
    UPDATE public.users
    SET
        credits_remaining = credits_remaining - 1,
        total_analyses = total_analyses + 1
    WHERE id = user_uuid;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. UPDATE AGENT STATS AFTER TRADE
-- Called after a new trade is inserted
-- ============================================

CREATE OR REPLACE FUNCTION public.update_agent_stats()
RETURNS TRIGGER AS $$
DECLARE
    agent_record RECORD;
    new_value DECIMAL(12, 2);
    new_return DECIMAL(8, 4);
    new_win_rate DECIMAL(5, 4);
BEGIN
    -- Get current agent stats
    SELECT * INTO agent_record
    FROM public.agents
    WHERE id = NEW.agent_id;

    -- Calculate new values
    -- For simplicity, we're just tracking trade counts here
    -- Real portfolio value updates would be more complex

    UPDATE public.agents
    SET
        total_trades = total_trades + 1,
        winning_trades = winning_trades + CASE WHEN NEW.is_profitable = true THEN 1 ELSE 0 END,
        win_rate = CASE
            WHEN total_trades + 1 > 0
            THEN (winning_trades + CASE WHEN NEW.is_profitable = true THEN 1 ELSE 0 END)::DECIMAL / (total_trades + 1)
            ELSE 0
        END,
        total_api_cost = total_api_cost + NEW.api_cost,
        last_analysis_at = NEW.timestamp,
        current_value = CASE
            WHEN NEW.profit_loss IS NOT NULL
            THEN current_value + NEW.profit_loss
            ELSE current_value
        END,
        total_return_pct = CASE
            WHEN starting_capital > 0
            THEN ((current_value + COALESCE(NEW.profit_loss, 0) - starting_capital) / starting_capital) * 100
            ELSE 0
        END
    WHERE id = NEW.agent_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update agent stats after trade
CREATE OR REPLACE TRIGGER on_trade_created
    AFTER INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_agent_stats();

-- ============================================
-- 5. REFRESH LEADERBOARD
-- Update the leaderboard table with current rankings
-- ============================================

CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void AS $$
BEGIN
    -- Clear existing leaderboard
    DELETE FROM public.leaderboard;

    -- Insert fresh leaderboard data
    INSERT INTO public.leaderboard (
        agent_id,
        agent_name,
        user_id,
        user_display_name,
        total_return_pct,
        win_rate,
        trade_count,
        total_api_cost,
        rank
    )
    SELECT
        a.id AS agent_id,
        a.name AS agent_name,
        a.user_id,
        u.display_name AS user_display_name,
        a.total_return_pct,
        a.win_rate,
        a.total_trades AS trade_count,
        a.total_api_cost,
        ROW_NUMBER() OVER (ORDER BY a.total_return_pct DESC) AS rank
    FROM public.agents a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.is_public = true
    AND a.status = 'active'
    AND a.total_trades >= 1;  -- At least 1 trade to be on leaderboard
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. GET USER RANK
-- Get a user's best agent rank on leaderboard
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_rank(user_uuid UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    rank INTEGER,
    total_return_pct DECIMAL(8, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.agent_id,
        l.agent_name,
        l.rank,
        l.total_return_pct
    FROM public.leaderboard l
    WHERE l.user_id = user_uuid
    ORDER BY l.rank ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. GET AGENT PERFORMANCE HISTORY
-- Get portfolio snapshots for charting
-- ============================================

CREATE OR REPLACE FUNCTION public.get_agent_performance(
    agent_uuid UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    snapshot_time TIMESTAMPTZ,
    total_value DECIMAL(12, 2),
    daily_return_pct DECIMAL(8, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.timestamp AS snapshot_time,
        ps.total_value,
        ps.daily_return_pct
    FROM public.portfolio_snapshots ps
    WHERE ps.agent_id = agent_uuid
    AND ps.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    ORDER BY ps.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. CHECK AND RESET CREDITS
-- Check if user has credits, auto-reset if needed
-- ============================================

CREATE OR REPLACE FUNCTION public.check_user_credits(user_uuid UUID)
RETURNS TABLE (
    has_credits BOOLEAN,
    credits_remaining INTEGER,
    credits_reset_at TIMESTAMPTZ
) AS $$
BEGIN
    -- First reset if needed
    PERFORM public.reset_user_credits(user_uuid);

    -- Return current status
    RETURN QUERY
    SELECT
        u.credits_remaining > 0 AS has_credits,
        u.credits_remaining,
        u.credits_reset_at
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
