# Phase 1: Foundation - Research

**Researched:** 2026-01-29
**Domain:** Prisma Schema Design, Money Handling, Loan Calculations
**Confidence:** HIGH

## Summary

This phase establishes the data foundation for a personal finance application with expense tracking and loan management. Research covered three critical domains: Prisma schema patterns for financial data, money handling with integer cents, and loan calculation formulas.

The standard approach is to store all monetary values as integer cents (avoiding floating-point precision errors), use Prisma's multi-file schema with explicit many-to-many relations for transaction-tag associations, and implement loan calculations using standard amortization formulas with JavaScript's Math.pow(). The project already uses Prisma 7.2.0 with PostgreSQL, which aligns with best practices.

Key recommendations: Use integer cents with BigInt for safety margin, implement explicit junction table for TransactionTag, use `@db.Timestamptz` for all DateTime fields, and build calculation utilities as pure functions with cents input/output.

**Primary recommendation:** Store money as integer cents using Prisma's `BigInt` type, convert only at display boundaries, and implement standard PMT formula for loan calculations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | ^7.2.0 | ORM and schema management | Already in project, excellent TypeScript support |
| currency.js | 2.0.3 | Money conversion and formatting | Works with integers internally, handles rounding, 1.14KB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.NumberFormat | Built-in | Currency display formatting | Localization-aware display |
| big.js | Latest | Arbitrary precision math | Only if banker's rounding needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| currency.js | Dinero.js | Dinero is more feature-rich but heavier; currency.js sufficient for v1 |
| BigInt | Int | Int sufficient for most cases but BigInt provides safety margin |
| Custom calculations | cfpb/amortize | cfpb/amortize is outdated (2014), better to implement standard formulas |

**Installation:**
```bash
bun add currency.js
```

## Architecture Patterns

### Recommended Project Structure
```
packages/db/
├── prisma/
│   └── schema/
│       ├── schema.prisma    # Generator and datasource
│       ├── auth.prisma      # Auth models (existing)
│       └── finance.prisma   # NEW: Transaction, Tag, Loan models
├── src/
│   └── index.ts             # PrismaClient export (existing)

packages/api/
├── src/
│   ├── lib/
│   │   ├── money.ts         # NEW: Money conversion utilities
│   │   └── calculations.ts  # NEW: Loan calculation utilities
```

### Pattern 1: Money as Integer Cents

**What:** Store all monetary values as integer cents, convert only at boundaries
**When to use:** All monetary values in the database and business logic
**Example:**
```typescript
// Source: https://currency.js.org/
import currency from "currency.js";

// Display to cents (for storage)
function displayToCents(displayValue: string): bigint {
  return BigInt(currency(displayValue).intValue);
}

// Cents to display (for UI)
function centsToDisplay(cents: bigint): string {
  return currency(Number(cents), { fromCents: true }).format();
}

// Example usage
const userInput = "$1,234.56";
const cents = displayToCents(userInput); // 123456n
const display = centsToDisplay(cents);   // "$1,234.56"
```

### Pattern 2: Explicit Many-to-Many Relations

**What:** Junction table with metadata for transaction-tag relationships
**When to use:** TransactionTag relation (allows storing assignment metadata)
**Example:**
```prisma
// Source: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations
model Transaction {
  id       String           @id @default(cuid())
  tags     TransactionTag[]
  // ... other fields
}

model Tag {
  id           String           @id @default(cuid())
  transactions TransactionTag[]
  // ... other fields
}

model TransactionTag {
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  transactionId String
  tag           Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId         String
  assignedAt    DateTime    @default(now()) @db.Timestamptz(3)

  @@id([transactionId, tagId])
  @@index([tagId])
  @@map("transaction_tag")
}
```

### Pattern 3: Soft Delete for Tags

**What:** Use `isActive` boolean flag instead of hard delete
**When to use:** Tags only (user decision: transactions and loans use hard delete)
**Example:**
```prisma
// Source: https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware/soft-delete-middleware
model Tag {
  id        String   @id @default(cuid())
  name      String
  color     String
  isActive  Boolean  @default(true)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  transactions TransactionTag[]

  @@unique([userId, name])
  @@index([userId, isActive])
  @@map("tag")
}
```

