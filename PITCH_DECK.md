# VIVY - Pitch Deck
## "The Kaggle for Financial AI Agents"

---

# SLIDE 1: TITLE

## VIVY
### The Kaggle for Financial AI Agents

*What if anyone could be a quant?*

**Vaibhav Talekar**
MSc Artificial Intelligence, University of Surrey

---

**SPEAKER NOTES:**
- Start strong with the tagline
- Make eye contact, show confidence
- This slide should be on screen for only 5-10 seconds

---

# SLIDE 2: THE PROBLEM

## 99% of People with Market Insights Can't Act on Them

### The Barrier: Code

- Algorithmic trading requires Python, R, or C++
- Average person has **ideas** but no way to **execute**
- $14B+ algorithmic trading market is locked behind programming skills

### The Reality:

> "I knew Tesla would drop after that tweet... but I couldn't automate a trade."

> "I see patterns in earnings calls... but I can't write a trading bot."

**Millions of insights. Zero execution.**

---

**SPEAKER NOTES:**
- Paint the pain point vividly
- These quotes represent real frustrations
- Pause after "Millions of insights. Zero execution." for effect

---

# SLIDE 3: THE SOLUTION

## Vivy: Trade with Words, Not Code

### Replace Python with Plain English

Instead of writing 200 lines of code, users write:

```
"Buy tech stocks when their PE ratio drops below industry
average after positive earnings surprises. Sell if price
drops 5% or rises 15%."
```

**That's it.** Our AI understands, executes, and explains every decision.

### The Magic:
- ✅ No coding required
- ✅ Full reasoning for every trade (not a black box)
- ✅ Real market data integration
- ✅ Risk controls built-in

---

**SPEAKER NOTES:**
- This is the "aha" moment
- Read the prompt example naturally
- Emphasize "That's it" with a pause
- Differentiate from black-box trading bots

---

# SLIDE 4: HOW IT WORKS

## From Idea to Execution in 3 Steps

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. CREATE          2. ANALYZE           3. EXECUTE         │
│  ────────          ─────────            ─────────           │
│                                                             │
│  Write your        AI reads news,       Review reasoning,   │
│  strategy in       analyzes market,     confirm trade,      │
│  plain English     generates trade      track performance   │
│                    recommendation                           │
│                                                             │
│  "Buy undervalued  → "BUY 50 AAPL      → Portfolio updated  │
│   tech after        @ $178 because      → P&L tracked       │
│   earnings..."      earnings beat +     → Full transparency │
│                     PE below avg"                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Powered By:
- **Claude AI** for reasoning (PhD-level analysis)
- **Real-time market data** from Finnhub
- **Risk management** (stop-loss, position limits)

---

**SPEAKER NOTES:**
- Walk through the flow left to right
- Emphasize the reasoning/explainability
- Mention that this is WORKING - not a mockup

---

# SLIDE 5: THE PRODUCT (Demo Slide)

## Live Platform Demo

> **NOTE:** This slide can be split into 2-3 slides if needed, or used as a single "product overview" slide.

---

### SCREENSHOT 1: Agent Creation Page
**📸 INSERT SCREENSHOT HERE: `/agents/new` page**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [SCREENSHOT: Agent Creation Form]                         │
│                                                             │
│   URL: /agents/new (or /dashboard/agents/new)               │
│                                                             │
│   WHAT TO CAPTURE:                                          │
│   - The form with agent name field                          │
│   - Strategy prompt textarea (with example text filled in)  │
│   - Model selector (Claude Sonnet/Opus)                     │
│   - News sources checkboxes                                 │
│   - Risk parameters (stop loss %, position size)            │
│                                                             │
│   TIP: Fill in an example strategy like:                    │
│   "Buy tech stocks after positive earnings surprises        │
│    when PE ratio is below industry average"                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*Caption: "Create your AI trading agent with natural language - no code required"*

---

