# Architecture Patterns

**Domain:** Personal Finance App (Expense Tracking + Loan Management)
**Researched:** 2026-01-29
**Confidence:** HIGH (existing stack + verified patterns)

## Executive Summary

Finora's architecture builds on an existing, well-structured monorepo with tRPC, Prisma, and Better Auth. The key architectural decisions for the finance domain are:

1. **Financial calculations live on the server** (tRPC procedures) for auditability and precision
2. **"What-if" simulations run on the client** for instant feedback, using shared calculation utilities
3. **Money stored as integers (cents)** to avoid floating-point precision errors
4. **Charts rendered client-side** with server-aggregated data to balance performance and interactivity
5. **Build order follows data dependencies**: Schema -> API -> UI components -> Charts

---

## Recommended Architecture

```
+------------------+     +------------------+     +------------------+
|   Presentation   |     |    API Layer     |     |   Data Layer     |
|   (apps/web)     |<--->|  (packages/api)  |<--->|  (packages/db)   |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        |
+------------------+     +------------------+              |
|  Chart Library   |     |   Calculation    |              |
|   (Recharts)     |     |    Utilities     |<-------------+
+------------------+     +------------------+
                               ^
                               |
        +----------------------+----------------------+
        |                                             |
+------------------+                         +------------------+
| Server Calcs     |                         | Client Calcs     |
| (tRPC procedures)|                         | ("What-if" sims) |
+------------------+                         +------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **Web App** | UI rendering, user interactions, chart display | API via tRPC, Auth client | `apps/web/` |
| **tRPC Routers** | CRUD operations, data aggregation, authoritative calculations | DB via Prisma, Auth context | `packages/api/src/routers/` |
| **Prisma Schema** | Data model definition, database access | PostgreSQL | `packages/db/prisma/` |
| **Auth Layer** | Session management, user identity | DB, tRPC context | `packages/auth/` |
| **Calculation Utilities** | Financial formulas (amortization, payoff) | Called by API and optionally client | `packages/api/src/utils/` or new `packages/finance/` |
| **Chart Components** | Data visualization (pie, line, area) | Receives pre-aggregated data from API | `apps/web/src/components/charts/` |

### Data Flow

#### Transaction Flow (Create)

```
User enters transaction in form
         |
         v
Form validation (Zod schema client-side)
         |
         v
tRPC mutation: transaction.create
         |
         v
Server validates input (Zod)
         |
         v
Convert display amount to cents (if needed)
         |
         v
Prisma creates Transaction + TransactionTag records
         |
         v
React Query cache invalidates
         |
         v
Dashboard re-fetches aggregates, charts update
```

#### Dashboard Aggregation Flow

```
User loads dashboard
         |
         v
tRPC query: dashboard.summary (date range)
         |
         v
Server aggregates via Prisma:
  - SUM income, SUM expenses for period
  - GROUP BY tag for pie chart data
  - GROUP BY week/month for trend data
         |
         v
Return pre-aggregated data (not raw transactions)
         |
         v
Recharts renders with aggregated data
```

#### Loan "What-If" Simulation Flow

```
User adjusts "extra payment" slider
         |
         v
Client-side calculation utility runs
  - Uses loan details already fetched
  - Computes new amortization schedule
  - No server round-trip
         |
         v
Chart updates instantly with new projection
         |
         v
User clicks "Save Scenario" (optional)
         |
         v
tRPC mutation stores scenario parameters
```

---

## Component Architecture Detail

### 1. tRPC Router Structure

**Recommendation:** Organize routers by domain entity, not by feature page.

```
packages/api/src/routers/
├── index.ts          # appRouter combining all routers
├── transaction.ts    # Transaction CRUD + queries
├── tag.ts            # Tag CRUD
├── loan.ts           # Loan CRUD + payment tracking
├── dashboard.ts      # Aggregation queries for dashboard
└── settings.ts       # User preferences
```

**Rationale:** Entity-based routers are more reusable. The dashboard can call transaction and loan routers' internal logic without duplication.

### 2. Calculation Utilities Location

**Recommendation:** Create `packages/api/src/utils/finance.ts` for shared calculations.

```typescript
// packages/api/src/utils/finance.ts

