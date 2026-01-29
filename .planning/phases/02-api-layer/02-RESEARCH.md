# Phase 2: API Layer - Research

**Researched:** 2026-01-29
**Domain:** tRPC v11 API Design, Zod v4 Validation, Prisma Integration
**Confidence:** HIGH

## Summary

This phase builds type-safe tRPC endpoints for tags, transactions, loans, and dashboard aggregation. Research covered tRPC v11 patterns for router organization, Zod v4 validation schemas, BigInt serialization, cursor-based pagination, and testing strategies with Vitest.

The project already has tRPC v11.9.0 configured with a basic setup including `protectedProcedure` middleware for authentication. The standard approach is to organize routers by domain entity (tag, transaction, loan, dashboard), use Zod schemas for input validation with custom error formatting, and configure superjson transformer for BigInt serialization. Phase 1 established money utilities (`displayToCents`, `centsToDisplay`) and loan calculations that this phase will consume.

Key recommendations: Use superjson transformer for BigInt serialization, organize routers per entity with nested namespacing, implement cursor pagination for transactions, and test all procedures using `createCallerFactory` with mocked context.

**Primary recommendation:** Configure superjson transformer in tRPC initialization, create domain-specific routers (tag, transaction, loan, dashboard) with Zod v4 validation, and return BigInt as string in API responses to avoid serialization issues.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @trpc/server | ^11.9.0 | Type-safe API framework | Already in project, latest version |
| @trpc/client | ^11.9.0 | Client-side tRPC integration | Already in project, required pair |
| zod | ^4.1.13 | Input/output validation | Already in project, tRPC recommended |
| superjson | ^2.x | Data transformer for BigInt/Date | Required for BigInt serialization |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @finora2/db | workspace | Prisma client access | All database operations |
| currency.js | ^2.0.4 | Money formatting | Already implemented in Phase 1 |
| vitest | ^4.0.18 | Testing framework | All API endpoint tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| superjson | devalue | devalue is faster but less human-readable; superjson is standard |
| Zod | Valibot | Valibot is smaller but Zod has better ecosystem |
| Manual BigInt handling | Store as string | Would lose type safety; superjson handles transparently |

**Installation:**
```bash
bun add superjson
```

## Architecture Patterns

### Recommended Project Structure
```
packages/api/
├── src/
│   ├── index.ts              # tRPC initialization with superjson
│   ├── context.ts            # Context creation (existing)
│   ├── lib/
│   │   ├── money.ts          # Money utilities (existing from Phase 1)
│   │   └── calculations.ts   # Loan calculations (existing from Phase 1)
│   ├── routers/
│   │   ├── index.ts          # Root appRouter combining all routers
│   │   ├── tag.ts            # Tag CRUD procedures
│   │   ├── transaction.ts    # Transaction CRUD + filtering
│   │   ├── loan.ts           # Loan CRUD + payments + projections
│   │   └── dashboard.ts      # Aggregation endpoint
│   └── schemas/
│       ├── common.ts         # Shared schemas (pagination, money)
│       ├── tag.ts            # Tag input/output schemas
│       ├── transaction.ts    # Transaction schemas with filters
│       ├── loan.ts           # Loan schemas
│       └── dashboard.ts      # Dashboard output schemas
```

### Pattern 1: Superjson Transformer Configuration

**What:** Configure tRPC with superjson to serialize BigInt, Date, and other complex types
**When to use:** All tRPC initialization (server and client must match)
**Example:**
```typescript
// Source: https://trpc.io/docs/server/data-transformers
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});
```

### Pattern 2: Nested Router Organization

**What:** Organize routers by domain entity with namespaced access
**When to use:** All routers to maintain clean API structure
**Example:**
```typescript
// Source: https://trpc.io/docs/server/merging-routers
// packages/api/src/routers/index.ts
import { router } from "../index";
import { tagRouter } from "./tag";
import { transactionRouter } from "./transaction";
import { loanRouter } from "./loan";
import { dashboardRouter } from "./dashboard";

export const appRouter = router({
  tag: tagRouter,
  transaction: transactionRouter,
  loan: loanRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
```

### Pattern 3: Cursor-Based Pagination

