# Feature Landscape: Finora v2 Smart Finance Features

**Domain:** Personal finance app -- recurring transactions, budgets, debt strategies, goals, analytics, export
**Researched:** 2026-02-07
**Confidence:** MEDIUM-HIGH (cross-verified across YNAB, Monarch, Goodbudget, Undebt.it, PocketGuard, Beyond Budget docs and multiple market analysis sources)

**Context:** Finora v1 is complete with transaction CRUD, tags, loans, dashboard, amortization, what-if simulator, and onboarding. This research covers the six v2 feature areas: recurring transactions, budgets, debt strategies, goals, analytics, and export.

---

## 1. Recurring Transactions

How apps handle scheduled, repeating transactions.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Create recurring transaction template | Users need to define what recurs (amount, type, tags, description) | Low | Transaction model (exists) |
| Frequency selection: daily, weekly, biweekly, monthly, yearly | These are the universal scheduling intervals every app offers. Biweekly is critical for paycheck-aligned schedules | Low | New RecurringTransaction model |
| Start date | Users need to say when the recurrence begins | Low | Date field on template |
| Optional end date | Some recurring items are temporary (12-month subscription, seasonal payment) | Low | Nullable date field |
| Auto-generation of transactions | The whole point: reduce manual entry. Apps that only "remind" see 40% lower retention vs auto-generate per 2025 market data | Medium | Cron/trigger to create Transaction rows from templates |
| List of active recurring transactions | Users need to see and manage all their recurring items | Low | Query + list UI |
| Edit template (future occurrences) | "My rent went up" -- users need to update the template going forward | Low | Update template fields |
| Delete/deactivate template | Stop recurring without deleting history | Low | isActive flag or soft delete |
| Recurring indicator on generated transactions | Users need to distinguish auto-generated from manual transactions in their list | Low | `recurringTransactionId` FK on Transaction |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Skip individual occurrence | "I'm not paying gym this month" -- skip without deleting the whole series | Medium | Need occurrence-level state tracking, not just template-level |
| Modify single occurrence | Change amount for one instance (variable utility bill) without changing the template | Medium | Generated transaction is editable; severed from template values but keeps FK reference |
| Upcoming recurring preview | Show next 7-30 days of expected recurring transactions on dashboard or transactions page | Low | Calculate next occurrences from template frequency |
| Auto-tag inheritance | Generated transactions inherit tags from template -- critical since Finora uses tags as categories | Low | Copy tag associations from template to generated transaction |
| Monthly recurring cost summary | "Your recurring expenses total $X/month" -- powerful insight that most manual-entry apps lack | Low | Sum all active recurring templates normalized to monthly |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| AI-based recurring detection from transaction history | Requires pattern matching, false positives frustrate users, massive scope creep | Let users explicitly define recurring transactions. Detection is a v3+ feature |
| Bank sync for automatic recurring detection | Out of scope per PROJECT.md. Plaid complexity, privacy concerns | Manual template creation with fast UX |
| Reminder-only approach (no auto-generation) | Market data shows auto-generate has 40% higher retention. Reminders without action create notification fatigue | Auto-generate transactions, show them as "pending" or "upcoming" if desired |
| Complex recurrence rules (every 3rd Tuesday, last business day) | Edge cases explode complexity. Covers <5% of use cases | Stick to simple intervals: daily, weekly, biweekly, monthly, yearly. Users can manually adjust outliers |

---

## 2. Budgets

