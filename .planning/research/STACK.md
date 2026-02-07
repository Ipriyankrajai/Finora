# Technology Stack - v2 Additions

**Project:** Finora - Personal Finance App (v2 Milestone)
**Researched:** 2026-02-07
**Focus:** Stack additions for recurring transactions, budgets, debt strategies, goals, analytics, and export

## Existing Stack (Already In Place - DO NOT change)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | App framework (App Router) |
| tRPC | 11.7.2 | Type-safe API |
| React Query | 5.90.12 | Server state |
| Prisma | 7.2.0 | ORM + PostgreSQL |
| Better Auth | 1.4.9 | Authentication |
| shadcn/ui | 3.6.2 | Component library |
| Tailwind CSS | 4.1.10 | Styling |
| TanStack Form | 1.27.3 | Form handling |
| Zod | 4.1.13 | Validation |
| Recharts | 3.7.0 | Charting (pie, area, bar already used) |
| date-fns | 4.1.0 | Date manipulation |
| currency.js | 2.0.4 | Money formatting |
| BigInt cents | N/A | Money storage pattern |

**These are validated and in production. Research below covers ONLY new capabilities needed.**

---

## Recommended Stack Additions

### 1. PDF Generation: jsPDF + jspdf-autotable

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| jspdf | ^4.1.0 | PDF document generation | HIGH |
| jspdf-autotable | ^5.0.7 | Table generation for PDFs | HIGH |

**Why jsPDF over alternatives:**

| Library | Approach | Bundle | Server-Side | Why Not |
|---------|----------|--------|-------------|---------|
| **jsPDF + autotable** | Imperative API | ~280KB | Works in Node.js | **RECOMMENDED** |
| @react-pdf/renderer | React components | ~500KB+ | Has App Router compatibility issues | Overkill for tables; known issues with `renderToBuffer` in Next.js App Router route handlers |
| pdfmake | Declarative JSON | ~900KB | Works | Huge bundle; JSON syntax is verbose for simple tables |

**Why jsPDF wins for Finora:**
1. Amortization schedules and transaction exports are fundamentally **tabular data** -- jspdf-autotable is purpose-built for this
2. Lightweight compared to alternatives (pdfmake is 3x the size)
3. Works both client-side (browser download) and server-side (API route generation)
4. Native TypeScript definitions included since v4.0.0 -- no `@types/jspdf` needed
5. Active maintenance: v4.1.0 published January 2026, addresses CVE-2025-68428
6. Proven pattern for financial documents (invoices, schedules, statements)

**Integration Pattern for Finora:**

```typescript
// packages/api/src/lib/pdf.ts (or apps/web/src/lib/pdf.ts for client-side)
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateAmortizationPDF(
  loanName: string,
  schedule: Array<{
    month: number;
    paymentCents: bigint;
    principalCents: bigint;
    interestCents: bigint;
    balanceCents: bigint;
  }>,
  currencySymbol: string
): Uint8Array {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Amortization Schedule: ${loanName}`, 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Month", "Payment", "Principal", "Interest", "Balance"]],
    body: schedule.map((row) => [
      row.month,
      formatCents(row.paymentCents, currencySymbol),
      formatCents(row.principalCents, currencySymbol),
      formatCents(row.interestCents, currencySymbol),
      formatCents(row.balanceCents, currencySymbol),
    ]),
  });

  return doc.output("arraybuffer");
}
```

**Two export approaches (both supported):**
- **Client-side download:** Generate in browser, trigger `Blob` download. Faster, no server round-trip.
- **Server-side API route:** Generate in tRPC procedure or Next.js route handler, return as `application/pdf`. Better for large documents.

**Recommendation:** Use client-side generation for amortization PDFs (data already on client from loan detail page). Use server-side for full transaction export PDFs (requires DB query).

**Sources:**
- [jsPDF npm](https://www.npmjs.com/package/jspdf) - v4.1.0, published Jan 2026
- [jsPDF-AutoTable GitHub](https://github.com/simonbengtsson/jsPDF-AutoTable) - v5.0.7
- [@react-pdf/renderer App Router issues](https://github.com/diegomura/react-pdf/issues/2460)

---

### 2. CSV Export: Native Implementation (No Library)

| Approach | Confidence |
|----------|------------|
| Custom CSV generation using built-in APIs | HIGH |

**Why NO library is needed:**

CSV generation for Finora's use case (transaction export, budget summaries) is trivially simple. Adding papaparse (46KB) or fast-csv for generation-only is unnecessary overhead.

**The case against libraries:**
- papaparse (v5.5.3): Excellent for *parsing* complex CSVs, but Finora only needs *generation*. Its parsing features (web workers, type detection, streaming) are wasted.
- fast-csv: Node.js streaming library, not needed for in-memory array-to-CSV conversion.
- export-to-csv: Tiny but adds a dependency for ~20 lines of code.

**Custom implementation (all you need):**

```typescript
// packages/api/src/lib/csv.ts
export function generateCSV(
  headers: string[],
  rows: string[][]
): string {
  const escapeCell = (cell: string): string => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCell).join(","));
  return [headerLine, ...dataLines].join("\n");
}

