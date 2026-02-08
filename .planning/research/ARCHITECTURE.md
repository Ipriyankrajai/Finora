# Architecture Patterns: Finora v2 Feature Integration

**Domain:** Personal finance tracker -- extending existing v1 with recurring transactions, budgets, debt strategies, goals, analytics, export
**Researched:** 2026-02-07
**Confidence:** HIGH (based on direct codebase analysis of all existing patterns)

## Existing Architecture Summary

Before designing v2 integration, here is what exists and must be respected.

### Current Stack

| Layer | Technology | Pattern |
|-------|-----------|---------|
| Database | Prisma v7 + PostgreSQL | Multi-file schema (`schema/auth.prisma`, `schema/finance.prisma`), BigInt cents, `@db.Timestamptz(3)` |
| API | tRPC v11 + superjson | Entity-based routers (`tag`, `transaction`, `loan`, `dashboard`, `user`), `protectedProcedure` auth guard |
| Client Data | TanStack React Query + tRPC proxy | `trpc.*.queryOptions()` pattern, custom hooks per domain (`use-dashboard`, `use-transactions`, `use-loans`) |
| Forms | TanStack Form + Zod | Schema-first validation, `displayToCents()` conversion in mutation handlers |
| Charts | Recharts | Pre-aggregated server data, client renders only |
| Routing | Next.js App Router | `(dashboard)/dashboard/*` route group, Server Components for layout, Client Components for interactive content |

### Current Prisma Models

```
User (auth.prisma)
  -> Tag[] (finance.prisma)
  -> Transaction[] (finance.prisma)
  -> Loan[] (finance.prisma)

Transaction <-> Tag (via TransactionTag join table, many-to-many)
Transaction <- LoanPayment (optional 1:1 link via linkedTransactionId)
Loan -> LoanPayment[] (one-to-many)
```

### Current tRPC Router Structure

```
appRouter
  +-- tag        (list, create, update, delete)
  +-- transaction (list, getById, create, update, delete)
  +-- loan       (list, getById, create, update, delete, addPayment, deletePayment)
  +-- dashboard  (summary, getSpendingTrend, getAmortizationSchedule)
  +-- user       (getSettings, updateProfile, updateCurrency, completeOnboarding)
```

### Established Patterns (MUST follow)

1. **Money as BigInt cents** -- `displayToCents()` for input, `formatCents()` for display, `roundCents()` for calculations
2. **Ownership checks** -- Every query/mutation verifies `userId` matches `ctx.session.user.id`
3. **Entity-based routers** -- One router per domain entity, not per page
4. **Dashboard aggregation** -- Raw SQL via `db.$queryRaw` for complex aggregation, Prisma for simple CRUD
5. **Cursor-based pagination** -- `limit + 1` pattern with `nextCursor`
6. **Zod schemas in separate files** -- `schemas/*.ts` co-located with router definitions
7. **Custom hooks** -- `hooks/use-*.ts` wrapping `trpc.*.queryOptions()` with typed returns
8. **Optimistic updates** -- Mutations use `onMutate`/`onError`/`onSettled` pattern with query cache manipulation
9. **Client/Server split** -- Server Component pages, `*-page-client.tsx` Client Components for interactivity
10. **Soft delete for tags** -- `isActive: false` rather than hard delete; hard delete for transactions and loans

---

## New Prisma Models

### RecurringTransaction (new model in `finance.prisma`)

Represents a template for transactions that should be auto-generated on a schedule.

```prisma
enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

model RecurringTransaction {
  id              String          @id @default(cuid())
  userId          String
  type            TransactionType
  amountCents     BigInt
  description     String?
  frequency       Frequency
  startDate       DateTime        @db.Timestamptz(3)
  endDate         DateTime?       @db.Timestamptz(3)
  nextOccurrence  DateTime        @db.Timestamptz(3)
  isActive        Boolean         @default(true)
  currencyCode    String          @default("USD")
  createdAt       DateTime        @default(now()) @db.Timestamptz(3)
  updatedAt       DateTime        @updatedAt @db.Timestamptz(3)

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags            RecurringTransactionTag[]
  generatedTransactions Transaction[] @relation("GeneratedFrom")

  @@index([userId, isActive, nextOccurrence])
  @@map("recurring_transaction")
}

model RecurringTransactionTag {
  recurringTransactionId String
  tagId                  String
  assignedAt             DateTime @default(now()) @db.Timestamptz(3)

  recurringTransaction RecurringTransaction @relation(fields: [recurringTransactionId], references: [id], onDelete: Cascade)
  tag                  Tag                  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([recurringTransactionId, tagId])
  @@index([tagId])
  @@map("recurring_transaction_tag")
}
```

