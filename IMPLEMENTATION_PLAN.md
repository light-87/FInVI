# AI Trading Arena - Implementation Plan

**Project:** AI Trading Arena - "The Kaggle for Financial AI Agents"  
**Timeline:** 2 weeks to functional demo  
**Target:** Founder Factory Accelerator Application  
**Last Updated:** December 2024

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Tracking Files System](#tracking-files-system)
4. [Design Philosophy](#design-philosophy)
5. [Bun Best Practices](#bun-best-practices)
6. [Supabase Integration](#supabase-integration)
7. [Implementation Phases](#implementation-phases)
8. [API Architecture](#api-architecture)
9. [Component Architecture](#component-architecture)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)
12. [Daily Workflow](#daily-workflow)

---

## Project Overview

### What We're Building

A platform where users create AI trading agents using natural language prompts (no coding), compete in paper-trading simulations, and we crowdsource explainable trading strategies.

### Split Architecture

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/app/*` | Real application with auth, real API calls | Live Supabase + Claude API |
| `/pitch/*` | Static showcase for demos/screenshots | Pre-generated JSON files |

### Tech Stack (Final)

- **Runtime:** Bun (NOT Node.js)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (custom config)
- **Database:** Supabase (direct connection via URL + Service Key)
- **AI:** Claude API (Anthropic)
- **Data:** Finnhub API (financial news)
- **Deployment:** Vercel

---

## Folder Structure

```
ai-trading-arena/
├── .tracking/                    # Progress & documentation (git-ignored sensitive parts)
│   ├── PROGRESS.md              # Daily progress log
│   ├── COMMITS.md               # Commit history with reasoning
│   ├── ERRORS.md                # Common errors and solutions
│   ├── DECISIONS.md             # Architectural decisions log
│   └── TODO.md                  # Current sprint tasks
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth group (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── agents/          # Agent management
│   │   │   ├── arena/           # Live competition view
│   │   │   ├── leaderboard/     # Public rankings
│   │   │   └── profile/         # User settings
│   │   ├── pitch/               # Static pitch dashboard
│   │   ├── api/                 # API routes
│   │   │   ├── agents/
│   │   │   │   ├── route.ts     # GET/POST agents
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # GET/PATCH/DELETE agent
│   │   │   │       ├── analyze/    # POST - get trade suggestion
│   │   │   │       ├── execute/    # POST - confirm trade ✅ NEW
│   │   │   │       └── refresh/    # GET/POST - refresh prices ✅ NEW
│   │   │   ├── auth/
│   │   │   └── leaderboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── charts/              # Data visualization
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── PortfolioDonut.tsx
│   │   │   └── ReasoningTimeline.tsx
│   │   ├── agent/               # Agent-specific components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentCreator.tsx
│   │   │   └── ReasoningLog.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── landing/             # Landing page sections
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client (service key)
│   │   │   └── types.ts         # Database types
│   │   ├── claude/
│   │   │   ├── client.ts        # Claude API wrapper
│   │   │   └── prompts.ts       # Prompt templates (includes portfolio context + prev recommendation)
│   │   ├── finnhub/
│   │   │   └── client.ts        # News API wrapper
│   │   ├── portfolio/           # ✅ NEW
│   │   │   └── helpers.ts       # Portfolio mgmt + checkStopLoss + validateMaxPositionSize
│   │   └── utils/
│   │       ├── format.ts        # Formatters (currency, dates)
│   │       └── calculations.ts  # Financial calculations
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAgent.ts
│   │   ├── useAuth.ts
│   │   └── useLeaderboard.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── agent.ts
│   │   ├── trade.ts
│   │   └── user.ts
│   │
│   └── data/                    # Static data for /pitch
│       ├── mock-agents.json
│       ├── mock-trades.json
│       └── mock-leaderboard.json
│
├── public/
│   ├── fonts/                   # Custom fonts
│   └── images/
│
├── sql/                         # Supabase SQL files
│   ├── 01_schema.sql           # Table definitions
│   ├── 02_policies.sql         # RLS policies
│   ├── 03_functions.sql        # Database functions
│   └── 04_seed.sql             # Demo data
│
├── .env.local                   # Environment variables (git-ignored)
├── .env.example                 # Template for env vars
├── bunfig.toml                  # Bun configuration
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## Tracking Files System

We maintain 5 tracking files in `.tracking/` to document progress, decisions, and learnings.

### 1. PROGRESS.md
**Purpose:** Daily log of what was accomplished  
**Update:** End of each work session  
**Format:**
```markdown
## [Date] - Day X

### Completed
- [x] Task description

### Blockers
- Issue encountered

### Tomorrow
- [ ] Next priority
```

### 2. COMMITS.md
**Purpose:** Meaningful commit history with context  
**Update:** After each significant commit  
**Format:**
```markdown
## [Commit Hash] - [Date]

**Type:** feature | fix | refactor | docs | style
**Files Changed:** List of files
**Why:** Reasoning behind the change
**Impact:** What this enables or fixes
```

### 3. ERRORS.md
**Purpose:** Document errors and solutions for future reference  
**Update:** When encountering and solving errors  
**Format:**
```markdown
## [Error Category] - [Brief Description]

**Error Message:**
```
Exact error text
```

**Context:** When/where this occurs
**Root Cause:** Why it happens
**Solution:** How to fix it
**Prevention:** How to avoid in future
```

### 4. DECISIONS.md
**Purpose:** Log architectural and design decisions with reasoning  
**Update:** When making significant choices  
**Format:**
```markdown
## [Decision ID] - [Title]

**Date:** YYYY-MM-DD
**Status:** Decided | Superseded | Deprecated

**Context:** What situation prompted this decision?
**Options Considered:**
1. Option A - pros/cons
2. Option B - pros/cons

**Decision:** What we chose
**Rationale:** Why we chose it
**Consequences:** What this means going forward
```

### 5. TODO.md
**Purpose:** Current sprint task list with priorities  
**Update:** Daily  
**Format:**
```markdown
## Current Sprint (Week X)

### P0 - Must Have (Demo Blocker)
- [ ] Task

### P1 - Should Have (Impressive)
- [ ] Task

### P2 - Nice to Have (If Time)
- [ ] Task

### Icebox (Future)
- Task ideas
```

---

## Design Philosophy

### Anti-AI-Generic Manifesto

**The Problem:** Most AI-generated UIs look the same: purple gradients, Inter font, card-based layouts with excessive shadows, generic illustrations.

**Our Direction:** Trading terminal meets gaming leaderboard. Think Bloomberg Terminal's density meets Fortnite's engagement.

### Design Pillars

#### 1. Dark Mode First, Always
- Primary background: Near-black (`#0a0a0f`)
- Card backgrounds: Dark gray with subtle transparency (`rgba(20, 20, 30, 0.8)`)
- Text: High contrast but not pure white (`#e5e5e5`)

#### 2. Typography with Personality
**DO NOT USE:** Inter, Roboto, Arial, system fonts

**RECOMMENDED:**
- Display/Headers: JetBrains Mono, Space Grotesk alternatives, or IBM Plex Mono
- Body: Outfit, Plus Jakarta Sans, or Satoshi
- Numbers/Data: Tabular numerals, monospace for prices

**Key Rule:** Financial data in monospace, narrative text in sans-serif

#### 3. Color System - "Terminal Green Meets Profit/Loss"
```
Primary Accent:    #00ff88 (Neon green - reminiscent of trading terminals)
Secondary Accent:  #00d4ff (Cyan - tech/futuristic)
Profit:           #22c55e (Green)
Loss:             #ef4444 (Red)
Warning:          #f59e0b (Amber)
Neutral:          #6b7280 (Gray)
Background:       #0a0a0f (Near-black)
Surface:          #111118 (Dark gray)
Border:           #1f1f2e (Subtle)
```

#### 4. Gamification Elements
- **Rank badges** with distinct visual treatment (Bronze/Silver/Gold/Diamond)
- **Streak indicators** (7-day analysis streak)
- **Progress bars** for credit usage
- **Animation on achievements** (confetti on reaching top 10%)
- **Seasonal themes** (future: Q1 Season, Q2 Season)

#### 5. Data Density Done Right
- Information-rich but not cluttered
- Use sparklines for mini-trends
- Hover states reveal more detail (progressive disclosure)
- Critical numbers always visible, context on demand

#### 6. Motion Philosophy
- Subtle entrance animations (stagger children)
- Number counters that tick up/down
- Smooth transitions between states
- Loading states that feel responsive (skeleton screens)
- NO: Bouncy, playful animations (too casual for finance)

### Visual References (Mood Board Direction)

| Inspiration | What to Take |
|-------------|--------------|
| Bloomberg Terminal | Data density, monospace fonts, dark theme |
| TradingView | Chart interactions, clean data tables |
| Valorant/Fortnite | Rank badges, leaderboard drama, season structure |
| Linear | Clean UI, subtle animations, dark mode execution |
| Vercel Dashboard | Typography, spacing, modern dark theme |

### Component-Specific Guidelines

#### Agent Cards
- Distinct "personality" based on strategy type
- Show key metrics at a glance (return %, win rate)
- Status indicator (active, paused, analyzing)
- Compact reasoning preview

#### Leaderboard
- Top 3 get special treatment (podium effect)
- User's own rank always visible (sticky or highlighted)
- Trend arrows (↑↓→) for rank changes
- "You vs Top" comparison prompt

#### Performance Charts
- Area charts with gradient fills
- Prominent baseline at $100k starting
- Annotations for significant events
- Dark grid lines, not white

#### Reasoning Logs
- Terminal-style display
- Syntax highlighting for key terms (tickers, actions)
- Collapsible sections for long reasoning
- Timestamp in muted color

---

## Bun Best Practices

### Why Bun?

1. **Speed narrative** - "In trading, milliseconds matter. 4x faster than Node.js."
2. **Built-in TypeScript** - No transpilation step
3. **Faster installs** - `bun install` vs `npm install`
4. **Modern tooling** - Better DX, faster builds

### Configuration (bunfig.toml)

Create a `bunfig.toml` in project root with recommended settings:
- Enable strict telemetry off
- Set lockfile format
- Configure test runner settings

### Commands Cheat Sheet

| Task | Command |
|------|---------|
| Install dependencies | `bun install` |
| Add package | `bun add <package>` |
| Add dev dependency | `bun add -d <package>` |
| Run dev server | `bun dev` |
| Build | `bun run build` |
| Run script | `bun run <script>` |
| Type check | `bun run typecheck` |

### Package.json Scripts

Define these scripts:
- `dev`: Next.js development server
- `build`: Production build
- `start`: Production server
- `lint`: ESLint
- `typecheck`: TypeScript validation
- `db:push`: Run SQL migrations (custom script)

### Bun-Specific Optimizations

1. **Use Bun's built-in fetch** - Don't install node-fetch
2. **Use Bun.file() for file ops** - Faster than fs
3. **Use Bun.env** - Type-safe environment variables
4. **Use bun:test** - Built-in test runner (faster than Jest)

### Caveats

- Some npm packages may have Node.js-specific code
- Vercel deploys with Node.js runtime, not Bun (Bun is dev-time advantage)
- Check package compatibility before installing

---

## Supabase Integration

### Connection Method

**CRITICAL:** We are NOT using Prisma. We connect directly using:
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_KEY` - Service role key (server-side only)
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL (client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (client-side)

### Two Client Pattern

#### Browser Client (for auth, realtime)
- Uses anon key
- Respects RLS policies
- Used in React components via `createBrowserClient`

#### Server Client (for API routes, server components)
- Uses service key
- Bypasses RLS when needed
- Used in API routes via `createClient` with service key

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
FINNHUB_API_KEY=...
```

### Database Schema Overview

#### Tables Required

1. **users** (extends Supabase auth.users)
   - id (uuid, references auth.users)
   - display_name
   - credits_remaining (integer, default 10)
   - tier (free/pro/enterprise)
   - created_at

2. **agents**
   - id (uuid)
   - user_id (uuid, FK to users)
   - name
   - llm_model (claude-sonnet, gpt-4, etc.)
   - system_prompt (text)
   - news_sources (jsonb array)
   - risk_params (jsonb: stop_loss, max_position, etc.)
   - is_public (boolean)
   - status (active/paused)
   - cash_balance (decimal, default 100000) ✅ NEW
   - auto_execute (boolean, default false) ✅ NEW
   - auto_interval (text: '3h' | '10h' | '24h') ✅ NEW
   - created_at

3. **trades**
   - id (uuid)
   - agent_id (uuid, FK to agents)
   - timestamp
   - action (BUY/SELL/HOLD)
   - ticker
   - quantity
   - price
   - reasoning (text)
   - confidence (float)
   - api_cost (decimal)
   - created_at

4. **positions** ✅ NEW (tracks real holdings)
   - id (uuid)
   - agent_id (uuid, FK to agents)
   - ticker (varchar)
   - quantity (integer)
   - entry_price (decimal)
   - entry_date (timestamp)
   - status ('open' | 'closed')
   - exit_price (decimal, nullable)
   - exit_date (timestamp, nullable)
   - realized_pnl (decimal, nullable)
   - created_at

5. **agent_recommendations** ✅ NEW (caches AI recommendations)
   - id (uuid)
   - agent_id (uuid, FK to agents)
   - action ('BUY' | 'SELL' | 'HOLD')
   - ticker (varchar)
   - quantity (integer)
   - confidence (float)
   - reasoning (text)
   - news_summary (text)
   - risk_assessment ('Low' | 'Medium' | 'High')
   - current_price (decimal)
   - total_cost (decimal)
   - is_executed (boolean, default false)
   - executed_at (timestamp, nullable)
   - expires_at (timestamp) - 1 hour cache expiry
   - is_stop_loss (boolean, default false)
   - created_at

6. **portfolio_snapshots**
   - id (uuid)
   - agent_id (uuid, FK to agents)
   - timestamp
   - total_value (decimal)
   - cash (decimal)
   - positions (jsonb)

6. **leaderboard** (materialized view or table)
   - agent_id
   - agent_name
   - user_display_name
   - total_return_pct
   - sharpe_ratio
   - win_rate
   - trade_count
   - rank
   - updated_at

### SQL Files Structure

Place in `/sql` folder:
1. `01_schema.sql` - CREATE TABLE statements
2. `02_policies.sql` - Row Level Security policies
3. `03_functions.sql` - Database functions (calculate returns, update leaderboard)
4. `04_seed.sql` - Demo data for testing
5. `05_positions.sql` - Positions table + agent columns for real trading ✅ NEW
6. `06_recommendations.sql` - Recommendation caching with 1-hour expiry ✅ NEW

### Running Migrations

Since we're not using Prisma, run SQL files manually:
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each SQL file in order
3. Execute

Or create a script that uses Supabase's JS client to run SQL.

### RLS Policy Strategy

- Users can only read/write their own agents
- Trades belong to agents, inherit agent permissions
- Leaderboard is public read
- Service key bypasses RLS for admin operations

---

## Implementation Phases

### Phase 1: Foundation (Days 1-3) ✅ COMPLETE

**Day 1: Project Setup** ✅
- [x] Initialize Bun + Next.js 15 project
- [x] Configure TypeScript strict mode
- [x] Setup Tailwind with custom dark theme
- [x] Add custom fonts (download, configure)
- [x] Create folder structure
- [x] Initialize tracking files
- [x] Setup environment variables
- [x] Deploy empty shell to Vercel

**Day 2: Supabase Setup** ✅
- [x] Create Supabase project
- [x] Write and run schema SQL
- [x] Configure RLS policies
- [x] Setup Supabase clients (browser + server)
- [x] Test connection from Next.js

**Day 3: Authentication** ✅
- [x] Implement login page
- [x] Implement signup page
- [x] Setup auth middleware
- [x] Create protected route wrapper
- [x] Test auth flow end-to-end

### Phase 2: Core Features (Days 4-8) ✅ COMPLETE

**Day 4: Agent Creation** ✅
- [x] Design agent creation form UI
- [x] Build form with validation
- [x] Implement save to database
- [x] Create agent list view
- [x] Add agent detail view

**Day 5: Claude API Integration** ✅
- [x] Setup Claude client wrapper
- [x] Design prompt template
- [x] Build `/api/analyze` endpoint
- [x] Test with hardcoded news
- [x] Handle response parsing

**Day 6: Finnhub + Dashboard (Part 1)** ✅
- [x] Setup Finnhub client
- [x] Fetch and filter news
- [x] Integrate with analyze endpoint
- [x] Parse Claude response to trade
- [x] Store trade in database
- [x] Built performance chart (Recharts)

**Day 7: Dashboard (Part 2)** ✅
- [x] Update portfolio snapshot
- [x] Deduct user credits
- [x] Display result to user
- [x] Build reasoning log viewer
- [x] Implement cost breakdown widget
- [x] Add credit balance display

**Day 8: Leaderboard** ✅
- [x] Create leaderboard calculation function
- [x] Build leaderboard page UI
- [x] Add rank badges
- [x] Highlight user's position
- [x] Add refresh mechanism

### Phase 2.5: Real Trading System (Days 9-10) ✅ COMPLETE

**Day 9: Database & Backend** ✅
- [x] Create positions table (sql/05_positions.sql)
- [x] Add agent columns (cash_balance, auto_execute, auto_interval)
- [x] Update TypeScript types (Position, PortfolioSummary, TradeSuggestion)
- [x] Create portfolio helper functions
- [x] Update analyze endpoint (suggestion only, no auto-execute)
- [x] Build portfolio context for AI prompts

**Day 10: Execute/Refresh & UI** ✅
- [x] Create POST `/api/agents/[id]/execute` endpoint
- [x] Create GET/POST `/api/agents/[id]/refresh` endpoint
- [x] Build portfolio section component
- [x] Build trade confirmation modal
- [x] Update run-analysis with new flow
- [x] Add auto-trading settings to agent creation
- [x] Fix portfolio auto-refresh (custom events)

### Phase 2.75: Risk Management & Recommendation Caching (Day 11) ✅ COMPLETE

**Day 11: Recommendation Caching & Risk Enforcement** ✅
- [x] Create recommendation caching system (sql/06_recommendations.sql)
  - 1-hour cache expiry
  - Prevents duplicate recommendations
  - Marks executed recommendations
- [x] Add force refresh with previous recommendation context
  - Passes previous recommendation to AI when force refreshing
  - Helps AI suggest different stocks/actions
- [x] Implement automatic stop-loss enforcement
  - checkStopLoss() helper function
  - Checks BEFORE AI analysis (saves credits)
  - Forces SELL for positions exceeding stop-loss threshold
- [x] Add max position size validation
  - validateMaxPositionSize() helper function
  - Enforced on BUY orders in execute endpoint
  - Returns clear error if limit exceeded
- [x] Update AI prompt for HOLD clarification
  - HOLD only for owned positions
  - Priority checklist (stop-loss → sell deteriorated → buy → hold)
- [x] Add auto-execute for both BUY and SELL trades
  - executeTradeAutomatically() in run-analysis.tsx
- [x] Add manual sell button on portfolio positions
  - PositionCard with sell modal
  - Quantity selector with P&L preview
- [x] Add stop-loss warning banner in trade confirmation modal

### Phase 3: Competition & Polish (Days 12-14)

**Day 12: Landing Page**
- [ ] Hero section with value prop
- [ ] How it works section
- [ ] Features/benefits grid
- [ ] Speed callout (Bun)
- [ ] Cost transparency section
- [ ] CTA to signup

**Day 13: Pitch Dashboard & Polish**
- [ ] Generate mock data (50+ agents)
- [ ] Build `/pitch` static page
- [ ] Create impressive charts with mock data
- [ ] Add example reasoning logs
- [ ] Ensure no API dependencies
- [ ] Add loading states and skeleton screens
- [ ] Test complete user flow

**Day 14: Deploy & Document**
- [ ] Final deployment
- [ ] Create demo accounts
- [ ] Test edge cases and fix bugs
- [ ] Record demo video (optional)
- [ ] Update all documentation
- [ ] Prepare for submission

---

## API Architecture

### Endpoints Overview

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/agents` | List user's agents | Yes |
| POST | `/api/agents` | Create agent | Yes |
| GET | `/api/agents/[id]` | Get agent details | Yes |
| PATCH | `/api/agents/[id]` | Update agent | Yes |
| DELETE | `/api/agents/[id]` | Delete agent | Yes |
| POST | `/api/agents/[id]/analyze` | Get trade suggestion (no execute) | Yes |
| POST | `/api/agents/[id]/execute` | Confirm and execute trade | Yes |
| GET | `/api/agents/[id]/refresh` | Refresh portfolio prices | Yes |
| POST | `/api/agents/[id]/refresh` | Refresh prices + create snapshot | Yes |
| GET | `/api/agents/[id]/trades` | Get trade history | Yes |
| GET | `/api/leaderboard` | Get public rankings | No |
| GET | `/api/news` | Fetch latest news | Yes |

### Request/Response Patterns

**Standard Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Rate Limiting

- Free tier: 10 analyses per day
- Check credits before processing
- Return clear error when depleted

### Analysis Endpoint Flow

1. Validate request
2. Check user credits
3. Fetch agent configuration
4. Fetch recent news (Finnhub)
5. Construct Claude prompt
6. Call Claude API
7. Parse response
8. Validate action
9. Store trade
10. Update portfolio
11. Deduct credits
12. Return result

---

## Component Architecture

### UI Component Hierarchy

```
Layout
├── Navbar
│   ├── Logo
│   ├── NavLinks
│   └── UserMenu
├── Sidebar (dashboard)
│   ├── NavItem
│   └── CreditMeter
└── Footer

Dashboard
├── StatsGrid
│   └── StatCard
├── PerformanceChart
├── AgentList
│   └── AgentCard
└── RecentTrades
    └── TradeRow

AgentDetail
├── AgentHeader
├── PerformanceChart
├── ControlPanel
│   ├── RunAnalysisButton
│   └── StatusToggle
├── ReasoningLog
│   └── ReasoningEntry
├── TradeHistory
│   └── TradeRow
└── CostBreakdown

Leaderboard
├── LeaderboardHeader
├── TopThree (podium)
│   └── TopAgentCard
├── LeaderboardTable
│   └── LeaderboardRow
└── UserRankCard
```

### Key Component States

**AgentCard States:**
- Idle (default)
- Analyzing (loading)
- Success (show result)
- Error (show message)

**AnalysisButton States:**
- Ready (credits > 0)
- Loading (spinning)
- Disabled (no credits)
- Cooldown (rate limited)

---

## Testing Strategy

### What to Test (Prioritized)

1. **Auth Flow** - Can users login/signup/logout?
2. **Agent CRUD** - Can users create/read/update/delete agents?
3. **Analysis Flow** - Does the full analyze pipeline work?
4. **Credit System** - Are credits properly deducted?
5. **Leaderboard** - Does ranking display correctly?

### Testing Approach (Low Budget)

- **Manual testing** - Primary method
- **Console logging** - Debug API calls
- **Supabase Dashboard** - Verify database state
- **Claude Playground** - Test prompts before implementation

### Test Accounts

Create 3 demo accounts with pre-populated data:
1. `demo1@aitradingarena.com` - High performer
2. `demo2@aitradingarena.com` - Average performer  
3. `demo3@aitradingarena.com` - Fresh account (for examiners)

### Pre-Demo Checklist

- [ ] All demo accounts can login
- [ ] Each has working agents
- [ ] Analysis runs without error
- [ ] Charts display correctly
- [ ] Leaderboard shows data
- [ ] No console errors
- [ ] Pitch page loads independently

---

## Deployment Checklist

### Vercel Setup

1. Connect GitHub repository
2. Set framework preset to Next.js
3. Set Node.js version (Vercel uses Node, not Bun at runtime)
4. Configure build command: `bun run build`
5. Add all environment variables

### Environment Variables (Vercel)

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`
- `FINNHUB_API_KEY`

### Pre-Deploy Checks

- [ ] Build succeeds locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All env vars documented
- [ ] API routes work locally

### Post-Deploy Checks

- [ ] Landing page loads
- [ ] Auth works on production URL
- [ ] API routes respond
- [ ] Database connects
- [ ] Demo accounts work

### Domain (Optional)

- Configure custom domain in Vercel
- Or use default `.vercel.app` for demo

---

## Daily Workflow

### Start of Day

1. Read `TODO.md` for priorities
2. Pull latest changes (if collaborating)
3. Run `bun dev` to start server
4. Open tracking files

### During Development

1. Work on P0 tasks first
2. Log errors in `ERRORS.md` as encountered
3. Make commits with clear messages
4. Update `COMMITS.md` for significant changes

### End of Day

1. Update `PROGRESS.md` with accomplishments
2. Update `TODO.md` with tomorrow's priorities
3. Commit and push all changes
4. Verify Vercel deployment succeeded

### Weekly Review

- Review `DECISIONS.md` for consistency
- Clean up `ERRORS.md` (archive solved issues)
- Assess timeline vs reality
- Adjust priorities if needed

---

## Quick Reference

### Key Commands

```bash
# Development
bun dev                          # Start dev server
bun run build                    # Production build
bun run typecheck               # Check types

# Database
# Run SQL in Supabase Dashboard

# Testing
bun test                         # Run tests (if written)
```

### Important URLs

- Local: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel: https://vercel.com/dashboard
- Claude API: https://console.anthropic.com
- Finnhub: https://finnhub.io/dashboard

### Emergency Fixes

**"Supabase connection failed"**
→ Check env vars, verify project is active

**"Claude API error"**
→ Check API key, verify billing, check rate limits

**"Build fails on Vercel"**
→ Check for Node.js-specific code, verify env vars

---

*This document is the source of truth. Update as the project evolves.*
