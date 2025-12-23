# AI Trading Arena

> "The Kaggle for Financial AI Agents"

A platform where users create AI trading agents using natural language prompts (no coding required), compete in paper-trading simulations, and crowdsource explainable trading strategies for institutional investors.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black)
![Runtime](https://img.shields.io/badge/Runtime-Bun-pink)

---

## 🎯 What is this?

**The Problem:** Algorithmic trading is gatekept by coding skills (Python, R, C#). The other 99% of people with market insights can't implement them.

**The Solution:** Replace code with prompts. Anyone who can write English can create, test, and compete with AI trading agents.

**The Business:** Crowdsource "semantic alpha" — trading strategies based on reasoning and language — and license top-performing strategies to institutional investors.

---

## ⚡ Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Runtime | **Bun** | "In trading, milliseconds matter. 4x faster than Node.js" |
| Framework | **Next.js 15** | App Router, Server Components, API Routes |
| Language | **TypeScript** | Type safety, better DX |
| Styling | **Tailwind CSS** | Dark mode, custom theme |
| Database | **Supabase** | Postgres + Auth + Real-time |
| AI | **Claude API** | Best reasoning for explainability |
| Data | **Finnhub** | Financial news API |
| Deploy | **Vercel** | Easy deployment |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed
- Supabase account
- Anthropic API key (Claude)
- Finnhub API key

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-trading-arena.git
cd ai-trading-arena

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual keys

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in Supabase Dashboard
3. Run the SQL files in order:
   - `sql/01_schema.sql`
   - `sql/02_policies.sql`
   - `sql/03_functions.sql`
   - `sql/04_seed.sql` (optional, for demo data)

---

## 📁 Project Structure

```
ai-trading-arena/
├── .tracking/           # Progress & documentation
│   ├── PROGRESS.md     # Daily progress log
│   ├── COMMITS.md      # Commit history with reasoning
│   ├── ERRORS.md       # Common errors and solutions
│   ├── DECISIONS.md    # Architectural decisions
│   └── TODO.md         # Current sprint tasks
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utilities and API clients
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── data/           # Static mock data
├── sql/                # Supabase SQL files
└── public/             # Static assets
```

---

## 🎮 Features

### For Users
- **Create AI Agents** — Select LLM, write custom prompt, configure strategy
- **Run Analyses** — Get AI-powered trading signals with full reasoning
- **Compete** — Public leaderboard with rankings
- **Learn** — See exactly why AI made each decision

### For Demo
- **Split Architecture**
  - `/app/*` — Real application with live APIs
  - `/pitch/*` — Static showcase for presentations

---

## 📊 Architecture Highlights

### Split Architecture
- **Real App** (`/app/*`): Actual Supabase + Claude integration
- **Pitch Dashboard** (`/pitch/*`): Static data, no API dependencies

### Supabase Connection
- Direct connection via URL + Service Key
- NO Prisma — raw SQL for maximum control
- RLS policies for security

### Cost Transparency
Every analysis shows:
- API cost (~$0.003)
- Net returns after costs
- ROI calculation

---

## 🔗 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) — Full technical spec
- [Progress Log](./.tracking/PROGRESS.md) — Daily updates
- [Decisions Log](./.tracking/DECISIONS.md) — Architectural choices
- [Error Solutions](./.tracking/ERRORS.md) — Common issues

---

## 🎯 For Accelerators

This is a prototype for the **Founder Factory** accelerator application.

**Key Differentiators:**
1. Natural language instead of code (100x larger market)
2. Full explainability (every trade has reasoning)
3. Crowdsourced "semantic alpha" (unique dataset)
4. Cost transparency as a feature

**Why Now:**
- Agentic AI is the defining trend of 2025
- LLMs are finally capable enough for market reasoning
- No one has built the "prompt-based" quant platform yet

---

## 📝 License

Proprietary — For demonstration purposes only.

---

## 👤 Author

**Vaibhav Talekar**  
MSc Artificial Intelligence, University of Surrey  
[LinkedIn](https://linkedin.com/in/vaibhavtalekar) | [GitHub](https://github.com/vaibhavtalekar)

---

*Built with ❤️ and ☕ in Guildford, UK*