**Key decisions:**
- `nextOccurrence` field enables efficient query: "what needs generating today?" (`WHERE nextOccurrence <= NOW() AND isActive = true`)
- Separate `RecurringTransactionTag` join table (mirrors `TransactionTag` pattern)
- Link back to generated transactions via optional relation on `Transaction` (add `recurringTransactionId` field)
- `endDate` is optional -- recurring can be indefinite
- Soft delete via `isActive` (matches Tag pattern, allows "pause" semantics)

**Transaction model addition:**
```prisma
// Add to existing Transaction model:
  recurringTransactionId String?
  recurringTransaction   RecurringTransaction? @relation("GeneratedFrom", fields: [recurringTransactionId], references: [id], onDelete: SetNull)
```

Using `onDelete: SetNull` so deleting a recurring template does not delete already-generated transactions.

### Budget (new model in `finance.prisma`)

```prisma
model Budget {
  id           String   @id @default(cuid())
  userId       String
  tagId        String
  limitCents   BigInt
  createdAt    DateTime @default(now()) @db.Timestamptz(3)
  updatedAt    DateTime @updatedAt @db.Timestamptz(3)

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tag          Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([userId, tagId])
  @@index([userId])
  @@map("budget")
}
```

**Key decisions:**
- One budget per tag per user (enforced by `@@unique([userId, tagId])`)
- No `month` field -- budgets are always "current month" limits. The spent amount is calculated dynamically from transactions in the current month with that tag. This avoids month-reset logic in the database.
- `limitCents` uses BigInt cents (existing pattern)
- Budget "progress" (spent vs limit) is a **computed value** from transaction aggregation, not stored

