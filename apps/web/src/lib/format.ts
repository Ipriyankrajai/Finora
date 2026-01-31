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
 * Format cents (bigint or number) as currency string
 * e.g., 123456n -> "$1,234.56"
 */
export function formatCents(cents: bigint | number): string {
	const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
	const dollars = numericCents / 100;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(dollars);
}
