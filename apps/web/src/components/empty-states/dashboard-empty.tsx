"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Circle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { LoanForm } from "@/components/loans/loan-form";
import { TagForm } from "@/components/tags/tag-form";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardEmptyProps {
	tagCount: number;
	transactionCount: number;
}

type DialogKey = "tag" | "transaction" | "loan";

/**
 * Dashboard post-onboarding empty state.
 * Action-oriented checklist with inline modals for each action.
 * Displayed when the user has no data (new user post-onboarding).
 */
export function DashboardEmpty({
	tagCount,
	transactionCount,
}: DashboardEmptyProps) {
	const queryClient = useQueryClient();
	const [openDialog, setOpenDialog] = useState<DialogKey | null>(null);

	function openForm(key: DialogKey) {
		setOpenDialog(key);
	}

	function closeForm() {
		setOpenDialog(null);
	}

	function handleSuccess(message: string) {
		toast.success(message);
		closeForm();
		// Invalidate all queries so checklist counts refresh
		queryClient.invalidateQueries();
	}

	const items: Array<{
		key: DialogKey;
		label: string;
		description: string;
		done: boolean;
		optional?: boolean;
	}> = [
		{
			key: "tag",
			label: "Create a tag",
			description: "Categorize your spending (e.g. Food, Rent, Transport)",
			done: tagCount > 0,
		},
		{
			key: "transaction",
			label: "Record a transaction",
			description: "Log your first income or expense",
			done: transactionCount > 0,
		},
	];

	const completedCount = items.filter((i) => i.done).length;

	return (
		<div className="mx-auto max-w-lg">
			<div className="border border-border/50 bg-card/50 p-6">
				{/* Header */}
				<div className="mb-6 text-center">
					<span className="mb-3 inline-block border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[10px] text-emerald-600 uppercase tracking-[0.2em] dark:text-emerald-400/80">
						Ready to go
					</span>
					<h2 className="mb-1 font-light text-xl tracking-tight">
						Your dashboard is set up
					</h2>
					<p className="text-muted-foreground text-sm">
						Add some data and watch your financial overview come alive.
					</p>
				</div>

				{/* Progress bar */}
				<div className="mb-6">
					<div className="mb-1.5 flex justify-between text-muted-foreground text-xs">
						<span className="text-[10px] uppercase tracking-wider">
							Quick start
						</span>
						<span>
							{completedCount}/{items.length}
						</span>
					</div>
					<div className="h-1 overflow-hidden bg-foreground/5">
						<div
							className="h-full bg-emerald-500 transition-all duration-500"
							style={{
								width: `${(completedCount / items.length) * 100}%`,
							}}
						/>
					</div>
				</div>

				{/* Checklist */}
				<ul className="space-y-2">
					{items.map((item) => (
						<li key={item.key}>
							<Button
								className={cn(
									"group h-auto w-full justify-start gap-3 px-3 py-3 text-left",
									item.done
										? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/5"
										: "border-border/50 hover:border-emerald-500/20 hover:bg-card"
								)}
								disabled={item.done}
								onClick={() => openForm(item.key)}
								variant="outline"
							>
								{item.done ? (
									<Check className="size-4 shrink-0 text-emerald-500" />
								) : (
									<Circle className="size-4 shrink-0 text-muted-foreground/40" />
								)}
								<div className="min-w-0 flex-1">
									<span
										className={cn(
											"block font-medium text-xs",
											item.done
												? "text-emerald-700 dark:text-emerald-400"
												: "text-foreground"
										)}
									>
										{item.label}
										{item.optional && !item.done && (
											<span className="ml-1.5 text-[9px] text-muted-foreground/60 uppercase tracking-wider">
												Optional
											</span>
										)}
									</span>
									<span className="block text-[10px] text-muted-foreground leading-relaxed">
										{item.description}
									</span>
								</div>
								{!item.done && (
									<ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover/button:translate-x-0.5 group-hover/button:text-emerald-500" />
								)}
							</Button>
						</li>
					))}
				</ul>
			</div>

			{/* Form dialogs */}
			<TagForm
				mode="create"
				onOpenChange={(open) => !open && closeForm()}
				onSuccess={() => handleSuccess("Tag created")}
				open={openDialog === "tag"}
			/>
			<TransactionForm
				mode="create"
				onOpenChange={(open) => !open && closeForm()}
				onSuccess={() => handleSuccess("Transaction added")}
				open={openDialog === "transaction"}
			/>
			<LoanForm
				mode="create"
				onOpenChange={(open) => !open && closeForm()}
				onSuccess={() => handleSuccess("Loan added")}
				open={openDialog === "loan"}
			/>
		</div>
	);
}
