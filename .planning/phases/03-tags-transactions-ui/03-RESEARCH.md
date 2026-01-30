# Phase 3: Tags & Transactions UI - Research

**Researched:** 2026-01-30
**Domain:** React UI Components, Base UI, TanStack Form, tRPC Client Integration
**Confidence:** HIGH

## Summary

This phase builds the user interface for tag management and transaction recording with filtering. Research covered Base UI component patterns (Dialog, Select, Popover), TanStack Form validation with Zod, React Query mutations with optimistic updates, date picker options, and color picker libraries for tag colors.

The project already has a solid foundation: Base UI @1.0.0 for headless components, TanStack Form for form state, TanStack Query for server state, tRPC client configured with httpBatchLink, and existing UI components (Button, Input, Label, Card, DropdownMenu). The Phase 2 API layer provides tag and transaction routers that this UI will consume. Key decision from CONTEXT.md: transactions displayed in daily-grouped sections with page number pagination, tag management in sidebar, modal forms for adding transactions, filter chips below an inline filter bar.

The standard approach is to use Base UI Dialog for modals, Base UI Select for dropdowns, react-colorful for color picking, react-day-picker (already used by shadcn Calendar) for date selection, and TanStack Form with Zod for validation. The existing `centsToDisplay` utility from Phase 1 handles money formatting.

**Primary recommendation:** Build on existing Base UI primitives with compound component patterns, use TanStack Form for all forms with Zod validation, implement optimistic updates via TanStack Query mutations, and use the existing money utilities for all currency display.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @base-ui/react | ^1.0.0 | Headless UI primitives | Already in project, provides Dialog, Select, Popover |
| @tanstack/react-form | ^1.27.3 | Form state management | Already in project, used in sign-in/sign-up forms |
| @tanstack/react-query | ^5.90.12 | Server state management | Already in project, tRPC integration |
| @trpc/tanstack-react-query | ^11.7.2 | tRPC + React Query bridge | Already in project |
| zod | ^4.1.13 | Schema validation | Already in project, tRPC validators |
| react-day-picker | ^9.x | Date picking | Used by shadcn Calendar, react-day-picker v9 is current |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-colorful | ^5.6.x | Color picker | Tag color selection (2.8KB, lightweight) |
| date-fns | ^3.x | Date formatting | Display dates, format presets |
| lucide-react | ^0.546.0 | Icons | Already in project, UI icons |
| sonner | ^2.0.5 | Toast notifications | Already in project, success/error feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-colorful | react-color | react-color is 13x larger; react-colorful at 2.8KB is sufficient |
| Base UI Dialog | Radix Dialog | Project already uses Base UI; consistency matters |
| TanStack Form | React Hook Form | Project already uses TanStack Form; consistency |
| Page numbers | Infinite scroll | CONTEXT.md decision: page numbers for predictable navigation |

**Installation:**
```bash
bun add react-colorful date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── ui/
│   │   ├── dialog.tsx           # Base UI Dialog wrapper (new)
│   │   ├── select.tsx           # Base UI Select wrapper (new)
│   │   ├── popover.tsx          # Base UI Popover wrapper (new)
│   │   ├── color-picker.tsx     # react-colorful wrapper (new)
│   │   ├── date-picker.tsx      # Date picker with presets (new)
│   │   └── filter-chip.tsx      # Removable filter chip (new)
│   ├── tags/
│   │   ├── tag-list.tsx         # Sidebar tag list
│   │   ├── tag-form.tsx         # Create/edit tag form
│   │   └── tag-chip.tsx         # Tag display chip with color
│   ├── transactions/
│   │   ├── transaction-list.tsx # Grouped list with pagination
│   │   ├── transaction-row.tsx  # Single transaction row
│   │   ├── transaction-form.tsx # Add/edit transaction modal
│   │   ├── transaction-filters.tsx # Filter bar with chips
│   │   └── date-group-header.tsx   # "Today", "Yesterday", date headers
│   └── shared/
│       └── money-display.tsx    # Currency formatting component
├── hooks/
│   ├── use-tags.ts              # Tag query/mutation hooks
│   └── use-transactions.ts      # Transaction query/mutation hooks
└── lib/
    └── format.ts                # Date/money formatting utilities
```

### Pattern 1: Base UI Dialog for Modals

