# Testing Patterns

**Analysis Date:** 2026-01-29

## Test Framework

**Runner:**
- No test framework configured
- No test files present in codebase

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands defined in package.json
# Recommended setup would be:
bun test                              # Run all tests
bun test --watch                      # Watch mode
bun test path/to/file.test.ts        # Single file
```

## Test File Organization

**Location:**
- No test files exist
- Recommended pattern: `*.test.ts` alongside source files

**Naming:**
- Recommended: `module-name.test.ts` for unit tests
- Recommended: `feature.integration.test.ts` for integration tests

**Recommended Structure:**
```
apps/web/src/
  components/
    sign-in-form.tsx
    sign-in-form.test.tsx      # (recommended)
  lib/
    utils.ts
    utils.test.ts              # (recommended)
    auth-client.ts
    auth-client.test.ts        # (recommended)

packages/api/src/
  index.ts
  index.test.ts                # (recommended)
  context.ts
  context.test.ts              # (recommended)
```

## Test Structure

**Suite Organization:**
```typescript
// Recommended pattern for this codebase
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";

describe("ModuleName", () => {
  describe("functionName", () => {
    beforeEach(() => {
      // reset state
    });

    it("should handle valid input", () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it("should throw on invalid input", () => {
      expect(() => functionName(null)).toThrow("Invalid input");
    });
  });
});
```

**Patterns:**
- Use beforeEach for per-test setup
- Use afterEach to clean up mocks
- Arrange/Act/Assert structure recommended
- One focus per test

## Mocking

**Framework:**
- Bun native mocking recommended (`bun:test`)

**Patterns:**
```typescript
import { mock } from "bun:test";

// Mock module
mock.module("@finora2/auth", () => ({
  auth: {
    api: {
      getSession: mock(() => Promise.resolve({ user: { id: "1" } }))
    }
  }
}));

// Mock fetch for tRPC
global.fetch = mock(() =>
  Promise.resolve(new Response(JSON.stringify({ result: { data: "test" } })))
);
```

**What to Mock:**
- External API calls (better-auth, database)
- Next.js navigation (`useRouter`)
- Environment variables
- Database client (Prisma)

**What NOT to Mock:**
- Pure utility functions (`cn`, class merging)
- Zod schemas and validation
- React components under test

## Fixtures and Factories

**Test Data:**
```typescript
// Recommended factory pattern for this codebase
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: "test-id",
    name: "Test User",
    email: "test@example.com",
    ...overrides
  };
}

function createTestSession(overrides?: Partial<Session>): Session {
  return {
    user: createTestUser(),
    ...overrides
  };
}

// Mock tRPC context
function createTestContext(overrides?: Partial<Context>): Context {
  return {
    session: createTestSession(),
    ...overrides
  };
}
```

**Location:**
- Recommended: `tests/fixtures/` for shared fixtures
- Recommended: Factory functions in test file when simple

## Coverage

**Requirements:**
- Not configured
- No coverage targets enforced

**Recommended Configuration:**
```typescript
// bunfig.toml
[test]
coverage = true
coverageThreshold = { line = 80, function = 80, statement = 80 }
```

**View Coverage:**
```bash
bun test --coverage
```

## Test Types

**Unit Tests:**
- Test single function/component in isolation
- Mock all external dependencies
- Fast execution (<100ms per test)
- Priority: utility functions, form validation, tRPC procedures

**Integration Tests:**
- Test multiple modules together
- Mock external services (database, auth)
- Priority: API routes, auth flows

**E2E Tests:**
- Not configured
- Recommended: Playwright for E2E testing
- Priority: Auth flows, form submissions, navigation

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBe("expected");
});
```

**Error Testing:**
```typescript
it("should throw on invalid input", () => {
  expect(() => parse(null)).toThrow("Cannot parse null");
});

// Async error
it("should reject on auth failure", async () => {
  await expect(authClient.signIn({})).rejects.toThrow("Unauthorized");
});
```

**React Component Testing:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react";

describe("SignInForm", () => {
  it("should render email input", () => {
    render(<SignInForm onSwitchToSignUp={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("should call onSwitchToSignUp when link clicked", () => {
    const mockSwitch = mock(() => {});
    render(<SignInForm onSwitchToSignUp={mockSwitch} />);
    fireEvent.click(screen.getByText(/Need an account/));
    expect(mockSwitch).toHaveBeenCalled();
  });
});
```

**tRPC Procedure Testing:**
```typescript
import { appRouter } from "@finora2/api/routers/index";

describe("appRouter", () => {
  describe("healthCheck", () => {
    it("should return OK", async () => {
      const caller = appRouter.createCaller({ session: null });
      const result = await caller.healthCheck();
      expect(result).toBe("OK");
    });
  });

  describe("privateData", () => {
    it("should throw when no session", async () => {
      const caller = appRouter.createCaller({ session: null });
      await expect(caller.privateData()).rejects.toThrow("UNAUTHORIZED");
    });

    it("should return data with session", async () => {
      const caller = appRouter.createCaller({
        session: createTestSession()
      });
      const result = await caller.privateData();
      expect(result.message).toBe("This is private");
    });
  });
});
```

**Snapshot Testing:**
- Not recommended for this codebase
- Prefer explicit assertions for clarity

## Recommended Test Setup

**Installation:**
```bash
bun add -D @testing-library/react @testing-library/dom jsdom
```

**Configuration (`bunfig.toml`):**
```toml
[test]
preload = ["./tests/setup.ts"]

[test.coverage]
skipTestFiles = true
```

**Setup File (`tests/setup.ts`):**
```typescript
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-must-be-32-characters";
process.env.BETTER_AUTH_URL = "http://localhost:3001";
process.env.CORS_ORIGIN = "http://localhost:3001";
```

## Testing Priorities

**High Priority (implement first):**
1. tRPC procedures (`packages/api/src/routers/index.ts`)
2. Auth context creation (`packages/api/src/context.ts`)
3. Environment validation (`packages/env/src/server.ts`)

**Medium Priority:**
1. Utility functions (`apps/web/src/lib/utils.ts`)
2. Form validation logic (Zod schemas)
3. React component interactions

**Low Priority:**
1. UI component styling (visual testing)
2. Theme provider behavior
3. Static page rendering

---

*Testing analysis: 2026-01-29*
*Update when test patterns are established*