**Why no month column:** Storing monthly snapshots creates complexity (when to create next month's row? what if user changes limit mid-month?). Instead, the budget defines the limit, and spent is always calculated from current-month transactions. Historical budget vs actual can be derived from transaction data.

### Goal (new model in `finance.prisma`)

```prisma
enum GoalType {
  SAVINGS
  INCOME
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

model Goal {
  id               String     @id @default(cuid())
  userId           String
  name             String
  type             GoalType
  targetCents      BigInt
  currentCents     BigInt     @default(0)
  deadline         DateTime?  @db.Timestamptz(3)
  status           GoalStatus @default(ACTIVE)
  currencyCode     String     @default("USD")
  createdAt        DateTime   @default(now()) @db.Timestamptz(3)
  updatedAt        DateTime   @updatedAt @db.Timestamptz(3)

  user             User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  linkedTags       GoalTag[]
  contributions    GoalContribution[]

  @@index([userId, status])
  @@map("goal")
}

model GoalTag {
  goalId     String
  tagId      String
  assignedAt DateTime @default(now()) @db.Timestamptz(3)

  goal       Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([goalId, tagId])
  @@index([tagId])
  @@map("goal_tag")
}

model GoalContribution {
  id          String   @id @default(cuid())
  goalId      String
  amountCents BigInt
  note        String?
  date        DateTime @db.Timestamptz(3)
  isAutomatic Boolean  @default(false)
  createdAt   DateTime @default(now()) @db.Timestamptz(3)

  goal        Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId, date])
  @@map("goal_contribution")
}
```

**Key decisions:**
- **Hybrid tracking**: Goals have both `linkedTags` (auto-track matching transactions) and `GoalContribution` (manual contributions). The `currentCents` field is a denormalized running total updated on contribution/transaction creation.
- **Two goal types**: `SAVINGS` (accumulate toward target) and `INCOME` (track monthly income against target, resets conceptually each month but total shows cumulative).
- **GoalTag** links enable: "When a transaction with tag X is created, auto-contribute to goals linked to tag X"
- **GoalContribution** tracks both manual adds and auto-contributions (via `isAutomatic` flag) for audit trail
- `currentCents` is denormalized for display speed -- updated via trigger logic in the router, not a database trigger. Recalculable from contributions if needed.

### User Model Additions

```prisma
// Add to existing User model in auth.prisma:
  recurringTransactions RecurringTransaction[]
  budgets              Budget[]
  goals                Goal[]
```

### Tag Model Additions

```prisma
// Add to existing Tag model in finance.prisma:
  budgets              Budget[]
  recurringTransactions RecurringTransactionTag[]
  goals                GoalTag[]
```

### Migration Note

All new models should be created in a single migration to ensure referential integrity. The `Transaction` model gets one new optional column (`recurringTransactionId`). No existing data is affected.

---

## New tRPC Routers

### recurring router (new)

```
recurringRouter
  +-- list          (all recurring for user, with tag info)
  +-- getById       (single with generation history count)
  +-- create        (template + tag assignment)
  +-- update        (modify template fields)
  +-- delete        (soft delete via isActive = false)
  +-- pause         (toggle isActive without deleting)
  +-- skip          (skip next occurrence, advance nextOccurrence)
  +-- generateDue   (generate all due transactions -- called on dashboard load)
```

**Generation logic location:** The `generateDue` procedure runs server-side. It queries all recurring transactions where `nextOccurrence <= NOW()` and `isActive = true`, creates Transaction records, and advances `nextOccurrence`. This is called in two ways:
1. **On dashboard load** (lazy approach) -- when the user visits the dashboard, check and generate any overdue recurring transactions. This is sufficient for a personal finance app (user visits at least daily/weekly).
2. **Optional cron** -- for production, a Next.js API route (`/api/cron/recurring`) can be called by Vercel Cron or similar. But the lazy approach works as MVP.

**Why lazy generation works:** Personal finance apps are user-driven. If the user hasn't logged in for 3 days, generating those 3 days of recurring transactions when they next visit is perfectly acceptable. No real-time requirement exists.

**New schema file:** `packages/api/src/schemas/recurring.ts`
**New hooks file:** `apps/web/src/hooks/use-recurring.ts`

### budget router (new)

```
budgetRouter
  +-- list          (all budgets with current month spent calculation)
  +-- upsert        (create or update budget for a tag)
  +-- delete        (remove budget limit for a tag)
  +-- getProgress   (single budget with spent/remaining/percentage)
```

**Key implementation detail:** The `list` procedure calculates spent amounts dynamically using raw SQL (matching the existing `dashboard.summary` pattern for `spendingByTag`):

```sql
SELECT b.id, b."tagId", b."limitCents",
  t.name as "tagName", t.color as "tagColor",
  COALESCE(SUM(txn."amountCents"), 0)::bigint as "spentCents"
FROM budget b
JOIN tag t ON b."tagId" = t.id
LEFT JOIN transaction_tag tt ON b."tagId" = tt."tagId"
LEFT JOIN transaction txn ON tt."transactionId" = txn.id
  AND txn.type = 'EXPENSE'
  AND txn.date >= [monthStart]
  AND txn.date <= [monthEnd]
  AND txn."userId" = [userId]
WHERE b."userId" = [userId]
GROUP BY b.id, b."tagId", b."limitCents", t.name, t.color
```

**New schema file:** `packages/api/src/schemas/budget.ts`
**New hooks file:** `apps/web/src/hooks/use-budgets.ts`

### goal router (new)

```
goalRouter
  +-- list          (all goals with progress percentage)
  +-- getById       (goal with recent contributions)
  +-- create        (goal + tag links)
  +-- update        (modify target, deadline, tags)
  +-- delete        (hard delete)
  +-- addContribution  (manual contribution, updates currentCents)
  +-- getContributions (paginated contribution history for a goal)
```

**New schema file:** `packages/api/src/schemas/goal.ts`
**New hooks file:** `apps/web/src/hooks/use-goals.ts`

### debt router (new)

```
debtRouter
  +-- getStrategy       (calculate snowball or avalanche allocation across all loans)
  +-- getComparison     (compare snowball vs avalanche side-by-side)
  +-- getDebtFreeDate   (projected date when all loans paid off under chosen strategy)
```

**Key design: No new Prisma model needed.** Debt strategies are **pure calculation** over existing `Loan` and `LoanPayment` data. The router fetches all active loans, calculates current balances, and runs allocation algorithms. This follows the same pattern as the existing `projectPayoff` calculation utility in `packages/api/src/lib/calculations.ts`.

**Calculation utilities to add in `packages/api/src/lib/calculations.ts`:**
- `calculateSnowball(loans, extraPaymentCents)` -- smallest balance first allocation
- `calculateAvalanche(loans, extraPaymentCents)` -- highest rate first allocation
- `allocatePayments(loans, strategy, totalExtraCents)` -- monthly allocation plan
- `projectMultiLoanPayoff(loans, strategy, extraCents)` -- combined timeline with debt-free date

**New schema file:** `packages/api/src/schemas/debt.ts`
**New hooks file:** `apps/web/src/hooks/use-debt-strategy.ts`

### analytics router (new)

```
analyticsRouter
  +-- getSpendingByCategory   (tag breakdown for custom date range, grouped by month)
  +-- getMonthlyComparison    (month-over-month income/expense comparison)
  +-- getCategoryTrends       (specific tag spending over time)
  +-- getIncomeVsExpenses     (historical income vs expense by month)
```

**Why a new router instead of extending dashboard:** The dashboard router serves the dashboard page (current month snapshot). Analytics serves the analytics page (arbitrary time ranges, comparisons, trend analysis). Mixing them would violate the entity-based router convention. Analytics queries are also heavier (multi-month aggregation with grouping) and benefit from separate cacheability. The dashboard is "How am I doing now?" while analytics is "What are my patterns?"

**All analytics queries use raw SQL** (following the established `db.$queryRaw` pattern from `dashboard.summary`) for performance with multi-month GROUP BY operations.

**New schema file:** `packages/api/src/schemas/analytics.ts`
**New hooks file:** `apps/web/src/hooks/use-analytics.ts`

### export (Next.js Route Handlers, NOT tRPC)

```
/api/export/transactions/csv    (GET -- returns CSV file download)
/api/export/loans/[id]/pdf      (GET -- returns PDF for specific loan amortization)
```

**Why NOT tRPC:** tRPC is optimized for JSON responses with superjson. File downloads need:
- Proper `Content-Type` headers (`text/csv`, `application/pdf`)
- `Content-Disposition` header for filename
- Streaming response for large datasets

These are better served by Next.js Route Handlers (`app/api/export/*/route.ts`). The route handlers use the Prisma client directly and verify auth via `auth.api.getSession({ headers })` -- the same pattern used in the dashboard layout.

**CSV generation:** Server-side string building (no library needed for simple CSV). Stream rows for large transaction sets.

**PDF generation:** Use a lightweight library. Recommended: `jspdf` with `jspdf-autotable` for tabular amortization data. Server-side rendering to PDF buffer. The amortization schedule is tabular data, well-suited to this approach.

---

## Integration Points

### 1. Transaction Creation -> Budget Warning

When a transaction is created or updated:
1. Transaction router creates the transaction (existing flow, unchanged)
2. After creation, call `checkBudgetWarnings(userId, tagIds, monthStart, monthEnd)`
3. For each tagId, check if a Budget row exists for that tag
4. If yes, SUM expense transactions for that tag this month, compare to `limitCents`
5. Return a `budgetWarnings` array in the mutation response: `{ tagId, tagName, limitCents, spentCents, percentage }[]`
6. Client shows toast/banner based on percentage:
   - 80-99%: amber warning "You've used 85% of your Groceries budget"
   - 100%+: red alert "You've exceeded your Groceries budget by $X"

**Implementation:** Add a helper function called at the end of `transaction.create` and `transaction.update` mutations. Does NOT modify the core transaction logic -- it is an additive post-creation check. The mutation's return type gains an optional `budgetWarnings` field.

### 2. Transaction Creation -> Goal Auto-Contribution

When a transaction is created:
1. Transaction router creates the transaction (existing flow, unchanged)
2. Call `processGoalContributions(userId, tagIds, type, amountCents)`
3. Query active goals linked to any of the transaction's tags (via GoalTag)
4. For SAVINGS goals: if transaction type matches expected direction (INCOME on linked savings tags), create GoalContribution with `isAutomatic: true`
5. For INCOME goals: if transaction is INCOME and tagged with a linked tag, create GoalContribution
6. Update `Goal.currentCents` via `db.goal.update({ increment: { currentCents: amountCents } })`
7. If `currentCents >= targetCents`, update `status = COMPLETED`

**Implementation:** A shared utility `processGoalContributions()` in `packages/api/src/lib/goal-utils.ts`, called from within the `transaction.create` Prisma transaction block (so it's atomic).

### 3. Recurring Transaction -> Transaction + Downstream Effects

When recurring transactions are generated:
1. Create Transaction records with `recurringTransactionId` set
2. Copy tag assignments from `RecurringTransactionTag` to `TransactionTag`
3. Advance `nextOccurrence` based on frequency
4. Budget warnings apply to generated transactions (same check runs)
5. Goal auto-contributions apply to generated transactions (same check runs)
6. All within a single Prisma `$transaction` block for atomicity

### 4. Dashboard Summary Extension

The existing `dashboard.summary` procedure should be extended (not replaced) to include:
- Budget overview: top 3 budgets closest to their limit (percentage)
- Goal progress: active goals nearest to deadline or completion
- Recurring status: count of transactions generated since last visit

This preserves the single round-trip pattern. The dashboard response type gains three new optional sections.

### 5. Sidebar Navigation Update

Current nav items (from `dashboard-sidebar.tsx` line 27-34):
```typescript
const navItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/transactions", icon: Wallet, label: "Transactions" },
  { href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
  { href: "/dashboard/loans", icon: CreditCard, label: "Loans" },
  { href: "/dashboard/goals", icon: TrendingUp, label: "Goals" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];
```

Recommended approach -- minimal sidebar changes:
- **Recurring** becomes a tab/sub-section within the Transactions page (not a separate nav item)
- **Budgets** becomes a section within the Analytics page (spending limits naturally live alongside spending analysis)
- **Debt Strategies** becomes a section within the Loans page (already contextually appropriate)
- **Export** becomes buttons within Transactions and Loan detail pages (no nav item needed)

This keeps the sidebar at exactly 6 items (no change). The existing Analytics and Goals placeholder pages get built out.

---

## Data Flows

### Recurring Transaction Generation Flow

```
User creates recurring template
  -> POST recurring.create
  -> Saves RecurringTransaction + RecurringTransactionTag rows
  -> Sets nextOccurrence = startDate

User visits dashboard (or cron fires)
  -> recurring.generateDue is called
  -> SELECT * FROM recurring_transaction
     WHERE nextOccurrence <= NOW() AND isActive = true AND userId = ?
  -> For each due record (in a Prisma $transaction block):
     -> Create Transaction (with recurringTransactionId link)
     -> Copy tags from RecurringTransactionTag to TransactionTag
     -> processGoalContributions() -- auto-contribute to linked goals
     -> checkBudgetWarnings() -- check budget impacts
     -> Calculate next occurrence based on frequency:
        DAILY: +1 day, WEEKLY: +7 days, MONTHLY: +1 month, YEARLY: +1 year
     -> UPDATE recurring_transaction SET nextOccurrence = [next date]
     -> If nextOccurrence > endDate, SET isActive = false
  -> Return { generated: count, budgetWarnings: [...] }
  -> Dashboard shows toast: "3 recurring transactions were generated"
```

### Budget Check Flow

```
User creates/updates transaction with tags [groceries, dining]
  -> transaction.create mutation completes successfully
  -> checkBudgetWarnings(userId, ["groceries-tag-id", "dining-tag-id"])
     -> SELECT budgets WHERE userId AND tagId IN (...)
     -> For each matching budget:
        -> SUM transaction.amountCents
           WHERE type = EXPENSE
             AND tag = budget.tagId
             AND date >= monthStart AND date <= monthEnd
        -> Compare spentCents to budget.limitCents
        -> Return warning if >= 80%
  -> Mutation response includes budgetWarnings[]
  -> Client shows toast:
     - 80-99%: "Heads up: You've used 85% of your Groceries budget ($170/$200)"
     - 100%+: "Budget exceeded: Groceries is $20 over limit ($220/$200)"
```

### Goal Tracking Flow

```
SAVINGS goal "Emergency Fund" linked to tag "Freelance":

  User creates INCOME transaction tagged "Freelance" for $500
  -> transaction.create runs (existing flow)
  -> processGoalContributions(userId, ["freelance-tag-id"], "INCOME", 50000n)
     -> Query: SELECT goals WHERE userId AND status = ACTIVE
              JOIN goal_tag WHERE tagId IN ("freelance-tag-id")
     -> Found: "Emergency Fund" (SAVINGS, target: $5000, current: $2000)
     -> Create GoalContribution(goalId, 50000n, isAutomatic: true)
     -> UPDATE goal SET currentCents = currentCents + 50000
     -> New currentCents: $2500 (50% of $5000)
  -> Transaction response includes goalUpdates[]

Manual contribution:
  User clicks "Add $100" on Emergency Fund goal detail
  -> goal.addContribution({ goalId, amountCents: 10000n, note: "Birthday money" })
  -> Create GoalContribution(goalId, 10000n, isAutomatic: false, note: "Birthday money")
  -> UPDATE goal SET currentCents = currentCents + 10000
  -> If currentCents >= targetCents: UPDATE status = COMPLETED

INCOME goal "Freelance Income Target" with monthly $3000 target:
  -> UI shows: "This month: $1,500 of $3,000" (filtered contributions for current month)
  -> Total progress shows cumulative across all months
```

### Debt Strategy Flow

```
User navigates to Loans page -> Debt Strategy section
  -> debt.getStrategy({ strategy: "avalanche", extraMonthlyPaymentCents: 20000n })
  -> Fetch all active loans with current balances:
     Loan A: $5,000 balance, 18% rate, $200/mo minimum
     Loan B: $15,000 balance, 5% rate, $300/mo minimum
     Loan C: $3,000 balance, 12% rate, $100/mo minimum
  -> Calculate minimum payments total: $600/mo
  -> Extra available: $200/mo (user input)
  -> Avalanche algorithm:
     1. Pay minimums on all loans ($600)
     2. Extra $200 goes to Loan A (highest rate: 18%)
     3. When Loan A paid off, redirect its $200+$200 to Loan C (next highest: 12%)
     4. When Loan C paid off, redirect all extra to Loan B
  -> Return: {
       loans: [
         { id: "A", name: "Credit Card", allocation: 40000n, payoffDate: "2026-10" },
         { id: "C", name: "Personal Loan", allocation: 10000n, payoffDate: "2027-06" },
         { id: "B", name: "Car Loan", allocation: 30000n, payoffDate: "2028-12" }
       ],
       debtFreeDate: "2028-12",
       totalInterestCents: 450000n
     }

Comparison view:
  -> debt.getComparison({ extraMonthlyPaymentCents: 20000n })
  -> Runs both snowball and avalanche
  -> Returns: {
       snowball: { debtFreeDate, totalInterest, order: [C, A, B] },
       avalanche: { debtFreeDate, totalInterest, order: [A, C, B] },
       interestSavedByAvalanche: 85000n,
       monthsSavedByAvalanche: 3
     }
```

### Analytics Data Flow

```
User visits Analytics page, selects "Last 6 months" time range
  -> Parallel queries fire (React Query deduplicates):

  analytics.getSpendingByCategory({ months: 6 })
     -> Raw SQL: GROUP BY month, tagId with SUM(amountCents)
     -> Returns: [{ month: "2025-09", tagId, tagName, tagColor, totalCents }...]
     -> Renders: Stacked bar chart (months on X, tags as stacks)

  analytics.getMonthlyComparison({ months: 6 })
     -> Raw SQL: GROUP BY month with SUM income, SUM expense
     -> Returns: [{ month: "2025-09", incomeCents, expenseCents, netCents }...]
     -> Renders: Grouped bar chart (income vs expense per month)

  analytics.getIncomeVsExpenses({ months: 12 })
     -> Returns: monthly totals for longer historical view
     -> Renders: Area chart showing trends

  analytics.getCategoryTrends({ tagId: "groceries-id", months: 6 })
     -> Returns: monthly totals for one tag
     -> Renders: Line chart for that tag over time
```

### Export Flow

```
CSV Export:
  User clicks "Export to CSV" button on transactions page
  -> Opens: GET /api/export/transactions/csv?dateFrom=2025-01-01&dateTo=2026-02-07&type=EXPENSE
  -> Route handler (apps/web/src/app/api/export/transactions/csv/route.ts):
     1. const session = await auth.api.getSession({ headers: req.headers })
     2. if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
     3. Query transactions with filters (reuse filter logic pattern from transaction router)
     4. Stream CSV: "Date,Type,Amount,Description,Tags\n"
     5. For each transaction: format and append row
     6. Return new Response(csvStream, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="finora-transactions.csv"'
          }
        })
  -> Browser downloads file

PDF Export:
  User clicks "Export PDF" on loan detail page
  -> Opens: GET /api/export/loans/[id]/pdf
  -> Route handler:
     1. Verify auth and loan ownership
     2. Fetch loan with payments, calculate amortization schedule
     3. Generate PDF with loan summary header + amortization table
     4. Return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="loan-amortization.pdf"'
          }
        })
  -> Browser downloads file
```

---

## Component Architecture

### New Pages

| Route | Type | Components |
|-------|------|-----------|
| `/dashboard/transactions` (extend) | Add recurring tab | `RecurringTabContent`, `RecurringForm`, `RecurringCard` |
| `/dashboard/analytics` (replace placeholder) | Client Component page | `AnalyticsPageClient`, `SpendingByCategoryChart`, `MonthlyComparisonChart`, `CategoryTrendChart`, `IncomeVsExpenseChart`, `BudgetSection` |
| `/dashboard/goals` (replace placeholder) | Client Component page | `GoalsPageClient`, `GoalCard`, `GoalForm`, `ContributionForm`, `GoalProgressBar` |
| `/dashboard/loans` (extend) | Add debt strategy section | `DebtStrategySection`, `StrategyComparison`, `DebtFreeCountdown` |

### New Components (by domain)

**Recurring Transactions:**
```
components/recurring/
  recurring-list.tsx         -- list of recurring templates with status
  recurring-form.tsx         -- TanStack Form: type, amount, frequency, tags, start/end
  recurring-card.tsx         -- card: amount, frequency, next date, pause/skip actions
hooks/use-recurring.ts       -- list, create, update, delete, pause, skip, generateDue hooks
```

**Budgets:**
```
components/budgets/
  budget-section.tsx         -- grid of budget cards (used within analytics page)
  budget-form.tsx            -- tag selector + amount input (upsert)
  budget-card.tsx            -- tag color, progress bar, spent/limit, percentage
  budget-progress-bar.tsx    -- reusable: colored bar with threshold indicators
hooks/use-budgets.ts         -- list, upsert, delete hooks
```

**Goals:**
```
components/goals/
  goals-page-client.tsx      -- grid of goal cards + create button
  goal-form.tsx              -- TanStack Form: name, type, target, deadline, tag links
  goal-card.tsx              -- progress ring/bar, deadline countdown, quick-contribute
  goal-detail.tsx            -- expanded view with contribution history
  contribution-form.tsx      -- amount + note input for manual contribution
  goal-progress-bar.tsx      -- circular or linear progress with percentage
hooks/use-goals.ts           -- list, getById, create, update, delete, addContribution hooks
```

**Debt Strategies:**
```
components/loans/
  debt-strategy-section.tsx  -- strategy selector (snowball/avalanche) + results
  strategy-comparison.tsx    -- side-by-side table comparing both strategies
  payment-allocation-table.tsx -- which loan gets how much per month
  debt-free-countdown.tsx    -- date display, months remaining, celebration when 0
hooks/use-debt-strategy.ts   -- getStrategy, getComparison hooks
```

**Analytics:**
```
components/analytics/
  analytics-page-client.tsx        -- chart grid with time range selector
  time-range-selector.tsx          -- period picker (3mo, 6mo, 1yr, custom)
  spending-by-category-chart.tsx   -- stacked bar chart (Recharts)
  monthly-comparison-chart.tsx     -- grouped bar chart income vs expense
  category-trend-chart.tsx         -- line chart for single tag over time
  income-vs-expense-chart.tsx      -- area chart historical view
hooks/use-analytics.ts             -- hooks for each analytics query
```

**Export:**
```
components/shared/
  export-csv-button.tsx      -- button that opens /api/export/transactions/csv
  export-pdf-button.tsx      -- button that opens /api/export/loans/[id]/pdf
```
No hooks needed -- these are direct link/window.open() triggers.

### Modified Existing Components

| Component | Change | Reason |
|-----------|--------|--------|
| `dashboard-page-client.tsx` | Add budget summary widget, goal progress widget, recurring generation trigger on mount | Dashboard surfaces v2 data |
| `dashboard-sidebar.tsx` | No structural changes -- existing nav covers all pages | Recurring/Budgets/Debt nest within existing pages |
| `transaction-form.tsx` | Add optional "Make recurring" checkbox with frequency selector | Create recurring template from transaction form |
| `transactions-page-client.tsx` | Add tab for "Recurring" alongside transaction list | Access recurring management |
| `loans-page-client.tsx` or loan detail | Add debt strategy section below loan list | Debt strategy is contextual to loans |

---

## Suggested Build Order

### Dependency Graph

```
                    +------ Budgets (needs Tags + Transactions -- both exist)
                    |
Schema Migration ---+------ Recurring Transactions (independent, produces Transactions)
                    |
                    +------ Goals (needs Tags + Transactions -- both exist)
                    |
                    +------ Debt Strategies (needs Loans -- exists, pure calc, no new schema)
                    |
                    +------ Analytics (needs Transactions + Tags -- read-only aggregation)
                    |
                    +------ Export (needs Transactions + Loans -- read-only output)
```

### Recommended Phase Order

**Phase 7: Schema Migration + Recurring Transactions**
- Rationale: Schema migration must come first (all v2 models created in one migration). Recurring transactions are the most independent new feature and produce Transaction records that feed into budgets, goals, and analytics -- building it first means richer test data for downstream features.
- Scope: All new Prisma models (RecurringTransaction, RecurringTransactionTag, Budget, Goal, GoalTag, GoalContribution), Transaction model addition. Recurring router + generation logic. Recurring UI (list, form, cards).
- Plans: ~3 plans (migration, router+generation, UI)

**Phase 8: Budgets**
- Rationale: Budgets depend only on Tags + Transactions (already exist). Self-contained feature. Budget warnings integrate into transaction creation (cross-cutting but minimal addition).
- Scope: Budget router with dynamic spent calculation (raw SQL). Budget UI (cards, forms, progress bars). Budget warning integration in transaction mutations.
- Plans: ~2 plans (router+integration, UI)

**Phase 9: Goals**
- Rationale: Goals depend on Tags + Transactions (exist) and benefit from recurring transactions generating data. More complex than budgets (two types, hybrid tracking, auto-contributions).
- Scope: Goal router with contribution tracking. Goal UI (cards, forms, progress, contribution history). Auto-contribution integration in transaction creation.
- Plans: ~2-3 plans (router+auto-contribution, UI+forms, goal detail)

**Phase 10: Debt Strategies**
- Rationale: Pure calculation over existing Loan data. No new models. Can be built independently. Placed after goals because budgets/goals are higher user priority.
- Scope: Snowball/avalanche calculation utilities (TDD). Debt router. UI section on loans page.
- Plans: ~2 plans (calculations+router, UI)

**Phase 11: Analytics**
- Rationale: Read-only aggregation over all data. Benefits from budgets existing (can show budget vs actual). Replaces placeholder page.
- Scope: Analytics router with raw SQL queries. Full analytics page with 4+ chart types. Time range selector. Budget section within analytics.
- Plans: ~2-3 plans (router+queries, charts, budget integration)

**Phase 12: Export + Dashboard Integration + Polish**
- Rationale: Export depends on all data being in place. Dashboard integration pulls v2 widgets together. Polish phase for edge cases.
- Scope: CSV/PDF route handlers. Dashboard widgets for budgets, goals, recurring. Loading/empty states for all v2 features.
- Plans: ~2-3 plans (export routes, dashboard integration, polish)

### Parallel Opportunities

If multiple developers are working:
- Phases 8 (Budgets) and 10 (Debt Strategies) have zero mutual dependencies
- Phase 11 (Analytics) could start after schema migration, since it only reads existing transaction data
- Phase 12 (Export) CSV portion could start after Phase 7

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Computed Aggregations in the Database

**What:** Creating monthly budget snapshot rows, pre-computed analytics tables, or materialized views.
**Why bad:** Creates synchronization problems. When a transaction is edited or deleted, all dependent snapshots must be updated. The existing pattern (compute on read via raw SQL) is proven at personal-finance scale (< 100K transactions).
**Instead:** Compute budget spent, goal progress, and analytics aggregations at query time. Cache at the React Query level (staleTime) if needed.

### Anti-Pattern 2: Cron-Only Recurring Transaction Generation

**What:** Relying solely on a cron job to generate recurring transactions.
**Why bad:** Cron failures silently break the feature. Users see missing transactions with no feedback. Vercel Cron has a minimum interval of 1 minute and can miss beats.
**Instead:** Lazy generation on dashboard/transaction page load (primary) with optional cron as backup. Show "X transactions were generated" feedback to the user.

### Anti-Pattern 3: Using tRPC for File Downloads

**What:** Creating tRPC endpoints that return CSV strings or base64-encoded PDFs.
**Why bad:** tRPC uses JSON (superjson) serialization. Binary data (PDF) becomes base64, doubling size. No streaming support. No proper Content-Type/Content-Disposition headers without hacks. Defeats request batching.
**Instead:** Use Next.js Route Handlers (`app/api/export/*/route.ts`) for file exports. They support streaming, proper headers, and binary responses natively.

### Anti-Pattern 4: Global Budget/Goal State via React Context

**What:** Creating a BudgetContext or GoalContext that wraps the entire dashboard.
**Why bad:** Budget data is relevant only on the budget section and transaction creation. Goal data is relevant only on the goals page. Global state causes unnecessary re-renders across unrelated pages and increases bundle size.
**Instead:** Budget warnings come from mutation responses (scoped to the transaction being created). Budget/goal pages use their own React Query hooks. No global state needed.

### Anti-Pattern 5: Denormalizing Goal Progress Without Audit Trail

**What:** Only storing `Goal.currentCents` without `GoalContribution` records.
**Why bad:** Cannot audit how the total was reached. Cannot undo a specific contribution. Cannot show contribution history. Cannot distinguish manual vs automatic contributions.
**Instead:** Every change to `currentCents` must go through a `GoalContribution` record. The `currentCents` field is a denormalized cache that can be recalculated by summing contributions.

### Anti-Pattern 6: Duplicating Financial Calculations

**What:** Writing debt strategy calculations from scratch instead of reusing existing utilities.
**Why bad:** The `projectPayoff()` function already handles single-loan payoff projection. Duplicating this logic for multi-loan scenarios introduces inconsistency risk.
**Instead:** Build multi-loan strategies by composing calls to existing `projectPayoff()`. The snowball/avalanche algorithms orchestrate which loan gets extra payment, then delegate to `projectPayoff()` for each loan's timeline.

---

## Scalability Considerations

| Concern | At 100 transactions | At 10K transactions | At 100K transactions |
|---------|---------------------|---------------------|----------------------|
| Budget spent calculation | Instant (simple SUM with index) | <50ms (composite index on [userId, type, date]) | May need partial index or monthly materialized view |
| Analytics aggregation | Instant | <200ms (raw SQL + existing indexes) | Consider date-based partitioning with pg_partman |
| Recurring generation | <10ms (few templates) | <100ms (limit batch size) | Batch processing with LIMIT, queue for large volumes |
| Goal contribution count | Instant | Paginate contributions list | Archive old contributions to cold storage |
| CSV export | In-memory build | Stream response body | Cursor-based streaming with chunked transfer |
| Debt strategy calculation | <10ms (few loans) | <50ms (many loans) | Not an issue -- users rarely have >20 loans |

For a personal finance app, 100K transactions represents roughly 10 years of heavy daily use by a single user. The current architecture with proper indexes handles this comfortably. No premature optimization needed.

---

## Sources

- **HIGH confidence:** Direct codebase analysis of all files in `packages/api/src/`, `packages/db/prisma/schema/`, `apps/web/src/` (every router, model, hook, and component read and analyzed)
- **HIGH confidence:** Existing v1 patterns extracted from working, tested code
- **HIGH confidence:** Prisma v7 multi-file schema support verified from existing `schema/` directory structure
- **HIGH confidence:** tRPC v11 proxy pattern verified from existing `trpc.ts` utility and all router implementations
- **HIGH confidence:** React Query / TanStack patterns verified from existing hook implementations (`use-dashboard.ts`, `use-transactions.ts`, `use-loans.ts`)
- **HIGH confidence:** Dashboard raw SQL aggregation pattern verified from `dashboard.ts` router (lines 85-109)
- **MEDIUM confidence:** PDF generation library recommendation (jspdf) -- commonly used, but specific API should be verified against current docs during implementation
- **MEDIUM confidence:** Lazy recurring generation approach -- standard pattern in personal finance apps, but edge cases (timezone handling, missed generations) need testing during implementation
