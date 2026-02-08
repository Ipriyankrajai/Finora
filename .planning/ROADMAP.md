# Roadmap: Finora

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-02-07)
- 🚧 **v2.0 Smart Finance** - Phases 7-12 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 MVP (Phases 1-6) - SHIPPED 2026-02-07</summary>

### Phase 1: Foundation
**Goal**: Establish the data model and calculation utilities that everything else builds upon
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Prisma schema with finance models and migrations
- [x] 01-02-PLAN.md — Money and loan calculation utilities (TDD)

### Phase 2: API Layer
**Goal**: Type-safe tRPC endpoints for all entities with proper authorization and validation
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — tRPC superjson setup and tag CRUD router with tests
- [x] 02-02-PLAN.md — Transaction CRUD router with multi-tag and filtering
- [x] 02-03-PLAN.md — Loan CRUD router with payment tracking and projections
- [x] 02-04-PLAN.md — Dashboard aggregation endpoint

### Phase 3: Tags & Transactions UI
**Goal**: Users can manage tags and record transactions with full filtering capabilities
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — UI foundation: deps, tRPC client superjson, shared components
- [x] 03-02-PLAN.md — Tag management UI in sidebar with CRUD
- [x] 03-03-PLAN.md — Transaction list with date grouping and filtering
- [x] 03-04-PLAN.md — Transaction form modal with multi-tag selection

### Phase 4: Loans UI
**Goal**: Users can manage loans and track payments with accurate balance and payoff calculations
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Loan hooks, LoanCard, LoanForm, and loans list page
- [x] 04-02-PLAN.md — Payment form modal with extra payment toggle and summary
- [x] 04-03-PLAN.md — Loan detail page with stats and payment history

### Phase 5: Visualizations & Dashboard
**Goal**: Users can see spending patterns and loan progress through delightful charts and interactive simulation
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Dashboard foundation with summary cards, spending pie chart, and recent transactions
- [x] 05-02-PLAN.md — Spending timeline chart with weekly/daily toggle and API endpoint
- [x] 05-03-PLAN.md — Loan visualizations, what-if simulator, and quick-add FAB

### Phase 6: Onboarding & Polish
**Goal**: New users understand the app's value and get started successfully
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Schema migration, user tRPC router, currency formatting
- [x] 06-02-PLAN.md — Guided onboarding wizard with 4 steps
- [x] 06-03-PLAN.md — Settings page expansion and empty states

</details>

## v2.0 Smart Finance (Phases 7-12)

**Milestone Goal:** Transform Finora from a tracker into a proactive financial planning tool with budgets, goals, debt strategies, recurring transactions, analytics, and export.

**Overview:**

v2 extends the working v1 foundation with six interconnected features. Build order follows strict data dependencies: recurring transactions first (generates data everything else consumes, requires schema migration), budgets next (high user value, establishes shared month-boundary utility), goals (tag-linked auto-tracking parallels budgets), debt strategies (pure calculation over existing loans), analytics (read-only aggregation benefiting from budgets), and export last (consumes all data). This ordering prevents integration pitfalls around idempotent generation, month-boundary consistency, and real-time data coherence.

### Phase 7: Recurring Transactions
**Goal**: Users can automate regular income and expenses with flexible scheduling and per-occurrence control
**Depends on**: Phase 6 (v1 complete — existing Transaction, Tag models required)
**Requirements**: RECUR-01, RECUR-02, RECUR-03, RECUR-04, RECUR-05, RECUR-06, RECUR-07
**Success Criteria** (what must be TRUE):
  1. User can create a recurring transaction rule with amount, tags, frequency, and start date, and the system generates transactions on schedule without duplicates
  2. User can skip or modify a single upcoming occurrence without affecting future occurrences in the series
  3. User can pause and resume a recurring series, and set an optional end date or occurrence count
  4. User can view a management page listing all recurring rules with their status, frequency, and next occurrence date
**Plans**: 4 plans

Plans:
- [x] 07-01-PLAN.md — Prisma schema (RecurringRule, RecurringOccurrence models), Zod schemas, date computation utility, and tRPC recurring CRUD router
- [x] 07-02-PLAN.md — Trigger.dev generation engine (hourly cron + idempotent transaction creation)
- [x] 07-03-PLAN.md — Recurring management UI (page, table list, create/edit form, sidebar nav, dashboard banner)
- [x] 07-04-PLAN.md — Occurrence controls (skip, pause/resume, delete dialog, recurring transaction indicator)

### Phase 8: Budgets
**Goal**: Users can set monthly spending limits per category and see real-time progress toward those limits
**Depends on**: Phase 7 (shared month-boundary utility extracted here; recurring transactions already generating data)
**Requirements**: BUDG-01, BUDG-02, BUDG-03, BUDG-04, BUDG-05, BUDG-06
**Success Criteria** (what must be TRUE):
  1. User can create a monthly budget for any tag with a spending limit, and edit or delete existing budgets
  2. User can see each budget's progress bar showing spent vs limit, updated in real time as transactions are added
  3. User sees visual warnings when spending reaches 75%, 90%, and 100% of a budget's limit
  4. User can enable rollover on a budget so unspent amounts carry forward to the next month
  5. User can view a budget overview page showing all budgets with their current status at a glance
**Plans**: 3 plans (estimated)

