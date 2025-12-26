-- ================================================================
-- AGENT RECOMMENDATIONS TABLE
-- Stores recent AI recommendations to prevent duplicate analyses
-- ================================================================

-- Create the agent_recommendations table
CREATE TABLE IF NOT EXISTS public.agent_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,

    -- Recommendation details
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
    ticker TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    current_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    reasoning TEXT NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

    -- Metadata from analysis
    news_summary TEXT,
    risk_assessment TEXT,
    api_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    news_source TEXT,

    -- Cache control
    is_executed BOOLEAN NOT NULL DEFAULT FALSE,
    executed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for quick lookups of recent recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_agent_recent
    ON public.agent_recommendations(agent_id, created_at DESC);

-- Index for finding unexpired recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_expires
    ON public.agent_recommendations(agent_id, expires_at)
    WHERE is_executed = FALSE;

-- Enable RLS
ALTER TABLE public.agent_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view recommendations for their own agents
CREATE POLICY "Users can view own agent recommendations"
    ON public.agent_recommendations FOR SELECT
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can insert recommendations for their own agents
CREATE POLICY "Users can insert own agent recommendations"
    ON public.agent_recommendations FOR INSERT
    WITH CHECK (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Users can update recommendations for their own agents
CREATE POLICY "Users can update own agent recommendations"
    ON public.agent_recommendations FOR UPDATE
    USING (
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Function to get latest valid recommendation for an agent
CREATE OR REPLACE FUNCTION get_cached_recommendation(agent_uuid UUID)
RETURNS TABLE (
    id UUID,
    action TEXT,
    ticker TEXT,
    quantity INTEGER,
    current_price DECIMAL,
    total_cost DECIMAL,
    reasoning TEXT,
    confidence DECIMAL,
    news_summary TEXT,
    risk_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.action,
        r.ticker,
        r.quantity,
        r.current_price,
        r.total_cost,
        r.reasoning,
        r.confidence,
        r.news_summary,
        r.risk_assessment,
        r.created_at,
        r.expires_at
    FROM public.agent_recommendations r
    WHERE r.agent_id = agent_uuid
      AND r.is_executed = FALSE
      AND r.expires_at > NOW()
    ORDER BY r.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark recommendation as executed
CREATE OR REPLACE FUNCTION mark_recommendation_executed(recommendation_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.agent_recommendations
    SET
        is_executed = TRUE,
        executed_at = NOW(),
        updated_at = NOW()
    WHERE id = recommendation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function to delete old recommendations (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_recommendations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.agent_recommendations
    WHERE created_at < NOW() - INTERVAL '7 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recommendations_updated_at
    BEFORE UPDATE ON public.agent_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_recommendations_updated_at();

-- Comment on table
COMMENT ON TABLE public.agent_recommendations IS
    'Stores recent AI recommendations to prevent duplicate analyses within short time intervals';
