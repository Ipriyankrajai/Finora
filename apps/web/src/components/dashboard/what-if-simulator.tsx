"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { Slider } from "@/components/ui/slider";
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
 */
export function WhatIfSimulator({
	balanceCents,
	annualRatePercent,
	monthlyPaymentCents,
	name,
}: WhatIfSimulatorProps) {
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
	const interestSavedDisplay = formatCents(projection.interestSavedCents);

	// Check for infinite scenarios
	const isBaselineInfinite = !Number.isFinite(baseline.monthsRemaining);
	const isNewInfinite = !Number.isFinite(projection.monthsRemaining);
	const hasSavings =
		projection.monthsSaved > 0 || projection.interestSavedCents > 0n;

	// Determine slider max based on monthly payment (reasonable range)
	const monthlyPaymentDollars = Number(monthlyPaymentCents) / 100;
	const sliderMax = Math.min(1000, Math.max(500, monthlyPaymentDollars * 2));

	return (
		<div className="space-y-6 rounded-md border bg-muted/30 p-4">
			<div className="space-y-1">
				<h4 className="font-medium">What-If: Extra Monthly Payment</h4>
				<p className="text-muted-foreground text-sm">
					See how extra payments could accelerate your {name} payoff
				</p>
			</div>

			{/* Slider */}
			<Slider
				formatValue={(v) => `$${v}`}
				id="extra-payment-slider"
				label="Extra Payment"
				max={sliderMax}
				min={0}
				onChange={setExtraPaymentDollars}
				step={25}
				value={extraPaymentDollars}
			/>

			{/* Results comparison */}
			<div
				className={cn(
					"grid gap-4 sm:grid-cols-2",
					isPending && "opacity-70 transition-opacity"
				)}
			>
				{/* Current (baseline) */}
				<div className="space-y-2">
					<h5 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Current Plan
					</h5>
					<div>
						<p className="text-muted-foreground text-xs">Payoff Date</p>
						<p
							className={cn(
								"font-semibold tabular-nums",
								isBaselineInfinite && "text-amber-600 dark:text-amber-500"
							)}
						>
							{baselinePayoffDate}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Time Remaining</p>
						<p className="font-medium tabular-nums">
							{formatMonthsAsYearsMonths(baseline.monthsRemaining)}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Total Interest</p>
						<p className="font-medium tabular-nums">
							{formatCents(baseline.totalInterestCents)}
						</p>
					</div>
				</div>

				{/* With extra payment */}
				<div className="space-y-2">
					<h5 className="font-medium text-primary text-xs uppercase tracking-wide">
						With Extra ${extraPaymentDollars}/mo
					</h5>
					<div>
						<p className="text-muted-foreground text-xs">Payoff Date</p>
						<p
							className={cn(
								"font-semibold tabular-nums",
								isNewInfinite && "text-amber-600 dark:text-amber-500",
								hasSavings &&
									!isNewInfinite &&
									"text-emerald-600 dark:text-emerald-500"
							)}
						>
							{newPayoffDate}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Time Remaining</p>
						<p className="font-medium tabular-nums">
							{formatMonthsAsYearsMonths(projection.monthsRemaining)}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Total Interest</p>
						<p className="font-medium tabular-nums">
							{formatCents(projection.totalInterestCents)}
						</p>
					</div>
				</div>
			</div>

			{/* Savings summary */}
			{hasSavings && extraPaymentDollars > 0 && (
				<div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
					<p className="font-medium text-emerald-700 text-sm dark:text-emerald-400">
						With ${extraPaymentDollars}/month extra, you could save:
					</p>
					<ul className="mt-1 space-y-0.5 text-emerald-600 text-sm dark:text-emerald-500">
						<li>{monthsSavedDisplay} of payments</li>
						<li>{interestSavedDisplay} in interest</li>
					</ul>
				</div>
			)}

			{/* Warning for insufficient payment */}
			{isBaselineInfinite && (
				<div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
					<p className="font-medium text-amber-700 text-sm dark:text-amber-400">
						Your current payment doesn&apos;t cover the monthly interest.
					</p>
					<p className="mt-1 text-amber-600 text-sm dark:text-amber-500">
						Consider increasing your payment to start reducing the principal.
					</p>
				</div>
			)}

			{/* Pending indicator */}
			{isPending && (
				<p className="text-center text-muted-foreground text-xs">
					Calculating...
				</p>
			)}
		</div>
	);
}
