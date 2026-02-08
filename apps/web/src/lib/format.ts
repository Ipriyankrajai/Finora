import { getSymbol } from "@finora2/api/lib/currency";
import { format, isToday, isYesterday } from "date-fns";

/**
 * Format date as "MMM d, yyyy" (e.g., "Jan 30, 2026")
 */
export function formatDate(date: Date): string {
	return format(date, "MMM d, yyyy");
}

/**
 * Format time as "h:mm a" (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
	return format(date, "h:mm a");
}

/**
 * Format date relative to today
 * Returns "Today", "Yesterday", or formatted date
 */
export function formatRelativeDate(date: Date): string {
	if (isToday(date)) {
		return "Today";
	}
	if (isYesterday(date)) {
		return "Yesterday";
	}
	return formatDate(date);
}

/**
 * Format cents (bigint or number) as currency string using an ISO currency code.
 * e.g., formatCents(123456n) -> "$1,234.56"
 * e.g., formatCents(123456n, "EUR") -> "€1,234.56"
 * e.g., formatCents(-50000n, "GBP") -> "-£500.00"
 */
export function formatCents(
	cents: bigint | number,
	currencyCode = "USD"
): string {
	const symbol = getSymbol(currencyCode);
	const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
	const isNegative = numericCents < 0;
	const absoluteDollars = Math.abs(numericCents) / 100;
	const formatted = new Intl.NumberFormat("en-US", {
		style: "decimal",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(absoluteDollars);
	return `${isNegative ? "-" : ""}${symbol}${formatted}`;
}
