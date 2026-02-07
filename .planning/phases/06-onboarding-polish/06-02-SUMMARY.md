---
phase: 06-onboarding-polish
plan: 02
subsystem: ui
tags: [onboarding, wizard, tanstack-form, zod, css-transitions, next-route-groups]

# Dependency graph
requires:
  - phase: 06-onboarding-polish-01
    provides: [hasCompletedOnboarding field, currencySymbol field, user tRPC endpoints, CURRENCY_SYMBOLS constant, useUserSettings hooks]
provides:
  - (onboarding) route group with auth-only layout
  - 4-step onboarding wizard (welcome, expenses, loans, setup)
  - Dashboard redirect for incomplete onboarding
  - Profile setup form collecting name and currency preference
affects: [06-03-settings-polish]

# Tech tracking
tech-stack:
  added: ["@finora2/db added to web app dependencies"]
  patterns: [multi-step wizard with CSS transitions, route group isolation for onboarding flow]

key-files:
  created:
    - apps/web/src/app/(onboarding)/layout.tsx
    - apps/web/src/app/(onboarding)/onboarding/page.tsx
    - apps/web/src/components/onboarding/onboarding-wizard.tsx
    - apps/web/src/components/onboarding/step-welcome.tsx
    - apps/web/src/components/onboarding/step-expenses.tsx
    - apps/web/src/components/onboarding/step-loans.tsx
    - apps/web/src/components/onboarding/step-setup.tsx
  modified:
    - apps/web/src/app/(dashboard)/layout.tsx
    - apps/web/package.json

key-decisions:
  - "@finora2/db added as web app dependency for server-side prisma queries in layout"
  - "Onboarding layout only checks auth (not hasCompletedOnboarding) to prevent redirect loops"
  - "CSS transition with 300ms slide+fade (not full Framer Motion) for lightweight step transitions"
  - "Progress bar segments instead of numbered dots for minimal visual design"
  - "Default currency pre-filled from user settings via useUserSettings hook"

patterns-established:
  - "Route group isolation: (onboarding) group with own layout separate from (dashboard)"
  - "Wizard pattern: useState index + STEPS const array + renderStep switch"
  - "Skip-to-complete pattern: any step can skip entire wizard via completeOnboarding mutation"

# Metrics
duration: 11min
completed: 2026-02-07
---

# Phase 6 Plan 2: Onboarding Wizard UI Summary

**4-step onboarding wizard with CSS transitions, feature previews, and profile setup form collecting name and currency preference**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-07T10:30:41Z
- **Completed:** 2026-02-07T10:41:45Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- (onboarding) route group with auth-only layout, preventing redirect loops
- Dashboard layout redirects users with hasCompletedOnboarding=false to /onboarding
- 4-step wizard: Welcome (app intro), Expenses (feature preview), Loans (feature preview), Setup (profile form)
- Skip button on all steps completes onboarding immediately and redirects to dashboard
- Setup step collects display name + currency via TanStack Form with Zod validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Onboarding route group and dashboard redirect** - `2bfe515` (feat)
2. **Task 2: Onboarding wizard with 4 steps and CSS transitions** - `09c4fdf` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `apps/web/src/app/(onboarding)/layout.tsx` - Clean layout with auth check only, centered container
- `apps/web/src/app/(onboarding)/onboarding/page.tsx` - Page entry point rendering OnboardingWizard
- `apps/web/src/app/(dashboard)/layout.tsx` - Added prisma query for hasCompletedOnboarding + redirect
- `apps/web/src/components/onboarding/onboarding-wizard.tsx` - Multi-step wizard with state management, progress bar, skip
- `apps/web/src/components/onboarding/step-welcome.tsx` - App introduction with feature highlights
- `apps/web/src/components/onboarding/step-expenses.tsx` - Expense tracking preview with mock transaction list
- `apps/web/src/components/onboarding/step-loans.tsx` - Loan management preview with mock loan card
- `apps/web/src/components/onboarding/step-setup.tsx` - Profile form with name input and currency select
- `apps/web/package.json` - Added @finora2/db dependency

## Decisions Made
- **@finora2/db as web dependency:** Web app needed direct prisma access for server-side layout check. Previously only the API and auth packages used prisma directly.
- **Auth-only onboarding layout:** The (onboarding) layout only checks for a session, NOT hasCompletedOnboarding. This prevents redirect loops (dashboard redirects to onboarding, onboarding wouldn't redirect back).
- **CSS transitions over animation library:** Used Tailwind transition-all duration-300 with translate/opacity for step transitions. Lightweight and consistent with sign-up page patterns.
- **Progress bar segments:** Used h-1.5 w-8 bar segments instead of numbered circles for a cleaner, more minimal design matching the app's aesthetic.
- **Pre-filled defaults:** Setup step pre-fills name and currency from useUserSettings hook, so returning users see their existing values.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @finora2/db dependency to web app**
- **Found during:** Task 1 (dashboard layout redirect)
- **Issue:** `@finora2/db` was not in web app's package.json dependencies, causing Turbopack module resolution failure
- **Fix:** Added `"@finora2/db": "workspace:*"` to web app dependencies and ran `bun install`
- **Files modified:** apps/web/package.json, bun.lock
- **Verification:** `bun run build` succeeds
- **Committed in:** 2bfe515 (Task 1 commit)

**2. [Rule 1 - Bug] Added default case to switch statement**
- **Found during:** Task 2 (onboarding wizard)
- **Issue:** Biome lint requires default case in switch statements (noSwitchDeclarations)
- **Fix:** Added `default: return null` to renderStep switch
- **Files modified:** apps/web/src/components/onboarding/onboarding-wizard.tsx
- **Verification:** `bun x ultracite check` passes
- **Committed in:** 09c4fdf (Task 2 commit)

**3. [Rule 1 - Bug] Handle null from Base UI Select onValueChange**
- **Found during:** Task 2 (step-setup component)
- **Issue:** Base UI Select's onValueChange can pass `null`, but TanStack Form field.handleChange expects string
- **Fix:** Added null guard: `if (val !== null) { field.handleChange(val) }`
- **Files modified:** apps/web/src/components/onboarding/step-setup.tsx
- **Verification:** TypeScript compilation passes
- **Committed in:** 09c4fdf (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for build and lint compliance. No scope creep.

## Issues Encountered
- Pre-existing uncommitted 06-03 code (empty states, transaction list changes) was present in working tree from a parallel execution. These were committed separately by the parallel process and did not affect this plan's execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Onboarding flow complete, ready for 06-03 settings page and polish
- New users will see onboarding wizard before accessing dashboard
- Existing users (hasCompletedOnboarding=true by default) skip onboarding entirely
- Settings page can add "replay onboarding" link that resets hasCompletedOnboarding

---
*Phase: 06-onboarding-polish*
*Completed: 2026-02-07*