### SCREENSHOT 2: AI Analysis Results
**📸 INSERT SCREENSHOT HERE: Analysis results after clicking "Analyze"**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [SCREENSHOT: Analysis Results / Recommendation]           │
│                                                             │
│   URL: /agents/[id] (agent detail page after analysis)      │
│                                                             │
│   WHAT TO CAPTURE:                                          │
│   - The recommendation card (BUY/SELL/HOLD)                 │
│   - Stock ticker and quantity                               │
│   - THE REASONING TEXT (most important!)                    │
│   - Confidence score if visible                             │
│   - Cost transparency ($0.003 API cost)                     │
│                                                             │
│   TIP: Run an analysis on a real stock so you have          │
│   actual AI reasoning to show. This is the "magic moment"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*Caption: "Full AI reasoning for every trade - not a black box"*

---

### SCREENSHOT 3: Portfolio Dashboard
**📸 INSERT SCREENSHOT HERE: Dashboard with positions**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [SCREENSHOT: Portfolio / Dashboard]                       │
│                                                             │
│   URL: /dashboard                                           │
│                                                             │
│   WHAT TO CAPTURE:                                          │
│   - Portfolio value / cash balance                          │
│   - Open positions with P&L (green/red)                     │
│   - Performance chart if visible                            │
│   - Any stats (return %, win rate)                          │
│                                                             │
│   TIP: Make sure you have some positions open               │
│   with visible P&L to show it's "real" trading              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*Caption: "Track positions, P&L, and performance in real-time"*

---

### SCREENSHOT 4: Leaderboard
**📸 INSERT SCREENSHOT HERE: Public leaderboard**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [SCREENSHOT: Leaderboard]                                 │
│                                                             │
│   URL: /leaderboard                                         │
│                                                             │
│   WHAT TO CAPTURE:                                          │
│   - Top ranked agents with performance                      │
│   - Gold/Silver/Bronze badges for top 3                     │
│   - Return %, win rate columns                              │
│   - Multiple agents showing competition                     │
│                                                             │
│   TIP: This shows the "Kaggle" aspect - competition         │
│   and gamification. Make sure it looks active.              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*Caption: "Compete on the leaderboard - the Kaggle for trading strategies"*

---

**SPEAKER NOTES:**
- If presenting live: "Let me show you the actual product"
- Walk through each screenshot briefly
- Point out: "This is real. Working. Today."
- The REASONING screenshot is most important - it shows explainability

**SCREENSHOT CAPTURE TIPS:**
1. Use browser at 1920x1080 or 1440x900 for clean screenshots
2. Use dark mode (matches our brand)
3. Clear any sensitive/test data before capturing
4. Consider using a tool like CleanShot or Screely for prettier borders
5. If using Figma/Canva, add subtle drop shadows to screenshots

---

# SLIDE 6: MARKET OPPORTUNITY

## Massive Market, Untapped Segment

### Current Market:
- Algorithmic trading: **$14.1B** (2024)
- Growing **12.2% CAGR** through 2030

### The Problem:
- Only serves people who can **code**
- That's ~1% of potential traders

### Our Opportunity:
- **100x larger addressable market** by removing code barrier
- Retail traders: 150M+ globally
- "Vibe coding" generation expects AI to do the work

```
┌────────────────────────────────────────┐
│  Traditional Quant    │    Vivy        │
│  ──────────────────   │    ────        │
│  Requires: Python,    │    Requires:   │
│  R, finance degree    │    An idea     │
│                       │                │
│  Market: 1M users     │    Market:     │
│                       │    100M+ users │
└────────────────────────────────────────┘
```

---

**SPEAKER NOTES:**
- Don't dwell on numbers, keep it quick
- The key insight: "We unlock 100x more users"
- "Vibe coding generation" - this resonates in 2025

---

# SLIDE 7: WHY NOW?

## The Perfect Timing

### 1. AI is Finally Good Enough
- LLMs now reason at PhD-level
- Can analyze earnings calls, news, sentiment
- Explain decisions (not black box)

