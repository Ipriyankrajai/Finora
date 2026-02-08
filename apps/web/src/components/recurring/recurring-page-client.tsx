"use client";

import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import { useRecurringRules } from "@/hooks/use-recurring";

import { RecurringEmptyState } from "./recurring-empty-state";
import { RecurringForm } from "./recurring-form";
import { RecurringList } from "./recurring-list";

/**
 * Client-side recurring page content with form state management.
 * Separated from server component to enable state management for dialogs.
 */
export function RecurringPageClient() {
	const { rules, isLoading, error, refetch } = useRecurringRules();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRule, setEditingRule] = useState<RecurringRuleData | null>(
		null
	);

	const handleCreateRule = () => {
		setEditingRule(null);
		setIsFormOpen(true);
	};

	const handleEditRule = (rule: RecurringRuleData) => {
		setEditingRule(rule);
		setIsFormOpen(true);
	};

	const handleFormClose = (open: boolean) => {
		setIsFormOpen(open);
		if (!open) {
			setEditingRule(null);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-9 w-64" />
						<Skeleton className="mt-2 h-5 w-48" />
					</div>
					<Skeleton className="h-10 w-28" />
				</div>
				<div className="space-y-2">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-16 w-full" key={i} />
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<AlertCircle className="mb-4 size-12 text-destructive" />
				<h3 className="font-medium text-lg">Failed to load recurring rules</h3>
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Recurring Transactions
					</h1>
					<p className="mt-1 text-muted-foreground">
						Manage rules for automatically generated transactions.
					</p>
				</div>
				{rules.length > 0 && (
					<Button
						className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
						onClick={handleCreateRule}
					>
						<Plus className="mr-2 size-4" />
						New Rule
					</Button>
				)}
			</div>

			{/* Content */}
			{rules.length === 0 ? (
				<RecurringEmptyState onCreateRule={handleCreateRule} />
			) : (
				<RecurringList onEdit={handleEditRule} rules={rules} />
			)}

			{/* Form Dialog */}
			<RecurringForm
				editingRule={editingRule}
				onOpenChange={handleFormClose}
				open={isFormOpen}
			/>
		</div>
	);
}
