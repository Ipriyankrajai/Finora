"use client";

import { CreditCard } from "lucide-react";

import { EmptyState } from "./empty-state";

interface LoansEmptyProps {
	onAddLoan: () => void;
}

/**
 * Empty state for the loans page.
 * Shows when user has no loans yet.
 */
export function LoansEmpty({ onAddLoan }: LoansEmptyProps) {
	return (
		<EmptyState
			action={{
				label: "Add Loan",
				onClick: onAddLoan,
			}}
			description="Add your loans to track payments, see remaining balances, and project payoff dates."
			icon={<CreditCard className="size-6 text-primary" />}
			title="No loans yet"
		/>
	);
}