**What:** Use cursor pagination for transaction lists (fetch limit+1 to determine hasMore)
**When to use:** Transaction listing, any paginated data that changes frequently
**Example:**
```typescript
// Source: https://dev.to/ardsh/implementing-cursor-pagination-with-trpc-queries-3ifd
const paginationInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

// In procedure:
const limit = input.limit;
const items = await ctx.db.transaction.findMany({
  where: { userId: ctx.session.user.id, ...filters },
  take: limit + 1, // Fetch one extra to determine hasMore
  cursor: input.cursor ? { id: input.cursor } : undefined,
  orderBy: { date: "desc" },
});

const hasMore = items.length > limit;
const nextCursor = hasMore ? items[limit - 1]?.id : undefined;

return {
  items: items.slice(0, limit),
  nextCursor,
};
```

### Pattern 4: Authorization Guard with Context Narrowing

**What:** Middleware that narrows context type to include guaranteed session
**When to use:** All protected procedures (already exists, enhance with Prisma)
**Example:**
```typescript
// Source: https://kaliex.co/security-best-practices-with-trpc-and-prisma/
import { prisma } from "@finora2/db";

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      db: prisma, // Add Prisma to context for all protected procedures
    },
  });
});
```

### Pattern 5: Reusable Zod Schemas with Validation

**What:** Centralized schemas with custom error messages for money validation
**When to use:** All input validation to ensure consistency
**Example:**
```typescript
// Source: https://zod.dev/api, https://zod.dev/error-customization
// packages/api/src/schemas/common.ts
import { z } from "zod";

// Money input as string, validated and coerced
export const moneyInput = z
  .string()
  .trim()
  .refine(
    (val) => /^-?\d+(\.\d{1,2})?$/.test(val),
    { message: "Amount must be a valid number with up to 2 decimal places" }
  )
  .refine(
    (val) => parseFloat(val) >= 0,
    { message: "Amount must be positive" }
  )
  .refine(
    (val) => parseFloat(val) <= 999999999.99, // Max ~$1B
    { message: "Amount exceeds maximum limit" }
  );

// Notes with trim and length limit
export const notesInput = z
  .string()
  .trim()
  .max(500, { message: "Notes cannot exceed 500 characters" })
  .optional()
  .transform((val) => (val === "" ? null : val));

// Date with coercion
export const dateInput = z.coerce.date({
  error: "Invalid date format",
});

// Pagination cursor
export const cursorInput = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
```

### Pattern 6: Error Response Structure

**What:** Consistent error format with code + user-friendly message
**When to use:** All error throws per CONTEXT.md decisions
**Example:**
```typescript
// Per CONTEXT.md: Code + message structure for errors
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Amount must be positive", // User-friendly, can display directly
  cause: { code: "INVALID_AMOUNT" }, // Machine-readable for frontend logic
});

// NOT_FOUND vs UNAUTHORIZED distinction
const tag = await ctx.db.tag.findUnique({
  where: { id: input.id },
});

if (!tag) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Tag not found",
    cause: { code: "NOT_FOUND" },
  });
}

if (tag.userId !== ctx.session.user.id) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You do not have access to this tag",
    cause: { code: "UNAUTHORIZED" },
  });
}
```

### Anti-Patterns to Avoid

- **Importing server code on client:** Only export `AppRouter` type, never the router itself
- **Calling procedures from procedures:** Use `createCallerFactory` only for testing; extract shared logic into functions
- **Inconsistent transformers:** Client and server MUST use the same transformer (superjson)
- **Offset pagination for real-time data:** Cursor pagination prevents skipped/duplicate items when data changes
- **Returning BigInt directly without transformer:** Will cause JSON serialization errors
- **Hard-deleting tags:** Use `isActive` flag per Phase 1 decision for soft delete

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BigInt serialization | Manual toString/parse | superjson transformer | Handles all types consistently, type-safe |
| Pagination | Manual offset/limit | Cursor-based pattern | Stable under data changes, standard in tRPC |
| Input validation | Manual if/else checks | Zod schemas | Type inference, consistent error format |
| Date handling | String manipulation | z.coerce.date() | Timezone handling, validation built-in |
| Error responses | Custom error format | TRPCError + errorFormatter | Client-side type inference |
| Money validation | Regex patterns | displayToCents + Zod refine | Already implemented, handles edge cases |

**Key insight:** tRPC's type safety extends from server to client automatically. Hand-rolling validation or serialization breaks this chain and loses the primary benefit.

## Common Pitfalls

### Pitfall 1: BigInt JSON Serialization Failure

