# Requirements: Finora

**Defined:** 2026-01-29
**Core Value:** Users can see exactly where their money goes and when their loans will be paid off

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can create account with email/password
- [x] **AUTH-02**: User can log in and stay logged in across sessions
- [x] **AUTH-03**: User can log out

### Tags

- [ ] **TAG-01**: User can create a tag with name and color
- [ ] **TAG-02**: User can edit a tag's name and color
- [ ] **TAG-03**: User can delete a tag
- [ ] **TAG-04**: User can view spending totals grouped by tag

### Transactions

- [ ] **TXN-01**: User can add an expense with amount, date, and optional notes
- [ ] **TXN-02**: User can add an income with amount, date, and optional notes
- [ ] **TXN-03**: User can assign one or more tags to a transaction
- [ ] **TXN-04**: User can edit a transaction
- [ ] **TXN-05**: User can delete a transaction
- [ ] **TXN-06**: User can filter transactions by date range
- [ ] **TXN-07**: User can filter transactions by type (income/expense)
- [ ] **TXN-08**: User can filter transactions by tag
- [ ] **TXN-09**: User can filter transactions by amount range

### Loans

- [ ] **LOAN-01**: User can create a loan with type, principal, rate, term, and payment amount
- [ ] **LOAN-02**: User can edit a loan's details
- [ ] **LOAN-03**: User can delete a loan
- [ ] **LOAN-04**: User can log a payment with amount and date
- [ ] **LOAN-05**: User can log extra payments separately from regular payments
- [ ] **LOAN-06**: User can see remaining balance on a loan
- [ ] **LOAN-07**: User can see total interest paid to date
- [ ] **LOAN-08**: User can see projected payoff date

### Visualizations

- [ ] **VIZ-01**: User can see spending breakdown pie chart by tag
- [ ] **VIZ-02**: User can see spending trend timeline (weeks/months)
- [ ] **VIZ-03**: User can see loan amortization chart (balance over time)
- [ ] **VIZ-04**: User can simulate "what if I pay extra" and see updated payoff date

### Dashboard

- [ ] **DASH-01**: User can see this month's income, expenses, and net on dashboard
- [ ] **DASH-02**: User can see top spending tags this month
- [ ] **DASH-03**: User can see loan cards with balance and payoff date
- [ ] **DASH-04**: User can quick-add a transaction from dashboard

### Onboarding

- [ ] **ONBD-01**: New user sees guided onboarding introducing expense tracking
- [ ] **ONBD-02**: New user sees guided onboarding introducing loan features

### Settings

- [ ] **SETT-01**: User can update their display name
- [ ] **SETT-02**: User can set preferred currency symbol for display

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Recurring Transactions

- **RECUR-01**: User can mark a transaction as recurring (daily, weekly, monthly)
- **RECUR-02**: System auto-generates recurring transactions on schedule
- **RECUR-03**: User can skip or modify individual occurrences

### Budgets

- **BUDG-01**: User can set monthly budget limit per tag
- **BUDG-02**: User can see budget progress (spent vs limit)
- **BUDG-03**: User receives warning when approaching budget limit

### Debt Strategies

- **DEBT-01**: User can select debt payoff strategy (snowball vs avalanche)
- **DEBT-02**: User can see recommended payment allocation across multiple loans
- **DEBT-03**: User can see debt-free countdown date

### Export

- **EXP-01**: User can export transactions to CSV
- **EXP-02**: User can export loan amortization schedule to PDF

### Attachments

- **ATTACH-01**: User can attach receipt image to transaction
- **ATTACH-02**: User can view attached receipts in transaction detail

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Bank account syncing (Plaid) | High complexity, security concerns, not core to MVP value |
| Automatic transaction categorization | Requires bank sync or OCR; manual tagging is sufficient |
| Google OAuth / magic link auth | Email/password sufficient for MVP |
| Multi-currency conversion | Display-only currency symbol for MVP |
| Shared/family accounts | Single-user MVP, permissions add complexity |
| Credit score integration | Different product category |
| Investment tracking | Different domain, different user needs |
| Net worth tracking | Requires asset/liability modeling beyond loans |
| Bill reminders and notifications | Users have other tools; out of scope |
| Receipt scanning/OCR | Scope creep, notes field sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | ✓ Existing |
| AUTH-02 | — | ✓ Existing |
| AUTH-03 | — | ✓ Existing |
| TAG-01 | TBD | Pending |
| TAG-02 | TBD | Pending |
| TAG-03 | TBD | Pending |
| TAG-04 | TBD | Pending |
| TXN-01 | TBD | Pending |
| TXN-02 | TBD | Pending |
| TXN-03 | TBD | Pending |
| TXN-04 | TBD | Pending |
| TXN-05 | TBD | Pending |
| TXN-06 | TBD | Pending |
| TXN-07 | TBD | Pending |
| TXN-08 | TBD | Pending |
| TXN-09 | TBD | Pending |
| LOAN-01 | TBD | Pending |
| LOAN-02 | TBD | Pending |
| LOAN-03 | TBD | Pending |
| LOAN-04 | TBD | Pending |
| LOAN-05 | TBD | Pending |
| LOAN-06 | TBD | Pending |
| LOAN-07 | TBD | Pending |
| LOAN-08 | TBD | Pending |
| VIZ-01 | TBD | Pending |
| VIZ-02 | TBD | Pending |
| VIZ-03 | TBD | Pending |
| VIZ-04 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| ONBD-01 | TBD | Pending |
| ONBD-02 | TBD | Pending |
| SETT-01 | TBD | Pending |
| SETT-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 28 total (3 existing + 25 new)
- Mapped to phases: 3 (existing)
- Unmapped: 25 ⚠️

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after initial definition*
