"use client";

import { useState } from "react";
import type { TradeSuggestion, PortfolioSummary } from "@/types/database";

interface TradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (enableAuto: boolean, autoInterval: "3h" | "10h" | "24h") => Promise<void>;
  suggestion: TradeSuggestion;
  portfolio: PortfolioSummary;
  newsSummary: string;
  riskAssessment: string;
  isCached?: boolean;
  cacheAgeMinutes?: number;
  onRefresh?: () => void;
}

export function TradeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  suggestion,
  portfolio,
  newsSummary,
  riskAssessment,
  isCached,
  cacheAgeMinutes,
  onRefresh,
}: TradeConfirmationModalProps) {
  const [enableAuto, setEnableAuto] = useState(false);
  const [autoInterval, setAutoInterval] = useState<"3h" | "10h" | "24h">("24h");
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const handleConfirm = async () => {
    setIsExecuting(true);
    try {
      await onConfirm(enableAuto, autoInterval);
    } finally {
      setIsExecuting(false);
    }
  };

  const cashAfterTrade =
    suggestion.action === "BUY"
      ? portfolio.cash - suggestion.total_cost
      : portfolio.cash + suggestion.total_cost;

  const canAfford =
    suggestion.action === "BUY"
      ? portfolio.cash >= suggestion.total_cost
      : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-lg text-lg font-bold ${
                  suggestion.action === "BUY"
                    ? "bg-profit/20 text-profit"
                    : suggestion.action === "SELL"
                    ? "bg-loss/20 text-loss"
                    : "bg-text-tertiary/20 text-text-secondary"
                }`}
              >
                {suggestion.action}
              </span>
              <div>
                <span className="text-2xl font-mono font-bold text-text-primary">
                  {suggestion.ticker}
                </span>
              </div>
            </div>
            {isCached && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full">
                  Cached ({cacheAgeMinutes}m ago)
                </span>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="text-xs text-primary hover:text-primary-muted underline"
                  >
                    Refresh
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Trade Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Quantity</span>
              <span className="font-mono text-text-primary">
                {suggestion.quantity} shares
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Price</span>
              <span className="font-mono text-text-primary">
                ${suggestion.current_price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Cost</span>
              <span className="font-mono font-bold text-text-primary">
                {formatMoney(suggestion.total_cost)}
              </span>
            </div>
          </div>

          {/* Cash Impact */}
          <div className="p-4 bg-surface-elevated rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Available Cash</span>
              <span className="font-mono text-text-primary">
                {formatMoney(portfolio.cash)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">After Trade</span>
              <span
                className={`font-mono font-bold ${
                  cashAfterTrade >= 0 ? "text-text-primary" : "text-loss"
                }`}
              >
                {formatMoney(cashAfterTrade)}
              </span>
            </div>
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
            <span className="text-text-secondary">AI Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
              <span className="font-mono text-primary">
                {(suggestion.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">
              AI Reasoning
            </h4>
            <p className="text-sm text-text-primary bg-surface-elevated p-3 rounded-lg">
              {suggestion.reasoning}
            </p>
          </div>

          {/* News Summary */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">
              News Summary
            </h4>
            <p className="text-sm text-text-tertiary bg-surface-elevated p-3 rounded-lg">
              {newsSummary}
            </p>
          </div>

          {/* Risk Assessment */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Risk Level:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                riskAssessment === "Low"
                  ? "bg-profit/10 text-profit"
                  : riskAssessment === "High"
                  ? "bg-loss/10 text-loss"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {riskAssessment}
            </span>
          </div>

          {/* Auto-Trading Option */}
          <div className="p-4 bg-surface-elevated rounded-lg space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAuto}
                onChange={(e) => setEnableAuto(e.target.checked)}
                className="w-5 h-5 rounded border-border bg-surface text-primary focus:ring-primary"
              />
              <span className="text-text-primary">Enable auto-trading</span>
            </label>

            {enableAuto && (
              <div className="flex items-center gap-2 pl-8">
                <span className="text-sm text-text-secondary">Interval:</span>
                <div className="flex gap-2">
                  {(["3h", "10h", "24h"] as const).map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setAutoInterval(interval)}
                      className={`px-3 py-1 rounded text-sm ${
                        autoInterval === interval
                          ? "bg-primary text-background"
                          : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {enableAuto && (
              <p className="text-xs text-text-tertiary pl-8">
                Future trades will execute automatically every {autoInterval}{" "}
                without confirmation.
              </p>
            )}
          </div>

          {/* Warning if can't afford */}
          {!canAfford && (
            <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
              Insufficient funds. You need {formatMoney(suggestion.total_cost)}{" "}
              but only have {formatMoney(portfolio.cash)}.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isExecuting || !canAfford}
            className="px-6 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExecuting ? (
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
                Executing...
              </>
            ) : (
              `Confirm ${suggestion.action}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
