# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can see exactly where their money goes, stay on budget, track progress toward financial goals, and optimize their debt payoff strategy
**Current focus:** Milestone v2.0 Smart Finance -- Phase 7 complete, ready for Phase 8

## Current Position

Phase: 7 of 12 (Recurring Transactions) -- COMPLETE
Plan: 4 of 4 in current phase
Status: Phase complete
Last activity: 2026-02-07 -- Completed 07-04-PLAN.md (Occurrence Controls)

Progress: [████████████████████████░░░░░░░░░░░░░░░░░░] 24/36 plans (67%)

## Performance Metrics

**v1 Velocity (reference):**
- Total plans completed: 20
- Average duration: 7.8 min
- Total execution time: 155 min

**v2 Velocity:**
- Plans completed: 4
- 07-01: ~4 min
- 07-02: ~6 min
- 07-03: ~8.5 min
- 07-04: ~5 min

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key v1 decisions carried forward:

- BigInt for money fields (safety margin over Int for large transactions)
- superjson transformer for tRPC client (required for BigInt serialization)
- Cursor-based pagination with limit+1 pattern
- TanStack Form with Zod validation for forms
- Optimistic updates for instant feedback on mutations
- URL-based filter state for shareable/bookmarkable filtered views
- Direct Prisma queries for user mutations (better-auth Prisma v7 bug #6469)
- formatCents uses decimal style with manual symbol prepend for any currency

v2 research decisions:
- Budgets use real-time SUM queries, not cached aggregations
- Debt strategies are stateless calculation (no new models)
- Custom CSV generation (no papaparse dependency)
- PDF export deferred to Future (EXP-03)
- Extract shared month-boundary utility during Phase 8

v2 implementation decisions (Phase 7):
- Exhaustive switch with `never` default for frequency computation (Biome lint compliance)
- Auto-derive dayOfMonth from startDate for MONTHLY rules (user convenience)
- Nullable endDate/maxOccurrences in update schema (allows clearing values)
- Duplicated computeNextOccurrence in trigger worker to avoid cross-package bundler issues
- Prisma 7 modern mode for Trigger.dev build (no Rust engine needed with adapter)
- Optional TRIGGER_SECRET_KEY in env (app starts without Trigger.dev configured)
- Safety limit of 100 occurrences per rule per run; auto-pause on end conditions
- Use `as Route` cast for /dashboard/recurring in client components (Next.js typed routes pattern)
- z.union([z.date(), z.undefined()]) over z.date().optional() for TanStack Form schema compat
- Desktop table + mobile card hybrid layout for recurring list
- Reuse computeInitialNextOccurrence for resume date calculation (handles all frequency types)
- Extract verifyRuleOwnership helper to reduce duplication across procedures
- Inline Resume button on paused rule rows for prominent visual feedback
- Two-choice delete dialog: Delete Rule Only vs Delete Rule & Transactions

### Pending Todos

None yet.

### Blockers/Concerns

None.

RecurringBanner integrated into dashboard page by orchestrator (commit cbc5d96).

### Recent Additions

- Added: Comprehensive `LoanType` enum to database with 11 categories (PERSONAL, AUTO, MORTGAGE, STUDENT, BUSINESS, CREDIT_CARD, MEDICAL, HOME_EQUITY, PAYDAY, CONSOLIDATION, OTHER)
- Added: Loan type dropdown in UI form for proper loan categorization
- Default value: OTHER (for backwards compatibility with existing loans)

## Session Continuity

Last session: 2026-02-07
Stopped at: Completed 07-04-PLAN.md (Occurrence Controls) -- Phase 7 complete
Resume file: None
