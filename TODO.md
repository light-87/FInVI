# TODO - AI Trading Arena

**Current Sprint:** Week 1
**Days Remaining:** 4
**Last Updated:** 2024-12-24

---

## Priority Legend

| Priority | Meaning | Rule |
|----------|---------|------|
| **P0** | Demo Blocker | Must complete or demo fails |
| **P1** | Should Have | Makes demo impressive |
| **P2** | Nice to Have | Only if time permits |
| **Icebox** | Future | Not for this sprint |

---

## Week 1 Focus: Foundation + Core Loop

### P0 - Must Have (Demo Blocker)

#### Day 1: Project Setup ✅
- [x] Initialize Bun + Next.js 15 project
- [x] Configure TypeScript strict mode
- [x] Setup Tailwind with custom dark theme config
- [x] Download and configure custom fonts (JetBrains Mono, Outfit)
- [x] Create full folder structure per IMPLEMENTATION_PLAN.md
- [x] Create `.env.local` with all environment variables
- [x] Create `.env.example` template (no secrets)
- [x] Deploy empty shell to Vercel
- [x] Verify Vercel deployment works

#### Day 2: Supabase Setup ✅
- [x] Create new Supabase project
- [x] Write `01_schema.sql` for all tables
- [x] Run schema SQL in Supabase Dashboard
- [x] Write `02_policies.sql` for RLS
- [x] Run RLS policies SQL
- [x] Create server Supabase client (service key)
- [x] Create browser Supabase client (anon key)
- [x] Test database connection from Next.js API route
- [x] Generate TypeScript types from Supabase

#### Day 3: Authentication ✅
- [x] Create login page (`/login`)
- [x] Create signup page (`/signup`)
- [x] Implement Supabase Auth signup flow
- [x] Implement Supabase Auth login flow
- [x] Setup auth middleware for protected routes
- [x] Create auth context/hook
- [x] Add logout functionality
- [x] Test complete auth flow end-to-end
- [x] Redirect to dashboard after login

#### Day 4: Agent Creation ✅
- [x] Design agent creation form (mockup first)
- [x] Build AgentCreator component
- [x] Form fields: name, LLM model, system prompt, news sources, risk params
- [x] Add form validation
- [x] Create POST `/api/agents` endpoint
- [x] Save agent to Supabase
- [x] Create agents list view
- [x] Create agent detail page (`/agents/[id]`)
- [x] Test CRUD operations

#### Day 5: Claude API Integration ✅
- [x] Create Claude API client wrapper (`lib/claude/client.ts`)
- [x] Design prompt template (`lib/claude/prompts.ts`)
- [x] Create POST `/api/agents/[id]/analyze` endpoint
- [x] Test with hardcoded news first
- [x] Parse Claude response to structured format
- [x] Handle errors gracefully
- [x] Add response logging for debugging

#### Day 6: Finnhub Integration ✅
- [x] Create Finnhub client wrapper (`lib/finnhub/client.ts`)
- [x] Fetch general market news
- [x] Filter by category based on agent config
- [x] Cache news responses (avoid rate limits)
- [x] Integrate with analyze endpoint
- [x] Test full flow: news → Claude → response
- [x] Verify rate limiting is respected

#### Day 7-8: Trade Execution & Dashboard ✅
- [x] Parse Claude response to trade action
- [x] Validate trade action (ticker exists, action valid)
- [x] Store trade in database
- [x] Update portfolio snapshot after trades
- [x] Deduct credit from user
- [x] Return result to frontend
- [x] Display trade result to user
- [x] Show reasoning clearly
- [x] Create dashboard overview page (`/dashboard`)
- [x] Performance chart component
- [x] Trade detail modal with reasoning viewer
- [x] Portfolio history API endpoint

#### Day 9-10: Real Trading System ✅
- [x] Add positions table to database (sql/05_positions.sql)
- [x] Add cash_balance, auto_execute, auto_interval to agents table
- [x] Update TypeScript types for positions
- [x] Create portfolio helper functions (lib/portfolio/helpers.ts)
- [x] Update analyze endpoint to return suggestion only
- [x] Create execute endpoint for trade confirmation
- [x] Create refresh endpoint for price updates
- [x] Build portfolio section UI component
- [x] Build trade confirmation modal
- [x] Add auto-trading settings to agent creation form
- [x] Auto-refresh portfolio after trade execution