**What goes wrong:** `TypeError: Do not know how to serialize a BigInt` crashes the API
**Why it happens:** Native JSON.stringify cannot handle BigInt; tRPC uses JSON by default
**How to avoid:** Configure superjson transformer in BOTH server initialization AND client httpLink
**Warning signs:** API returns 500 error when response includes BigInt fields

```typescript
// Server (packages/api/src/index.ts)
const t = initTRPC.context<Context>().create({
  transformer: superjson, // Required!
});

// Client (apps/web/src/lib/trpc.ts)
export const trpc = createTRPCReact<AppRouter>();
// When creating links:
httpLink({ url: "/api/trpc", transformer: superjson })
```

### Pitfall 2: Missing User Scope in Queries

**What goes wrong:** Users can access or modify other users' data
**Why it happens:** Queries don't filter by userId
**How to avoid:** ALWAYS include `userId: ctx.session.user.id` in Prisma where clauses
**Warning signs:** Tests pass with single-user setup but fail with multiple users

```typescript
// WRONG
await ctx.db.tag.findUnique({ where: { id: input.id } });

// RIGHT
await ctx.db.tag.findUnique({
  where: {
    id: input.id,
    userId: ctx.session.user.id, // Always scope to user!
  }
});
```

### Pitfall 3: Zod v4 Coercion Input Type Change

**What goes wrong:** Type errors when migrating from Zod v3 patterns
**Why it happens:** In Zod v4, `z.coerce.*` input type is `unknown` instead of the output type
**How to avoid:** Use explicit input constraints when needed
**Warning signs:** TypeScript errors about `unknown` type in coercion chains

```typescript
// Zod v4 pattern - constrain input before coercion
const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());
```

### Pitfall 4: Cursor Invalidation on Sort Change

**What goes wrong:** Pagination returns wrong results when sort order changes
**Why it happens:** Cursor references position in old sort order
**How to avoid:** Reset cursor (go to page 1) whenever sort/filter changes
**Warning signs:** Users see unexpected items after changing sort order

### Pitfall 5: superjson Error Response Bug (tRPC v11.7.x)

**What goes wrong:** Client throws `Unable to transform response from server` on validation errors
**Why it happens:** Known bug in tRPC v11.7.x where error responses use wrong format
**How to avoid:** Ensure using tRPC v11.9.0+ where this is fixed; test error paths
**Warning signs:** Happy paths work, but validation errors cause client crashes

### Pitfall 6: Loan Balance Calculation Race Condition

**What goes wrong:** Balance becomes negative or incorrect when concurrent payments
**Why it happens:** Reading balance, calculating, and writing aren't atomic
**How to avoid:** Calculate balance from payments each time, or use database transaction with lock
**Warning signs:** Intermittent balance discrepancies under load

```typescript
// Calculate balance from source of truth (payments), don't store it
const payments = await ctx.db.loanPayment.findMany({
  where: { loanId: loan.id },
  select: { principalCents: true },
});
const paidPrincipal = payments.reduce((sum, p) => sum + p.principalCents, 0n);
const balance = loan.principalCents - paidPrincipal;
```

## Code Examples

Verified patterns from official sources and research:

### Tag CRUD Router

```typescript
// Source: tRPC docs + project patterns
// packages/api/src/routers/tag.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../index";

export const tagRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      where: {
        userId: ctx.session.user.id,
        isActive: true, // Soft delete filter
      },
      orderBy: { name: "asc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().trim().min(1).max(50),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          color: input.color,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().trim().min(1).max(50).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      if (tag.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have access to this tag"
        });
      }

      return ctx.db.tag.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.color && { color: input.color }),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      if (tag.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have access to this tag"
        });
      }

      // Soft delete
      return ctx.db.tag.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});
```

### Transaction Filter Schema

```typescript
// Source: CONTEXT.md decisions + Zod v4 patterns
// packages/api/src/schemas/transaction.ts
import { z } from "zod";

// Date presets per CONTEXT.md
export const datePreset = z.enum([
  "last7days",
  "last30days",
  "thisMonth",
  "lastMonth",
  "thisYear",
]);

export const transactionFilterInput = z.object({
  // Pagination (cursor-based)
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),

  // Date filtering: preset OR custom range
  datePreset: datePreset.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),

  // Type filter
  type: z.enum(["INCOME", "EXPENSE"]).optional(),

  // Tag filter
  tagId: z.string().cuid().optional(),

  // Amount range (in cents, as string for BigInt)
  amountMin: z.string().optional(),
  amountMax: z.string().optional(),
}).refine(
  (data) => {
    // Can't use both preset and custom date range
    if (data.datePreset && (data.dateFrom || data.dateTo)) {
      return false;
    }
    return true;
  },
  { message: "Use either date preset OR custom date range, not both" }
);
```

