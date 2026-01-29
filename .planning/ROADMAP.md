# Roadmap: Finora

## Overview

Finora delivers personal finance tracking in two complementary domains: expense tracking with tags and loan payoff management with "what-if" simulation. The build follows strict data dependencies: schema and calculation utilities first, then API layer by entity, then UI for each domain, then visualizations that aggregate data from both, and finally onboarding polish. This order ensures the data model is correct before building on top of it, and avoids rework from schema changes after data exists.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Prisma schema, calculation utilities, money-as-cents patterns
- [ ] **Phase 2: API Layer** - tRPC routers for tags, transactions, loans, and dashboard
- [ ] **Phase 3: Tags & Transactions UI** - Tag management and transaction CRUD with filtering
- [ ] **Phase 4: Loans UI** - Loan management, payment tracking, balance calculations
- [ ] **Phase 5: Visualizations & Dashboard** - Charts, dashboard widgets, what-if simulator
- [ ] **Phase 6: Onboarding & Polish** - Guided onboarding, settings, empty states

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
- [ ] 02-01-PLAN.md — tRPC superjson setup and tag CRUD router with tests
- [ ] 02-02-PLAN.md — Transaction CRUD router with multi-tag and filtering
- [ ] 02-03-PLAN.md — Loan CRUD router with payment tracking and projections
- [ ] 02-04-PLAN.md — Dashboard aggregation endpoint

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
**Plans**: TBD

Plans:
- [ ] 03-01: Tag management UI (CRUD, color picker)
- [ ] 03-02: Transaction list and filtering
- [ ] 03-03: Transaction forms (add/edit with multi-tag selector)

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
**Plans**: TBD

Plans:
- [ ] 04-01: Loan management UI (CRUD with type/rate/term inputs)
- [ ] 04-02: Payment logging and history
- [ ] 04-03: Loan detail page (balance, interest, payoff summary)

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
**Plans**: TBD

Plans:
- [ ] 05-01: Dashboard layout and monthly summary widgets
- [ ] 05-02: Spending charts (pie by tag, trend timeline)
- [ ] 05-03: Loan charts and what-if simulator

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
**Plans**: TBD

Plans:
- [ ] 06-01: Guided onboarding flow
- [ ] 06-02: Settings page and empty states

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | ✓ Complete | 2026-01-29 |
| 2. API Layer | 0/4 | Ready to execute | - |
| 3. Tags & Transactions UI | 0/3 | Not started | - |
| 4. Loans UI | 0/3 | Not started | - |
| 5. Visualizations & Dashboard | 0/3 | Not started | - |
| 6. Onboarding & Polish | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-29*
*Last updated: 2026-01-29*