// Usage in tRPC router or client-side
export function exportTransactionsCSV(
  transactions: TransactionExportRow[]
): string {
  return generateCSV(
    ["Date", "Type", "Amount", "Description", "Tags"],
    transactions.map((t) => [
      format(t.date, "yyyy-MM-dd"),
      t.type,
      formatCents(t.amountCents, "$"),
      t.description ?? "",
      t.tags.join("; "),
    ])
  );
}
```

**Client-side download trigger:**
```typescript
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

This approach is:
- Zero dependencies
- Handles edge cases (commas in descriptions, quotes, newlines)
- Testable (pure function)
- Works client-side and server-side

---

### 3. Recurring Transaction Scheduling: Vercel Cron + Database Pattern

| Approach | Confidence |
|----------|------------|
| Vercel Cron Jobs triggering API route + DB-driven schedule | HIGH |

**Why Vercel Cron (not a scheduling library):**

The project deploys on Vercel (confirmed: `apps/web/vercel.json` exists with custom build command). This means:

- **Node-cron / croner / node-schedule will NOT work** -- Vercel is serverless. There is no persistent process to hold a cron timer. The function spins up, handles a request, and shuts down.
- **Vercel Cron Jobs** are the correct pattern: they use Amazon EventBridge Scheduler to call your API route at defined intervals.

**Architecture:**

```
Vercel Cron (every hour)
  --> POST /api/cron/recurring-transactions
    --> Query DB for recurring rules due today
    --> Generate transactions for each rule
    --> Mark rules as processed for this period
```

**Implementation pattern:**

```jsonc
// apps/web/vercel.json
{
  "crons": [
    {
      "path": "/api/cron/recurring-transactions",
      "schedule": "0 6 * * *"  // Daily at 6 AM UTC
    }
  ]
}
```

```typescript
// apps/web/src/app/api/cron/recurring-transactions/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Business logic: query recurring rules, generate transactions
  const generated = await generateDueRecurringTransactions();
  return NextResponse.json({ generated: generated.length });
}
```

**Database-driven scheduling (the recurring rule model):**

The actual scheduling intelligence lives in Prisma models, not in a cron library. The cron job is just a trigger -- a dumb timer that says "check the database for what's due."

```prisma
model RecurringRule {
  id              String           @id @default(cuid())
  userId          String
  type            TransactionType
  amountCents     BigInt
  description     String?
  frequency       RecurringFrequency
  dayOfMonth      Int?             // For MONTHLY: which day (1-28)
  dayOfWeek       Int?             // For WEEKLY: which day (0=Sun, 6=Sat)
  startDate       DateTime         @db.Timestamptz(3)
  endDate         DateTime?        @db.Timestamptz(3)
  lastGeneratedAt DateTime?        @db.Timestamptz(3)
  isActive        Boolean          @default(true)
  // ... relations
}

enum RecurringFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  YEARLY
}
```

**Vercel Cron free plan limits:**
- 2 cron jobs max on free plan
- Hourly minimum frequency on free plan (daily is fine for us)
- Paid plans: up to 40 cron jobs, minute-level granularity

**Recommendation:** One daily cron job at 6 AM UTC is sufficient for recurring transactions. Budget alerts could share this cron or use a second slot.

