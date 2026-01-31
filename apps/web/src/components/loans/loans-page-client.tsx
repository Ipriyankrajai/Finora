"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type { LoanWithBalance } from "@/hooks/use-loans";

import { LoanForm } from "./loan-form";
import { LoanList } from "./loan-list";
import { PaymentForm } from "./payment-form";

/**
 * Client-side loans page content with form state management.
 * Separated from server component to enable state management for dialogs.
 */
export function LoansPageClient() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState<LoanWithBalance | null>(null);
  const [paymentLoan, setPaymentLoan] = React.useState<LoanWithBalance | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = React.useState(false);

  const handleAddLoan = () => {
    setEditingLoan(null);
    setIsFormOpen(true);
  };

  const handleEditLoan = (loan: LoanWithBalance) => {
    setEditingLoan(loan);
    setIsFormOpen(true);
  };

  const handleDeleteLoan = (_loan: LoanWithBalance) => {
    // Delete is handled by LoanList's internal confirmation dialog
    // This callback is here for potential future use
  };

  const handleLogPayment = (loan: LoanWithBalance) => {
    setPaymentLoan(loan);
    setIsPaymentFormOpen(true);
  };

  const handlePaymentFormClose = (open: boolean) => {
    setIsPaymentFormOpen(open);
    if (!open) {
      // Clear the loan state to prevent stale data on next open
      setPaymentLoan(null);
    }
  };

  // Called when payment is successfully logged - clears stale loan data
  const handlePaymentSuccess = () => {
    // Clear stale loan data so next open fetches fresh data
    setPaymentLoan(null);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingLoan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Track your loans and simulate extra payments.
          </p>
        </div>
        <Button
          className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
          onClick={handleAddLoan}
        >
          <Plus className="size-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Loans List */}
      <LoanList
        onEditLoan={handleEditLoan}
        onDeleteLoan={handleDeleteLoan}
        onLogPayment={handleLogPayment}
      />

      {/* Loan Form Dialog */}
      <LoanForm
        mode={editingLoan ? "edit" : "create"}
        loan={editingLoan ?? undefined}
        open={isFormOpen}
        onOpenChange={handleFormClose}
      />

      {/* Payment Form Dialog */}
      {paymentLoan && (
        <PaymentForm
          loan={{
            id: paymentLoan.id,
            name: paymentLoan.name,
            monthlyPaymentCents: paymentLoan.monthlyPaymentCents,
            balanceCents: paymentLoan.balanceCents,
            payoffAmountCents: paymentLoan.payoffAmountCents,
            annualRatePercent: paymentLoan.annualRatePercent,
          }}
          open={isPaymentFormOpen}
          onOpenChange={handlePaymentFormClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
