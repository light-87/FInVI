"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TradeConfirmationModal } from "./trade-confirmation-modal";
import type { TradeSuggestion, PortfolioSummary } from "@/types/database";

interface AnalysisResult {
  suggestion: TradeSuggestion;
  portfolio: PortfolioSummary;
}

interface AnalysisMeta {
  news_summary: string;
  risk_assessment: string;
  api_cost: number;
  input_tokens: number;
  output_tokens: number;
  credits_remaining: number;
  news_source: string;
  news_count: number;
  is_cached?: boolean;
  cache_age_minutes?: number;
  cached_at?: string;
  expires_at?: string;
  recommendation_id?: string | null;
}

interface RunAnalysisProps {
  agentId: string;
  isActive: boolean;
  autoExecute?: boolean;
  autoInterval?: "3h" | "10h" | "24h";
}

export function RunAnalysis({ agentId, isActive, autoExecute = false, autoInterval = "24h" }: RunAnalysisProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<AnalysisMeta | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const executeTradeAutomatically = async (suggestion: TradeSuggestion) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: suggestion.action,
          ticker: suggestion.ticker,
          quantity: suggestion.quantity,
          price: suggestion.current_price,
          enable_auto: true,
          auto_interval: autoInterval,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Trade execution failed");
      }

      setSuccessMessage(
        `Auto-executed: ${suggestion.action} ${suggestion.quantity} ${suggestion.ticker} @ $${suggestion.current_price.toFixed(2)}`
      );

      // Dispatch event to notify portfolio section to refresh
      window.dispatchEvent(new CustomEvent("trade-executed"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-execution failed");
    }
  };

  const handleRunAnalysis = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setAnalysisResult(null);

    try {
      const res = await fetch(`/api/agents/${agentId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force_refresh: forceRefresh }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Analysis failed");
      }

      setAnalysisResult(data.data);
      setAnalysisMeta(data.meta);

      // If action is HOLD, no confirmation needed
      if (data.data.suggestion.action === "HOLD") {
        const cacheNote = data.meta.is_cached
          ? ` (cached ${data.meta.cache_age_minutes}m ago)`
          : "";
        setSuccessMessage(`AI recommends: HOLD - No trade suggested${cacheNote}`);
      } else if (autoExecute) {
        // Auto-execute enabled - execute BUY or SELL immediately without confirmation
        await executeTradeAutomatically(data.data.suggestion);
      } else {
        // Show confirmation modal for BUY/SELL
        setShowConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTrade = async (
    enableAuto: boolean,
    autoInterval: "3h" | "10h" | "24h"
  ) => {
    if (!analysisResult) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: analysisResult.suggestion.action,
          ticker: analysisResult.suggestion.ticker,
          quantity: analysisResult.suggestion.quantity,
          price: analysisResult.suggestion.current_price,
          enable_auto: enableAuto,
          auto_interval: autoInterval,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Trade execution failed");
      }

      setShowConfirmation(false);
      setSuccessMessage(
        `Trade executed: ${analysisResult.suggestion.action} ${analysisResult.suggestion.quantity} ${analysisResult.suggestion.ticker} @ $${analysisResult.suggestion.current_price.toFixed(2)}`
      );

      // Dispatch event to notify portfolio section to refresh
      window.dispatchEvent(new CustomEvent("trade-executed"));

      router.refresh(); // Refresh page to show new trade
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade execution failed");
      setShowConfirmation(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSuccessMessage("Trade cancelled - suggestion not executed");
  };

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-profit/10 border border-profit/20 rounded-lg text-profit">
            {successMessage}
          </div>
        )}

        {/* HOLD Result Display */}
        {analysisResult && analysisResult.suggestion.action === "HOLD" && analysisMeta && (
          <div className="mb-6 bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-text-primary">Analysis Complete</h4>
                {analysisMeta.is_cached && (
                  <span className="px-2 py-0.5 text-xs bg-secondary/20 text-secondary rounded-full">
                    Cached ({analysisMeta.cache_age_minutes}m ago)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {analysisMeta.is_cached && (
                  <button
                    onClick={() => handleRunAnalysis(true)}
                    disabled={isLoading}
                    className="text-xs text-primary hover:text-primary-muted underline disabled:opacity-50"
                  >
                    Refresh (1 credit)
                  </button>
                )}
                <span className="text-xs text-text-tertiary">
                  {analysisMeta.is_cached ? "No credits used" : `Cost: $${analysisMeta.api_cost.toFixed(4)}`} | Credits: {analysisMeta.credits_remaining}
                </span>
              </div>
            </div>

            {/* HOLD Badge */}
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-2 rounded-lg text-lg font-bold bg-text-tertiary/20 text-text-secondary">
                HOLD
              </span>
              <span className="text-xl font-mono text-text-primary">
                {analysisResult.suggestion.ticker}
              </span>
              <div className="ml-auto text-right">
                <p className="text-sm text-text-tertiary">Confidence</p>
                <p className="text-lg font-mono font-bold text-primary">
                  {(analysisResult.suggestion.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary mb-1">News Summary</p>
                <p className="text-sm text-text-secondary">{analysisMeta.news_summary}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Reasoning</p>
                <p className="text-sm text-text-secondary">{analysisResult.suggestion.reasoning}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-text-tertiary">
                  Risk: <span className="text-text-primary">{analysisMeta.risk_assessment}</span>
                </span>
                {!analysisMeta.is_cached && (
                  <span className="text-text-tertiary">
                    Tokens: <span className="text-text-primary">{analysisMeta.input_tokens + analysisMeta.output_tokens}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-loss/10 border border-loss/20 rounded-lg text-loss">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {successMessage ? "Run another analysis?" : "Ready to analyze?"}
          </h3>
          <p className="text-text-secondary mb-4">
            {isActive
              ? "Analyze current market news and get a trading suggestion"
              : "Activate your agent first to run analysis"}
          </p>
          <button
            onClick={() => handleRunAnalysis(false)}
            disabled={isLoading || !isActive}
            className="px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Analyzing...
              </>
            ) : (
              "Run Analysis"
            )}
          </button>
          <p className="text-xs text-text-tertiary mt-3">
            Costs 1 credit per analysis. You&apos;ll review the suggestion before executing.
          </p>
        </div>
      </div>

      {/* Trade Confirmation Modal */}
      {analysisResult && analysisMeta && (
        <TradeConfirmationModal
          isOpen={showConfirmation}
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmTrade}
          suggestion={analysisResult.suggestion}
          portfolio={analysisResult.portfolio}
          newsSummary={analysisMeta.news_summary}
          riskAssessment={analysisMeta.risk_assessment}
          isCached={analysisMeta.is_cached}
          cacheAgeMinutes={analysisMeta.cache_age_minutes}
          onRefresh={() => {
            setShowConfirmation(false);
            handleRunAnalysis(true);
          }}
        />
      )}
    </>
  );
}
