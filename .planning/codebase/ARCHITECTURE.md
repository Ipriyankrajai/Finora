# Architecture

**Analysis Date:** 2026-01-29

## Pattern Overview

**Overall:** Turborepo Monorepo with Full-Stack Next.js and tRPC

**Key Characteristics:**
- Monorepo structure using Turborepo for build orchestration
- Bun as package manager with workspace catalogs for dependency management
- Type-safe API layer with tRPC connecting frontend to backend
- Better-Auth for authentication with Prisma as ORM
- Clear separation between apps (deployable) and packages (shared libraries)

## Layers

**Presentation Layer:**
- Purpose: User interface and client-side interactions
- Location: `apps/web/src/`
- Contains: React components, pages, client-side hooks, UI primitives
- Depends on: API layer via tRPC client, Auth client
- Used by: End users via browser

**API Layer:**
- Purpose: Type-safe RPC endpoints for frontend-backend communication
- Location: `packages/api/src/`
- Contains: tRPC router definitions, procedure handlers, context creation
- Depends on: Auth package, DB package, Env package
- Used by: Presentation layer via tRPC client

**Auth Layer:**
- Purpose: Authentication and session management
- Location: `packages/auth/src/`
- Contains: Better-Auth configuration, session validation
- Depends on: DB package, Env package
- Used by: API layer (context), Presentation layer (auth client)

**Data Layer:**
- Purpose: Database access and schema definitions
- Location: `packages/db/`
- Contains: Prisma schema, PrismaClient configuration
- Depends on: Env package
- Used by: Auth layer, API layer

**Environment Layer:**
- Purpose: Type-safe environment variable management
- Location: `packages/env/src/`
- Contains: Server and client env schemas with Zod validation
- Depends on: Nothing (leaf dependency)
- Used by: All other packages

**Configuration Layer:**
- Purpose: Shared TypeScript configuration
- Location: `packages/config/`
- Contains: Base tsconfig.json
- Depends on: Nothing
- Used by: All packages for TypeScript configuration

## Data Flow

**HTTP Request Flow (tRPC):**

1. User interacts with React component in `apps/web/`
2. Component calls tRPC procedure via `trpc` proxy from `apps/web/src/utils/trpc.ts`
3. Request hits Next.js API route at `apps/web/src/app/api/trpc/[trpc]/route.ts`
4. Route handler creates context via `packages/api/src/context.ts` (extracts session)
5. tRPC router in `packages/api/src/routers/index.ts` handles procedure
6. Procedure validates auth (if protected), executes logic, queries DB
7. Response flows back through tRPC to React Query cache
8. Component re-renders with data

**Authentication Flow:**

1. User submits credentials via `apps/web/src/components/sign-in-form.tsx`
2. `authClient.signIn.email()` calls Better-Auth API
3. Request hits `apps/web/src/app/api/auth/[...all]/route.ts`
4. Better-Auth handler (`packages/auth/src/index.ts`) validates credentials
5. Session created in database via Prisma adapter
6. Cookie set via `nextCookies()` plugin
7. Client redirected, session available in subsequent requests

**State Management:**
- Server State: React Query (TanStack Query) manages server data caching
- Auth State: Better-Auth client manages session state
- UI State: React local state (useState)
- Theme State: next-themes manages dark/light mode

## Key Abstractions

**tRPC Procedures:**
- Purpose: Type-safe API endpoints with input validation
- Examples: `packages/api/src/routers/index.ts` (healthCheck, privateData)
- Pattern: Procedure definitions with `publicProcedure` or `protectedProcedure`

**Workspace Packages:**
- Purpose: Shared, reusable code across apps
- Examples: `@finora2/api`, `@finora2/auth`, `@finora2/db`, `@finora2/env`
- Pattern: Internal packages with `workspace:*` dependencies

**React Components:**
- Purpose: Reusable UI elements
- Examples: `apps/web/src/components/ui/*.tsx` (Button, Card, Input)
- Pattern: Shadcn-style components with class-variance-authority

**Providers:**
- Purpose: Context providers wrapping application
- Examples: `apps/web/src/components/providers.tsx`
- Pattern: Nested providers (Theme, QueryClient, Toaster)

## Entry Points

**Web Application:**
- Location: `apps/web/src/app/layout.tsx`
- Triggers: HTTP request to web app
- Responsibilities: Root layout, provider setup, global styles

**tRPC API:**
- Location: `apps/web/src/app/api/trpc/[trpc]/route.ts`
- Triggers: tRPC client requests to `/api/trpc/*`
- Responsibilities: Create context, route to tRPC handlers

**Auth API:**
- Location: `apps/web/src/app/api/auth/[...all]/route.ts`
- Triggers: Auth-related requests to `/api/auth/*`
- Responsibilities: Handle sign-in, sign-up, sign-out, session management

**Database Client:**
- Location: `packages/db/src/index.ts`
- Triggers: Import by auth or api packages
- Responsibilities: Configure and export PrismaClient with PostgreSQL adapter

## Error Handling

**Strategy:** Layered error handling with toast notifications at UI layer

**Patterns:**
- tRPC procedures throw `TRPCError` for auth failures (`packages/api/src/index.ts`)
- React Query `onError` callback shows toast via Sonner (`apps/web/src/utils/trpc.ts`)
- Form validation errors displayed inline via TanStack Form
- Auth errors handled via Better-Auth callbacks with toast notifications

## Cross-Cutting Concerns

**Logging:**
- Console-based logging (no structured logging framework detected)
- Development: React Query Devtools for query state inspection

**Validation:**
- Zod schemas for environment variables (`packages/env/src/server.ts`)
- Zod schemas for form validation (`apps/web/src/components/sign-in-form.tsx`)
- tRPC input validation (not yet implemented in current routers)

**Authentication:**
- Better-Auth with Prisma adapter
- Session stored in database (Session model)
- Cookie-based session with `nextCookies()` plugin
- Protected routes use `protectedProcedure` middleware in tRPC
- Server-side session check in pages (`apps/web/src/app/dashboard/page.tsx`)

**Styling:**
- Tailwind CSS v4 with PostCSS
- Class merging via `tailwind-merge` and `clsx`
- Component variants via `class-variance-authority`
- Dark mode via `next-themes`

---

*Architecture analysis: 2026-01-29*
*Update when major patterns change*
