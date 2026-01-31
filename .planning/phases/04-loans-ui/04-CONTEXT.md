# Phase 4: Loans UI - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage loans and track payments with accurate balance and payoff calculations. This includes:
- Create, edit, and delete loans with type, principal, rate, term, and payment amount
- Log payments with amount and date, distinguishing regular from extra payments
- See current remaining balance, total interest paid, and projected payoff date

What-if simulation and amortization charts are Phase 5 (Visualizations).

</domain>

<decisions>
## Implementation Decisions

### Loan List Display
- Card-based layout for loans (matches transaction UI pattern)
- Balance-focused cards: remaining balance prominent, rate/payment secondary
- Horizontal progress bar showing % paid off on each card
- Default ordering by balance (highest first) — snowball-style view

### Payment Logging UX
- Modal form triggered by "Log Payment" button on loan card
- Checkbox toggle: "This is an extra payment" (default unchecked)
- Regular payment amount pre-filled in form, user can adjust
- After logging: detailed summary showing principal/interest split, new balance, payoff date change

### Loan Detail View
- Click loan card → navigates to full detail page (separate route)
- Balanced view: summary stats at top (balance, interest paid, payoff date), payment history below
- Payment history as timeline list, chronological order
- Each payment shows principal/interest breakdown inline

### Form Inputs (Create/Edit Loan)
- Loan type: dropdown select (Car / Home / Personal / Other)
- Principal: currency input with dollar formatting
- Interest rate: percentage input with % symbol (user enters "5.5", system displays "5.5%")
- Term: numeric months input (e.g., 60 for 5 years)
- Payment amount: auto-calculated using PMT formula from principal/rate/term

### Claude's Discretion
- Exact card layout and spacing
- Empty state design for loans list
- Form validation messages and error states
- Loading states and skeleton UI
- Edit/delete confirmation patterns

</decisions>

<specifics>
## Specific Ideas

- Progress bar on cards provides immediate visual feedback on payoff progress
- Detailed payment summary after logging helps users understand impact of extra payments
- Principal/interest split visible per payment helps users see debt reduction over time

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-loans-ui*
*Context gathered: 2026-01-31*
