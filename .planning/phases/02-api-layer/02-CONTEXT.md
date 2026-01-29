# Phase 2: API Layer - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Type-safe tRPC endpoints for all entities — tags, transactions, loans, and dashboard aggregation. Users can perform CRUD operations on their financial data through these APIs. The UI layer (Phase 3+) will consume these endpoints.

</domain>

<decisions>
## Implementation Decisions

### Error Responses
- Shape: Code + message structure (`{ code: 'INVALID_AMOUNT', message: 'Amount must be positive' }`)
- Code format: Human-readable string codes (INVALID_AMOUNT, NOT_FOUND, UNAUTHORIZED)
- Message verbosity: User-friendly messages suitable for end-user display
- Not found behavior: Distinguish UNAUTHORIZED (exists but not yours) from NOT_FOUND (truly missing)

### Pagination & Filtering
- Pagination style: Cursor-based pagination for transaction lists
- Default page size: 20 items per page
- Date filtering: Support BOTH preset periods (last30days, thisMonth) AND custom date ranges (from/to)
- Filter logic: All filters combine with AND logic (tag=food AND type=expense AND amount>100)

### Input Validation
- Money validation: Strict — reject negative amounts, require cents precision, enforce max value limit
- String handling: Auto-trim all string inputs
- Empty string handling: Coerce empty strings to null for optional fields
- Text limits: 500 characters max for notes and similar text fields

### Dashboard Aggregation
- Monthly summary scope: Current month plus 3-month rolling average for trend comparison
- Spending by tag: Return top 5 tags with spending, group remainder as "Other"
- Loan overview: Include projections — balance, projected payoff date, total interest remaining
- API structure: One combined endpoint (GET /dashboard) returning all widgets in single round-trip

### Testing
- All API endpoints must have tests
- Include happy path, error cases, and edge cases

### Claude's Discretion
- tRPC router organization and naming conventions
- Zod schema structure and reuse patterns
- Database query optimization
- Specific error code naming (e.g., INVALID_AMOUNT vs AMOUNT_INVALID)
- Caching implementation details for dashboard aggregation

</decisions>

<specifics>
## Specific Ideas

- Error messages should be clear enough to show directly to users without UI transformation
- Cursor pagination handles real-time data changes well (new transactions don't cause skipped items)
- Dashboard endpoint minimizes round-trips — important for initial page load performance

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-api-layer*
*Context gathered: 2026-01-29*