### 2. "Agentic AI" is the Trend of 2025
- AI agents that take action, not just answer questions
- Every major tech company is building agents
- Trading is perfect use case for agents

### 3. Retail Trading Explosion
- Post-2020: Millions of new retail traders
- They have opinions, want automation
- Current tools still require code

### 4. Regulatory Tailwinds
- AI explainability becoming required
- Our "reasoning-first" approach is compliant by design

---

**SPEAKER NOTES:**
- This slide answers "why hasn't someone built this before?"
- AI quality + timing + market demand = now
- Emphasize: "This wasn't possible 2 years ago"

---

# SLIDE 8: BUSINESS MODEL

## How We Make Money

### B2C: Individual Traders

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 10 analyses/day, manual execution |
| **Pro** | $19/mo | 100 analyses, auto-execute, alerts |
| **Power** | $49/mo | Unlimited, API access, priority |

### B2B: The Real Opportunity

**1. Sponsored Challenges** 💰
- Hedge funds sponsor trading competitions
- $5K-50K per challenge
- Winners get prizes, sponsors get alpha

**2. Strategy Licensing** 📈
- Top strategies licensed to institutions
- Revenue share: 70% creator / 30% Vivy
- Recurring revenue from institutional clients

**3. Enterprise** 🏢
- White-label platform for trading firms
- $10K+/month

---

**SPEAKER NOTES:**
- B2C gets users, B2B gets revenue
- "Sponsored challenges" is like Kaggle for trading
- Institutional licensing is the big upside
- Don't need to hit all revenue streams Day 1

---

# SLIDE 9: TRACTION & STATUS

## Where We Are Today

### Built:
- ✅ Full authentication system
- ✅ AI-powered trading analysis (Claude API)
- ✅ Real market data integration (Finnhub)
- ✅ Portfolio management with P&L tracking
- ✅ Risk controls (stop-loss, position limits)
- ✅ Public leaderboard for competition
- ✅ Cost transparency (shows API costs)

### Ready For:
- 🚀 Beta user onboarding
- 🚀 First sponsored challenge
- 🚀 Institutional partnerships

### What We Need:
- Marketing & distribution expertise
- Regulatory guidance for fintech
- Network access to institutional investors

---

**SPEAKER NOTES:**
- Show that this is REAL, not vaporware
- "Built" section proves execution ability
- Be honest about what you need help with
- This is where accelerator value comes in

---

# SLIDE 10: TEAM

## Why Me?

### Vaibhav Talekar
**Founder & Builder**

🎓 **Education:**
- MSc Artificial Intelligence, University of Surrey (Current)

💼 **Experience (4 years):**
- Data Scientist / SME at early-stage startup (grew to scale)
- Software Engineer at startup
- Full-stack builder: AI + Backend + Frontend

🧠 **Why I Built This:**
> "I believe AI is now smart enough to democratize investing.
> Coding should not be a barrier between a person and their
> financial ideas. I built Vivy to prove that anyone with
> insight can become a quant."

📊 **Personal:**
- Active investor (personal + family portfolio)
- Passionate about AI democratizing finance

---

**SPEAKER NOTES:**
- Be authentic, not boastful
- The story: Data Scientist → Engineer → AI Masters → This
- "Why I built this" is your personal connection
- Looking for co-founder with GTM/growth expertise (optional to mention)

---

# SLIDE 11: THE ASK

## Join Us

### We're Seeking:

**Accelerator Partnership**
- Mentorship on go-to-market strategy
- Network access (institutional investors, fintech advisors)
- Regulatory navigation support

**Funding: $150K**
- 12-18 months runway to:
  - Launch public beta
  - Run first sponsored challenges
  - Build institutional partnerships
  - Hire growth/marketing support

### What You Get:
- Ground floor of "AI trading for everyone"
- A builder who ships fast
- Huge market, perfect timing
- Working product (not just slides)

