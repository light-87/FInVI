# Real P&L Trading System - Implementation Plan

**Created:** 2024-12-24
**Status:** ✅ COMPLETE
**Completed:** 2024-12-24
**Priority:** P0 - Critical for demo authenticity

---

## Implementation Summary

All 6 steps have been implemented and pushed to branch `claude/ai-trading-arena-QzkDa`.

### Commits
| Commit | Step | Description |
|--------|------|-------------|
| `5cd6337` | 1 | Database schema (positions table, agent columns) + TypeScript types |
| `ab57276` | 2 | Analyze endpoint returns suggestion only, with portfolio context |
| `6a62e69` | 3-4 | Execute endpoint (BUY/SELL) + Refresh endpoint (price updates) |
| `f011b27` | 5 | UI: Portfolio section + Trade confirmation modal |
| `6d6a569` | 6 | Agent creation form with auto-trading settings |
| `2e3a2fd` | Fix | Portfolio auto-refresh after trade execution |

### Files Created
- `sql/05_positions.sql` - Migration for positions table + agent columns
- `src/lib/portfolio/helpers.ts` - Portfolio helper functions
- `src/app/api/agents/[id]/execute/route.ts` - Trade execution
- `src/app/api/agents/[id]/refresh/route.ts` - Price refresh
- `src/app/(dashboard)/agents/[id]/portfolio-section.tsx` - Portfolio UI
- `src/app/(dashboard)/agents/[id]/trade-confirmation-modal.tsx` - Confirmation modal

### Files Modified
- `src/types/database.ts` - New types (Position, PortfolioSummary, etc.)
- `src/lib/claude/prompts.ts` - Portfolio context + quantity support
- `src/app/api/agents/[id]/analyze/route.ts` - Suggestion-only response
- `src/app/(dashboard)/agents/[id]/run-analysis.tsx` - New flow with confirmation
- `src/app/(dashboard)/agents/[id]/page.tsx` - Added PortfolioSection
- `src/app/(dashboard)/agents/new/agent-creator-form.tsx` - Auto-trading options
- `src/app/api/agents/route.ts` - Auto-trading fields

### To Activate
Run `sql/05_positions.sql` in Supabase SQL editor to add the positions table and agent columns.

---

## Original Context (for reference)

### Previous Progress (Days 1-9)
- Project setup, Supabase, Auth ✅
- Agent CRUD ✅
- Claude API integration ✅
- Finnhub news + quotes ✅
- Dashboard + charts ✅
- Leaderboard ✅

### What Was Fixed
The old system **simulated** P&L with random values. Now it tracks real positions and prices.

---

## Problem Statement

**Current (Wrong):**
1. User runs analysis
2. AI suggests BUY/SELL
3. Trade executes immediately with random +/- return
4. No actual position tracking
5. AI doesn't know what agent owns

**New (Correct):**
1. User runs analysis
2. AI sees current portfolio (cash + positions) and news
3. AI suggests trade with reasoning
4. User sees confirmation modal: [Cancel] [Confirm] [Auto]
5. On confirm: real position created, cash deducted
6. User can refresh prices anytime to see real P&L
7. Auto mode: future trades execute without confirmation

---

## New Data Model

### Add to `agents` table
```sql
ALTER TABLE agents ADD COLUMN cash_balance DECIMAL DEFAULT 100000;
ALTER TABLE agents ADD COLUMN auto_execute BOOLEAN DEFAULT false;
ALTER TABLE agents ADD COLUMN auto_interval TEXT DEFAULT '24h'; -- '3h' | '10h' | '24h'
```

### New `positions` table
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL,
  entry_price DECIMAL NOT NULL,
  entry_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(10) DEFAULT 'open', -- 'open' | 'closed'
  exit_price DECIMAL,
  exit_date TIMESTAMP,
  realized_pnl DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Update TypeScript types
Add to `src/types/database.ts`:
- Position type
- Updated Agent type with cash_balance, auto_execute, auto_interval

---

## New API Endpoints

### 1. `POST /api/agents/[id]/analyze` (MODIFY)
**Change:** Returns suggestion only, does NOT execute trade

**Input:** None (uses agent ID from URL)

