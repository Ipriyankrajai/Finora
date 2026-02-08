"use client";

import { Plus, Repeat } from "lucide-react";

interface RecurringEmptyStateProps {
	onCreateRule: () => void;
}

/**
 * Empty state shown when user has no recurring transaction rules.
 * Follows the same visual pattern as LoansEmpty.
 */
export function RecurringEmptyState({
	onCreateRule,
}: RecurringEmptyStateProps) {
	return (
		<div className="border-2 border-border/60 border-dashed bg-linear-to-br from-card/80 to-transparent p-8 text-center">
			<div className="mx-auto mb-4 flex size-14 items-center justify-center bg-primary/10">
				<Repeat className="size-6 text-primary" />
			</div>
			<h3 className="mb-2 font-semibold text-lg">No recurring transactions</h3>
			<p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
				Set up rules to automatically generate regular income and expenses.
			</p>
			<button
				className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:from-emerald-500 hover:to-emerald-400"
				onClick={onCreateRule}
				type="button"
			>
				<Plus className="size-4" />
				Create your first rule
			</button>
		</div>
	);
}
