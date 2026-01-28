# Codebase Concerns

**Analysis Date:** 2025-01-29

## Tech Debt

**Duplicate form validation logic:**
- Issue: Sign-in and sign-up forms have nearly identical structure and validation patterns
- Files: `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx`
- Why: Rapid prototyping, forms created independently
- Impact: Changes to form behavior require updates in multiple places, inconsistent UX possible
- Fix approach: Extract shared form field components and validation schemas to `apps/web/src/components/forms/` or create a shared form builder utility

**Unused import in dashboard page:**
- Issue: `authClient` imported but not used in server component
- File: `apps/web/src/app/dashboard/page.tsx` (line 5)
- Why: Likely leftover from refactoring
- Impact: Unnecessary bundle size, confusing code
- Fix approach: Remove unused import

**No centralized error handling:**
- Issue: Error handling is inconsistent across the application (some toast, some throw)
- Files: `apps/web/src/utils/trpc.ts` (QueryCache error handler), `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx`
- Why: Early stage development, no error handling strategy defined
- Impact: Inconsistent user experience, difficult debugging
- Fix approach: Create centralized error handling utility in `apps/web/src/lib/errors.ts` with standardized error types and user-facing messages

**Empty client env configuration:**
- Issue: `packages/env/src/web.ts` has empty client configuration with no env vars
- File: `packages/env/src/web.ts`
- Why: Initial setup, no client-side env vars needed yet
- Impact: No immediate impact, but pattern needs extension when client vars are needed
- Fix approach: Add NEXT_PUBLIC_ vars to client config when needed, document pattern for future use

## Known Bugs

**No known bugs documented at this time.**

The codebase is in early development stage with minimal functionality. Monitor for issues as features are added.

## Security Considerations

**Secrets committed to repository:**
- Risk: `.env` file with `BETTER_AUTH_SECRET` and database credentials is tracked in version control
- File: `apps/web/.env`
- Current mitigation: Local development only, hardcoded development values
- Recommendations:
  1. Remove `apps/web/.env` from git tracking immediately
  2. Add `.env` to `apps/web/.gitignore` (already present but file was committed before)
  3. Create `apps/web/.env.example` with placeholder values
  4. Regenerate `BETTER_AUTH_SECRET` for any deployed environments

**No route protection middleware:**
- Risk: Protected routes rely on page-level auth checks, no centralized route protection
- Files: `apps/web/src/app/dashboard/page.tsx` (manual redirect check)
- Current mitigation: Individual page redirects work but are easy to forget
- Recommendations: Create `apps/web/src/middleware.ts` with route matcher for protected paths

**No CSRF protection verification:**
- Risk: Better-auth handles CSRF but no verification that it's properly configured
- File: `packages/auth/src/index.ts`
- Current mitigation: Better-auth default CSRF protection
- Recommendations: Add explicit CSRF configuration, verify cookie settings for production

**Password policy is weak:**
- Risk: Only 8-character minimum, no complexity requirements
- Files: `apps/web/src/components/sign-in-form.tsx` (line 42), `apps/web/src/components/sign-up-form.tsx` (line 45)
- Current mitigation: None
- Recommendations: Add password complexity validation (uppercase, lowercase, number, special char)

**No rate limiting on auth endpoints:**
- Risk: Brute force attacks possible on login/signup endpoints
- File: `apps/web/src/app/api/auth/[...all]/route.ts`
- Current mitigation: None
- Recommendations: Add rate limiting middleware or use better-auth's built-in rate limiting plugin

## Performance Bottlenecks

**No performance bottlenecks identified yet.**

The application is minimal with basic API calls. Performance considerations:
- `apps/web/src/app/page.tsx`: Health check query on every home page load (consider caching)
- `apps/web/src/app/dashboard/dashboard.tsx`: Private data query on mount (acceptable)

**Potential future bottleneck:**
- Problem: No query caching strategy configured
- Files: `apps/web/src/utils/trpc.ts`
- Improvement path: Add `staleTime` and `gcTime` defaults to QueryClient configuration

## Fragile Areas

**Auth client configuration:**
- File: `apps/web/src/lib/auth-client.ts`
- Why fragile: Empty configuration object with no explicit baseURL
- Common failures: Could break if deployed to different domain or subdomain
- Safe modification: Add explicit `baseURL` configuration
- Test coverage: No tests

