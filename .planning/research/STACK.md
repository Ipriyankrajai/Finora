# Technology Stack

**Project:** Finora - Personal Finance App
**Researched:** 2026-01-29
**Focus:** Stack additions for charting, financial calculations, UI patterns

## Existing Stack (Already Decided)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16.1.1 | App framework with App Router | In place |
| tRPC | 11.7.2 | Type-safe API layer | In place |
| React Query | 5.90.12 | Server state management | In place |
| Prisma | 7.2.0 | ORM + PostgreSQL | In place |
| Better Auth | 1.4.9 | Authentication | In place |
| shadcn/ui | 3.6.2 | Component library | In place |
| Tailwind CSS | 4.1.10 | Styling | In place |
| TanStack Form | 1.27.3 | Form handling | In place |
| Zod | 4.1.13 | Schema validation | In place |

**Note:** Project uses TanStack Form (not react-hook-form). Both work well with Zod; TanStack Form has tighter integration with TanStack ecosystem.

---

## Recommended Stack Additions

### Charting: Recharts

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| recharts | ^3.7.0 | Financial visualizations | HIGH |

**Why Recharts 3.7.0:**
- Latest stable version (released Jan 21, 2025) [Source: GitHub releases](https://github.com/recharts/recharts/releases)
- Native React components (not a wrapper around D3)
- Built-in support for pie charts, area charts, line charts - all needed for Finora
- shadcn/ui has official chart components built on Recharts [Source: ui.shadcn.com/charts](https://ui.shadcn.com/charts/pie)
- Performance is good for <100 data points (sufficient for monthly summaries)

**Key 3.x features relevant to Finora:**
- New `useIsTooltipActive` and `useActiveTooltipCoordinate` hooks (v3.7.0)
- Z-index support across chart components (v3.4.0)
- `reverseStackOrder` prop for stacked bars (v3.5.0)
- Better TypeScript support

**Recharts Best Practices for Financial Data:**

```typescript
// 1. Format currency on axes using Intl.NumberFormat
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

<YAxis tickFormatter={(value) => currencyFormatter.format(value)} />

// 2. For time series, set type="number" on XAxis for proper spacing
<XAxis
  dataKey="date"
  type="number"
  domain={['dataMin', 'dataMax']}
  tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM')}
/>

// 3. Limit data points to <100 for performance
// Aggregate daily data to weekly/monthly for trends

// 4. Use ResponsiveContainer for responsive charts
<ResponsiveContainer width="100%" height={300}>
  <PieChart>...</PieChart>
</ResponsiveContainer>
```

**Donut Chart Pattern for Expense Categories:**
```typescript
// shadcn/ui provides pre-built donut chart variants
// Use innerRadius for donut effect, label in center for total
<Pie
  data={expensesByCategory}
  dataKey="amount"
  nameKey="category"
  innerRadius={60}  // Creates donut hole
  outerRadius={80}
  paddingAngle={2}  // Slight gap between segments
/>
```

---

### Money Handling: currency.js

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| currency.js | ^2.0.3 | Decimal-safe money calculations | HIGH |

**Why currency.js over alternatives:**

| Library | Size | Best For | Why Not |
|---------|------|----------|---------|
| **currency.js** | 1.14 KB | Simple currency math | **RECOMMENDED** |
| Dinero.js | 7+ KB | Multi-currency apps | Overkill for single-currency |
| Decimal.js | 12+ KB | Arbitrary precision | Not money-focused |
| big.js | 6 KB | Crypto/big numbers | Missing currency features |

**currency.js wins because:**
1. Tiny footprint (1.14 KB minified) [Source: currency.js.org](https://currency.js.org/)
2. Handles floating-point precision by working with integers internally
3. Simple API: `currency(5.50).add(0.23).value` returns `5.73`
4. Built-in formatting with locale support
5. Safe up to 90 quadrillion dollars (2^53 cents)

**Pattern for Finora:**
```typescript
import currency from 'currency.js';

// Store in DB as cents (integer) - see Prisma section below
// Display and calculate with currency.js

const expense = currency(1234.56);
expense.add(100).value;        // 1334.56
expense.multiply(1.08).value;  // For tax: 1333.32
expense.format();              // "$1,234.56"

// Distribute evenly (e.g., splitting bills)
currency(10).distribute(3);    // [3.34, 3.33, 3.33] - handles rounding
```

**CRITICAL: Prisma + Money Storage Pattern:**

```prisma
// schema.prisma - Store as cents (integer), not Decimal
model Transaction {
  id          String   @id @default(cuid())
  amountCents Int      // Store $12.34 as 1234
  // NOT: amount Decimal @db.Decimal(19, 4) - adds complexity
}
```

**Why integers over Prisma Decimal:**
- Prisma Decimal returns `Prisma.Decimal` object, not native number [Source: prisma/prisma#10160](https://github.com/prisma/prisma/discussions/10160)
- Requires conversion everywhere: `decimal.toNumber()` loses precision, `decimal.toString()` then parse
- Integer cents avoid all precision issues at storage layer
- Currency.js handles display formatting

```typescript
// Convert between DB (cents) and display
const fromCents = (cents: number) => currency(cents, { fromCents: true });
const toCents = (amount: currency) => amount.intValue;

// In tRPC router
const transactions = await prisma.transaction.findMany();
return transactions.map(t => ({
  ...t,
  amount: fromCents(t.amountCents).value, // Return as number for client
}));
```

---

### Date Handling: date-fns

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| date-fns | ^4.1.0 | Date manipulation & formatting | HIGH |

**Why date-fns:**
- Tree-shakeable (only import what you use)
- Immutable operations (returns new Date, doesn't mutate)
- Works with native Date objects (no wrappers)
- Better performance than dayjs for date arithmetic [Source: npm-compare](https://npm-compare.com/date-fns,dayjs,moment)
- Already common in Next.js ecosystem

**Financial Date Patterns:**

```typescript
import {
  startOfMonth, endOfMonth, eachMonthOfInterval,
  format, differenceInMonths, addMonths
} from 'date-fns';

// Monthly expense summaries
const currentMonth = {
  start: startOfMonth(new Date()),
  end: endOfMonth(new Date()),
};

// Loan payoff projections
const monthsRemaining = differenceInMonths(payoffDate, new Date());
const projectedPayoff = addMonths(new Date(), monthsRemaining);

// Generate chart x-axis labels
const monthLabels = eachMonthOfInterval({
  start: subMonths(new Date(), 11),
  end: new Date(),
}).map(date => format(date, 'MMM'));
```

**Timezone Note:** For Finora (single-user finance app), timezone handling is minimal. If needed later, use `date-fns-tz` for timezone conversions.

---

### Loan Calculations: Custom Implementation

| Approach | Confidence |
|----------|------------|
| Custom amortization functions | HIGH |

**Why NOT use a library:**
- cfpb/amortize is Node.js only, limited features
- loan-schedule.js is unmaintained (last update 2021)
- Amortization math is straightforward and well-documented
- Custom code gives full control over "what-if" simulations

**Core Formulas to Implement:**

```typescript
// Monthly payment (standard amortization formula)
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / termMonths;

  return principal *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

// Amortization schedule with optional extra payments
interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
}

function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraMonthly: number = 0
): AmortizationRow[] {
  const monthlyRate = annualRate / 12;
  const payment = calculateMonthlyPayment(principal, annualRate, termMonths);
  let balance = principal;
  const schedule: AmortizationRow[] = [];

  let month = 1;
  while (balance > 0.01 && month <= termMonths * 2) { // Safety limit
    const interest = balance * monthlyRate;
    const principalPortion = Math.min(payment - interest + extraMonthly, balance);
    balance = Math.max(0, balance - principalPortion);

    schedule.push({
      month,
      payment: payment + extraMonthly,
      principal: principalPortion,
      interest,
      extraPayment: extraMonthly,
      balance,
    });

    month++;
    if (balance <= 0) break;
  }

  return schedule;
}

// "What-if" comparison
function calculatePayoffComparison(
  principal: number,
  annualRate: number,
  termMonths: number,
  scenarios: { name: string; extraMonthly: number }[]
) {
  return scenarios.map(scenario => {
    const schedule = generateAmortizationSchedule(
      principal, annualRate, termMonths, scenario.extraMonthly
    );
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    const payoffMonths = schedule.length;

    return {
      name: scenario.name,
      payoffMonths,
      totalInterest,
      monthsSaved: termMonths - payoffMonths,
    };
  });
}
```

**Use currency.js for display, but calculate with plain numbers:**
- Amortization formulas use standard floating-point math
- Precision issues only matter for storage/display, not intermediate calculations
- Wrap final values with currency.js for formatting

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| `@db.Money` in Prisma | PostgreSQL Money type has locale issues, no currency info [Source: Prisma docs](https://www.prisma.io/docs/postgres/query-optimization/recommendations/avoid-db-money) |
| `Prisma.Decimal` | Returns object, requires conversion, adds complexity |
| Moment.js | Deprecated, massive bundle size |
| Chart.js | Good library, but Recharts has better shadcn/ui integration |
| React Financial Charts | Overkill for expense tracking; meant for stock trading |
| D3.js directly | Low-level; Recharts abstracts it nicely |
| Dinero.js | Overkill for single-currency app; larger bundle |
| Floating-point for storage | `0.1 + 0.2 !== 0.3` - use integer cents |

---

## Installation

```bash
# Core additions
bun add recharts currency.js date-fns

# Types (date-fns includes its own types)
# currency.js includes types
# recharts includes types
```

**No dev dependencies needed** - all three libraries include TypeScript definitions.

---

## Summary

| Concern | Solution | Confidence |
|---------|----------|------------|
| Expense pie chart | Recharts 3.7.0 + shadcn/ui chart components | HIGH |
| Spending trends line chart | Recharts AreaChart/LineChart | HIGH |
| Amortization chart | Recharts LineChart | HIGH |
| Money arithmetic | currency.js (integer-based) | HIGH |
| Money storage | Integer cents in Prisma | HIGH |
| Date formatting | date-fns | HIGH |
| Loan calculations | Custom functions (well-documented formulas) | HIGH |
| "What-if" simulations | Custom amortization with variable extra payments | HIGH |

---

## Sources

### High Confidence (Official)
- [Recharts GitHub Releases](https://github.com/recharts/recharts/releases) - v3.7.0 Jan 2025
- [currency.js Documentation](https://currency.js.org/) - v2.0.3
- [date-fns Documentation](https://date-fns.org/)
- [shadcn/ui Charts](https://ui.shadcn.com/charts/pie)
- [Prisma Decimal Discussion](https://github.com/prisma/prisma/discussions/10160)
- [Prisma: Avoid @db.Money](https://www.prisma.io/docs/postgres/query-optimization/recommendations/avoid-db-money)

### Medium Confidence (Verified WebSearch)
- [npm-compare date-fns vs dayjs](https://npm-compare.com/date-fns,dayjs,moment)
- [JavaScript Money Handling Best Practices](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc)
- [Dinero.js vs currency.js comparison](https://npm-compare.com/accounting,currency.js,dinero.js,money)

### Financial Calculation References
- Amortization Formula: `P * [r(1+r)^n] / [(1+r)^n - 1]` - standard mortgage calculation
- [cfpb/amortize](https://github.com/cfpb/amortize) - reference implementation (Node.js)