Monthly spending limits per category/tag with progress tracking.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Set monthly budget limit per tag | Core budgeting concept -- "I want to spend max $500 on dining" | Low | New Budget model linking to Tag |
| Budget progress bar (spent vs limit) | Visual feedback is the whole point. Every budget app shows this | Low | Aggregate transactions by tag for current month |
| Over-budget visual indicator | Clear red/warning when limit is exceeded | Low | UI conditional styling |
| Budget list view showing all tag budgets | Users need to see all budgets at a glance with progress | Low | Grid/list of budget cards |
| Edit budget amount | Adjust mid-month or for next month | Low | Update limit field |
| Delete budget | Remove budget without affecting tag or transactions | Low | Delete Budget row |
| Current month spending auto-calculation | Budget progress must update automatically as transactions are added | Medium | Real-time query of transactions for budget period |
| Budget period: monthly | Monthly is the universal standard. Every budget app defaults to monthly | Low | Month-boundary date logic |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Rollover vs reset option per budget | PocketGuard and Goodbudget both offer this. Underspend $50 on groceries? Rollover adds it to next month. Reset starts fresh. Per-budget choice is powerful | Medium | Track rollover amount, calculate adjusted limit for current month |
| Budget warning thresholds (75%, 90%, 100%) | Progressive alerts: "You've used 75% of your dining budget" before you overspend. Research shows 75/90/100% is optimal threshold set | Low | Percentage calculation, UI banner/badge |
| Overall monthly budget summary | "Total budgeted: $3,000 / Total spent: $2,400" across all tags | Low | Sum all budget limits and spending |
| Unbudgeted spending tracking | Show spending on tags that have no budget set -- reveals gaps | Low | Transactions on tags without Budget rows |
| Monthly budget history | See how you performed against budgets in previous months | Medium | Store or calculate historical budget vs actual per month |
| Budget copy to next month | Auto-create next month's budgets from current month's template | Low | Copy current Budget rows with new month period |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Zero-based budgeting (assign every dollar) | YNAB's approach, but extremely opinionated and alienates casual users. Finora is a tracker with budgets, not a budgeting-first app | Simple per-tag limits. Users set budgets only for categories they want to watch |
| Weekly/custom budget periods | Adds period logic complexity. Monthly covers 95%+ of use cases | Monthly only. Simplify the model and UI |
| Push notifications for budget alerts | Requires notification infrastructure (service workers, email service). PROJECT.md lists smart alerts as v3+ | In-app visual indicators on budget cards and dashboard. No push notifications |
| Income allocation / envelope stuffing | Envelope budgeting is a different paradigm. Finora separates income tracking from budget limits | Budgets are spending limits per tag, period. Income goals are in the Goals feature |
| Automatic budget suggestions based on spending history | AI/ML scope creep. Unreliable for small datasets | Users set their own limits. Show last month's spending as a reference hint when creating a budget |

---

## 3. Debt Strategies

Optimizing payoff across multiple loans using snowball, avalanche, or other methods.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Snowball strategy (smallest balance first) | The most psychologically motivating method. Dave Ramsey's approach. Users expect this option | Medium | Sort loans by balance, allocate extra payment to smallest |
| Avalanche strategy (highest interest rate first) | Mathematically optimal -- saves the most money on interest. Users expect both options | Medium | Sort loans by rate, allocate extra payment to highest rate |
| Strategy comparison view | "Snowball pays off in X months, costs $Y interest. Avalanche: X months, $Y interest." Users want to see the difference before choosing | Medium | Run both calculations, display side-by-side |
| Extra monthly payment input | "I have $200/month extra to put toward debt" -- the driver of accelerated payoff | Low | Single input field feeding into strategy calculations |
| Payment allocation table | Show exactly how much goes to each loan each month under the chosen strategy | High | Month-by-month allocation schedule across all loans |
| Debt-free date | "You'll be debt-free by [date]" -- the headline metric | Low | End date of strategy calculation |
| Total interest comparison | Show total interest paid under each strategy vs minimum payments only | Medium | Three-way comparison: minimum-only, snowball, avalanche |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Hybrid strategy | Undebt.it offers this: balance psychology of snowball with interest savings of avalanche. Target debts that score highest on a combined metric | High | Custom scoring formula (balance weight + rate weight) |
| Highest monthly payment strategy | Pay off loans with highest monthly payment first to free up cash flow fastest | Low | Sort by monthlyPaymentCents, same allocation logic |
| Custom priority ordering | Let users drag-and-drop loans into their preferred payoff order | Medium | Custom sort order stored per user, allocation follows that order |
| Snowflake payments (one-off extras) | "I got a bonus, throw $500 at my highest-rate loan" -- one-time extra on top of the strategy | Medium | One-off payment allocation to strategy-determined target loan |
| Visual payoff timeline chart | Stacked area chart showing all loan balances declining over time under chosen strategy | High | Multi-loan amortization calculation, Recharts stacked area chart |
| Interest saved counter | "This strategy saves you $X,XXX compared to minimum payments" -- motivational | Low | Difference between minimum-only total interest and strategy total interest |
| Monthly payment schedule export | Download the month-by-month allocation plan as CSV | Low | Generate CSV from strategy calculation |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Automatic payment execution | Finora does not connect to banks or lenders. It is a calculator/planner, not a payment processor | Show the recommended allocation. User makes payments themselves and records them |
| Debt consolidation calculator | Different financial product entirely. Adds scope without core value | Link to external resources if users ask. Out of scope |
| Credit score impact predictions | Requires credit bureau data. Different product domain | Focus on what Finora knows: loan balances, rates, and payoff timelines |
| More than 4-5 strategy options | Undebt.it has 8, but most are niche. Diminishing returns past snowball, avalanche, and hybrid | Offer snowball, avalanche, and custom priority. Optionally add hybrid later |
| AI-recommended strategy | Requires understanding user psychology. Too opinionated for a tool. And often wrong | Show clear comparison data. Let user decide. Data empowers, prescriptions alienate |

