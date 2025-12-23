# Architectural Decisions Log - AI Trading Arena

**Purpose:** Document significant technical and design decisions with full reasoning.  
**Format:** ADR (Architecture Decision Record) style  
**Rule:** Record decisions when they're made, not after. Future you will thank present you.

---

## Decision Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| 001 | Use Bun instead of Node.js | Decided | Pre-project |
| 002 | Use Supabase with direct SQL (no Prisma) | Decided | Pre-project |
| 003 | Split Architecture (Real App + Pitch Dashboard) | Decided | Pre-project |
| 004 | Credit-based system instead of unlimited | Decided | Pre-project |
| 005 | Cost transparency as feature | Decided | Pre-project |
| 006 | Dark mode only (no light theme) | Decided | Pre-project |
| 007 | Manual analysis only for free tier | Decided | Pre-project |

---

## Decisions

### ADR-001: Use Bun instead of Node.js

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Choosing a JavaScript runtime for development. Standard choice is Node.js, but Bun is a newer, faster alternative.

#### Options Considered

**Option A: Node.js**
- ✅ Industry standard, maximum compatibility
- ✅ Well-documented, huge ecosystem
- ✅ Same runtime in dev and production (Vercel)
- ❌ Slower installs and startup
- ❌ Requires separate TypeScript compilation

**Option B: Bun**
- ✅ 4x faster than Node.js (marketing angle: "milliseconds matter in trading")
- ✅ Built-in TypeScript support
- ✅ Faster package installs
- ✅ Modern, cutting-edge signal to investors
- ❌ Some npm packages may have compatibility issues
- ❌ Vercel runs Node.js in production, not Bun

#### Decision
Use **Bun** for development.

#### Rationale
1. Speed narrative is central to pitch ("In trading, milliseconds matter")
2. Demonstrates technical forward-thinking
3. Development experience is significantly better
4. Compatibility issues are manageable for this project size
5. Production running on Node.js is acceptable (still fast, just not Bun-fast)

#### Consequences
- Must check package compatibility before installing
- Cannot use Bun-specific APIs in production code (use standard APIs)
- Can highlight Bun in pitch materials as technical differentiator

---

### ADR-002: Use Supabase with Direct SQL (No Prisma)

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Need a database and ORM/query approach. Options include Prisma with Supabase, raw SQL, or Supabase client library.

#### Options Considered

**Option A: Prisma ORM**
- ✅ Type-safe queries
- ✅ Easy migrations
- ✅ Great DX for complex queries
- ❌ Additional abstraction layer
- ❌ Schema sync complexity with Supabase
- ❌ More setup time

**Option B: Direct Supabase Client + Raw SQL**
- ✅ Simpler setup
- ✅ Direct control over SQL
- ✅ Use Supabase dashboard for migrations
- ✅ Fewer dependencies
- ❌ Less type safety (mitigated with TypeScript types)
- ❌ Manual query writing

**Option C: Drizzle ORM**
- ✅ Lightweight, type-safe
- ✅ SQL-like syntax
- ❌ Still requires learning curve
- ❌ Additional complexity for 2-week project

#### Decision
Use **Supabase client library with direct SQL files** (Option B).

#### Rationale
1. 2-week timeline doesn't justify ORM setup overhead
2. Direct SQL gives full control for demo purposes
3. Supabase dashboard makes running SQL easy
4. Generate TypeScript types from Supabase for safety
5. Simpler debugging when things go wrong

#### Consequences
- Write SQL files manually in `/sql` folder
- Run migrations via Supabase Dashboard SQL Editor
- Generate types with `supabase gen types typescript`
- Keep queries simple, avoid complex joins where possible

---

### ADR-003: Split Architecture (Real App + Pitch Dashboard)

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Need to demonstrate the product to accelerator reviewers. Risk: live APIs could fail during demos.

#### Options Considered

**Option A: Single Live App Only**
- ✅ Simpler architecture
- ✅ One source of truth
- ❌ Demo depends on Claude API availability
- ❌ Demo depends on Finnhub API availability
- ❌ Demo could fail at worst moment

**Option B: Split Architecture (Real + Static)**
- ✅ Demo always works (static data)
- ✅ Real app proves technical ability
- ✅ Best screenshots for pitch deck
- ❌ Two versions to maintain
- ❌ Static data might diverge from reality

#### Decision
Use **Split Architecture** (Option B).

- `/app/*` - Real application with live APIs
- `/pitch/*` - Static showcase with pre-generated data

#### Rationale
1. Cannot risk API failures during accelerator demo
2. Static pitch page allows "perfect" data visualization
3. Real app proves we can actually build it
4. Reviewers who want to try it can use demo accounts on real app
5. Pitch deck screenshots come from `/pitch` for consistency

#### Consequences
- Generate realistic mock data for pitch dashboard
- Keep pitch dashboard visually identical to real app
- Clearly label which is which in documentation
- Update both when UI changes (potential sync issues)

---

### ADR-004: Credit-Based System Instead of Unlimited

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Claude API costs money per call. Need to limit usage while allowing meaningful testing.

