"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

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
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingLoan, setEditingLoan] = useState<LoanWithBalance | null>(null);
	const [paymentLoan, setPaymentLoan] = useState<LoanWithBalance | null>(null);
	const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

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
					<h1 className="font-bold text-3xl tracking-tight">Loans</h1>
					<p className="mt-1 text-muted-foreground">
						Track your loans and simulate extra payments.
					</p>
				</div>
				<Button
					className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
					onClick={handleAddLoan}
				>
					<Plus className="mr-2 size-4" />
					Add Loan
				</Button>
			</div>

			{/* Loans List */}
			<LoanList
				onAddLoan={handleAddLoan}
				onDeleteLoan={handleDeleteLoan}
				onEditLoan={handleEditLoan}
				onLogPayment={handleLogPayment}
			/>

			{/* Loan Form Dialog */}
			<LoanForm
				loan={editingLoan ?? undefined}
				mode={editingLoan ? "edit" : "create"}
				onOpenChange={handleFormClose}
				open={isFormOpen}
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
					onOpenChange={handlePaymentFormClose}
					onSuccess={handlePaymentSuccess}
					open={isPaymentFormOpen}
				/>
			)}
		</div>
	);
}
