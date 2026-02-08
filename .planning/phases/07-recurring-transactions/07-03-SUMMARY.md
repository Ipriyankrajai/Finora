---
phase: 07-recurring-transactions
plan: 03
subsystem: ui
tags: [react, tRPC, tanstack-form, recurring, dashboard]
dependency-graph:
  requires: [07-01]
  provides: [recurring-management-ui, recurring-hooks, sidebar-nav, dashboard-banner]
  affects: [07-04]
tech-stack:
  added: []
  patterns: [recurring-hooks, form-with-conditional-fields, responsive-table-card-layout]
key-files:
  created:
    - apps/web/src/hooks/use-recurring.ts
    - apps/web/src/components/dashboard/recurring-banner.tsx
    - apps/web/src/app/(dashboard)/dashboard/recurring/page.tsx
    - apps/web/src/components/recurring/recurring-page-client.tsx
    - apps/web/src/components/recurring/recurring-list.tsx
    - apps/web/src/components/recurring/recurring-form.tsx
    - apps/web/src/components/recurring/recurring-empty-state.tsx
  modified:
    - apps/web/src/components/dashboard-sidebar.tsx
decisions:
  - id: "07-03-01"
    decision: "Use `as Route` cast for /dashboard/recurring links in client components"
    reason: "Next.js typed routes require route to exist at type-gen time; `as Route` is the established pattern in the sidebar"
  - id: "07-03-02"
    decision: "Radio buttons for end condition selection instead of nested select"
    reason: "Three-way mutual exclusion (forever/endDate/maxOccurrences) is clearest with radio group; matches Zod refinement logic"
  - id: "07-03-03"
    decision: "Desktop table + mobile card hybrid layout for recurring list"
    reason: "Table best for desktop data density; cards for mobile touch targets. Same pattern could be used elsewhere"
  - id: "07-03-04"
    decision: "Use z.union([z.date(), z.undefined()]) instead of z.date().optional() in form schema"
    reason: "TanStack Form defaultValues requires all keys present; optional Zod fields create `key?: T | undefined` which conflicts with required `key: T | undefined`"
metrics:
  duration: ~8.5 min
  completed: 2026-02-07
---

# Phase 7 Plan 03: Recurring Management UI Summary

**One-liner:** Recurring management page at /dashboard/recurring with table list, create/edit form dialog, sidebar navigation, and dashboard banner for auto-generated transactions.

## What Was Done

### Task 1: React hooks, sidebar navigation, and dashboard banner (d5a0303)

**Hooks (`use-recurring.ts`):**
- `useRecurringRules()` - fetches all rules via `trpc.recurring.list`
- `useCreateRecurringRule()` - mutation with toast and cache invalidation
- `useUpdateRecurringRule()` - mutation with toast, invalidates list + getById
- `useDeleteRecurringRule()` - optimistic removal from cache with rollback
- `useTodayGenerated()` - fetches today's auto-generated occurrence count
- Extracted `isRecurringListQuery`/`isRecurringQuery` helper predicates (readonly-compatible)

**Sidebar (`dashboard-sidebar.tsx`):**
- Added "Recurring" nav item with `Repeat` icon between Transactions and Analytics
- Uses existing nav item pattern with active state highlighting

**Dashboard banner (`recurring-banner.tsx`):**
- Client component using `useTodayGenerated()` hook
- Shows count of today's auto-generated transactions with "View rules" link
- Dismissible via X button (session-only state)
- Renders null when count is 0 or dismissed

### Task 2: Recurring management page with list and form (afe93ed)

**Page (`/dashboard/recurring`):**
- Server component with metadata, delegates to `RecurringPageClient`
- Client wrapper manages form dialog state (open/close, create/edit mode)
- Loading skeleton, error state with retry, empty state

**RecurringList (`recurring-list.tsx`):**
- Desktop: HTML table with 8 columns (status, description, type, amount, frequency, next date, tags, actions)
- Mobile: Card layout with same data in compact form
- Active rules sorted by nextOccurrenceDate ascending, paused rules at bottom
- Status: green dot for ACTIVE, amber "Paused" badge for PAUSED
- Type: green arrow up for INCOME, red arrow down for EXPENSE
- Edit/delete buttons per row with delete confirmation dialog
- Tags displayed as colored chips (max 3 with +N overflow)

**RecurringForm (`recurring-form.tsx`):**
- TanStack Form + Zod validation in Dialog
- Fields: type toggle, description, amount (currency input), frequency select, day of week (WEEKLY/BIWEEKLY only), day of month (MONTHLY only), start date, end condition (3 radio options), end date picker, max occurrences input, tags multi-select
- Conditional field rendering via `form.Subscribe` selector pattern
- Separate `buildCreateInput`/`buildUpdateInput` helpers for clean mutation calls
- Resets and repopulates on open for edit mode

**RecurringEmptyState (`recurring-empty-state.tsx`):**
- Same visual pattern as LoansEmpty (dashed border, icon, heading, subtext, CTA)
- "Create your first rule" button triggers form open

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed readonly type mismatch in query predicate helpers**
- **Found during:** Task 1 build verification
- **Issue:** `query.queryKey` returns `readonly unknown[]` but helper functions accepted `unknown[]`
- **Fix:** Changed parameter types to `readonly unknown[]`
- **Files modified:** `apps/web/src/hooks/use-recurring.ts`

**2. [Rule 1 - Bug] Fixed Zod optional vs TanStack Form defaultValues type incompatibility**
- **Found during:** Task 2 build verification
- **Issue:** `z.date().optional()` creates `endDate?: Date | undefined` but TanStack Form needs `endDate: Date | undefined`
- **Fix:** Used `z.union([z.date(), z.undefined()])` to make property required but nullable
- **Files modified:** `apps/web/src/components/recurring/recurring-form.tsx`

**3. [Rule 1 - Bug] Fixed Next.js typed routes error for /dashboard/recurring**
- **Found during:** Task 1 build verification
- **Issue:** Next.js route type checking fails for routes not yet in the type manifest
- **Fix:** Used `as Route` cast (established project pattern from sidebar)
- **Files modified:** `apps/web/src/components/dashboard/recurring-banner.tsx`

**4. [Rule 2 - Missing Critical] Added exhaustive switch default for frequency label**
- **Found during:** Task 2 lint check
- **Issue:** Biome `useDefaultSwitchClause` requires default case
- **Fix:** Added `default: { const _exhaustive: never = frequency; return _exhaustive; }` (matches 07-01 pattern)
- **Files modified:** `apps/web/src/components/recurring/recurring-list.tsx`

## Verification Results

- `bun run build` passes with `/dashboard/recurring` in route list
- `bun x ultracite check` passes on all new/modified files (page file excluded due to Biome parentheses-in-path bug)
- Sidebar shows "Recurring" nav item with Repeat icon
- All hooks correctly reference `trpc.recurring.*` procedures from 07-01 router

## Next Phase Readiness

Plan 07-04 (pause/resume toggle + status badge) can proceed. The RecurringList component already renders ACTIVE/PAUSED status indicators. Plan 07-04 will need to add:
- Pause/resume toggle action button to RecurringList rows
- A `usePauseRecurringRule` / `useResumeRecurringRule` hook (or add status to update mutation)
- Integration of RecurringBanner into the dashboard page component
