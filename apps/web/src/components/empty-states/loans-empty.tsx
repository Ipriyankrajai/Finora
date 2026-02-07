"use client";

import { CreditCard, Plus } from "lucide-react";

interface LoansEmptyProps {
	onAddLoan: () => void;
}

/**
 * Empty state for the loans page.
 * Matches the dashboard loan empty state style.
 */
export function LoansEmpty({ onAddLoan }: LoansEmptyProps) {
	return (
		<div className="border-2 border-border/60 border-dashed bg-linear-to-br from-card/80 to-transparent p-8 text-center">
			<div className="mx-auto mb-4 flex size-14 items-center justify-center bg-primary/10">
				<CreditCard className="size-6 text-primary" />
			</div>
			<h3 className="mb-2 font-semibold text-lg">No loans yet</h3>
			<p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
				Add your loans to track payments, see remaining balances, and project
				payoff dates.
			</p>
			<button
				className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:from-emerald-500 hover:to-emerald-400"
				onClick={onAddLoan}
				type="button"
			>
				<Plus className="size-4" />
				Add your first loan
			</button>
		</div>
	);
}
