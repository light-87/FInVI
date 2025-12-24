"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  agent_id: string;
  agent_name: string;
  user_id: string;
  user_display_name: string;
  total_return_pct: number;
  win_rate: number;
  trade_count: number;
  total_api_cost: number;
  is_own: boolean;
}

interface LeaderboardTableProps {
  currentUserId?: string;
}

type SortOption = "total_return_pct" | "win_rate" | "total_trades" | "total_api_cost";

const sortLabels: Record<SortOption, string> = {
  total_return_pct: "Return %",
  win_rate: "Win Rate",
  total_trades: "Trades",
  total_api_cost: "Lowest Cost",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20 text-gray-300 font-bold">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-600/20 text-orange-400 font-bold">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 text-text-tertiary font-mono">
      {rank}
    </span>
  );
}

export function LeaderboardTable({ currentUserId }: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("total_return_pct");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?sort=${sortBy}&limit=50`);
        const result = await response.json();

        if (result.success) {
          setEntries(result.data.leaderboard);
        } else {
          setError(result.error?.message || "Failed to load leaderboard");
        }
      } catch {
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-text-tertiary">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="text-center text-text-tertiary">{error}</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="text-center">
          <p className="text-text-tertiary mb-2">No public agents yet</p>
          <p className="text-sm text-text-tertiary">
            Be the first to make your agent public and appear on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <span className="text-sm text-text-tertiary">Sort by:</span>
        {(Object.keys(sortLabels) as SortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === option
                ? "bg-primary/20 text-primary"
                : "text-text-secondary hover:bg-surface-elevated"
            }`}
          >
            {sortLabels[option]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-text-tertiary border-b border-border bg-surface-elevated">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium text-right">Return</th>
              <th className="px-4 py-3 font-medium text-right">Win Rate</th>
              <th className="px-4 py-3 font-medium text-right">Trades</th>
              <th className="px-4 py-3 font-medium text-right">API Cost</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.agent_id}
                className={`border-b border-border/50 hover:bg-surface-elevated/50 transition-colors ${
                  entry.user_id === currentUserId ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={entry.rank} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/agents/${entry.agent_id}`}
                    className="font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {entry.agent_name}
                  </Link>
                  {entry.user_id === currentUserId && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary">{entry.user_display_name}</td>
                <td
                  className={`px-4 py-3 text-right font-mono ${
                    entry.total_return_pct >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {entry.total_return_pct >= 0 ? "+" : ""}
                  {entry.total_return_pct.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">
                  {(entry.win_rate * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">
                  {entry.trade_count}
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-tertiary">
                  ${entry.total_api_cost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
