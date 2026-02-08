---
phase: 07-recurring-transactions
plan: 04
subsystem: recurring-transactions
tags: [tRPC, pause-resume, skip-occurrence, delete-dialog, recurring-indicator, React, occurrence-controls]
depends_on:
  requires: ["07-01", "07-03"]
  provides: ["pause/resume API", "skip occurrence API", "upcoming occurrences query", "occurrence controls UI", "delete rule dialog", "recurring transaction indicator"]
  affects: []
tech-stack:
  added: []
  patterns: ["verifyRuleOwnership helper extraction", "upsert on composite key", "inline resume button pattern", "two-choice delete dialog"]
key-files:
  created:
    - apps/web/src/components/recurring/occurrence-controls.tsx
    - apps/web/src/components/recurring/delete-rule-dialog.tsx
  modified:
    - packages/api/src/routers/recurring.ts
    - apps/web/src/hooks/use-recurring.ts
    - apps/web/src/components/recurring/recurring-list.tsx
    - apps/web/src/components/transactions/transaction-row.tsx
    - apps/web/src/hooks/use-transactions.ts
    - packages/api/src/routers/transaction.ts
decisions:
  - id: "07-04-01"
    description: "Use computeInitialNextOccurrence for resume date calculation (reuses existing logic, handles all frequency types)"
  - id: "07-04-02"
    description: "Extracted verifyRuleOwnership helper to reduce duplication across new procedures"
  - id: "07-04-03"
    description: "Inline Resume button shown directly on paused rule rows for prominent visual feedback"
  - id: "07-04-04"
    description: "Delete dialog offers three actions: Cancel, Delete Rule Only, Delete Rule & Transactions"
  - id: "07-04-05"
    description: "Recurring indicator uses Repeat icon linking to /dashboard/recurring management page"
metrics:
  duration: "~5 min"
  completed: "2026-02-07"
---

# Phase 7 Plan 4: Occurrence Controls Summary

Pause/resume/skip API procedures with UI controls, two-choice delete dialog, and recurring transaction indicator on generated transactions.

## What Was Done

### Task 1: API procedures for pause, resume, skip, and upcoming occurrences

**API (packages/api/src/routers/recurring.ts):**
- `pause` mutation: Sets rule status to PAUSED with ownership verification; throws BAD_REQUEST if already paused
- `resume` mutation: Resets nextOccurrenceDate to today (or next valid date from today) using computeInitialNextOccurrence, preventing backlog generation per RESEARCH.md pitfall #3
- `skipOccurrence` mutation: Upserts RecurringOccurrence with SKIPPED status via the ruleId_scheduledDate composite unique key
- `upcomingOccurrences` query: Computes next N occurrence dates from the rule, checks for existing skip records, returns array of { scheduledDate, status: "upcoming" | "skipped" }
- Extracted `verifyRuleOwnership` helper to reduce code duplication across 4 new procedures

**Hooks (apps/web/src/hooks/use-recurring.ts):**
- `usePauseRecurringRule()`: Mutation with toast + cache invalidation
- `useResumeRecurringRule()`: Mutation with toast + cache invalidation
- `useSkipOccurrence()`: Mutation with toast + invalidates all recurring queries
- `useUpcomingOccurrences(ruleId)`: Query hook with enabled guard

### Task 2: Occurrence control UI, delete dialog, and recurring transaction indicator

**OccurrenceControls (apps/web/src/components/recurring/occurrence-controls.tsx):**
- Dropdown menu with Edit Rule, Pause/Resume toggle, Skip Next Occurrence (with date), Delete Rule
- Inline Resume button shown directly on paused rule rows for prominent visibility
- Skip shows the specific date being skipped in the menu item text
- All actions disabled while any mutation is pending

**DeleteRuleDialog (apps/web/src/components/recurring/delete-rule-dialog.tsx):**
- Three-button dialog: Cancel, Delete Rule Only, Delete Rule & Transactions
- Delete Rule Only uses outline style; Delete Rule & Transactions uses destructive red style
- Calls useDeleteRecurringRule with deleteTransactions boolean flag
- Auto-closes on successful deletion

**RecurringList updates (apps/web/src/components/recurring/recurring-list.tsx):**
- Replaced simple edit/delete buttons with OccurrenceControls component in both desktop table and mobile card views
- Replaced simple delete confirmation dialog with DeleteRuleDialog at list level
- Removed direct useDeleteRecurringRule dependency (now delegated to DeleteRuleDialog)

**Recurring transaction indicator:**
- Updated transaction.list tRPC query to include `recurringOccurrence: { select: { ruleId: true } }`
- Added `recurringOccurrence` field to TransactionWithTags interface
- Added Repeat icon (size-3.5, muted color) next to time in TransactionRow for recurring transactions
- Icon is a Link to /dashboard/recurring with title="From recurring rule" and sr-only text

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 07-04-01 | Reuse computeInitialNextOccurrence for resume | Handles all frequency types correctly, walks forward from today to find next valid date |
| 07-04-02 | Extract verifyRuleOwnership helper | 4 new procedures all need ownership check; DRY principle |
| 07-04-03 | Inline Resume button on paused rows | Per CONTEXT.md: "Paused badge should be prominent enough to catch the eye" |
| 07-04-04 | Three-button delete dialog | Clear UX: Cancel (no action), Rule Only (keep transactions), Rule+Transactions (full cleanup) |
| 07-04-05 | Repeat icon links to management page | Simple link to /dashboard/recurring; specific rule view can be added later if needed |

## Verification

- [x] `bun run build` succeeds
- [x] `bun x ultracite check` passes (0 issues)
- [x] Pause sets rule to PAUSED status
- [x] Resume resets nextOccurrenceDate to today and sets ACTIVE
- [x] Skip creates/upserts SKIPPED occurrence record via composite key
- [x] Delete dialog offers two deletion options with appropriate styling
- [x] Transaction list shows repeat icon for recurring-sourced transactions
- [x] Upcoming occurrences query returns computed future dates with skip status
- [x] Resume does NOT generate backlog (nextOccurrenceDate reset to today)

## Phase 7 Completion Status

This is the final plan (04 of 04) in Phase 7 (Recurring Transactions). All plans complete:
- 07-01: Schema, API, computation engine
- 07-02: Trigger.dev generation worker
- 07-03: Management UI (list, form, empty state, nav)
- 07-04: Occurrence controls (pause/resume/skip, delete dialog, recurring indicator)
