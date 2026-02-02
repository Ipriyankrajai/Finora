"use client";

import {
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Sparkles,
	TrendingDown,
} from "lucide-react";

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
 * Completed loans (balance = 0) don't expand for what-if since there's nothing to simulate.
 */
export function LoanOverviewCard({
	loan,
	isExpanded,
	onToggle,
}: LoanOverviewCardProps) {
	const { name, balanceCents, projectedPayoffDate, interestPaidCents } = loan;

	// Check if loan is paid off
	const isPaidOff = balanceCents === 0n;

	// Check if payoff is infinite (payment doesn't cover interest)
	const isPayoffInfinite =
		!isPaidOff && projectedPayoffDate.getTime() === 8_640_000_000_000_000;

	// Format payoff date or show N/A for infinite
	const payoffDisplay = isPayoffInfinite
		? "N/A"
		: isPaidOff
			? "Completed"
			: formatDate(projectedPayoffDate);

	// Calculate if we can show what-if (only for active loans with balance)
	const canShowWhatIf = !isPaidOff;

	// Handle click - only toggle if loan is not paid off
	const handleClick = () => {
		if (canShowWhatIf) {
			onToggle();
		}
	};

	return (
		<Card
			className={cn(
				"group relative overflow-hidden transition-all duration-300",
				canShowWhatIf && "cursor-pointer hover:border-primary/30",
				isExpanded && "border-primary/40 ring-2 ring-primary/10",
				isPaidOff &&
					"border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-transparent dark:border-emerald-800/50 dark:from-emerald-950/20"
			)}
			onClick={handleClick}
		>
			{/* Subtle gradient overlay for active loans */}
			{!isPaidOff && (
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			)}

			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2.5">
						{isPaidOff ? (
							<div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
								<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							</div>
						) : (
							<div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
								<TrendingDown className="size-3.5 text-primary" />
							</div>
						)}
						<span className="font-semibold">{name}</span>
					</CardTitle>
					{canShowWhatIf &&
						(isExpanded ? (
							<ChevronDown className="size-4 text-primary transition-transform" />
						) : (
							<ChevronRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
						))}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Balance section with visual emphasis */}
				<div className="flex items-baseline justify-between">
					<div>
						<p className="mb-0.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							{isPaidOff ? "Final Balance" : "Balance"}
						</p>
						<p
							className={cn(
								"font-bold text-2xl tabular-nums tracking-tight",
								isPaidOff && "text-emerald-600 dark:text-emerald-400"
							)}
						>
							{formatCents(balanceCents)}
						</p>
					</div>
					{interestPaidCents > 0n && (
						<div className="text-right">
							<p className="mb-0.5 text-muted-foreground text-xs">
								Interest Paid
							</p>
							<p className="font-medium text-muted-foreground text-sm tabular-nums">
								{formatCents(interestPaidCents)}
							</p>
						</div>
					)}
				</div>

				{/* Payoff Date with icon */}
				{!isPaidOff && (
					<div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
						<Calendar className="size-4 text-muted-foreground" />
						<div className="flex-1">
							<p className="text-muted-foreground text-xs">Est. Payoff</p>
							<p
								className={cn(
									"font-semibold tabular-nums",
									isPayoffInfinite && "text-amber-600 dark:text-amber-400"
								)}
							>
								{payoffDisplay}
							</p>
						</div>
						{isPayoffInfinite && (
							<span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs dark:bg-amber-900/50 dark:text-amber-300">
								Increase payment
							</span>
						)}
					</div>
				)}

				{/* Progress indicator for active loans */}
				{!(isPaidOff || isPayoffInfinite) && (
					<div className="space-y-2">
						<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
								style={{
									// Placeholder progress
									width: "25%",
								}}
							/>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="flex items-center gap-1 text-muted-foreground">
								<Sparkles className="size-3" />
								Click for what-if scenarios
							</span>
						</div>
					</div>
				)}

				{/* Paid off celebration */}
				{isPaidOff && (
					<div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800/50 dark:bg-emerald-950/30">
						<div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
							<CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div>
							<p className="font-semibold text-emerald-700 text-sm dark:text-emerald-300">
								Congratulations!
							</p>
							<p className="text-emerald-600 text-xs dark:text-emerald-400">
								This loan has been fully paid off
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
