# Design System - AI Trading Arena

**Purpose:** Single source of truth for all design decisions.  
**Philosophy:** Trading terminal meets gaming leaderboard. Dark, data-dense, engaging.

---

## Anti-AI-Generic Manifesto

### What We Reject ❌
- Purple gradients on white backgrounds
- Inter, Roboto, Arial font families
- Generic card layouts with equal shadows
- Bland, cookie-cutter illustrations
- Predictable component patterns
- Safe, boring color choices

### What We Embrace ✅
- Terminal-inspired dark aesthetics
- Monospace fonts for data, character fonts for narrative
- Information density done right
- Gamification without childishness
- Neon accents on deep blacks
- Charts that feel like TradingView, not Excel

---

## Color Palette

### Core Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a0f` | Main page background |
| Surface | `#111118` | Cards, panels |
| Surface Elevated | `#16161f` | Modals, dropdowns |
| Border | `#1f1f2e` | Subtle borders |
| Border Active | `#2d2d3d` | Hover/focus borders |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#e5e5e5` | Main text |
| Text Secondary | `#9ca3af` | Muted text |
| Text Tertiary | `#6b7280` | Very muted |
| Text Inverse | `#0a0a0f` | Text on light backgrounds |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#00ff88` | Primary actions, positive emphasis (terminal green) |
| Primary Muted | `#00cc6a` | Hover states |
| Secondary | `#00d4ff` | Secondary actions, links (cyan/tech blue) |
| Secondary Muted | `#00a8cc` | Hover states |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Profit/Success | `#22c55e` | Positive returns, success states |
| Profit Background | `rgba(34, 197, 94, 0.1)` | Subtle profit background |
| Loss/Error | `#ef4444` | Negative returns, error states |
| Loss Background | `rgba(239, 68, 68, 0.1)` | Subtle loss background |
| Warning | `#f59e0b` | Warnings, caution |
| Info | `#3b82f6` | Informational |

### Rank Colors (Leaderboard)

| Rank | Color | Hex |
|------|-------|-----|
| #1 Gold | `#fbbf24` | First place |
| #2 Silver | `#9ca3af` | Second place |
| #3 Bronze | `#cd7c32` | Third place |
| Diamond (Top 1%) | `#60a5fa` | Elite tier |

---

## Typography

### Font Families

**Display / Headers:**
```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```
- Use for: Page titles, section headers, emphasis

**Body / Narrative:**
```css
font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
```
- Use for: Paragraphs, descriptions, UI labels

**Data / Numbers:**
```css
font-family: 'JetBrains Mono', 'SF Mono', monospace;
font-variant-numeric: tabular-nums;
```
- Use for: Prices, percentages, returns, tickers

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| Display | 48px / 3rem | 1.1 | Landing hero |
| H1 | 36px / 2.25rem | 1.2 | Page titles |
| H2 | 28px / 1.75rem | 1.3 | Section headers |
| H3 | 22px / 1.375rem | 1.4 | Card titles |
| H4 | 18px / 1.125rem | 1.4 | Subsection |
| Body | 16px / 1rem | 1.5 | Default text |
| Small | 14px / 0.875rem | 1.5 | Secondary info |
| XS | 12px / 0.75rem | 1.4 | Captions, labels |
| Data | 14px / 0.875rem | 1.3 | Numbers, metrics |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, UI |
| Semibold | 600 | Emphasis, buttons |
| Bold | 700 | Headers, strong |

---

## Spacing System

Using 4px base unit:

| Name | Value | Usage |
|------|-------|-------|
| 0 | 0px | None |
| 1 | 4px | Tight spacing |
| 2 | 8px | Compact |
| 3 | 12px | Small gaps |
| 4 | 16px | Default padding |
| 5 | 20px | Comfortable |
| 6 | 24px | Medium |
| 8 | 32px | Large gaps |
| 10 | 40px | Section spacing |
| 12 | 48px | Large sections |
| 16 | 64px | Page sections |
| 20 | 80px | Major breaks |

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| None | 0 | Sharp edges |
| SM | 4px | Buttons, inputs |
| MD | 8px | Cards, panels |
| LG | 12px | Modals |
| XL | 16px | Large cards |
| Full | 9999px | Badges, pills |

---

## Shadows

**Minimal shadows** — we use borders and subtle glows instead.

| Name | Value | Usage |
|------|-------|-------|
| Glow Primary | `0 0 20px rgba(0, 255, 136, 0.15)` | Primary button hover |
| Glow Secondary | `0 0 20px rgba(0, 212, 255, 0.15)` | Secondary elements |
| Elevation | `0 4px 20px rgba(0, 0, 0, 0.3)` | Modals, dropdowns |

---

## Component Patterns

### Cards

