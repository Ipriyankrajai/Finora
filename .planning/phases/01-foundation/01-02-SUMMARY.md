---
phase: 01-foundation
plan: 02
subsystem: api
tags: [currency.js, vitest, bigint, tdd, money, calculations, loan]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: none (first computational module)
provides:
  - money conversion utilities (displayToCents, centsToDisplay, roundCents)
  - loan calculation utilities (calculateMonthlyPayment, projectPayoff)
  - test infrastructure with vitest
affects: [02-api, 03-dashboard, charts, what-if-simulation]

# Tech tracking
tech-stack:
  added: [currency.js, vitest]
  patterns: [BigInt cents storage, TDD red-green-refactor, PMT formula]

key-files:
  created:
    - packages/api/src/lib/money.ts
    - packages/api/src/lib/calculations.ts
    - packages/api/src/lib/__tests__/money.test.ts
    - packages/api/src/lib/__tests__/calculations.test.ts
  modified:
    - packages/api/package.json

key-decisions:
  - "BigInt for all money values (cents) to avoid floating-point errors"
  - "currency.js for display formatting (handles $, commas, negatives)"
  - "PMT formula for amortizing loan calculations"
  - "Iterative simulation for projectPayoff with 720-month cap"
  - "Infinity for monthsRemaining when payment doesn't cover interest"

patterns-established:
  - "TDD: Write failing tests first, then implement to pass"
  - "Money storage: Always in cents as BigInt"
  - "Money display: Always formatted with $ and commas via centsToDisplay"
  - "Calculation accuracy: Within $1 of Bankrate calculator"

# Metrics
duration: 5min
completed: 2026-01-29
---

# Phase 1 Plan 2: Core Utilities Summary

**TDD-built money conversion and loan calculation utilities using BigInt cents and currency.js, validated within $1 of Bankrate calculator**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-29T07:01:36Z
- **Completed:** 2026-01-29T07:06:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Money utilities converting between display strings ("$1,234.56") and BigInt cents (123456n)
- Loan calculation utilities matching Bankrate.com accuracy within $1
- Full TDD coverage with 25 passing tests
- Test infrastructure with vitest ready for future test development

## Task Commits

Each task was committed atomically (TDD tasks have separate test/implementation commits):

1. **Task 1: Install currency.js and setup test infrastructure** - `2830b52` (chore)
2. **Task 2: TDD - Money conversion utilities**
   - `49cac41` (test) - RED phase: failing tests
   - `0016e8a` (feat) - GREEN phase: implementation passes
3. **Task 3: TDD - Loan calculation utilities**
   - `e3fc5eb` (test) - RED phase: failing tests
   - `406d850` (feat) - GREEN phase: implementation passes

## Files Created/Modified

- `packages/api/package.json` - Added currency.js, vitest, test scripts
- `packages/api/src/lib/money.ts` - displayToCents, centsToDisplay, roundCents utilities
- `packages/api/src/lib/calculations.ts` - calculateMonthlyPayment, calculateSimpleInterest, calculateCompoundInterest, projectPayoff
- `packages/api/src/lib/__tests__/money.test.ts` - 15 tests for money utilities
- `packages/api/src/lib/__tests__/calculations.test.ts` - 10 tests for calculation utilities

## Decisions Made

1. **BigInt for money storage** - Avoids floating-point precision issues; all monetary values stored as integer cents
2. **currency.js for formatting** - Handles dollar signs, commas, negatives, and rounding consistently
3. **720-month cap for projectPayoff** - Prevents infinite loops; ~60 years is reasonable max loan term
4. **Infinity for insufficient payments** - Clear signal when monthly payment doesn't cover interest

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `@types/currency.js` doesn't exist on npm (404 error) - Not a problem since currency.js has built-in TypeScript definitions

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Core calculation utilities ready for API integration
- Test infrastructure ready for additional test coverage
- Money utilities can be used by transaction and loan endpoints
- Calculations can power what-if simulation and payoff projections

---
*Phase: 01-foundation*
*Plan: 02*
*Completed: 2026-01-29*
