"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { useAddPayment, type PaymentResult } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { PaymentSummary } from "./payment-summary";

/**
 * Create validation schema for payment form with balance check
 */
const createPaymentSchema = (maxAmountCents: bigint) => {
  const maxAmount = Number(maxAmountCents) / 100;
  return z.object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), "Enter a valid amount")
      .refine((val) => parseFloat(val) > 0, "Amount must be positive")
      .refine(
        (val) => parseFloat(val) <= maxAmount,
        `Amount exceeds remaining balance of $${maxAmount.toFixed(2)}`
      ),
    paidAt: z.date({ message: "Date is required" }),
    isExtra: z.boolean(),
  });
};

interface PaymentFormProps {
  loan: {
    id: string;
    name: string;
    monthlyPaymentCents: bigint;
    balanceCents: bigint;
    annualRatePercent: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Payment logging modal form with "is extra payment" toggle.
 * Pre-fills amount with loan.monthlyPaymentCents.
 * Shows summary with principal/interest split after successful submission.
 */
export function PaymentForm({
  loan,
  open,
  onOpenChange,
  onSuccess,
}: PaymentFormProps) {
  const addPayment = useAddPayment();

  // Form key to force re-mount on dialog open (ensures clean form state)
  const [formKey, setFormKey] = React.useState(0);

  // Track state for showing summary after successful payment
  // Use a stable view state to prevent flicker during transitions
  const [viewState, setViewState] = React.useState<"form" | "transitioning" | "summary">("form");
  const [paymentResult, setPaymentResult] = React.useState<PaymentResult | null>(null);
  const [previousBalance, setPreviousBalance] = React.useState<bigint | null>(null);

  // Convert cents to display string for pre-fill
  // Use the smaller of monthly payment or remaining balance
  const getDefaultAmount = React.useCallback(() => {
    const monthlyPayment = Number(loan.monthlyPaymentCents);
    const remainingBalance = Number(loan.balanceCents);
    const prefillAmount = Math.min(monthlyPayment, remainingBalance);
    return (prefillAmount / 100).toFixed(2);
  }, [loan.monthlyPaymentCents, loan.balanceCents]);

  const form = useForm({
    defaultValues: {
      amount: getDefaultAmount(),
      paidAt: new Date(),
      isExtra: false,
    },
    onSubmit: async ({ value }) => {
      // Store current balance before submission for summary
      setPreviousBalance(loan.balanceCents);

      const result = await addPayment.mutateAsync({
        loanId: loan.id,
        amount: value.amount,
        paidAt: value.paidAt,
        isExtra: value.isExtra,
      });

      // Transition to summary state smoothly (prevents flicker)
      setViewState("transitioning");
      setPaymentResult(result as PaymentResult);
      // Small delay to ensure state is set before showing summary
      requestAnimationFrame(() => {
        setViewState("summary");
      });
    },
    validators: {
      onSubmit: createPaymentSchema(loan.balanceCents),
    },
  });

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Increment form key to force complete form re-mount with fresh state
      setFormKey((k) => k + 1);
      setViewState("form");
      setPaymentResult(null);
      setPreviousBalance(null);
    } else {
      // Reset state when closing
      setViewState("form");
      setPaymentResult(null);
      setPreviousBalance(null);
    }
    onOpenChange(newOpen);
  };

  // Handle "Done" button in summary view
  const handleDone = () => {
    handleOpenChange(false);
    onSuccess?.();
  };

  // Calculate new balance for summary (previousBalance - principalCents)
  const newBalance = React.useMemo(() => {
    if (!paymentResult || previousBalance === null) return BigInt(0);
    return previousBalance - paymentResult.principalCents;
  }, [paymentResult, previousBalance]);

  const showSummary = viewState === "summary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {showSummary && paymentResult ? (
          // Summary view after successful payment - stable render without flicker
          <div className="space-y-4">
            {/* Success header with proper dark/light mode colors */}
            <div
              className={cn(
                "flex items-center gap-3 pb-2 border-b",
                "border-emerald-200 dark:border-emerald-800/50"
              )}
            >
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center shrink-0",
                  "bg-emerald-100 dark:bg-emerald-900/50",
                  "text-emerald-600 dark:text-emerald-400"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Payment Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Successfully logged for {loan.name}
                </p>
              </div>
            </div>

            <PaymentSummary
              payment={{
                principalCents: paymentResult.principalCents,
                interestCents: paymentResult.interestCents,
              }}
              newBalance={newBalance}
            />

            <DialogFooter className="pt-2">
              <Button onClick={handleDone} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Form view for entering payment - uses key to force remount
          <>
            <DialogHeader>
              <DialogTitle>Log Payment - {loan.name}</DialogTitle>
            </DialogHeader>

            <form
              key={formKey}
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
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
                        defaultValue={getDefaultAmount()}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          // Only allow numbers and one decimal point with max 2 decimals
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
              <form.Field name="paidAt">
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

              {/* Is Extra Payment checkbox */}
              <form.Field name="isExtra">
                {(field) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                    />
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-normal cursor-pointer"
                    >
                      This is an extra payment
                    </Label>
                  </div>
                )}
              </form.Field>

              <DialogFooter className="pt-4">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={addPayment.isPending}
                    >
                      Cancel
                    </Button>
                  }
                />
                <form.Subscribe>
                  {(state) => (
                    <Button
                      type="submit"
                      disabled={
                        !state.canSubmit || state.isSubmitting || addPayment.isPending
                      }
                    >
                      {addPayment.isPending ? "Logging..." : "Log Payment"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
