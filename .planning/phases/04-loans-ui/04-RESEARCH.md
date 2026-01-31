# Phase 4: Loans UI - Research

**Researched:** 2026-01-31
**Domain:** React UI Components, Loan Management, Payment Tracking, Financial Calculations Display
**Confidence:** HIGH

## Summary

This phase builds the user interface for loan management and payment tracking, allowing users to create, edit, and delete loans while logging payments and viewing balance/payoff projections. Research focused on reusing Phase 3 established patterns (Base UI Dialog, TanStack Form, optimistic updates, Card layouts) and adapting them for the loans domain with its specific requirements around payment logging and calculated summaries.

The project already has all necessary infrastructure: Base UI @1.0.0 for Dialog/Select/Popover, TanStack Form for forms, existing hooks pattern from transactions (useCreateTransaction, etc.), MoneyDisplay component for currency, DatePicker with presets, and the Phase 2 loan API providing list, getById, create, update, delete, addPayment, and deletePayment endpoints. The loan router already calculates balances, interest paid, and payoff projections - the UI just needs to consume and display these values.

Key decisions from CONTEXT.md: card-based loan list with balance prominence and progress bars, modal form for payment logging with "is extra payment" checkbox, separate detail page route for each loan showing payment history timeline. The loan form must auto-calculate payment using the PMT formula, which already exists in the API calculations lib.

**Primary recommendation:** Follow Phase 3 patterns exactly (hook structure, form patterns, Dialog usage), add loan-specific components (LoanCard, PaymentForm, LoanDetailPage), reuse existing UI primitives (Card, Select, MoneyDisplay, DatePicker), and leverage API-provided calculations rather than duplicating logic on the frontend.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @base-ui/react | ^1.0.0 | Dialog, Select, Popover primitives | Already in project, used in Phase 3 |
| @tanstack/react-form | ^1.27.3 | Form state management | Already in project, established pattern |
| @tanstack/react-query | ^5.90.12 | Server state, optimistic updates | Already in project via tRPC |
| @trpc/tanstack-react-query | ^11.7.2 | tRPC + React Query integration | Already in project |
| zod | catalog | Schema validation | Already in project |
| date-fns | ^4.1.0 | Date formatting, manipulation | Already in project |
| lucide-react | ^0.546.0 | Icons | Already in project |
| sonner | ^2.0.5 | Toast notifications | Already in project |
| superjson | ^2.2.6 | BigInt serialization | Already configured in tRPC client |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-day-picker | ^9.13.0 | Date picker | Payment date selection |
| currency.js | N/A | Money formatting | Via existing formatCents utility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| API-side PMT calculation | Client-side PMT | Duplicates logic; API already provides calculations, just pass inputs and receive calculated payment |
| Separate routes | Modal detail view | CONTEXT.md decision: detail page is separate route for full payment history |
| Progress bar library | Custom CSS | Progress bars are simple enough that Tailwind CSS width percentage works fine |

**Installation:**
```bash
# No new packages needed - all dependencies already installed from Phase 3
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── loans/
│   │   ├── loan-card.tsx          # Individual loan card with balance/progress
│   │   ├── loan-list.tsx          # List of loan cards
│   │   ├── loan-form.tsx          # Create/edit loan dialog
│   │   ├── payment-form.tsx       # Log payment dialog
│   │   ├── payment-list.tsx       # Payment history timeline
│   │   └── payment-summary.tsx    # Post-payment summary display
│   └── shared/
│       └── progress-bar.tsx       # Reusable progress bar (optional)
├── hooks/
│   └── use-loans.ts               # Loan query/mutation hooks
└── app/
    └── (dashboard)/
        └── dashboard/
            ├── loans/
            │   ├── page.tsx       # Loans list page
            │   └── [id]/
            │       └── page.tsx   # Loan detail page
```

### Pattern 1: Loan Hooks Following Transaction Pattern

