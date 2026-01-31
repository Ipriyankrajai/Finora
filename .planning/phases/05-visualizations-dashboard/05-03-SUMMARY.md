---
phase: 05
plan: 03
type: summary
subsystem: dashboard-loans-whatif
tags: [recharts, what-if, slider, loans, amortization, fab]
requires:
  - 05-01 (dashboard foundation with spending charts)
  - 02-04 (dashboard API endpoint)
  - 04-01 (loan creation and form)
provides:
  - Loan overview cards on dashboard
  - Amortization chart showing balance over time
  - What-if simulator for extra payment scenarios
  - Quick-add FAB for transaction entry
affects:
  - 06-xx (polish phase may enhance what-if visuals)
tech-stack:
  added: []
  patterns: [useDeferredValue for responsive calculations, render function extraction for nested conditionals]
key-files:
  created:
    - apps/web/src/lib/loan-calculations.ts
    - apps/web/src/components/ui/slider.tsx
    - apps/web/src/components/dashboard/loan-overview-card.tsx
    - apps/web/src/components/dashboard/loan-amortization-chart.tsx
    - apps/web/src/components/dashboard/what-if-simulator.tsx
    - apps/web/src/components/dashboard/quick-add-fab.tsx
  modified:
    - packages/api/src/routers/dashboard.ts
    - packages/api/src/schemas/dashboard.ts
    - apps/web/src/components/dashboard/dashboard-page-client.tsx
decisions:
  - key: useDeferredValue-for-slider
    choice: Use useDeferredValue to defer calculation while slider moves
    reason: Prevents UI lag during rapid slider changes; calculation happens after render settles
  - key: render-function-for-loans-section
    choice: Extract renderLoansSection function instead of nested ternary
    reason: Satisfies lint rule noNestedTernary while keeping logic readable
  - key: loan-details-fetch-on-expand
    choice: Fetch full loan details when card is expanded, not upfront
    reason: loanOverview doesn't include monthlyPaymentCents; avoid N+1 by lazy loading
  - key: amortization-schema-in-dashboard
    choice: Add amortizationScheduleInput to dashboard schema file
    reason: Keeps related dashboard schemas together; avoids import issues
metrics:
  duration: 11 min
  completed: 2026-01-31
---

# Phase 05 Plan 03: Loan Visualizations and What-If Summary

Client-side loan calculations with useDeferredValue for responsive what-if simulation, amortization chart, and quick-add FAB.

## Objective

Enable users to see their loan progress visually, simulate extra payments to understand impact, and quickly add transactions from the dashboard.

## What Was Built

### Task 1: Loan Calculation Utilities and Slider Component

**Files created:**
- `apps/web/src/lib/loan-calculations.ts` - Client-side projectPayoffWithExtra function
- `apps/web/src/components/ui/slider.tsx` - Accessible HTML range input with custom styling

**Implementation:**
- Ported projectPayoff logic from API for client-side what-if calculations
- WhatIfResult includes monthsSaved and interestSavedCents
- Edge case handling: zero balance (paid off), payment < interest (infinite payoff)
- Slider supports value formatting, ARIA labels, and keyboard navigation

**Commit:** 6d208d4

### Task 2: Loan Cards, Amortization Chart, and API Endpoint

**Files created:**
- `apps/web/src/components/dashboard/loan-overview-card.tsx`
- `apps/web/src/components/dashboard/loan-amortization-chart.tsx`

**Files modified:**
- `packages/api/src/routers/dashboard.ts` - Added getAmortizationSchedule procedure
- `packages/api/src/schemas/dashboard.ts` - Added amortizationScheduleInput schema

**Implementation:**
- LoanOverviewCard displays balance, payoff date, and progress
- Handles infinite payoff with "N/A" and "Increase payment" hint (decision 04-03)
- LoanAmortizationChart uses Recharts AreaChart with gradient fill
- API generates month-by-month balance projection (max 360 months)
- Authorization check ensures user owns the loan

**Commit:** ecea0c5

### Task 3: What-If Simulator, Quick-Add FAB, and Dashboard Integration

**Files created:**
- `apps/web/src/components/dashboard/what-if-simulator.tsx`
- `apps/web/src/components/dashboard/quick-add-fab.tsx`

**Files modified:**
- `apps/web/src/components/dashboard/dashboard-page-client.tsx`

**Implementation:**
- WhatIfSimulator uses useDeferredValue for smooth slider performance
- Shows baseline vs with-extra comparison: payoff date, time remaining, total interest
- Savings summary highlights months saved and interest saved
- Warning displayed when payment doesn't cover interest
- QuickAddFAB fixed to bottom-right, opens TransactionForm in dialog
- On success, invalidates dashboard queries and shows toast
- Dashboard layout: MonthlySummary -> Charts -> SpendingTimeline -> Loans -> FAB
- Click-to-expand on loan cards shows what-if simulator + amortization chart

**Commit:** b1ba99e

## Technical Decisions

### useDeferredValue for Responsive Slider
The what-if simulator uses React's `useDeferredValue` hook to keep the slider responsive. The slider state updates immediately, but the expensive projection calculation uses the deferred value. This prevents UI lag during rapid slider movements.

### Render Function Extraction
Extracted `renderLoansSection()` to avoid nested ternary expressions. This pattern (also used for `renderMonthlySummary()`) keeps the code readable while satisfying the noNestedTernary lint rule.

### Lazy Load Loan Details
The loanOverview from the dashboard API doesn't include `monthlyPaymentCents` (which is needed for the what-if simulator). Rather than fetching all loan details upfront, we lazy-load the full loan data only when a card is expanded.

## Verification Results

- `cd packages/api && bun run typecheck` - PASS
- `cd apps/web && bun run typecheck` - PASS
- `bun x ultracite check` (plan files) - PASS
- All 3 tasks completed with atomic commits

## Requirements Completed

| Requirement | Status | Evidence |
|-------------|--------|----------|
| VIZ-03: Loan amortization chart | DONE | LoanAmortizationChart with AreaChart |
| VIZ-04: What-if extra payment calculator | DONE | WhatIfSimulator with useDeferredValue |
| DASH-03: Loan overview cards | DONE | LoanOverviewCard with balance, payoff date |
| DASH-04: Quick-add transaction FAB | DONE | QuickAddFAB with TransactionForm dialog |

## Phase 5 Summary

Phase 5 is now complete with all visualization and dashboard requirements met:

- TAG-04: Tag click-to-expand (05-01)
- VIZ-01: Spending pie chart (05-01)
- VIZ-02: Spending timeline (05-02)
- VIZ-03: Loan amortization chart (05-03)
- VIZ-04: What-if calculator (05-03)
- DASH-01: Monthly income/expense summary (05-01)
- DASH-02: Recent transactions widget (05-01)
- DASH-03: Loan overview cards (05-03)
- DASH-04: Quick-add transaction FAB (05-03)

## Deviations from Plan

None - plan executed exactly as written.