**tRPC context creation:**
- File: `packages/api/src/context.ts`
- Why fragile: Session retrieval depends on header forwarding working correctly
- Common failures: Session null if headers not passed correctly in SSR scenarios
- Safe modification: Add error logging for session retrieval failures
- Test coverage: No tests

**Prisma client singleton:**
- File: `packages/db/src/index.ts`
- Why fragile: No connection pooling configuration, no error handling for connection failures
- Common failures: Database connection issues not gracefully handled
- Safe modification: Add connection retry logic and health check
- Test coverage: No tests

## Scaling Limits

**Database connection pooling:**
- Current capacity: Single connection via PrismaPg adapter
- Limit: ~10-20 concurrent connections before exhaustion (PostgreSQL default)
- Symptoms at limit: Connection timeout errors, failed queries
- Scaling path: Configure connection pool size in PrismaPg adapter, consider Prisma Accelerate for serverless

**No caching layer:**
- Current capacity: All requests hit database directly
- Limit: Database bottleneck as traffic increases
- Symptoms at limit: Slow response times, database CPU spike
- Scaling path: Add Redis or in-memory caching for frequently accessed data

## Dependencies at Risk

**better-auth (v1.4.9):**
- Risk: Relatively new library with active development, API may change
- Impact: Auth system breaks on incompatible updates
- Migration plan: Pin to specific version, test updates in staging, have Clerk/NextAuth as fallback option

**@base-ui/react (v1.0.0):**
- Risk: Brand new UI library (v1.0.0), may have undiscovered bugs
- Impact: UI component issues, accessibility problems
- Migration plan: Monitor GitHub issues, have shadcn/ui primitives as fallback

**React 19 (v19.2.3):**
- Risk: Very recent major version, ecosystem compatibility still evolving
- Impact: Third-party library incompatibilities possible
- Migration plan: Monitor React 19 compatibility issues, pin compatible dependency versions

**Next.js 16 (v16.1.1):**
- Risk: Cutting-edge version, may have undiscovered issues
- Impact: Build failures, runtime errors, deployment issues
- Migration plan: Have downgrade path to Next.js 15 documented, test thoroughly before production

## Missing Critical Features

**No email verification flow:**
- Problem: Users can sign up without verifying email ownership
- Current workaround: None (emailVerified field exists but not enforced)
- Blocks: Cannot trust user email addresses, spam account risk
- Implementation complexity: Medium (add better-auth email plugin, create verification page)

**No password reset flow:**
- Problem: Users cannot recover accounts if they forget password
- Current workaround: Manual database intervention
- Blocks: User lockout scenarios, support burden
- Implementation complexity: Low-Medium (add better-auth password reset, create reset page)

**No logging/monitoring:**
- Problem: No structured logging, no error tracking, no performance monitoring
- Current workaround: Console output only
- Blocks: Production debugging, incident response, performance optimization
- Implementation complexity: Low (add Sentry or similar, structured logging library)

**No database migrations:**
- Problem: Using `db:push` only, no migration history
- Current workaround: Direct schema push
- Blocks: Safe production schema updates, rollback capability
- Implementation complexity: Low (switch to `prisma migrate dev`)

## Test Coverage Gaps

**Complete absence of tests:**
- What's not tested: Entire codebase has zero test files
- Risk: Any change can break existing functionality unnoticed
- Priority: High
- Difficulty to test: Need to set up testing infrastructure first

**Critical untested areas (in priority order):**

1. **Authentication flow:**
   - Files: `apps/web/src/components/sign-in-form.tsx`, `apps/web/src/components/sign-up-form.tsx`, `packages/auth/src/index.ts`
   - Risk: Auth breaks silently, users locked out
   - Priority: High

2. **tRPC procedures:**
   - Files: `packages/api/src/routers/index.ts`, `packages/api/src/index.ts`
   - Risk: API breaks, authorization bypass possible
   - Priority: High

3. **Protected route access:**
   - File: `apps/web/src/app/dashboard/page.tsx`
   - Risk: Unauthorized access to protected pages
   - Priority: High

4. **Database operations:**
   - Files: `packages/db/src/index.ts`, Prisma schema
   - Risk: Data corruption, connection failures
   - Priority: Medium

**Testing infrastructure needed:**
- Test framework: Vitest (recommended for monorepo)
- Component testing: React Testing Library
- E2E testing: Playwright
- API testing: Vitest with tRPC caller

---

*Concerns audit: 2025-01-29*
*Update as issues are fixed or new ones discovered*
