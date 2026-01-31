"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteLoan, useLoans, type LoanWithBalance } from "@/hooks/use-loans";

import { LoanCard } from "./loan-card";

interface LoanListProps {
  onEditLoan: (loan: LoanWithBalance) => void;
  onDeleteLoan: (loan: LoanWithBalance) => void;
  onLogPayment: (loan: LoanWithBalance) => void;
}

/**
 * Grid of loan cards with loading, error, and empty states.
 * Includes delete confirmation dialog.
 */
export function LoanList({
  onEditLoan,
  onDeleteLoan,
  onLogPayment,
}: LoanListProps) {
  const router = useRouter();
  const { loans, isLoading, error, refetch } = useLoans();
  const deleteLoan = useDeleteLoan();

  // Track loan to delete for confirmation dialog
  const [deleteTarget, setDeleteTarget] = React.useState<LoanWithBalance | null>(null);

  const handleDeleteClick = (loan: LoanWithBalance) => {
    setDeleteTarget(loan);
    onDeleteLoan(loan); // Notify parent if needed
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteLoan.mutateAsync({ id: deleteTarget.id });
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleCardClick = (loan: LoanWithBalance) => {
    // Type assertion needed for dynamic routes until next build regenerates types
    router.push(`/dashboard/loans/${loan.id}` as "/dashboard/loans/[id]");
  };

  // Loading state - skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="size-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Failed to load loans</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || "Something went wrong"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!loans || loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">$</span>
        </div>
        <h3 className="text-lg font-medium">No loans yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Add your first loan to start tracking payoff progress and simulate
          extra payment strategies.
        </p>
      </div>
    );
  }

  // Loans grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            onClick={() => handleCardClick(loan)}
            onEdit={() => onEditLoan(loan)}
            onDelete={() => handleDeleteClick(loan)}
            onLogPayment={() => onLogPayment(loan)}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will permanently delete this loan and all its payment history.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={deleteLoan.isPending}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoan.isPending}
            >
              {deleteLoan.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
