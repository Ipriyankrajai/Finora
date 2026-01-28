# External Integrations

**Analysis Date:** 2026-01-29

## APIs & External Services

**Payment Processing:**
- Not detected - No payment provider configured

**Email/SMS:**
- Not detected - No email/SMS service configured

**External APIs:**
- None detected - No third-party API integrations

## Data Storage

**Databases:**
- PostgreSQL - Primary data store
  - Connection: via `DATABASE_URL` env var
  - Client: Prisma ORM ^7.2.0 with `@prisma/adapter-pg`
  - Driver: `pg` ^8.17.1 (native PostgreSQL driver)
  - Schema: Multi-file schema in `packages/db/prisma/schema/`
  - Migrations: `packages/db/prisma/migrations/`
  - Generated client: `packages/db/prisma/generated/`

**File Storage:**
- Local filesystem only - No cloud storage configured

**Caching:**
- None - No Redis or caching layer configured

## Authentication & Identity

**Auth Provider:**
- better-auth ^1.4.9 - Custom auth framework
  - Implementation: `packages/auth/src/index.ts`
  - Database adapter: Prisma adapter for PostgreSQL
  - Email/password: Enabled
  - Token storage: Cookies via `better-auth/next-js` plugin
  - Session management: Database-backed sessions (Session model)

**Configuration:**
- `BETTER_AUTH_SECRET` - Session signing secret (min 32 chars)
- `BETTER_AUTH_URL` - Auth server URL
- `CORS_ORIGIN` - Trusted origin for cookies

**OAuth Integrations:**
- None configured - Email/password only

**Auth Schema Models:**
- `User` - User accounts with email verification
- `Session` - Active sessions with IP/UserAgent tracking
- `Account` - OAuth accounts (structure present but not used)
- `Verification` - Email verification tokens

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry or error tracking service

**Analytics:**
- None - No analytics service configured

**Logs:**
- Console only - No structured logging service

## CI/CD & Deployment

**Hosting:**
- Not configured - No deployment configuration detected
- Recommended: Vercel (Next.js optimized)

**CI Pipeline:**
- Not configured - No GitHub Actions or CI workflows

## Environment Configuration

**Required Environment Variables:**
```
DATABASE_URL         # PostgreSQL connection string
BETTER_AUTH_SECRET   # Auth signing secret (min 32 chars)
BETTER_AUTH_URL      # Auth server base URL
CORS_ORIGIN          # Trusted origin for CORS
NODE_ENV             # development | production | test (optional, defaults to development)
```

**Development:**
- Location: `apps/web/.env` (gitignored)
- Local PostgreSQL at `localhost:5432`
- Auth URL: `http://localhost:3001`

**Staging:**
- Not configured

**Production:**
- Secrets management: Configure on hosting platform
- Database: Production PostgreSQL instance required

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## API Endpoints

**Authentication Routes:**
- `/api/auth/[...all]` - better-auth catch-all handler
  - Implementation: `apps/web/src/app/api/auth/[...all]/route.ts`
  - Handles: sign-in, sign-up, sign-out, session

**tRPC API:**
- `/api/trpc/[trpc]` - tRPC router endpoint
  - Implementation: `apps/web/src/app/api/trpc/[trpc]/route.ts`
  - Router: `packages/api/src/routers/index.ts`
  - Context: Session injection via better-auth
  - Procedures:
    - `healthCheck` (public) - API health check
    - `privateData` (protected) - Returns user data

**Client Integration:**
- tRPC client: `apps/web/src/utils/trpc.ts`
  - Uses httpBatchLink with credentials
  - Integrated with TanStack Query
  - Error toasts via Sonner

- Auth client: `apps/web/src/lib/auth-client.ts`
  - better-auth React client
  - Used for sign-in/sign-up forms

---

*Integration audit: 2026-01-29*
*Update when adding/removing external services*
