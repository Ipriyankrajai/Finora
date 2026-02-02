# Phase 5: Visualizations & Dashboard - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Users see spending patterns and loan progress through charts and interactive simulation. Includes monthly summary, spending breakdown pie chart (top 5 + "Other"), spending trend timeline, loan amortization chart, what-if simulator for extra payments, and quick-add transaction from dashboard.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Monthly summary (income/expense/net) prominently at top as primary focus
- Below summary: spending charts first, then loans section
- Responsive: stack vertically on mobile/tablet (same order, single column)
- Preset date picker: "This month", "Last month", "Last 3 months" presets
- Show last 5 recent transactions on dashboard

### Chart Interactions
- Hover: highlight segment visually + show detailed tooltip (amount, percentage)
- Click pie segment: inline expand to show transactions for that tag below chart
- Spending timeline: toggle between weekly bars and daily line views
- Empty state: friendly illustration + message ("No spending recorded this month")

### What-If Simulator
- Input method: slider to adjust extra monthly payment amount
- Update timing: debounced (200-300ms after user stops moving)
- Output: full breakdown — payoff date, time saved, interest saved, comparison chart
- Scope: single loan focus (user picks a loan, slider simulates extra on that loan)

### Quick-Add Experience
- Placement: floating action button (fixed bottom-right, always visible)
- Form: full form with same fields as regular transaction form
- Success: close form, show toast notification
- Dashboard shows last 5 recent transactions

### Claude's Discretion
- Exact slider range and step increments for what-if simulator
- Comparison chart visualization style (line vs area vs combined)
- Toast notification duration and styling
- Loading states during data fetches
- Specific chart library selection and configuration

</decisions>

<specifics>
## Specific Ideas

- Charts should have friendly empty states (illustration + helpful message), not just "No data"
- What-if simulator provides full breakdown including comparison chart for visual impact
- Quick-add via FAB keeps the action accessible without cluttering dashboard layout
- Recent transactions list keeps users grounded in their actual data alongside the visualizations

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-visualizations-dashboard*
*Context gathered: 2026-01-31*
