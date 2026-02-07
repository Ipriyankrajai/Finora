# Requirements: Finora

**Defined:** 2026-01-29
**Core Value:** Users can see exactly where their money goes, stay on budget, track progress toward financial goals, and optimize their debt payoff strategy

## v1 Requirements (Complete)

### Authentication

- [x] **AUTH-01**: User can create account with email/password
- [x] **AUTH-02**: User can log in and stay logged in across sessions
- [x] **AUTH-03**: User can log out

### Tags

- [x] **TAG-01**: User can create a tag with name and color
- [x] **TAG-02**: User can edit a tag's name and color
- [x] **TAG-03**: User can delete a tag
- [x] **TAG-04**: User can view spending totals grouped by tag

### Transactions

- [x] **TXN-01**: User can add an expense with amount, date, and optional notes
- [x] **TXN-02**: User can add an income with amount, date, and optional notes
- [x] **TXN-03**: User can assign one or more tags to a transaction
- [x] **TXN-04**: User can edit a transaction
- [x] **TXN-05**: User can delete a transaction
- [x] **TXN-06**: User can filter transactions by date range
- [x] **TXN-07**: User can filter transactions by type (income/expense)
- [x] **TXN-08**: User can filter transactions by tag
- [x] **TXN-09**: User can filter transactions by amount range

### Loans

- [x] **LOAN-01**: User can create a loan with type, principal, rate, term, and payment amount
- [x] **LOAN-02**: User can edit a loan's details
- [x] **LOAN-03**: User can delete a loan
- [x] **LOAN-04**: User can log a payment with amount and date
- [x] **LOAN-05**: User can log extra payments separately from regular payments
- [x] **LOAN-06**: User can see remaining balance on a loan
- [x] **LOAN-07**: User can see total interest paid to date
- [x] **LOAN-08**: User can see projected payoff date

### Visualizations

- [x] **VIZ-01**: User can see spending breakdown pie chart by tag
- [x] **VIZ-02**: User can see spending trend timeline (weeks/months)
- [x] **VIZ-03**: User can see loan amortization chart (balance over time)
- [x] **VIZ-04**: User can simulate "what if I pay extra" and see updated payoff date

### Dashboard

- [x] **DASH-01**: User can see this month's income, expenses, and net on dashboard
- [x] **DASH-02**: User can see top spending tags this month
- [x] **DASH-03**: User can see loan cards with balance and payoff date
- [x] **DASH-04**: User can quick-add a transaction from dashboard

### Onboarding

- [x] **ONBD-01**: New user sees guided onboarding introducing expense tracking
- [x] **ONBD-02**: New user sees guided onboarding introducing loan features

### Settings

- [x] **SETT-01**: User can update their display name
- [x] **SETT-02**: User can set preferred currency symbol for display

## v2 Requirements

Requirements for v2.0 Smart Finance milestone. Each maps to roadmap phases 7-12.

### Recurring Transactions

- [ ] **RECUR-01**: User can create a recurring transaction with frequency (daily/weekly/biweekly/monthly/yearly)
- [ ] **RECUR-02**: System auto-generates transactions on schedule from recurring rules
- [ ] **RECUR-03**: User can skip a single upcoming occurrence without breaking the series
- [ ] **RECUR-04**: User can modify a single occurrence independently from the series
- [ ] **RECUR-05**: User can set an optional end date or occurrence count on a recurring rule
- [ ] **RECUR-06**: User can pause and resume a recurring transaction series
- [ ] **RECUR-07**: User can view and manage all recurring transaction rules

### Budgets

- [ ] **BUDG-01**: User can set a monthly spending limit for a specific tag
- [ ] **BUDG-02**: User can see budget progress (spent vs limit) with visual progress bar
- [ ] **BUDG-03**: User receives visual warning when reaching 75%, 90%, and 100% of budget
- [ ] **BUDG-04**: User can enable rollover so unspent budget carries to next month
- [ ] **BUDG-05**: User can view budget overview page showing all budgets with status
- [ ] **BUDG-06**: User can edit or delete a budget

### Goals

- [ ] **GOAL-01**: User can create a savings goal with target amount and optional deadline
- [ ] **GOAL-02**: User can create an income target with monthly amount that resets each period
- [ ] **GOAL-03**: User can link tags to a goal for automatic progress tracking from transactions
- [ ] **GOAL-04**: User can manually log contributions to a savings goal
- [ ] **GOAL-05**: User can see goal progress with visual indicator and projected completion date
- [ ] **GOAL-06**: User can view goal progress chart over time
- [ ] **GOAL-07**: User can edit or delete a goal

### Debt Strategies

- [ ] **DEBT-01**: User can select a debt payoff strategy (snowball or avalanche)
- [ ] **DEBT-02**: User can see recommended payment allocation across all loans
- [ ] **DEBT-03**: User can see debt-free countdown date under chosen strategy
- [ ] **DEBT-04**: User can compare snowball vs avalanche side-by-side (total interest, payoff date)

### Analytics