---

## 4. Goals

Savings targets and income targets with progress tracking.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Create savings goal with target amount | "I want to save $5,000 for vacation" -- the basic goal definition | Low | New Goal model with targetAmountCents |
| Optional target date / deadline | "I want $5,000 by December" -- adds urgency and progress pacing | Low | Nullable date field |
| Progress bar (current vs target) | Visual progress is the motivational core. Every goal-tracking app shows this | Low | currentAmountCents / targetAmountCents percentage |
| Manual contribution logging | "I put $200 toward my vacation fund today" -- explicit progress tracking | Low | GoalContribution model or link to Transaction |
| Goal list view | See all goals with names, targets, progress, and deadlines | Low | Query + card grid |
| Edit goal (amount, date, name) | Goals evolve -- "Actually I need $6,000" | Low | Update fields |
| Delete / archive goal | Complete or abandon a goal | Low | Soft delete or status field |
| Income target with monthly period | "I want to earn $5,000/month" -- different from savings. Resets each month | Medium | GoalType enum (SAVINGS vs INCOME), monthly aggregation |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Tag-linked auto-tracking for savings | Link a savings goal to a tag (e.g., "Vacation Fund"). Every INCOME transaction tagged "Vacation Fund" automatically counts as progress | Medium | Join Goal to Tag, aggregate tagged income transactions toward goal |
| Tag-linked auto-tracking for income | Link income target to tag. Income transactions with that tag count toward monthly target | Medium | Same mechanism, but filtered to current month and INCOME type |
| Projected completion date | "At your current pace, you'll reach this goal by [date]" -- based on average monthly contributions | Medium | Calculate average contribution rate, project forward |
| Monthly contribution needed | "To reach $5,000 by December, save $625/month" -- reverse calculation from target and deadline | Low | (targetAmount - currentAmount) / monthsRemaining |
| Goal milestone celebrations | "You're 50% there!" -- visual celebration at 25%, 50%, 75%, 100% | Low | Threshold check on contribution, confetti/badge UI |
| Goal history / contribution log | See all contributions to a goal over time as a list | Low | Query GoalContributions or linked transactions |
| Multiple goal types | Savings goal, income target, debt payoff goal (linked to loans) | Medium | GoalType enum with different tracking logic per type |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Automatic savings transfers | Requires bank integration. Out of scope | Manual contributions or tag-linked auto-tracking from transactions |
| Goal-based budget allocation (envelope style) | Blurs the line between goals and budgets. Finora keeps these separate per PROJECT.md | Goals track progress toward a target. Budgets limit spending. Different concerns |
| Investment/retirement goals | Different domain requiring portfolio projections, market returns, tax implications | Out of scope. Finora tracks cash flow, not investments |
| Shared goals (family/partner) | Multi-user complexity. Single-user app | Out of scope per PROJECT.md |
| Round-up savings | Requires bank sync to detect purchase amounts and round up | Manual entry or tag-linked tracking |
| Spending reduction goals | "Spend less than $X on dining" -- this is a budget, not a goal | Use budgets for spending limits. Goals are for accumulation targets (savings, income) |

---

## 5. Analytics