**Process:**
1. Fetch agent's current positions from DB
2. Fetch current prices for all positions (Finnhub)
3. Calculate unrealized P&L for each position
4. Fetch latest news (Finnhub)
5. Build prompt with full portfolio context
6. Call Claude API
7. Parse suggestion (action, ticker, quantity, reasoning)
8. Return suggestion WITHOUT executing

**Output:**
```json
{
  "suggestion": {
    "action": "BUY",
    "ticker": "AAPL",
    "quantity": 10,
    "current_price": 185.50,
    "total_cost": 1855.00,
    "reasoning": "...",
    "confidence": 0.85
  },
  "portfolio": {
    "cash": 100000,
    "positions": [...],
    "total_value": 100000
  }
}
```

### 2. `POST /api/agents/[id]/execute` (NEW)
**Purpose:** Confirm and execute a suggested trade

**Input:**
```json
{
  "action": "BUY",
  "ticker": "AAPL",
  "quantity": 10,
  "price": 185.50,
  "enable_auto": false,
  "auto_interval": "24h"
}
```

**Process (BUY):**
1. Verify agent has enough cash
2. Deduct cash: `cash_balance -= quantity * price`
3. Create position record
4. Update agent's last_analysis_at
5. Deduct user credit

**Process (SELL):**
1. Verify agent owns the position
2. Calculate realized P&L: `(exit_price - entry_price) * quantity`
3. Add cash: `cash_balance += quantity * price`
4. Close position (set status='closed', exit_price, realized_pnl)
5. Update agent stats (winning_trades if profitable)

**Output:**
```json
{
  "success": true,
  "trade": { ... },
  "portfolio": {
    "cash": 98145,
    "positions": [...]
  }
}
```

### 3. `POST /api/agents/[id]/refresh` (NEW)
**Purpose:** Fetch current prices and recalculate P&L

**Process:**
1. Get all open positions for agent
2. Fetch current quote for each ticker (Finnhub)
3. Calculate unrealized P&L for each
4. Calculate total portfolio value: cash + sum(position values)
5. Update agent's current_value and total_return_pct
6. Create portfolio snapshot

**Output:**
```json
{
  "portfolio": {
    "cash": 85000,
    "positions": [
      {
        "ticker": "AAPL",
        "quantity": 10,
        "entry_price": 185.50,
        "current_price": 190.00,
        "value": 1900.00,
        "unrealized_pnl": 45.00,
        "unrealized_pnl_pct": 2.43
      }
    ],
    "total_value": 86900,
    "total_return_pct": -13.1
  },
  "last_updated": "2024-12-24T10:30:00Z"
}
```

---

## Updated Prompt Template

The AI needs full portfolio context. Update `src/lib/claude/prompts.ts`:

```
You are a trading agent with the following portfolio:

CASH AVAILABLE: $85,000.00

CURRENT POSITIONS:
1. AAPL - 10 shares @ $185.50 (current: $190.00)
   Unrealized P&L: +$45.00 (+2.4%)
2. NVDA - 5 shares @ $450.00 (current: $440.00)
   Unrealized P&L: -$50.00 (-2.2%)

TOTAL PORTFOLIO VALUE: $86,900.00
TOTAL RETURN: -13.1% (from $100,000 starting capital)

---

LATEST MARKET NEWS:
[news articles here]

---

Based on your strategy and risk parameters, analyze the news and your current positions.
Respond with ONE of:
- BUY [TICKER] [QUANTITY] - if you see an opportunity
- SELL [TICKER] [QUANTITY] - if you want to exit/reduce a position
- HOLD - if no action needed

Consider:
- Your available cash for buying
- Your current positions for selling
- Your risk parameters (max position size, stop loss, etc.)
```

---

## UI Changes

### Agent Detail Page - New Sections

**Portfolio Section:**
```
┌─────────────────────────────────────────────────────┐
│ Portfolio                          [Refresh Prices] │
├─────────────────────────────────────────────────────┤
│ Cash: $85,000.00                                    │
│                                                     │
│ Positions:                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ AAPL  10 shares                                 │ │
│ │ Entry: $185.50  Current: $190.00                │ │
│ │ P&L: +$45.00 (+2.4%)                     [SELL] │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ NVDA  5 shares                                  │ │
│ │ Entry: $450.00  Current: $440.00                │ │
│ │ P&L: -$50.00 (-2.2%)                     [SELL] │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Total Value: $86,900.00                             │
│ Total Return: -13.1%                                │
└─────────────────────────────────────────────────────┘
```

