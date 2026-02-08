# Phase 7: Recurring Transactions - Research

**Researched:** 2026-02-07
**Domain:** Recurring transaction scheduling, background job execution, date computation
**Confidence:** HIGH

## Summary

This phase adds recurring transaction rules, a background generation engine powered by Trigger.dev, occurrence controls (skip/pause/resume), and a management UI. Research covered three primary domains: (1) Trigger.dev v4 SDK for scheduled background jobs and cron execution, (2) Prisma schema design for recurring rules with idempotent generation tracking, and (3) date-fns usage for next-occurrence computation with month-end edge case handling.

The existing Finora codebase uses Prisma v7 with the `@prisma/adapter-pg` driver, tRPC v11 with superjson, BigInt cents for money, and date-fns for date manipulation. Trigger.dev v4 (latest GA, SDK 4.3.x) integrates cleanly with this stack via its Prisma build extension (`mode: "modern"` for Prisma 7), scheduled task support, and backend triggering from tRPC routes.

**Primary recommendation:** Use a single Trigger.dev `schedules.task` with a declarative cron (e.g., every hour or daily at midnight UTC) that queries all active recurring rules with `nextOccurrenceDate <= now`, generates transactions in a Prisma `$transaction` block, and advances `nextOccurrenceDate`. Use a composite idempotency key (`ruleId + occurrenceDate`) stored in a dedicated column to prevent duplicates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@trigger.dev/sdk` | ^4.3.x | Task definition, scheduling, triggering | Locked decision; official SDK for Trigger.dev v4 |
| `@trigger.dev/build` | ^4.3.x | Build extensions for deployment | Required for Prisma extension in deploy |
| `trigger.dev` | ^4.3.x | CLI for dev/deploy | Required for local dev server and production deploy |
| `@prisma/client` | ^7.2.0 | Database ORM (already installed) | Existing stack; Trigger.dev has modern mode support |
| `date-fns` | ^4.1.0 | Date computation (already installed) | Existing stack; pure functions for next-occurrence math |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@prisma/instrumentation` | latest | OpenTelemetry tracing for Prisma in tasks | Optional; useful for debugging slow DB queries in background jobs |
| `concurrently` | latest | Run Next.js and Trigger.dev dev server together | Development only; add to devDependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Trigger.dev (LOCKED) | Vercel Cron + API routes | Simpler but less robust; no retry, no dashboard, limited to Vercel |
| Trigger.dev (LOCKED) | BullMQ + Redis | Self-hosted, more infra; Trigger.dev is managed |
| Composite DB key idempotency | Trigger.dev idempotencyKey | DB-level is simpler; Trigger.dev idempotencyKey is for task-level dedup, not occurrence-level |

**Installation:**
```bash
# In the apps/web package (or a dedicated packages/jobs package)
bun add @trigger.dev/sdk@latest
bun add -D @trigger.dev/build@latest trigger.dev@latest
```

## Architecture Patterns

### Recommended Project Structure

Two viable approaches exist for the monorepo. **Recommended: Approach 2** (Trigger.dev in `apps/web`) because:
- Simpler setup; tasks can import `@finora2/db` directly
- No new package to configure in turborepo
- Tasks trigger from tRPC routes in the same app
- `trigger.config.ts` lives alongside `next.config.ts`

```
apps/web/
  src/
    trigger/                    # Trigger.dev task definitions
      generate-recurring.ts     # Scheduled task: generate due transactions
    app/
      (dashboard)/
        dashboard/
          recurring/            # New route: /dashboard/recurring
            page.tsx            # Management page (server component)
      api/
        trigger/                # NOT needed - Trigger.dev uses its own connection
    ...
  trigger.config.ts             # Trigger.dev config (project root of apps/web)

packages/api/src/
  routers/
    recurring.ts                # tRPC router for CRUD + occurrence controls
  schemas/
    recurring.ts                # Zod schemas for recurring rules

packages/db/prisma/schema/
  finance.prisma                # Add RecurringRule + RecurringOccurrence models
```

### Pattern 1: Declarative Scheduled Task (Cron)

**What:** A single `schedules.task` that runs on a fixed cron schedule, queries all active rules needing generation, and batch-creates transactions.

**When to use:** For system-wide recurring generation (not per-user cron). One cron job handles all users.

**Why this over per-user imperative schedules:** The free tier allows only 10 schedules. Per-user schedules would quickly exhaust this. A single system-wide cron that processes all due rules is far more scalable and cost-effective.

