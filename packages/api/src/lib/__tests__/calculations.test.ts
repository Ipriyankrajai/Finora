import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateSimpleInterest,
  calculateCompoundInterest,
  projectPayoff,
} from '../calculations';

describe('loan calculations', () => {
  describe('calculateMonthlyPayment', () => {
    // Validated against Bankrate mortgage calculator
    // $300,000 loan at 6.5% for 30 years = $1,896.20/month
    it('calculates 30-year mortgage payment', () => {
      const payment = calculateMonthlyPayment(30000000n, 6.5, 360);
      // Within $1 tolerance = 100 cents
      expect(Number(payment)).toBeGreaterThanOrEqual(189520);
      expect(Number(payment)).toBeLessThanOrEqual(189720);
    });

    // $25,000 car loan at 5% for 5 years = $471.78/month
    it('calculates car loan payment', () => {
      const payment = calculateMonthlyPayment(2500000n, 5.0, 60);
      expect(Number(payment)).toBeGreaterThanOrEqual(47078);
      expect(Number(payment)).toBeLessThanOrEqual(47278);
    });

    // Zero interest loan: simple division
    it('handles zero interest rate', () => {
      const payment = calculateMonthlyPayment(1200000n, 0, 12);
      expect(payment).toBe(100000n); // $12,000 / 12 = $1,000
    });

    // Edge case: very small loan
    it('handles small loan amounts', () => {
      const payment = calculateMonthlyPayment(100000n, 10.0, 12);
      expect(Number(payment)).toBeGreaterThan(0);
    });
  });

  describe('calculateSimpleInterest', () => {
    // $10,000 at 5% for 1 year = $500
    it('calculates one year simple interest', () => {
      const interest = calculateSimpleInterest(1000000n, 5.0, 1);
      expect(interest).toBe(50000n);
    });

    // $10,000 at 5% for 2 years = $1,000
    it('calculates multi-year simple interest', () => {
      const interest = calculateSimpleInterest(1000000n, 5.0, 2);
      expect(interest).toBe(100000n);
    });
  });

  describe('calculateCompoundInterest', () => {
    // $10,000 at 5% compounded monthly for 12 months
    // A = P(1 + r/n)^(nt) = 10000(1 + 0.05/12)^12 = 10,511.62
    // Interest = $511.62
    it('calculates monthly compound interest', () => {
      const interest = calculateCompoundInterest(1000000n, 5.0, 12);
      expect(Number(interest)).toBeGreaterThanOrEqual(51062);
      expect(Number(interest)).toBeLessThanOrEqual(51262);
    });
  });

  describe('projectPayoff', () => {
    // $100,000 balance at 6% with $1,000/month payment
    it('projects payoff for standard loan', () => {
      const projection = projectPayoff(10000000n, 6.0, 100000n);

      // Should pay off in roughly 11 years (130 months)
      expect(projection.monthsRemaining).toBeGreaterThan(100);
      expect(projection.monthsRemaining).toBeLessThan(150);

      // Total interest should be substantial
      expect(Number(projection.totalInterestCents)).toBeGreaterThan(0);

      // Payoff date should be in the future
      expect(projection.payoffDate.getTime()).toBeGreaterThan(Date.now());
    });

    // Payment barely covers interest - very long payoff
    it('detects insufficient payment', () => {
      // $100,000 at 12% = $1,000/month interest
      // Payment of $900 doesn't cover interest
      const projection = projectPayoff(10000000n, 12.0, 90000n);

      // Should indicate infinite/very long payoff
      expect(projection.monthsRemaining).toBe(Infinity);
    });

    // Zero balance
    it('handles zero balance', () => {
      const projection = projectPayoff(0n, 6.0, 100000n);
      expect(projection.monthsRemaining).toBe(0);
    });
  });
});