**What:** Query and mutation hooks with optimistic updates
**When to use:** All loan CRUD operations and payment logging
**Example:**
```typescript
// Source: Phase 3 use-transactions.ts pattern
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

// Loan list type from API response
export interface LoanWithBalance {
  id: string;
  name: string;
  loanType: string;
  interestType: "SIMPLE" | "COMPOUND";
  principalCents: bigint;
  balanceCents: bigint;
  totalInterestPaidCents: bigint;
  annualRatePercent: number;
  termMonths: number;
  monthlyPaymentCents: bigint;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function useLoans() {
  const queryOptions = trpc.loan.list.queryOptions();
  const query = useQuery(queryOptions);

  return {
    loans: (query.data ?? []) as LoanWithBalance[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.create.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (newLoan) => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      const previousLoans = queryClient.getQueriesData({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      // Optimistic update
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      // Note: Optimistic loan has approximate values; server will return accurate data

      return { previousLoans };
    },
    onError: (_err, _newLoan, context) => {
      if (context?.previousLoans) {
        for (const [queryKey, data] of context.previousLoans) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to create loan");
    },
    onSuccess: () => {
      toast.success("Loan created");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });
    },
  });
}
```

### Pattern 2: Loan Card with Progress Bar

**What:** Card component showing balance, rate, and payoff progress
**When to use:** Loan list display per CONTEXT.md decision
**Example:**
```typescript
// Source: Phase 3 Card patterns + CONTEXT.md decisions
"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/shared/money-display";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoanCardProps {
  loan: {
    id: string;
    name: string;
    loanType: string;
    principalCents: bigint;
    balanceCents: bigint;
    monthlyPaymentCents: bigint;
    annualRatePercent: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onLogPayment: () => void;
  onClick: () => void;
}

export function LoanCard({ loan, onEdit, onDelete, onLogPayment, onClick }: LoanCardProps) {
  // Calculate progress percentage
  const principalNum = Number(loan.principalCents);
  const balanceNum = Number(loan.balanceCents);
  const paidOff = principalNum > 0 ? ((principalNum - balanceNum) / principalNum) * 100 : 0;

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="capitalize">{loan.loanType}</span>
          <span className="text-muted-foreground">-</span>
          <span>{loan.name}</span>
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onLogPayment(); }}>
                Log Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Balance - prominent */}
        <div>
          <div className="text-xs text-muted-foreground">Remaining Balance</div>
          <div className="text-2xl font-semibold">
            <MoneyDisplay cents={loan.balanceCents} showSign={false} />
          </div>
        </div>

        {/* Secondary info */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">{loan.annualRatePercent}%</span> APR
          </div>
          <div>
            <MoneyDisplay cents={loan.monthlyPaymentCents} showSign={false} className="font-medium text-foreground" />/mo
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Paid off</span>
            <span className="font-medium">{paidOff.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(paidOff, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: Payment Form with Extra Payment Toggle

**What:** Modal form for logging payments with isExtra checkbox
**When to use:** Payment logging per CONTEXT.md decision
**Example:**
```typescript
// Source: Phase 3 TransactionForm pattern + CONTEXT.md decisions
"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), "Enter a valid amount")
    .refine((val) => parseFloat(val) > 0, "Amount must be positive"),
  paidAt: z.date({ message: "Date is required" }),
  isExtra: z.boolean(),
});

