# Technology Stack

**Analysis Date:** 2026-01-29

## Languages

**Primary:**
- TypeScript ^5 - All application code (frontend, backend, packages)

**Secondary:**
- JavaScript - Configuration files (postcss.config.mjs)

## Runtime

**Environment:**
- Bun 1.3.2 - Primary runtime and package manager
- Node.js (ESNext target) - Compatibility target

**Package Manager:**
- Bun 1.3.2 (specified via packageManager field)
- Lockfile: `bun.lock` present
- Workspace catalog: Centralized version management for shared dependencies

## Frameworks

**Core:**
- Next.js ^16.1.1 - Full-stack React framework with App Router
- React ^19.2.3 - UI library with React Compiler enabled
- tRPC ^11.7.2 - End-to-end typesafe API layer

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- Turborepo ^2.6.3 - Monorepo build orchestration
- TypeScript ^5 - Type checking and compilation
- PostCSS with Tailwind CSS ^4.1.10 - Styling pipeline
- React Compiler (babel-plugin-react-compiler ^1.0.0) - Automatic optimization

## Key Dependencies

**Critical:**
- better-auth ^1.4.9 - Authentication framework with email/password support
- @prisma/client ^7.2.0 - Database ORM client
- @tanstack/react-query ^5.90.12 - Server state management
- zod ^4.1.13 - Runtime schema validation

**Infrastructure:**
- @prisma/adapter-pg ^7.2.0 - PostgreSQL adapter for Prisma
- pg ^8.17.1 - PostgreSQL client driver
- @t3-oss/env-core ^0.13.1 - Type-safe environment variables
- @t3-oss/env-nextjs ^0.13.1 - Next.js environment integration

**UI:**
- shadcn/ui (base-lyra style) - Component library foundation
- @base-ui/react ^1.0.0 - Headless UI primitives
- lucide-react ^0.546.0 - Icon library
- class-variance-authority ^0.7.1 - Variant styling
- tailwind-merge ^3.3.1 - Tailwind class merging
- next-themes ^0.4.6 - Theme management
- sonner ^2.0.5 - Toast notifications

## Configuration

**Environment:**
- `.env` files in `apps/web/`
- Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`
- Type-safe validation via @t3-oss/env packages

**Build:**
- `turbo.json` - Turborepo task definitions
- `biome.json` - Linting and formatting (tabs, double quotes)
- `tsconfig.json` - TypeScript base config in `@finora2/config`
- `next.config.ts` - Next.js with typed routes and React Compiler
- `prisma.config.ts` - Prisma multi-file schema configuration

**Linting/Formatting:**
- Biome - Unified linter and formatter
- Indent style: tabs
- Quote style: double quotes
- Tailwind class sorting enabled (clsx, cva, cn functions)

## Platform Requirements

**Development:**
- macOS/Linux/Windows with Bun installed
- PostgreSQL database (local or remote)
- No Docker required (direct PostgreSQL connection)

**Production:**
- Next.js compatible hosting (Vercel recommended)
- PostgreSQL database
- Environment variables configured on hosting platform

## Monorepo Structure

**Workspaces:**
- `apps/*` - Application packages
- `packages/*` - Shared library packages

**Package Catalog (Centralized Versions):**
- dotenv: ^17.2.2
- zod: ^4.1.13
- typescript: ^5
- next: ^16.1.1
- @prisma/client: ^7.2.0
- @trpc/server: ^11.7.2
- @trpc/client: ^11.7.2
- better-auth: ^1.4.9

---

*Stack analysis: 2026-01-29*
*Update after major dependency changes*
