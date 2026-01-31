"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionWithTags } from "@/hooks/use-transactions";
import { TransactionFilters } from "./transaction-filters";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";

/**
 * Client-side transactions page content with form state management.
 * Separated from server component to enable state management for dialogs.
 */
export function TransactionsPageClient() {
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [editingTransaction, setEditingTransaction] =
		React.useState<TransactionWithTags | null>(null);

	const handleAddTransaction = () => {
		setEditingTransaction(null);
		setIsFormOpen(true);
	};

	const handleEditTransaction = (transaction: TransactionWithTags) => {
		setEditingTransaction(transaction);
		setIsFormOpen(true);
	};

	const handleFormClose = (open: boolean) => {
		setIsFormOpen(open);
		if (!open) {
			setEditingTransaction(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Transactions</h1>
					<p className="mt-1 text-muted-foreground">
						Track your income and expenses.
					</p>
				</div>
				<Button
					className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
					onClick={handleAddTransaction}
				>
					<Plus className="mr-2 size-4" />
					Add Transaction
				</Button>
			</div>

			{/* Filters */}
			<TransactionFilters />

			{/* Transactions List */}
			<Card>
				<CardHeader>
					<CardTitle>All Transactions</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<TransactionList onEditTransaction={handleEditTransaction} />
				</CardContent>
			</Card>

			{/* Transaction Form Dialog */}
			<TransactionForm
				mode={editingTransaction ? "edit" : "create"}
				onOpenChange={handleFormClose}
				open={isFormOpen}
				transaction={
					editingTransaction
						? {
								id: editingTransaction.id,
								type: editingTransaction.type,
								amountCents: editingTransaction.amountCents,
								date: new Date(editingTransaction.date),
								description: editingTransaction.description,
								tags: editingTransaction.tags,
							}
						: undefined
				}
			/>
		</div>
	);
}
