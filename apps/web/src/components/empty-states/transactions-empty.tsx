"use client";

import { Wallet } from "lucide-react";

import { EmptyState } from "./empty-state";

interface TransactionsEmptyProps {
	onAddTransaction: () => void;
}

/**
 * Empty state for the transactions page.
 * Shows when user has no transactions yet.
 */
export function TransactionsEmpty({
	onAddTransaction,
}: TransactionsEmptyProps) {
	return (
		<EmptyState
			action={{
				label: "Add Transaction",
				onClick: onAddTransaction,
			}}
			description="Start tracking your income and expenses to see where your money goes."
			icon={<Wallet className="size-6 text-primary" />}
			title="No transactions yet"
		/>
	);
}
