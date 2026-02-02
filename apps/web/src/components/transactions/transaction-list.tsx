"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

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
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import {
	type TransactionWithTags,
	useDeleteTransaction,
	useTransactions,
} from "@/hooks/use-transactions";

import { DateGroupHeader } from "./date-group-header";
import { TransactionRow } from "./transaction-row";

interface TransactionListProps {
	onEditTransaction?: (transaction: TransactionWithTags) => void;
}

/**
 * Paginated transaction list with date grouping.
 * Per CONTEXT.md: "Grouped by date with daily sections", "Page numbers"
 */
export function TransactionList({ onEditTransaction }: TransactionListProps) {
	const { groups, items, isLoading, error, hasNextPage, refetch } =
		useTransactions();
	const { filters, setFilter } = useTransactionFilters();
	const deleteTransaction = useDeleteTransaction();

	// State for delete confirmation dialog
	const [deletingTransactionId, setDeletingTransactionId] = useState<
		string | null
	>(null);
	const _deletingTransaction = deletingTransactionId
		? items.find((t) => t.id === deletingTransactionId)
		: null;

	const handleEdit = (id: string) => {
		const transaction = items.find((t) => t.id === id);
		if (transaction && onEditTransaction) {
			onEditTransaction(transaction);
		}
	};

	const handleDeleteRequest = (id: string) => {
		setDeletingTransactionId(id);
	};

	const handleDeleteConfirm = async () => {
		if (deletingTransactionId) {
			await deleteTransaction.mutateAsync({ id: deletingTransactionId });
			setDeletingTransactionId(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeletingTransactionId(null);
	};

	// Handle page navigation
	const handlePrevPage = () => {
		if (filters.page > 1) {
			setFilter("page", filters.page - 1);
		}
	};

	const handleNextPage = () => {
		if (hasNextPage) {
			setFilter("page", filters.page + 1);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Skeleton headers and rows */}
				{[1, 2, 3].map((groupIndex) => (
					<div className="space-y-1" key={groupIndex}>
						<Skeleton className="h-8 w-24" />
						{[1, 2, 3].map((rowIndex) => (
							<Skeleton
								className="h-14 w-full"
								key={`${groupIndex}-${rowIndex}`}
							/>
						))}
					</div>
				))}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<AlertCircle className="mb-4 size-12 text-destructive" />
				<h3 className="mb-2 font-medium text-lg">
					Failed to load transactions
				</h3>
				<p className="mb-4 text-muted-foreground text-sm">
					{error.message || "An unexpected error occurred"}
				</p>
				<Button onClick={() => refetch()} variant="outline">
					<Loader2 className="mr-2 hidden size-4 animate-spin" />
					Try again
				</Button>
			</div>
		);
	}

	// Empty state
	if (groups.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="mb-4 rounded-full bg-muted/50 p-6">
					<svg
						aria-label="Empty clipboard"
						className="size-12 text-muted-foreground"
						fill="none"
						role="img"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<h3 className="mb-2 font-medium text-lg">No transactions found</h3>
				<p className="text-muted-foreground text-sm">
					{filters.datePreset ||
					filters.type ||
					filters.tagId ||
					filters.amountMin ||
					filters.amountMax
						? "Try adjusting your filters to see more results."
						: 'Click "Add Transaction" to start tracking your spending.'}
				</p>
			</div>
		);
	}

	// Transaction list with date groups
	return (
		<div className="space-y-0">
			{/* Grouped transactions */}
			<div className="divide-y divide-border">
				{groups.map((group) => (
					<div className="group" key={group.label}>
						<DateGroupHeader label={group.label} />
						<div className="divide-y divide-border/50">
							{group.transactions.map((transaction) => (
								<TransactionRow
									className="group"
									key={transaction.id}
									onDelete={handleDeleteRequest}
									onEdit={handleEdit}
									transaction={transaction}
								/>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Pagination controls */}
			<div className="flex items-center justify-between border-border border-t px-4 py-3">
				<Button
					disabled={filters.page <= 1}
					onClick={handlePrevPage}
					size="sm"
					variant="outline"
				>
					<ChevronLeft className="mr-1 size-4" />
					Previous
				</Button>

				<span className="text-muted-foreground text-sm">
					Page {filters.page}
				</span>

				<Button
					disabled={!hasNextPage}
					onClick={handleNextPage}
					size="sm"
					variant="outline"
				>
					Next
					<ChevronRight className="ml-1 size-4" />
				</Button>
			</div>

			{/* Delete confirmation dialog */}
			<Dialog
				onOpenChange={(open) => !open && handleDeleteCancel()}
				open={!!deletingTransactionId}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete Transaction</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this transaction? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4">
						<DialogClose
							render={
								<Button
									disabled={deleteTransaction.isPending}
									type="button"
									variant="outline"
								>
									Cancel
								</Button>
							}
						/>
						<Button
							disabled={deleteTransaction.isPending}
							onClick={handleDeleteConfirm}
							variant="destructive"
						>
							{deleteTransaction.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
