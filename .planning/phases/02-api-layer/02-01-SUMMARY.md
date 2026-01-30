---
phase: 02-api-layer
plan: 01
subsystem: api
tags: [trpc, superjson, zod, tag-router, crud]
dependency-graph:
  requires: [01-foundation]
  provides: [trpc-setup, tag-crud-endpoints, createCallerFactory]
  affects: [02-02, 02-03, 02-04, 03-ui-layer]
tech-stack:
  added: [superjson@2.2.6]
  patterns: [tRPC-superjson-transformer, zod-input-validation, soft-delete, authorization-checks]
key-files:
  created:
    - packages/api/src/schemas/common.ts
    - packages/api/src/schemas/tag.ts
    - packages/api/src/routers/tag.ts
    - packages/api/src/routers/__tests__/tag.test.ts
  modified:
    - packages/api/package.json
    - packages/api/src/index.ts
    - packages/api/src/routers/index.ts
decisions:
  - id: trpc-superjson
    choice: "superjson transformer for BigInt/Date serialization"
    rationale: "Required for BigInt money fields, standard pattern"
  - id: soft-delete
    choice: "isActive=false for tag deletion"
    rationale: "Per Phase 1 schema design, preserves history"
  - id: authorization-check
    choice: "UNAUTHORIZED for accessing other user's tags"
    rationale: "Per CONTEXT.md - distinguish UNAUTHORIZED from NOT_FOUND"
metrics:
  duration: 9 min
  completed: 2026-01-30
---

# Phase 2 Plan 1: tRPC Setup + Tag Router Summary

**One-liner:** superjson transformer configured with createCallerFactory export, tag CRUD with authorization checks and soft delete

## What Was Done

### Task 1: superjson Configuration
- Installed superjson@2.2.6 for BigInt/Date serialization
- Configured tRPC transformer in `packages/api/src/index.ts`
- Added errorFormatter for Zod validation error flattening
- Exported `createCallerFactory` for testing

### Task 2: Tag Schemas and Router
- Created `schemas/common.ts` with reusable validation (cuidInput, hexColorInput, trimmedString)
- Created `schemas/tag.ts` with createTagInput, updateTagInput, deleteTagInput schemas
- Implemented tag router with 4 procedures:
  - `list`: Returns user's active tags ordered by name
  - `create`: Creates tag with name/color, userId from session
  - `update`: Updates name/color with authorization check
  - `delete`: Soft delete (isActive = false) with authorization check
- Added authorization checks per CONTEXT.md (UNAUTHORIZED when accessing other user's tags)

### Task 3: Tag Router Tests
- 17 test cases covering all CRUD operations
- Happy path tests: list, create, update, delete
- Validation tests: empty name, whitespace, color format, max length
- Error tests: NOT_FOUND, UNAUTHORIZED
- Used valid CUID format IDs for test data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed loan router import path**
- **Found during:** Task 2 typecheck
- **Issue:** loan.ts had import from `@finora2/db/prisma/generated/enums` which doesn't exist
- **Fix:** Changed to `import db, { InterestType } from "@finora2/db"`
- **Files modified:** packages/api/src/routers/loan.ts
- **Note:** This was uncommitted work from a previous session, not part of plan 02-01

**2. [Rule 3 - Blocking] Fixed db package type exports**
- **Found during:** Task 2 typecheck
- **Issue:** db/src/index.ts exported TransactionTagOmit instead of TransactionTagModel
- **Fix:** Changed to TransactionTagModel
- **Files modified:** packages/db/src/index.ts
- **Note:** This was uncommitted work from a previous session

## Key Patterns Established

### Authorization Pattern
```typescript
const tag = await prisma.tag.findUnique({ where: { id: input.id } });
if (!tag) throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
if (tag.userId !== ctx.session.user.id) {
  throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have access to this tag" });
}
```

### Soft Delete Pattern
```typescript
return prisma.tag.update({
  where: { id: input.id },
  data: { isActive: false },
});
```

### Test Mock Pattern
```typescript
vi.mock("@finora2/db", () => ({
  default: { tag: { findMany: vi.fn(), ... } },
  InterestType: { FIXED: "FIXED", VARIABLE: "VARIABLE" },
}));
const caller = createCaller({ session: mockSession } as any);
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 7dd56d4 | feat | configure tRPC with superjson transformer |
| 0977477 | feat | implement tag CRUD router with authorization |
| 74a6ff0 | test | add comprehensive tag router test coverage |

## Next Phase Readiness

**Blockers:** None

**Ready for:**
- 02-02: Transaction router can follow same patterns
- 02-03: Loan router can follow same patterns
- 02-04: Dashboard can use tag data

**Patterns established for subsequent plans:**
- Authorization check pattern (UNAUTHORIZED vs NOT_FOUND)
- Soft delete pattern (isActive = false)
- Test mocking pattern (vi.mock with inline objects)
- Schema organization (common.ts + entity.ts)

---

*Phase: 02-api-layer | Plan: 01 | Completed: 2026-01-30*
