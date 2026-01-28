# Codebase Structure

**Analysis Date:** 2026-01-29

## Directory Layout

```
finora2/
├── apps/                    # Deployable applications
│   └── web/                 # Next.js web application
├── packages/                # Shared internal packages
│   ├── api/                 # tRPC API layer
│   ├── auth/                # Better-Auth configuration
│   ├── config/              # Shared TypeScript config
│   ├── db/                  # Prisma database layer
│   └── env/                 # Environment variable validation
├── .claude/                 # Claude Code configuration
├── .planning/               # Planning documents
├── package.json             # Root workspace manifest
├── turbo.json               # Turborepo configuration
├── biome.json               # Biome linter/formatter config
└── tsconfig.json            # Root TypeScript config
```

## Directory Purposes

**apps/web/**
- Purpose: Main Next.js web application (App Router)
- Contains: Pages, components, API routes, styles
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`
- Subdirectories:
  - `src/app/` - Next.js App Router pages and API routes
  - `src/components/` - React components
  - `src/components/ui/` - Shadcn UI primitives
  - `src/lib/` - Client-side utilities
  - `src/utils/` - Shared utilities (tRPC client)

**packages/api/**
- Purpose: tRPC router and procedure definitions
- Contains: Router setup, context creation, procedure definitions
- Key files:
  - `src/index.ts` - tRPC initialization, procedure helpers
  - `src/context.ts` - Request context creation
  - `src/routers/index.ts` - Main app router

**packages/auth/**
- Purpose: Better-Auth configuration and setup
- Contains: Auth instance with Prisma adapter
- Key files: `src/index.ts` - Auth configuration export

**packages/config/**
- Purpose: Shared TypeScript configuration
- Contains: Base tsconfig for workspace packages
- Key files: `tsconfig.base.json`

**packages/db/**
- Purpose: Database access layer with Prisma
- Contains: Prisma schema, client configuration
- Key files:
  - `src/index.ts` - PrismaClient export
  - `prisma/schema/schema.prisma` - Generator and datasource
  - `prisma/schema/auth.prisma` - Auth-related models
  - `prisma/generated/` - Generated Prisma client (gitignored)

**packages/env/**
- Purpose: Type-safe environment variable validation
- Contains: Zod schemas for server and client env vars
- Key files:
  - `src/server.ts` - Server-side env validation
  - `src/web.ts` - Client-side env validation

## Key File Locations

**Entry Points:**
- `apps/web/src/app/layout.tsx` - Root layout component
- `apps/web/src/app/page.tsx` - Home page
- `apps/web/src/app/api/trpc/[trpc]/route.ts` - tRPC API handler
- `apps/web/src/app/api/auth/[...all]/route.ts` - Auth API handler

**Configuration:**
- `package.json` - Root workspace config with bun catalogs
- `turbo.json` - Turborepo task definitions
- `biome.json` - Linter and formatter configuration
- `tsconfig.json` - Root TypeScript config (extends packages/config)
- `apps/web/next.config.ts` - Next.js configuration
- `packages/db/prisma.config.ts` - Prisma configuration

**Core Logic:**
- `packages/api/src/routers/index.ts` - API routes definition
- `packages/api/src/index.ts` - tRPC setup and procedures
- `packages/auth/src/index.ts` - Auth configuration
- `packages/db/src/index.ts` - Database client

**Components:**
- `apps/web/src/components/providers.tsx` - App providers
- `apps/web/src/components/header.tsx` - Navigation header
- `apps/web/src/components/sign-in-form.tsx` - Login form
- `apps/web/src/components/sign-up-form.tsx` - Registration form
- `apps/web/src/components/ui/*.tsx` - UI primitives

**Testing:**
- No test directory detected (not yet configured)

**Documentation:**
- `README.md` - Project documentation

## Naming Conventions

**Files:**
- `kebab-case.ts` - TypeScript modules (e.g., `auth-client.ts`)
- `kebab-case.tsx` - React components (e.g., `sign-in-form.tsx`)
- `[param]` - Dynamic route segments (e.g., `[trpc]`, `[...all]`)
- `page.tsx` - Next.js page components
- `route.ts` - Next.js API route handlers
- `layout.tsx` - Next.js layout components

**Directories:**
- `kebab-case` - All directories use kebab-case
- `ui/` - UI primitive components
- `src/` - Source code in each package
- `prisma/` - Prisma-related files

**Special Patterns:**
- `index.ts` - Package entry points and barrel exports
- `*.prisma` - Prisma schema files (can be split across multiple)
- `generated/` - Auto-generated code (Prisma client)

## Where to Add New Code

**New Page:**
- Implementation: `apps/web/src/app/{route}/page.tsx`
- Layout (optional): `apps/web/src/app/{route}/layout.tsx`

**New tRPC Router:**
- Router file: `packages/api/src/routers/{name}.ts`
- Import in: `packages/api/src/routers/index.ts`

**New Component:**
- Feature component: `apps/web/src/components/{name}.tsx`
- UI primitive: `apps/web/src/components/ui/{name}.tsx`

**New Database Model:**
- Schema: `packages/db/prisma/schema/{domain}.prisma`
- Run: `bun run db:generate` then `bun run db:push`

**New API Route (non-tRPC):**
- Implementation: `apps/web/src/app/api/{path}/route.ts`

**Shared Utilities:**
- Server-side: `packages/{appropriate-package}/src/`
- Client-side: `apps/web/src/lib/` or `apps/web/src/utils/`

**Environment Variables:**
- Server: Add to `packages/env/src/server.ts`
- Client: Add to `packages/env/src/web.ts`

## Special Directories

**packages/db/prisma/generated/**
- Purpose: Generated Prisma client code
- Source: Auto-generated by `prisma generate`
- Committed: No (should be in .gitignore)

**apps/web/.next/**
- Purpose: Next.js build output
- Source: Auto-generated by `next build`
- Committed: No

**.claude/**
- Purpose: Claude Code configuration and GSD framework
- Source: Manual configuration
- Committed: Yes

**.planning/**
- Purpose: Project planning documents
- Source: Generated by GSD commands
- Committed: Yes

---

*Structure analysis: 2026-01-29*
*Update when directory structure changes*