/**
 * Calculate monthly loan payment (PMT formula)
 * @param principal - Loan amount in cents
 * @param annualRate - Annual interest rate as decimal (0.05 = 5%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment in cents
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  // Implementation using integer math or Decimal.js
}

/**
 * Generate full amortization schedule
 * @returns Array of { month, payment, principal, interest, balance }
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraMonthlyPayment?: number
): AmortizationRow[] {
  // Month-by-month simulation
}
```

**Why server-side as source of truth:**
- Auditability: Logged payments match stored calculations
- Consistency: No client/server calculation drift
- Security: Interest rates and terms validated server-side

**Why also expose to client:**
- "What-if" sliders need instant feedback (<16ms for 60fps)
- No network latency for simulation previews
- Same code ensures client preview matches server result

### 3. Database Schema Extensions

**Recommendation:** Extend the existing auth schema with finance entities.

```prisma
// packages/db/prisma/schema/finance.prisma

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        TransactionType  // INCOME or EXPENSE
  amountCents Int              // Store as cents, not dollars
  description String?
  date        DateTime

  tags        TransactionTag[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, date])
  @@index([userId, type])
  @@map("transaction")
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Tag {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  color       String   // Hex color for charts

  transactions TransactionTag[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, name])
  @@map("tag")
}

model TransactionTag {
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  tagId         String
  tag           Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([transactionId, tagId])
  @@map("transaction_tag")
}

model Loan {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String
  type              LoanType
  principalCents    Int      // Original loan amount in cents
  interestRate      Decimal  // Annual rate as decimal (e.g., 0.0525 for 5.25%)
  termMonths        Int      // Original term
  startDate         DateTime

  payments          LoanPayment[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@map("loan")
}

enum LoanType {
  CAR
  HOME
  PERSONAL
  STUDENT
  OTHER
}

model LoanPayment {
  id              String   @id @default(cuid())
  loanId          String
  loan            Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)

  date            DateTime
  amountCents     Int      // Total payment in cents
  principalCents  Int      // Principal portion
  interestCents   Int      // Interest portion
  extraCents      Int      @default(0) // Extra payment toward principal

  createdAt       DateTime @default(now())

  @@index([loanId, date])
  @@map("loan_payment")
}
```

**Key Design Decisions:**

| Decision | Rationale |
|----------|-----------|
| `amountCents` as Int | Avoids floating-point precision errors. Display converts cents to dollars. |
| `interestRate` as Decimal | Prisma Decimal uses precise arithmetic for rate calculations. |
| Separate `TransactionTag` join table | Enables multi-tag support with efficient queries. |
| `principalCents`/`interestCents` on payments | Enables accurate payoff tracking without recalculating history. |
| Indexes on `[userId, date]` | Optimizes date-range queries for dashboards. |

### 4. Chart Component Architecture

**Recommendation:** Thin wrapper components around Recharts with data transformation handled in tRPC.

```
apps/web/src/components/charts/
├── SpendingPieChart.tsx     # Tag breakdown
├── SpendingTrendChart.tsx   # Weekly/monthly line chart
├── LoanAmortizationChart.tsx # Balance over time area chart
├── PayoffComparisonChart.tsx # What-if comparison lines
└── ChartContainer.tsx       # Shared responsive wrapper
```

**Data Contract Example (tRPC -> Chart):**

```typescript
// API returns pre-aggregated, chart-ready data
interface SpendingByTag {
  tagId: string;
  tagName: string;
  tagColor: string;
  totalCents: number;
}

// Component receives and renders
function SpendingPieChart({ data }: { data: SpendingByTag[] }) {
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey="totalCents"
        nameKey="tagName"
        // Colors from tagColor
      />
    </PieChart>
  );
}
```

**Why aggregate on server:**
- Reduces data transfer (send 10 tag totals, not 1000 transactions)
- Keeps business logic (which transactions count) server-side
- Chart components stay simple and focused on rendering

---

## Patterns to Follow

### Pattern 1: Money as Cents

**What:** Store all monetary values as integers (cents), convert only for display.

**When:** All Transaction amounts, Loan principals, Payment amounts.

**Example:**

```typescript
// Input: user types "125.50"
const userInput = 125.50;
const amountCents = Math.round(userInput * 100); // 12550

// Storage: Prisma stores 12550

// Display: convert back
function formatCurrency(cents: number, symbol = "$"): string {
  return `${symbol}${(cents / 100).toFixed(2)}`;
}
formatCurrency(12550); // "$125.50"
```

### Pattern 2: Server-Computed Aggregates

**What:** Dashboard queries return pre-computed summaries, not raw data.

**When:** Pie charts, trend lines, monthly summaries.

**Example:**

```typescript
// packages/api/src/routers/dashboard.ts
export const dashboardRouter = router({
  monthlySummary: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);

      const [income, expenses] = await Promise.all([
        ctx.db.transaction.aggregate({
          where: {
            userId: ctx.session.user.id,
            type: "INCOME",
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amountCents: true },
        }),
        ctx.db.transaction.aggregate({
          where: {
            userId: ctx.session.user.id,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amountCents: true },
        }),
      ]);

      return {
        incomeCents: income._sum.amountCents ?? 0,
        expensesCents: expenses._sum.amountCents ?? 0,
        netCents: (income._sum.amountCents ?? 0) - (expenses._sum.amountCents ?? 0),
      };
    }),
});
```

### Pattern 3: Optimistic Updates for Fast UI

**What:** Update UI immediately on user action, sync with server in background.

**When:** Adding transactions, logging loan payments.

**Example:**

```typescript
// apps/web/src/hooks/useAddTransaction.ts
const mutation = trpc.transaction.create.useMutation({
  onMutate: async (newTransaction) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['transactions']);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['transactions']);

    // Optimistically update
    queryClient.setQueryData(['transactions'], (old) => [
      ...old,
      { ...newTransaction, id: 'temp-' + Date.now() },
    ]);

    return { previous };
  },
  onError: (err, newTransaction, context) => {
    // Rollback on error
    queryClient.setQueryData(['transactions'], context?.previous);
  },
  onSettled: () => {
    // Always refetch after
    queryClient.invalidateQueries(['transactions']);
  },
});
```

### Pattern 4: Shared Calculation Module

**What:** Single source of truth for financial formulas, usable server and client.

**When:** Loan amortization, payoff projections, interest calculations.

**Example:**

```typescript
// packages/api/src/utils/finance.ts (or packages/finance/)
// Pure functions with no side effects - safe for both environments

export function calculatePayoffDate(
  currentBalanceCents: number,
  interestRate: number,
  monthlyPaymentCents: number,
  extraPaymentCents: number = 0
): Date {
  let balance = currentBalanceCents;
  let months = 0;
  const monthlyRate = interestRate / 12;

  while (balance > 0 && months < 360) { // Cap at 30 years
    const interest = Math.round(balance * monthlyRate);
    const principal = monthlyPaymentCents + extraPaymentCents - interest;
    balance = Math.max(0, balance - principal);
    months++;
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return payoffDate;
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Floating-Point Currency

**What:** Storing money as `Float` or `Decimal` with fractional dollars.

**Why bad:** 0.1 + 0.2 = 0.30000000000000004 in JavaScript. Over thousands of transactions, errors accumulate.

**Instead:** Store cents as integers. Use `Decimal` type only for rates (interest).

### Anti-Pattern 2: Client-Side Aggregation

**What:** Fetching all transactions and summing in the browser.

**Why bad:**
- Performance degrades with scale (1000+ transactions)
- Large payload sizes
- Business logic duplicated between client and server

**Instead:** Server computes aggregates, client renders results.

### Anti-Pattern 3: Calculation in UI Components

**What:** Amortization formulas embedded in React components.

**Why bad:**
- Hard to test
- Duplicated if needed elsewhere
- Couples business logic to presentation

**Instead:** Extract to pure utility functions, test independently.

### Anti-Pattern 4: Synchronous Heavy Calculations

**What:** Running long amortization calculations on main thread.

**Why bad:** Blocks UI, causes jank during slider interactions.

**Instead:** For complex simulations (360-month schedules), consider:
- Web Workers for client-side heavy lifting
- Debounced calculations (wait for slider to stop)
- Pre-computed lookup tables for common scenarios

### Anti-Pattern 5: Untyped Chart Data

**What:** Passing raw API responses directly to charts without type contracts.

**Why bad:** Chart breaks silently when API shape changes.

**Instead:** Define explicit interfaces for chart data contracts.

---

## Build Order (Dependencies)

The following build order respects data and component dependencies:

```
Phase 1: Data Foundation
├── 1.1 Prisma schema (Transaction, Tag, TransactionTag, Loan, LoanPayment)
├── 1.2 Database migrations
└── 1.3 Calculation utilities (packages/api/src/utils/finance.ts)

Phase 2: API Layer
├── 2.1 Tag router (CRUD) - no dependencies
├── 2.2 Transaction router (CRUD + tag assignment)
├── 2.3 Loan router (CRUD + payment tracking)
└── 2.4 Dashboard router (aggregation queries)

Phase 3: Core UI
├── 3.1 Tag management UI
├── 3.2 Transaction list + forms
├── 3.3 Loan list + forms
└── 3.4 Payment logging UI

Phase 4: Visualizations
├── 4.1 Dashboard layout
├── 4.2 Spending pie chart (by tag)
├── 4.3 Spending trend chart (over time)
├── 4.4 Loan amortization chart
└── 4.5 What-if payoff simulator

Phase 5: Polish
├── 5.1 Onboarding flow
├── 5.2 Settings page
└── 5.3 Mobile responsiveness
```

**Rationale:**
- Schema first: Everything depends on data model
- Tags before Transactions: Transactions reference tags
- CRUD before charts: Need data to visualize
- Core features before polish: Ensure value proposition works

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Transaction queries** | Simple indexes sufficient | Add composite indexes, pagination | Consider read replicas, materialized views |
| **Dashboard aggregates** | Real-time queries | Cache with 1-min TTL | Pre-compute nightly, incremental updates |
| **Loan calculations** | On-demand | On-demand | Cache amortization tables |
| **Chart rendering** | Client handles fine | Limit data points (50-100) | Server-side pre-rendering or sampling |

**For MVP (target: 100-1000 users):**
- Real-time aggregation queries are fine
- No caching layer needed initially
- Focus on correct indexes

---

## Where Financial Calculations Should Live

### Server-Side (tRPC Procedures) - Source of Truth

| Calculation | Why Server |
|-------------|------------|
| Loan creation (initial schedule) | Stored in database, authoritative |
| Payment recording | Must match stored data |
| Dashboard aggregates | Security, consistency |
| Historical payoff tracking | Auditability |

### Client-Side (Shared Utilities) - Interactive Previews

| Calculation | Why Client |
|-------------|------------|
| "What-if" slider simulations | Instant feedback (0ms latency) |
| Chart data transformations | Display-only, no storage |
| Currency formatting | Presentation logic |

### Shared (Isomorphic)

| Utility | Implementation |
|---------|---------------|
| `calculateMonthlyPayment()` | Pure function, same result anywhere |
| `generateAmortizationSchedule()` | Pure function, used for preview and storage |
| `formatCurrency()` | Display helper |

---

## Sources

### HIGH Confidence (Official Docs, Context7)
- Existing codebase architecture analysis (verified)
- tRPC documentation: [https://trpc.io/docs/client/nextjs](https://trpc.io/docs/client/nextjs)
- Prisma Decimal type: used for interest rates

### MEDIUM Confidence (Multiple Sources Agree)
- Money as cents pattern: [Frontstuff Guide](https://frontstuff.io/how-to-handle-monetary-values-in-javascript), [Dinero.js](https://blog.logrocket.com/store-retrieve-precise-monetary-values-javascript-dinero-js/)
- Floating-point precision issues: [DEV Community](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc)
- Clean Architecture for finance apps: [DEV Community - Pocket Planner](https://dev.to/daviekim13/developing-an-expense-tracking-app-a-case-study-of-pocket-planner-1fdn)
- Loan amortization libraries: [AmortizeJS](https://www.npmjs.com/package/amortizejs), [Finance.js](https://github.com/ebradyjobory/finance.js/)
- Recharts best practices: [PostHog Tutorial](https://posthog.com/tutorials/recharts)
- What-if slider UX: [Smashing Magazine](https://www.smashingmagazine.com/2017/07/designing-perfect-slider/)

### LOW Confidence (Single Source / Training Data)
- Specific Recharts performance thresholds (verify in implementation)
- Web Worker suggestion for heavy calculations (test if needed)

---

*Architecture research: 2026-01-29*
*Update when major patterns change*