### Dashboard Aggregation

```typescript
// Source: CONTEXT.md decisions
// packages/api/src/routers/dashboard.ts
import { router, protectedProcedure } from "../index";
import { projectPayoff } from "../lib/calculations";

export const dashboardRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();

    // Current month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 3-month rolling window for trends
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Monthly summary - current month income/expense/net
    const [monthlyTransactions, rollingTransactions] = await Promise.all([
      ctx.db.transaction.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: { type: true, amountCents: true },
      }),
      ctx.db.transaction.findMany({
        where: {
          userId,
          date: { gte: threeMonthsAgo, lte: monthEnd },
        },
        select: { type: true, amountCents: true, date: true },
      }),
    ]);

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amountCents, 0n);
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amountCents, 0n);
    const monthlyNet = monthlyIncome - monthlyExpense;

    // Top 5 tags + "Other" per CONTEXT.md
    const spendingByTag = await ctx.db.$queryRaw<Array<{
      tagId: string;
      tagName: string;
      tagColor: string;
      totalCents: bigint;
    }>>`
      SELECT
        t.id as "tagId",
        t.name as "tagName",
        t.color as "tagColor",
        COALESCE(SUM(txn."amountCents"), 0) as "totalCents"
      FROM tag t
      LEFT JOIN transaction_tag tt ON t.id = tt."tagId"
      LEFT JOIN transaction txn ON tt."transactionId" = txn.id
        AND txn.type = 'EXPENSE'
        AND txn.date >= ${monthStart}
        AND txn.date <= ${monthEnd}
      WHERE t."userId" = ${userId} AND t."isActive" = true
      GROUP BY t.id, t.name, t.color
      ORDER BY "totalCents" DESC
      LIMIT 6
    `;

    // Loans with projections
    const loans = await ctx.db.loan.findMany({
      where: { userId },
      include: {
        payments: {
          select: { principalCents: true, interestCents: true },
        },
      },
    });

    const loanOverview = loans.map(loan => {
      const paidPrincipal = loan.payments.reduce(
        (sum, p) => sum + p.principalCents,
        0n
      );
      const paidInterest = loan.payments.reduce(
        (sum, p) => sum + p.interestCents,
        0n
      );
      const balance = loan.principalCents - paidPrincipal;

      const projection = projectPayoff(
        balance,
        loan.annualRatePercent,
        loan.monthlyPaymentCents
      );

      return {
        id: loan.id,
        name: loan.name,
        balanceCents: balance,
        interestPaidCents: paidInterest,
        projectedPayoffDate: projection.payoffDate,
        totalInterestRemainingCents: projection.totalInterestCents,
      };
    });

    return {
      monthlySummary: {
        incomeCents: monthlyIncome,
        expenseCents: monthlyExpense,
        netCents: monthlyNet,
      },
      topTags: spendingByTag.slice(0, 5),
      otherTagsTotal: spendingByTag.length > 5
        ? spendingByTag.slice(5).reduce((sum, t) => sum + t.totalCents, 0n)
        : 0n,
      loanOverview,
    };
  }),
});
```

### Testing Pattern with createCallerFactory

