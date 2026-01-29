import { roundCents } from './money';

export interface PayoffProjection {
  monthsRemaining: number;
  totalInterestCents: bigint;
  payoffDate: Date;
}

/**
 * Calculate monthly payment for amortizing loan (PMT formula)
 * @param principalCents - Loan principal in cents
 * @param annualRatePercent - Annual interest rate as percentage (e.g., 6.5 for 6.5%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment in cents
 */
export function calculateMonthlyPayment(
  principalCents: bigint,
  annualRatePercent: number,
  termMonths: number
): bigint {
  const principal = Number(principalCents);
  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    // Zero interest: simple division
    return roundCents(principal / termMonths);
  }

  const x = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = (principal * x * monthlyRate) / (x - 1);

  return roundCents(monthlyPayment);
}

/**
 * Calculate simple interest
 * @param principalCents - Principal in cents
 * @param annualRatePercent - Annual rate as percentage
 * @param years - Time period in years
 * @returns Interest in cents
 */
export function calculateSimpleInterest(
  principalCents: bigint,
  annualRatePercent: number,
  years: number
): bigint {
  const principal = Number(principalCents);
  const interest = (principal * annualRatePercent * years) / 100;
  return roundCents(interest);
}

/**
 * Calculate compound interest (monthly compounding)
 * @param principalCents - Principal in cents
 * @param annualRatePercent - Annual rate as percentage
 * @param months - Time period in months
 * @returns Interest in cents
 */
export function calculateCompoundInterest(
  principalCents: bigint,
  annualRatePercent: number,
  months: number
): bigint {
  const principal = Number(principalCents);
  const monthlyRate = annualRatePercent / 100 / 12;

  const amount = principal * Math.pow(1 + monthlyRate, months);
  const interest = amount - principal;

  return roundCents(interest);
}

/**
 * Project loan payoff with current payment pattern
 * @param balanceCents - Current remaining balance in cents
 * @param annualRatePercent - Annual interest rate
 * @param monthlyPaymentCents - Current monthly payment in cents
 * @returns Projection of payoff timeline
 */
export function projectPayoff(
  balanceCents: bigint,
  annualRatePercent: number,
  monthlyPaymentCents: bigint
): PayoffProjection {
  // Handle zero balance
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
        monthsRemaining: Infinity,
        totalInterestCents: 0n,
        payoffDate: new Date(8640000000000000), // Max date
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