```
Background: Surface (#111118)
Border: 1px solid Border (#1f1f2e)
Border Radius: 8px
Padding: 16px - 24px
Hover: Border color → Border Active (#2d2d3d)
```

### Buttons

**Primary:**
```
Background: Primary (#00ff88)
Text: Background (#0a0a0f)
Border: None
Hover: Glow + slightly darker
Active: More glow
```

**Secondary:**
```
Background: Transparent
Text: Text Primary
Border: 1px solid Border
Hover: Border → Primary
```

**Ghost:**
```
Background: Transparent
Text: Text Secondary
Border: None
Hover: Text → Primary
```

### Inputs

```
Background: Surface (#111118)
Border: 1px solid Border (#1f1f2e)
Text: Text Primary
Placeholder: Text Tertiary
Focus: Border → Primary
Error: Border → Loss
```

### Badges / Pills

```
Background: Accent at 10% opacity
Text: Accent color
Border Radius: Full
Padding: 4px 12px
Font: Small, Medium weight
```

---

## Data Visualization

### Chart Colors

| Series | Color | Usage |
|--------|-------|-------|
| Primary Line | `#00ff88` | Main data series |
| Positive Area | `rgba(34, 197, 94, 0.2)` | Profit fill |
| Negative Area | `rgba(239, 68, 68, 0.2)` | Loss fill |
| Grid Lines | `#1f1f2e` | Chart grid |
| Axis Text | `#6b7280` | Axis labels |
| Baseline | `#374151` | Reference line at $100k |

### Chart Styling

- Dark background, no white grids
- Subtle grid lines (barely visible)
- Gradient fills for area charts
- Tooltips match card styling
- Legend minimal or hidden
- Prominent current value

---

## Motion / Animation

### Timing

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Fast | 100ms | ease-out | Hover states |
| Normal | 200ms | ease-out | Transitions |
| Smooth | 300ms | ease-in-out | Page transitions |
| Slow | 500ms | ease-in-out | Complex animations |

### Animation Patterns

**Entrance (stagger children):**
```
opacity: 0 → 1
transform: translateY(10px) → translateY(0)
delay: index * 50ms
```

**Number Ticker:**
```
Count from 0 to target
Duration: 1000ms
Easing: ease-out
```

**Hover Glow:**
```
box-shadow: none → glow
Duration: 200ms
```

### What NOT to animate
- Don't bounce (too playful for finance)
- Don't spin endlessly
- Don't use spring physics (too casual)
- Don't animate everything (less is more)

---

## Iconography

### Style
- Line icons, not filled
- 1.5px - 2px stroke
- Consistent size grid (16, 20, 24px)
- Primary color or Text Secondary

### Recommended Library
- Lucide React (consistent, open-source)
- Heroicons (alternative)

### Key Icons Needed

| Concept | Icon |
|---------|------|
| Agent | Bot / Robot |
| Buy | TrendingUp / ArrowUp |
| Sell | TrendingDown / ArrowDown |
| Hold | Pause / Minus |
| Profit | Plus / DollarSign |
| Loss | Minus |
| Rank | Trophy / Medal |
| Analysis | Brain / Sparkles |
| News | Newspaper |
| Settings | Cog / Sliders |
| Credits | Coins |

---

## Responsive Breakpoints

**Desktop-first approach** (this is a trading platform)

| Name | Width | Usage |
|------|-------|-------|
| Desktop | 1280px+ | Full experience |
| Laptop | 1024px - 1279px | Slightly compact |
| Tablet | 768px - 1023px | Simplified layout |
| Mobile | < 768px | Basic functionality only |

**Note:** Mobile is P2 priority. Focus on desktop for demo.

---

## Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Normal content |
| Sticky | 10 | Sticky headers |
| Dropdown | 20 | Dropdowns, menus |
| Modal Backdrop | 30 | Modal overlay |
| Modal | 40 | Modal content |
| Toast | 50 | Notifications |
| Tooltip | 60 | Tooltips |

---

## Accessibility

### Minimum Contrast Ratios
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

### Focus States
- Visible focus ring
- Primary color outline
- 2px offset

### Screen Reader
- Semantic HTML
- ARIA labels where needed
- Announce state changes

---

## Quick Reference: Tailwind Config Values

```
colors: {
  background: '#0a0a0f',
  surface: '#111118',
  surfaceElevated: '#16161f',
  border: '#1f1f2e',
  borderActive: '#2d2d3d',
  primary: '#00ff88',
  secondary: '#00d4ff',
  profit: '#22c55e',
  loss: '#ef4444',
  warning: '#f59e0b',
  textPrimary: '#e5e5e5',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
}

fontFamily: {
  display: ['JetBrains Mono', 'monospace'],
  body: ['Outfit', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

---

*This document is the design source of truth. Deviate with intention.*