---

**SPEAKER NOTES:**
- Be clear about what you need
- $150K is reasonable for pre-seed
- Emphasize: "I have a working product, I need help scaling"
- Show you know what you don't know (GTM, regulatory)

---

# SLIDE 12: VISION

## The Future We're Building

### Today:
AI agents trade based on your natural language strategy

### Tomorrow:
- **Social trading:** Follow top-performing agents
- **Strategy marketplace:** Buy/sell proven strategies
- **Institutional integration:** Direct hedge fund partnerships
- **Multi-asset:** Crypto, forex, commodities
- **Mobile:** Trade from anywhere

### The End State:

> **"The Bloomberg Terminal for the AI generation"**

Everyone with an idea can participate in markets.
No code. No barriers. Just insight.

---

**SPEAKER NOTES:**
- Paint the vision, but don't overpromise
- "Bloomberg Terminal for AI generation" is a big swing
- End on inspiration: democratizing finance
- Thank them, invite questions

---

# SLIDE 13: THANK YOU

## Let's Build the Future of Trading

**Vaibhav Talekar**

📧 [Your Email]
🔗 [LinkedIn URL]
🌐 [Product URL when live]
📂 [GitHub if relevant]

*"What if anyone could be a quant?"*

**Vivy** - The Kaggle for Financial AI Agents

---

**SPEAKER NOTES:**
- Leave contact info visible
- Invite questions
- Have demo ready if they want to see more

---

---

# APPENDIX: EXTRA SLIDES (Use If Asked)

## A1: Competitive Landscape

| Competitor | What They Do | Our Advantage |
|------------|--------------|---------------|
| **Quantopian** (shut down) | Code-based quant platform | No-code, still active |
| **eToro** | Copy trading | AI reasoning, not just copying |
| **Alpaca** | API for trading bots | No coding required |
| **Trade Ideas** | AI alerts | Full strategy, not just alerts |
| **ChatGPT** | Can discuss trading | No execution, no portfolio |

**Our Moat:**
- Network effects (more users = better leaderboard = more data)
- Strategy data (unique "semantic alpha" dataset)
- Explainability (regulatory advantage)

---

## A2: Unit Economics

```
Cost per analysis: ~$0.003 (Claude API)
Pro subscription: $19/month

If Pro user runs 50 analyses/month:
- Cost: $0.15
- Revenue: $19
- Gross margin: 99%+

B2B Challenge economics:
- Sponsor pays: $10,000
- Prize pool: $5,000
- Platform cost: $500
- Gross profit: $4,500 (45% margin)
```

---

## A3: Roadmap

**Q1 2025:** Public beta, first 1000 users
**Q2 2025:** First sponsored challenge, Pro tier launch
**Q3 2025:** Institutional pilot, strategy licensing
**Q4 2025:** Series A preparation, 10K users

---

## A4: Risk Factors & Mitigation

| Risk | Mitigation |
|------|------------|
| Regulatory | Paper trading only initially; explainability built-in |
| AI hallucination | Human confirmation before trades; reasoning visible |
| Market risk | Clear disclaimers; not financial advice |
| Competition | First-mover in no-code AI trading; network effects |

---

# END OF PITCH DECK

---

## Design Notes for Slide Creation:

**Colors (from Design System):**
- Primary: Neon Green #00ff88
- Accent: Cyan #00d4ff
- Background: Dark #0a0a0f
- Text: White #ffffff

**Fonts:**
- Headlines: Outfit (bold, modern)
- Data/Numbers: JetBrains Mono
- Body: System sans-serif

**Style:**
- Minimal text per slide
- Dark theme (professional, fintech feel)
- Screenshots with subtle glow effects
- No generic stock photos
- No purple gradients (per design system "Anti-AI-Generic Manifesto")

**Tools to Create Slides:**
- Figma (most control)
- Canva (fastest)
- Google Slides (collaborative)
- Pitch.com (modern, good templates)
