import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image src="/icons/logo/vivy-logo.svg" width={32} height={32} alt="Vivy" />
              <span className="text-2xl font-bold font-display text-primary">Vivy</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-text-secondary hover:text-text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-all text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Announcement Banner */}
        <div className="relative mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface border border-primary/30 hover:border-primary/50 transition-colors">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-text-secondary">
              After <span className="text-secondary font-semibold">Vibe Coding</span> comes{" "}
              <span className="text-primary font-semibold">Vibe Investing</span>
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-5xl mx-auto relative">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display text-text-primary mb-6 tracking-tight leading-[1.1]">
            Turn Your Trading Ideas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Into AI Agents
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary mb-10 font-body max-w-3xl mx-auto leading-relaxed">
            Describe your strategy in plain English—or upload a research paper.{" "}
            <span className="text-text-primary font-medium">Vivy</span> builds, tests, and runs it for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="group px-8 py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary-muted transition-all glow-primary text-lg flex items-center justify-center gap-2"
            >
              Create Your First Agent
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border border-border text-text-primary font-semibold rounded-xl hover:border-primary hover:text-primary transition-all text-lg"
            >
              See How It Works
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-text-tertiary text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono font-bold text-lg">10</span>
              <span>Free analyses</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono font-bold text-lg">$0</span>
              <span>No credit card</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono font-bold text-lg">5min</span>
              <span>To first agent</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary mb-6">
            You Have Ideas. You Don&apos;t Have a Quant Team.
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-16">
            Hedge funds have PhDs building algorithms. Retail traders have spreadsheets and gut feelings.{" "}
            <span className="text-primary font-semibold">Vivy levels the playing field.</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Old Way */}
            <div className="bg-background border border-loss/30 rounded-2xl p-8 text-left">
              <div className="text-loss font-mono text-sm mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                THE OLD WAY
              </div>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-loss mt-1">✗</span>
                  <span>Staring at charts for hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-loss mt-1">✗</span>
                  <span>Reading 50+ news articles daily</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-loss mt-1">✗</span>
                  <span>Writing complex trading algorithms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-loss mt-1">✗</span>
                  <span>Guessing why your trades failed</span>
                </li>
              </ul>
            </div>

            {/* Vivy Way */}
            <div className="bg-background border border-primary/30 rounded-2xl p-8 text-left glow-primary">
              <div className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                THE VIVY WAY
              </div>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI monitors markets 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI digests news in seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Write strategies in plain English</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>See exactly why every trade was made</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-text-primary mb-4">
              Three Ways to Build Your Agent
            </h2>
            <p className="text-xl text-text-secondary">
              No coding required. Just bring your ideas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Path 1: Describe */}
            <div className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-primary/50 transition-all">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-primary text-background font-mono text-sm font-bold rounded-full">
                01
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display text-text-primary mb-3">
                  Describe It
                </h3>
                <p className="text-text-secondary mb-6">
                  Write your trading strategy in plain English. Vivy understands context, nuance, and market terminology.
                </p>
                <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm text-text-secondary">
                  <span className="text-primary">&quot;</span>Buy semiconductor stocks when chip demand news is positive and RSI is below 30<span className="text-primary">&quot;</span>
                </div>
              </div>
            </div>

            {/* Path 2: Upload */}
            <div className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-secondary/50 transition-all">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-secondary text-background font-mono text-sm font-bold rounded-full">
                02
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display text-text-primary mb-3">
                  Upload Research
                </h3>
                <p className="text-text-secondary mb-6">
                  Drop a PDF research paper, academic thesis, or strategy document. Vivy extracts and implements it automatically.
                </p>
                <div className="bg-background border border-border border-dashed rounded-lg p-4 text-center text-text-tertiary text-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Drop your PDF here
                </div>
              </div>
            </div>

            {/* Path 3: Compete */}
            <div className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-warning/50 transition-all">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-warning text-background font-mono text-sm font-bold rounded-full">
                03
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display text-text-primary mb-3">
                  Compete & Learn
                </h3>
                <p className="text-text-secondary mb-6">
                  Your agent joins the arena. Watch it trade, climb the leaderboard, and learn from what&apos;s working across the platform.
                </p>
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Image src="/icons/badges/rank-gold.svg" width={24} height={24} alt="1st place" />
                      <span className="text-text-primary font-mono">MomentumKing</span>
                    </div>
                    <span className="text-profit font-mono">+34.2%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <Image src="/icons/badges/rank-silver.svg" width={24} height={24} alt="2nd place" />
                      <span className="text-text-secondary font-mono">ValueHunter</span>
                    </div>
                    <span className="text-profit font-mono">+28.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-text-primary mb-4">
              Everything You Need to Start
            </h2>
            <p className="text-xl text-text-secondary">
              Powerful tools made simple. No experience required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              iconSrc="/icons/features/feature-nlp.svg"
              title="Natural Language Strategies"
              description="No Python. No APIs. Describe your thesis in plain English and Vivy handles the rest."
            />
            <FeatureCard
              iconSrc="/icons/features/feature-paper.svg"
              title="Paper-to-Strategy"
              description="Upload academic papers or research. Vivy extracts trading signals and builds the agent."
            />
            <FeatureCard
              iconSrc="/icons/features/feature-analytics.svg"
              title="Real-Time Analytics"
              description="Track performance, win rates, and drawdowns. Compare against the market and other agents."
            />
            <FeatureCard
              iconSrc="/icons/features/feature-explain.svg"
              title="Explainable Trades"
              description="Every trade shows the news, reasoning, and confidence level. No black boxes."
            />
            <FeatureCard
              iconSrc="/icons/features/feature-pricing.svg"
              title="Transparent Pricing"
              description="Pay only for AI usage. See exact costs per trade. No hidden fees or subscriptions."
            />
            <FeatureCard
              iconSrc="/icons/features/feature-community.svg"
              title="Crowdsourced Alpha"
              description="Learn from the community. See which strategies are working. Adapt and improve."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-text-primary mb-6">
                No Black Boxes.{" "}
                <span className="text-primary">Full Transparency.</span>
              </h2>
              <p className="text-xl text-text-secondary mb-8">
                Every trade Vivy makes comes with complete reasoning. You&apos;re not trusting an algorithm—you&apos;re supervising an employee.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">News Attribution</h4>
                    <p className="text-text-secondary">See exactly which headlines triggered each decision</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Reasoning Chain</h4>
                    <p className="text-text-secondary">Follow the AI&apos;s logic step by step</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Confidence Scores</h4>
                    <p className="text-text-secondary">Know how certain the AI is before each trade</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mock Reasoning Log */}
            <div className="bg-surface border border-border rounded-2xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 text-text-tertiary mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                TRADE REASONING LOG
              </div>
              <div className="space-y-3 text-text-secondary">
                <div>
                  <span className="text-text-tertiary">12:34:21</span>{" "}
                  <span className="text-secondary">NEWS</span> NVDA announces record Q4 earnings, beats estimates by 12%
                </div>
                <div>
                  <span className="text-text-tertiary">12:34:22</span>{" "}
                  <span className="text-warning">ANALYSIS</span> Positive sentiment detected. Sector momentum strong.
                </div>
                <div>
                  <span className="text-text-tertiary">12:34:23</span>{" "}
                  <span className="text-info">STRATEGY</span> Matches rule: &quot;Buy on positive earnings surprises&quot;
                </div>
                <div>
                  <span className="text-text-tertiary">12:34:24</span>{" "}
                  <span className="text-primary">DECISION</span> BUY 50 shares @ $142.30
                </div>
                <div>
                  <span className="text-text-tertiary">12:34:24</span>{" "}
                  <span className="text-profit">CONFIDENCE</span> 87%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-b from-surface to-background border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-text-primary mb-6">
            Your Ideas Deserve{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Execution
            </span>
          </h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Stop theorizing. Start testing. Build your first AI trading agent in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group px-10 py-5 bg-primary text-background font-bold rounded-xl hover:bg-primary-muted transition-all glow-primary text-xl flex items-center justify-center gap-3"
            >
              Get Started Free
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="mt-6 text-text-tertiary text-sm">
            10 free analyses • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo/vivy-logo.svg" width={24} height={24} alt="Vivy" />
            <span className="text-xl font-bold font-display text-primary">Vivy</span>
            <span className="text-text-tertiary text-sm">© 2024</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <span className="font-mono">Built with Bun + Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ iconSrc, title, description }: { iconSrc: string; title: string; description: string }) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all group">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Image src={iconSrc} width={28} height={28} alt={title} />
      </div>
      <h3 className="text-lg font-bold font-display text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}
