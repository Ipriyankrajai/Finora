"use client";

import { ChevronDown, ChevronRight, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoanOverview } from "@/hooks/use-dashboard";
import { formatCents, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LoanOverviewCardProps {
	loan: LoanOverview;
	isExpanded: boolean;
	onToggle: () => void;
}

/**
 * Loan overview card showing balance, payoff date, and progress.
 * Per CONTEXT.md: display loan name, current balance, payoff date, monthly payment
 * Per decision 04-03: Show "N/A" with "Increase payment" hint for infinite payoff
 */
export function LoanOverviewCard({
	loan,
	isExpanded,
	onToggle,
}: LoanOverviewCardProps) {
	const { name, balanceCents, projectedPayoffDate } = loan;

	// Check if payoff is infinite (payment doesn't cover interest)
	const isPayoffInfinite =
		projectedPayoffDate.getTime() === 8_640_000_000_000_000;

	// Format payoff date or show N/A for infinite
	const payoffDisplay = isPayoffInfinite
		? "N/A"
		: formatDate(projectedPayoffDate);

	// Calculate progress - we don't have original principal in overview,
	// so we estimate based on balance being the remaining amount
	// For visual purposes, show indeterminate progress if balance is high
	const hasBalance = balanceCents > 0n;

	return (
		<Card
			className={cn(
				"cursor-pointer transition-colors hover:bg-muted/50",
				isExpanded && "ring-1 ring-primary/20"
			)}
			onClick={onToggle}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TrendingDown className="size-4 text-muted-foreground" />
						{name}
					</CardTitle>
					{isExpanded ? (
						<ChevronDown className="size-4 text-muted-foreground" />
					) : (
						<ChevronRight className="size-4 text-muted-foreground" />
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Balance */}
				<div>
					<p className="text-muted-foreground text-xs">Current Balance</p>
					<p className="font-semibold text-lg tabular-nums">
						{formatCents(balanceCents)}
					</p>
				</div>

				{/* Payoff Date */}
				<div>
					<p className="text-muted-foreground text-xs">Payoff Date</p>
					<p
						className={cn(
							"font-medium tabular-nums",
							isPayoffInfinite && "text-amber-600 dark:text-amber-500"
						)}
					>
						{payoffDisplay}
						{isPayoffInfinite && (
							<span className="ml-2 text-amber-600 text-xs dark:text-amber-500">
								(Increase payment)
							</span>
						)}
					</p>
				</div>

				{/* Progress indicator - simple visual bar */}
				{hasBalance && !isPayoffInfinite && (
					<div className="pt-1">
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full bg-primary transition-all"
								style={{
									// Show a placeholder progress since we don't have original principal
									// A more accurate calculation would require the original amount
									width: "25%",
								}}
							/>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Click to see what-if scenarios
						</p>
					</div>
				)}

				{balanceCents === 0n && (
					<p className="font-medium text-emerald-600 text-sm dark:text-emerald-500">
						Paid off!
					</p>
				)}
			</CardContent>
		</Card>
	);
}
