# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Users can see exactly where their money goes and when their loans will be paid off
**Current focus:** Phase 3 - Tags & Transactions UI

## Current Position

Phase: 3 of 6 (Tags & Transactions UI)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-01-30 - Completed 03-03-PLAN.md

Progress: [████████░░] 75% (9/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 5.9 min
- Total execution time: 53 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 10 min | 5 min |
| 02-api-layer | 4 | 25 min | 6.3 min |
| 03-tags-transactions-ui | 3 | 18 min | 6 min |

**Recent Trend:**
- Last 5 plans: 02-03 (10 min), 02-04 (3 min), 03-01 (5 min), 03-02 (5 min), 03-03 (8 min)
- Trend: Stable with variance based on complexity

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

### Pending Todos

None yet.

### Blockers/Concerns

RESOLVED: TypeScript ES2020 target issue fixed in 03-03. Both apps/web and packages/api now target ES2020.

## Session Continuity

Last session: 2026-01-30
Stopped at: Completed 03-03-PLAN.md
Resume file: None
