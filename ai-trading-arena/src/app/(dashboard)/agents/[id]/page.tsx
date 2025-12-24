import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Agent, Trade, RiskParams } from "@/types/database";
import Link from "next/link";
import { AgentActions } from "./agent-actions";
import { RunAnalysis } from "./run-analysis";
import { PerformanceChart } from "@/components/performance-chart";
import { TradeDetailModal } from "./trade-detail-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agent } = (await supabase
    .from("agents")
    .select("name")
    .eq("id", id)
    .single()) as { data: { name: string } | null };

  return {
    title: agent ? `${agent.name} | AI Trading Arena` : "Agent | AI Trading Arena",
  };
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch agent
  const { data: agent } = (await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()) as { data: Agent | null };

  if (!agent) {
    notFound();
  }

  // Fetch recent trades
  const { data: trades } = (await supabase
    .from("trades")
    .select("*")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(10)) as { data: Trade[] | null };

  const riskParams = agent.risk_params as RiskParams;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/agents"
            className="text-sm text-text-tertiary hover:text-text-secondary mb-2 inline-block"
          >
            &larr; Back to Agents
          </Link>
          <h1 className="text-3xl font-bold font-display text-text-primary">
            {agent.name}
          </h1>
          {agent.description && (
            <p className="text-text-secondary mt-2">{agent.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                agent.status === "active"
                  ? "bg-profit/10 text-profit"
                  : agent.status === "paused"
                  ? "bg-warning/10 text-warning"
                  : "bg-text-tertiary/10 text-text-tertiary"
              }`}
            >
              {agent.status}
            </span>
            <span className="text-sm text-text-tertiary">{agent.llm_model}</span>
            {agent.is_public && (
              <span className="text-xs text-secondary">Public</span>
            )}
          </div>
        </div>

        <AgentActions agentId={agent.id} agentName={agent.name} status={agent.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Value"
          value={`$${agent.current_value.toLocaleString()}`}
          subtext={`Started: $${agent.starting_capital.toLocaleString()}`}
        />
        <StatCard
          label="Total Return"
          value={`${agent.total_return_pct >= 0 ? "+" : ""}${agent.total_return_pct.toFixed(2)}%`}
          valueColor={agent.total_return_pct >= 0 ? "text-profit" : "text-loss"}
        />
        <StatCard
          label="Win Rate"
          value={`${(agent.win_rate * 100).toFixed(0)}%`}
          subtext={`${agent.winning_trades}/${agent.total_trades} trades`}
        />
        <StatCard
          label="Total API Cost"
          value={`$${agent.total_api_cost.toFixed(3)}`}
          subtext="LLM usage"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Prompt */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            System Prompt
          </h2>
          <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono bg-surface-elevated rounded-lg p-4 max-h-64 overflow-y-auto">
            {agent.system_prompt}
          </pre>
        </div>

        {/* Risk Parameters */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Risk Parameters
          </h2>
          <div className="space-y-4">
            <RiskParamRow label="Stop Loss" value={`${riskParams.stop_loss_pct}%`} />
            <RiskParamRow label="Max Position" value={`${riskParams.max_position_pct}%`} />
            <RiskParamRow
              label="Max Trades/Day"
              value={`${riskParams.max_trades_per_day}`}
            />
          </div>

          <hr className="my-4 border-border" />

          <h3 className="text-sm font-medium text-text-secondary mb-3">
            News Sources
          </h3>
          <div className="flex flex-wrap gap-2">
            {(agent.news_sources as string[]).map((source) => (
              <span
                key={source}
                className="px-2 py-1 bg-surface-elevated rounded text-xs text-text-secondary"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Portfolio Performance
        </h2>
        <PerformanceChart agentId={agent.id} height={250} />
      </div>

      {/* Recent Trades */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Trades
          </h2>
          {trades && trades.length > 0 && (
            <span className="text-sm text-text-tertiary">
              Showing last {trades.length} trades
            </span>
          )}
        </div>

        {trades && trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-text-tertiary border-b border-border">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Ticker</th>
                  <th className="pb-3 font-medium text-right">Confidence</th>
                  <th className="pb-3 font-medium text-right">P/L</th>
                  <th className="pb-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50">
                    <td className="py-3 text-sm text-text-secondary">
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.action === "BUY"
                            ? "bg-profit/10 text-profit"
                            : trade.action === "SELL"
                            ? "bg-loss/10 text-loss"
                            : "bg-text-tertiary/10 text-text-tertiary"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-mono text-text-primary">
                      {trade.ticker}
                    </td>
                    <td className="py-3 text-sm font-mono text-text-secondary text-right">
                      {(trade.confidence * 100).toFixed(0)}%
                    </td>
                    <td
                      className={`py-3 text-sm font-mono text-right ${
                        trade.profit_loss === null
                          ? "text-text-tertiary"
                          : (trade.profit_loss ?? 0) >= 0
                          ? "text-profit"
                          : "text-loss"
                      }`}
                    >
                      {trade.profit_loss === null
                        ? "-"
                        : `${(trade.profit_loss ?? 0) >= 0 ? "+" : ""}$${(
                            trade.profit_loss ?? 0
                          ).toFixed(2)}`}
                    </td>
                    <td className="py-3 text-right">
                      <TradeDetailModal trade={trade} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <p>No trades yet</p>
            <p className="text-sm mt-1">Run an analysis to make your first trade</p>
          </div>
        )}
      </div>

      {/* Run Analysis */}
      <RunAnalysis agentId={agent.id} isActive={agent.status === "active"} />
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  valueColor = "text-text-primary",
}: {
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-text-tertiary text-xs mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${valueColor}`}>{value}</p>
      {subtext && <p className="text-xs text-text-tertiary mt-1">{subtext}</p>}
    </div>
  );
}

function RiskParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-mono text-primary">{value}</span>
    </div>
  );
}