interface PaymentFormProps {
  loan: {
    id: string;
    name: string;
    monthlyPaymentCents: bigint;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (summary: PaymentSummary) => void;
}

interface PaymentSummary {
  principalCents: bigint;
  interestCents: bigint;
  newBalanceCents: bigint;
  payoffDateChange: number; // months difference
}

export function PaymentForm({ loan, open, onOpenChange, onSuccess }: PaymentFormProps) {
  // Pre-fill with monthly payment amount
  const defaultAmount = (Number(loan.monthlyPaymentCents) / 100).toFixed(2);

  const form = useForm({
    defaultValues: {
      amount: defaultAmount,
      paidAt: new Date(),
      isExtra: false,
    },
    validators: {
      onSubmit: paymentSchema,
    },
    onSubmit: async ({ value }) => {
      // Call addPayment mutation
      // On success, show summary
    },
  });

  // ... form rendering with isExtra checkbox
}
```

### Pattern 4: Loan Detail Page with Payment Timeline

**What:** Full page showing loan stats and payment history
**When to use:** Loan detail view per CONTEXT.md decision (separate route)
**Example:**
```typescript
// Source: Next.js App Router + CONTEXT.md decisions
// apps/web/src/app/(dashboard)/dashboard/loans/[id]/page.tsx

import { notFound } from "next/navigation";
import { format } from "date-fns";

interface LoanDetailPageProps {
  params: { id: string };
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  // Use loan.getById which includes:
  // - balanceCents
  // - totalInterestPaidCents
  // - projection.monthsRemaining
  // - projection.projectedPayoffDate
  // - payments array

