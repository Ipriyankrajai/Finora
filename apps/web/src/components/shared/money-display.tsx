"use client";

import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";

function getTypeColor(type?: "INCOME" | "EXPENSE"): string {
	if (type === "INCOME") {
		return "text-green-600 dark:text-green-500";
	}
	if (type === "EXPENSE") {
		return "text-red-600 dark:text-red-500";
	}
	return "";
}

interface MoneyDisplayProps {
	cents: bigint | number;
	type?: "INCOME" | "EXPENSE";
	className?: string;
	showSign?: boolean;
	currencySymbol?: string;
}

function MoneyDisplay({
	cents,
	type,
	className,
	showSign = true,
	currencySymbol,
}: MoneyDisplayProps) {
	const { data: settings } = useUserSettings();
	const resolvedSymbol = currencySymbol ?? settings?.currencySymbol ?? "$";
	const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
	const isNegative = numericCents < 0;
	const absoluteCents = Math.abs(numericCents);
	const formatted = formatCents(absoluteCents, resolvedSymbol);

	// Determine sign prefix
	let prefix = "";
	if (showSign) {
		if (type === "INCOME") {
			prefix = "+";
		} else if (type === "EXPENSE") {
			prefix = "-";
		} else if (isNegative) {
			prefix = "-";
		}
	}

	// Determine color based on type
	const colorClass = getTypeColor(type);

	return (
		<span
			className={cn("tabular-nums", colorClass, className)}
			data-slot="money-display"
		>
			{prefix}
			{formatted}
		</span>
	);
}

export { MoneyDisplay };
export type { MoneyDisplayProps };
