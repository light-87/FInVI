-- AI Trading Arena - Real Trading System Schema
-- File: 05_positions.sql
-- Run this after 01_schema.sql to add position tracking
-- ============================================

-- ============================================
-- 1. ADD NEW COLUMNS TO AGENTS TABLE
-- For real trading with cash balance and auto-execute
-- ============================================

-- Cash balance starts at starting_capital (100,000)
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS cash_balance DECIMAL(12, 2) NOT NULL DEFAULT 100000.00;

-- Auto-execute mode: when enabled, trades execute without confirmation
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS auto_execute BOOLEAN NOT NULL DEFAULT false;

-- Auto-execute interval: how often to run analysis in auto mode
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS auto_interval TEXT NOT NULL DEFAULT '24h'
CHECK (auto_interval IN ('3h', '10h', '24h'));

-- Next scheduled analysis time for auto-execute mode
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS next_auto_analysis_at TIMESTAMPTZ;

COMMENT ON COLUMN public.agents.cash_balance IS 'Available cash for trading';
COMMENT ON COLUMN public.agents.auto_execute IS 'When true, AI suggestions execute automatically';
COMMENT ON COLUMN public.agents.auto_interval IS 'Interval between auto-analyses: 3h, 10h, or 24h';
COMMENT ON COLUMN public.agents.next_auto_analysis_at IS 'Next scheduled auto-analysis timestamp';

-- ============================================
-- 2. POSITIONS TABLE
-- Tracks actual stock positions with real entry/exit prices
-- ============================================

CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    entry_price DECIMAL(12, 4) NOT NULL,
    entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    exit_price DECIMAL(12, 4),
    exit_date TIMESTAMPTZ,
    realized_pnl DECIMAL(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_positions_agent_id ON public.positions(agent_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON public.positions(ticker);
CREATE INDEX IF NOT EXISTS idx_positions_agent_status ON public.positions(agent_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.positions IS 'Actual stock positions held by agents';
COMMENT ON COLUMN public.positions.entry_price IS 'Price per share when position was opened';
COMMENT ON COLUMN public.positions.exit_price IS 'Price per share when position was closed (null if open)';
COMMENT ON COLUMN public.positions.realized_pnl IS 'Realized profit/loss when position is closed';

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) FOR POSITIONS
-- ============================================

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Users can view positions of their own agents
CREATE POLICY "Users can view their own agent positions"
    ON public.positions FOR SELECT
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can insert positions for their own agents
CREATE POLICY "Users can create positions for their agents"
    ON public.positions FOR INSERT
    WITH CHECK (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can update positions for their own agents
CREATE POLICY "Users can update their agent positions"
    ON public.positions FOR UPDATE
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can delete positions for their own agents
CREATE POLICY "Users can delete their agent positions"
    ON public.positions FOR DELETE
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can view positions of public agents
CREATE POLICY "Anyone can view public agent positions"
    ON public.positions FOR SELECT
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE is_public = true
        )
    );

-- ============================================
-- 4. HELPER FUNCTION: GET OPEN POSITIONS
-- Returns all open positions for an agent with current values
-- ============================================

CREATE OR REPLACE FUNCTION get_agent_positions(agent_uuid UUID)
RETURNS TABLE (
    position_id UUID,
    ticker VARCHAR(10),
    quantity INTEGER,
    entry_price DECIMAL(12, 4),
    entry_date TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as position_id,
        p.ticker,
        p.quantity,
        p.entry_price,
        p.entry_date,
        p.status
    FROM public.positions p
    WHERE p.agent_id = agent_uuid
    AND p.status = 'open'
    ORDER BY p.entry_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCTION: CALCULATE PORTFOLIO VALUE
-- Sums cash + position values for an agent
-- Note: Requires current_price to be passed in (fetched from API)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_portfolio_value(
    agent_uuid UUID,
    position_values JSONB  -- Format: {"AAPL": 190.50, "NVDA": 445.00}
)
RETURNS TABLE (
    cash DECIMAL(12, 2),
    positions_value DECIMAL(12, 2),
    total_value DECIMAL(12, 2)
) AS $$
DECLARE
    v_cash DECIMAL(12, 2);
    v_positions_value DECIMAL(12, 2) := 0;
    v_position RECORD;
    v_current_price DECIMAL(12, 4);
BEGIN
    -- Get cash balance
    SELECT a.cash_balance INTO v_cash
    FROM public.agents a
    WHERE a.id = agent_uuid;

    -- Calculate sum of position values
    FOR v_position IN
        SELECT p.ticker, p.quantity
        FROM public.positions p
        WHERE p.agent_id = agent_uuid AND p.status = 'open'
    LOOP
        v_current_price := (position_values ->> v_position.ticker)::DECIMAL;
        IF v_current_price IS NOT NULL THEN
            v_positions_value := v_positions_value + (v_position.quantity * v_current_price);
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_cash, v_positions_value, v_cash + v_positions_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
