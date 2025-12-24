/**
 * TypeScript types for Supabase Database
 * Generated based on schema in sql/01_schema.sql
 *
 * In production, generate these with:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          credits_remaining: number;
          credits_reset_at: string;
          tier: "free" | "pro" | "enterprise";
          total_analyses: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          credits_remaining?: number;
          credits_reset_at?: string;
          tier?: "free" | "pro" | "enterprise";
          total_analyses?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          credits_remaining?: number;
          credits_reset_at?: string;
          tier?: "free" | "pro" | "enterprise";
          total_analyses?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          llm_model: "claude-sonnet" | "claude-opus" | "gpt-4" | "gpt-4-turbo";
          system_prompt: string;
          news_sources: Json;
          risk_params: Json;
          is_public: boolean;
          status: "active" | "paused" | "archived";
          starting_capital: number;
          current_value: number;
          total_return_pct: number;
          win_rate: number;
          total_trades: number;
          winning_trades: number;
          total_api_cost: number;
          last_analysis_at: string | null;
          cash_balance: number;
          auto_execute: boolean;
          auto_interval: "3h" | "10h" | "24h";
          next_auto_analysis_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          llm_model?: "claude-sonnet" | "claude-opus" | "gpt-4" | "gpt-4-turbo";
          system_prompt: string;
          news_sources?: Json;
          risk_params?: Json;
          is_public?: boolean;
          status?: "active" | "paused" | "archived";
          starting_capital?: number;
          current_value?: number;
          total_return_pct?: number;
          win_rate?: number;
          total_trades?: number;
          winning_trades?: number;
          total_api_cost?: number;
          last_analysis_at?: string | null;
          cash_balance?: number;
          auto_execute?: boolean;
          auto_interval?: "3h" | "10h" | "24h";
          next_auto_analysis_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          llm_model?: "claude-sonnet" | "claude-opus" | "gpt-4" | "gpt-4-turbo";
          system_prompt?: string;
          news_sources?: Json;
          risk_params?: Json;
          is_public?: boolean;
          status?: "active" | "paused" | "archived";
          starting_capital?: number;
          current_value?: number;
          total_return_pct?: number;
          win_rate?: number;
          total_trades?: number;
          winning_trades?: number;
          total_api_cost?: number;
          last_analysis_at?: string | null;
          cash_balance?: number;
          auto_execute?: boolean;
          auto_interval?: "3h" | "10h" | "24h";
          next_auto_analysis_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      positions: {
        Row: {
          id: string;
          agent_id: string;
          ticker: string;
          quantity: number;
          entry_price: number;
          entry_date: string;
          status: "open" | "closed";
          exit_price: number | null;
          exit_date: string | null;
          realized_pnl: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          ticker: string;
          quantity: number;
          entry_price: number;
          entry_date?: string;
          status?: "open" | "closed";
          exit_price?: number | null;
          exit_date?: string | null;
          realized_pnl?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          ticker?: string;
          quantity?: number;
          entry_price?: number;
          entry_date?: string;
          status?: "open" | "closed";
          exit_price?: number | null;
          exit_date?: string | null;
          realized_pnl?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          agent_id: string;
          timestamp: string;
          action: "BUY" | "SELL" | "HOLD";
          ticker: string;
          quantity: number | null;
          price: number | null;
          total_value: number | null;
          reasoning: string;
          confidence: number;
          news_summary: string | null;
          api_cost: number;
          is_profitable: boolean | null;
          profit_loss: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          timestamp?: string;
          action: "BUY" | "SELL" | "HOLD";
          ticker: string;
          quantity?: number | null;
          price?: number | null;
          total_value?: number | null;
          reasoning: string;
          confidence: number;
          news_summary?: string | null;
          api_cost?: number;
          is_profitable?: boolean | null;
          profit_loss?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          timestamp?: string;
          action?: "BUY" | "SELL" | "HOLD";
          ticker?: string;
          quantity?: number | null;
          price?: number | null;
          total_value?: number | null;
          reasoning?: string;
          confidence?: number;
          news_summary?: string | null;
          api_cost?: number;
          is_profitable?: boolean | null;
          profit_loss?: number | null;
          created_at?: string;
        };
      };
      portfolio_snapshots: {
        Row: {
          id: string;
          agent_id: string;
          timestamp: string;
          total_value: number;
          cash: number;
          positions: Json;
          daily_return_pct: number | null;
          cumulative_return_pct: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          timestamp?: string;
          total_value: number;
          cash: number;
          positions?: Json;
          daily_return_pct?: number | null;
          cumulative_return_pct?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          timestamp?: string;
          total_value?: number;
          cash?: number;
          positions?: Json;
          daily_return_pct?: number | null;
          cumulative_return_pct?: number | null;
          created_at?: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          agent_id: string;
          agent_name: string;
          user_id: string;
          user_display_name: string;
          total_return_pct: number;
          sharpe_ratio: number | null;
          win_rate: number;
          trade_count: number;
          total_api_cost: number;
          rank: number | null;
          rank_change: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          agent_name: string;
          user_id: string;
          user_display_name: string;
          total_return_pct?: number;
          sharpe_ratio?: number | null;
          win_rate?: number;
          trade_count?: number;
          total_api_cost?: number;
          rank?: number | null;
          rank_change?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          agent_name?: string;
          user_id?: string;
          user_display_name?: string;
          total_return_pct?: number;
          sharpe_ratio?: number | null;
          win_rate?: number;
          trade_count?: number;
          total_api_cost?: number;
          rank?: number | null;
          rank_change?: number | null;
          updated_at?: string;
        };
      };
    };
    Functions: {
      check_user_credits: {
        Args: { user_uuid: string };
        Returns: {
          has_credits: boolean;
          credits_remaining: number;
          credits_reset_at: string;
        }[];
      };
      deduct_credit: {
        Args: { user_uuid: string };
        Returns: boolean;
      };
      get_agent_performance: {
        Args: { agent_uuid: string; days_back?: number };
        Returns: {
          snapshot_time: string;
          total_value: number;
          daily_return_pct: number;
        }[];
      };
      get_user_rank: {
        Args: { user_uuid: string };
        Returns: {
          agent_id: string;
          agent_name: string;
          rank: number;
          total_return_pct: number;
        }[];
      };
      refresh_leaderboard: {
        Args: Record<string, never>;
        Returns: void;
      };
      reset_user_credits: {
        Args: { user_uuid: string };
        Returns: void;
      };
    };
  };
};

// Helper types for easier usage
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Agent = Database["public"]["Tables"]["agents"]["Row"];
export type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
export type AgentUpdate = Database["public"]["Tables"]["agents"]["Update"];

export type Trade = Database["public"]["Tables"]["trades"]["Row"];
export type TradeInsert = Database["public"]["Tables"]["trades"]["Insert"];
export type TradeUpdate = Database["public"]["Tables"]["trades"]["Update"];

export type PortfolioSnapshot = Database["public"]["Tables"]["portfolio_snapshots"]["Row"];
export type PortfolioSnapshotInsert = Database["public"]["Tables"]["portfolio_snapshots"]["Insert"];

export type LeaderboardEntry = Database["public"]["Tables"]["leaderboard"]["Row"];

// Position table types
export type PositionRow = Database["public"]["Tables"]["positions"]["Row"];
export type PositionInsert = Database["public"]["Tables"]["positions"]["Insert"];
export type PositionUpdate = Database["public"]["Tables"]["positions"]["Update"];

// Risk parameters type
export type RiskParams = {
  stop_loss_pct: number;
  max_position_pct: number;
  max_trades_per_day: number;
};

// Position type for portfolio snapshots (with calculated fields)
export type Position = {
  ticker: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  value: number;
  profit_loss: number;
  profit_loss_pct: number;
};

// Extended position with unrealized P&L for display
export type PositionWithPnL = PositionRow & {
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
};

// Portfolio summary type for API responses
export type PortfolioSummary = {
  cash: number;
  positions: PositionWithPnL[];
  total_value: number;
  total_return_pct: number;
};

// Trade suggestion from AI analysis
export type TradeSuggestion = {
  action: "BUY" | "SELL" | "HOLD";
  ticker: string;
  quantity: number;
  current_price: number;
  total_cost: number;
  reasoning: string;
  confidence: number;
};

// Analysis response with suggestion and portfolio context
export type AnalysisResponse = {
  suggestion: TradeSuggestion;
  portfolio: PortfolioSummary;
};

// Execute trade request
export type ExecuteTradeRequest = {
  action: "BUY" | "SELL";
  ticker: string;
  quantity: number;
  price: number;
  enable_auto?: boolean;
  auto_interval?: "3h" | "10h" | "24h";
};

// Execute trade response
export type ExecuteTradeResponse = {
  success: boolean;
  trade: Trade;
  position?: PositionRow;
  portfolio: PortfolioSummary;
};
