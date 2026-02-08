import currency from "currency.js";

import { getSymbol } from "./currency";

/**
 * Convert display string to cents for storage
 * Handles: "$1,234.56", "1234.56", "1,234.56", "-$50.00"
 */
export function displayToCents(displayValue: string): bigint {
	return BigInt(currency(displayValue, { symbol: "$", precision: 2 }).intValue);
}

/**
 * Convert cents to display string for UI
 * Returns: "$1,234.56", "-$50.00" (or with the symbol for the given currency code)
 */
export function centsToDisplay(cents: bigint, currencyCode = "USD"): string {
	const symbol = getSymbol(currencyCode);
	return currency(Number(cents) / 100, { symbol, precision: 2 }).format();
}

/**
 * Round fractional cents using half-up rounding
 * Used when calculations produce fractional cents
 */
export function roundCents(value: number): bigint {
	return BigInt(Math.round(value));
}