**Trade Confirmation Modal:**
```
┌─────────────────────────────────────────────────────┐
│ AI Suggests: BUY AAPL                               │
├─────────────────────────────────────────────────────┤
│ Quantity: 10 shares                                 │
│ Price: $185.50                                      │
│ Total Cost: $1,855.00                               │
│                                                     │
│ Available Cash: $100,000.00                         │
│ After Trade: $98,145.00                             │
│                                                     │
│ Reasoning:                                          │
│ "Apple's strong earnings report suggests..."        │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☐ Enable auto-trading                           │ │
│ │   Interval: [3h ▾] [10h] [24h]                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│        [Cancel]    [Confirm]    [Auto & Confirm]    │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Order (All Complete ✅)

### Step 1: Database Changes ✅
1. ✅ Add columns to agents table (cash_balance, auto_execute, auto_interval)
2. ✅ Create positions table
3. ✅ Update TypeScript types

### Step 2: Update Analyze Endpoint ✅
1. ✅ Fetch positions and calculate current values
2. ✅ Update prompt to include portfolio context
3. ✅ Return suggestion only (don't execute)

### Step 3: Create Execute Endpoint ✅
1. ✅ Handle BUY: create position, deduct cash
2. ✅ Handle SELL: close position, add cash, calculate realized P&L
3. ✅ Handle auto-execute flag

### Step 4: Create Refresh Endpoint ✅
1. ✅ Fetch current prices for all positions
2. ✅ Calculate unrealized P&L
3. ✅ Update agent totals

### Step 5: Update UI ✅
1. ✅ Add portfolio section to agent detail page
2. ✅ Create trade confirmation modal
3. ✅ Add refresh prices button
4. ✅ Show positions with entry vs current price
5. ✅ Auto-refresh portfolio after trade execution

### Step 6: Update Agent Creation ✅
1. ✅ Add auto_execute toggle to form
2. ✅ Add auto_interval selector
3. ✅ Initialize cash_balance to 100000

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/database.ts` | Add Position type, update Agent type |
| `src/app/api/agents/[id]/analyze/route.ts` | Return suggestion only, add portfolio context |
| `src/app/api/agents/[id]/execute/route.ts` | NEW - execute confirmed trades |
| `src/app/api/agents/[id]/refresh/route.ts` | NEW - refresh prices |
| `src/lib/claude/prompts.ts` | Add portfolio context builder |
| `src/app/(dashboard)/agents/[id]/page.tsx` | Add portfolio section |
| `src/app/(dashboard)/agents/[id]/run-analysis.tsx` | Add confirmation modal |
| `src/app/(dashboard)/agents/new/agent-creator-form.tsx` | Add auto settings |

---

## Future Enhancements (Post-MVP)

1. **True Cron Jobs**: Use Vercel cron or similar for real automated trading
2. **Stop Loss Execution**: Auto-sell when position drops below threshold
3. **Take Profit**: Auto-sell when position gains X%
4. **Multiple Orders**: Queue multiple trades from one analysis
5. **Short Selling**: Allow selling stocks you don't own
6. **Limit Orders**: Set target price for execution

---

## Prompt for New Chat

Copy this to start a new session:

```
I'm building AI Trading Arena - a platform where users create AI trading agents that analyze news and make trades.

Please read these files first:
1. /home/user/FInVI/REAL_TRADING_PLAN.md - detailed implementation plan
2. /home/user/FInVI/TODO.md - overall progress
3. /home/user/FInVI/ai-trading-arena/src/types/database.ts - current types

Current state: Days 1-9 complete (auth, agents, Claude API, Finnhub, dashboard, leaderboard).

Problem: The current system simulates P&L with random values. We need REAL position tracking.

Task: Implement the real trading system as described in REAL_TRADING_PLAN.md:
1. Database changes (positions table, agent fields)
2. Update analyze endpoint to return suggestions only
3. Create execute endpoint for confirming trades
4. Create refresh endpoint for updating prices
5. Update UI with portfolio view and confirmation modal

Start with Step 1: Database changes and TypeScript types.
```
