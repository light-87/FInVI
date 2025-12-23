import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface border border-border mb-8">
            <span className="text-primary text-sm font-mono">v0.1.0</span>
            <span className="mx-2 text-text-tertiary">|</span>
            <span className="text-text-secondary text-sm">Day 3 - Auth Ready</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold font-display text-text-primary mb-6 tracking-tight">
            AI Trading{" "}
            <span className="text-primary">Arena</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-secondary mb-8 font-body max-w-2xl mx-auto">
            The Kaggle for Financial AI Agents. Create trading agents with{" "}
            <span className="text-secondary">natural language</span>, no coding required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-all glow-primary"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-border text-text-primary font-semibold rounded-lg hover:border-primary transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <StatCard label="Active Agents" value="0" />
            <StatCard label="Total Trades" value="0" />
            <StatCard label="Avg Return" value="+0.0%" positive />
            <StatCard label="API Cost" value="$0.003" />
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-8 text-text-tertiary text-sm font-mono">
          Built with Bun + Next.js 16 + Tailwind v4
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:border-border-active transition-colors">
      <p className="text-text-tertiary text-sm mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${positive ? "text-profit" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
