# Coding Conventions

**Analysis Date:** 2026-01-29

## Naming Patterns

**Files:**
- kebab-case for all files (`auth-client.ts`, `sign-in-form.tsx`, `user-menu.tsx`)
- PascalCase for page components (`page.tsx`) following Next.js conventions
- Lowercase for UI components (`button.tsx`, `card.tsx`, `dropdown-menu.tsx`)
- `index.ts` for barrel exports in packages

**Functions:**
- camelCase for all functions (`createContext`, `handleSubmit`, `setTheme`)
- PascalCase for React components (`SignInForm`, `UserMenu`, `ModeToggle`)
- No special prefix for async functions
- `onEventName` for callback props (`onSwitchToSignIn`, `onSwitchToSignUp`)

**Variables:**
- camelCase for variables (`session`, `isPending`, `queryClient`)
- camelCase for constants (`geistSans`, `geistMono`, `buttonVariants`)
- No underscore prefix for private members

**Types:**
- PascalCase for types and interfaces (`Context`, `AppRouter`, `Config`)
- No `I` prefix for interfaces
- `import type` for type-only imports
- Props types inline using `React.ComponentProps<>` pattern

## Code Style

**Formatting:**
- Biome for linting and formatting (see `biome.json`)
- Tab indentation (not spaces)
- Double quotes for strings
- Semicolons omitted (ESM style)
- Line length not explicitly configured

**Linting:**
- Biome with recommended rules enabled
- Style rules enforced:
  - `noParameterAssign`: error
  - `useAsConstAssertion`: error
  - `useSelfClosingElements`: error
  - `noInferrableTypes`: error
  - `noUselessElse`: error
- Tailwind class sorting via `useSortedClasses` with `cn`, `clsx`, `cva` functions

**TypeScript:**
- Strict mode enabled in all packages
- `verbatimModuleSyntax` enabled (use `import type` for types)
- `noUncheckedIndexedAccess` enabled
- `noUnusedLocals` and `noUnusedParameters` enabled

## Import Organization

**Order:**
1. External packages (`react`, `next`, `@tanstack/*`, `@trpc/*`)
2. Internal workspace packages (`@finora2/auth`, `@finora2/api`)
3. Path alias imports (`@/lib/*`, `@/components/*`, `@/utils/*`)
4. Relative imports (`./utils`, `../types`)
5. Type imports last (`import type { }`)

**Grouping:**
- Blank line between groups
- Biome auto-organizes imports (`organizeImports: "on"`)

**Path Aliases:**
- `@/` maps to `src/` in Next.js app (`apps/web`)
- Workspace packages use `@finora2/*` prefix

## Error Handling

**Patterns:**
- tRPC error handling via `TRPCError` with codes (`UNAUTHORIZED`)
- Include `cause` property in tRPC errors for debugging
- Client-side errors displayed via `toast.error()` from Sonner
- Auth errors passed through callback pattern with `onError`

**Error Types:**
```typescript
// tRPC protected procedure error
throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Authentication required",
  cause: "No session",
});

// Client-side form error handling
onError: (error) => {
  toast.error(error.error.message || error.error.statusText);
}
```

**Environment Validation:**
- Use `@t3-oss/env-core` for server env validation
- Use `@t3-oss/env-nextjs` for client env validation
- Zod schemas for validation with meaningful error messages

## Logging

**Framework:**
- No dedicated logging framework
- `console.log` discouraged (Biome default rules)
- Toast notifications for user-facing messages via Sonner

**Patterns:**
- Success messages: `toast.success("Action successful")`
- Error messages: `toast.error(error.message)`
- No structured server-side logging configured

## Comments

**When to Comment:**
- Comments are minimal in codebase
- Self-documenting code preferred
- No JSDoc usage observed

**TODO Comments:**
- None present in source code
- Format if needed: `// TODO: description`

## Function Design

**Size:**
- Keep components focused (single responsibility)
- Extract reusable UI into separate component files

**Parameters:**
- Use object destructuring for props
- Type props inline with `React.ComponentProps<>` extension pattern
- Optional props use default values in destructuring

**Return Values:**
- React components return JSX directly
- Loading states return early (`if (isPending) return <Loader />`)
- No explicit return type annotations for components

## Module Design

**Exports:**
- Default exports for React page/layout components
- Default exports for feature components (`SignInForm`, `UserMenu`)
- Named exports for UI primitives (`{ Button, buttonVariants }`)
- Named exports from barrel files in packages

**Barrel Files:**
- `src/index.ts` in packages exports public API
- UI components export individually (no barrel file)

**Package Structure:**
```typescript
// Package export pattern (packages/api/src/index.ts)
export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(/* middleware */);
```

## React Patterns

**Component Structure:**
```typescript
"use client"; // Required for client components

import { /* external */ } from "package";
import { /* internal */ } from "@/lib/...";
import { /* local */ } from "./local";

export default function ComponentName({ prop }: { prop: Type }) {
  // hooks first
  const router = useRouter();
  const { data, isPending } = useQuery(...);

  // early returns for loading/error states
  if (isPending) return <Loader />;

  // render
  return <div>...</div>;
}
```

**Form Handling:**
- Use `@tanstack/react-form` for forms
- Zod schemas for validation via `validators.onSubmit`
- Controlled inputs with `value`, `onChange`, `onBlur`

**State Management:**
- React Query for server state (`@tanstack/react-query`)
- Local state via `useState` for UI state
- No global state library (context providers for theme/auth)

**Styling:**
- Tailwind CSS with class-variance-authority (cva) for variants
- `cn()` utility for conditional class merging
- Data attributes for component states (`data-slot`, `data-variant`)

---

*Convention analysis: 2026-01-29*
*Update when patterns change*
