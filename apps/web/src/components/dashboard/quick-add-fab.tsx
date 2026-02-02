"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";

/**
 * Floating action button for quickly adding transactions from the dashboard.
 * Fixed to bottom-right corner, opens transaction form in dialog.
 * Per CONTEXT.md: "Quick-add transaction FAB (floating action button)"
 */
export function QuickAddFAB() {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		toast.success("Transaction added");
		// Invalidate dashboard queries to refresh data
		queryClient.invalidateQueries({
			predicate: (query) =>
				Array.isArray(query.queryKey[0]) &&
				query.queryKey[0].includes("dashboard"),
		});
	};

	return (
		<>
			{/* FAB Button - Fixed position */}
			<Button
				aria-label="Add transaction"
				className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
				onClick={() => setIsOpen(true)}
				size="icon"
			>
				<Plus className="size-6" />
			</Button>

			{/* Transaction Form Dialog */}
			<TransactionForm
				mode="create"
				onOpenChange={setIsOpen}
				onSuccess={handleSuccess}
				open={isOpen}
			/>
		</>
	);
}
