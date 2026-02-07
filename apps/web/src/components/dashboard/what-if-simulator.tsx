"use client";

import {
	Calculator,
	Calendar,
	PiggyBank,
	Timer,
	TrendingDown,
} from "lucide-react";
import { memo, useDeferredValue, useMemo, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents } from "@/lib/format";
import { projectPayoffWithExtra } from "@/lib/loan-calculations";
import { cn } from "@/lib/utils";

interface WhatIfSimulatorProps {
	balanceCents: bigint;
	annualRatePercent: number;
	monthlyPaymentCents: bigint;
	name: string;
}

/**
 * Format months as years and months string
 */
function formatMonthsAsYearsMonths(totalMonths: number): string {
	if (!Number.isFinite(totalMonths) || totalMonths <= 0) {
		return "0 months";
	}
	const years = Math.floor(totalMonths / 12);
	const months = totalMonths % 12;

	if (years > 0) {
		const yearText = `${years} year${years !== 1 ? "s" : ""}`;
		const monthText =
			months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : "";
		return yearText + monthText;
	}
	return `${months} month${months !== 1 ? "s" : ""}`;
}

/**
 * Format a Date as "MMM YYYY"
 */
function formatPayoffDate(date: Date): string {
	if (date.getTime() === 8_640_000_000_000_000) {
		return "N/A";
	}
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * What-if simulator for loan extra payments.
 * Uses useDeferredValue for responsive slider without calculation lag.
 * Per CONTEXT.md: shows payoff date, time saved, interest saved, comparison
 * Memoized to prevent re-renders when sibling components change.
 */
export const WhatIfSimulator = memo(function WhatIfSimulator({
	balanceCents,
	annualRatePercent,
	monthlyPaymentCents,
	name,
}: WhatIfSimulatorProps) {
	const { data: settings } = useUserSettings();
	const currencySymbol = settings?.currencySymbol ?? "$";

	// Extra payment amount in dollars (user input)
	const [extraPaymentDollars, setExtraPaymentDollars] = useState(0);

	// Deferred value for smooth slider performance
	const deferredExtraPayment = useDeferredValue(extraPaymentDollars);

	// Convert to cents and calculate projection
	const projection = useMemo(() => {
		const extraCents = BigInt(Math.round(deferredExtraPayment * 100));
		return projectPayoffWithExtra(
			balanceCents,
			annualRatePercent,
			monthlyPaymentCents,
			extraCents
		);
	}, [
		deferredExtraPayment,
		balanceCents,
		annualRatePercent,
		monthlyPaymentCents,
	]);

	// Baseline projection (no extra payment)
	const baseline = useMemo(() => {
		return projectPayoffWithExtra(
			balanceCents,
			annualRatePercent,
			monthlyPaymentCents,
			0n
		);
	}, [balanceCents, annualRatePercent, monthlyPaymentCents]);

	// Calculate pending state for visual indicator
	const isPending = extraPaymentDollars !== deferredExtraPayment;

	// Format values for display
	const baselinePayoffDate = formatPayoffDate(baseline.payoffDate);
	const newPayoffDate = formatPayoffDate(projection.payoffDate);
	const monthsSavedDisplay = formatMonthsAsYearsMonths(projection.monthsSaved);
	const interestSavedDisplay = formatCents(
		projection.interestSavedCents,
		currencySymbol
	);

	// Check for infinite scenarios
	const isBaselineInfinite = !Number.isFinite(baseline.monthsRemaining);
	const isNewInfinite = !Number.isFinite(projection.monthsRemaining);
	const hasSavings =
		projection.monthsSaved > 0 || projection.interestSavedCents > 0n;

	// Determine slider max based on monthly payment (reasonable range)
	const monthlyPaymentDollars = Number(monthlyPaymentCents) / 100;
	const sliderMax = Math.min(1000, Math.max(500, monthlyPaymentDollars * 2));

	return (
		<div className="overflow-hidden border border-primary/20 bg-linear-to-br from-primary/2 via-background to-emerald-500/2">
			{/* Header */}
			<div className="border-primary/10 border-b bg-linear-to-r from-primary/5 to-transparent px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
						<Calculator className="size-5 text-primary" />
					</div>
					<div>
						<h4 className="font-semibold text-base">What-If Calculator</h4>
						<p className="text-muted-foreground text-sm">
							Explore how extra payments affect your {name} payoff
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-6 p-5">
				{/* Slider with better styling */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label
							className="flex items-center gap-2 font-medium text-sm"
							htmlFor="extra-payment-slider"
						>
							<PiggyBank className="size-4 text-primary" />
							Extra Monthly Payment
						</label>
						<span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-sm tabular-nums">
							{currencySymbol}
							{extraPaymentDollars}
						</span>
					</div>
					<Slider
						formatValue={(v) => `${currencySymbol}${v}`}
						id="extra-payment-slider"
						max={sliderMax}
						min={0}
						onChange={setExtraPaymentDollars}
						step={25}
						value={extraPaymentDollars}
					/>
					<div className="flex justify-between text-muted-foreground text-xs">
						<span>{currencySymbol}0</span>
						<span>
							{currencySymbol}
							{sliderMax}
						</span>
					</div>
				</div>

				{/* Results comparison - card style */}
				<div
					className={cn(
						"grid gap-4 sm:grid-cols-2",
						isPending && "opacity-70 transition-opacity duration-200"
					)}
				>
					{/* Current (baseline) */}
					<div className="border bg-muted/30 p-4">
						<h5 className="mb-3 flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							<span className="size-2 rounded-full bg-muted-foreground/50" />
							Current Plan
						</h5>

						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<Calendar className="size-4 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Payoff Date</p>
									<p
										className={cn(
											"font-semibold text-lg tabular-nums",
											isBaselineInfinite && "text-amber-600 dark:text-amber-400"
										)}
									>
										{baselinePayoffDate}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Timer className="size-4 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Time Left</p>
									<p className="font-medium tabular-nums">
										{formatMonthsAsYearsMonths(baseline.monthsRemaining)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<TrendingDown className="size-4 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">
										Total Interest
									</p>
									<p className="font-medium tabular-nums">
										{formatCents(baseline.totalInterestCents, currencySymbol)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* With extra payment */}
					<div
						className={cn(
							"border p-4 transition-all duration-300",
							extraPaymentDollars > 0
								? "border-primary/30 bg-primary/3"
								: "bg-muted/30"
						)}
					>
						<h5 className="mb-3 flex items-center gap-2 font-semibold text-primary text-xs uppercase tracking-wider">
							<span className="size-2 rounded-full bg-primary" />
							With +{currencySymbol}
							{extraPaymentDollars}/mo
						</h5>

						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<Calendar className="size-4 text-primary/70" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Payoff Date</p>
									<p
										className={cn(
											"font-semibold text-lg tabular-nums",
											isNewInfinite && "text-amber-600 dark:text-amber-400",
											hasSavings &&
												!isNewInfinite &&
												"text-emerald-600 dark:text-emerald-400"
										)}
									>
										{newPayoffDate}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Timer className="size-4 text-primary/70" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Time Left</p>
									<p className="font-medium tabular-nums">
										{formatMonthsAsYearsMonths(projection.monthsRemaining)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<TrendingDown className="size-4 text-primary/70" />
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">
										Total Interest
									</p>
									<p className="font-medium tabular-nums">
										{formatCents(projection.totalInterestCents, currencySymbol)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Savings summary */}
				{hasSavings && extraPaymentDollars > 0 && (
					<div className="border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
						<p className="mb-3 font-medium text-emerald-800 text-sm dark:text-emerald-300">
							Your potential savings
						</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-emerald-100/50 p-3 dark:bg-emerald-900/30">
								<p className="text-emerald-600 text-xs dark:text-emerald-400">
									Time Saved
								</p>
								<p className="font-semibold text-emerald-800 text-lg dark:text-emerald-300">
									{monthsSavedDisplay}
								</p>
							</div>
							<div className="bg-emerald-100/50 p-3 dark:bg-emerald-900/30">
								<p className="text-emerald-600 text-xs dark:text-emerald-400">
									Interest Saved
								</p>
								<p className="font-semibold text-emerald-800 text-lg dark:text-emerald-300">
									{interestSavedDisplay}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Warning for insufficient payment */}
				{isBaselineInfinite && (
					<div className="border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
						<p className="font-medium text-amber-800 dark:text-amber-300">
							⚠️ Payment is below interest accrual
						</p>
						<p className="mt-1 text-amber-700 text-sm dark:text-amber-400">
							Your current payment doesn&apos;t cover the monthly interest.
							Increase your payment to start reducing the principal.
						</p>
					</div>
				)}

				{/* Pending indicator - fixed height to prevent layout shift */}
				{isPending && (
					<div
						aria-hidden={!isPending}
						className={cn(
							"flex h-8 items-center justify-center gap-2 text-muted-foreground text-sm transition-opacity duration-150",
							isPending ? "opacity-100" : "opacity-0"
						)}
					>
						<div className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
						<span>Calculating...</span>
					</div>
				)}
			</div>
		</div>
	);
});
