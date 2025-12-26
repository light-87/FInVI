import Link from "next/link";
import Image from "next/image";
import mockAgents from "@/data/mock-agents.json";
import mockTrades from "@/data/mock-trades.json";

export default function PitchDashboard() {
  const { agents, platformStats } = mockAgents;
  const { trades, recentActivity } = mockTrades;
  const topAgent = agents[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/icons/logo/vivy-logo.svg" width={32} height={32} alt="Vivy" unoptimized />
                <span className="text-2xl font-bold font-display text-primary">Vivy</span>
              </Link>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">
                LIVE DEMO
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
                </span>
                <span className="text-text-secondary">Platform Active</span>
              </div>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-all text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Active Agents"
              value={platformStats.activeAgents.toLocaleString()}
              subtext={`of ${platformStats.totalAgents.toLocaleString()} total`}
              trend="+12% this week"
              positive
            />
            <StatCard
              label="Total Trades"
              value={platformStats.totalTrades.toLocaleString()}
              subtext="Executed today: 847"
              trend="+28% vs yesterday"
              positive
            />
            <StatCard
              label="Avg. Return"
              value={`+${platformStats.avgReturn}%`}
              subtext="Across all agents"
              trend="Top: +47.2%"
              positive
            />
            <StatCard
              label="Platform Volume"
              value={`$${(platformStats.totalVolume / 1000000).toFixed(1)}M`}
              subtext="Paper trading value"
              trend="+34% this month"
              positive
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Leaderboard + Agent Detail */}
          <div className="lg:col-span-2 space-y-8">
            {/* Leaderboard */}
            <section className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-text-primary">Top Performing Agents</h2>
                  <p className="text-text-tertiary text-sm">Real-time leaderboard • Updates every minute</p>
                </div>
                <div className="text-xs font-mono text-text-tertiary">
                  Last updated: just now
                </div>
              </div>

              <div className="divide-y divide-border">
                {agents.slice(0, 10).map((agent, index) => (
                  <div
                    key={agent.id}
                    className={`p-4 flex items-center gap-4 hover:bg-surface-elevated transition-colors ${
                      index === 0 ? "bg-gradient-to-r from-rank-gold/10 to-transparent" : ""
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {index === 0 && <Image src="/icons/badges/rank-gold.svg" width={28} height={28} alt="1st" unoptimized />}
                      {index === 1 && <Image src="/icons/badges/rank-silver.svg" width={28} height={28} alt="2nd" unoptimized />}
                      {index === 2 && <Image src="/icons/badges/rank-bronze.svg" width={28} height={28} alt="3rd" unoptimized />}
                      {index > 2 && (
                        <span className="text-text-tertiary font-mono text-lg">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-display text-text-primary truncate">
                          {agent.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-surface-elevated rounded text-text-tertiary">
                          {agent.model}
                        </span>
                      </div>
                      <p className="text-sm text-text-tertiary truncate">{agent.strategy.slice(0, 60)}...</p>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold text-lg ${agent.totalReturn > 0 ? "text-profit" : "text-loss"}`}>
                        {agent.totalReturn > 0 ? "+" : ""}{agent.totalReturn}%
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {agent.winRate}% win rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Agent Detail */}
            <section className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/icons/badges/rank-gold.svg" width={32} height={32} alt="1st place" unoptimized />
                      <h2 className="text-2xl font-bold font-display text-text-primary">{topAgent.name}</h2>
                      <span className="px-2 py-1 bg-profit/20 text-profit text-xs font-mono rounded">
                        TOP PERFORMER
                      </span>
                    </div>
                    <p className="text-text-secondary max-w-xl">{topAgent.strategy}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-profit">+{topAgent.totalReturn}%</div>
                    <div className="text-sm text-text-tertiary">Total Return</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  <MiniStat label="Portfolio" value={`$${(topAgent.portfolioValue / 1000).toFixed(1)}K`} />
                  <MiniStat label="Win Rate" value={`${topAgent.winRate}%`} />
                  <MiniStat label="Trades" value={topAgent.totalTrades.toString()} />
                  <MiniStat label="Sharpe" value={topAgent.sharpeRatio.toFixed(2)} />
                </div>
              </div>

              {/* Recent Trades */}
              <div className="p-6">
                <h3 className="text-lg font-bold font-display text-text-primary mb-4">Recent Trades</h3>
                <div className="space-y-4">
                  {trades.slice(0, 4).map((trade) => (
                    <div key={trade.id} className="bg-background border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded font-mono font-bold text-sm ${
                            trade.action === "BUY"
                              ? "bg-profit/20 text-profit"
                              : "bg-loss/20 text-loss"
                          }`}>
                            {trade.action}
                          </span>
                          <span className="font-bold font-mono text-text-primary text-lg">{trade.ticker}</span>
                          <span className="text-text-tertiary text-sm">
                            {trade.quantity} shares @ ${trade.price}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-bold ${trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                            {trade.pnl >= 0 ? "+" : ""}{trade.pnlPercent}%
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-surface rounded-lg p-3 font-mono text-sm">
                        <div className="flex items-center gap-2 text-text-tertiary mb-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI REASONING
                        </div>
                        <p className="text-text-secondary leading-relaxed">{trade.reasoning}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <span className="text-secondary text-xs">📰 {trade.newsHeadline}</span>
                          <span className="text-primary text-xs">Confidence: {trade.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Live Activity */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <section className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold font-display text-text-primary">Live Activity</h3>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs text-text-tertiary">Live</span>
                </div>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-surface-elevated transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-text-primary text-sm">{activity.agent}</span>
                      <span className="text-xs text-text-tertiary">{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-mono font-bold ${
                        activity.action === "BUY" ? "text-profit" : "text-loss"
                      }`}>
                        {activity.action}
                      </span>
                      <span className="text-text-secondary">{activity.ticker}</span>
                      <span className="text-text-tertiary ml-auto">{activity.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Vivy */}
            <section className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-bold font-display text-text-primary mb-4">Why Investors Love Vivy</h3>
              <div className="space-y-4">
                <Feature
                  iconSrc="/icons/investor/investor-alpha.svg"
                  title="Crowdsourced Alpha"
                  description="Every strategy is a data point. We're building the largest dataset of explainable trading strategies."
                />
                <Feature
                  iconSrc="/icons/investor/investor-brain.svg"
                  title="No Black Boxes"
                  description="Every trade comes with full reasoning. Users learn, we learn, AI improves."
                />
                <Feature
                  iconSrc="/icons/investor/investor-rocket.svg"
                  title="Viral Growth Loop"
                  description="Leaderboard competition drives engagement. Top strategies get copied."
                />
                <Feature
                  iconSrc="/icons/investor/investor-money.svg"
                  title="Clear Monetization"
                  description="Pay-per-analysis model. Users pay for AI usage, we take margin."
                />
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-6">
              <h3 className="font-bold font-display text-text-primary mb-4">Platform Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Users</span>
                  <span className="font-mono font-bold text-text-primary">{platformStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Agents Created</span>
                  <span className="font-mono font-bold text-text-primary">{platformStats.totalAgents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Trades This Month</span>
                  <span className="font-mono font-bold text-text-primary">{platformStats.totalTrades.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Win Rate</span>
                  <span className="font-mono font-bold text-profit">{platformStats.avgWinRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Best Performer</span>
                  <span className="font-mono font-bold text-profit">+{platformStats.topReturn}%</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom CTA */}
        <section className="mt-12 text-center py-12 border-t border-border">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary mb-4">
            Ready to Build Your Agent?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Join {platformStats.totalUsers.toLocaleString()} users already creating AI trading strategies on Vivy.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary-muted transition-all glow-primary text-lg"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-text-tertiary text-sm">
            10 free analyses • No credit card required
          </p>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  trend,
  positive
}: {
  label: string;
  value: string;
  subtext: string;
  trend: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="text-text-tertiary text-sm mb-1">{label}</div>
      <div className="text-2xl md:text-3xl font-mono font-bold text-text-primary mb-1">{value}</div>
      <div className="text-xs text-text-tertiary mb-2">{subtext}</div>
      <div className={`text-xs font-mono ${positive ? "text-profit" : "text-loss"}`}>
        {trend}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-mono font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-tertiary">{label}</div>
    </div>
  );
}

function Feature({ iconSrc, title, description }: { iconSrc: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        <Image src={iconSrc} width={24} height={24} alt={title} unoptimized />
      </div>
      <div>
        <h4 className="font-semibold text-text-primary text-sm">{title}</h4>
        <p className="text-text-tertiary text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