```typescript
// Source: Trigger.dev scheduled tasks documentation
// apps/web/src/trigger/generate-recurring.ts
import { schedules } from "@trigger.dev/sdk";
import db from "@finora2/db";

export const generateRecurringTransactions = schedules.task({
  id: "generate-recurring-transactions",
  // Run every hour to catch due transactions
  cron: "0 * * * *",
  run: async (payload) => {
    const now = payload.timestamp; // UTC Date from Trigger.dev

    // Find all active rules where nextOccurrenceDate <= now
    const dueRules = await db.recurringRule.findMany({
      where: {
        status: "ACTIVE",
        nextOccurrenceDate: { lte: now },
      },
      include: { tags: true },
    });

    for (const rule of dueRules) {
      // Generate all past-due occurrences (may be multiple if paused then resumed)
      await generateOccurrencesForRule(rule, now);
    }

    return { processed: dueRules.length };
  },
});
```

### Pattern 2: Idempotent Occurrence Generation

**What:** Use a composite key of `(ruleId, scheduledDate)` to prevent duplicate transaction generation. Store each generated occurrence in a `RecurringOccurrence` tracking table.

**When to use:** Always. The cron job may run multiple times for the same period (retries, overlapping runs).

```typescript
// Idempotency via database unique constraint
// The RecurringOccurrence table has @@unique([ruleId, scheduledDate])
async function generateOccurrencesForRule(rule: RecurringRule, now: Date) {
  let currentDate = rule.nextOccurrenceDate;

  while (currentDate <= now) {
    // Check end conditions
    if (rule.endDate && currentDate > rule.endDate) break;
    if (rule.maxOccurrences && rule.completedCount >= rule.maxOccurrences) break;

    // Idempotent upsert: if occurrence already exists, skip
    const existing = await db.recurringOccurrence.findUnique({
      where: {
        ruleId_scheduledDate: {
          ruleId: rule.id,
          scheduledDate: currentDate,
        },
      },
    });

    if (!existing) {
      await db.$transaction(async (tx) => {
        // Create the transaction
        const transaction = await tx.transaction.create({
          data: {
            userId: rule.userId,
            type: rule.type,
            amountCents: rule.amountCents,
            date: currentDate,
            description: rule.description,
            recurringRuleId: rule.id,
          },
        });

        // Copy tags from rule to transaction
        if (rule.tags.length > 0) {
          await tx.transactionTag.createMany({
            data: rule.tags.map((rt) => ({
              transactionId: transaction.id,
              tagId: rt.tagId,
            })),
          });
        }

        // Record the occurrence
        await tx.recurringOccurrence.create({
          data: {
            ruleId: rule.id,
            scheduledDate: currentDate,
            status: "GENERATED",
            transactionId: transaction.id,
          },
        });

        // Increment completed count
        await tx.recurringRule.update({
          where: { id: rule.id },
          data: {
            completedCount: { increment: 1 },
            lastGeneratedDate: currentDate,
          },
        });
      });
    }

    // Advance to next occurrence
    currentDate = computeNextOccurrence(rule, currentDate);
  }

  // Update nextOccurrenceDate on the rule
  await db.recurringRule.update({
    where: { id: rule.id },
    data: { nextOccurrenceDate: currentDate },
  });
}
```

### Pattern 3: Next-Occurrence Date Computation with date-fns

**What:** Pure function that computes the next occurrence date based on frequency, handling month-end edge cases.

**When to use:** After generating an occurrence, to advance `nextOccurrenceDate`.

```typescript
// packages/api/src/lib/recurring.ts
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  setDate,
  lastDayOfMonth,
  getDate,
  min,
} from "date-fns";

type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

export function computeNextOccurrence(
  frequency: Frequency,
  currentDate: Date,
  anchorDay?: number // Original day-of-month for MONTHLY rules
): Date {
  switch (frequency) {
    case "DAILY":
      return addDays(currentDate, 1);
    case "WEEKLY":
      return addWeeks(currentDate, 1);
    case "BIWEEKLY":
      return addWeeks(currentDate, 2);
    case "MONTHLY": {
      // addMonths handles overflow (Jan 31 + 1 month = Feb 28/29)
      // But we want to use the anchor day, clamped to last day of target month
      const nextMonth = addMonths(currentDate, 1);
      if (anchorDay) {
        const lastDay = getDate(lastDayOfMonth(nextMonth));
        const targetDay = Math.min(anchorDay, lastDay);
        return setDate(nextMonth, targetDay);
      }
      return nextMonth;
    }
    case "YEARLY":
      return addYears(currentDate, 1);
  }
}
```

