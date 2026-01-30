---
phase: 02-api-layer
plan: 03
subsystem: api
tags: [tRPC, loan, payment, amortization, calculations, zod]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: calculation utilities (projectPayoff, roundCents, displayToCents)
provides:
  - Loan CRUD endpoints (list, getById, create, update, delete)
  - Payment logging endpoints (addPayment, deletePayment)
  - Principal/interest split calculation
  - Balance and interest tracking from payments
  - Payoff projections using projectPayoff
affects: [03-ui-shell, loan-ui, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payment split: interest = balance * (rate/12), principal = payment - interest"
    - "Balance calculated from payments (not stored)"

key-files:
  created:
    - packages/api/src/schemas/loan.ts
    - packages/api/src/routers/loan.ts
    - packages/api/src/routers/__tests__/loan.test.ts
  modified:
    - packages/api/src/routers/index.ts

key-decisions:
  - "loanType enum separate from interestType (UI category vs calculation type)"
  - "Balance calculated from payments each time (not stored field)"
  - "Payment split uses standard amortization formula (interest first)"

patterns-established:
  - "Payment split: interestCents = roundCents(balance * monthlyRate)"
  - "Balance tracking: sum of principalCents from all payments subtracted from loan principal"
  - "Projection: projectPayoff(currentBalance, rate, monthlyPayment)"

# Metrics
duration: 10min
completed: 2026-01-30
---

# Phase 2 Plan 3: Loan Router Summary

**Loan CRUD with payment tracking, principal/interest split calculation, and payoff projections using Phase 1 utilities**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-30T06:14:29Z
- **Completed:** 2026-01-30T06:24:42Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Loan CRUD endpoints with full ownership authorization
- Payment logging with automatic principal/interest split based on current balance
- Balance and total interest calculated from payments (not stored)
- Payoff projections using projectPayoff from Phase 1
- Extra payments flagged separately from regular payments
- 22 tests covering CRUD, payments, and calculation accuracy

## Task Commits

Each task was committed atomically:

1. **Task 1: Create loan and payment schemas** - `d353ee6` (feat)
2. **Task 2: Implement loan router with CRUD and payments** - `76b3a6a` (feat)
3. **Task 3: Add loan router tests** - `70581b7` (test)
4. **Task 3 fix: Type assertions for test mocks** - `43c32b0` (fix)

## Files Created/Modified
- `packages/api/src/schemas/loan.ts` - Loan and payment input schemas with validation
- `packages/api/src/routers/loan.ts` - Loan CRUD + payment procedures with projections
- `packages/api/src/routers/index.ts` - Added loanRouter to appRouter
- `packages/api/src/routers/__tests__/loan.test.ts` - Comprehensive test coverage

## Decisions Made
- **loanType vs interestType separation:** loanType (car/home/personal/other) is for UI categorization; interestType (SIMPLE/COMPOUND) matches Prisma enum and affects calculations
- **Balance not stored:** Calculated from payments on each request to ensure accuracy after payment edits/deletes
- **Payment split formula:** Standard amortization - interest = balance * (rate/100/12), principal = payment - interest

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript errors in test mocks**
- **Found during:** Task 3 verification
- **Issue:** Prisma mock types don't match full Prisma client shapes (includes, session fields)
- **Fix:** Added `as any` type assertions and full session mock fields
- **Files modified:** packages/api/src/routers/__tests__/loan.test.ts
- **Verification:** `bun run typecheck` passes
- **Committed in:** 43c32b0

---

**Total deviations:** 1 auto-fixed (blocking issue)
**Impact on plan:** TypeScript strictness on test mocks required type assertions. No functional changes.

## Issues Encountered
- Mock IDs like "loan-1" rejected by Zod cuid() validation - switched to valid CUID format IDs

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Loan endpoints ready for UI integration
- All CRUD operations with proper authorization
- Payment tracking with automatic split calculation
- Projections available via getById response

---
*Phase: 02-api-layer*
*Completed: 2026-01-30*