**What:** Compound component pattern for accessible modal dialogs
**When to use:** Add/edit transaction form, confirmation dialogs
**Example:**
```typescript
// Source: https://base-ui.com/react/components/dialog
"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className="fixed inset-0 bg-black/50 data-[starting-style]:opacity-0 transition-opacity"
      />
      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-popover text-popover-foreground rounded-lg shadow-lg p-6",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 transition-all",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogClose = DialogPrimitive.Close;

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose };
```

### Pattern 2: TanStack Form with Zod Validation

**What:** Form state management with schema-based validation
**When to use:** All forms (tag create/edit, transaction create/edit)
**Example:**
```typescript
// Source: https://tanstack.com/form/latest/docs/framework/react/guides/validation
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0,
    { message: "Enter a valid positive amount" }
  ),
  date: z.date({ required_error: "Date is required" }),
  notes: z.string().max(500).optional(),
  tagIds: z.array(z.string()).optional(),
});

function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm({
    defaultValues: {
      type: "EXPENSE" as const,
      amount: "",
      date: new Date(),
      notes: "",
      tagIds: [] as string[],
    },
    validators: {
      onSubmit: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      // Call tRPC mutation
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="amount">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Amount</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="0.00"
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-sm text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>
      {/* More fields... */}
    </form>
  );
}
```

### Pattern 3: tRPC Mutations with Optimistic Updates

**What:** Optimistic UI updates using TanStack Query mutations
**When to use:** Create/update/delete operations for immediate feedback
**Example:**
```typescript
// Source: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.tag.create.mutationOptions(),
    onMutate: async (newTag) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tag", "list"] });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData(["tag", "list"]);

      // Optimistically update
      queryClient.setQueryData(["tag", "list"], (old: Tag[]) => [
        ...old,
        { ...newTag, id: "temp-" + Date.now() },
      ]);

      return { previousTags };
    },
    onError: (err, newTag, context) => {
      // Rollback on error
      queryClient.setQueryData(["tag", "list"], context?.previousTags);
      toast.error("Failed to create tag");
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["tag", "list"] });
    },
    onSuccess: () => {
      toast.success("Tag created");
    },
  });
}
```

### Pattern 4: Filter State Management with URL Params

**What:** Store filter state in URL search params for shareable/bookmarkable filters
**When to use:** Transaction list filtering
**Example:**
```typescript
// Source: Next.js App Router patterns
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

function useTransactionFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    datePreset: searchParams.get("datePreset") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    type: searchParams.get("type") as "INCOME" | "EXPENSE" | undefined,
    tagId: searchParams.get("tagId") ?? undefined,
    amountMin: searchParams.get("amountMin") ?? undefined,
    amountMax: searchParams.get("amountMax") ?? undefined,
    page: parseInt(searchParams.get("page") ?? "1", 10),
  };

  const setFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 when filters change
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
```

### Pattern 5: Date Grouping for Transaction List

**What:** Group transactions by date with relative headers
**When to use:** Transaction list display per CONTEXT.md decision
**Example:**
```typescript
// Source: Project patterns + date-fns
import { format, isToday, isYesterday } from "date-fns";

interface Transaction {
  id: string;
  date: Date;
  // ...other fields
}

interface GroupedTransactions {
  label: string;
  date: Date;
  transactions: Transaction[];
}

function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    const key = format(txn.date, "yyyy-MM-dd");
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, txn]);
  }

  return Array.from(groups.entries()).map(([dateStr, txns]) => {
    const date = new Date(dateStr);
    let label: string;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else {
      label = format(date, "MMM d, yyyy");
    }

    return { label, date, transactions: txns };
  });
}
```

### Pattern 6: Color Picker with Presets

