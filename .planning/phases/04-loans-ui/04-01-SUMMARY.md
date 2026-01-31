# Phase 04 Plan 01: Loan Management UI Summary

**Completed:** 2026-01-31
**Duration:** ~8 minutes

## One-liner

Loan CRUD UI with card-based display, auto-calculated payments via PMT formula, and optimistic updates.

## What Was Built

### Hooks (apps/web/src/hooks/use-loans.ts)

- **useLoans()**: Fetch all loans sorted by balance (highest first)
- **useLoan(id)**: Fetch single loan with payments and projection
- **useCreateLoan()**: Create loan with optimistic cache update
- **useUpdateLoan()**: Update loan with optimistic cache update
- **useDeleteLoan()**: Delete loan with optimistic cache update
- Predicate-based query invalidation matching transaction pattern

### Components

**LoanCard (apps/web/src/components/loans/loan-card.tsx)**
- Balance-focused display with remaining balance prominent
- Progress bar showing % paid off
- Secondary info: APR and monthly payment
- Dropdown menu: Log Payment, Edit, Delete

**LoanForm (apps/web/src/components/loans/loan-form.tsx)**
- Create/edit loan dialog with TanStack Form + Zod validation
- Auto-calculates monthly payment using PMT formula
- Fields: name, interest type, principal, rate, term, start date
- Validates inputs (positive amounts, rate 0-100%, term 1-600 months)

**LoanList (apps/web/src/components/loans/loan-list.tsx)**
- Grid of loan cards (1/2/3 columns responsive)
- Loading state with skeleton cards
- Error state with retry button
- Empty state with helpful message
- Delete confirmation dialog

**LoansPageClient (apps/web/src/components/loans/loans-page-client.tsx)**
- Header with "Add Loan" button
- State management for form dialog (create/edit modes)
- Prepared for payment logging (Plan 04-02)

### Pages

- Updated `/dashboard/loans` to use LoansPageClient
- Added placeholder `/dashboard/loans/[id]` route for loan details

## Deviations from Plan

### [Rule 3 - Blocking] loanType not stored in database

**Found during:** Task 1 - Creating LoanWithBalance type
**Issue:** Plan specified `loanType: string | null` in interface, but the Loan database schema doesn't have a loanType column. The API schema accepts loanType in input but doesn't save it.
**Fix:** Removed loanType from LoanWithBalance interface. The form still passes loanType (defaults to "personal") but it's not persisted. The UI shows interestType (SIMPLE/COMPOUND) instead.
**Impact:** UI design is slightly different - shows interest type on card instead of loan type label.

### [Rule 2 - Missing Critical] Created placeholder loan detail route

**Found during:** Task 3 - Router type error for dynamic route
**Issue:** LoanCard onClick navigates to `/dashboard/loans/[id]` but route didn't exist, causing TypeScript error.
**Fix:** Created placeholder page at `apps/web/src/app/(dashboard)/dashboard/loans/[id]/page.tsx` with basic layout indicating full implementation comes in Plan 04-02.
**Impact:** Users can click loan cards to navigate; they'll see placeholder until detail view is implemented.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| PMT formula for payment calculation | Standard amortization formula matches existing Phase 1 calculations |
| Interest type instead of loan type | Database schema only has interestType; maintains data consistency |
| Placeholder detail route | Prevents TypeScript errors; establishes route structure for Plan 04-02 |
| Balance sorting (highest first) | Per CONTEXT.md snowball-style view for debt payoff motivation |

## Technical Notes

- Optimistic updates follow exact same predicate pattern as transactions
- TanStack Form with recalculatePayment helper instead of useStore (API difference)
- Router push uses type assertion for dynamic routes until build regenerates types

## Commits

1. `d77f4db` - feat(04-01): add loan hooks with optimistic updates
2. `2d60491` - feat(04-01): add LoanCard and LoanForm components
3. `cba2fae` - feat(04-01): add LoanList and integrate loans page

## Next Phase Readiness

**For Plan 04-02 (Payment Logging):**
- `onLogPayment` callback already wired in LoanList
- `paymentLoan` state ready in LoansPageClient
- Detail route placeholder ready for full implementation
- useLoan hook available for fetching loan with payments

**Files to extend:**
- `apps/web/src/hooks/use-loans.ts` - Add useAddPayment hook
- `apps/web/src/components/loans/loans-page-client.tsx` - Add PaymentForm
- `apps/web/src/app/(dashboard)/dashboard/loans/[id]/page.tsx` - Full detail view

---

*Phase: 04-loans-ui | Plan: 01 | Status: Complete*
