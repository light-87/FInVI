# TODO - AI Trading Arena

**Current Sprint:** Week 1
**Days Remaining:** 6
**Last Updated:** 2024-12-23

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

#### Day 1: Project Setup
- [ ] Initialize Bun + Next.js 15 project
  - Command: `bun create next-app ai-trading-arena`
- [ ] Configure TypeScript strict mode
- [ ] Setup Tailwind with custom dark theme config
- [ ] Download and configure custom fonts (JetBrains Mono, Outfit)
- [ ] Create full folder structure per IMPLEMENTATION_PLAN.md
- [ ] Create `.env.local` with all environment variables
- [ ] Create `.env.example` template (no secrets)
- [ ] Deploy empty shell to Vercel
- [ ] Verify Vercel deployment works

#### Day 2: Supabase Setup
- [ ] Create new Supabase project
- [ ] Write `01_schema.sql` for all tables
- [ ] Run schema SQL in Supabase Dashboard
- [ ] Write `02_policies.sql` for RLS
- [ ] Run RLS policies SQL
- [ ] Create server Supabase client (service key)
- [ ] Create browser Supabase client (anon key)
- [ ] Test database connection from Next.js API route
- [ ] Generate TypeScript types from Supabase

#### Day 3: Authentication
- [ ] Create login page (`/login`)
- [ ] Create signup page (`/signup`)
- [ ] Implement Supabase Auth signup flow
- [ ] Implement Supabase Auth login flow
- [ ] Setup auth middleware for protected routes
- [ ] Create auth context/hook
- [ ] Add logout functionality
- [ ] Test complete auth flow end-to-end
- [ ] Redirect to dashboard after login

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

---

### P1 - Should Have (Impressive)

#### Dashboard ✅
- [x] Agent performance chart (line chart)
- [x] Trades history list
- [x] Reasoning log viewer component
- [x] Cost breakdown widget
- [x] Credit balance display
- [x] Stats summary cards

#### Leaderboard
- [ ] Leaderboard calculation (SQL function or query)
- [ ] Leaderboard page UI
- [ ] Rank badges (Top 3 special treatment)
- [ ] User's own rank highlighted
- [ ] Sort by different metrics

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
- [ ] Scheduled analyses (paid tier)
- [ ] Team/collaborative agents
- [ ] API for power users
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced backtesting
- [ ] Multiple asset classes

---

## Blockers & Dependencies

| Blocker | Depends On | Status |
|---------|------------|--------|
| Claude API calls | API key active | ✅ Working |
| Finnhub API calls | API key | ✅ Working |
| Supabase connection | Project created | ✅ Working |
| Vercel deploy | GitHub repo | ⏳ Need to deploy |

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