- [ ] **ANLYT-01**: User can select time range for analytics (3/6/12 months, custom)
- [ ] **ANLYT-02**: User can see spending by tag over time (trend across months)
- [ ] **ANLYT-03**: User can see income vs expenses trend with savings rate
- [ ] **ANLYT-04**: User can see budget vs actual performance across months

### Export

- [ ] **EXP-01**: User can export transactions to CSV (respects current filters)
- [ ] **EXP-02**: User can export budget summary to CSV

## Future Requirements

Deferred beyond v2. Tracked but not in current roadmap.

### Attachments

- **ATTACH-01**: User can attach receipt image to transaction
- **ATTACH-02**: User can view attached receipts in transaction detail

### PDF Export

- **EXP-03**: User can export loan amortization schedule to PDF

### Smart Insights

- **INSIGHT-01**: User receives spending anomaly alerts
- **INSIGHT-02**: User sees AI-generated spending summaries

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Bank account syncing (Plaid) | High complexity, security concerns, not core value |
| Automatic transaction categorization | Requires bank sync or OCR; manual tagging sufficient |
| Google OAuth / magic link auth | Email/password sufficient |
| Multi-currency conversion | Display-only currency symbol |
| Shared/family accounts | Single-user focus, permissions add complexity |
| Credit score integration | Different product category |
| Investment tracking | Different domain, different user needs |
| Net worth tracking | Requires asset/liability modeling beyond loans |
| Bill reminders and notifications | v3+ feature |
| Receipt scanning/OCR | Scope creep, notes field sufficient |
| Zero-based budgeting | Conflicts with tracker-with-budgets approach |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### v1 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | - | Existing |
| AUTH-02 | - | Existing |
| AUTH-03 | - | Existing |
| TAG-01 | Phase 2, 3 | Complete |
| TAG-02 | Phase 2, 3 | Complete |
| TAG-03 | Phase 2, 3 | Complete |
| TAG-04 | Phase 5 | Complete |
| TXN-01 | Phase 2, 3 | Complete |
| TXN-02 | Phase 2, 3 | Complete |
| TXN-03 | Phase 2, 3 | Complete |
| TXN-04 | Phase 2, 3 | Complete |
| TXN-05 | Phase 2, 3 | Complete |
| TXN-06 | Phase 2, 3 | Complete |
| TXN-07 | Phase 2, 3 | Complete |
| TXN-08 | Phase 2, 3 | Complete |
| TXN-09 | Phase 2, 3 | Complete |
| LOAN-01 | Phase 2, 4 | Complete |
| LOAN-02 | Phase 2, 4 | Complete |
| LOAN-03 | Phase 2, 4 | Complete |
| LOAN-04 | Phase 2, 4 | Complete |
| LOAN-05 | Phase 2, 4 | Complete |
| LOAN-06 | Phase 2, 4 | Complete |
| LOAN-07 | Phase 2, 4 | Complete |
| LOAN-08 | Phase 2, 4 | Complete |
| VIZ-01 | Phase 5 | Complete |
| VIZ-02 | Phase 5 | Complete |
| VIZ-03 | Phase 5 | Complete |
| VIZ-04 | Phase 5 | Complete |
| DASH-01 | Phase 2, 5 | Complete |
| DASH-02 | Phase 2, 5 | Complete |
| DASH-03 | Phase 2, 5 | Complete |
| DASH-04 | Phase 5 | Complete |
| ONBD-01 | Phase 6 | Complete |
| ONBD-02 | Phase 6 | Complete |
| SETT-01 | Phase 6 | Complete |
| SETT-02 | Phase 6 | Complete |

### v2 (Pending — populated by roadmapper)

| Requirement | Phase | Status |
|-------------|-------|--------|
| RECUR-01 | — | Pending |
| RECUR-02 | — | Pending |
| RECUR-03 | — | Pending |
| RECUR-04 | — | Pending |
| RECUR-05 | — | Pending |
| RECUR-06 | — | Pending |
| RECUR-07 | — | Pending |
| BUDG-01 | — | Pending |
| BUDG-02 | — | Pending |
| BUDG-03 | — | Pending |
| BUDG-04 | — | Pending |
| BUDG-05 | — | Pending |
| BUDG-06 | — | Pending |
| GOAL-01 | — | Pending |
| GOAL-02 | — | Pending |
| GOAL-03 | — | Pending |
| GOAL-04 | — | Pending |
| GOAL-05 | — | Pending |
| GOAL-06 | — | Pending |
| GOAL-07 | — | Pending |
| DEBT-01 | — | Pending |
| DEBT-02 | — | Pending |
| DEBT-03 | — | Pending |
| DEBT-04 | — | Pending |
| ANLYT-01 | — | Pending |
| ANLYT-02 | — | Pending |
| ANLYT-03 | — | Pending |
| ANLYT-04 | — | Pending |
| EXP-01 | — | Pending |
| EXP-02 | — | Pending |

**Coverage:**
- v1 requirements: 28 total (3 existing + 25 built) — all complete
- v2 requirements: 30 total — pending
- Mapped to phases: 0/30 (awaiting roadmap)

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-02-07 after v2.0 milestone requirements definition*
