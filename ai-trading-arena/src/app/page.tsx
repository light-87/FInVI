import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="flex flex-col items-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface border border-border mb-8">
            <span className="text-primary text-sm font-mono">v0.2.0</span>
            <span className="mx-2 text-text-tertiary">|</span>
            <span className="text-text-secondary text-sm">Paper Strategy Extraction</span>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20">
            <StatCard label="Active Agents" value="0" />
            <StatCard label="Total Trades" value="0" />
            <StatCard label="Avg Return" value="+0.0%" positive />
            <StatCard label="API Cost" value="$0.003" />
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Paper Upload */}
            <div className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Upload Research Paper
              </h3>
              <p className="text-text-secondary text-sm">
                Upload any financial research paper or trading strategy PDF. Our AI extracts the core strategy and converts it into actionable trading rules.
              </p>
            </div>

            {/* Feature 2 - AI Extraction */}
            <div className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                AI Strategy Extraction
              </h3>
              <p className="text-text-secondary text-sm">
                Claude AI analyzes the paper, identifies key indicators, entry/exit signals, and risk parameters to create a complete trading strategy.
              </p>
            </div>

            {/* Feature 3 - Deploy & Compete */}
            <div className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-profit/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Deploy & Compete
              </h3>
              <p className="text-text-secondary text-sm">
                Your AI agent trades automatically based on the extracted strategy. Track performance and compete on the public leaderboard.
              </p>
            </div>
          </div>

          {/* Paper Upload Highlight */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                  New Feature
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Upload Paper, Extract Strategy
                </h3>
                <p className="text-text-secondary mb-4">
                  Turn academic research into real trading agents. Upload any PDF - from arXiv papers to proprietary research - and our AI will extract a complete, executable trading strategy in seconds.
                </p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Automatic entry/exit signal detection
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Key indicator identification
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Risk assessment and position sizing
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Suggested tickers for strategy
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-surface border border-border rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Mock paper upload preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-elevated" />
                  <div className="relative z-10 text-center p-4">
                    <svg className="w-16 h-16 mx-auto text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-text-tertiary text-sm">Drop PDF here</p>
                    <p className="text-text-tertiary text-xs mt-1">or click to browse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-text-tertiary text-sm font-mono">
          Built with Bun + Next.js 16 + Tailwind v4 + Claude AI
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
