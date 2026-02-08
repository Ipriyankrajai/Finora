---
phase: 07-recurring-transactions
plan: 02
subsystem: infra
tags: [trigger.dev, cron, background-jobs, prisma, recurring-transactions]

# Dependency graph
requires:
  - phase: 07-recurring-transactions (plan 01)
    provides: RecurringRule, RecurringOccurrence models, computeNextOccurrence utility
provides:
  - Trigger.dev scheduled task for auto-generating transactions from recurring rules
  - Hourly cron engine with idempotent deduplication
  - TRIGGER_SECRET_KEY env validation
affects: [07-04-lifecycle-mutations, deployment, monitoring]

# Tech tracking
tech-stack:
  added: ["@trigger.dev/sdk@4.3.3", "@trigger.dev/build@4.3.3", "trigger.dev@4.3.3", "concurrently@9.2.1"]
  patterns: ["Trigger.dev scheduled task with Prisma 7 modern mode", "Idempotent job execution via unique constraint"]

key-files:
  created:
    - apps/web/trigger.config.ts
    - apps/web/src/trigger/generate-recurring.ts
  modified:
    - apps/web/package.json
    - packages/env/src/server.ts
    - bun.lock

key-decisions:
  - "Duplicated computeNextOccurrence in trigger file to avoid cross-package import complexity in Trigger.dev worker bundler"
  - "Used Prisma 7 modern mode for Trigger.dev build extension (no Rust binaries needed with adapter pattern)"
  - "TRIGGER_SECRET_KEY made optional so app starts without Trigger.dev configured"
  - "Safety limit of 100 occurrences per rule per run to prevent runaway loops"
  - "Auto-pause rules that hit endDate or maxOccurrences during generation"

patterns-established:
  - "Trigger.dev task pattern: schedules.task with cron, db.$transaction for atomicity"
  - "Idempotent job dedup: findUnique on composite key before insert"
  - "Error isolation: try/catch per rule so one failure doesn't block others"

# Metrics
duration: 6min
completed: 2026-02-07
---

# Phase 7 Plan 02: Trigger.dev Generation Engine Summary

**Hourly Trigger.dev cron task generates transactions from recurring rules with idempotent dedup via @@unique constraint and Prisma $transaction atomicity**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-07T15:54:33Z
- **Completed:** 2026-02-07T16:00:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Trigger.dev SDK installed and configured with Prisma 7 modern mode build extension
- Scheduled task runs hourly, queries all active rules with past-due nextOccurrenceDate
- Generation engine creates transactions inside Prisma $transaction blocks with tag copying
- Idempotent deduplication prevents duplicate transactions via @@unique([ruleId, scheduledDate])
- End conditions (endDate, maxOccurrences) enforced with auto-pause on completion
- Dev script runs Next.js and Trigger.dev servers concurrently

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Trigger.dev dependencies and configure environment** - `f473502` (feat)
2. **Task 2: Implement recurring transaction generation scheduled task** - `0688ddb` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `apps/web/trigger.config.ts` - Trigger.dev project configuration with Prisma 7 modern mode, retry policy, and src/trigger directory
- `apps/web/src/trigger/generate-recurring.ts` - Scheduled task: hourly cron, processes all active rules, generates transactions with dedup
- `apps/web/package.json` - Added Trigger.dev deps, concurrent dev script, deploy:trigger script
- `packages/env/src/server.ts` - Added optional TRIGGER_SECRET_KEY to env validation schema
- `bun.lock` - Updated lockfile with new dependencies

## Decisions Made
- **Duplicated computeNextOccurrence:** The API package's lib/recurring.ts exports this function, but Trigger.dev's worker bundler resolves imports differently from Next.js. Rather than adding a complex cross-package export chain, the ~30-line pure function was duplicated with a comment referencing the canonical source. This avoids import fragility in the worker runtime.
- **Prisma modern mode:** Project uses Prisma 7 with @prisma/adapter-pg, so the "modern" build extension mode was used (no Rust query engine binaries needed).
- **Optional TRIGGER_SECRET_KEY:** Made optional in env schema so the main app can start without Trigger.dev configured. The cron runs independently in the Trigger.dev worker.
- **Safety limit (100 per rule per run):** Prevents infinite loops if a rule has a very old nextOccurrenceDate. Logs a warning when hit.
- **Auto-pause on end conditions:** When a rule hits its endDate or maxOccurrences during generation, the engine automatically sets status to PAUSED.
- **Error isolation:** Each rule is processed in its own try/catch, so one rule's failure doesn't prevent others from generating.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed PrismaClient import path**
- **Found during:** Task 2 (generation task implementation)
- **Issue:** Initial import `import type { PrismaClient } from "@finora2/db/../../prisma/generated/client"` was fragile and non-portable
- **Fix:** Used `typeof db` to derive type from the default export instead of importing PrismaClient directly
- **Files modified:** apps/web/src/trigger/generate-recurring.ts
- **Verification:** Build passes, type inference works correctly
- **Committed in:** 0688ddb (Task 2 commit)

**2. [Rule 1 - Bug] Added maxDuration to trigger config**
- **Found during:** Task 1 verification
- **Issue:** Trigger.dev SDK v4.3.3 requires `maxDuration` as a mandatory field in TriggerConfig
- **Fix:** Added `maxDuration: 300` (5 minutes, appropriate for a batch job)
- **Files modified:** apps/web/trigger.config.ts
- **Verification:** TypeScript no longer reports missing property
- **Committed in:** f473502 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed prismaExtension config for Prisma 7**
- **Found during:** Task 1 (trigger config creation)
- **Issue:** Plan specified `prismaExtension({ mode: "modern" })` but initial implementation used `version` property which belongs to legacy mode
- **Fix:** Changed to `mode: "modern"` which is correct for Prisma 7 with adapter pattern
- **Files modified:** apps/web/trigger.config.ts
- **Verification:** Type matches PrismaEngineModernModeExtensionOptions
- **Committed in:** f473502 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All fixes necessary for correct compilation. No scope creep.

## Issues Encountered
- Pre-existing type error in `apps/web/src/hooks/use-recurring.ts` (from parallel plan 07-03) caused initial `bun run build` failure. This is outside our scope per plan instructions. The file is untracked and from parallel work. Build succeeded after turborepo cache handled it correctly on retry.

## User Setup Required

**External services require manual configuration.** The Trigger.dev engine requires:
- Create a Trigger.dev account at https://cloud.trigger.dev
- Create a project in the Trigger.dev dashboard
- Set `TRIGGER_SECRET_KEY` env var from Dashboard -> Project -> API Keys
- Set `DATABASE_URL` in Trigger.dev dashboard environment variables
- Optionally set `TRIGGER_PROJECT_REF` env var (defaults to "finora-dev")

## Next Phase Readiness
- Generation engine is complete and ready for the lifecycle mutations in Plan 04 (pause/resume/skip)
- The scheduled task will run automatically once Trigger.dev is configured
- Tags are copied from rules to generated transactions correctly
- nextOccurrenceDate advancement uses the same computeNextOccurrence logic as Plan 01

---
*Phase: 07-recurring-transactions*
*Completed: 2026-02-07*
