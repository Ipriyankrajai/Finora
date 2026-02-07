---
phase: 06-onboarding-polish
plan: 01
subsystem: api, database, ui
tags: [prisma, trpc, react-hooks, currency, user-settings, better-auth]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "User model, Prisma schema, tRPC router setup"
  - phase: 05-visualizations-dashboard
    provides: "Dashboard components with formatCents calls"
provides:
  - "User model with hasCompletedOnboarding and currencySymbol fields"
  - "User tRPC router with 4 endpoints (getSettings, updateProfile, updateCurrency, completeOnboarding)"
  - "deleteUser enabled in better-auth config"
  - "formatCents with custom currency symbol support"
  - "CURRENCY_SYMBOLS constant with 10 major currencies"
  - "React hooks for user settings (useUserSettings, useUpdateProfile, useUpdateCurrency, useCompleteOnboarding)"
  - "All dashboard components wired to user's preferred currency"
affects: [06-02-PLAN, 06-03-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct Prisma queries for user updates (not better-auth updateUser due to Prisma v7 bug #6469)"
    - "useUserSettings hook pattern for reading user preferences in components"
    - "Currency symbol passed explicitly to formatCents at every callsite"

key-files:
  created:
    - "packages/api/src/schemas/user.ts"
    - "packages/api/src/routers/user.ts"
    - "apps/web/src/hooks/use-user-settings.ts"
  modified:
    - "packages/db/prisma/schema/auth.prisma"
    - "packages/auth/src/index.ts"
    - "packages/api/src/routers/index.ts"
    - "apps/web/src/lib/format.ts"
    - "apps/web/src/components/shared/money-display.tsx"
    - "apps/web/src/components/dashboard/monthly-summary.tsx"
    - "apps/web/src/components/dashboard/spending-pie-chart.tsx"
    - "apps/web/src/components/dashboard/spending-timeline.tsx"
    - "apps/web/src/components/dashboard/loan-overview-card.tsx"
    - "apps/web/src/components/dashboard/loan-amortization-chart.tsx"
    - "apps/web/src/components/dashboard/what-if-simulator.tsx"

key-decisions:
  - "hasCompletedOnboarding defaults to true so existing users skip onboarding"
  - "currencySymbol is display-only preference, does not affect stored cent amounts"
  - "Direct Prisma queries for user mutations (not better-auth updateUser due to Prisma v7 bug #6469)"
  - "useUserSettings hook called in each component that formats money (no context provider needed)"
  - "CustomTooltip components in charts call useUserSettings directly (valid since they are React components)"

patterns-established:
  - "User settings hook pattern: useUserSettings() for reading, individual mutation hooks for writing"
  - "Currency symbol threading: each formatCents callsite resolves symbol from useUserSettings"
  - "Fallback chain: prop override -> useUserSettings -> default '$'"

# Metrics
duration: 12min
completed: 2026-02-07
---

# Phase 6 Plan 1: Data/API Foundation Summary

**User model extended with onboarding/currency fields, tRPC user router with 4 endpoints, and all 11 formatCents callsites wired to user's preferred currency symbol**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-07T10:15:22Z
- **Completed:** 2026-02-07T10:27:22Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- User model extended with hasCompletedOnboarding (Boolean, default true) and currencySymbol (String, default "$")
- User tRPC router with getSettings, updateProfile, updateCurrency, completeOnboarding endpoints using direct Prisma queries
- formatCents updated from Intl currency style to decimal with manual symbol prepend, supporting any currency symbol
- All 11 formatCents callsites across 7 files now pass the user's preferred currencySymbol from useUserSettings hook
- CURRENCY_SYMBOLS constant with 10 major world currencies
- deleteUser enabled in better-auth config

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration, auth config, user router with schemas** - `87e57a2` (feat)
2. **Task 2: Currency formatting and user settings hooks** - `3581d09` (feat)
3. **Task 3: Wire currency symbol to all formatCents callsites** - `840c0eb` (feat)

## Files Created/Modified
- `packages/db/prisma/schema/auth.prisma` - Added hasCompletedOnboarding and currencySymbol fields to User model
- `packages/auth/src/index.ts` - Enabled deleteUser in better-auth config
- `packages/api/src/schemas/user.ts` - Created Zod schemas for updateProfile and updateCurrency
- `packages/api/src/routers/user.ts` - Created user router with 4 tRPC endpoints
- `packages/api/src/routers/index.ts` - Registered userRouter in appRouter
- `apps/web/src/lib/format.ts` - Updated formatCents with symbol param, added CURRENCY_SYMBOLS constant
- `apps/web/src/hooks/use-user-settings.ts` - Created useUserSettings, useUpdateProfile, useUpdateCurrency, useCompleteOnboarding hooks
- `apps/web/src/components/shared/money-display.tsx` - Added currencySymbol prop, reads from useUserSettings
- `apps/web/src/components/dashboard/monthly-summary.tsx` - SummaryCard passes currency to formatCents
- `apps/web/src/components/dashboard/spending-pie-chart.tsx` - CustomTooltip uses user currency
- `apps/web/src/components/dashboard/spending-timeline.tsx` - CustomTooltip uses user currency for income/expenses
- `apps/web/src/components/dashboard/loan-overview-card.tsx` - Balance and interest display use user currency
- `apps/web/src/components/dashboard/loan-amortization-chart.tsx` - CustomTooltip uses user currency
- `apps/web/src/components/dashboard/what-if-simulator.tsx` - All 3 formatCents calls use user currency

## Decisions Made
- **hasCompletedOnboarding defaults to true**: Existing users should not see onboarding flow. New users will be explicitly set to false during registration.
- **Direct Prisma queries for user mutations**: better-auth's updateUser has a known bug with Prisma v7 (#6469), so all user updates go through prisma.user.update directly.
- **useUserSettings in each component**: Instead of a React Context provider, each component that needs currency calls useUserSettings() directly. React Query deduplicates the requests automatically. This is simpler and avoids provider nesting.
- **CustomTooltip components use hooks**: Recharts tooltip components are valid React components that can use hooks, so useUserSettings is called at the top of each tooltip.
- **formatCents uses decimal style with manual symbol**: Switched from Intl NumberFormat currency style to decimal style with manual symbol prepend. This allows any symbol string (including multi-char like "CHF") while preserving Intl thousand separators and decimal formatting.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- User model fields ready for onboarding wizard (06-02-PLAN)
- User tRPC router ready for settings page (06-03-PLAN)
- Currency symbol wiring complete - changing currency preference will immediately reflect across all money displays
- All code passes lint and typecheck

---
*Phase: 06-onboarding-polish*
*Completed: 2026-02-07*