**Sources:**
- [Vercel Cron Jobs docs](https://vercel.com/docs/cron-jobs)
- [Vercel Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Cron Jobs in Next.js: Serverless vs Serverful](https://yagyaraj234.medium.com/running-cron-jobs-in-nextjs-guide-for-serverful-and-stateless-server-542dd0db0c4c)

---

### 4. Analytics URL State: nuqs

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| nuqs | ^2.8.8 | Type-safe URL query state for analytics filters | MEDIUM |

**Context:** The project already has a custom `useTransactionFilters` hook (`apps/web/src/hooks/use-transaction-filters.ts`) using `useSearchParams` from Next.js. It works but has manual type casting (`as DatePreset | undefined`) and manual serialization.

**Why consider nuqs for the analytics page:**

The analytics page will have significantly more filter state than the transactions page:
- Time range (preset + custom start/end)
- Comparison period (previous period, same period last year)
- Granularity (daily, weekly, monthly)
- Tag filter (multiple)
- Transaction type filter
- Chart type selections

Managing all this with raw `useSearchParams` means:
- Manual parsing/serialization for every parameter
- No type safety at the URL boundary
- Manual handling of defaults

**What nuqs provides:**
```typescript
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

// Type-safe, auto-serialized, with defaults
const [timeRange, setTimeRange] = useQueryState(
  "range",
  parseAsString.withDefault("last30days")
);
const [granularity, setGranularity] = useQueryState(
  "granularity",
  parseAsString.withDefault("monthly")
);
```

**Why MEDIUM confidence (not HIGH):**
- The existing custom hook pattern works and is already established in the codebase
- Adding nuqs introduces a new dependency for something achievable without it
- Benefit is marginal if analytics filters are similar in complexity to transaction filters
- nuqs is ~6KB gzipped, actively maintained (v2.8.8 published Feb 2026), used by Vercel/Sentry/Supabase

**Recommendation:** **Start without nuqs.** Build analytics filters using the same `useSearchParams` pattern as the existing `useTransactionFilters` hook. If the filter complexity grows beyond 6-7 parameters and the manual serialization becomes painful, add nuqs as a targeted refactor. This avoids introducing a dependency before the need is proven.

**Sources:**
- [nuqs GitHub](https://github.com/47ng/nuqs) - v2.8.8, 6KB gzipped
- [nuqs at React Advanced 2025](https://www.infoq.com/news/2025/12/nuqs-react-advanced/)

---

### 5. Analytics Charting: No New Libraries Needed

| Approach | Confidence |
|----------|------------|
| Recharts 3.7.0 (already installed) covers all analytics needs | HIGH |

**The existing Recharts installation already supports every chart type needed for analytics:**

| Analytics Chart | Recharts Component | Already Used? |
|-----------------|-------------------|---------------|
| Income vs Expenses over time | `BarChart` (grouped bars) | Yes (spending-timeline.tsx) |
| Spending by category | `PieChart` | Yes (spending-pie-chart.tsx) |
| Monthly trend lines | `AreaChart` / `LineChart` | Yes (spending-timeline.tsx) |
| Budget progress bars | `BarChart` (horizontal) | New, but component exists |
| Stacked spending breakdown | `BarChart` with `stackId` | New, supported natively |
| Goal progress | `BarChart` (horizontal) or custom with shadcn Progress | N/A (simpler than chart) |
| Debt payoff projections | `LineChart` with multiple series | Similar to loan-amortization-chart.tsx |
| Period comparison | `BarChart` (grouped) or `ComposedChart` | New, supported natively |

**What Recharts 3.x features are relevant for analytics:**
- `ComposedChart`: Combine line + bar in one chart (useful for overlay comparisons)
- `ReferenceArea` / `ReferenceLine`: Highlight budget limits or target thresholds
- `Brush`: Enable zoom on time-series data for analytics deep-dives
- `stackOffset="expand"`: Normalize stacked bars to 100% for category proportions

**No need for:**
- Tremor, Nivo, or Victory -- different charting libraries add bundle weight for no capability gain
- D3.js directly -- Recharts already wraps D3
- Observable Plot -- server-side rendering focus, doesn't match the React component model

---

### 6. Debt Strategy Algorithms: Custom Implementation

| Approach | Confidence |
|----------|------------|
| Custom snowball/avalanche functions in `packages/api/src/lib/calculations.ts` | HIGH |

**Why custom (no library):**
- No maintained TypeScript library exists for snowball/avalanche algorithms
- The existing `calculations.ts` already has `calculateMonthlyPayment`, `projectPayoff`, and `calculateCompoundInterest` -- the foundation is there
- Snowball/avalanche are sorting + iteration algorithms, not complex math
- Custom code integrates naturally with the BigInt cents pattern

**Algorithm summary:**

```typescript
// Both strategies share the same core loop, differ only in sort order
interface DebtInput {
  id: string;
  name: string;
  balanceCents: bigint;
  annualRatePercent: number;
  minimumPaymentCents: bigint;
}

type DebtStrategy = "snowball" | "avalanche";

// snowball: sort by balance ascending (smallest first)
// avalanche: sort by interest rate descending (highest first)
function sortDebts(debts: DebtInput[], strategy: DebtStrategy): DebtInput[] {
  return [...debts].sort((a, b) => {
    if (strategy === "snowball") {
      return Number(a.balanceCents - b.balanceCents);
    }
    return b.annualRatePercent - a.annualRatePercent;
  });
}

// Core payoff simulation: allocate extra payment to priority debt
// Returns month-by-month projection for all debts
```

This extends the existing `calculations.ts` module naturally. The Loan model already stores `annualRatePercent` and `monthlyPaymentCents` -- the inputs needed for debt strategy simulation.

---

## Integration Points with Existing Stack

| New Capability | Integrates With | How |
|----------------|-----------------|-----|
| PDF export | tRPC procedures | Generate PDF bytes in API, return as base64 or trigger client-side download |
| CSV export | tRPC procedures | Generate CSV string in API, return to client for Blob download |
| Recurring transactions | Prisma models + Vercel Cron | New `RecurringRule` model; cron triggers tRPC-like logic in route handler |
| Budget tracking | Prisma + existing Tag model | Budgets link to Tags (spending categories); query `Transaction` SUM WHERE tag + date range |
| Debt strategies | Existing Loan model + calculations.ts | Extend `calculations.ts` with snowball/avalanche; query loans from Prisma |
| Analytics filters | React Query + useSearchParams | URL state drives tRPC query params; React Query caches results |
| Goal tracking | Prisma + Transaction aggregation | Goals query transaction sums for progress; new `Goal` model |

---

## What NOT to Add

| Technology | Why Avoid |
|------------|-----------|
| papaparse | Only need CSV generation (20 lines of code), not parsing. 46KB wasted. |
| node-cron / croner / node-schedule | Will NOT work on Vercel serverless. Process is ephemeral. |
| BullMQ / Redis | Requires separate Redis infrastructure. Massive overkill for daily recurring transactions. |
| @react-pdf/renderer | Known App Router compatibility issues with server-side rendering. React component model is overkill for tabular PDF export. |
| pdfmake | ~900KB bundle. JSON-based API is verbose. jsPDF + autotable is lighter and more direct for tables. |
| Tremor / Nivo / Victory | Recharts 3.7.0 already covers every chart type needed. Adding another charting library fragments the codebase. |
| nuqs (initially) | Existing useSearchParams pattern is sufficient. Add later if analytics filter complexity warrants it. |
| External scheduling services (Schedo, Inngest, Trigger.dev) | Vercel Cron covers the use case. No need for external infrastructure for a single daily job. |
| Financial calculation libraries | Snowball/avalanche are sort+iterate algorithms. Amortization formulas already implemented. No maintained TS library exists. |

---

## Installation Summary

```bash
# New dependencies for v2
cd apps/web && bun add jspdf jspdf-autotable

# No other new dependencies required
# CSV: custom implementation (zero deps)
# Cron: Vercel platform feature (zero deps)
# Debt strategies: extend existing calculations.ts (zero deps)
# Analytics charts: Recharts already installed (zero deps)
# Budget/Goal tracking: Prisma models + existing query patterns (zero deps)
```

**Total new dependencies: 2 (jspdf + jspdf-autotable)**

This is intentionally minimal. The existing stack is comprehensive and the v2 features are primarily **new business logic and data models**, not new infrastructure.

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| PDF generation (jsPDF) | HIGH | v4.1.0 published Jan 2026, includes TypeScript, proven for financial tables, works client+server |
| CSV export (custom) | HIGH | Standard string manipulation, no edge cases beyond what 20 lines of code handles |
| Recurring scheduling (Vercel Cron) | HIGH | Official Vercel feature, project already deploys on Vercel, daily frequency well within free tier |
| Analytics charting (Recharts) | HIGH | Already installed and used for 3 chart types; Recharts 3.x supports all needed chart types |
| Debt strategies (custom) | HIGH | Algorithms are well-documented, existing calculations.ts provides foundation |
| Analytics URL state (custom) | MEDIUM | useSearchParams works but may get complex; nuqs is a fallback option |

---

## Sources

### High Confidence (Official/Verified)
- [jsPDF npm](https://www.npmjs.com/package/jspdf) - v4.1.0, published Jan 2026
- [jsPDF-AutoTable npm](https://www.npmjs.com/package/jspdf-autotable) - v5.0.7
- [Vercel Cron Jobs documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Cron pricing/limits](https://vercel.com/docs/cron-jobs/usage-and-pricing) - Free: 2 jobs, hourly min
- [Recharts API](https://recharts.github.io/en-US/api/) - ComposedChart, Brush, ReferenceArea
- [nuqs GitHub](https://github.com/47ng/nuqs) - v2.8.8
- [Existing project vercel.json](/Users/priyanktrajai/Documents/github/finora2/apps/web/vercel.json)
- [Existing calculations.ts](/Users/priyanktrajai/Documents/github/finora2/packages/api/src/lib/calculations.ts)

### Medium Confidence (WebSearch verified with multiple sources)
- [PDF library comparison](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- [@react-pdf/renderer App Router issues](https://github.com/diegomura/react-pdf/issues/2460)
- [CSV parsers comparison](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)
- [Cron Jobs serverless vs serverful](https://yagyaraj234.medium.com/running-cron-jobs-in-nextjs-guide-for-serverful-and-stateless-server-542dd0db0c4c)
- [nuqs at React Advanced 2025](https://www.infoq.com/news/2025/12/nuqs-react-advanced/)
