# Phase 1: Foundation - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the data model and calculation utilities that everything else builds upon. Includes Prisma schema (Transaction, Tag, TransactionTag, Loan, LoanPayment models), money-as-cents storage patterns, and calculation utilities for amortization, payoff projection, and monthly payments.

</domain>

<decisions>
## Implementation Decisions

### Money precision
- All monetary values stored as integer cents internally
- Display always shows 2 decimal places ($10.00, $1,234.56)
- Rounding uses half-up (banker's rounding) — 0.005 → 0.01
- Currency-aware storage: store currency code with amounts, display user's preferred symbol (no conversion in v1)
- Negative amounts display with minus sign (-$50.00)

### Loan calculation approach
- Support both simple interest and compound interest (monthly) — user chooses per loan
- Extra payments reduce principal only (shortens loan term)
- Payoff projections assume current payment pattern continues (average of recent payments)
- Track late fees separately — user can log late fees, included in total cost calculations

### Data relationships
- Transactions support multiple tags (many-to-many via TransactionTag)
- Soft delete for tags — marked inactive, visible on old transactions, can't be used for new ones
- Loan payments auto-create expense transactions (for unified cash flow view)
- Hard delete for transactions and loans — gone forever, user confirms before delete

### Calculation validation
- Acceptable tolerance: within $1 of bank calculators
- Core cases only for v1 — standard loans, regular payments (no zero-interest, balloon payments)
- Tests in external test files (standard test directory approach)
- Validation reference: Bankrate.com calculators

### Claude's Discretion
- Exact Prisma schema field names and types
- Index optimization strategy
- Calculation utility function signatures
- Error handling patterns in utilities

</decisions>

<specifics>
## Specific Ideas

- Currency-aware but no conversion — store the code, display the symbol, that's it for v1
- Loan payment creates transaction automatically — keeps cash flow view complete without manual double-entry
- Bankrate.com as the validation reference for loan calculations

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-29*