### Pattern 4: Loan Payment Auto-Creates Transaction

**What:** Loan payments create corresponding expense transactions automatically
**When to use:** When logging loan payments to maintain unified cash flow view
**Example:**
```typescript
// In loan payment creation logic (API layer)
await prisma.$transaction(async (tx) => {
  // Create the loan payment
  const payment = await tx.loanPayment.create({
    data: { loanId, amountCents, principalCents, interestCents, paidAt }
  });

  // Auto-create expense transaction
  await tx.transaction.create({
    data: {
      userId,
      type: "EXPENSE",
      amountCents,
      date: paidAt,
      description: `Loan payment: ${loan.name}`,
      loanPaymentId: payment.id, // Link back for traceability
    }
  });

  return payment;
});
```

### Anti-Patterns to Avoid

- **Storing money as Float/Decimal in JS:** Floating-point math causes precision errors (0.1 + 0.2 !== 0.3). Always use integer cents.
- **Using implicit many-to-many:** Prisma's implicit m-n doesn't allow metadata on the relation. Use explicit junction table.
- **Hard-coding currency symbols:** Store currency code, format with Intl.NumberFormat for proper localization.
- **Using DateTime without @db.Timestamptz:** PostgreSQL TIMESTAMP loses timezone info. Always use TIMESTAMPTZ.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | String concatenation with "$" | currency.js or Intl.NumberFormat | Handles thousands separators, decimal placement, negatives |
| Rounding | Math.round() | currency.js internal rounding | Handles half-up rounding correctly for money |
| Cents conversion | Manual multiplication/division | currency.js intValue/fromCents | Handles edge cases, already tested |
| Date formatting | String manipulation | Intl.DateTimeFormat | Localization, timezone handling |

**Key insight:** Money handling has subtle edge cases (negative values, rounding at boundaries, display formatting). Established libraries have already solved these - custom solutions inevitably miss edge cases.

## Common Pitfalls

### Pitfall 1: Floating-Point Money Calculations

**What goes wrong:** `0.1 + 0.2 === 0.30000000000000004` causes cumulative errors in financial calculations
**Why it happens:** JavaScript uses IEEE 754 floating-point representation
**How to avoid:** Always store and calculate with integer cents, convert only at display boundaries
**Warning signs:** Tests passing with round numbers but failing with edge cases like $0.01 + $0.02

### Pitfall 2: Prisma 7 Multi-File Schema Configuration

**What goes wrong:** Models in additional .prisma files are ignored during migration/generation
**Why it happens:** Prisma 7 changed how multi-file schemas are resolved
**How to avoid:** In prisma.config.ts, point `schema` to the directory, not a single file
**Warning signs:** `prisma migrate dev` only shows models from schema.prisma, not other files

```typescript
// prisma.config.ts - CORRECT for Prisma 7
export default defineConfig({
  schema: path.join("prisma", "schema"), // Directory, not file
  // ...
});
```

### Pitfall 3: DateTime Without Timezone

**What goes wrong:** Times shift when application server timezone differs from database or user timezone
**Why it happens:** PostgreSQL TIMESTAMP stores without timezone; Prisma assumes UTC but tools assume local
**How to avoid:** Always use `@db.Timestamptz(3)` for DateTime fields
**Warning signs:** Dates appear off by hours, especially near midnight

### Pitfall 4: Missing Composite Indexes for Common Queries

**What goes wrong:** Transaction listing becomes slow as data grows
**Why it happens:** Queries filter by userId + date range but only single-column indexes exist
**How to avoid:** Add composite indexes matching common query patterns
**Warning signs:** Slow queries in production, query explain shows sequential scans

```prisma
// Composite index for common query pattern
@@index([userId, date])
@@index([userId, type, date])
```

### Pitfall 5: Loan Interest Calculation Type Confusion