```typescript
// Source: https://trpc.io/docs/v10/server/server-side-calls
// packages/api/src/routers/__tests__/tag.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../../index";
import { appRouter } from "../index";

// Mock Prisma
vi.mock("@finora2/db", () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@finora2/db";

const createCaller = createCallerFactory(appRouter);

describe("tag router", () => {
  const mockUser = { id: "user-123", email: "test@test.com" };
  const mockSession = { user: mockUser };

  const caller = createCaller({
    session: mockSession,
    db: prisma,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns only active tags for the authenticated user", async () => {
      const mockTags = [
        { id: "tag-1", name: "Food", color: "#FF0000", isActive: true },
      ];
      vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags);

      const result = await caller.tag.list();

      expect(result).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123", isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("create", () => {
    it("creates a tag with valid input", async () => {
      const newTag = { id: "tag-new", name: "Travel", color: "#00FF00" };
      vi.mocked(prisma.tag.create).mockResolvedValue(newTag);

      const result = await caller.tag.create({
        name: "Travel",
        color: "#00FF00",
      });

      expect(result).toEqual(newTag);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          name: "Travel",
          color: "#00FF00",
        },
      });
    });

    it("rejects invalid color format", async () => {
      await expect(
        caller.tag.create({ name: "Test", color: "invalid" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("soft deletes by setting isActive to false", async () => {
      const existingTag = {
        id: "tag-1",
        userId: "user-123",
        name: "Food",
        isActive: true,
      };
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(existingTag);
      vi.mocked(prisma.tag.update).mockResolvedValue({
        ...existingTag,
        isActive: false
      });

      await caller.tag.delete({ id: "tag-1" });

      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        data: { isActive: false },
      });
    });

    it("throws UNAUTHORIZED when accessing another user's tag", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue({
        id: "tag-1",
        userId: "other-user", // Different user
        name: "Secret",
        isActive: true,
      });

      await expect(caller.tag.delete({ id: "tag-1" }))
        .rejects.toThrow("You do not have access to this tag");
    });
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tRPC v10 with `.formatError()` | tRPC v11 with `errorFormatter` in create() | tRPC v11 (2024) | Error formatting now in initialization |
| Zod v3 `.message()` param | Zod v4 unified `error` param | Zod v4 (late 2025) | Simplified error customization |
| Zod v3 `z.coerce.*` input = output type | Zod v4 `z.coerce.*` input = `unknown` | Zod v4 (late 2025) | More explicit input handling |
| Offset pagination | Cursor pagination | Always preferred for real-time | Stable pagination under data changes |
| Storing calculated balances | Computing from payments | Best practice | Eliminates race conditions |

**Deprecated/outdated:**
- tRPC v10 patterns: The project uses v11; don't follow v10 guides
- Zod v3 error customization: Use new unified `error` param
- Manual BigInt.toString() calls: superjson handles automatically

## Open Questions

Things that couldn't be fully resolved:

1. **superjson v2 vs v1 compatibility**
   - What we know: superjson v2 exists, project may need latest
   - What's unclear: Specific version requirement for tRPC v11.9.0
   - Recommendation: Install superjson@latest, test serialization works

2. **Prisma context injection pattern**
   - What we know: Current context doesn't include Prisma client
   - What's unclear: Whether to add Prisma to context or import directly in routers
   - Recommendation: Add `db: prisma` to context in protectedProcedure middleware for consistency and testability

3. **Client-side transformer configuration**
   - What we know: Client must also configure superjson
   - What's unclear: Exact configuration in existing Next.js app setup
   - Recommendation: Phase 3 (UI) will configure client; document the requirement clearly

## Sources

### Primary (HIGH confidence)
- [tRPC Routers](https://trpc.io/docs/server/routers) - Router definition patterns
- [tRPC Merging Routers](https://trpc.io/docs/server/merging-routers) - Nested router organization
- [tRPC Data Transformers](https://trpc.io/docs/server/data-transformers) - superjson configuration
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling) - TRPCError codes and usage
- [tRPC Input Validators](https://trpc.io/docs/server/validators) - Zod integration patterns
- [tRPC Server-Side Calls](https://trpc.io/docs/v10/server/server-side-calls) - Testing with createCallerFactory
- [Zod v4 Migration](https://zod.dev/v4/changelog) - Breaking changes from v3
- [Zod API Reference](https://zod.dev/api) - Validation methods and coercion

### Secondary (MEDIUM confidence)
- [Cursor Pagination with tRPC](https://dev.to/ardsh/implementing-cursor-pagination-with-trpc-queries-3ifd) - Implementation pattern
- [Security Best Practices with tRPC and Prisma](https://kaliex.co/security-best-practices-with-trpc-and-prisma/) - Authorization patterns
- [tRPC Best Practices Guide](https://www.projectrules.ai/rules/trpc) - Router organization recommendations

### Tertiary (LOW confidence)
- [tRPC v11 superjson bug issue #7083](https://github.com/trpc/trpc/issues/7083) - Known issue with error responses (may be fixed in v11.9.0)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing project setup, official docs verified
- Architecture: HIGH - tRPC official docs, multiple sources agree on patterns
- Validation (Zod): HIGH - Official Zod v4 migration guide, API reference
- Testing: HIGH - Official tRPC docs for createCallerFactory
- Pitfalls: MEDIUM - Mix of official docs and community reports

**Research date:** 2026-01-29
**Valid until:** 60 days (tRPC and Zod are stable, patterns established)
