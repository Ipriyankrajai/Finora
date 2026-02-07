"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LoansEmpty } from "@/components/empty-states/loans-empty";
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
import {
	type LoanWithBalance,
	useDeleteLoan,
	useLoans,
} from "@/hooks/use-loans";

import { LoanCard } from "./loan-card";

interface LoanListProps {
	onEditLoan: (loan: LoanWithBalance) => void;
	onDeleteLoan: (loan: LoanWithBalance) => void;
	onLogPayment: (loan: LoanWithBalance) => void;
	onAddLoan: () => void;
}

/**
 * Grid of loan cards with loading, error, and empty states.
 * Includes delete confirmation dialog.
 */
export function LoanList({
	onEditLoan,
	onDeleteLoan,
	onLogPayment,
	onAddLoan,
}: LoanListProps) {
	const router = useRouter();
	const { loans, isLoading, error, refetch } = useLoans();
	const deleteLoan = useDeleteLoan();

	// Track loan to delete for confirmation dialog
	const [deleteTarget, setDeleteTarget] = useState<LoanWithBalance | null>(
		null
	);

	const handleDeleteClick = (loan: LoanWithBalance) => {
		setDeleteTarget(loan);
		onDeleteLoan(loan); // Notify parent if needed
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget) {
			return;
		}
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
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Skeleton className="h-48 rounded-lg" key={i} />
				))}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<AlertCircle className="mb-4 size-12 text-destructive" />
				<h3 className="font-medium text-lg">Failed to load loans</h3>
				<p className="mb-4 text-muted-foreground">
					{error.message || "Something went wrong"}
				</p>
				<Button onClick={() => refetch()} variant="outline">
					<RefreshCw className="mr-2 size-4" />
					Try Again
				</Button>
			</div>
		);
	}

	// Empty state
	if (!loans || loans.length === 0) {
		return <LoansEmpty onAddLoan={onAddLoan} />;
	}

	// Loans grid
	return (
		<>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{loans.map((loan) => (
					<LoanCard
						key={loan.id}
						loan={loan}
						onClick={() => handleCardClick(loan)}
						onDelete={() => handleDeleteClick(loan)}
						onEdit={() => onEditLoan(loan)}
						onLogPayment={() => onLogPayment(loan)}
					/>
				))}
			</div>

			{/* Delete confirmation dialog */}
			<Dialog
				onOpenChange={(open) => !open && handleCancelDelete()}
				open={!!deleteTarget}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
						<DialogDescription>
							This will permanently delete this loan and all its payment
							history. This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose
							render={
								<Button disabled={deleteLoan.isPending} variant="outline">
									Cancel
								</Button>
							}
						/>
						<Button
							disabled={deleteLoan.isPending}
							onClick={handleConfirmDelete}
							variant="destructive"
						>
							{deleteLoan.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
