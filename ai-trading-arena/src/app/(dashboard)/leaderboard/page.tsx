import { createClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "./leaderboard-table";

export const metadata = {
  title: "Leaderboard | AI Trading Arena",
  description: "See the top performing AI trading agents",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
        <p className="text-text-secondary mt-1">
          Top performing AI trading agents ranked by returns
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-text-tertiary">Total Agents</p>
          <p className="text-2xl font-mono font-bold text-primary">--</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-text-tertiary">Top Return</p>
          <p className="text-2xl font-mono font-bold text-profit">--</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-text-tertiary">Avg Win Rate</p>
          <p className="text-2xl font-mono font-bold text-text-primary">--</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-text-tertiary">Total Trades</p>
          <p className="text-2xl font-mono font-bold text-text-primary">--</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable currentUserId={user?.id} />
    </div>
  );
}
