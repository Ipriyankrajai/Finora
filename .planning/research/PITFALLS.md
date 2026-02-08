# Domain Pitfalls: Finora v2 Features

**Domain:** Adding recurring transactions, budgets, debt strategies, goals, analytics, and export to existing personal finance app
**Researched:** 2026-02-07
**Confidence:** MEDIUM-HIGH (cross-referenced with codebase analysis, community patterns, and PostgreSQL documentation)
**Scope:** Pitfalls specific to adding v2 features to Finora's existing architecture (BigInt cents, Prisma 7, PostgreSQL with Timestamptz, tRPC + superjson, Recharts)

---

## Critical Pitfalls

Mistakes that cause data corruption, incorrect financial calculations, or require schema rewrites.

---

### Pitfall 1: Recurring Transaction Duplicate Generation on Restart/Retry

**Description:** When a cron job or scheduled task generates recurring transactions, server restarts, deployment redeploys, or retried jobs create duplicate transactions. Without idempotency, the same recurring rule fires twice for the same period, doubling the user's rent or salary entries.

**Why it happens:** Developers build "generate transactions for today" logic without tracking which periods have already been generated. The job checks "is today the 1st? If so, create rent transaction" but has no memory of whether it already ran today.

**Warning signs:**
- Users report seeing duplicate recurring entries after deployments
- Transaction counts spike on days the server restarts
- Test suites pass but production has duplicates after cron overlap windows

**Prevention:**
1. Store a `lastGeneratedDate` or `nextDueDate` on the RecurringTransaction model. After generating, advance `nextDueDate` to the next occurrence. The generation query becomes: `WHERE nextDueDate <= NOW()` then update `nextDueDate` atomically.
2. Use a composite unique constraint `(recurringTransactionId, generatedForDate)` on generated transactions to make duplicates impossible at the database level.
3. Wrap generation in a Prisma `$transaction` with SELECT FOR UPDATE or advisory locks to prevent race conditions if multiple instances run.
4. Design the generation as idempotent: given the same inputs, running it twice produces the same result (no extra rows).

**Phase:** Recurring Transactions. This must be designed into the schema, not patched later.