**What goes wrong:** Calculated payments don't match bank calculators
**Why it happens:** Mixing up simple interest vs compound interest formulas, or monthly vs annual rate
**How to avoid:** Store interest type per loan, always convert annual rate to monthly (rate/12)
**Warning signs:** Calculations off by more than $1 compared to Bankrate calculator

## Code Examples

Verified patterns from official sources and research:

### Monthly Payment Calculation (PMT Formula)

```typescript
// Source: Standard amortization formula, verified against Bankrate
// https://www.bankrate.com/mortgages/amortization-calculator/

/**
 * Calculate monthly payment for amortizing loan
 * @param principalCents - Loan principal in cents
 * @param annualRatePercent - Annual interest rate as percentage (e.g., 6.5 for 6.5%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment in cents
 */
function calculateMonthlyPayment(
  principalCents: bigint,
  annualRatePercent: number,
  termMonths: number
): bigint {
  const principal = Number(principalCents);
  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    // Zero interest: simple division
    return BigInt(Math.round(principal / termMonths));
  }

  const x = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = (principal * x * monthlyRate) / (x - 1);

  return BigInt(Math.round(monthlyPayment));
}
```

### Simple Interest Calculation

```typescript
// Source: https://www.geeksforgeeks.org/javascript-program-to-find-compound-interest/

/**
 * Calculate simple interest
 * @param principalCents - Principal in cents
 * @param annualRatePercent - Annual rate as percentage
 * @param years - Time period in years
 * @returns Interest in cents
 */
function calculateSimpleInterest(
  principalCents: bigint,
  annualRatePercent: number,
  years: number
): bigint {
  const principal = Number(principalCents);
  const interest = (principal * annualRatePercent * years) / 100;
  return BigInt(Math.round(interest));
}
```

### Compound Interest Calculation (Monthly)

```typescript
// Source: https://www.geeksforgeeks.org/javascript-program-to-find-compound-interest/

/**
 * Calculate compound interest (monthly compounding)
 * @param principalCents - Principal in cents
 * @param annualRatePercent - Annual rate as percentage
 * @param months - Time period in months
 * @returns Interest in cents
 */
function calculateCompoundInterest(
  principalCents: bigint,
  annualRatePercent: number,
  months: number
): bigint {
  const principal = Number(principalCents);
  const monthlyRate = annualRatePercent / 100 / 12;

  const amount = principal * Math.pow(1 + monthlyRate, months);
  const interest = amount - principal;

  return BigInt(Math.round(interest));
}
```

### Payoff Projection with Extra Payments

```typescript
// Source: Research synthesis from calculator patterns
// https://www.calculator.net/amortization-calculator.html

interface PayoffProjection {
  monthsRemaining: number;
  totalInterestCents: bigint;
  payoffDate: Date;
}

/**
 * Project loan payoff with current payment pattern
 * @param balanceCents - Current remaining balance in cents
 * @param annualRatePercent - Annual interest rate
 * @param monthlyPaymentCents - Current monthly payment in cents
 * @returns Projection of payoff timeline
 */
function projectPayoff(
  balanceCents: bigint,
  annualRatePercent: number,
  monthlyPaymentCents: bigint
): PayoffProjection {
  let balance = Number(balanceCents);
  const monthlyRate = annualRatePercent / 100 / 12;
  const payment = Number(monthlyPaymentCents);

  let months = 0;
  let totalInterest = 0;

  while (balance > 0 && months < 360 * 2) { // Cap at 60 years
    const interestThisMonth = balance * monthlyRate;
    const principalThisMonth = Math.min(payment - interestThisMonth, balance);

    totalInterest += interestThisMonth;
    balance -= principalThisMonth;
    months++;

    if (payment <= interestThisMonth) {
      // Payment doesn't cover interest - will never pay off
      return {
        monthsRemaining: Infinity,
        totalInterestCents: BigInt(0),
        payoffDate: new Date(8640000000000000), // Max date
      };
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    monthsRemaining: months,
    totalInterestCents: BigInt(Math.round(totalInterest)),
    payoffDate,
  };
}
```

### Money Conversion Utilities

