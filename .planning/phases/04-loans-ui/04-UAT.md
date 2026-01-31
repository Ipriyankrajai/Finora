---
status: testing
phase: 04-loans-ui
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-01-31T06:15:00Z
updated: 2026-01-31T06:15:00Z
---

## Current Test

number: 1
name: View Loans List
expected: |
  Navigate to /dashboard/loans. You should see a grid of loan cards. Each card shows:
  - Loan name at top
  - Remaining balance (prominent)
  - Progress bar showing % paid off
  - APR and monthly payment as secondary info
  - Three-dot menu with options
awaiting: user response

## Tests

### 1. View Loans List
expected: Navigate to /dashboard/loans. See grid of loan cards with balance, progress bar, APR, and monthly payment displayed. Cards sorted by highest balance first.
result: [pending]

### 2. Create New Loan
expected: Click "Add Loan" button. Fill form with name, interest type (Simple/Compound), principal amount, APR rate, and term in months. Monthly payment auto-calculates as you type. Submit creates loan and it appears in list.
result: [pending]

### 3. Edit Existing Loan
expected: Click three-dot menu on a loan card, select "Edit". Form opens pre-filled with loan data. Change any field, monthly payment recalculates. Submit updates the loan.
result: [pending]

### 4. Delete Loan
expected: Click three-dot menu on a loan card, select "Delete". Confirmation dialog appears. Confirm to delete loan and it disappears from list.
result: [pending]

### 5. Log Payment from Card
expected: Click three-dot menu on a loan card, select "Log Payment". Payment form dialog opens with amount pre-filled to monthly payment. Enter amount and date, submit successfully.
result: [pending]

### 6. Mark Extra Payment
expected: In payment form, check the "Extra Payment" checkbox. Submit the payment. The payment should be recorded and marked as extra.
result: [pending]

### 7. View Payment Summary
expected: After logging a payment, the dialog should transition to a summary view showing: amount paid, principal portion, interest portion, and new remaining balance.
result: [pending]

### 8. Navigate to Loan Detail
expected: Click on a loan card (not the menu). You should navigate to a detail page showing the loan's full information.
result: [pending]

### 9. View Loan Stats on Detail Page
expected: On loan detail page, see stats cards showing: remaining balance, total interest paid to date, and projected payoff date. If payment doesn't cover interest, payoff shows "N/A" with hint.
result: [pending]

### 10. View Payment History
expected: On loan detail page, see payment history section listing all payments with: date, "Extra" badge if applicable, and principal/interest breakdown for each payment.
result: [pending]

### 11. Delete Payment from Detail Page
expected: On a payment in the history, click delete button. Confirmation dialog appears. Confirm to delete payment and it's removed from list. Balance recalculates.
result: [pending]

## Summary

total: 11
passed: 0
issues: 0
pending: 11
skipped: 0

## Gaps

[none yet]
