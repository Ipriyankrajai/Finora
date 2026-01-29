import currency from 'currency.js';

// Configure for USD
const USD = (value: currency.Any) => currency(value, { symbol: '$', precision: 2 });

/**
 * Convert display string to cents for storage
 * Handles: "$1,234.56", "1234.56", "1,234.56", "-$50.00"
 */
export function displayToCents(displayValue: string): bigint {
  return BigInt(USD(displayValue).intValue);
}

/**
 * Convert cents to display string for UI
 * Returns: "$1,234.56", "-$50.00"
 */
export function centsToDisplay(cents: bigint): string {
  return USD(Number(cents) / 100).format();
}

/**
 * Round fractional cents using half-up rounding
 * Used when calculations produce fractional cents
 */
export function roundCents(value: number): bigint {
  return BigInt(Math.round(value));
}