### Pattern 4: Triggering from tRPC (Backend Trigger)

**What:** When a user creates a recurring rule via tRPC mutation, optionally trigger an immediate check.

```typescript
// In tRPC router - trigger uses type-only import
import type { generateRecurringTransactions } from "@/trigger/generate-recurring";
import { tasks } from "@trigger.dev/sdk";

// After creating a rule, optionally trigger generation
// (the cron will also catch it, but this provides instant feedback)
await tasks.trigger<typeof generateRecurringTransactions>(
  "generate-recurring-transactions",
  undefined  // No payload needed for scheduled tasks triggered manually
);
```

### Pattern 5: Dashboard Banner via tRPC Query

**What:** A tRPC query that returns today's generated recurring transaction count, used for the dismissible dashboard banner.

```typescript
// packages/api/src/routers/recurring.ts
todayGenerated: protectedProcedure.query(async ({ ctx }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await db.recurringOccurrence.count({
    where: {
      rule: { userId: ctx.session.user.id },
      status: "GENERATED",
      generatedAt: { gte: today, lt: tomorrow },
    },
  });

  return { count };
}),
```

### Anti-Patterns to Avoid

- **Per-user cron schedules via `schedules.create`:** The free tier only allows 10 schedules. Even paid tiers cap at 100-1000. Use a single system cron that processes all users.
- **Lazy generation on page load:** The CONTEXT.md explicitly states auto-generate on schedule, not on page load. Do not query and generate in tRPC list endpoints.
- **Generating future transactions:** Only generate occurrences where `scheduledDate <= now`. Never pre-generate future occurrences.
- **Storing frequency as cron expression:** The UI uses simple frequency enums (DAILY, WEEKLY, etc.). Store as enum, not cron string. The cron is only for the Trigger.dev task itself.
- **Triggering tasks by importing the task function directly:** Use `tasks.trigger<typeof taskFn>()` with type-only imports. Direct imports would bundle task code into your Next.js app.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Background job scheduling | Custom setInterval/cron | Trigger.dev `schedules.task` | Handles retries, monitoring, deployment, zero timeouts |
| Date arithmetic with month-end edge cases | Manual date math | `date-fns` `addMonths`, `setDate`, `lastDayOfMonth` | date-fns handles leap years, month-end clamping, DST |
| Duplicate prevention for recurring generation | Application-level checks only | DB unique constraint `@@unique([ruleId, scheduledDate])` | Database guarantees atomicity; app checks have race conditions |
| Job monitoring/observability | Custom logging | Trigger.dev dashboard | Built-in run history, logs, traces, retry visibility |
| Task retry with backoff | Custom retry logic | Trigger.dev `retries` config | Exponential backoff with jitter built-in |

**Key insight:** The generation engine is deceptively simple in concept but has numerous edge cases: duplicate prevention across retries, month-end date clamping, handling paused-then-resumed rules with accumulated missed dates, and end-condition checking. Using Trigger.dev for scheduling + Prisma unique constraints for idempotency + date-fns for date math eliminates the three hardest custom-built components.

## Common Pitfalls

### Pitfall 1: Month-End Date Overflow
**What goes wrong:** A rule set to "the 31st" generates on Feb 28 (correct), but then the next occurrence computes as Mar 28 instead of Mar 31.
**Why it happens:** `addMonths(new Date("2026-02-28"), 1)` returns Mar 28, not Mar 31. The library clamps to the current date, losing the original anchor.
**How to avoid:** Store `anchorDay` (the original day-of-month) on the recurring rule. When computing next occurrence for MONTHLY, always use the anchor day clamped to the target month's last day.
**Warning signs:** Users complain that their "31st of month" rule drifts to earlier dates.

### Pitfall 2: Duplicate Transactions from Cron Retries
**What goes wrong:** The Trigger.dev task fails mid-batch and retries, generating some transactions twice.
**Why it happens:** The task generated some occurrences before failing, and on retry it re-processes the same rules.
**How to avoid:** Use the `RecurringOccurrence` table with a `@@unique([ruleId, scheduledDate])` constraint. Before creating a transaction, check if the occurrence record already exists. The DB constraint is the final safety net.
**Warning signs:** Users see duplicate transactions with identical dates and amounts.