#### Options Considered

**Option A: Unlimited Free Analyses**
- ✅ Best UX
- ✅ Maximum engagement
- ❌ Could bankrupt project in a day
- ❌ No upgrade incentive

**Option B: Credit-Based with Daily Limit**
- ✅ Controlled costs
- ✅ Natural upgrade path (buy more credits)
- ✅ Creates scarcity/value perception
- ❌ Users might hit limit and leave

**Option C: Time-Based Limits (X per hour)**
- ✅ Prevents burst abuse
- ❌ Confusing for users
- ❌ Doesn't match user mental model

#### Decision
Use **Credit-Based System** (Option B).

- Free tier: 10 analyses per day (resets at midnight UTC)
- Display remaining credits prominently
- Show cost per analysis (~$0.003)

#### Rationale
1. 10/day is enough to experience product value
2. Creates upgrade narrative for future
3. Cost transparency turns limit into feature
4. Easy to adjust limits later

#### Consequences
- Track credits per user in database
- Reset credits on schedule (cron job or check on login)
- Block analysis when credits depleted
- Show clear messaging about credit status

---

### ADR-005: Cost Transparency as Feature

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
API costs are real. How do we communicate this to users?

#### Options Considered

**Option A: Hide Costs (Traditional)**
- ✅ Simpler UX
- ❌ Users don't understand value
- ❌ Feels like arbitrary limits

**Option B: Show Costs Transparently**
- ✅ Builds trust
- ✅ Users understand value exchange
- ✅ Differentiator ("we show what others hide")
- ✅ Justifies premium pricing
- ❌ Might scare some users
- ❌ More UI complexity

#### Decision
**Full Cost Transparency** (Option B).

Show users:
- Cost per analysis (~$0.003)
- Monthly cost estimate
- Net returns after API costs
- ROI on API spend (27,500% in pitch)

#### Rationale
1. Aligns with trust-building narrative
2. Makes pricing feel justified
3. Creates talking point for pitch ("we show what competitors hide")
4. Educated users are better long-term customers
5. Demonstrates understanding of unit economics

#### Consequences
- Add cost tracking to every trade record
- Build cost breakdown component
- Calculate and display net returns
- Include in pitch materials prominently

---

### ADR-006: Dark Mode Only (No Light Theme)

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Should we support both light and dark themes?

#### Options Considered

**Option A: Both Themes**
- ✅ User preference
- ✅ Accessibility for some users
- ❌ Double the design work
- ❌ Double the testing
- ❌ Risk of inconsistent implementation

**Option B: Dark Mode Only**
- ✅ Half the work
- ✅ Consistent with trading platform aesthetic
- ✅ Easier to create dramatic, engaging visuals
- ❌ Some users prefer light mode

#### Decision
**Dark Mode Only** (Option B).

#### Rationale
1. Trading platforms are traditionally dark (Bloomberg, TradingView)
2. Dark mode looks more "professional" for finance
3. Half the CSS work in 2-week timeline
4. Easier to achieve striking visual design
5. Can add light mode post-demo if needed

#### Consequences
- Design system only needs dark color palette
- No theme toggle needed
- Must ensure sufficient contrast for accessibility
- All screenshots/pitch materials are dark themed

---

### ADR-007: Manual Analysis Only for Free Tier

**Date:** Pre-project  
**Status:** Decided  
**Deciders:** Solo founder

#### Context
Should free users be able to schedule automatic analyses?

#### Options Considered

**Option A: Scheduled Analyses for All**
- ✅ Better product experience
- ✅ More "realistic" simulation
- ❌ API costs explode with every user
- ❌ No way to control spend

**Option B: Manual Only for Free, Scheduled for Paid**
- ✅ Controlled costs
- ✅ Clear upgrade value proposition
- ✅ Still demonstrates core concept
- ❌ Free experience is less "automatic"

#### Decision
**Manual Only for Free Tier** (Option B).

- Free: Click "Run Analysis" button (10x per day)
- Demo accounts: Pre-configured with some scheduled runs
- Future paid: Scheduled analyses included

#### Rationale
1. Cannot afford runaway API costs during demo phase
2. Manual analysis still demonstrates the concept
3. Creates clear value for upgrade
4. Demo accounts can show scheduled results without ongoing cost

#### Consequences
- No scheduler for free users
- Demo accounts have pre-generated scheduled data
- "Upgrade to Pro for Scheduled Analyses" messaging
- Future: Build scheduler when paid tier launches

---

## Template for New Decisions

```markdown
### ADR-XXX: [Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Decided | Deprecated | Superseded by ADR-XXX  
**Deciders:** Who made this decision

#### Context
What is the issue that we're seeing that is motivating this decision?

#### Options Considered

**Option A: [Name]**
- ✅ Pro
- ❌ Con

**Option B: [Name]**
- ✅ Pro
- ❌ Con

#### Decision
What is the change that we're proposing and/or doing?

#### Rationale
Why is this decision being made? Reference numbers, data, principles.

#### Consequences
What becomes easier or more difficult because of this decision?

---
```

---

*Record decisions when they're made, not after*