Plans:
- [ ] 08-01-PLAN.md — Budget tRPC router with real-time spent calculation and month-boundary utility
- [ ] 08-02-PLAN.md — Budget overview page UI (cards, progress bars, warning indicators)
- [ ] 08-03-PLAN.md — Budget form, rollover toggle, and transaction-creation warning integration

### Phase 9: Goals
**Goal**: Users can set savings targets and income goals, track progress automatically through tagged transactions or manually
**Depends on**: Phase 8 (tag-linked auto-tracking pattern established; month-boundary utility available)
**Requirements**: GOAL-01, GOAL-02, GOAL-03, GOAL-04, GOAL-05, GOAL-06, GOAL-07
**Success Criteria** (what must be TRUE):
  1. User can create a savings goal with target amount and optional deadline, and an income target with monthly amount that resets each period
  2. User can link tags to a goal so that matching transactions automatically count toward progress
  3. User can manually log contributions to a savings goal and see them in a contribution history
  4. User can see each goal's progress with a visual indicator and projected completion date
  5. User can view a goal progress chart showing accumulation over time, and edit or delete goals
**Plans**: 3 plans (estimated)

Plans:
- [ ] 09-01-PLAN.md — Goal tRPC router with hybrid tracking (auto + manual contributions)
- [ ] 09-02-PLAN.md — Goals overview page UI (cards, progress rings, deadline indicators)
- [ ] 09-03-PLAN.md — Goal detail view with contribution history and progress chart

### Phase 10: Debt Strategies
**Goal**: Users can optimize loan payoff across multiple loans with snowball/avalanche strategies and see their debt-free date
**Depends on**: Phase 6 (existing Loan model and calculations.ts; independent of Phases 7-9)
**Requirements**: DEBT-01, DEBT-02, DEBT-03, DEBT-04
**Success Criteria** (what must be TRUE):
  1. User can select a debt payoff strategy (snowball or avalanche) and see recommended monthly payment allocation across all active loans
  2. User can see a debt-free countdown date based on the chosen strategy and current payment amounts
  3. User can compare snowball vs avalanche side-by-side showing total interest paid and payoff timeline for each
**Plans**: 2 plans (estimated)

Plans:
- [ ] 10-01-PLAN.md — Snowball/avalanche calculation utilities and debt strategy tRPC router
- [ ] 10-02-PLAN.md — Debt strategy UI section on loans page (comparison table, allocation view, countdown)

### Phase 11: Analytics
**Goal**: Users can explore spending patterns, income trends, and budget performance across customizable time ranges
**Depends on**: Phase 8 (budget data enables budget-vs-actual overlay; month-boundary utility required)
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04
**Success Criteria** (what must be TRUE):
  1. User can select a time range (3, 6, or 12 months, or custom dates) and all analytics charts update accordingly
  2. User can see spending by tag over time as a trend chart showing how category spending changes across months
  3. User can see income vs expenses trend with savings rate calculated per period
  4. User can see budget vs actual performance overlaid across months for each budgeted tag
**Plans**: 3 plans (estimated)

Plans:
- [ ] 11-01-PLAN.md — Analytics tRPC router with raw SQL aggregation queries
- [ ] 11-02-PLAN.md — Analytics page with time range selector and spending/income charts
- [ ] 11-03-PLAN.md — Budget vs actual overlay chart and category trend deep-dive

### Phase 12: Export
**Goal**: Users can export their financial data to CSV for use in spreadsheets or with advisors
**Depends on**: Phase 11 (all data features complete; export consumes transactions and budget data)
**Requirements**: EXP-01, EXP-02
**Success Criteria** (what must be TRUE):
  1. User can export transactions to CSV respecting current filter selections (date, type, tag, amount), with proper formatting for Excel compatibility
  2. User can export budget summary to CSV showing each budget's limit, spent, remaining, and percentage
**Plans**: 1 plan (estimated)

Plans:
- [ ] 12-01-PLAN.md — CSV export route handlers for transactions and budget summary

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12

Note: Phase 10 (Debt Strategies) has no dependency on Phases 7-9 and could execute in parallel with Phase 8 or 9 if desired.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-29 |
| 2. API Layer | v1.0 | 4/4 | Complete | 2026-01-30 |
| 3. Tags & Transactions UI | v1.0 | 4/4 | Complete | 2026-01-31 |
| 4. Loans UI | v1.0 | 3/3 | Complete | 2026-01-31 |
| 5. Visualizations & Dashboard | v1.0 | 3/3 | Complete | 2026-01-31 |
| 6. Onboarding & Polish | v1.0 | 3/3 | Complete | 2026-02-07 |
| 7. Recurring Transactions | v2.0 | 4/4 | Complete | 2026-02-07 |
| 8. Budgets | v2.0 | 0/3 | Not started | - |
| 9. Goals | v2.0 | 0/3 | Not started | - |
| 10. Debt Strategies | v2.0 | 0/2 | Not started | - |
| 11. Analytics | v2.0 | 0/3 | Not started | - |
| 12. Export | v2.0 | 0/1 | Not started | - |

---
*Roadmap created: 2026-01-29*
*v1.0 completed: 2026-02-07*
*v2.0 roadmap added: 2026-02-07*
*Phase 7 planned: 2026-02-07*
