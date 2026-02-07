# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Users can see exactly where their money goes and when their loans will be paid off
**Current focus:** Phase 6 - Onboarding & Polish (IN PROGRESS)

## Current Position

Phase: 6 of 6 (Onboarding & Polish)
Plan: 3 of 3 in current phase
Status: In progress
Last activity: 2026-02-07 - Completed 06-03-PLAN.md

Progress: [###################-] 95% (19/20 plans through Phase 6 Plan 3)

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 7.6 min
- Total execution time: 144 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 10 min | 5 min |
| 02-api-layer | 4 | 25 min | 6.3 min |
| 03-tags-transactions-ui | 4 | 30 min | 7.5 min |
| 04-loans-ui | 3 | 20 min | 6.7 min |
| 05-visualizations-dashboard | 3 | 27 min | 9 min |
| 06-onboarding-polish | 3 | 32 min | 10.7 min |

**Recent Trend:**
- Last 5 plans: 05-02 (8 min), 05-03 (11 min), 06-01 (12 min), 06-02 (12 min), 06-03 (8 min)
- Trend: Stable at ~10 min for cross-cutting features

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 6 phases following data-first architecture (Schema -> API -> UI -> Charts -> Polish)
- [Roadmap]: Money stored as integer cents to avoid floating-point precision errors
- [Roadmap]: Server-side aggregation for charts, client-side calculation for what-if simulation
- [01-01]: BigInt for money fields (safety margin over Int for large transactions)
- [01-01]: LoanPayment owns Transaction link (FK on LoanPayment, not Transaction)
- [01-01]: Single consolidated migration to resolve drift
- [01-02]: currency.js for display formatting (handles $, commas, negatives)
- [01-02]: PMT formula for amortizing loan calculations
- [01-02]: Infinity for monthsRemaining when payment doesn't cover interest
- [02-02]: Cursor-based pagination with limit+1 pattern for hasMore detection
- [02-02]: Date presets calculate ranges at query time (not stored)
- [02-02]: Multi-tag assignment uses Prisma $transaction for atomicity
- [02-02]: Amount filters as string for BigInt compatibility
- [02-03]: loanType (car/home/personal/other) separate from interestType (SIMPLE/COMPOUND)
- [02-03]: Balance calculated from payments each time (not stored)
- [02-03]: Payment split: interest = balance * (rate/100/12), principal = payment - interest
- [02-04]: Single combined endpoint for dashboard data (reduces network overhead)
- [02-04]: Raw SQL ($queryRaw) for complex tag spending aggregation
- [02-04]: Top 5 tags with "Other" grouping for dashboard display
- [03-01]: superjson transformer for tRPC client (required for BigInt serialization)
- [03-01]: 12 preset colors in 6x2 grid with custom option for color picker
- [03-01]: Green/red coloring for income/expense in money display
- [03-02]: Optimistic updates for instant feedback on tag operations
- [03-02]: Base UI render prop instead of asChild for custom trigger elements
- [03-02]: Collapsible sidebar sections with localStorage persistence
- [03-03]: URL-based filter state for shareable/bookmarkable filtered views
- [03-03]: Page-based UI over cursor-based API using limit parameter
- [03-03]: Date grouping with Today/Yesterday/formatted date labels
- [03-04]: TanStack Form with Zod validation for transaction form
- [03-04]: Popover multi-select with checkboxes for tag selection
- [03-04]: Page-level form state management with edit/create mode switching
- [03-04]: Predicate-based tRPC query invalidation for mutations
- [04-01]: loanType not persisted in DB; UI shows interestType (SIMPLE/COMPOUND) on cards
- [04-01]: PMT formula auto-calculation in loan form with recalculatePayment helper
- [04-01]: Balance sorting (highest first) per CONTEXT.md snowball-style view
- [04-02]: Simpler payment summary without payoff date change (avoids extra API call)
- [04-02]: Server calculates principal/interest split, not client
- [04-02]: Two-state dialog pattern: form view -> summary view after success
- [04-03]: Infinity payoff handled with "N/A" message and "Increase payment" hint
- [04-03]: Delete payment requires confirmation dialog for data safety
- [04-03]: Detail page pattern: back link, title, actions row, then content sections
- [05-01]: Custom CustomTooltipProps interface for Recharts 3.x tooltip typing
- [05-01]: Named string arrays for skeleton keys (lint rule compliance)
- [05-01]: Render function extraction for nested ternary avoidance
- [05-02]: date-fns for time calculations (eachWeekOfInterval, eachDayOfInterval)
- [05-02]: Zero-fill all periods to ensure continuous charts without gaps
- [05-02]: BarChart for weekly view, AreaChart for daily view
- [05-02]: preserveStartEnd on XAxis to prevent label crowding
- [05-03]: useDeferredValue for responsive what-if slider (prevents UI lag)
- [05-03]: Render function extraction for loans section (noNestedTernary compliance)
- [05-03]: Lazy load loan details on expand (avoid N+1 on dashboard load)
- [05-03]: Amortization schema in dashboard schemas file (keeps related schemas together)
- [06-01]: hasCompletedOnboarding defaults to true (existing users skip onboarding)
- [06-01]: currencySymbol is display-only preference, does not affect stored amounts
- [06-01]: Direct Prisma queries for user mutations (not better-auth updateUser due to Prisma v7 bug #6469)
- [06-01]: useUserSettings hook in each component (React Query deduplicates requests)
- [06-01]: formatCents uses decimal style with manual symbol prepend for any currency
- [06-03]: ProfileForm uses TanStack Form with two separate mutations (updateProfile + updateCurrency) on submit
- [06-03]: DeleteAccountDialog uses authClient.deleteUser with typed DELETE confirmation
- [06-03]: Dashboard empty detection: monthlySummary all zeros + no loans + no tags
- [06-03]: Tag sidebar keeps existing compact empty state (already suitable for constrained space)

### Pending Todos

None yet.

### Blockers/Concerns

RESOLVED: TypeScript ES2020 target issue fixed in 03-03. Both apps/web and packages/api now target ES2020.

NOTE: loanType field defined in API input schema but not stored in database. Current UI works around this by displaying interestType instead. Consider adding loanType column to Loan model in future if loan categorization is needed.

## Session Continuity

Last session: 2026-02-07
Stopped at: Completed 06-03-PLAN.md (Settings Page & Empty States)
Resume file: None

## Phase 6 Progress

Plan 1 complete (Data/API Foundation):
- User model extended with hasCompletedOnboarding and currencySymbol
- User tRPC router with 4 endpoints
- formatCents with currency symbol support
- All dashboard components wired to user currency preference
- deleteUser enabled in auth config

Plan 2: Onboarding wizard UI (in progress / separate execution)

Plan 3 complete (Settings Page & Empty States):
- Settings page with profile form (name + currency) and account management
- Delete account dialog with typed confirmation
- Reusable EmptyState component
- Dashboard guided checklist empty state
- Transactions, loans, tags empty states integrated

Remaining:
- 06-02-PLAN: Onboarding wizard UI (may still be in progress)
