# Phase 7: Recurring Transactions - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can automate regular income and expenses with flexible scheduling and per-occurrence control. Includes creating recurring rules, generating transactions on schedule without duplicates, skipping/modifying individual occurrences, pausing/resuming series, and a dedicated management page. Does NOT include budget integration, analytics, or notifications beyond in-app banners.

</domain>

<decisions>
## Implementation Decisions

### Frequency & Scheduling
- Standard frequency options: Daily, Weekly, Biweekly, Monthly, Yearly (no custom intervals)
- Monthly rules use day-of-month only (e.g., "the 15th"), not weekday patterns ("2nd Tuesday")
- Month-end edge case: if day doesn't exist (e.g., 31st in a 30-day month), use last day of that month
- Weekly/Biweekly: user picks a specific day of the week (e.g., "every Monday"), not just counting from start date
- End conditions: optional end date OR occurrence count (e.g., "repeat 12 times") OR run forever (default)
- Default transaction type: expense (user can change to income)
- Amount is fixed on the rule — no per-occurrence amount variation
- Tags are optional on the rule; generated transactions inherit whatever tags are set

### Occurrence Controls
- Skip: marks occurrence as "skipped" (visible in history), next occurrence continues as normal
- Controls accessible from BOTH the rule management page AND from individual generated transactions
- Pause: prominent "Paused" badge on the rule card with a resume button — easy to spot at a glance
- Delete rule: confirmation dialog asks "Delete rule only" or "Delete rule and all generated transactions"

### Management Page Layout
- List/table view (not cards) — compact, sortable, more rules visible at once
- Single list with visual indicator (color/icon) for income vs expense — no tabs
- Each row shows: name, amount, frequency, next date, attached tags, and active/paused status
- Dedicated sidebar navigation item (alongside Transactions, Loans, Dashboard)

### Generation Behavior
- Auto-generate on schedule (background/cron-like), not lazy on page load
- Generate only past-due transactions — no future transactions generated ahead of time
- Dashboard banner: dismissible notification "X recurring transactions were generated today"
- Generated transactions show a subtle repeat icon/badge in the transaction list to distinguish from manual entries

### Claude's Discretion
- Exact cron/scheduling implementation approach (given no current background workers)
- Idempotency mechanism for duplicate prevention
- Exact table column widths, sort defaults, and row styling
- Empty state design for management page
- Form layout and field ordering for creating/editing rules
- Loading and error states

</decisions>

<specifics>
## Specific Ideas

- Generated transactions should be clearly linked back to their parent rule (clicking the repeat icon could navigate to the rule)
- The "Paused" badge should be prominent enough to catch the eye when scanning a list of rules
- Banner notification on dashboard should show count and be dismissible, not intrusive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-recurring-transactions*
*Context gathered: 2026-02-07*
