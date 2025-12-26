"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleSellComplete = () => {
    fetchPortfolio(false);
    router.refresh();
  };

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, [agentId]);

  // Listen for trade execution events to auto-refresh
  useEffect(() => {
    const handleTradeExecuted = () => {
      console.log("[Portfolio] Trade executed, refreshing...");
      fetchPortfolio(false);
    };

    window.addEventListener("trade-executed", handleTradeExecuted);
    return () => {
      window.removeEventListener("trade-executed", handleTradeExecuted);
    };
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
              <PositionCard
                key={position.id}
                position={position}
                agentId={agentId}
                onSellComplete={handleSellComplete}
              />
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

interface PositionCardProps {
  position: PositionWithPnL;
  agentId: string;
  onSellComplete: () => void;
}

function PositionCard({ position, agentId, onSellComplete }: PositionCardProps) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(position.quantity);
  const [isSelling, setIsSelling] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);

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

  const handleSell = async () => {
    if (sellQuantity <= 0 || sellQuantity > position.quantity) {
      setSellError("Invalid quantity");
      return;
    }

    setIsSelling(true);
    setSellError(null);

    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SELL",
          ticker: position.ticker,
          quantity: sellQuantity,
          price: position.current_price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Sell failed");
      }

      setShowSellModal(false);
      onSellComplete();

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("trade-executed"));
    } catch (err) {
      setSellError(err instanceof Error ? err.message : "Failed to sell");
    } finally {
      setIsSelling(false);
    }
  };

  const estimatedProceeds = sellQuantity * position.current_price;
  const estimatedPnL = (position.current_price - position.entry_price) * sellQuantity;

  return (
    <>
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
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => {
                setSellQuantity(position.quantity);
                setShowSellModal(true);
              }}
              className="px-3 py-1.5 text-sm bg-loss/10 hover:bg-loss/20 text-loss rounded-lg transition-colors border border-loss/20"
            >
              Sell
            </button>
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

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowSellModal(false)}
          />
          <div className="relative bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Sell {position.ticker}
            </h3>

            {sellError && (
              <div className="mb-4 p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
                {sellError}
              </div>
            )}

            <div className="space-y-4">
              {/* Quantity Input */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Quantity (max: {position.quantity})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={position.quantity}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.min(position.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="flex-1 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setSellQuantity(position.quantity)}
                    className="px-3 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-text-secondary hover:text-text-primary"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Price Info */}
              <div className="p-4 bg-surface-elevated rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current Price</span>
                  <span className="font-mono text-text-primary">${position.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Estimated Proceeds</span>
                  <span className="font-mono font-bold text-text-primary">{formatMoney(estimatedProceeds)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text-secondary">Realized P&L</span>
                  <span className={`font-mono font-bold ${estimatedPnL >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatPnL(estimatedPnL)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSellModal(false)}
                disabled={isSelling}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSell}
                disabled={isSelling || sellQuantity <= 0}
                className="px-6 py-2 bg-loss text-white font-semibold rounded-lg hover:bg-loss/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSelling ? (
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
                    Selling...
                  </>
                ) : (
                  `Sell ${sellQuantity} shares`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
