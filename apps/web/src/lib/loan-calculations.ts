/**
 * Client-side loan calculations for what-if simulations.
 * Mirrors logic from packages/api/src/lib/calculations.ts for client-side use.
 */

export interface PayoffProjection {
	monthsRemaining: number;
	totalInterestCents: bigint;
	payoffDate: Date;
}

export interface WhatIfResult extends PayoffProjection {
	monthsSaved: number;
	interestSavedCents: bigint;
}

/**
 * Round fractional cents using half-up rounding.
 */
function roundCents(value: number): bigint {
	return BigInt(Math.round(value));
}

/**
 * Project loan payoff with given payment pattern.
 * @param balanceCents - Current remaining balance in cents
 * @param annualRatePercent - Annual interest rate as percentage (e.g., 6.5 for 6.5%)
 * @param monthlyPaymentCents - Monthly payment in cents
 * @returns Projection of payoff timeline
 */
function projectPayoff(
	balanceCents: bigint,
	annualRatePercent: number,
	monthlyPaymentCents: bigint
): PayoffProjection {
	// Handle zero or negative balance
	if (balanceCents <= 0n) {
		return {
			monthsRemaining: 0,
			totalInterestCents: 0n,
			payoffDate: new Date(),
		};
	}

	let balance = Number(balanceCents);
	const monthlyRate = annualRatePercent / 100 / 12;
	const payment = Number(monthlyPaymentCents);

	let months = 0;
	let totalInterest = 0;

	// Cap at 60 years (720 months) to prevent infinite loops
	while (balance > 0 && months < 720) {
		const interestThisMonth = balance * monthlyRate;

		// Check if payment covers interest
		if (payment <= interestThisMonth) {
			// Payment doesn't cover interest - will never pay off
			return {
				monthsRemaining: Number.POSITIVE_INFINITY,
				totalInterestCents: 0n,
				payoffDate: new Date(8_640_000_000_000_000), // Max date
			};
		}

		const principalThisMonth = Math.min(payment - interestThisMonth, balance);

		totalInterest += interestThisMonth;
		balance -= principalThisMonth;
		months++;
	}

	const payoffDate = new Date();
	payoffDate.setMonth(payoffDate.getMonth() + months);

	return {
		monthsRemaining: months,
		totalInterestCents: roundCents(totalInterest),
		payoffDate,
	};
}

/**
 * Calculate what-if projection comparing baseline to extra payment scenario.
 * @param balanceCents - Current remaining balance in cents
 * @param annualRatePercent - Annual interest rate as percentage
 * @param monthlyPaymentCents - Current monthly payment in cents
 * @param extraPaymentCents - Additional monthly payment in cents
 * @returns Comparison showing savings from extra payments
 */
export function projectPayoffWithExtra(
	balanceCents: bigint,
	annualRatePercent: number,
	monthlyPaymentCents: bigint,
	extraPaymentCents: bigint
): WhatIfResult {
	// Calculate baseline (without extra payment)
	const baseline = projectPayoff(
		balanceCents,
		annualRatePercent,
		monthlyPaymentCents
	);

	// Calculate with extra payment
	const totalPayment = monthlyPaymentCents + extraPaymentCents;
	const withExtra = projectPayoff(
		balanceCents,
		annualRatePercent,
		totalPayment
	);

	// Handle infinite payoff scenarios
	const isBaselineInfinite = !Number.isFinite(baseline.monthsRemaining);
	const isWithExtraInfinite = !Number.isFinite(withExtra.monthsRemaining);

	// If baseline is infinite but with extra is not, calculate savings
	if (isBaselineInfinite && !isWithExtraInfinite) {
		return {
			...withExtra,
			monthsSaved: Number.POSITIVE_INFINITY,
			interestSavedCents: 0n, // Can't calculate savings from infinite baseline
		};
	}

	// If both are infinite, no savings possible
	if (isBaselineInfinite && isWithExtraInfinite) {
		return {
			...withExtra,
			monthsSaved: 0,
			interestSavedCents: 0n,
		};
	}

	// Normal case: both are finite
	const monthsSaved = baseline.monthsRemaining - withExtra.monthsRemaining;
	const interestSavedCents =
		baseline.totalInterestCents - withExtra.totalInterestCents;

	return {
		...withExtra,
		monthsSaved,
		interestSavedCents,
	};
}
