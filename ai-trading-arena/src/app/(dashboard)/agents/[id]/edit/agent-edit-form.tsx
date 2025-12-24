"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Agent, RiskParams } from "@/types/database";

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

interface AgentEditFormProps {
  agent: Agent;
}

interface FormData {
  name: string;
  description: string;
  llm_model: (typeof LLM_MODELS)[number]["value"];
  system_prompt: string;
  news_sources: string[];
  risk_params: RiskParams;
  is_public: boolean;
}

export function AgentEditForm({ agent }: AgentEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialRiskParams = agent.risk_params as RiskParams;
  const initialNewsSources = agent.news_sources as string[];

  const [formData, setFormData] = useState<FormData>({
    name: agent.name,
    description: agent.description || "",
    llm_model: agent.llm_model,
    system_prompt: agent.system_prompt,
    news_sources: initialNewsSources,
    risk_params: {
      stop_loss_pct: initialRiskParams.stop_loss_pct,
      max_position_pct: initialRiskParams.max_position_pct,
      max_trades_per_day: initialRiskParams.max_trades_per_day,
    },
    is_public: agent.is_public,
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
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to update agent");
      }

      router.push(`/agents/${agent.id}`);
      router.refresh();
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

      {/* System Prompt Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          System Prompt
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Define your agent&apos;s personality and trading strategy.
        </p>

        <textarea
          id="system_prompt"
          value={formData.system_prompt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, system_prompt: e.target.value }))
          }
          rows={12}
          className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg text-text-primary font-mono text-sm placeholder:text-text-tertiary focus:border-primary focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-text-tertiary mt-2">
          {formData.system_prompt.length} characters
        </p>
      </section>

      {/* News Sources Section */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          News Sources
        </h2>
        <p className="text-sm text-text-tertiary mb-4">
          Select which data sources your agent will analyze.
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href={`/agents/${agent.id}`}
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
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