**What:** Preset palette with custom color option per CONTEXT.md
**When to use:** Tag color selection
**Example:**
```typescript
// Source: https://github.com/omgovich/react-colorful
"use client";

import { HexColorPicker, HexColorInput } from "react-colorful";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#6b7280", "#78716c", "#0ea5e9", "#a855f7",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-3">
      {/* Preset palette */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "size-8 rounded-full border-2 transition-transform hover:scale-110",
              value === color ? "border-foreground" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
            onClick={() => { onChange(color); setShowCustom(false); }}
          />
        ))}
      </div>

      {/* Custom color toggle */}
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setShowCustom(!showCustom)}
      >
        {showCustom ? "Hide custom" : "Custom color..."}
      </button>

      {/* Full picker */}
      {showCustom && (
        <div className="space-y-2">
          <HexColorPicker color={value} onChange={onChange} />
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Storing filter state only in React state:** Use URL search params for shareable/bookmarkable filters
- **Fetching all transactions without pagination:** Always use server-side pagination
- **Formatting money on the server:** Return cents, format on client using existing utilities
- **Building custom select/dialog from scratch:** Use Base UI primitives
- **Inline editing without confirmation:** Use modal forms per CONTEXT.md decision
- **Hard refresh after mutations:** Use optimistic updates for instant feedback

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialogs | Custom portal + overlay | Base UI Dialog | Focus trap, backdrop, keyboard handling |
| Select dropdowns | Custom state + positioning | Base UI Select | Keyboard nav, positioning, portal |
| Color selection | HTML color input | react-colorful + presets | Better UX, preset support, lightweight |
| Date picking | Manual date input | react-day-picker | Calendar UI, range support, accessibility |
| Money formatting | Number.toLocaleString | currency.js via centsToDisplay | Already implemented, handles edge cases |
| Form validation | Manual if/else | TanStack Form + Zod | Type inference, consistent error handling |
| Date grouping | Manual string comparison | date-fns isToday/isYesterday | Timezone handling, localization |

**Key insight:** The project already has Base UI and TanStack Form. Reuse these primitives rather than introducing new patterns or building custom solutions.

## Common Pitfalls

### Pitfall 1: Not Configuring superjson on Client

**What goes wrong:** BigInt fields cause serialization errors in tRPC responses
**Why it happens:** Phase 2 API uses BigInt for money; client needs superjson transformer
**How to avoid:** Add superjson to tRPC client httpBatchLink configuration
**Warning signs:** `TypeError: Do not know how to serialize a BigInt` on any tRPC call

```typescript
// apps/web/src/utils/trpc.ts - MUST add transformer
import superjson from "superjson";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson, // Required for BigInt
      // ...existing config
    }),
  ],
});
```

### Pitfall 2: Filter State Loss on Page Navigation

**What goes wrong:** Users lose their filter selections when navigating away and back
**Why it happens:** Filter state stored only in React state
**How to avoid:** Persist filters in URL search params
**Warning signs:** Filter bar resets on browser back/forward

### Pitfall 3: Pagination Cursor Reset on Filter Change

**What goes wrong:** Applying a filter shows empty results or wrong page
**Why it happens:** Cursor from previous query doesn't apply to filtered results
**How to avoid:** Reset to page 1 whenever any filter changes (built into URL param pattern)
**Warning signs:** "No results" after applying filter that should have results

### Pitfall 4: Optimistic Update ID Collision

**What goes wrong:** Temporary IDs from optimistic updates conflict with server IDs
**Why it happens:** Using simple IDs like "temp" for optimistic items
**How to avoid:** Use unique temporary IDs like `temp-${Date.now()}-${Math.random()}`
**Warning signs:** React key warnings, duplicate items in lists

### Pitfall 5: Date Timezone Issues

**What goes wrong:** Transactions appear on wrong date (off by one day)
**Why it happens:** Date stored as UTC, displayed without timezone conversion
**How to avoid:** Always format dates in local timezone using date-fns
**Warning signs:** Transaction added "today" appears under "yesterday"

### Pitfall 6: Soft-Deleted Tags Still Appearing

**What goes wrong:** Deleted tags show in tag selection dropdowns
**Why it happens:** UI fetches all tags without filtering by `isActive`
**How to avoid:** API already filters by `isActive: true`; ensure using list endpoint not raw query
**Warning signs:** Tags that were "deleted" still appear as selection options

## Code Examples

Verified patterns from official sources and project conventions:

### Money Display Component

```typescript
// Source: Phase 1 money utilities + project patterns
// apps/web/src/components/shared/money-display.tsx
"use client";

import { cn } from "@/lib/utils";

// Client-side formatting using same logic as centsToDisplay
function formatCents(cents: bigint | number): string {
  const value = typeof cents === "bigint" ? Number(cents) : cents;
  const dollars = value / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

interface MoneyDisplayProps {
  cents: bigint | number;
  type?: "INCOME" | "EXPENSE";
  className?: string;
}

export function MoneyDisplay({ cents, type, className }: MoneyDisplayProps) {
  const formatted = formatCents(cents);
  const isIncome = type === "INCOME";

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        isIncome && "text-emerald-600 dark:text-emerald-400",
        type === "EXPENSE" && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {isIncome ? "+" : type === "EXPENSE" ? "-" : ""}
      {formatted.replace("-", "")}
    </span>
  );
}
```

### Filter Chip Component

```typescript
// Source: Project patterns + CONTEXT.md decisions
// apps/web/src/components/ui/filter-chip.tsx
"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full",
        "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
