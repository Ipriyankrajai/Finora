"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { TagMultiSelect } from "./tag-multi-select";

/**
 * Validation schema for transaction form
 */
const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), "Enter a valid amount")
    .refine((val) => parseFloat(val) > 0, "Amount must be positive")
    .refine((val) => parseFloat(val) <= 999999999.99, "Amount too large"),
  date: z.date({ message: "Date is required" }),
  description: z.string().max(500, "Notes must be 500 characters or less"),
  tagIds: z.array(z.string()),
});

interface TransactionFormProps {
  mode: "create" | "edit";
  transaction?: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amountCents: bigint;
    date: Date;
    description: string | null;
    tags: Array<{ tag: { id: string } }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Transaction create/edit form in a dialog.
 * Per CONTEXT.md: "Modal/dialog", "Toggle/tabs at top for income/expense"
 */
export function TransactionForm({
  mode,
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  // Convert amountCents (BigInt) to display string
  const getInitialAmount = () => {
    if (!transaction) return "";
    // Convert cents to dollars with 2 decimal places
    const cents = Number(transaction.amountCents);
    return (cents / 100).toFixed(2);
  };

  const form = useForm({
    defaultValues: {
      type: (transaction?.type ?? "EXPENSE") as "INCOME" | "EXPENSE",
      amount: getInitialAmount(),
      date: transaction?.date ?? new Date(),
      description: transaction?.description ?? "",
      tagIds: transaction?.tags.map((t) => t.tag.id) ?? [],
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createTransaction.mutateAsync({
          type: value.type,
          amount: value.amount,
          date: value.date,
          description: value.description || undefined,
          tagIds: value.tagIds.length > 0 ? value.tagIds : undefined,
        });
      } else if (transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          type: value.type,
          amount: value.amount,
          date: value.date,
          description: value.description || undefined,
          tagIds: value.tagIds,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    },
    validators: {
      onSubmit: transactionSchema,
    },
  });

  // Reset form when dialog opens with new transaction data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset();
      form.setFieldValue("type", transaction?.type ?? "EXPENSE");
      form.setFieldValue("amount", getInitialAmount());
      form.setFieldValue("date", transaction?.date ?? new Date());
      form.setFieldValue("description", transaction?.description ?? "");
      form.setFieldValue("tagIds", transaction?.tags.map((t) => t.tag.id) ?? []);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Transaction" : "Edit Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Type toggle - Income/Expense */}
          <form.Field name="type">
            {(field) => (
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex rounded-none border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => field.handleChange("INCOME")}
                    className={cn(
                      "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                      field.state.value === "INCOME"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => field.handleChange("EXPENSE")}
                    className={cn(
                      "flex-1 px-4 py-2 text-sm font-medium transition-colors border-l border-border",
                      field.state.value === "EXPENSE"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Expense
                  </button>
                </div>
              </div>
            )}
          </form.Field>

          {/* Amount input */}
          <form.Field name="amount">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Amount</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      // Only allow numbers and one decimal point
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                        field.handleChange(val);
                      }
                    }}
                    className="pl-6"
                    autoFocus
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* Date picker */}
          <form.Field name="date">
            {(field) => (
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date ?? new Date())}
                  className="w-full"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* Description/Notes */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="What was this for?"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* Tags multi-select */}
          <form.Field name="tagIds">
            {(field) => (
              <div className="space-y-2">
                <Label>
                  Tags <span className="text-muted-foreground">(optional)</span>
                </Label>
                <TagMultiSelect
                  value={field.state.value}
                  onChange={(tagIds) => field.handleChange(tagIds)}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-4">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              }
            />
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting || isPending}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
