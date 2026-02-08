"use client";

import { ArrowDownRight, ArrowUpRight, Scale, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonthlySummaryProps {
	incomeCents: bigint;
	expenseCents: bigint;
	netCents: bigint;
}

/**
 * Summary card displaying a labeled amount with icon and color.
 * Enhanced design with branded styling.
 */
function SummaryCard({
	label,
	cents,
	type,
	icon: Icon,
}: {
	label: string;
	cents: bigint;
	type: "income" | "expense" | "net";
	icon: React.ComponentType<{ className?: string }>;
}) {
	const { data: settings } = useUserSettings();
	const currencyCode = settings?.currencyCode ?? "USD";
	const formatted = formatCents(cents, currencyCode);
	const numericCents = Number(cents);

	// Determine styling based on type
	const getConfig = () => {
		if (type === "income") {
			return {
				colorClass: "text-emerald-600 dark:text-emerald-400",
				iconBgClass: "bg-emerald-100 dark:bg-emerald-900/50",
				iconColorClass: "text-emerald-600 dark:text-emerald-400",
				borderClass: "border-emerald-200/50 dark:border-emerald-800/30",
				gradientClass: "from-emerald-500/[0.03] to-transparent",
			};
		}
		if (type === "expense") {
			return {
				colorClass: "text-rose-600 dark:text-rose-400",
				iconBgClass: "bg-rose-100 dark:bg-rose-900/50",
				iconColorClass: "text-rose-600 dark:text-rose-400",
				borderClass: "border-rose-200/50 dark:border-rose-800/30",
				gradientClass: "from-rose-500/[0.03] to-transparent",
			};
		}
		// Net type: primary color, green if positive, red if negative
		const isPositive = numericCents >= 0;
		return {
			colorClass: isPositive
				? "text-emerald-600 dark:text-emerald-400"
				: "text-rose-600 dark:text-rose-400",
			iconBgClass: "bg-primary/10",
			iconColorClass: "text-primary",
			borderClass: "border-primary/20",
			gradientClass: "from-primary/[0.03] to-transparent",
		};
	};

	const config = getConfig();

	// Add sign prefix for net
	const displayValue =
		type === "net" && numericCents > 0 ? `+${formatted}` : formatted;

	return (
		<Card
			className={cn(
				"group relative overflow-hidden transition-all duration-300 hover:border-opacity-100",
				config.borderClass
			)}
		>
			{/* Subtle gradient background */}
			<div
				className={cn(
					"pointer-events-none absolute inset-0 bg-linear-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-100",
					config.gradientClass
				)}
			/>

			<CardContent className="relative flex items-center gap-4 p-5">
				{/* Icon container */}
				<div
					className={cn(
						"flex size-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105",
						config.iconBgClass
					)}
				>
					<Icon className={cn("size-5", config.iconColorClass)} />
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					<p className="mb-0.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
						{label}
					</p>
					<p
						className={cn(
							"truncate font-bold text-2xl tabular-nums tracking-tight",
							config.colorClass
						)}
					>
						{displayValue}
					</p>
				</div>

				{/* Subtle trend indicator for net */}
				{type === "net" && numericCents !== 0 && (
					<div
						className={cn(
							"flex size-6 items-center justify-center",
							numericCents > 0
								? "bg-emerald-100 dark:bg-emerald-900/50"
								: "bg-rose-100 dark:bg-rose-900/50"
						)}
					>
						<TrendingUp
							className={cn(
								"size-3",
								numericCents > 0
									? "text-emerald-600 dark:text-emerald-400"
									: "rotate-180 text-rose-600 dark:text-rose-400"
							)}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Monthly summary displaying income, expenses, and net for the current month.
 * Per CONTEXT.md: "Monthly summary (income/expense/net) prominently at top as primary focus"
 */
export function MonthlySummary({
	incomeCents,
	expenseCents,
	netCents,
}: MonthlySummaryProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<SummaryCard
				cents={incomeCents}
				icon={ArrowUpRight}
				label="Income"
				type="income"
			/>
			<SummaryCard
				cents={expenseCents}
				icon={ArrowDownRight}
				label="Expenses"
				type="expense"
			/>
			<SummaryCard cents={netCents} icon={Scale} label="Net" type="net" />
		</div>
	);
}
