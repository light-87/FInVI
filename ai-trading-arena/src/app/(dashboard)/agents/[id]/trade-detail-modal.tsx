"use client";

import { useState } from "react";
import type { Trade } from "@/types/database";

interface TradeDetailModalProps {
  trade: Trade;
}

export function TradeDetailModal({ trade }: TradeDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-secondary hover:text-secondary-muted text-xs underline"
      >
        View Details
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-surface border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    trade.action === "BUY"
                      ? "bg-profit/10 text-profit"
                      : trade.action === "SELL"
                      ? "bg-loss/10 text-loss"
                      : "bg-text-tertiary/10 text-text-tertiary"
                  }`}
                >
                  {trade.action}
                </span>
                <span className="text-xl font-mono font-bold text-text-primary">
                  {trade.ticker}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-tertiary hover:text-text-primary text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Trade Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Date</p>
                  <p className="font-mono text-text-primary">
                    {new Date(trade.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Price</p>
                  <p className="font-mono text-text-primary">
                    ${trade.price?.toFixed(2) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Quantity</p>
                  <p className="font-mono text-text-primary">
                    {trade.quantity || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Confidence</p>
                  <p className="font-mono text-primary">
                    {(trade.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  AI Reasoning
                </h3>
                <div className="bg-surface-elevated rounded-lg p-4">
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {trade.reasoning || "No reasoning provided"}
                  </p>
                </div>
              </div>

              {/* News Summary */}
              {trade.news_summary && (
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    News Context
                  </h3>
                  <div className="bg-surface-elevated rounded-lg p-4">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">
                      {trade.news_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Cost & P/L */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-text-tertiary">API Cost</p>
                  <p className="font-mono text-text-secondary">
                    ${trade.api_cost.toFixed(4)}
                  </p>
                </div>
                {trade.profit_loss !== null && (
                  <div className="text-right">
                    <p className="text-xs text-text-tertiary">Profit/Loss</p>
                    <p
                      className={`font-mono font-bold ${
                        (trade.profit_loss ?? 0) >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {(trade.profit_loss ?? 0) >= 0 ? "+" : ""}$
                      {(trade.profit_loss ?? 0).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