  return (
    <div className="space-y-6">
      {/* Summary stats at top */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Remaining Balance" value={balanceCents} />
        <StatCard label="Total Interest Paid" value={totalInterestPaidCents} />
        <StatCard label="Payoff Date" value={format(payoffDate, "MMM yyyy")} />
      </div>

      {/* Payment history timeline */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        <div className="space-y-2">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Pattern 5: Auto-Calculate Payment Amount

**What:** Calculate monthly payment from principal/rate/term using PMT formula
**When to use:** Loan form when user enters principal, rate, and term
**Example:**
```typescript
// Source: Phase 1 calculations.ts - PMT formula
// Client-side calculation for form preview only; server does authoritative calculation

/**
 * PMT formula: P * (r * (1+r)^n) / ((1+r)^n - 1)
 */
function calculateMonthlyPayment(
  principalDollars: number,
  annualRatePercent: number,
  termMonths: number
): number {
  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    return principalDollars / termMonths;
  }

  const x = Math.pow(1 + monthlyRate, termMonths);
  return (principalDollars * x * monthlyRate) / (x - 1);
}

// In loan form, auto-calculate and display:
useEffect(() => {
  if (principal && rate && term) {
    const payment = calculateMonthlyPayment(
      parseFloat(principal),
      parseFloat(rate),
      parseInt(term)
    );
    form.setFieldValue("monthlyPayment", payment.toFixed(2));
  }
}, [principal, rate, term]);
```

### Anti-Patterns to Avoid

- **Storing calculated balance in state:** API already calculates and returns balance; don't duplicate
- **Duplicating PMT calculation authoritatively on client:** Server does the authoritative calculation; client can preview but server response is truth
- **Modal for loan detail:** CONTEXT.md specifies separate route for full detail view
- **Calculating principal/interest split on client:** Server handles this in addPayment; display what API returns
- **Not pre-filling payment amount:** Per CONTEXT.md, regular payment amount should be pre-filled

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loan balance calculation | Subtract payments manually | API loan.list returns balanceCents | Server already handles, keeps single source of truth |
| Interest/principal split | Calculate on frontend | API addPayment returns split | Amortization is complex; server already does it correctly |
| Payoff projection | Iterate payment schedule | API loan.getById returns projection | Server's projectPayoff handles edge cases (Infinity, etc.) |
| Progress bar | React library | CSS width percentage | Simple math, no library needed |
| PMT formula | Custom implementation | Server calculation | Client can preview, but trust server for form submission |
| Money formatting | toFixed(2) | MoneyDisplay + formatCents | Handles BigInt, locale, negative signs |
| Date formatting | Date.toLocaleDateString | date-fns format | Consistent formatting, relative dates |

**Key insight:** The loan API router already provides all calculated values (balance, interest paid, projections). The UI's job is to collect inputs and display API responses, not to duplicate financial calculations.

## Common Pitfalls

### Pitfall 1: BigInt Display Without Conversion

**What goes wrong:** Trying to display BigInt directly causes type errors or shows wrong values
**Why it happens:** BigInt can't be used with number operations directly
**How to avoid:** Always use MoneyDisplay component which handles BigInt -> Number conversion
**Warning signs:** Type errors like "Cannot mix BigInt and other types"

### Pitfall 2: Form Reset on Edit Mode Switch

**What goes wrong:** Form keeps stale data when switching from edit one loan to edit another
**Why it happens:** TanStack Form doesn't auto-reset when props change
**How to avoid:** Reset form fields in handleOpenChange when dialog opens, like TransactionForm does
**Warning signs:** Editing loan A shows values from previously edited loan B

### Pitfall 3: Optimistic Update with Calculated Fields

**What goes wrong:** Optimistic update shows wrong balance/progress because calculations weren't run
**Why it happens:** Client doesn't have full amortization logic
**How to avoid:** For create/update, use minimal optimistic feedback (add card, show spinner); let server response populate calculated fields
**Warning signs:** Progress bar jumps when server response arrives

### Pitfall 4: Payment Form Not Pre-filling Amount

**What goes wrong:** Users have to type monthly payment amount each time
**Why it happens:** Forgot CONTEXT.md requirement
**How to avoid:** Initialize payment form amount field with loan.monthlyPaymentCents converted to display string
**Warning signs:** User friction when logging regular payments

### Pitfall 5: Detail Page Without Auth Check

**What goes wrong:** Users can access other users' loan details by guessing IDs
**Why it happens:** Not checking ownership in getById
**How to avoid:** API already checks ownership (throws UNAUTHORIZED); UI should handle that error gracefully
**Warning signs:** 403/401 errors showing as generic error pages

### Pitfall 6: Progress Bar Over 100%

**What goes wrong:** Progress bar shows > 100% if overpaid
**Why it happens:** Not capping percentage calculation
**How to avoid:** Use Math.min(paidOff, 100) for width percentage
**Warning signs:** Progress bar overflows its container

### Pitfall 7: Loan Type vs Interest Type Confusion

**What goes wrong:** Using loanType (car/home/personal/other) for calculations instead of interestType (SIMPLE/COMPOUND)
**Why it happens:** Names are similar
**How to avoid:** loanType is display-only for UI categorization; interestType affects server calculations
**Warning signs:** Wrong interest calculations

## Code Examples

Verified patterns from project codebase and official sources:

### Loan Type Select with Capitalization

```typescript
// Source: Project Select component + CONTEXT.md loan types
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOAN_TYPES = [
  { value: "car", label: "Car" },
  { value: "home", label: "Home" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
] as const;

interface LoanTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function LoanTypeSelect({ value, onChange }: LoanTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select loan type" />
      </SelectTrigger>
      <SelectContent>
        {LOAN_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Percentage Input with % Display

```typescript
// Source: Project patterns + CONTEXT.md
// Interest rate: percentage input with % symbol (user enters "5.5", system displays "5.5%")

<form.Field name="annualRatePercent">
  {(field) => (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Interest Rate</Label>
      <div className="relative">
        <Input
          id={field.name}
          type="text"
          inputMode="decimal"
          placeholder="5.5"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const val = e.target.value;
            // Allow numbers and one decimal point
            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
              field.handleChange(val);
            }
          }}
          className="pr-8"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      </div>
      {field.state.meta.errors.map((error) => (
        <p key={error?.message} className="text-xs text-destructive">
          {error?.message}
        </p>
      ))}
    </div>
  )}
</form.Field>
```

### Payment Row with Principal/Interest Breakdown

```typescript
// Source: Project patterns + CONTEXT.md
// Each payment shows principal/interest breakdown inline

interface Payment {
  id: string;
  amountCents: bigint;
  principalCents: bigint;
  interestCents: bigint;
  isExtra: boolean;
  paidAt: Date;
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {format(payment.paidAt, "MMM d, yyyy")}
          </span>
          {payment.isExtra && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              Extra
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Principal: <MoneyDisplay cents={payment.principalCents} showSign={false} className="text-foreground" />
          {" | "}
          Interest: <MoneyDisplay cents={payment.interestCents} showSign={false} className="text-foreground" />
        </div>
      </div>
      <MoneyDisplay cents={payment.amountCents} showSign={false} className="text-lg font-medium" />
    </div>
  );
}
```

### Payment Summary After Logging

```typescript
// Source: CONTEXT.md decision
// After logging: detailed summary showing principal/interest split, new balance, payoff date change

interface PaymentSummaryProps {
  payment: {
    principalCents: bigint;
    interestCents: bigint;
  };
  newBalance: bigint;
  previousPayoffDate: Date;
  newPayoffDate: Date;
}

function PaymentSummary({ payment, newBalance, previousPayoffDate, newPayoffDate }: PaymentSummaryProps) {
  const monthsDiff = differenceInMonths(previousPayoffDate, newPayoffDate);

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-semibold">Payment Recorded</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">To Principal</div>
          <MoneyDisplay cents={payment.principalCents} showSign={false} className="font-medium" />
        </div>
        <div>
          <div className="text-muted-foreground">To Interest</div>
          <MoneyDisplay cents={payment.interestCents} showSign={false} className="font-medium" />
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="text-muted-foreground text-sm">New Balance</div>
        <MoneyDisplay cents={newBalance} showSign={false} className="text-xl font-semibold" />
      </div>

      {monthsDiff !== 0 && (
        <div className="text-sm">
          <span className="text-muted-foreground">Payoff date: </span>
          <span className={monthsDiff > 0 ? "text-green-600" : "text-muted-foreground"}>
            {monthsDiff > 0 ? `${monthsDiff} months earlier!` : format(newPayoffDate, "MMM yyyy")}
          </span>
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Integer cents | BigInt cents | Phase 1 decision | Handles larger amounts, requires superjson |
| Client-side balance calc | Server-provided balance | Phase 2 API design | Single source of truth, no drift |
| Manual progress bars | CSS width percentage | Current standard | Simple, no dependencies |
| Modal detail views | Separate routes | CONTEXT.md decision | Better URL sharing, browser history |

**Deprecated/outdated:**
- None for this phase - we're using established patterns from Phase 3

## Open Questions

Things that couldn't be fully resolved:

1. **Payment summary modal vs inline display**
   - What we know: CONTEXT.md says "After logging: detailed summary showing principal/interest split, new balance, payoff date change"
   - What's unclear: Show summary in same modal before closing, or show as inline card after modal closes?
   - Recommendation: Show summary in modal with "Done" button that closes the modal; simpler UX

2. **Empty state for loan list**
   - What we know: CONTEXT.md lists "Empty state design for loans list" as Claude's discretion
   - What's unclear: Specific copy and illustration
   - Recommendation: Simple "No loans yet" with "Add your first loan" button, no illustration needed

3. **Payoff date display when Infinity**
   - What we know: API returns Infinity for monthsRemaining when payment doesn't cover interest
   - What's unclear: How to display "never" or "payment insufficient"
   - Recommendation: Show "N/A" or "Increase payment" message instead of a date

## Sources

### Primary (HIGH confidence)
- Project codebase: Phase 3 patterns (use-transactions.ts, transaction-form.tsx, dialog.tsx, select.tsx)
- Project codebase: Phase 2 API (loan router, loan schemas, calculations.ts)
- Project codebase: Existing UI components (Card, MoneyDisplay, DatePicker)
- CONTEXT.md: User decisions for this phase

### Secondary (MEDIUM confidence)
- Base UI documentation (Dialog, Select patterns verified in Phase 3)
- TanStack Form documentation (form patterns verified in Phase 3)

### Tertiary (LOW confidence)
- None - all patterns are established from prior phases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used in Phase 3
- Architecture: HIGH - Direct extension of Phase 3 patterns
- API integration: HIGH - Loan router fully implemented in Phase 2
- UI Components: HIGH - Reusing existing primitives
- Pitfalls: HIGH - Based on Phase 3 learnings and API design

**Research date:** 2026-01-31
**Valid until:** 60 days (stable patterns, no external dependencies to update)