Deep pattern analysis differentiated from the dashboard snapshot.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Customizable time range selector | Dashboard shows current month. Analytics must let users pick any range: last 3 months, 6 months, year, custom dates | Medium | Date range picker driving all analytics queries |
| Spending by tag over time | "How has my dining spending changed month over month?" -- bar or line chart per tag | Medium | Aggregate transactions by tag and month within selected range |
| Income vs expenses over time | Cash flow trend: stacked bar chart showing income and expense bars per month | Medium | Monthly aggregation of income/expense within range |
| Net income trend | Line chart showing net (income - expenses) over time. Reveals whether user is trending positive or negative | Low | Derived from income vs expenses data |
| Top spending categories for period | "In the last 6 months, my top expenses were: Rent, Groceries, Dining" -- ranked list | Low | Aggregate by tag, sort by total, for selected period |
| Period total summary | Total income, total expenses, net for the selected time range | Low | Sum aggregations for selected period |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Month-over-month comparison | "January vs February" side-by-side. Monarch offers this and it is highly valued | Medium | Two-period aggregation with comparison display |
| Average monthly spending by tag | "On average you spend $340/month on groceries" -- normalizes seasonal variation | Low | Total for period / number of months in period |
| Spending trend direction indicators | Up/down arrows or percentage change badges: "Dining: +15% vs last period" | Low | Compare current period total to previous equivalent period |
| Tag spending heatmap or sparklines | Small inline charts on the tag list showing 6-month trend per tag at a glance | Medium | Mini Recharts sparkline per tag row |
| Savings rate calculation | "(Income - Expenses) / Income = X%" -- the single most important financial health metric | Low | Derived from existing aggregations |
| Budget vs actual overlay | On analytics charts, overlay budget limits as reference lines so users can see performance against budgets | Medium | Requires Budgets feature to be built first |
| Largest transactions in period | "Your biggest expenses were: $2,400 Rent, $800 Car Payment" -- highlights outliers | Low | Sort transactions by amount, show top N |
| Day-of-week spending pattern | "You spend the most on Saturdays" -- reveals behavioral patterns | Medium | Aggregate by day of week, visualize as bar chart |
| Recurring vs one-time breakdown | "60% of your expenses are recurring, 40% are one-time" -- shows spending flexibility | Low | Requires Recurring Transactions feature; filter by recurringTransactionId presence |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Predictive spending forecasts | ML-based predictions require large datasets and are often wrong for individuals. Creates false confidence | Show trends and averages. Let users draw their own conclusions |
| Net worth tracking | Requires asset modeling (bank balances, investments, property values) beyond transaction data | Out of scope. Finora tracks cash flow, not net worth |
| Financial health scores | Arbitrary scoring systems that oversimplify complex situations. Different methodologies give different scores | Show concrete metrics: savings rate, spending trends, budget adherence. No composite score |
| Comparison to peers / averages | "You spend more than average on dining" -- requires external data, feels judgmental, often inaccurate | Compare to user's own history only. "You spent 15% more on dining than last month" |
| Real-time analytics updates | WebSocket/SSE for live-updating charts as transactions are added | Standard query-on-load with refresh button. Real-time adds complexity without meaningful value for a personal finance app |

---

## 6. Export

