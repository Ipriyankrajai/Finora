"use client";

import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonthlySummaryProps {
	incomeCents: bigint;
	expenseCents: bigint;
	netCents: bigint;
}

/**
 * Summary card displaying a labeled amount with icon and color.
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
	const formatted = formatCents(cents);
	const numericCents = Number(cents);

	// Determine color based on type
	const getColorClass = () => {
		if (type === "income") {
			return "text-green-600 dark:text-green-500";
		}
		if (type === "expense") {
			return "text-red-600 dark:text-red-500";
		}
		// Net type: green if positive, red if negative
		return numericCents >= 0
			? "text-green-600 dark:text-green-500"
			: "text-red-600 dark:text-red-500";
	};

	const getIconColorClass = () => {
		if (type === "income") {
			return "text-green-600/70 dark:text-green-500/70";
		}
		if (type === "expense") {
			return "text-red-600/70 dark:text-red-500/70";
		}
		return "text-muted-foreground";
	};

	const colorClass = getColorClass();
	const iconColorClass = getIconColorClass();

	// Add sign prefix for net
	const displayValue =
		type === "net" && numericCents > 0 ? `+${formatted}` : formatted;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm">
					{label}
				</CardTitle>
				<Icon className={cn("size-4", iconColorClass)} />
			</CardHeader>
			<CardContent>
				<div className={cn("font-bold text-2xl tabular-nums", colorClass)}>
					{displayValue}
				</div>
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