### Pitfall 3: Accumulated Backlog After Unpause
**What goes wrong:** A rule paused for 3 months generates 90 daily transactions at once when resumed, overwhelming the user's transaction list.
**Why it happens:** The generation engine processes all dates between `nextOccurrenceDate` and `now`.
**How to avoid:** When resuming a paused rule, reset `nextOccurrenceDate` to today (or the next future date). Do NOT backfill missed occurrences during the paused period. Document this behavior clearly in the UI.
**Warning signs:** Users pause and unpause a daily rule and get dozens of transactions.

### Pitfall 4: TRIGGER_SECRET_KEY Not Available in tRPC Context
**What goes wrong:** `tasks.trigger()` fails with authentication errors when called from tRPC routes.
**Why it happens:** The `TRIGGER_SECRET_KEY` env var is not set in the Next.js server environment, or it's only in `.env.local` and not in the deployment environment.
**How to avoid:** Add `TRIGGER_SECRET_KEY` to the `@finora2/env` server schema and ensure it's set in all environments. For development, add it to `.env.local` in `apps/web`.
**Warning signs:** "Unauthorized" errors when triggering tasks from API routes.

### Pitfall 5: BigInt Serialization in Trigger.dev Payloads
**What goes wrong:** Task payloads containing BigInt values fail to serialize because JSON.stringify cannot handle BigInt.
**Why it happens:** Trigger.dev uses standard JSON serialization for payloads, not superjson.
**How to avoid:** Never pass BigInt values in Trigger.dev task payloads. The scheduled task should query the database directly inside the `run` function, where BigInt values are handled by Prisma. If you must pass amounts, convert to string first.
**Warning signs:** "TypeError: Do not know how to serialize a BigInt" in task runs.

### Pitfall 6: Trigger.dev Dev Server Not Running
**What goes wrong:** Scheduled tasks don't fire during local development.
**Why it happens:** Trigger.dev scheduled tasks only trigger when the dev CLI is running. Forgetting to start `trigger dev` alongside `next dev` means no cron execution.
**How to avoid:** Add a combined dev script using `concurrently` to run both servers. Add a startup check or log message reminding developers.
**Warning signs:** Recurring rules created in dev but no transactions generated.

## Code Examples

### trigger.config.ts for Prisma 7 Monorepo

```typescript
// apps/web/trigger.config.ts
// Source: Trigger.dev docs - config file + Prisma 7 integration changelog
import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "<project-ref>", // From Trigger.dev dashboard
  runtime: "node",
  dirs: ["./src/trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      prismaExtension({
        mode: "modern", // Prisma 7 uses modern mode (Rust-free client)
      }),
    ],
  },
});
```

### Prisma Schema for Recurring Rules

```prisma
// packages/db/prisma/schema/finance.prisma (additions)

enum RecurringFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  YEARLY
}

enum RecurringStatus {
  ACTIVE
  PAUSED
}

enum OccurrenceStatus {
  GENERATED
  SKIPPED
}

model RecurringRule {
  id                 String             @id @default(cuid())
  userId             String
  type               TransactionType    @default(EXPENSE)
  amountCents        BigInt
  description        String?
  frequency          RecurringFrequency
  dayOfWeek          Int?               // 0=Sunday..6=Saturday (for WEEKLY/BIWEEKLY)
  dayOfMonth         Int?               // 1-31 anchor day (for MONTHLY)
  startDate          DateTime           @db.Timestamptz(3)
  endDate            DateTime?          @db.Timestamptz(3)
  maxOccurrences     Int?               // null = forever
  completedCount     Int                @default(0)
  status             RecurringStatus    @default(ACTIVE)
  nextOccurrenceDate DateTime           @db.Timestamptz(3)
  lastGeneratedDate  DateTime?          @db.Timestamptz(3)
  currencyCode       String             @default("USD")
  createdAt          DateTime           @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime           @updatedAt @db.Timestamptz(3)

  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        RecurringRuleTag[]
  occurrences RecurringOccurrence[]

  @@index([userId, status])
  @@index([status, nextOccurrenceDate])
  @@map("recurring_rule")
}

model RecurringRuleTag {
  ruleId     String
  tagId      String
  assignedAt DateTime @default(now()) @db.Timestamptz(3)

  rule RecurringRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  tag  Tag          @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([ruleId, tagId])
  @@index([tagId])
  @@map("recurring_rule_tag")
}

model RecurringOccurrence {
  id            String           @id @default(cuid())
  ruleId        String
  scheduledDate DateTime         @db.Timestamptz(3)
  status        OccurrenceStatus @default(GENERATED)
  transactionId String?          @unique
  generatedAt   DateTime         @default(now()) @db.Timestamptz(3)

  rule        RecurringRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  transaction Transaction?  @relation(fields: [transactionId], references: [id], onDelete: SetNull)

  @@unique([ruleId, scheduledDate])
  @@index([ruleId, status])
  @@map("recurring_occurrence")
}
```