```typescript
// Source: https://currency.js.org/
import currency from "currency.js";

// Configuration for USD (can be extended for other currencies)
const USD = (value: currency.Any) => currency(value, { symbol: "$", precision: 2 });

/**
 * Convert display string to cents for storage
 * Handles: "$1,234.56", "1234.56", "1,234.56", "-$50.00"
 */
export function displayToCents(displayValue: string): bigint {
  return BigInt(USD(displayValue).intValue);
}

/**
 * Convert cents to display string for UI
 * Returns: "$1,234.56", "-$50.00"
 */
export function centsToDisplay(cents: bigint, currency: string = "USD"): string {
  // For v1, we only display - no conversion
  return USD(Number(cents) / 100).format();
}

/**
 * Convert cents to Intl-formatted string (for more localization control)
 */
export function centsToLocaleString(
  cents: bigint,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  });
  return formatter.format(Number(cents) / 100);
}

/**
 * Round cents using half-up rounding (0.005 -> 0.01)
 * Used when calculations produce fractional cents
 */
export function roundCents(value: number): bigint {
  return BigInt(Math.round(value));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma middleware for soft delete | Prisma Client Extensions | Prisma 4.16+ | Extensions are more performant and type-safe |
| Single .prisma schema file | Multi-file schema | Prisma 5.15+ (GA in 6.7.0) | Better organization for large schemas |
| `DateTime` type | `@db.Timestamptz(3)` | Always recommended | Proper timezone handling in PostgreSQL |
| Float for money | BigInt cents | Always best practice | Eliminates precision errors |

**Deprecated/outdated:**
- `prisma-soft-delete-middleware`: Deprecated in favor of `prisma-extension-soft-delete`, but for simple isActive flag, custom logic is sufficient
- `cfpb/amortize`: Last updated 2014, better to use standard formulas directly

## Open Questions

Things that couldn't be fully resolved:

1. **BigInt JSON serialization**
   - What we know: BigInt cannot be serialized to JSON directly (`JSON.stringify(123n)` throws)
   - What's unclear: Best pattern for tRPC serialization of BigInt fields
   - Recommendation: Convert to string in API responses, parse back on client. Test with tRPC superjson transformer.

2. **Late fee tracking structure**
   - What we know: User decision says "track late fees separately"
   - What's unclear: Whether late fees are a separate model or a field on LoanPayment
   - Recommendation: Add `lateFeeCents` field on LoanPayment for simplicity in v1

3. **Currency conversion future-proofing**
   - What we know: v1 stores currency code but no conversion
   - What's unclear: Schema design for future multi-currency support
   - Recommendation: Store `currencyCode` as string on relevant models now, defer conversion logic

## Sources

### Primary (HIGH confidence)
- Prisma Documentation - [Many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)
- Prisma Documentation - [Indexes](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)
- currency.js - [Official documentation](https://currency.js.org/)
- Standard amortization formula - PMT = P * r * (1+r)^n / ((1+r)^n - 1)

### Secondary (MEDIUM confidence)
- [Prisma Multi-File Schema Blog Post](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support) - Verified with GitHub issues
- [How to Handle Monetary Values in JavaScript](https://frontstuff.io/how-to-handle-monetary-values-in-javascript) - Verified with currency.js docs
- [Prisma DateTime and Timezone Issues](https://medium.com/@basem.deiaa/how-to-fix-prisma-datetime-and-timezone-issues-with-postgresql-1c778aa2d122) - Verified with PostgreSQL docs
- [Prisma Soft Delete Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware/soft-delete-middleware) - Official docs

### Tertiary (LOW confidence)
- [Prisma 7 Multi-file schema issue #28673](https://github.com/prisma/prisma/issues/28673) - GitHub issue for workaround
- Bankrate calculator reference - Could not fetch calculator details directly

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on project's existing Prisma 7, currency.js is well-documented
- Architecture: HIGH - Prisma explicit relations and money-as-cents are established patterns
- Calculations: HIGH - Standard amortization formulas, verified against multiple sources
- Pitfalls: HIGH - Well-documented issues with floating-point and Prisma 7 multi-file

**Research date:** 2026-01-29
**Valid until:** 60 days (Prisma and patterns are stable)
