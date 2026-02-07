---
phase: 06-onboarding-polish
plan: 03
subsystem: ui
tags: [settings, empty-states, tanstack-form, zod, better-auth, lucide-react]

# Dependency graph
requires:
  - phase: 06-01
    provides: "User tRPC router (getSettings, updateProfile, updateCurrency), useUserSettings hooks, CURRENCY_SYMBOLS constant, deleteUser enabled in auth config"
provides:
  - "Settings page with profile form (name, currency dropdown), account management (sign out, replay onboarding, delete account)"
  - "Reusable EmptyState component with icon, title, description, CTA"
  - "Dashboard guided checklist empty state for new users"
  - "Page-specific empty states for transactions, loans, and tags"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reusable EmptyState component pattern with icon/title/description/action"
    - "Guided checklist empty state pattern for onboarding flow"
    - "TanStack Form profile editing with multi-mutation submit"
    - "DELETE confirmation dialog with typed confirmation text"

key-files:
  created:
    - "apps/web/src/components/settings/profile-form.tsx"
    - "apps/web/src/components/settings/account-section.tsx"
    - "apps/web/src/components/settings/delete-account-dialog.tsx"
    - "apps/web/src/components/empty-states/empty-state.tsx"
    - "apps/web/src/components/empty-states/dashboard-empty.tsx"
    - "apps/web/src/components/empty-states/transactions-empty.tsx"
    - "apps/web/src/components/empty-states/loans-empty.tsx"
    - "apps/web/src/components/empty-states/tags-empty.tsx"
  modified:
    - "apps/web/src/app/(dashboard)/dashboard/settings/page.tsx"
    - "apps/web/src/components/dashboard/dashboard-page-client.tsx"
    - "apps/web/src/components/transactions/transaction-list.tsx"
    - "apps/web/src/components/transactions/transactions-page-client.tsx"
    - "apps/web/src/components/loans/loan-list.tsx"
    - "apps/web/src/components/loans/loans-page-client.tsx"

key-decisions:
  - "ProfileForm uses TanStack Form with two separate mutations (updateProfile + updateCurrency) on submit"
  - "DeleteAccountDialog uses authClient.deleteUser (better-auth) with typed DELETE confirmation"
  - "Dashboard empty state detection: monthlySummary all zeros + no loans + no tags (via useTags)"
  - "Tag sidebar keeps existing compact empty state (already suitable for constrained space)"

patterns-established:
  - "EmptyState component: centered flex, icon circle, h3 title, muted description, optional Button/Link CTA"
  - "DashboardEmpty: card-based checklist with progress bar and check/circle icons"
  - "Confirmation dialog pattern: require typing specific text to enable destructive action"

# Metrics
duration: 8min
completed: 2026-02-07
---

# Phase 6 Plan 3: Settings Page & Empty States Summary

**Settings page with profile editing (name + currency dropdown via TanStack Form), account management (sign out, replay onboarding, delete account), and tailored empty states for dashboard, transactions, loans, and tags**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-07T10:33:20Z
- **Completed:** 2026-02-07T10:41:34Z
- **Tasks:** 2/2
- **Files modified:** 14 (8 created, 6 modified)

## Accomplishments
- Settings page rewritten with ProfileForm (name + currency select) and AccountSection (sign out, replay onboarding, delete account)
- Delete account dialog with typed "DELETE" confirmation using authClient.deleteUser
- Reusable EmptyState component serving as foundation for all empty states
- Dashboard shows guided checklist when no data exists, with progress bar and setup steps
- Transactions, loans pages show contextual empty states with CTAs to add first items
- Satisfies SETT-01 (update display name) and SETT-02 (set currency symbol)

## Task Commits

Each task was committed atomically:

1. **Task 1: Settings page with profile form, currency, account management** - `8af96b1` (feat)
2. **Task 2: Empty states for all main pages** - `ff4055a` (feat)

## Files Created/Modified

**Created:**
- `apps/web/src/components/settings/profile-form.tsx` - TanStack Form with name and currency fields
- `apps/web/src/components/settings/account-section.tsx` - Sign out, replay onboarding, delete account
- `apps/web/src/components/settings/delete-account-dialog.tsx` - Typed DELETE confirmation dialog
- `apps/web/src/components/empty-states/empty-state.tsx` - Reusable empty state with icon/title/description/CTA
- `apps/web/src/components/empty-states/dashboard-empty.tsx` - Guided checklist with progress bar
- `apps/web/src/components/empty-states/transactions-empty.tsx` - Wallet icon + "Add Transaction" CTA
- `apps/web/src/components/empty-states/loans-empty.tsx` - CreditCard icon + "Add Loan" CTA
- `apps/web/src/components/empty-states/tags-empty.tsx` - Tag icon + "Create Tag" CTA

**Modified:**
- `apps/web/src/app/(dashboard)/dashboard/settings/page.tsx` - Rewritten to use ProfileForm + AccountSection
- `apps/web/src/components/dashboard/dashboard-page-client.tsx` - Added DashboardEmpty conditional rendering
- `apps/web/src/components/transactions/transaction-list.tsx` - TransactionsEmpty + filter-aware message
- `apps/web/src/components/transactions/transactions-page-client.tsx` - Pass onAddTransaction to list
- `apps/web/src/components/loans/loan-list.tsx` - LoansEmpty + onAddLoan prop
- `apps/web/src/components/loans/loans-page-client.tsx` - Pass onAddLoan to list

## Decisions Made
- ProfileForm calls both updateProfile and updateCurrency mutations only when values change (not always both)
- DeleteAccountDialog uses better-auth's authClient.deleteUser (enabled in 06-01) rather than custom tRPC mutation
- Dashboard empty detection uses monthlySummary zeros + empty loanOverview + empty tags (useTags hook added)
- Kept existing compact tag sidebar empty state ("No tags yet. Create one") rather than replacing with full EmptyState component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build lock file conflict required cleanup (stale .next/lock from previous build process)
- Linter auto-removes unused imports, requiring import + usage to be added in same edit step

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 Plan 3 (final plan) complete
- All SETT-01 and SETT-02 requirements satisfied
- Empty states provide onboarding guidance on all main pages
- Full onboarding-to-settings flow complete when combined with 06-01 (data/API) and 06-02 (wizard)

---
*Phase: 06-onboarding-polish*
*Completed: 2026-02-07*
