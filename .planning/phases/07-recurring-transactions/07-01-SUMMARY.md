# Phase 7 Plan 1: Schema and API Summary

**One-liner:** Prisma models for recurring rules/occurrences with tRPC CRUD router, Zod validation, and month-end-safe date computation

## What Was Built

### Database Schema (3 new models, 3 new enums)
- `RecurringRule`: Stores rule definitions with frequency, anchor day, start/end dates, occurrence limits, and status tracking
- `RecurringRuleTag`: Many-to-many join between rules and tags (composite PK)
- `RecurringOccurrence`: Tracks each generated occurrence with idempotency via `@@unique([ruleId, scheduledDate])`
- Enums: `RecurringFrequency`, `RecurringStatus`, `OccurrenceStatus`
- Updated `Transaction` model with `recurringOccurrence` back-relation
- Updated `Tag` model with `recurringRules` back-relation
- Updated `User` model with `recurringRules` back-relation

### tRPC Router (6 procedures)
- `recurring.list`: All user rules with tags, ordered by createdAt desc
- `recurring.getById`: Single rule with tags and last 5 occurrences, ownership check
- `recurring.create`: Creates rule with amount conversion, dayOfMonth auto-detection for MONTHLY, initial nextOccurrenceDate computation, tag association
- `recurring.update`: Partial update with ownership check and tag replacement
- `recurring.delete`: With optional `deleteTransactions` flag to cascade-delete generated transactions
- `recurring.todayGenerated`: Count of today's generated occurrences for dashboard banner

### Zod Schemas
- `createRecurringRuleInput`: Validates frequency-specific constraints (WEEKLY/BIWEEKLY requires dayOfWeek), enforces mutual exclusion of endDate and maxOccurrences
- `updateRecurringRuleInput`: Same refinements with nullable fields for clearing values
- `recurringFrequency`: Shared enum schema

### Date Computation Utility
- `computeNextOccurrence`: Pure function handling DAILY, WEEKLY, BIWEEKLY, MONTHLY (with anchorDay clamping), YEARLY
- `computeInitialNextOccurrence`: Determines first occurrence date, walks forward if startDate is in the past
- Month-end edge case verified: Jan 31 -> Feb 28 -> Mar 31 (anchorDay prevents drift)

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Exhaustive switch with `never` default in computeNextOccurrence | Satisfies Biome lint rule requiring default clause; provides compile-time safety |
| Nullable endDate/maxOccurrences in update schema | Allows clearing previously set values via null |
| Auto-derive dayOfMonth from startDate for MONTHLY | User convenience: if they set startDate to Jan 31, dayOfMonth defaults to 31 |

## Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Prisma schema migration and date computation utility | `fe12fdf` | finance.prisma, auth.prisma, recurring.ts (lib) |
| 2 | Zod schemas and tRPC recurring router | `0058ee0` | recurring.ts (schemas), recurring.ts (router), index.ts |

## Verification Results

- `prisma generate`: Pass
- `prisma db push`: Pass (schema applied)
- `bun run build`: Pass (full project compiles)
- `bun x ultracite check`: Pass (0 errors)
- Month-end clamping test: Jan 31 -> Feb 28, Feb 28 (anchor=31) -> Mar 31: Pass
- All 5 frequencies tested: Pass

## Next Phase Readiness

Plan 07-02 (Trigger.dev generation engine) can proceed. It depends on:
- `RecurringRule` model with `nextOccurrenceDate` and `status` fields (ready)
- `RecurringOccurrence` model with `@@unique([ruleId, scheduledDate])` (ready)
- `computeNextOccurrence` function (ready, exported from `packages/api/src/lib/recurring.ts`)

## Metadata

- **Duration:** ~4 min
- **Completed:** 2026-02-07
- **Tasks:** 2/2