---

### P1 - Should Have (Impressive)

#### Dashboard ✅
- [x] Agent performance chart (line chart)
- [x] Trades history list
- [x] Reasoning log viewer component
- [x] Cost breakdown widget
- [x] Credit balance display
- [x] Stats summary cards

#### Leaderboard ✅
- [x] Leaderboard calculation (SQL function or query)
- [x] Leaderboard page UI
- [x] Rank badges (Top 3 special treatment)
- [x] User's own rank highlighted
- [x] Sort by different metrics

#### Landing Page
- [ ] Hero section with value prop
- [ ] "How it works" section (3-4 steps)
- [ ] Bun speed callout
- [ ] Features grid
- [ ] CTA buttons

---

### P2 - Nice to Have (If Time)

- [ ] Skeleton loading states
- [ ] Entrance animations
- [ ] Number ticker animations
- [ ] Multi-model comparison view
- [ ] Strategy templates (pre-built prompts)
- [ ] Export reasoning as PDF
- [ ] Dark chart grid styling

---

## Week 2 Focus: Polish + Pitch

### P0 - Must Have (Demo Blocker)

- [ ] Pitch dashboard (`/pitch`) with static data
- [ ] 50+ mock agents with realistic data
- [ ] All charts working with mock data
- [ ] Example reasoning logs
- [ ] Demo accounts created and working
- [ ] Full user flow tested end-to-end
- [ ] No console errors
- [ ] Deploy final version

### P1 - Should Have (Impressive)

- [ ] Loading states throughout
- [ ] Error states with retry
- [ ] Smooth transitions
- [ ] Mobile basic responsiveness
- [ ] Performance optimization

### P2 - Nice to Have

- [ ] Demo video recording
- [ ] README polish
- [ ] Code cleanup

---

## Icebox (Future / Post-Demo)

These are good ideas but NOT for the 2-week demo:

- [ ] GPT-4 integration (multi-model)
- [ ] Gemini integration
- [ ] Research paper upload feature
- [ ] Real-time leaderboard updates
- [ ] Push notifications
- [ ] Light theme option
- [ ] Mobile app
- [ ] Payment integration (Stripe)
- [ ] Scheduled analyses (paid tier) - partially done with auto_execute
- [ ] Team/collaborative agents
- [ ] API for power users
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced backtesting
- [ ] Multiple asset classes
- [ ] True cron jobs for auto-trading

---

## Blockers & Dependencies

| Blocker | Depends On | Status |
|---------|------------|--------|
| Claude API calls | API key active | ✅ Working |
| Finnhub API calls | API key | ✅ Working |
| Supabase connection | Project created | ✅ Working |
| Vercel deploy | GitHub repo | ⏳ Need to deploy |
| Real trading | Positions table | ✅ Implemented |

---

## Recent Commits (Real Trading System)

| Commit | Description |
|--------|-------------|
| `5cd6337` | Add positions table and updated TypeScript types |
| `ab57276` | Update analyze endpoint for suggestion-only mode |
| `6a62e69` | Add execute and refresh endpoints |
| `f011b27` | Add portfolio section and trade confirmation modal |
| `6d6a569` | Add auto-trading settings to agent creation |
| `2e3a2fd` | Fix portfolio auto-refresh after trade execution |

---

## Daily Checklist

### Before Starting
- [ ] Review this TODO.md
- [ ] Check PROGRESS.md for yesterday's status
- [ ] Pull latest changes (if using Git)
- [ ] Run `bun dev`

### During Work
- [ ] Focus on P0 tasks first
- [ ] Log errors in ERRORS.md
- [ ] Commit after each feature
- [ ] Update COMMITS.md for significant changes

### Before Stopping
- [ ] Update PROGRESS.md
- [ ] Update this TODO.md
- [ ] Commit and push
- [ ] Verify Vercel deployment

---

## Quick Reference

### Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
FINNHUB_API_KEY=
```

### Key URLs
- Supabase Dashboard: https://supabase.com/dashboard
- Anthropic Console: https://console.anthropic.com
- Finnhub: https://finnhub.io/dashboard
- Vercel: https://vercel.com/dashboard

### Key Commands
```bash
bun dev          # Start dev server
bun run build    # Production build
bun add <pkg>    # Add package
```

---

*Update this file at the start and end of each day*