```

### Tag Chip with Color

```typescript
// Source: Project patterns + CONTEXT.md decisions
// apps/web/src/components/tags/tag-chip.tsx
"use client";

import { cn } from "@/lib/utils";

interface TagChipProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export function TagChip({ name, color, size = "md", className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "size-2" : "size-2.5"
        )}
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}
```

### Transaction Row Component

```typescript
// Source: Project patterns + CONTEXT.md decisions
// apps/web/src/components/transactions/transaction-row.tsx
"use client";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { MoneyDisplay } from "@/components/shared/money-display";
import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: bigint;
  date: Date;
  notes: string | null;
  tags: Array<{ id: string; name: string; color: string }>;
}

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <MoneyDisplay
            cents={transaction.amountCents}
            type={transaction.type}
          />
          <span className="text-xs text-muted-foreground">
            {format(transaction.date, "h:mm a")}
          </span>
        </div>
        {transaction.notes && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {transaction.notes}
          </p>
        )}
        {transaction.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1.5">
            {transaction.tags.map((tag) => (
              <TagChip key={tag.id} name={tag.name} color={tag.color} size="sm" />
            ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(transaction.id)}>
            <Pencil className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-day-picker v8 | react-day-picker v9 | Late 2025 | New API, better accessibility |
| Manual optimistic updates | useMutation variables | TanStack Query v5 (2024) | Simpler optimistic UI |
| tRPC useQuery wrapper | tRPC createTRPCOptionsProxy | tRPC Feb 2025 | Native React Query patterns |
| Radix UI | Base UI | Project choice | Already using Base UI @1.0.0 |
| react-color | react-colorful | Community shift | 13x smaller bundle (2.8KB) |

**Deprecated/outdated:**
- react-day-picker v8 patterns: Project should use v9 API
- tRPC classic React Query integration: Use new createTRPCOptionsProxy pattern already in project
- Manual BigInt serialization: Use superjson transformer

## Open Questions

Things that couldn't be fully resolved:

1. **superjson client configuration**
   - What we know: Server uses superjson; client must match
   - What's unclear: Current trpc.ts doesn't have transformer configured
   - Recommendation: First task in implementation must add superjson to client

2. **Date picker v9 shadcn compatibility**
   - What we know: shadcn Calendar uses react-day-picker; v9 has breaking changes
   - What's unclear: Whether to use shadcn Calendar or build fresh from react-day-picker v9
   - Recommendation: Build fresh date picker using react-day-picker v9 directly with Base UI Popover

3. **Tag management sidebar integration**
   - What we know: CONTEXT.md says sidebar; existing sidebar has nav items
   - What's unclear: Exact placement (below nav? collapsible section?)
   - Recommendation: Add collapsible "Tags" section below navigation items

## Sources

### Primary (HIGH confidence)
- [Base UI Dialog](https://base-ui.com/react/components/dialog) - Modal dialog patterns
- [Base UI Select](https://base-ui.com/react/components/select) - Dropdown select patterns
- [Base UI Popover](https://base-ui.com/react/components/popover) - Popover positioning
- [TanStack Form Validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation) - Form + Zod patterns
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates) - Mutation patterns
- [react-colorful](https://github.com/omgovich/react-colorful) - Color picker (2.8KB)

### Secondary (MEDIUM confidence)
- [shadcn/ui Date Picker](https://ui.shadcn.com/docs/components/date-picker) - Date picker patterns
- [tRPC TanStack React Query Integration](https://trpc.io/blog/introducing-tanstack-react-query-client) - New integration patterns

### Tertiary (LOW confidence)
- Community discussions on filter UI patterns
- React list pagination best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing project setup, official docs verified
- Architecture: HIGH - Follows existing project patterns, CONTEXT.md decisions clear
- UI Components: HIGH - Base UI documentation verified, react-colorful verified
- Pitfalls: MEDIUM - Mix of official docs and practical experience
- superjson client: MEDIUM - Need to verify current client setup

**Research date:** 2026-01-30
**Valid until:** 60 days (Base UI and TanStack libraries are stable)
