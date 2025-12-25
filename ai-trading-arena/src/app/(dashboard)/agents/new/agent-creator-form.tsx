"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PaperUpload } from "@/components/paper-upload";

const LLM_MODELS = [
  { value: "claude-sonnet", label: "Claude Sonnet", cost: "$0.003/1K tokens" },
  { value: "claude-opus", label: "Claude Opus", cost: "$0.015/1K tokens" },
  { value: "gpt-4", label: "GPT-4", cost: "$0.03/1K tokens" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", cost: "$0.01/1K tokens" },
] as const;

const NEWS_SOURCES = [
  { id: "finnhub", label: "Finnhub", description: "General market news" },
  { id: "sec_filings", label: "SEC Filings", description: "Official company filings" },
  { id: "earnings", label: "Earnings Reports", description: "Quarterly earnings data" },
  { id: "social", label: "Social Sentiment", description: "Twitter/Reddit sentiment" },
] as const;

const DEFAULT_SYSTEM_PROMPT = `You are an AI trading agent analyzing market news and data.

Your goal is to make informed trading decisions based on:
1. Current news sentiment
2. Market conditions
3. Risk parameters

For each analysis, you will:
- Evaluate the news and its potential market impact
- Consider the current portfolio position
- Make a BUY, SELL, or HOLD decision
- Provide clear reasoning for your decision

Be conservative and prioritize capital preservation.`;

interface FormData {
  name: string;
  description: string;
  llm_model: (typeof LLM_MODELS)[number]["value"];
  system_prompt: string;
  news_sources: string[];
  risk_params: {
    stop_loss_pct: number;
    max_position_pct: number;
    max_trades_per_day: number;
  };
  is_public: boolean;
  auto_execute: boolean;
  auto_interval: "3h" | "10h" | "24h";
}

interface ExtractedStrategy {
  name: string;
  description: string;
  strategy_prompt: string;
  key_indicators: string[];
  risk_level: "Low" | "Medium" | "High";
  suggested_tickers: string[];
  paper_summary: string;
}

type StrategySource = "manual" | "paper";

export function AgentCreatorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategySource, setStrategySource] = useState<StrategySource>("manual");
  const [extractedStrategy, setExtractedStrategy] = useState<ExtractedStrategy | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    llm_model: "claude-sonnet",
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    news_sources: ["finnhub"],
    risk_params: {
      stop_loss_pct: 5,
      max_position_pct: 25,
      max_trades_per_day: 3,
    },
    is_public: false,
    auto_execute: false,
    auto_interval: "24h",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Agent name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.system_prompt.trim()) {
      setError("System prompt is required");
      setIsLoading(false);
      return;
    }

    if (formData.news_sources.length === 0) {
      setError("Select at least one news source");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create agent");
      }

      // Redirect to the new agent's page
      router.push(`/agents/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewsSource = (sourceId: string) => {
    setFormData((prev) => ({
      ...prev,
      news_sources: prev.news_sources.includes(sourceId)
        ? prev.news_sources.filter((s) => s !== sourceId)
        : [...prev.news_sources, sourceId],
    }));
  };

  const handleStrategyExtracted = (strategy: ExtractedStrategy) => {
    setExtractedStrategy(strategy);
    setFormData((prev) => ({
      ...prev,
      name: strategy.name || prev.name,
      description: strategy.description || prev.description,
      system_prompt: strategy.strategy_prompt,
    }));
    setError(null);
  };

  const handlePaperError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearExtractedStrategy = () => {
    setExtractedStrategy(null);
    setFormData((prev) => ({
      ...prev,
      system_prompt: DEFAULT_SYSTEM_PROMPT,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-loss/10 border border-loss/20 rounded-lg text-loss">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Agent Name <span className="text-loss">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Conservative Growth Bot"
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none transition-colors"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of your agent's strategy..."
              rows={2}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none transition-colors resize-none"
              maxLength={200}
            />
          </div>

          {/* LLM Model */}
          <div>
            <label
              htmlFor="llm_model"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              AI Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              {LLM_MODELS.map((model) => (
                <button
                  key={model.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, llm_model: model.value }))
                  }
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.llm_model === model.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border-active"
                  }`}
                >
                  <p className="font-medium text-text-primary">{model.label}</p>
                  <p className="text-xs text-text-tertiary mt-1">{model.cost}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Public Agent
              </p>
              <p className="text-xs text-text-tertiary">
                Allow others to see your agent on the leaderboard
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.is_public ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.is_public ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Strategy Source Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Trading Strategy
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Define your agent&apos;s trading strategy. Write it manually or upload a research paper to extract a strategy automatically.
        </p>

        {/* Strategy Source Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setStrategySource("manual")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              strategySource === "manual"
                ? "bg-primary text-background"
                : "bg-surface-elevated border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write Manually
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStrategySource("paper")}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              strategySource === "paper"
                ? "bg-primary text-background"
                : "bg-surface-elevated border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload Paper
            </div>
          </button>
        </div>

        {/* Paper Upload */}
        {strategySource === "paper" && (
          <div className="mb-6">
            <PaperUpload
              onStrategyExtracted={handleStrategyExtracted}
              onError={handlePaperError}
            />

            {/* Extracted Strategy Info */}
            {extractedStrategy && (
              <div className="mt-4 p-4 bg-profit/10 border border-profit/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-profit flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Strategy Extracted Successfully
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {extractedStrategy.paper_summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearExtractedStrategy}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Key Indicators */}
                {extractedStrategy.key_indicators.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-text-tertiary mb-1">Key Indicators:</p>
                    <div className="flex flex-wrap gap-2">
                      {extractedStrategy.key_indicators.slice(0, 5).map((indicator, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-surface rounded text-xs text-text-secondary"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Tickers */}
                {extractedStrategy.suggested_tickers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-text-tertiary mb-1">Suggested Tickers:</p>
                    <div className="flex flex-wrap gap-2">
                      {extractedStrategy.suggested_tickers.map((ticker, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary/20 rounded text-xs text-primary font-mono"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Level */}
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-xs text-text-tertiary">Risk Level:</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      extractedStrategy.risk_level === "Low"
                        ? "bg-profit/20 text-profit"
                        : extractedStrategy.risk_level === "Medium"
                        ? "bg-warning/20 text-warning"
                        : "bg-loss/20 text-loss"
                    }`}
                  >
                    {extractedStrategy.risk_level}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Prompt (always shown, editable) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            System Prompt {extractedStrategy && "(auto-filled from paper)"}
          </label>
          <textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, system_prompt: e.target.value }))
            }
            rows={12}
            className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg text-text-primary font-mono text-sm placeholder:text-text-tertiary focus:border-primary focus:outline-none transition-colors resize-none"
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-text-tertiary">
              {formData.system_prompt.length} characters
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  system_prompt: DEFAULT_SYSTEM_PROMPT,
                }));
                setExtractedStrategy(null);
              }}
              className="text-xs text-secondary hover:text-secondary-muted transition-colors"
            >
              Reset to default
            </button>
          </div>
        </div>
      </section>

      {/* News Sources Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          News Sources
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Select which data sources your agent will analyze for trading
          decisions.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {NEWS_SOURCES.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => toggleNewsSource(source.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                formData.news_sources.includes(source.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-border-active"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.news_sources.includes(source.id)
                      ? "bg-primary border-primary"
                      : "border-text-tertiary"
                  }`}
                >
                  {formData.news_sources.includes(source.id) && (
                    <svg
                      className="w-3 h-3 text-background"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-text-primary">
                  {source.label}
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-2 ml-6">
                {source.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Risk Parameters Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Risk Parameters
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Set limits to control your agent&apos;s risk exposure.
        </p>

        <div className="space-y-6">
          {/* Stop Loss */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Stop Loss
              </label>
              <span className="text-sm font-mono text-primary">
                {formData.risk_params.stop_loss_pct}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={formData.risk_params.stop_loss_pct}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  risk_params: {
                    ...prev.risk_params,
                    stop_loss_pct: Number(e.target.value),
                  },
                }))
              }
              className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Automatically sell when a position drops by this percentage
            </p>
          </div>

          {/* Max Position */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Max Position Size
              </label>
              <span className="text-sm font-mono text-primary">
                {formData.risk_params.max_position_pct}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={formData.risk_params.max_position_pct}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  risk_params: {
                    ...prev.risk_params,
                    max_position_pct: Number(e.target.value),
                  },
                }))
              }
              className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Maximum percentage of portfolio in a single position
            </p>
          </div>

          {/* Max Trades Per Day */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Max Trades Per Day
              </label>
              <span className="text-sm font-mono text-primary">
                {formData.risk_params.max_trades_per_day}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.risk_params.max_trades_per_day}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  risk_params: {
                    ...prev.risk_params,
                    max_trades_per_day: Number(e.target.value),
                  },
                }))
              }
              className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Limit daily trading activity to reduce overtrading
            </p>
          </div>
        </div>
      </section>

      {/* Auto-Trading Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Auto-Trading
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Enable automatic trade execution without manual confirmation.
        </p>

        <div className="space-y-4">
          {/* Auto-Execute Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Enable Auto-Trading
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                AI suggestions will execute automatically without confirmation
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  auto_execute: !prev.auto_execute,
                }))
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.auto_execute ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.auto_execute ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Auto Interval */}
          {formData.auto_execute && (
            <div className="p-4 bg-surface-elevated rounded-lg">
              <label className="text-sm font-medium text-text-secondary block mb-3">
                Analysis Interval
              </label>
              <div className="flex gap-3">
                {(["3h", "10h", "24h"] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, auto_interval: interval }))
                    }
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.auto_interval === interval
                        ? "bg-primary text-background"
                        : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Every {interval.replace("h", " hours")}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-tertiary mt-3">
                Your agent will automatically analyze markets and execute trades at this interval.
              </p>
            </div>
          )}

          {formData.auto_execute && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
              <strong>Note:</strong> Auto-trading will use credits automatically. Make sure you have enough credits for the analysis frequency.
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/agents"
          className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              Creating...
            </>
          ) : (
            "Create Agent"
          )}
        </button>
      </div>
    </form>
  );
}
