# Phase 6: Onboarding & Polish - Research

**Researched:** 2026-02-07
**Domain:** User onboarding flows, settings/preferences, empty states, schema migration
**Confidence:** HIGH (mostly codebase-verified patterns with known pitfall flagged)

## Summary

Phase 6 requires four distinct capabilities: a multi-step onboarding wizard, a settings page with profile editing and account management, a user-configurable currency symbol, and tailored empty states across all main pages. The research focused on understanding the existing codebase patterns to ensure Phase 6 fits seamlessly, and uncovering potential pitfalls.

The codebase uses better-auth for authentication, Prisma 7 for database, tRPC for API, TanStack Form for forms, TanStack Query for data fetching, and @base-ui/react for UI primitives. There is a **critical known bug** with better-auth's `updateUser` method on Prisma v7 (GitHub issue #6469) -- the method returns success but does not persist changes to the database. The recommended approach is to bypass `authClient.updateUser()` entirely and use a custom tRPC mutation with direct Prisma updates.

**Primary recommendation:** Build a `user` tRPC router for profile updates (name, currency) instead of relying on better-auth's `updateUser`. Add `hasCompletedOnboarding` and `currencySymbol` fields to the User model. Use CSS transitions (already established pattern) for onboarding animations -- no new animation library needed.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @base-ui/react | ^1.0.0 | UI primitives (Dialog, Select) | Already used for all UI components in project |
| @tanstack/react-form | ^1.27.3 | Form state management | Already used for transaction/loan/sign-up forms |
| @tanstack/react-query | ^5.90.12 | Server state, mutations | Already used for all data fetching |
| @trpc/server + client | ^11.7.2 | Type-safe API | Already used for all API routes |
| lucide-react | ^0.546.0 | Icons | Already used throughout |
| sonner | ^2.0.5 | Toast notifications | Already used for success/error feedback |
| better-auth | ^1.4.9 | Authentication | Already used for auth (sign-out, delete account) |
| tw-animate-css | ^1.3.4 | CSS animation utilities | Already imported in index.css |
| zod | ^4.1.13 | Schema validation | Already used for form validators and tRPC inputs |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | ^0.4.6 | Theme management | Already integrated via ThemeProvider |
| class-variance-authority | ^0.7.1 | Component variants | Already used in UI components |
| tailwind-merge | ^3.3.1 | Tailwind class merging | Already used via `cn()` utility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions for onboarding | Framer Motion | Would add ~30KB bundle; project already uses CSS transitions successfully (sign-up page animations, dialog transitions) |
| Custom tRPC user router | better-auth updateUser | better-auth has known Prisma v7 bug (#6469); direct Prisma updates are reliable |
| localStorage for onboarding state | Database flag on User | Database flag is authoritative; localStorage can be cleared; DB flag persists across devices |

**Installation:** No new packages required. All necessary libraries are already installed.

## Architecture Patterns

### Recommended Project Structure
```
packages/db/prisma/schema/
├── auth.prisma            # ADD: hasCompletedOnboarding, currencySymbol to User model

packages/api/src/
├── routers/
│   ├── user.ts            # NEW: user settings router (getSettings, updateProfile, updateCurrency, completeOnboarding)
│   └── index.ts           # MODIFY: add user router
├── schemas/
│   └── user.ts            # NEW: Zod schemas for user mutations

apps/web/src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx     # MODIFY: redirect to /onboarding if !hasCompletedOnboarding
│   │   └── dashboard/
│   │       └── settings/
│   │           └── page.tsx  # MODIFY: expand with profile form, currency, delete account
│   └── (onboarding)/        # NEW route group (no sidebar/header)
│       ├── layout.tsx        # NEW: clean layout without dashboard chrome
│       └── onboarding/
│           └── page.tsx      # NEW: multi-step wizard
├── components/
│   ├── onboarding/
│   │   ├── onboarding-wizard.tsx     # NEW: main wizard with step state
│   │   ├── step-welcome.tsx          # NEW: welcome step
│   │   ├── step-expenses.tsx         # NEW: expense tracking preview
│   │   ├── step-loans.tsx            # NEW: loan tracking preview
│   │   └── step-setup.tsx            # NEW: collect name + currency
│   ├── settings/
│   │   ├── profile-form.tsx          # NEW: name + currency form
│   │   ├── account-section.tsx       # NEW: email display, sign-out, delete
│   │   └── delete-account-dialog.tsx # NEW: confirmation dialog
│   ├── empty-states/
│   │   ├── empty-state.tsx           # NEW: reusable empty state component
│   │   ├── dashboard-empty.tsx       # NEW: guided checklist
│   │   ├── transactions-empty.tsx    # NEW: transaction-specific empty
│   │   ├── loans-empty.tsx           # NEW: loan-specific empty
│   │   └── tags-empty.tsx            # NEW: tag-specific empty
│   └── shared/
│       └── money-display.tsx         # MODIFY: accept currencySymbol prop
├── hooks/
│   └── use-user-settings.ts          # NEW: hook for user settings queries/mutations
└── lib/
    └── format.ts                     # MODIFY: accept currency symbol parameter
```

### Pattern 1: tRPC Router for User Settings
**What:** Create a dedicated `user` router following the existing tag/loan/transaction router pattern.
**When to use:** For all user profile and settings mutations.
**Example:**
```typescript
// Source: Codebase pattern from packages/api/src/routers/tag.ts
import prisma from "@finora2/db";
import { protectedProcedure, router } from "../index";
import { updateProfileInput, updateCurrencyInput } from "../schemas/user";

export const userRouter = router({
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        currencySymbol: true,
        hasCompletedOnboarding: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      });
    }),

  updateCurrency: protectedProcedure
    .input(updateCurrencyInput)
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { currencySymbol: input.currencySymbol },
      });
    }),

  completeOnboarding: protectedProcedure
    .mutation(async ({ ctx }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { hasCompletedOnboarding: true },
      });
    }),
});
```

### Pattern 2: Onboarding Redirect in Dashboard Layout
**What:** Server-side redirect from dashboard layout when user hasn't completed onboarding.
**When to use:** First-run experience gating.
**Example:**
```typescript
// Source: Codebase pattern from apps/web/src/app/(dashboard)/layout.tsx
import prisma from "@finora2/db"; // or use tRPC server caller

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  // Check onboarding status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasCompletedOnboarding: true },
  });
  if (!user?.hasCompletedOnboarding) redirect("/onboarding");

  return (/* existing layout */);
}
```

### Pattern 3: Multi-Step Wizard with URL-Free State
**What:** Client-side step state (not URL-based) since wizard is linear and shouldn't be bookmarkable.
**When to use:** For the 4-step onboarding wizard.
**Example:**
```typescript
// Source: Codebase patterns from sign-up page (state-driven step transitions)
"use client";
import { useState } from "react";

const STEPS = ["welcome", "expenses", "loans", "setup"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const stepIndex = STEPS.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleSkip = async () => {
    // Complete onboarding and redirect
    await completeOnboarding();
    router.push("/dashboard");
  };

  // Render current step component based on currentStep
}
```

### Pattern 4: Currency Symbol as Display-Only Preference
**What:** Currency symbol stored on user, passed through to format functions. Does NOT change stored amounts (always in cents).
**When to use:** All money display throughout the app.
**Example:**
```typescript
// Source: Codebase pattern from apps/web/src/lib/format.ts
// CURRENT:
export function formatCents(cents: bigint | number): string {
  const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
  const dollars = numericCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

// MODIFIED: Accept symbol override
export function formatCents(cents: bigint | number, symbol = "$"): string {
  const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
  const dollars = numericCents / 100;
  // Use Intl for number formatting, then replace the symbol
  const formatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(dollars));
  const sign = dollars < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}
```

### Pattern 5: Reusable Empty State Component
**What:** Shared component for empty states with icon, headline, description, and CTA.
**When to use:** All pages when no data exists.
**Example:**
```typescript
// Source: Existing empty state patterns in loan-list.tsx, transaction-list.tsx, dashboard-page-client.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">{description}</p>
      {action && (/* Button or Link */)}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Using better-auth `updateUser` for profile changes:** Known Prisma v7 bug (#6469) causes silent data loss -- updates appear successful but don't persist. Use direct Prisma updates via tRPC instead.
- **Storing currency preference in localStorage:** Will not sync across devices, can be cleared by browser. Store in database on User model.
- **URL-based onboarding steps:** Wizard steps should not be bookmarkable/shareable; use client state, not URL params.
- **Adding Framer Motion for onboarding:** Project already has CSS transitions + tw-animate-css. No need for a new animation dependency.
- **Separate API call per onboarding step:** The onboarding wizard should collect data client-side and make a single mutation at the end (name + currency + completion flag).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom string manipulation | `Intl.NumberFormat` (already in `formatCents`) | Handles thousands separators, decimal precision, locale-specific formatting |
| Form validation | Manual if/else validation | Zod schemas with TanStack Form (existing pattern) | Type-safe, declarative, consistent with all other forms in the app |
| Dialog/modal for delete confirmation | Custom modal implementation | `@base-ui/react` Dialog (already used in 5+ places) | Accessibility, focus management, backdrop, animations all handled |
| Select dropdown for currency | Custom dropdown | `@base-ui/react` Select (already in `ui/select.tsx`) | Keyboard navigation, accessibility, portal rendering, scroll handling |
| Toast notifications | Custom notification system | `sonner` with `toast.success/error` (existing pattern) | Already configured in Providers, used throughout |
| Step progress indicator | Complex progress bar library | Simple CSS with step circles | 4 steps is trivial; a library would be overkill |
| Animated transitions between steps | Framer Motion or GSAP | CSS transitions with `tw-animate-css` | Already imported, already used (sign-up page FloatingOrb, FeatureItem, dialog transitions) |

**Key insight:** Every UI primitive needed for Phase 6 already exists in the project. The onboarding wizard is just a composition of existing Dialog, Button, Select, Input, and Label components with CSS transitions -- nothing new is required.

## Common Pitfalls

### Pitfall 1: better-auth `updateUser` Silent Failure on Prisma v7
**What goes wrong:** `authClient.updateUser({ name: "New Name" })` returns success but the database row is not updated. The session shows the old name until refreshed.
**Why it happens:** Known bug in better-auth's Prisma adapter when using Prisma v7 (GitHub issue #6469, still open as of 2026-02).
**How to avoid:** Do NOT use `authClient.updateUser()` for profile changes. Create a tRPC `user.updateProfile` mutation that uses `prisma.user.update()` directly. After mutation success, call `authClient.useSession().refetch()` or invalidate the session query to refresh client-side session data.
**Warning signs:** User updates name in settings, sees success toast, but sidebar/header still shows old name.

### Pitfall 2: Onboarding Redirect Loop
**What goes wrong:** User gets stuck in an infinite redirect between dashboard and onboarding if the `hasCompletedOnboarding` check doesn't work correctly.
**Why it happens:** The redirect is in the server layout, but the onboarding page might also check session and redirect back.
**How to avoid:** Create a separate `(onboarding)` route group with its own layout that does NOT check `hasCompletedOnboarding`. Only the `(dashboard)` layout checks and redirects to `/onboarding`. The onboarding page only checks for authentication (must be logged in).
**Warning signs:** Browser shows "too many redirects" error.

### Pitfall 3: Currency Symbol Not Propagating
**What goes wrong:** User sets currency to "EUR" but some pages still show "$".
**Why it happens:** `formatCents` is called in 8 different files. The currency symbol needs to be threaded through from the user settings context.
**How to avoid:** Two options: (a) Pass `currencySymbol` as a prop through `MoneyDisplay` (used in most places), or (b) Create a React context for user settings that components can consume. Option (a) is simpler and matches existing patterns -- `MoneyDisplay` already wraps `formatCents`. Most components already use `MoneyDisplay` rather than calling `formatCents` directly.
**Warning signs:** Hardcoded "$" anywhere in component code.

### Pitfall 4: Session Data Stale After Profile Update
**What goes wrong:** User updates display name via tRPC mutation, but the sidebar and header still show the old name because they read from the server-side session.
**Why it happens:** The dashboard layout passes `session.user` from the server to client components. After a client-side mutation, the server session data is stale until the page is refreshed.
**How to avoid:** After profile update, use `router.refresh()` to trigger a server-side re-render of the layout, which will re-fetch the session. Alternatively, use `authClient.useSession()` in the components that display the name (already used in settings page).
**Warning signs:** Name updates in settings card but sidebar shows old name.

### Pitfall 5: Delete Account Without Cascade Consideration
**What goes wrong:** Account deletion fails or leaves orphaned data.
**Why it happens:** The User model has relations to tags, transactions, loans, sessions, and accounts. Deletion needs to cascade properly.
**How to avoid:** The Prisma schema already has `onDelete: Cascade` on Session and Account relations. Transaction, Tag, and Loan also use `onDelete: Cascade`. better-auth's `deleteUser` configuration handles session cleanup. Enable `user.deleteUser.enabled: true` in auth config.
**Warning signs:** Foreign key constraint errors during deletion.

### Pitfall 6: Schema Migration Breaking Existing Users
**What goes wrong:** Adding `hasCompletedOnboarding` as a required boolean without a default would fail for existing users.
**Why it happens:** Prisma migration requires a value for every existing row when adding a non-nullable column.
**How to avoid:** Add `hasCompletedOnboarding Boolean @default(true)` -- existing users should default to `true` (they've already been using the app and don't need onboarding). New users created after the migration will be set to `false` by the sign-up flow or by an afterCreate hook. Similarly, `currencySymbol` should default to `"$"`.
**Warning signs:** Migration fails with "column cannot be null" error.

## Code Examples

### Schema Changes for User Model
```prisma
// Source: Extending packages/db/prisma/schema/auth.prisma
model User {
  id                     String    @id
  name                   String
  email                  String
  emailVerified          Boolean   @default(false)
  image                  String?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  hasCompletedOnboarding Boolean   @default(true)  // true for existing users
  currencySymbol         String    @default("$")    // display preference only
  sessions               Session[]
  accounts               Account[]

  // Finance relations
  tags         Tag[]
  transactions Transaction[]
  loans        Loan[]

  @@unique([email])
  @@map("user")
}
```

### TanStack Form Pattern for Settings (Matching Project Convention)
```typescript
// Source: Codebase pattern from transaction-form.tsx, sign-up page
const form = useForm({
  defaultValues: {
    name: settings?.name ?? "",
    currencySymbol: settings?.currencySymbol ?? "$",
  },
  onSubmit: async ({ value }) => {
    await updateProfile.mutateAsync({ name: value.name });
    await updateCurrency.mutateAsync({ currencySymbol: value.currencySymbol });
    toast.success("Settings saved");
    router.refresh(); // Refresh server components with new session data
  },
  validators: {
    onSubmit: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      currencySymbol: z.string().min(1).max(3),
    }),
  },
});
```

### Delete Account with Confirmation (Matching Project Dialog Pattern)
```typescript
// Source: Codebase pattern from loan-list.tsx delete confirmation
const handleDeleteAccount = async () => {
  await authClient.deleteUser({
    password: passwordValue, // require password confirmation
    fetchOptions: {
      onSuccess: () => {
        router.push("/");
        toast.success("Account deleted");
      },
      onError: (error) => {
        toast.error(error.error.message || "Failed to delete account");
      },
    },
  });
};
```

### better-auth Config for Delete User
```typescript
// Source: better-auth documentation (WebFetch verified)
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: { enabled: true },
  user: {
    deleteUser: { enabled: true },
  },
  plugins: [nextCookies()],
});
```

### Currency Symbols Constant
```typescript
// Source: Common financial app pattern
export const CURRENCY_SYMBOLS = [
  { value: "$", label: "$ - US Dollar" },
  { value: "£", label: "£ - British Pound" },
  { value: "€", label: "€ - Euro" },
  { value: "¥", label: "¥ - Japanese Yen" },
  { value: "₹", label: "₹ - Indian Rupee" },
  { value: "A$", label: "A$ - Australian Dollar" },
  { value: "C$", label: "C$ - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "R$", label: "R$ - Brazilian Real" },
  { value: "₩", label: "₩ - South Korean Won" },
] as const;
```

### CSS Transition Pattern for Onboarding Steps (Matching Sign-Up Page)
```typescript
// Source: Codebase pattern from apps/web/src/app/(auth)/sign-up/page.tsx
function StepContent({ isVisible, children }: { isVisible: boolean; children: React.ReactNode }) {
  return (
    <div className={`transition-all duration-500 ${
      isVisible
        ? "translate-x-0 opacity-100"
        : "translate-x-8 opacity-0 absolute inset-0 pointer-events-none"
    }`}>
      {children}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `authClient.updateUser()` | Direct Prisma update via tRPC | Prisma v7 (2025-2026) | Must bypass better-auth for user profile updates |
| `React.forwardRef` | `ref` as prop | React 19 (2025) | Project already uses React 19 pattern |
| `className` / `htmlFor` | Same for React (`className`/`htmlFor`) | Unchanged | Project uses React, not Solid/Vue |
| Client-side session for all auth | Server-side session in layouts | Next.js App Router | Dashboard layout already uses server-side `auth.api.getSession()` |

**Deprecated/outdated:**
- `authClient.updateUser()` with Prisma v7: Known bug, avoid entirely (use tRPC + direct Prisma)
- `React.forwardRef`: Project already uses React 19 ref-as-prop pattern

## Open Questions

1. **better-auth `deleteUser` with Prisma v7**
   - What we know: `updateUser` has a known bug with Prisma v7. `deleteUser` uses the same adapter.
   - What's unclear: Whether `deleteUser` is also affected by the Prisma v7 adapter bug.
   - Recommendation: Test `deleteUser` manually. If it fails, implement account deletion as a tRPC mutation using `prisma.user.delete({ where: { id } })` with cascade, followed by `authClient.signOut()`.

2. **Existing user onboarding flag default**
   - What we know: Existing users should get `hasCompletedOnboarding: true` (they don't need onboarding).
   - What's unclear: Whether the sign-up flow should set `hasCompletedOnboarding: false` at registration time, or if it should remain `true` as default and be set to `false` only after a migration is applied.
   - Recommendation: Use `@default(true)` in schema. After deploying the migration, update the sign-up flow to explicitly set `false` for new registrations. Alternatively, use a better-auth `afterCreate` hook in the user config to set it to `false` for newly created users going forward. The simplest approach: check if the user has ANY data (transactions, tags, loans) -- if not, treat as new user needing onboarding, regardless of the flag. This avoids needing to change the sign-up flow.

3. **Session refresh after tRPC profile update**
   - What we know: Dashboard layout reads session server-side. Settings page updates via tRPC.
   - What's unclear: Exact mechanism to sync the server session after a client tRPC mutation.
   - Recommendation: After successful profile update mutation, call `router.refresh()` which re-executes server components. The layout will re-fetch the session with updated data. Additionally, the better-auth session may cache the user object -- calling `useSession().refetch()` may also be needed.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: auth.prisma User model, dashboard layout, settings page, sign-up flow, transaction-form, tag router, money-display, format.ts (all files read directly)
- Project dependencies: package.json (root and web app), confirmed Prisma v7.2.0, better-auth ^1.4.9
- [better-auth docs: Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts) - updateUser, deleteUser APIs verified via WebFetch

### Secondary (MEDIUM confidence)
- [better-auth + Prisma v7 issue #6469](https://github.com/better-auth/better-auth/issues/6469) - updateUser bug confirmed via WebFetch, issue REOPENED, no fix as of 2026-02
- [better-auth docs: Client](https://www.better-auth.com/docs/concepts/client) - useSession, updateUser client methods
- [Prisma migration docs](https://www.prisma.io/docs/orm/prisma-migrate/getting-started) - Adding columns with defaults to existing tables

### Tertiary (LOW confidence)
- None -- all findings verified with either codebase or official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, verified via package.json
- Architecture: HIGH - All patterns derived from existing codebase code (tRPC routers, TanStack Form, Dialog, layout redirect)
- Pitfalls: HIGH - Prisma v7 + better-auth bug verified via GitHub issue; cascade behavior verified via schema inspection; other pitfalls from codebase analysis

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (stable -- all tools are already in project; monitor better-auth #6469 for fix)
