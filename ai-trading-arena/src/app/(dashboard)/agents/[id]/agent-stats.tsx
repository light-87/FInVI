"use client";

import { useState, useEffect } from "react";

interface AgentStatsProps {
  agentId: string;
  startingCapital: number;
  initialCurrentValue: number;
  winRate: number;
  winningTrades: number;
  totalTrades: number;
  totalApiCost: number;
}

interface PortfolioData {
  total_value: number;
  total_return_pct: number;
}

export function AgentStats({
  agentId,
  startingCapital,
  initialCurrentValue,
  winRate,
  winningTrades,
  totalTrades,
  totalApiCost,
}: AgentStatsProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch(`/api/agents/${agentId}/refresh`);
        const data = await res.json();

        if (data.success && data.data?.portfolio) {
          setPortfolio({
            total_value: data.data.portfolio.total_value,
            total_return_pct: data.data.portfolio.total_return_pct,
          });
        }
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolio();

    // Listen for trade events to refresh
    const handleTradeExecuted = () => {
      fetchPortfolio();
    };

    window.addEventListener("trade-executed", handleTradeExecuted);
    return () => {
      window.removeEventListener("trade-executed", handleTradeExecuted);
    };
  }, [agentId]);

  // Use live data if available, otherwise fall back to initial values
  const currentValue = portfolio?.total_value ?? initialCurrentValue;
  const totalReturnPct = portfolio?.total_return_pct ??
    (startingCapital > 0 ? ((initialCurrentValue - startingCapital) / startingCapital) * 100 : 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Current Value"
        value={`$${currentValue.toLocaleString()}`}
        subtext={`Started: $${startingCapital.toLocaleString()}`}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Return"
        value={`${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%`}
        valueColor={totalReturnPct >= 0 ? "text-profit" : "text-loss"}
        isLoading={isLoading}
      />
      <StatCard
        label="Win Rate"
        value={`${(winRate * 100).toFixed(0)}%`}
        subtext={`${winningTrades}/${totalTrades} trades`}
      />
      <StatCard
        label="Total API Cost"
        value={`$${totalApiCost.toFixed(3)}`}
        subtext="LLM usage"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  valueColor = "text-text-primary",
  isLoading = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-text-tertiary text-xs mb-1">{label}</p>
      {isLoading ? (
        <div className="h-7 bg-surface-elevated rounded animate-pulse w-20"></div>
      ) : (
        <p className={`text-xl font-mono font-bold ${valueColor}`}>{value}</p>
      )}
      {subtext && <p className="text-xs text-text-tertiary mt-1">{subtext}</p>}
    </div>
  );
}
