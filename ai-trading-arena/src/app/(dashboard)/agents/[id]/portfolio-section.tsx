"use client";

import { useState, useEffect } from "react";
import type { PortfolioSummary, PositionWithPnL } from "@/types/database";

interface PortfolioSectionProps {
  agentId: string;
  initialCash: number;
  startingCapital: number;
}

export function PortfolioSection({
  agentId,
  initialCash,
  startingCapital,
}: PortfolioSectionProps) {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, [agentId]);

  const fetchPortfolio = async (createSnapshot = false) => {
    try {
      const method = createSnapshot ? "POST" : "GET";
      const res = await fetch(`/api/agents/${agentId}/refresh`, { method });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch portfolio");
      }

      setPortfolio(data.data.portfolio);
      setLastUpdated(data.last_updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPortfolio(true); // Create snapshot on manual refresh
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const formatPnL = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + formatMoney(n);
  };

  const formatPct = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Portfolio</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-elevated rounded w-1/3"></div>
          <div className="h-20 bg-surface-elevated rounded"></div>
          <div className="h-20 bg-surface-elevated rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Portfolio</h2>
          <button
            onClick={() => fetchPortfolio()}
            className="text-sm text-primary hover:text-primary-muted"
          >
            Retry
          </button>
        </div>
        <div className="text-center py-4 text-loss">{error}</div>
      </div>
    );
  }

  // Use initial values if no portfolio data yet
  const cash = portfolio?.cash ?? initialCash;
  const positions = portfolio?.positions ?? [];
  const totalValue = portfolio?.total_value ?? initialCash;
  const totalReturnPct = portfolio?.total_return_pct ?? 0;
  const totalUnrealizedPnL = positions.reduce(
    (sum, p) => sum + p.unrealized_pnl,
    0
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Portfolio</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-text-tertiary">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 text-sm bg-surface-elevated hover:bg-border text-text-secondary rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Refreshing...
              </>
            ) : (
              "Refresh Prices"
            )}
          </button>
        </div>
      </div>

      {/* Cash Balance */}
      <div className="mb-6 p-4 bg-surface-elevated rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Cash Available</span>
          <span className="text-xl font-mono font-bold text-text-primary">
            {formatMoney(cash)}
          </span>
        </div>
      </div>

      {/* Positions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Open Positions ({positions.length})
        </h3>

        {positions.length === 0 ? (
          <div className="text-center py-6 text-text-tertiary bg-surface-elevated rounded-lg">
            <p>No open positions</p>
            <p className="text-sm mt-1">Run an analysis to start trading</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position: PositionWithPnL) => (
              <PositionCard key={position.id} position={position} />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Value</span>
          <span className="text-lg font-mono font-bold text-text-primary">
            {formatMoney(totalValue)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Starting Capital</span>
          <span className="text-sm font-mono text-text-tertiary">
            {formatMoney(startingCapital)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Return</span>
          <span
            className={`text-lg font-mono font-bold ${
              totalReturnPct >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {formatPct(totalReturnPct)}
          </span>
        </div>
        {positions.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Unrealized P&L</span>
            <span
              className={`font-mono ${
                totalUnrealizedPnL >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {formatPnL(totalUnrealizedPnL)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PositionCard({ position }: { position: PositionWithPnL }) {
  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const formatPnL = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + formatMoney(n);
  };

  const formatPct = (n: number) => {
    const sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  };

  const isProfitable = position.unrealized_pnl >= 0;

  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-border/50">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-lg font-mono font-bold text-text-primary">
            {position.ticker}
          </span>
          <span className="text-sm text-text-tertiary ml-2">
            {position.quantity} shares
          </span>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-mono font-bold ${
              isProfitable ? "text-profit" : "text-loss"
            }`}
          >
            {formatPnL(position.unrealized_pnl)}
          </div>
          <div
            className={`text-sm ${
              isProfitable ? "text-profit" : "text-loss"
            }`}
          >
            {formatPct(position.unrealized_pnl_pct)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div>
          <span className="text-text-tertiary">Entry:</span>{" "}
          <span className="font-mono">${position.entry_price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-text-tertiary">Current:</span>{" "}
          <span className="font-mono">${position.current_price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-text-tertiary">Value:</span>{" "}
          <span className="font-mono">{formatMoney(position.current_value)}</span>
        </div>
      </div>
    </div>
  );
}