**Confidence:** HIGH -- this is a well-documented pattern in scheduling systems. See [Traveling Coderman - Idempotent Cron Jobs](https://traveling-coderman.net/code/node-architecture/idempotent-cron-job/) and [Mercari Engineering - Race Conditions in DB Transactions](https://engineering.mercari.com/en/blog/entry/20241206-the-race-condition-in-multiple-db-transactions-and-the-solutions/).

---

### Pitfall 2: End-of-Month Scheduling Produces Skipped or Wrong-Day Transactions

**Description:** A user sets rent due on the 31st. February has 28 days. What happens? If you naively use `setDate(31)` on February, JavaScript rolls over to March 3rd. If you skip months without 31 days, the user misses their rent entry for February, April, June, September, and November.

**Why it happens:** JavaScript `Date` silently overflows when setting day-of-month beyond the month's length. `new Date(2026, 1, 31)` (February 31) becomes March 3rd without any error. Developers test with the 15th and never encounter this.

**Warning signs:**
- Users with 29th/30th/31st recurrence dates report missing months
- Transactions appearing on unexpected dates (March 2nd or 3rd instead of Feb 28th)
- Test suites only use day-of-month values 1-28

**Prevention:**
1. Store the recurrence as a semantic value: `{ dayOfMonth: 31 }` or `{ dayOfMonth: "last" }`. Do NOT store a concrete next date computed from naive date math.
2. When generating, use `Math.min(desiredDay, daysInMonth(year, month))` to clamp to the last valid day. For "31st", February becomes the 28th (or 29th in leap years).
3. Offer an explicit "Last day of month" option in the UI as an alternative to picking day 31.
4. Test with: February (28/29), months with 30 days, months with 31 days, leap years, and December-to-January year boundary.
5. Use `date-fns/setDate` cautiously -- it also overflows. Use `date-fns/lastDayOfMonth` to clamp.

**Phase:** Recurring Transactions. Must be in the scheduling algorithm from the start.

**Confidence:** HIGH -- this is a universally documented edge case. See [Firefly III Issue #5830](https://github.com/firefly-iii/firefly-iii/issues/5830) and [Green Dot - Recurring Transfer Scheduling](https://www.greendot.com/helpcenter/add-money/bank-transfer/what-happens-if-i-schedule-a-recurring-transfer-for-a-date-that-doesnt-occur-every-month-like-the-31st).

---

### Pitfall 3: Budget Month Boundaries Disagree with Dashboard Month Boundaries

**Description:** Finora's existing dashboard computes month boundaries with `new Date(now.getFullYear(), now.getMonth(), 1)` through `new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)` (see `dashboard.ts:47-56`). If the budget system computes months differently -- for example, using UTC midnight boundaries while the dashboard uses local time, or using `startOfMonth()` from date-fns which behaves differently -- transactions will appear in one month for budgets and a different month for the dashboard.

**Why it happens:** Two different developers (or the same developer at different times) implement month boundary logic independently. One uses `new Date()` constructors, the other uses `date-fns`, a third uses raw SQL `date_trunc('month', ...)`. Each interprets "January" slightly differently near midnight or timezone boundaries.

**Warning signs:**
- A transaction on Jan 31 at 11:30 PM appears in January on the dashboard but February in the budget
- Monthly totals on dashboard and budget pages don't match for the same month
- Users in non-UTC timezones see different numbers than UTC users

**Prevention:**
1. Extract a single `getMonthBoundaries(year, month, timezone?)` utility function and use it EVERYWHERE -- dashboard, budgets, analytics, recurring generation. Finora already computes month boundaries in `dashboard.ts`; extract and reuse that logic.
2. Since Finora stores dates as `Timestamptz`, be explicit about timezone when truncating. In raw SQL, always use `date_trunc('month', date AT TIME ZONE $userTimezone)` rather than relying on the server's session timezone.
3. Write a test that creates a transaction at 11:59 PM on the last day of the month in a non-UTC timezone, then verifies it appears in the correct month across dashboard, budget, and analytics.
4. If adding user timezone support (stored on User model), ensure all month-boundary queries respect it.

**Phase:** Budgets (but also affects Analytics). Must be resolved before any second system computes month aggregations.

**Confidence:** HIGH -- this is a direct consequence of Finora's existing pattern in `dashboard.ts` not being abstracted. The raw SQL pattern in the dashboard uses bare `monthStart`/`monthEnd` Date objects without timezone qualification.

---

### Pitfall 4: Debt Snowball/Avalanche Algorithm Gets Rounding Wrong Across Multiple Loans

**Description:** When distributing extra payment across multiple loans in a debt payoff strategy, rounding each loan's allocation independently causes the total distributed to not equal the total available. With 5 loans, rounding errors of up to 4 cents accumulate. Over 60+ months of simulation, the final payoff dates drift by 1-2 months from the correct answer.

**Why it happens:** Finora already uses `BigInt(Math.round(value))` for rounding (see `money.ts:28`). But when splitting a payment across multiple loans, rounding each independently: `roundCents(paymentForLoan1) + roundCents(paymentForLoan2) + ... != totalPayment`. The last cent gets lost or doubled.

**Warning signs:**
- Sum of minimum payments across loans plus extra payment does not exactly equal total monthly payment
- Simulation shows a loan paid off but with -1 or +1 cent remaining balance
- Different sort orders of the same loans produce different total interest calculations
- Payoff timeline chart shows jagged final month for last loan

**Prevention:**
1. Use the "largest remainder" method for distributing cents: calculate each loan's share in fractional cents, floor all of them, then distribute remaining cents one-by-one to the loans with the largest fractional remainders.
2. When a loan's calculated payment exceeds its remaining balance, cap it at the balance and redistribute the excess to the next loan in priority order (this is how real snowball/avalanche works).
3. In the simulation loop, always verify: `sum(allPayments) === totalAvailable` at each step. Assert this in tests.
4. Build on Finora's existing `projectPayoff()` function pattern (see `calculations.ts:80-130`) but extend it to accept an array of loans with priority ordering.

**Phase:** Debt Strategies. The multi-loan distribution algorithm is the core complexity.

**Confidence:** HIGH -- Finora's existing single-loan math is correct but the multi-loan extension introduces combinatorial rounding that single-loan code does not face.

---

### Pitfall 5: Recurring Transactions Not Linking to Budgets or Updating Budget Spent Amounts

**Description:** Recurring transactions are generated as regular Transaction rows, but the budget system is not notified. If budgets cache or pre-compute spent amounts, generated recurring transactions silently bypass the budget tracking. Users see their budget says $0 spent on "Rent" even though the recurring transaction generated a $1500 expense.

**Why it happens:** The recurring transaction generator creates rows directly in the transaction table (perhaps via a background job), bypassing the normal `transaction.create` tRPC endpoint and any side effects it triggers (cache invalidation, budget recalculation, notifications).

**Warning signs:**
- Budget "spent" amount lags behind actual transaction totals
- Dashboard monthly summary includes recurring transactions but budget does not
- Users must manually refresh or wait for the budget to "catch up"

**Prevention:**
1. Design budgets to query transaction totals in real-time (the simplest approach). Budget.spent is always `SELECT SUM(amountCents) FROM transaction WHERE date BETWEEN budget_start AND budget_end AND tags overlap budget_tags`. No caching, no stale data.
2. If caching budget totals for performance, ensure the recurring transaction generator invalidates the cache after generation. Use the same code path or event system for both manual and recurring transactions.
3. Test the full flow: create a recurring rule, advance time (or trigger generation), verify the budget "spent" amount reflects the new transaction.
4. Consider whether generated recurring transactions should appear as "pending" (future) or "confirmed" (past). Budget calculations should only include confirmed/past transactions.

**Phase:** Budgets AND Recurring Transactions -- these two features must be designed together even if built in separate phases.

**Confidence:** MEDIUM-HIGH -- this is an integration pitfall between two features, and depends on the budget architecture choice (real-time query vs cached).

---

## Moderate Pitfalls

Mistakes that cause performance issues, technical debt, or degraded user experience.

---

### Pitfall 6: Analytics Queries Bypass Existing Indexes and Become Slow

**Description:** Finora has indexes on `(userId, date)` and `(userId, type, date)` for the transaction table. New analytics queries that GROUP BY tag, GROUP BY month, or filter by amount range may not use these indexes effectively. A query like `SELECT tag.name, SUM(amountCents) FROM transaction JOIN transaction_tag ... WHERE date BETWEEN ... GROUP BY tag.name` performs a sequential scan if the join pattern doesn't match existing indexes.

**Why it happens:** Developers write the analytics query, it works fast with 100 test transactions, and they ship it. At 10,000+ transactions, the query takes 2+ seconds because PostgreSQL chooses a sequential scan over the available indexes.

**Warning signs:**
- Analytics page takes >1 second to load after 6+ months of data
- PostgreSQL `EXPLAIN ANALYZE` shows Seq Scan on transaction table
- Dashboard (which uses raw SQL with proper index hints) is fast, but analytics page is slow
- Prisma query logs show `findMany` with complex `include` taking >500ms

**Prevention:**
1. Plan analytics queries during schema design. Add composite indexes: `(userId, date, type)` already exists. Consider adding `(tagId, transactionId)` on the junction table if tag-based aggregation is common.
2. Use raw SQL (`$queryRaw`) for analytics aggregations, following the pattern already established in `dashboard.ts:85-109`. Prisma's ORM queries are 2-5x slower for complex aggregations (documented in [Prisma Issue #11130](https://github.com/prisma/prisma/issues/11130)).
3. For time-series analytics, use PostgreSQL's `date_trunc('month', date)` in GROUP BY rather than fetching all rows and aggregating in JavaScript (the spending trend endpoint currently does JS-side aggregation -- this won't scale).
4. Add `EXPLAIN ANALYZE` checks to the test suite for critical analytics queries.

**Phase:** Analytics. Raw SQL patterns already exist in the codebase; extend them rather than using ORM for aggregation.

**Confidence:** HIGH -- Finora's existing `getSpendingTrend` endpoint fetches ALL transactions and aggregates in JS (see `dashboard.ts:189-253`). This pattern will not scale for analytics over 12+ months of data.

---

### Pitfall 7: Budget Rollover Creates Compounding Complexity

**Description:** When a user underspends in January ($50 left in "Groceries"), should February's budget be $300 (base) or $350 (base + rollover)? If they overspend in February by $100, does March start at $200 ($300 - $100 debt)? This creates a chain where every month depends on every previous month, making recalculation expensive and error-prone when users edit past transactions.

**Why it happens:** Rollover sounds simple ("just carry the balance forward") but creates temporal dependencies. Editing a January transaction changes January's remaining, which changes February's effective budget, which changes March's, and so on through every subsequent month.

**Warning signs:**
- Editing an old transaction causes visible budget recalculation delay
- Users confused by negative rollover values ("Why does my March budget show -$47?")
- Budget history becomes inconsistent when users retroactively categorize old transactions

**Prevention:**
1. Start WITHOUT rollover. Make it an optional feature added later. The base budget functionality (fixed monthly amounts per category) is valuable on its own and avoids this entire class of problems.
2. If implementing rollover, use a "snapshot" approach: at month-end, store the final remaining amount as a `BudgetPeriod` row with `rolloverCents`. Don't recompute the chain -- snapshot it. This means editing past transactions after month-close does NOT retroactively change subsequent months.
3. If real-time rollover is required, compute it lazily: `currentBudget = baseBudget + (previousMonth.budgetCents - previousMonth.spentCents)`. Cache aggressively and invalidate only the current month's cache when transactions change.
4. Set clear UX expectations: "Rollover is calculated at month-end and does not change retroactively."

**Phase:** Budgets. Make rollover a phase-2 enhancement, not part of the initial budget implementation.

**Confidence:** MEDIUM-HIGH -- see [Actual Budget - How Budgeting Works](https://actualbudget.org/docs/budgeting/) for the complexity this introduces.

---

### Pitfall 8: Tag Renames and Deletions Break Budget History

**Description:** Budgets are defined per-tag ("$500/month for Groceries"). If the user renames "Groceries" to "Food" or deletes the tag and creates a new one, historical budget tracking breaks. The budget references a tag ID that no longer maps to the user's mental model.

**Why it happens:** Finora's current tag system uses soft-delete (`isActive` flag) and allows renaming. But a budget tied to `tagId: "clx..."` doesn't know the tag was renamed. Worse, if the tag is deactivated, the budget still references it but the tag disappears from the UI.

**Warning signs:**
- Budget shows "$0 spent" after user renames a tag (if budget matched by tag name instead of ID)
- Deactivated tag still appears in budget settings but not in transaction forms
- User creates new tag with same name as deleted one; historical budget data doesn't merge

**Prevention:**
1. Always reference tags by ID in budget definitions (never by name). This way renames are transparent.
2. When a tag is deactivated (`isActive: false`), show it in budget views with a visual indicator ("archived") rather than hiding it. The budget still works; transactions with that tag still count.
3. Prevent deleting tags that are referenced by active budgets. Show a warning: "This tag is used by budget 'Monthly Groceries'. Archive it instead?"
4. When displaying budget history, always join to the tag table to get the CURRENT name, so renamed tags show their current name even in historical views.

**Phase:** Budgets. The budget-tag relationship design must account for tag lifecycle from day one.

**Confidence:** HIGH -- this follows directly from Finora's existing `Tag.isActive` pattern and the planned budget-tag relationship.

---

### Pitfall 9: Goal Progress Calculation Inconsistency with Transaction Edits

**Description:** A savings goal tracks progress by summing tagged transactions. User has a "Vacation Fund" goal at 80% ($4,000 of $5,000). They edit an old transaction's amount from $500 to $50 (data entry error). The goal should now show $3,550 (70%), but if progress was cached or snapshot-based, it still shows $4,000.

**Why it happens:** Goals that cache progress or compute progress only on new transactions (increment on create, decrement on delete) get out of sync when transactions are edited. Finora's existing transaction update endpoint (`transaction.ts:241-326`) allows editing amounts and tags, which can silently change goal progress.

**Warning signs:**
- Goal progress percentage doesn't match manual sum of linked transactions
- Editing a transaction doesn't visibly change goal progress
- Goal shows >100% progress after transactions are deleted
- Completing and then editing a transaction below the goal target doesn't "un-complete" the goal

**Prevention:**
1. Compute goal progress as a real-time query: `SELECT SUM(amountCents) FROM transaction WHERE tags include goal_tag AND date BETWEEN goal_start AND goal_end`. No caching, no incremental updates.
2. If caching for performance, invalidate goal progress cache on ANY transaction mutation (create, update, delete) where the transaction's tags intersect with any goal's tracking tags.
3. Handle the "goal completed then un-completed" edge case: don't send "Congratulations!" notifications based on cached state. Verify with a fresh query before triggering completion events.
4. Test: create goal, add transactions to 100%, edit a transaction amount down, verify goal shows < 100%.

**Phase:** Goals. The progress calculation strategy is the core design decision.

**Confidence:** HIGH -- this is a direct consequence of Finora's existing transaction edit capability combined with any form of progress tracking.

---

### Pitfall 10: Export BigInt Serialization Breaks JSON and CSV

**Description:** Finora stores money as `BigInt` and uses superjson for tRPC serialization. But standard `JSON.stringify` throws on BigInt values: `TypeError: Do not know how to serialize a BigInt`. CSV libraries also don't handle BigInt. An export feature that naively serializes transaction data will crash.

**Why it happens:** The existing system works because superjson wraps BigInt. But export features need to produce standard JSON or CSV, not superjson format. The moment you try `JSON.stringify(transactions)` or pass BigInt to a CSV library, it fails.

**Warning signs:**
- Export endpoint returns 500 error on first test
- CSV file contains `[object Object]` or `undefined` instead of amounts
- JSON export produces superjson format (`{"json": ..., "meta": {"values": {"amountCents": ["bigint"]}}}`) that other apps can't read

**Prevention:**
1. Create a dedicated export serializer that converts BigInt cents to Number or String BEFORE passing to JSON.stringify or CSV library. Example: `Number(amountCents)` for values under `Number.MAX_SAFE_INTEGER` (which covers amounts up to $90 trillion -- safe for personal finance).
2. For CSV, format as decimal dollars: `(Number(amountCents) / 100).toFixed(2)`. Users expect `"1234.56"` in CSV, not `"123456"`.
3. For JSON export, decide on format: `{ "amount": 1234.56 }` (human-readable) or `{ "amountCents": 123456 }` (lossless). Document the choice.
4. Test export with the largest plausible values: `BigInt(99999999999)` ($999,999,999.99).

**Phase:** Export. Must be addressed at the serialization layer before any export format is implemented.

**Confidence:** HIGH -- this is a known BigInt limitation in JavaScript and directly impacts Finora's architecture.

---

### Pitfall 11: Export Memory Exhaustion on Large Transaction Histories

**Description:** A user with 3 years of daily transactions (~1,000+ rows) requests a CSV export. Loading all transactions into memory, transforming them, then serializing to CSV can consume 100MB+ of memory in a serverless function with 256MB-1GB limits.

**Why it happens:** The natural approach is: `const transactions = await db.transaction.findMany({ where: { userId } })` followed by CSV conversion. This loads everything into memory at once. Prisma returns fully hydrated objects with nested tag relations, amplifying memory usage.

**Warning signs:**
- Export works in development (small data) but times out or OOMs in production
- Serverless function hits memory limit during export
- Export of 1,000+ transactions takes >10 seconds

**Prevention:**
1. Use cursor-based streaming: fetch 500 transactions at a time (Finora already has cursor-based pagination in `transaction.ts:52-148`), serialize each batch to CSV, and stream to the response. Use Node.js `Readable` streams.
2. For the export query, use a minimal `select` (no nested `include` of tag relations unless needed). If tags are needed, use a single raw SQL query with `string_agg` to get tag names as a comma-separated string in one query.
3. Set a reasonable export limit (e.g., 50,000 transactions) or paginate into multiple files.
4. For PDF export, generate on the server using a lightweight library (e.g., `@react-pdf/renderer` or `pdfkit`), but be aware that PDF generation is even more memory-intensive than CSV.

**Phase:** Export. Streaming architecture must be the design from the start, not retrofitted.

**Confidence:** HIGH -- see [DEV Community - Processing 1 Million SQL Rows to CSV](https://dev.to/danielevilela/processing-1-million-sql-rows-to-csv-using-nodejs-streams-3in2).

---

### Pitfall 12: Timezone-Unaware date_trunc in Analytics Raw SQL

**Description:** When extending Finora's raw SQL pattern for analytics (monthly trends, yearly comparisons), using `date_trunc('month', date)` in PostgreSQL without specifying a timezone truncates in UTC. A transaction at 11 PM EST on January 31 is stored as February 1 04:00 UTC. `date_trunc('month', ...)` in UTC groups it into February, but the user thinks it's a January transaction.

**Why it happens:** Finora's schema correctly uses `Timestamptz`, which stores in UTC. But `date_trunc('month', timestamptz_column)` truncates in the session timezone (usually UTC on servers). Without explicit timezone conversion, the truncation disagrees with the user's local date.

**Warning signs:**
- Users near timezone boundaries (PST, JST) report transactions in the wrong month/week
- Analytics monthly totals differ from dashboard monthly totals by a few transactions
- The discrepancy only appears for transactions created late at night or early morning

**Prevention:**
1. Always use `date_trunc('month', date AT TIME ZONE $userTimezone)` in analytics SQL queries. This converts to the user's local time BEFORE truncating, so January 31 at 11 PM EST stays in January.
2. Add a `timezone` field to the User model (or derive from their browser). Default to UTC if not set.
3. Ensure the existing dashboard queries (which use JavaScript Date month boundaries) and new analytics queries (which use SQL date_trunc) produce identical month groupings by both using the same timezone.
4. Write a test: create a transaction at Jan 31 11:30 PM EST (Feb 1 04:30 UTC), verify it groups into January for a user with timezone "America/New_York".

**Phase:** Analytics (and retroactively affects Budgets if they use SQL aggregation). Must be resolved before any date-grouped analytics ship.

**Confidence:** HIGH -- this is documented in [PostgreSQL official docs](https://www.postgresql.org/docs/current/functions-datetime.html) and [Medium - Timezone with date_trunc](https://medium.com/@ajaymaurya73130/how-to-handle-time-zones-with-date-trunc-in-postgresql-34d4298458b6).

---

### Pitfall 13: Debt Strategy Ignores Minimum Payment Changes When Loans Are Paid Off

**Description:** In snowball/avalanche, when Loan A is paid off, its entire payment ($300/month) redirects to Loan B. But the algorithm must also account for: Loan B's minimum payment may have changed (variable rate), the freed-up $300 must be added ON TOP of Loan B's existing minimum, and if Loan B is nearly paid off, the excess must cascade to Loan C.

**Why it happens:** A naive implementation allocates extra payment to the next loan but forgets to continue the cascade within the same month. It also doesn't handle the case where the freed payment exceeds the next loan's remaining balance.

**Warning signs:**
- After one loan pays off in simulation, the total monthly payment across all loans decreases (money "disappears")
- The last loan takes longer to pay off than expected
- Simulation shows negative balance on a loan (overpayment not redistributed)

**Prevention:**
1. At each simulation step: (a) compute interest for all active loans, (b) apply minimum payments, (c) distribute extra payment to the highest-priority loan, (d) if that loan is now paid off, redistribute the excess to the next loan, (e) repeat until all extra is allocated or all loans are paid off.
2. Keep track of `totalAvailablePayment` at each step and assert it equals `sum(allPaymentsApplied)` -- nothing lost.
3. Test with: 3 loans where extra payment pays off 2 of them in the same month. The cascade must handle multi-loan payoff in a single step.
4. Build on Finora's existing `projectPayoff()` loop pattern but extend to handle a priority queue of loans.

**Phase:** Debt Strategies. The cascade logic is the most subtle part of the algorithm.

**Confidence:** HIGH -- this is the core algorithmic challenge. See [Ramsey Solutions - Debt Snowball vs Avalanche](https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche) for the conceptual model.

---

## Minor Pitfalls

Mistakes that cause polish issues, confusion, or minor data quality problems.

---

### Pitfall 14: CSV Encoding Issues with Currency Symbols

**Description:** Finora supports multiple currency symbols including non-ASCII characters (pounds sign, euro sign, yen sign, rupee sign, won sign -- see `format.ts:53-64`). A CSV export that doesn't explicitly set UTF-8 encoding with BOM produces garbled characters when opened in Excel on Windows.

**Why it happens:** Excel on Windows defaults to the system's ANSI encoding (often Windows-1252) when opening CSV files. Without a UTF-8 BOM (byte order mark), non-ASCII currency symbols like the pound sign or rupee sign appear as mojibake.

**Warning signs:**
- Currency symbols display correctly in the app but appear as "Â£" or "â\u201A¹" in exported CSV
- Users on macOS don't see the issue (macOS defaults to UTF-8)
- The CSV looks correct when opened in a text editor but not in Excel

**Prevention:**
1. Prepend the UTF-8 BOM (`\xEF\xBB\xBF`) to CSV output. This tells Excel to use UTF-8 decoding.
2. Set the Content-Type header to `text/csv; charset=utf-8` on the export response.
3. Consider offering an option to export amounts as plain numbers without currency symbols, with the symbol noted in a header row.
4. Test export with every supported currency symbol from `CURRENCY_SYMBOLS` in `format.ts`.

**Phase:** Export. A one-line fix (BOM prefix) but easy to miss.

**Confidence:** HIGH -- this is a well-known CSV/Excel interoperability issue.

---

### Pitfall 15: Recurring Transaction UI Doesn't Show "Upcoming" Preview

**Description:** Users create a recurring rule but have no way to see what transactions will be generated in the future. They wonder: "Did I set this up correctly? When's the next one?" Without a preview, users create the rule, wait a month, and discover it was wrong.

**Why it happens:** Developers focus on the generation engine and forget the user needs visibility into what will happen, not just what has happened. The recurrence rule is opaque.

**Warning signs:**
- Support tickets: "When will my next recurring transaction be created?"
- Users creating duplicate recurring rules because they're unsure the first one worked
- Users not discovering errors in their recurrence until a month later

**Prevention:**
1. Show "Next 3 upcoming" preview when creating/editing a recurring transaction rule. Compute these client-side from the recurrence pattern -- no server round-trip needed.
2. Display `nextDueDate` prominently on the recurring transaction list.
3. Consider a "calendar view" or "upcoming" section on the dashboard that shows the next 7-14 days of expected recurring transactions.
4. Allow users to manually trigger generation for the current period ("Generate now") for immediate verification.

**Phase:** Recurring Transactions. A UX design decision, not a backend concern, but must be planned upfront.

**Confidence:** MEDIUM -- this is a UX recommendation based on common user feedback patterns in personal finance apps. See [YNAB - Scheduled Transactions Guide](https://support.ynab.com/en_us/scheduled-transactions-a-guide-BygrAIFA9).

---

### Pitfall 16: Goal Deadline Creates Anxiety Instead of Motivation

**Description:** A savings goal with a deadline that's now past-due (user fell behind) shows as "OVERDUE" or "FAILED" in red. This demotivates users instead of helping them. Similarly, a goal at 95% with 1 day remaining feels like failure even though the user made great progress.

**Why it happens:** Developers implement deadlines as hard cutoffs: `if (now > deadline && progress < 100%) status = "failed"`. This is technically correct but psychologically harmful.

**Warning signs:**
- Users delete goals that are past deadline rather than completing them
- Users stop using the goals feature after one "failed" goal
- App feels judgmental rather than supportive

**Prevention:**
1. Never use the word "failed." Use "past target date" with an option to extend.
2. Show progress achieved, not just progress remaining: "You saved $4,500 of $5,000 -- 90% there!"
3. When a deadline passes, offer to extend it rather than marking it as expired.
4. Allow goals without deadlines (open-ended savings goals).
5. Consider "pace" indicators: "You're saving $X/month. At this rate, you'll reach your goal by [date]."

**Phase:** Goals. A UX design concern that affects the schema (deadline should be nullable, not required).

**Confidence:** MEDIUM -- based on personal finance app UX research and behavioral psychology principles.

---

### Pitfall 17: Spending Trend Analytics Re-Fetches All Data on Every Granularity Toggle

**Description:** Finora's existing `getSpendingTrend` endpoint accepts `granularity` (weekly/daily) and `months` as params. Toggling between weekly and daily re-fetches all data from the server. For analytics with more granularity options (monthly, weekly, daily) and longer time ranges (12+ months), each toggle triggers a full re-fetch.

**Why it happens:** The current endpoint (see `dashboard.ts:178-256`) fetches all transactions in the range and aggregates in JavaScript. There's no server-side caching, and the client doesn't cache between granularity switches.

**Warning signs:**
- Visible loading spinner every time user toggles granularity
- Same data fetched multiple times (daily -> weekly -> daily)
- Analytics page feels sluggish compared to dashboard

**Prevention:**
1. Fetch raw data once (at the finest granularity needed), then aggregate client-side for coarser views. If you have daily data, you can compute weekly and monthly without re-fetching.
2. Alternatively, move aggregation to SQL (much faster for large datasets) and use tRPC's query caching (React Query) to cache each granularity independently.
3. For analytics specifically, consider pre-aggregated materialized views or summary tables that update periodically, rather than computing from raw transactions every time.
4. Use React Query's `keepPreviousData` option to show stale data while fresh data loads.

**Phase:** Analytics. The data fetching strategy affects performance at scale.

**Confidence:** MEDIUM-HIGH -- this is a direct observation from the existing codebase pattern that will be amplified by analytics requirements.

---

## Phase-Specific Warnings Summary

| Phase | Pitfall # | Risk | Key Mitigation |
|-------|-----------|------|----------------|
| **Recurring Transactions** | #1 | CRITICAL | Idempotent generation with unique constraint and nextDueDate |
| **Recurring Transactions** | #2 | CRITICAL | Clamp day-of-month to month length; test Feb/Apr/Jun/Sep/Nov |
| **Recurring Transactions** | #5 | CRITICAL | Design budget interaction before building; real-time query or event-driven cache |
| **Recurring Transactions** | #15 | MINOR | Show "upcoming" preview in creation UI |
| **Budgets** | #3 | CRITICAL | Extract shared month-boundary utility from dashboard; use everywhere |
| **Budgets** | #7 | MODERATE | Ship without rollover first; add as optional enhancement |
| **Budgets** | #8 | MODERATE | Reference tags by ID; prevent deleting tags used by active budgets |
| **Debt Strategies** | #4 | CRITICAL | Largest-remainder distribution; verify sum equals total at each step |
| **Debt Strategies** | #13 | MODERATE | Cascade freed payments within same month; test multi-loan payoff |
| **Goals** | #9 | MODERATE | Real-time progress queries; invalidate on any transaction mutation |
| **Goals** | #16 | MINOR | Nullable deadlines; never use "failed"; show positive progress |
| **Analytics** | #6 | MODERATE | Raw SQL for aggregation; add composite indexes; EXPLAIN ANALYZE |
| **Analytics** | #12 | MODERATE | Always use AT TIME ZONE in date_trunc; add user timezone |
| **Analytics** | #17 | MINOR | Fetch once at finest granularity; aggregate client-side |
| **Export** | #10 | MODERATE | Convert BigInt to Number before serialization; format as decimal dollars |
| **Export** | #11 | MODERATE | Stream with cursor-based pagination; minimal select |
| **Export** | #14 | MINOR | UTF-8 BOM prefix for Excel compatibility |

---

## Cross-Feature Integration Pitfalls

These pitfalls emerge from the interaction between v2 features:

1. **Recurring + Budgets:** Generated transactions must be visible to budget calculations immediately. Design the generation pipeline to invalidate budget caches or use real-time queries.

2. **Budgets + Analytics:** Both compute monthly aggregations. If they use different methods (Prisma ORM vs raw SQL, different timezone handling), totals will disagree. Extract shared utilities.

3. **Debt Strategies + Goals:** A "debt freedom" goal's progress depends on the debt strategy simulation. If the user changes their strategy (snowball to avalanche), the goal timeline changes. Decide whether goals track actual payments or projected payments.

4. **Analytics + Export:** Export is essentially "analytics but as a file." Reuse the same queries and aggregation logic. Don't build export as a separate data pipeline.

5. **Recurring + Goals:** Can recurring deposits count toward goals? If a user has a recurring $200/month "Vacation Fund" transfer, the goal should see it. This requires the recurring transaction to be tagged with the goal's tag.

---

## Validation Checklist for v2 Features

### For Recurring Transactions
- [ ] Generating twice for the same period produces NO duplicates
- [ ] 31st of month generates correctly for all 12 months
- [ ] February 29 handled in both leap and non-leap years
- [ ] Pausing and resuming a recurrence skips paused periods
- [ ] Deleting a recurring rule does NOT delete already-generated transactions
- [ ] Generated transactions appear in budgets and dashboard immediately

### For Budgets
- [ ] Budget month boundaries match dashboard month boundaries exactly
- [ ] Editing a transaction updates the relevant budget in real-time
- [ ] Renaming a tag does not break budget tracking
- [ ] Deactivating a tag shows budget as archived, not broken
- [ ] Budget with no transactions for a month shows $0 spent (not missing)

### For Debt Strategies
- [ ] Sum of all loan payments equals total available payment at each simulation step
- [ ] Paying off a loan cascades freed payment to next loan in same month
- [ ] Snowball (smallest balance first) and avalanche (highest rate first) produce different results for test dataset
- [ ] Simulation handles loans with 0% interest
- [ ] Simulation handles case where minimum payments exceed available budget

### For Goals
- [ ] Progress = real-time SUM of linked transactions (no stale cache)
- [ ] Editing a linked transaction updates goal progress
- [ ] Goal can exist without a deadline
- [ ] Past-deadline goal shows graceful messaging, not "FAILED"

### For Analytics
- [ ] Monthly grouping uses user timezone, not UTC
- [ ] Analytics monthly totals match dashboard monthly totals for the same period
- [ ] Analytics page loads in <2 seconds with 12 months of data (1000+ transactions)
- [ ] EXPLAIN ANALYZE shows index usage for all analytics queries

### For Export
- [ ] BigInt amounts serialize correctly (no crashes, no "[object Object]")
- [ ] CSV opened in Excel shows correct currency symbols (UTF-8 BOM)
- [ ] Export of 5,000+ transactions completes without OOM
- [ ] Exported amounts match what the user sees in the app

---

## Sources

**Recurring Transactions:**
- [Traveling Coderman - Idempotent Cron Jobs](https://traveling-coderman.net/code/node-architecture/idempotent-cron-job/)
- [Mercari Engineering - Race Conditions in DB Transactions](https://engineering.mercari.com/en/blog/entry/20241206-the-race-condition-in-multiple-db-transactions-and-the-solutions/)
- [Firefly III - Recurring at End of Month](https://github.com/firefly-iii/firefly-iii/issues/5830)
- [YNAB - Scheduled Transactions Guide](https://support.ynab.com/en_us/scheduled-transactions-a-guide-BygrAIFA9)

**Budgets:**
- [Actual Budget - How Budgeting Works](https://actualbudget.org/docs/budgeting/)

**Debt Strategies:**
- [Ramsey Solutions - Debt Snowball vs Avalanche](https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche)
- [Fidelity - Debt Strategies](https://www.fidelity.com/learning-center/personal-finance/avalanche-snowball-debt)

**Analytics/PostgreSQL:**
- [PostgreSQL - Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [Medium - Timezone with date_trunc](https://medium.com/@ajaymaurya73130/how-to-handle-time-zones-with-date-trunc-in-postgresql-34d4298458b6)
- [Prisma Issue #11130 - findMany vs queryRaw Performance](https://github.com/prisma/prisma/issues/11130)

**Export:**
- [DEV Community - Processing 1M SQL Rows to CSV with Node.js Streams](https://dev.to/danielevilela/processing-1-million-sql-rows-to-csv-using-nodejs-streams-3in2)
