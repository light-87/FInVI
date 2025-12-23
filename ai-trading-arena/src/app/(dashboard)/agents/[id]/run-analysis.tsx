"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  trade: {
    id: string;
    action: "BUY" | "SELL" | "HOLD";
    ticker: string;
    confidence: number;
    reasoning: string;
  };
  analysis: {
    action: string;
    ticker: string;
    confidence: number;
    reasoning: string;
    news_summary: string;
    risk_assessment: string;
    current_price: number;
  };
  cost: {
    api_cost: number;
    input_tokens: number;
    output_tokens: number;
  };
  credits_remaining: number;
}

interface RunAnalysisProps {
  agentId: string;
  isActive: boolean;
}

export function RunAnalysis({ agentId, isActive }: RunAnalysisProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/agents/${agentId}/analyze`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Analysis failed");
      }

      setResult(data.data);
      router.refresh(); // Refresh page to show new trade
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
      {/* Result Display */}
      {result && (
        <div className="mb-6 bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-text-primary">Analysis Complete</h4>
            <span className="text-xs text-text-tertiary">
              Cost: ${result.cost.api_cost.toFixed(4)} | Credits left: {result.credits_remaining}
            </span>
          </div>

          {/* Decision Badge */}
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`px-4 py-2 rounded-lg text-lg font-bold ${
                result.analysis.action === "BUY"
                  ? "bg-profit/20 text-profit"
                  : result.analysis.action === "SELL"
                  ? "bg-loss/20 text-loss"
                  : "bg-text-tertiary/20 text-text-secondary"
              }`}
            >
              {result.analysis.action}
            </span>
            <div>
              <span className="text-xl font-mono font-bold text-text-primary">
                {result.analysis.ticker}
              </span>
              <span className="text-sm text-text-tertiary ml-2">
                @ ${result.analysis.current_price.toFixed(2)}
              </span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-text-tertiary">Confidence</p>
              <p className="text-lg font-mono font-bold text-primary">
                {(result.analysis.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-tertiary mb-1">News Summary</p>
              <p className="text-sm text-text-secondary">{result.analysis.news_summary}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary mb-1">Reasoning</p>
              <p className="text-sm text-text-secondary">{result.analysis.reasoning}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-text-tertiary">
                Risk: <span className="text-text-primary">{result.analysis.risk_assessment}</span>
              </span>
              <span className="text-text-tertiary">
                Tokens: <span className="text-text-primary">{result.cost.input_tokens + result.cost.output_tokens}</span>
              </span>
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
          {result ? "Run another analysis?" : "Ready to analyze?"}
        </h3>
        <p className="text-text-secondary mb-4">
          {isActive
            ? "Analyze current market news and get a trading decision"
            : "Activate your agent first to run analysis"}
        </p>
        <button
          onClick={handleRunAnalysis}
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
      </div>
    </div>
  );
}
