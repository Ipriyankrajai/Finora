"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";

import { useCreateLoan, useUpdateLoan } from "@/hooks/use-loans";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LoanWithBalance } from "@/hooks/use-loans";

/**
 * Validation schema for loan form
 */
const loanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  interestType: z.enum(["SIMPLE", "COMPOUND"]),
  principal: z
    .string()
    .min(1, "Principal is required")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), "Enter valid amount")
    .refine((val) => parseFloat(val) > 0, "Must be positive"),
  annualRatePercent: z
    .string()
    .min(1, "Rate is required")
    .refine((val) => /^\d*\.?\d{0,2}$/.test(val) && val !== "", "Enter valid rate")
    .refine(
      (val) => parseFloat(val) >= 0 && parseFloat(val) <= 100,
      "Rate must be 0-100%"
    ),
  termMonths: z
    .string()
    .min(1, "Term is required")
    .refine((val) => /^\d+$/.test(val), "Enter whole number")
    .refine(
      (val) => parseInt(val) >= 1 && parseInt(val) <= 600,
      "Term must be 1-600 months"
    ),
  monthlyPayment: z.string(), // Calculated, always valid
  startDate: z.date({ message: "Start date is required" }),
});

interface LoanFormProps {
  mode: "create" | "edit";
  loan?: LoanWithBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Calculate monthly payment using PMT formula.
 * PMT = P * (r * (1+r)^n) / ((1+r)^n - 1)
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const x = Math.pow(1 + monthlyRate, termMonths);
  return (principal * x * monthlyRate) / (x - 1);
}

/**
 * Loan create/edit form in a dialog.
 * Per CONTEXT.md: Loan type dropdown, currency inputs, percentage input with %, auto-calculated payment
 */
export function LoanForm({
  mode,
  loan,
  open,
  onOpenChange,
  onSuccess,
}: LoanFormProps) {
  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();

  const isPending = createLoan.isPending || updateLoan.isPending;

  // Track calculated monthly payment separately for display
  const [calculatedPayment, setCalculatedPayment] = useState("");

  // Convert cents to display string
  const getInitialPrincipal = () => {
    if (!loan) return "";
    const cents = Number(loan.principalCents);
    return (cents / 100).toFixed(2);
  };

  const getInitialPayment = () => {
    if (!loan) return "";
    const cents = Number(loan.monthlyPaymentCents);
    return (cents / 100).toFixed(2);
  };

  const form = useForm({
    defaultValues: {
      name: loan?.name ?? "",
      interestType: (loan?.interestType ?? "COMPOUND") as "SIMPLE" | "COMPOUND",
      principal: getInitialPrincipal(),
      annualRatePercent: loan?.annualRatePercent?.toString() ?? "",
      termMonths: loan?.termMonths?.toString() ?? "",
      monthlyPayment: getInitialPayment(),
      startDate: loan?.startDate ?? new Date(),
    },
    onSubmit: async ({ value }) => {
      // Use calculated payment or manual if provided
      const paymentToUse = calculatedPayment || value.monthlyPayment;

      if (mode === "create") {
        await createLoan.mutateAsync({
          name: value.name,
          loanType: "personal", // Default since not stored
          interestType: value.interestType,
          principal: value.principal,
          annualRatePercent: parseFloat(value.annualRatePercent),
          termMonths: parseInt(value.termMonths),
          monthlyPayment: paymentToUse,
          startDate: value.startDate,
        });
      } else if (loan) {
        await updateLoan.mutateAsync({
          id: loan.id,
          name: value.name,
          interestType: value.interestType,
          principal: value.principal,
          annualRatePercent: parseFloat(value.annualRatePercent),
          termMonths: parseInt(value.termMonths),
          monthlyPayment: paymentToUse,
          startDate: value.startDate,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    },
    validators: {
      onSubmit: loanSchema,
    },
  });

  // Helper to recalculate payment
  const recalculatePayment = (
    principalStr: string,
    rateStr: string,
    termStr: string
  ) => {
    const principal = parseFloat(principalStr || "0");
    const rate = parseFloat(rateStr || "0");
    const term = parseInt(termStr || "0");

    if (principal > 0 && term > 0) {
      const payment = calculateMonthlyPayment(principal, rate, term);
      setCalculatedPayment(payment.toFixed(2));
    } else {
      setCalculatedPayment("");
    }
  };

  // Initialize calculated payment on mount for edit mode
  useEffect(() => {
    if (mode === "edit" && loan) {
      setCalculatedPayment(getInitialPayment());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, loan?.id]);

  // Reset form when dialog opens with new loan data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset();
      form.setFieldValue("name", loan?.name ?? "");
      form.setFieldValue("interestType", loan?.interestType ?? "COMPOUND");
      form.setFieldValue("principal", getInitialPrincipal());
      form.setFieldValue("annualRatePercent", loan?.annualRatePercent?.toString() ?? "");
      form.setFieldValue("termMonths", loan?.termMonths?.toString() ?? "");
      form.setFieldValue("monthlyPayment", getInitialPayment());
      form.setFieldValue("startDate", loan?.startDate ?? new Date());
      setCalculatedPayment(getInitialPayment());
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Loan" : "Edit Loan"}
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
          {/* Name input */}
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Loan Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="e.g., Car Loan, Mortgage"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoFocus
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          {/* Interest Type select */}
          <form.Field name="interestType">
            {(field) => (
              <div className="space-y-2">
                <Label>Interest Type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as "SIMPLE" | "COMPOUND")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select interest type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPOUND">Compound</SelectItem>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {/* Principal input */}
          <form.Field name="principal">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Principal Amount</Label>
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
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                        field.handleChange(val);
                        // Recalculate payment
                        recalculatePayment(
                          val,
                          form.getFieldValue("annualRatePercent"),
                          form.getFieldValue("termMonths")
                        );
                      }
                    }}
                    className="pl-6"
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

          {/* Interest Rate input */}
          <form.Field name="annualRatePercent">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Annual Interest Rate</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="decimal"
                    placeholder="5.00"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                        field.handleChange(val);
                        // Recalculate payment
                        recalculatePayment(
                          form.getFieldValue("principal"),
                          val,
                          form.getFieldValue("termMonths")
                        );
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

          {/* Term input */}
          <form.Field name="termMonths">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Loan Term (months)</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    placeholder="60"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        field.handleChange(val);
                        // Recalculate payment
                        recalculatePayment(
                          form.getFieldValue("principal"),
                          form.getFieldValue("annualRatePercent"),
                          val
                        );
                      }
                    }}
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

          {/* Monthly Payment - calculated/display */}
          <div className="space-y-2">
            <Label>Monthly Payment (calculated)</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                type="text"
                value={calculatedPayment}
                readOnly
                className="pl-6 bg-muted/50"
                placeholder="Auto-calculated"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on principal, rate, and term
            </p>
          </div>

          {/* Start Date picker */}
          <form.Field name="startDate">
            {(field) => (
              <div className="space-y-2">
                <Label>Start Date</Label>
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
                  disabled={!state.canSubmit || state.isSubmitting || isPending || !calculatedPayment}
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
