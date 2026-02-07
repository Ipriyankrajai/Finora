# Roadmap: Finora

## Overview

Finora delivers personal finance tracking in two complementary domains: expense tracking with tags and loan payoff management with "what-if" simulation. The build follows strict data dependencies: schema and calculation utilities first, then API layer by entity, then UI for each domain, then visualizations that aggregate data from both, and finally onboarding polish. This order ensures the data model is correct before building on top of it, and avoids rework from schema changes after data exists.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Prisma schema, calculation utilities, money-as-cents patterns
- [x] **Phase 2: API Layer** - tRPC routers for tags, transactions, loans, and dashboard
- [x] **Phase 3: Tags & Transactions UI** - Tag management and transaction CRUD with filtering
- [x] **Phase 4: Loans UI** - Loan management, payment tracking, balance calculations
- [x] **Phase 5: Visualizations & Dashboard** - Charts, dashboard widgets, what-if simulator
- [x] **Phase 6: Onboarding & Polish** - Guided onboarding, settings, empty states

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the data model and calculation utilities that everything else builds upon
**Depends on**: Nothing (first phase)
**Requirements**: None directly (infrastructure phase enabling all features)
**Success Criteria** (what must be TRUE):
  1. Database schema includes Transaction, Tag, TransactionTag, Loan, LoanPayment models with proper relationships
  2. All monetary values stored as integer cents with composite indexes for performant queries
  3. Calculation utilities (amortization, payoff projection, monthly payment) produce results matching bank calculators within $1
  4. Money conversion utilities (cents to display, display to cents) work consistently across the codebase
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Prisma schema with finance models and migrations
- [x] 01-02-PLAN.md — Money and loan calculation utilities (TDD)

### Phase 2: API Layer
**Goal**: Type-safe tRPC endpoints for all entities with proper authorization and validation
**Depends on**: Phase 1 (schema must exist)
**Requirements**: TAG-01, TAG-02, TAG-03, TAG-04, TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06, TXN-07, TXN-08, TXN-09, LOAN-01, LOAN-02, LOAN-03, LOAN-04, LOAN-05, LOAN-06, LOAN-07, LOAN-08, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Tag CRUD endpoints return correct data scoped to authenticated user
  2. Transaction endpoints support creating income/expense with multi-tag assignment
  3. Transaction filtering by date range, type, tag, and amount works correctly
  4. Loan endpoints support CRUD, payment logging (including extra payments), and return calculated balance/interest/payoff
  5. Dashboard endpoint returns pre-aggregated monthly summary, spending by tag, and loan overview
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — tRPC superjson setup and tag CRUD router with tests
- [x] 02-02-PLAN.md — Transaction CRUD router with multi-tag and filtering
- [x] 02-03-PLAN.md — Loan CRUD router with payment tracking and projections
- [x] 02-04-PLAN.md — Dashboard aggregation endpoint

### Phase 3: Tags & Transactions UI
**Goal**: Users can manage tags and record transactions with full filtering capabilities
**Depends on**: Phase 2 (API must exist)
**Requirements**: TAG-01, TAG-02, TAG-03, TXN-01, TXN-02, TXN-03, TXN-04, TXN-05, TXN-06, TXN-07, TXN-08, TXN-09
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and delete tags with name and color
  2. User can add income and expense transactions with amount, date, notes, and multiple tags
  3. User can edit and delete existing transactions
  4. User can filter transaction list by date range, type (income/expense), tag, and amount range
  5. Transaction list displays with proper currency formatting and tag indicators
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — UI foundation: deps, tRPC client superjson, shared components
- [x] 03-02-PLAN.md — Tag management UI in sidebar with CRUD
- [x] 03-03-PLAN.md — Transaction list with date grouping and filtering
- [x] 03-04-PLAN.md — Transaction form modal with multi-tag selection

### Phase 4: Loans UI
**Goal**: Users can manage loans and track payments with accurate balance and payoff calculations
**Depends on**: Phase 2 (API must exist)
**Requirements**: LOAN-01, LOAN-02, LOAN-03, LOAN-04, LOAN-05, LOAN-06, LOAN-07, LOAN-08
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and delete loans with type, principal, rate, term, and payment amount
  2. User can log payments with amount and date, distinguishing regular from extra payments
  3. User can see current remaining balance on each loan
  4. User can see total interest paid to date for each loan
  5. User can see projected payoff date based on current payment schedule
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Loan hooks, LoanCard, LoanForm, and loans list page
- [x] 04-02-PLAN.md — Payment form modal with extra payment toggle and summary
- [x] 04-03-PLAN.md — Loan detail page with stats and payment history

### Phase 5: Visualizations & Dashboard
**Goal**: Users can see spending patterns and loan progress through delightful charts and interactive simulation
**Depends on**: Phase 3 (transactions), Phase 4 (loans)
**Requirements**: TAG-04, VIZ-01, VIZ-02, VIZ-03, VIZ-04, DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can see this month's income, expenses, and net on the dashboard
  2. User can see spending breakdown pie chart by tag (top 5 with "Other" grouping)
  3. User can see spending trend timeline showing weekly/monthly patterns
  4. User can see loan amortization chart showing balance over time
  5. User can simulate "what if I pay extra" and see updated payoff date in real-time
  6. User can quick-add a transaction from the dashboard
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Dashboard foundation with summary cards, spending pie chart, and recent transactions
- [x] 05-02-PLAN.md — Spending timeline chart with weekly/daily toggle and API endpoint
- [x] 05-03-PLAN.md — Loan visualizations, what-if simulator, and quick-add FAB

### Phase 6: Onboarding & Polish
**Goal**: New users understand the app's value and get started successfully
**Depends on**: Phase 5 (features must exist to onboard to)
**Requirements**: ONBD-01, ONBD-02, SETT-01, SETT-02
**Success Criteria** (what must be TRUE):
  1. New user sees guided onboarding introducing expense tracking features
  2. New user sees guided onboarding introducing loan tracking features
  3. User can update their display name in settings
  4. User can set preferred currency symbol for display
  5. Empty states provide clear guidance when no data exists
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Schema migration, user tRPC router, currency formatting
- [x] 06-02-PLAN.md — Guided onboarding wizard with 4 steps
- [x] 06-03-PLAN.md — Settings page expansion and empty states

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | ✓ Complete | 2026-01-29 |
| 2. API Layer | 4/4 | ✓ Complete | 2026-01-30 |
| 3. Tags & Transactions UI | 4/4 | ✓ Complete | 2026-01-31 |
| 4. Loans UI | 3/3 | ✓ Complete | 2026-01-31 |
| 5. Visualizations & Dashboard | 3/3 | ✓ Complete | 2026-01-31 |
| 6. Onboarding & Polish | 3/3 | ✓ Complete | 2026-02-07 |

---
*Roadmap created: 2026-01-29*
*Last updated: 2026-02-07 (Phase 6 complete — all phases done)*
