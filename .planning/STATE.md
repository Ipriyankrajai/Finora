# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Users can see exactly where their money goes and when their loans will be paid off
**Current focus:** Phase 3 - Tags & Transactions UI

## Current Position

Phase: 3 of 6 (Tags & Transactions UI)
Plan: 2 of 4 in current phase
Status: In progress
Last activity: 2026-01-30 — Completed 03-02-PLAN.md

Progress: [███████░░░] 66.7% (8/12 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 5.6 min
- Total execution time: 45 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 10 min | 5 min |
| 02-api-layer | 4 | 25 min | 6.3 min |
| 03-tags-transactions-ui | 2 | 10 min | 5 min |

**Recent Trend:**
- Last 5 plans: 02-02 (6 min), 02-03 (10 min), 02-04 (3 min), 03-01 (5 min), 03-02 (5 min)
- Trend: Stable with variance based on test coverage

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

### Pending Todos

None yet.

### Blockers/Concerns

Pre-existing: TypeScript errors in packages/api for BigInt literals (ES2020 target issue in tsconfig).
Not blocking Phase 3 - web app compiles successfully.

## Session Continuity

Last session: 2026-01-30
Stopped at: Completed 03-02-PLAN.md
Resume file: None
