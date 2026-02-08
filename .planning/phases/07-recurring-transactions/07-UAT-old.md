# Phase 7: Recurring Transactions — UAT

**Phase Goal:** Users can automate regular income and expenses with flexible scheduling and per-occurrence control

**Status:** IN_PROGRESS
**Started:** 2026-02-08

---

## Tests

### TEST-01: Recurring page accessible from sidebar
- **What to check:** Click "Recurring" in the dashboard sidebar. The page at `/dashboard/recurring` loads with an empty state (if no rules exist yet) or a list of recurring rules.
- **Severity:** TBD
- **Result:** PENDING

### TEST-02: Create a recurring expense rule (monthly)
- **What to check:** On the recurring page, click "Create Rule" (or the empty-state CTA). Fill in: type=Expense, description="Rent", amount=1500, frequency=Monthly, pick a start date. Submit. The new rule appears in the list with ACTIVE status, correct amount, and "Monthly" frequency.
- **Severity:** TBD
- **Result:** PENDING

### TEST-03: Create a recurring income rule (weekly)
- **What to check:** Create another rule: type=Income, description="Freelance Pay", amount=500, frequency=Weekly, select a day of week. Submit. The rule appears with a green income arrow icon and "Weekly" frequency.
- **Severity:** TBD
- **Result:** PENDING

### TEST-04: Edit an existing recurring rule
- **What to check:** From the occurrence controls dropdown (three-dot menu) on any rule, click "Edit Rule". The form opens pre-populated with the rule's current values. Change the description or amount and save. The list updates with the new values.
- **Severity:** TBD
- **Result:** PENDING

### TEST-05: Pause a recurring rule
- **What to check:** From the occurrence controls dropdown on an ACTIVE rule, click "Pause". The rule's status changes to show an amber "Paused" badge and moves to the bottom of the list.
- **Severity:** TBD
- **Result:** PENDING

### TEST-06: Resume a paused rule
- **What to check:** On a paused rule, click the visible "Resume" button (or use the dropdown). The rule returns to ACTIVE status with an updated next occurrence date (today or next valid date).
- **Severity:** TBD
- **Result:** PENDING

### TEST-07: Skip next occurrence
- **What to check:** From the occurrence controls dropdown on an active rule, click "Skip Next Occurrence". The menu item should show the specific date being skipped. After clicking, a success toast appears. (The skip is recorded internally.)
- **Severity:** TBD
- **Result:** PENDING

### TEST-08: Delete rule only (keep transactions)
- **What to check:** From the occurrence controls dropdown, click "Delete Rule". A dialog appears with two delete options. Click "Delete Rule Only". The rule disappears from the list. Any previously generated transactions remain in the Transactions page.
- **Severity:** TBD
- **Result:** PENDING

### TEST-09: Delete rule and transactions
- **What to check:** On another rule, click "Delete Rule" and choose "Delete Rule & Transactions". Both the rule and any generated transactions are removed.
- **Severity:** TBD
- **Result:** PENDING

### TEST-10: Tags on recurring rules
- **What to check:** Create or edit a rule and assign one or more tags using the tag selector. Save. The rule row shows the tags as colored chips (max 3 visible, +N overflow if more).
- **Severity:** TBD
- **Result:** PENDING

### TEST-11: End condition — end date
- **What to check:** Create a rule with the "End Date" radio option selected and pick a future date. Verify the rule is created successfully. (The end date should be visible when editing the rule.)
- **Severity:** TBD
- **Result:** PENDING

### TEST-12: End condition — max occurrences
- **What to check:** Create a rule with the "Max Occurrences" radio option and set a number (e.g., 10). Verify the rule is created. (The max occurrences count should be visible when editing.)
- **Severity:** TBD
- **Result:** PENDING

### TEST-13: Recurring indicator on generated transactions
- **What to check:** If any transactions were generated from recurring rules, go to the Transactions page. Recurring-sourced transactions should show a small Repeat icon next to the time. Clicking it navigates to `/dashboard/recurring`.
- **Severity:** TBD
- **Result:** PENDING

### TEST-14: Dashboard recurring banner
- **What to check:** On the main dashboard page, if recurring transactions were generated today, a banner should appear showing the count (e.g., "3 recurring transactions generated today"). The banner has a dismiss (X) button and a "View rules" link.
- **Severity:** TBD
- **Result:** PENDING

### TEST-15: Mobile responsive layout
- **What to check:** On a narrow viewport (or mobile device), the recurring page should show cards instead of a table. Controls should remain accessible.
- **Severity:** TBD
- **Result:** PENDING

---

## Summary
- **Total Tests:** 15
- **Passed:** 0
- **Failed:** 0
- **Skipped:** 0
- **Blocked:** 0