Note: The `Transaction` model needs a new optional `recurringRuleId` field and `recurringOccurrence` relation added. The `Tag` model needs a `recurringRules RecurringRuleTag[]` relation. The `User` model needs a `recurringRules RecurringRule[]` relation.

### Package.json Dev Scripts

```json
{
  "scripts": {
    "dev": "concurrently --kill-others --names \"next,trigger\" --prefix-colors \"yellow,blue\" \"next dev --port 3001\" \"npx trigger.dev@latest dev\"",
    "dev:trigger": "npx trigger.dev@latest dev",
    "deploy:trigger": "npx trigger.dev@latest deploy"
  }
}
```

### Zod Schema for Creating a Recurring Rule

```typescript
// packages/api/src/schemas/recurring.ts
import { z } from "zod";
import { moneyInput, notesInput } from "./transaction";

export const recurringFrequency = z.enum([
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "YEARLY",
]);

export const createRecurringRuleInput = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
    amount: moneyInput,
    description: notesInput.default(null),
    frequency: recurringFrequency,
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    maxOccurrences: z.number().int().min(1).optional(),
    tagIds: z.array(z.string().cuid()).optional(),
  })
  .refine(
    (data) => {
      // WEEKLY/BIWEEKLY requires dayOfWeek
      if (
        (data.frequency === "WEEKLY" || data.frequency === "BIWEEKLY") &&
        data.dayOfWeek === undefined
      ) {
        return false;
      }
      return true;
    },
    { message: "Day of week is required for weekly/biweekly frequency", path: ["dayOfWeek"] }
  )
  .refine(
    (data) => {
      // Cannot have both endDate and maxOccurrences
      if (data.endDate && data.maxOccurrences) {
        return false;
      }
      return true;
    },
    { message: "Cannot set both end date and occurrence count", path: ["endDate"] }
  );
```

### Skip Occurrence Mutation

