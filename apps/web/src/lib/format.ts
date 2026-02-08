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
 * Format cents (bigint or number) as currency string with custom symbol.
 * e.g., formatCents(123456n) -> "$1,234.56"
 * e.g., formatCents(123456n, "€") -> "€1,234.56"
 * e.g., formatCents(-50000n, "£") -> "-£500.00"
 */
export function formatCents(cents: bigint | number, symbol = "$"): string {
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

/**
 * Available currency symbols for user preference.
 * Display preference only — does not affect stored amounts.
 */
export const CURRENCY_SYMBOLS = [
	{ value: "$", label: "$ - US Dollar" },
	{ value: "\u00A3", label: "\u00A3 - British Pound" },
	{ value: "\u20AC", label: "\u20AC - Euro" },
	{ value: "\u00A5", label: "\u00A5 - Japanese Yen" },
	{ value: "\u20B9", label: "\u20B9 - Indian Rupee" },
	{ value: "A$", label: "A$ - Australian Dollar" },
	{ value: "C$", label: "C$ - Canadian Dollar" },
	{ value: "CHF", label: "CHF - Swiss Franc" },
	{ value: "R$", label: "R$ - Brazilian Real" },
	{ value: "\u20A9", label: "\u20A9 - South Korean Won" },
] as const;

/**
 * Get full currency label from symbol.
 * Returns the full label (e.g., "$ - US Dollar") or just the symbol if not found.
 */
export function getCurrencyLabel(symbol: string): string {
	const currency = CURRENCY_SYMBOLS.find((c) => c.value === symbol);
	return currency?.label ?? symbol;
}
