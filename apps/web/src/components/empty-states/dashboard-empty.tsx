"use client";

import { Check, Circle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface DashboardEmptyProps {
	tagCount: number;
	transactionCount: number;
	loanCount: number;
}

interface ChecklistItem {
	label: string;
	done: boolean;
	href: string;
}

/**
 * Dashboard-specific guided checklist empty state.
 * Shows setup progress with links to each action.
 * Displayed when the user has no data (new user post-onboarding).
 */
export function DashboardEmpty({
	tagCount,
	transactionCount,
	loanCount,
}: DashboardEmptyProps) {
	const items: ChecklistItem[] = [
		{
			label: "Account created",
			done: true,
			href: "/dashboard/settings",
		},
		{
			label: "Add your first tag",
			done: tagCount > 0,
			href: "/dashboard/settings",
		},
		{
			label: "Record a transaction",
			done: transactionCount > 0,
			href: "/dashboard/transactions",
		},
		{
			label: "Track a loan",
			done: loanCount > 0,
			href: "/dashboard/loans",
		},
	];

	const completedCount = items.filter((i) => i.done).length;

	return (
		<div className="mx-auto max-w-lg">
			<div className="rounded-lg border bg-card p-6">
				<div className="mb-6 text-center">
					<h2 className="mb-1 font-bold text-xl">
						Welcome to Finora! Let's get started.
					</h2>
					<p className="text-muted-foreground text-sm">
						Complete these steps to set up your financial dashboard.
					</p>
				</div>

				{/* Progress bar */}
				<div className="mb-6">
					<div className="mb-1 flex justify-between text-muted-foreground text-xs">
						<span>Progress</span>
						<span>
							{completedCount}/{items.length} complete
						</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-emerald-500 transition-all duration-500"
							style={{
								width: `${(completedCount / items.length) * 100}%`,
							}}
						/>
					</div>
				</div>

				{/* Checklist */}
				<ul className="space-y-3">
					{items.map((item) => (
						<li key={item.label}>
							<Link
								className={cn(
									"flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
									item.done
										? "bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
										: "hover:bg-muted"
								)}
								href={item.href as "/dashboard/settings"}
							>
								{item.done ? (
									<Check className="size-5 shrink-0 text-emerald-500" />
								) : (
									<Circle className="size-5 shrink-0 text-muted-foreground" />
								)}
								<span
									className={cn(
										item.done && "line-through decoration-emerald-500/40"
									)}
								>
									{item.label}
								</span>
								{!item.done && (
									<span className="ml-auto text-primary text-xs">
										Get started
									</span>
								)}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
