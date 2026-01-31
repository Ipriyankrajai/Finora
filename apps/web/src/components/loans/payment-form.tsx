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

import { PaymentSummary } from "./payment-summary";

/**
 * Validation schema for payment form
 */
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

  // Track state for showing summary after successful payment
  const [showSummary, setShowSummary] = React.useState(false);
  const [paymentResult, setPaymentResult] = React.useState<PaymentResult | null>(null);
  const [previousBalance, setPreviousBalance] = React.useState<bigint | null>(null);

  // Convert cents to display string for pre-fill
  const getDefaultAmount = () => {
    return (Number(loan.monthlyPaymentCents) / 100).toFixed(2);
  };

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

      // Show summary with the result
      setPaymentResult(result as PaymentResult);
      setShowSummary(true);
    },
    validators: {
      onSubmit: paymentSchema,
    },
  });

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset();
      setShowSummary(false);
      setPaymentResult(null);
      setPreviousBalance(null);
      // Pre-fill with monthly payment amount
      form.setFieldValue("amount", getDefaultAmount());
      form.setFieldValue("paidAt", new Date());
      form.setFieldValue("isExtra", false);
    }
    onOpenChange(newOpen);
  };

  // Handle "Done" button in summary view
  const handleDone = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  // Calculate new balance for summary (previousBalance - principalCents)
  const newBalance = React.useMemo(() => {
    if (!paymentResult || previousBalance === null) return BigInt(0);
    return previousBalance - paymentResult.principalCents;
  }, [paymentResult, previousBalance]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showSummary ? "Payment Complete" : `Log Payment - ${loan.name}`}
          </DialogTitle>
        </DialogHeader>

        {showSummary && paymentResult ? (
          // Summary view after successful payment
          <div className="space-y-4">
            <PaymentSummary
              payment={{
                principalCents: paymentResult.principalCents,
                interestCents: paymentResult.interestCents,
              }}
              newBalance={newBalance}
            />
            <DialogFooter>
              <Button onClick={handleDone}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          // Form view for entering payment
          <form
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
                      value={field.state.value}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
