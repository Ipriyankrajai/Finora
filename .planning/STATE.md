# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can see exactly where their money goes, stay on budget, track progress toward financial goals, and optimize their debt payoff strategy
**Current focus:** Milestone v2.0 Smart Finance — Phase 7 (Recurring Transactions)

## Current Position

Phase: 7 of 12 (Recurring Transactions)
Plan: 2 of 4 in current phase
Status: In progress
Last activity: 2026-02-07 — Completed 07-02-PLAN.md (Trigger.dev Generation Engine)

Progress: [██████████████████████░░░░░░░░░░░░░░░░░░░░] 22/36 plans (61%)

## Performance Metrics

**v1 Velocity (reference):**
- Total plans completed: 20
- Average duration: 7.8 min
- Total execution time: 155 min

**v2 Velocity:**
- Plans completed: 2
- 07-01: ~4 min
- 07-02: ~6 min

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

### Pending Todos

None yet.

### Blockers/Concerns

NOTE: loanType field defined in API input schema but not stored in database. Current UI works around this by displaying interestType instead.

## Session Continuity

Last session: 2026-02-07
Stopped at: Completed 07-02-PLAN.md (Trigger.dev Generation Engine)
Resume file: None
