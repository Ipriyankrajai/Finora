# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can see exactly where their money goes, stay on budget, track progress toward financial goals, and optimize their debt payoff strategy
**Current focus:** Milestone v2.0 — Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-07 — Milestone v2.0 started

Progress: [░░░░░░░░░░░░░░░░░░░░] 0%

## Performance Metrics

**v1 Velocity (reference):**
- Total plans completed: 20
- Average duration: 7.8 min
- Total execution time: 155 min

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key v1 decisions carried forward:

- BigInt for money fields (safety margin over Int for large transactions)
- currency.js for display formatting (handles $, commas, negatives)
- superjson transformer for tRPC client (required for BigInt serialization)
- Cursor-based pagination with limit+1 pattern for hasMore detection
- TanStack Form with Zod validation for forms
- Optimistic updates for instant feedback on mutations
- URL-based filter state for shareable/bookmarkable filtered views
- Direct Prisma queries for user mutations (not better-auth updateUser due to Prisma v7 bug #6469)
- useUserSettings hook for currency preference (React Query deduplicates)
- formatCents uses decimal style with manual symbol prepend for any currency

### Pending Todos

None yet.

### Blockers/Concerns

NOTE: loanType field defined in API input schema but not stored in database. Current UI works around this by displaying interestType instead. Consider adding loanType column to Loan model in future if loan categorization is needed.

## Session Continuity

Last session: 2026-02-07
Stopped at: Milestone v2.0 started, research phase beginning
Resume file: None