Data export for spreadsheets, advisors, and archiving.

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Export transactions to CSV | Universal expectation. Users want their data in spreadsheets for custom analysis or record-keeping | Medium | Server-side CSV generation from transaction query |
| CSV columns: date, type, amount, description, tags | These are the minimum useful columns. Beyond Budget and others confirm this set | Low | Map Transaction fields to CSV columns |
| Filter-aware export (export what you're looking at) | If user has filtered to "last 3 months, dining tag only", export should respect those filters | Medium | Pass current filter state to export endpoint |
| Export loan amortization schedule to PDF | Per PROJECT.md constraint: server-side PDF generation of the amortization table | High | PDF generation library on server, amortization calculation |

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Customizable CSV columns | Let user choose which columns to include (e.g., exclude description, add tag colors) | Medium | Column selection UI, dynamic CSV builder |
| Budget summary export (CSV) | Export budget vs actual for a period: tag name, budget limit, actual spent, remaining, over/under | Low | Requires Budgets feature; aggregate and format as CSV |
| Goal progress export | Export goals with current progress, target, deadline, completion percentage | Low | Requires Goals feature; format as CSV |
| PDF transaction summary report | Formatted PDF with totals, charts, and transaction table for a period -- shareable with financial advisor | High | PDF generation with embedded charts or table formatting |
| Debt strategy export (CSV) | Export the month-by-month payment allocation plan from debt strategies | Low | Requires Debt Strategies feature; serialize calculation to CSV |
| Date range in filename | Downloaded file named `finora-transactions-2026-01-01-to-2026-01-31.csv` -- helps users organize exports | Low | Dynamic filename generation |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Import from other apps | CSV import is a massive scope trap: different formats, encoding issues, column mapping, duplicate detection, error handling | Focus on export. Users enter data in Finora directly |
| Automatic scheduled exports | Requires email service or cloud storage integration | Manual download on demand |
| Excel format (.xlsx) | Requires additional library (xlsx/exceljs). CSV opens in Excel perfectly fine | CSV covers the use case. XLSX adds dependency without meaningful benefit |
| Cloud backup/sync (Google Drive, Dropbox) | Third-party integration complexity. Storage provider dependency | Export files download to user's device. They manage their own backups |
| QIF/OFX financial formats | Legacy banking formats. Minimal user demand for a manual-entry app | CSV and PDF cover all practical needs |

---

## Feature Dependencies (v2)

```
EXISTING (v1 foundation):
  Transaction CRUD -----> Tags CRUD
  Loan CRUD ------------> Loan Payments
  Dashboard ------------> Monthly Summary, Pie Chart, Spending Timeline, Loan Overview

NEW (v2 features):

1. Recurring Transactions
   Depends on: Transaction model (exists), Tag model (exists)
   Creates: RecurringTransaction model
   Affects: Transaction list (recurring indicator), Dashboard (upcoming preview)

2. Budgets
   Depends on: Tag model (exists), Transaction query (exists)
   Creates: Budget model
   Affects: Dashboard (budget summary widget), Analytics (budget vs actual overlay)

3. Debt Strategies
   Depends on: Loan model (exists), Loan calculations (exist in calculations.ts)
   Creates: DebtStrategy model (optional -- could be stateless calculation)
   Affects: Loan overview page, Dashboard (debt-free date)

4. Goals
   Depends on: Tag model (for auto-tracking), Transaction model (for tag-linked tracking)
   Creates: Goal model, GoalContribution model (optional)
   Affects: Dashboard (goal progress widget), Goals page

5. Analytics
   Depends on: Transaction model (exists), Tags (exists)
   Enhanced by: Budgets (budget vs actual overlay), Recurring Transactions (recurring vs one-time breakdown)
   Creates: Analytics page with charts (no new models, purely query/visualization)

6. Export
   Depends on: Transaction model (exists), Loan calculations (exists)
   Enhanced by: Budgets (budget export), Goals (goal export), Debt Strategies (strategy export)
   Creates: Export API endpoints, PDF generation

DEPENDENCY GRAPH:
  Recurring Transactions: independent (builds on v1)
  Budgets: independent (builds on v1)
  Goals: independent (builds on v1, enhanced by tag-linking)
  Debt Strategies: independent (builds on v1 loan calculations)
  Analytics: benefits from Budgets and Recurring being done first
  Export: benefits from ALL other features being done first
```

## Phase Ordering Recommendation

Based on dependencies, complexity, and user value:

1. **Recurring Transactions first** -- Reduces daily friction, touches the Transaction model that everything else depends on. Relatively contained scope.
2. **Budgets second** -- High user value, builds on existing tag+transaction foundation. Adds data that Analytics can use later.
3. **Goals third** -- Independent feature, tag-linking mechanism parallels budget-tag connection. Moderate complexity.
4. **Debt Strategies fourth** -- Builds on existing loan calculations. Complex but self-contained in the loans domain.
5. **Analytics fifth** -- Benefits from having Budgets (for overlay) and Recurring (for breakdown) already built. Purely query/visualization, no new data models.
6. **Export last** -- Can export data from ALL features. Most valuable when everything else exists. Server-side PDF is the complexity spike.

---

## Competitive Landscape (v2 Features)

| Feature | YNAB | Monarch | Goodbudget | PocketGuard | Undebt.it | Finora v2 |
|---------|------|---------|------------|-------------|-----------|-----------|
| Recurring Transactions | Yes (scheduled) | Yes (detected) | Yes (scheduled fills) | Yes (detected) | No | Yes (auto-generate from template) |
| Budget per category | Yes (zero-based) | Yes (flex + category) | Yes (envelope) | Yes (limits) | No | Yes (per-tag limits) |
| Budget rollover | Implicit (envelope) | No | Yes (configurable) | Yes | No | Yes (configurable per budget) |
| Debt snowball/avalanche | Basic | No | No | No | Yes (8 methods) | Yes (snowball, avalanche, custom) |
| Strategy comparison | No | No | No | No | Yes | Yes |
| Savings goals | Yes (targets) | Yes | Yes | Yes | No | Yes (with tag-linked auto-tracking) |
| Income targets | Implicit | No | No | No | No | Yes (explicit monthly targets) |
| Analytics time ranges | Limited | Yes | Basic | Yes | No | Yes (custom ranges) |
| Period comparison | No | Yes (MoM) | No | No | No | Yes (MoM) |
| CSV export | Yes | Yes | Yes | Yes | No | Yes |
| PDF export | No | No | No | No | No | Yes (amortization) |

**Finora's v2 differentiators:**
- Combined expense tracking + loan management + debt strategies in one app (most apps are one or the other)
- Tag-linked auto-tracking for goals (unique: transactions automatically count toward goals)
- Explicit income targets (most apps focus on savings goals only)
- Configurable rollover per budget (not all-or-nothing)
- Manual-entry-first approach with no bank sync requirement

## Sources

**Recurring Transactions:**
- [YNAB Scheduled Transactions Guide](https://support.ynab.com/en_us/scheduled-transactions-a-guide-BygrAIFA9)
- [Goodbudget Scheduled Fills and Payments](https://goodbudget.com/help/budgeting-with-goodbudget/how-to-schedule/)
- [Quicken Simplifi Recurring Transactions](https://support.simplifi.quicken.com/en/articles/3625912-managing-recurring-transactions)
- [Bountisphere 2025 Personal Finance App Review](https://bountisphere.com/blog/personal-finance-apps-2025-review)

**Budgets:**
- [Monarch Money Budgeting Features](https://www.monarch.com/features/budgeting)
- [Monarch Flex Budgeting](https://help.monarch.com/hc/en-us/articles/32125337244052-Using-Flex-Budgeting)
- [PocketGuard Rollover Budget Feature](https://help.pocketguard.com/hc/en-us/articles/16287882423836-Rollover-budget-feature)
- [PocketSmith Rollover Budgeting](https://www.pocketsmith.com/blog/rollover-budgeting-in-pocketsmith-now-in-beta/)
- [Goodbudget Envelope Refilling and Rollover](https://goodbudget.com/help/budgeting-with-goodbudget/refill-each-period/)
- [NerdWallet Best Budget Apps 2026](https://www.nerdwallet.com/finance/learn/best-budget-apps)
- [Gamified Budget Notifications UX Study](https://medium.com/@ziyingq/how-gamified-budget-notifications-can-curb-overspending-a-ux-case-study-932750b9ee90)

**Debt Strategies:**
- [Undebt.it 7 Payoff Plans](https://undebt.it/blog/undebt-it-payoff-plans/)
- [Undebt.it Custom Payoff Methods](https://undebt.it/blog/using-custom-debt-snowball-payoff-methods/)
- [Undebt.it Hybrid Method](https://undebt.it/blog/new-payoff-method-debt-to-interest-ratio/)
- [Fidelity Snowball vs Avalanche](https://www.fidelity.com/learning-center/personal-finance/avalanche-snowball-debt)
- [National Debt Relief Best Snowball Apps 2025](https://www.nationaldebtrelief.com/blog/financial-wellness/budgeting/top-5-best-apps-for-debt-snowball-method-in-2025/)
- [Bountisphere Best Debt Payoff Calculators 2025](https://bountisphere.com/blog/best-debt-payoff-calculators-2025)

**Goals:**
- [Monarch Money Goal Setting](https://www.monarch.com/)
- [Quicken Simplifi Savings Goals](https://www.quicken.com/products/simplifi/)
- [PocketGuard Savings Goals Tracking](https://pocketguard.com/savings-goals/)
- [Timely Bills Goal Tracker](https://www.timelybills.app/goal-tracker)
- [CNBC Best Tools for 2026 Financial Goals](https://www.cnbc.com/select/best-money-tips-to-help-reach-2026-financial-goals/)

**Analytics:**
- [Personal Finance Apps User Expectations 2025](https://www.wildnetedge.com/blogs/personal-finance-apps-what-users-expect-in-2025)
- [Syncfusion Financial Charts Visualization](https://www.syncfusion.com/blogs/post/financial-charts-visualization)
- [Copilot Money Analytics Features](https://www.copilot.money/)
- [Bountisphere State of Personal Finance Apps 2025](https://bountisphere.com/blog/personal-finance-apps-2025-review)

**Export:**
- [Beyond Budget CSV/PDF Export](https://www.beyondbudgetapp.com/transactions/csv-pdf-export)
- [Beyond Budget Data Export](https://www.beyondbudgetapp.com/user-account/exporting-your-data)
- [Lunch Money Import/Export](https://lunchmoney.app/features/import-transactions/)

---
*Confidence: MEDIUM-HIGH. Feature expectations verified across 6+ apps and multiple market analysis sources. Implementation details for Finora are recommendations based on patterns observed, not copied from any single source. Debt strategy calculations are well-documented mathematical formulas with HIGH confidence. Export column expectations are MEDIUM confidence based on fewer sources.*