```typescript
// packages/api/src/routers/recurring.ts (skip pattern)
skipOccurrence: protectedProcedure
  .input(z.object({
    ruleId: z.string().cuid(),
    scheduledDate: z.coerce.date(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify ownership
    const rule = await db.recurringRule.findUnique({
      where: { id: input.ruleId },
    });
    if (!rule || rule.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Upsert occurrence as SKIPPED
    await db.recurringOccurrence.upsert({
      where: {
        ruleId_scheduledDate: {
          ruleId: input.ruleId,
          scheduledDate: input.scheduledDate,
        },
      },
      create: {
        ruleId: input.ruleId,
        scheduledDate: input.scheduledDate,
        status: "SKIPPED",
      },
      update: {
        status: "SKIPPED",
      },
    });

    return { success: true };
  }),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Trigger.dev v3 SDK (`@trigger.dev/sdk/v3`) | Trigger.dev v4 SDK (`@trigger.dev/sdk`) | 2025 | Import path changed; v3 path deprecated |
| `prismaExtension({ mode: "legacy" })` | `prismaExtension({ mode: "modern" })` | 2025 (v4.1.1) | Prisma 7 requires modern mode; no Rust engine |
| `handleError` lifecycle hook | `catchError` lifecycle hook | v4.0 | Renamed in v4 migration |
| `init` task property | `locals` API with middleware | v4.0 | Structural change in task initialization |
| Per-user `schedules.create()` | Single system cron + DB query | Best practice | Free tier only allows 10 schedules; system cron scales better |

**Deprecated/outdated:**
- `@trigger.dev/sdk/v3` import path: Use `@trigger.dev/sdk` directly
- `@trigger.dev/nextjs` package: No longer needed for v3/v4; use `@trigger.dev/sdk` directly
- `handleError`: Renamed to `catchError` in v4
- `prismaExtension({ mode: "legacy" })`: Only for Prisma 5.x and older; Prisma 7 needs `mode: "modern"`

## Trigger.dev Deployment & Environment Notes

### Free Tier Constraints (Relevant to Planning)
- **10 schedules** max on free tier (sufficient: we only need 1 system cron)
- **20 concurrent runs** (sufficient for a personal finance app)
- **$5/month free compute** (sufficient for hourly cron processing a few hundred rules)
- **1-day log retention** (plan accordingly; important logs should go to app DB)

### Environment Variables Required
- `TRIGGER_SECRET_KEY`: DEV key for local, production key for deploy. Add to `@finora2/env` server schema.
- Dashboard environment variables: `DATABASE_URL` must be set in Trigger.dev dashboard for the task to connect to the database.

### Dev vs Production Behavior
- **Dev:** Scheduled tasks only fire when `trigger dev` CLI is running
- **Production:** Tasks only fire from the latest deployment; old deployments are ignored
- **Both:** The `payload.timestamp` gives the scheduled time (UTC), not the actual execution time

## Open Questions

1. **Where to place trigger.config.ts in monorepo**
   - What we know: Both `apps/web/` and a separate `packages/jobs/` work
   - What's unclear: Whether Trigger.dev CLI can resolve `@finora2/db` workspace imports when running from `apps/web/`
   - Recommendation: Start with `apps/web/` (simpler). Trigger.dev bundles dependencies by default, so workspace imports should resolve. If issues arise, extract to a `packages/jobs` package.

2. **Cron frequency: hourly vs daily**
   - What we know: Hourly catches transactions sooner; daily is simpler and uses fewer runs
   - What's unclear: User expectations for "how soon" transactions appear
   - Recommendation: Start with hourly (`0 * * * *`). On the free tier, 24 runs/day * 30 = 720 runs/month is well within the $5 compute budget. Can be changed to daily if needed.

3. **Trigger.dev authentication in tRPC routes**
   - What we know: `tasks.trigger()` reads `TRIGGER_SECRET_KEY` from env automatically
   - What's unclear: Whether Next.js server components and tRPC route handlers have access to env vars set only in Trigger.dev dashboard
   - Recommendation: Set `TRIGGER_SECRET_KEY` in `.env.local` for dev and in the deployment platform's env vars for production. Do NOT rely on Trigger.dev dashboard env vars for the Next.js app; those are only for the Trigger.dev worker.

## Sources

### Primary (HIGH confidence)
- [Trigger.dev Scheduled Tasks Docs](https://trigger.dev/docs/tasks/scheduled) - Declarative/imperative cron, payload properties, timezone support
- [Trigger.dev Manual Setup](https://trigger.dev/docs/manual-setup) - Package installation, trigger.config.ts, task definition
- [Trigger.dev Config File](https://trigger.dev/docs/config/config-file) - All config properties, build extensions, instrumentations
- [Trigger.dev Idempotency](https://trigger.dev/docs/idempotency) - idempotencyKey, TTL, scope options
- [Trigger.dev Triggering Tasks](https://trigger.dev/docs/triggering) - tasks.trigger, delay, concurrency, queue options
- [Trigger.dev Prisma 7 Integration](https://trigger.dev/changelog/prisma-7-integration) - Modern mode, legacy vs engine-only vs modern
- [Trigger.dev Pricing](https://trigger.dev/pricing) - Free tier limits, schedule caps
- [Trigger.dev How It Works](https://trigger.dev/docs/how-it-works) - Architecture, dev server, deployment
- [Trigger.dev v3 to v4 Migration](https://trigger.dev/docs/migrating-from-v3) - Breaking changes, API updates
- [Trigger.dev Next.js Guide](https://trigger.dev/docs/guides/frameworks/nextjs) - App Router setup, server actions
- [Trigger.dev Turborepo Guide](https://trigger.dev/docs/guides/example-projects/turborepo-monorepo-prisma) - Monorepo structure options

### Secondary (MEDIUM confidence)
- [date-fns Documentation](https://date-fns.org/) - addMonths, setDate, lastDayOfMonth behavior
- Existing Finora codebase analysis - Prisma schema, tRPC patterns, BigInt conventions

### Tertiary (LOW confidence)
- [supastarter Trigger.dev Guide](https://supastarter.dev/blog/background-jobs-with-trigger) - Community blog, general patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Trigger.dev is the locked decision; v4 SDK verified via official docs and npm
- Architecture: HIGH - Schema design follows established recurring event patterns; Trigger.dev integration verified via official monorepo guides
- Pitfalls: HIGH - Identified from official docs (dev server behavior, BigInt serialization) and domain knowledge (month-end clamping, duplicate prevention)
- Code examples: MEDIUM - Based on official docs patterns adapted to Finora's specific stack; not copy-paste from a working example

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days; Trigger.dev v4 is stable GA)
