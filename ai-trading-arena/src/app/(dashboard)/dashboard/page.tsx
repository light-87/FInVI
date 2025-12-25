import { createClient } from "@/lib/supabase/server";
import type { Agent, Trade, User } from "@/types/database";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Vivy",
  description: "Your AI trading performance overview",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile
  const { data: profile } = (await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()) as { data: User | null };

  // Get all user's agents with stats
  const { data: agents } = (await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: Agent[] | null };

  // Get recent trades across all agents
  const agentIds = agents?.map((a) => a.id) || [];
  const { data: recentTrades } = agentIds.length > 0
    ? ((await supabase
        .from("trades")
        .select("*, agents!inner(name)")
        .in("agent_id", agentIds)
        .order("created_at", { ascending: false })
        .limit(10)) as { data: (Trade & { agents: { name: string } })[] | null })
    : { data: null };

  // Calculate aggregate stats
  const totalValue = agents?.reduce((sum, a) => sum + a.current_value, 0) || 0;
  const totalStarting = agents?.reduce((sum, a) => sum + a.starting_capital, 0) || 0;
  const totalReturn = totalStarting > 0 ? ((totalValue - totalStarting) / totalStarting) * 100 : 0;
  const totalTrades = agents?.reduce((sum, a) => sum + a.total_trades, 0) || 0;
  const totalApiCost = agents?.reduce((sum, a) => sum + a.total_api_cost, 0) || 0;
  const activeAgents = agents?.filter((a) => a.status === "active").length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          Welcome back, {profile?.display_name || "Trader"}
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Portfolio"
          value={`$${totalValue.toLocaleString()}`}
          subtext={`${agents?.length || 0} agents`}
        />
        <StatCard
          label="Total Return"
          value={`${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`}
          valueColor={totalReturn >= 0 ? "text-profit" : "text-loss"}
          subtext={`$${(totalValue - totalStarting).toLocaleString()}`}
        />
        <StatCard
          label="Total Trades"
          value={totalTrades.toString()}
          subtext="All time"
        />
        <StatCard
          label="API Costs"
          value={`$${totalApiCost.toFixed(3)}`}
          subtext="LLM usage"
        />
        <StatCard
          label="Credits"
          value={profile?.credits_remaining?.toString() || "0"}
          subtext="Remaining today"
          valueColor="text-primary"
        />
        <StatCard
          label="Active Agents"
          value={activeAgents.toString()}
          subtext={`of ${agents?.length || 0} total`}
          valueColor="text-profit"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Performance */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Agent Performance
            </h2>
            <Link
              href="/agents"
              className="text-sm text-secondary hover:text-secondary-muted"
            >
              View all →
            </Link>
          </div>

          {agents && agents.length > 0 ? (
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg hover:border-border-active border border-transparent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.status === "active" ? "bg-profit" : "bg-warning"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-text-primary">{agent.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {agent.total_trades} trades · {agent.llm_model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-bold ${
                        agent.total_return_pct >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {agent.total_return_pct >= 0 ? "+" : ""}
                      {agent.total_return_pct.toFixed(2)}%
                    </p>
                    <p className="text-xs text-text-tertiary font-mono">
                      ${agent.current_value.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-tertiary mb-4">No agents yet</p>
              <Link
                href="/agents/new"
                className="px-4 py-2 bg-primary text-background font-medium rounded-lg hover:bg-primary-muted transition-colors"
              >
                Create Your First Agent
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/agents/new"
              className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-medium text-text-primary">Create Agent</p>
                <p className="text-xs text-text-tertiary">
                  Build a new AI trading strategy
                </p>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-3 p-4 bg-surface-elevated border border-border rounded-lg hover:border-border-active transition-colors"
            >
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-medium text-text-primary">Leaderboard</p>
                <p className="text-xs text-text-tertiary">
                  See top performing agents
                </p>
              </div>
            </Link>
            <Link
              href="/arena"
              className="flex items-center gap-3 p-4 bg-surface-elevated border border-border rounded-lg hover:border-border-active transition-colors"
            >
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="font-medium text-text-primary">Arena</p>
                <p className="text-xs text-text-tertiary">
                  Watch live competition
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Trades
          </h2>
          <span className="text-sm text-text-tertiary">
            Across all agents
          </span>
        </div>

        {recentTrades && recentTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-text-tertiary border-b border-border">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Agent</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Ticker</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50">
                    <td className="py-3 text-sm text-text-tertiary">
                      {formatTimeAgo(trade.created_at)}
                    </td>
                    <td className="py-3 text-sm text-text-primary">
                      {trade.agents?.name}
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
                      ${trade.price?.toFixed(2) || "-"}
                    </td>
                    <td className="py-3 text-sm font-mono text-text-secondary text-right">
                      {(trade.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <p>No trades yet</p>
            <p className="text-sm mt-1">
              Run analyses on your agents to start trading
            </p>
          </div>
        )}
      </div>
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
