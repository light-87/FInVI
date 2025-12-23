import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "My Agents | AI Trading Arena",
  description: "Manage your AI trading agents",
};

export default async function AgentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's agents
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary">
            My Agents
          </h1>
          <p className="text-text-secondary mt-1">
            Create and manage your AI trading agents
          </p>
        </div>
        <Link
          href="/agents/new"
          className="px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors"
        >
          + Create Agent
        </Link>
      </div>

      {/* Agents Grid */}
      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="bg-surface border border-border rounded-lg p-6 hover:border-border-active transition-colors group"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    {agent.llm_model}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === "active"
                      ? "bg-profit/10 text-profit"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-tertiary text-xs mb-1">Return</p>
                  <p
                    className={`text-lg font-mono font-bold ${
                      agent.total_return_pct >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    {agent.total_return_pct >= 0 ? "+" : ""}
                    {agent.total_return_pct.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs mb-1">Win Rate</p>
                  <p className="text-lg font-mono font-bold text-text-primary">
                    {(agent.win_rate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs mb-1">Trades</p>
                  <p className="text-lg font-mono font-bold text-text-primary">
                    {agent.total_trades}
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs mb-1">API Cost</p>
                  <p className="text-lg font-mono font-bold text-text-secondary">
                    ${agent.total_api_cost.toFixed(3)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-surface border border-border rounded-lg">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No agents yet
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your first AI trading agent to start analyzing markets and
            competing on the leaderboard.
          </p>
          <Link
            href="/agents/new"
            className="inline-block px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors"
          >
            Create Your First Agent
          </Link>
        </div>
      )}
    </div>
  );
}
