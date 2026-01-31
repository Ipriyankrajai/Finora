"use client";

import { format } from "date-fns";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { MoneyDisplay } from "@/components/shared/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoan, useDeletePayment, type LoanWithBalance } from "@/hooks/use-loans";

import { LoanForm } from "./loan-form";
import { PaymentForm } from "./payment-form";
import { PaymentList } from "./payment-list";

interface LoanDetailPageProps {
  loanId: string;
}

/**
 * Loan detail page showing summary stats and payment history.
 * Per CONTEXT.md: "Summary stats at top (balance, interest paid, payoff date), payment history below"
 */
export function LoanDetailPage({ loanId }: LoanDetailPageProps) {
  const { loan, isLoading, error } = useLoan(loanId);
  const deletePayment = useDeletePayment();

  // State for dialogs
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deletePayment.mutateAsync({ id: deleteTarget });
    setDeleteTarget(null);
  };

  // Loading state
  if (isLoading) {
    return <LoanDetailSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/loans"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Loans</span>
          </Link>
        </nav>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                {error.message || "Failed to load loan details"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!loan) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/loans"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Loans</span>
          </Link>
        </nav>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loan not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cast to include full loan details with projection
  const loanWithDetails = loan as typeof loan & {
    projection: {
      monthsRemaining: number;
      totalInterestRemainingCents: bigint;
      projectedPayoffDate: Date | null;
    };
    payments: Array<{
      id: string;
      amountCents: bigint;
      principalCents: bigint;
      interestCents: bigint;
      isExtra: boolean;
      paidAt: Date;
    }>;
  };

  // Convert loan for form - it expects LoanWithBalance type
  const loanForForm: LoanWithBalance = {
    id: loan.id,
    name: loan.name,
    interestType: loan.interestType,
    principalCents: loan.principalCents,
    balanceCents: loan.balanceCents,
    totalInterestPaidCents: loan.totalInterestPaidCents,
    annualRatePercent: loan.annualRatePercent,
    termMonths: loan.termMonths,
    monthlyPaymentCents: loan.monthlyPaymentCents,
    startDate: loan.startDate,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };

  // Handle payoff date display
  const isPayoffInfinite =
    loanWithDetails.projection.monthsRemaining === Infinity ||
    !loanWithDetails.projection.projectedPayoffDate ||
    !Number.isFinite(loanWithDetails.projection.monthsRemaining);

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation - separate from content */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/loans"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Loans</span>
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium truncate">{loan.name}</span>
      </nav>

      {/* Header with title and actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{loan.name}</h1>
          <p className="text-sm text-muted-foreground">
            {loan.interestType === "COMPOUND" ? "Compound" : "Simple"} Interest Loan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
            onClick={() => setIsPaymentOpen(true)}
          >
            <Plus className="size-4 mr-2" />
            Log Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Remaining Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay
              cents={loan.balanceCents}
              showSign={false}
              className="text-2xl font-bold"
            />
          </CardContent>
        </Card>

        {/* Interest Paid to Date */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interest Paid to Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyDisplay
              cents={loan.totalInterestPaidCents}
              showSign={false}
              className="text-2xl font-bold"
            />
          </CardContent>
        </Card>

        {/* Projected Payoff */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projected Payoff
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPayoffInfinite ? (
              <div>
                <span className="text-2xl font-bold">N/A</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Increase payment to pay off
                </p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold">
                  {format(new Date(loanWithDetails.projection.projectedPayoffDate!), "MMM yyyy")}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(loanWithDetails.projection.monthsRemaining)} months remaining
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loan Info Row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div>
          <span className="text-foreground font-medium">Principal:</span>{" "}
          <MoneyDisplay cents={loan.principalCents} showSign={false} />
        </div>
        <div>
          <span className="text-foreground font-medium">Rate:</span>{" "}
          {loan.annualRatePercent.toFixed(2)}% APR
        </div>
        <div>
          <span className="text-foreground font-medium">Payment:</span>{" "}
          <MoneyDisplay cents={loan.monthlyPaymentCents} showSign={false} />
          /mo
        </div>
        <div>
          <span className="text-foreground font-medium">Started:</span>{" "}
          {format(new Date(loan.startDate), "MMM yyyy")}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentList
            payments={loanWithDetails.payments}
            onDeletePayment={(paymentId) => setDeleteTarget(paymentId)}
          />
        </CardContent>
      </Card>

      {/* Edit Loan Dialog */}
      <LoanForm
        mode="edit"
        loan={loanForForm}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Log Payment Dialog */}
      <PaymentForm
        loan={{
          id: loan.id,
          name: loan.name,
          monthlyPaymentCents: loan.monthlyPaymentCents,
          balanceCents: loan.balanceCents,
          annualRatePercent: loan.annualRatePercent,
        }}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this payment?</DialogTitle>
            <DialogDescription>
              This will recalculate your loan balance. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Loading skeleton for loan detail page
 */
function LoanDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info row skeleton */}
      <div className="flex gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Payment history skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b last:border-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
